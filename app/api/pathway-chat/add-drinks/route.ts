import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function POST(req: Request) {
  const { booking_id, drinks, timing } = await req.json();

  if (!booking_id || !drinks || !timing) {
    return NextResponse.json({ 
      error: "Missing required fields: booking_id, drinks, timing" 
    }, { status: 400 });
  }

  try {
    const supabase = createClient();

    // Get current booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ 
        error: "Booking not found" 
      }, { status: 404 });
    }

    // Prepare update object
    const updateData: any = {};
    
    // Add drinks to the appropriate timing column
    if (timing === "pre") {
      updateData.pre_drinks = drinks;
    } else if (timing === "during") {
      updateData.during_drinks = drinks;
    } else if (timing === "after") {
      updateData.after_drinks = drinks;
    }

    // Update booking with drinks
    const { error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', booking_id);

    if (updateError) {
      return NextResponse.json({ 
        error: "Failed to add drinks to booking",
        details: updateError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: `Added ${drinks.length} drinks to ${timing} phase of booking`,
      booking_id,
      timing,
      drinks_added: drinks.length
    });

  } catch (error) {
    console.error('Add drinks error:', error);
    return NextResponse.json({ 
      error: "Failed to add drinks to booking" 
    }, { status: 500 });
  }
}
