import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function POST(req: Request) {
    const { bookingId } = await req.json();

    if (!bookingId) {
        return NextResponse.json({ 
            error: "Missing required field: bookingId" 
        }, { status: 400 });
    }

    try {
        const supabase = createClient();

        // Get booking details
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .eq('booking_status', 'in_session')
            .single();

        if (bookingError || !booking) {
            return NextResponse.json({ 
                error: "Booking not found or not in active session" 
            }, { status: 404 });
        }

        // Update booking to session completed
        const { error: updateBookingError } = await supabase
            .from('bookings')
            .update({ 
                booking_status: 'session_completed' 
            })
            .eq('id', bookingId);

        if (updateBookingError) {
            return NextResponse.json({ 
                error: "Failed to complete session", 
                details: updateBookingError.message 
            }, { status: 500 });
        }

        // Cart remains active after session completion
        // No need to update cart status - it stays active for adding more items

        return NextResponse.json({ 
            success: true, 
            message: "Session completed successfully",
            bookingId: bookingId,
            cartId: booking.cart_id
        });

    } catch (error: unknown) {
        console.error('Failed to complete session:', error);
        return NextResponse.json({ 
            error: "Failed to complete session", 
            details: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}
