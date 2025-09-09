import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Get buffer time based on pathway step transition
interface PathwayStep {
  experience_name?: string;
  duration: number;
  price?: number;
  pre_drinks?: unknown[];
  during_drinks?: unknown[];
  after_drinks?: unknown[];
}

function getStepBuffer(currentStep: PathwayStep, nextStep: PathwayStep, pathwayName: string): number {
  const name = pathwayName?.toLowerCase() || '';
  
  // Maxi pathways: Ice-Sauna-Ice continuous flow (no buffers)
  if (name.includes('maxi')) {
    const currentIsIce = currentStep.experience_name?.toLowerCase().includes('ice');
    const nextIsSauna = nextStep.experience_name?.toLowerCase().includes('sauna');
    const currentIsSauna = currentStep.experience_name?.toLowerCase().includes('sauna');
    const nextIsIce = nextStep.experience_name?.toLowerCase().includes('ice');
    
    // Ice → Sauna or Sauna → Ice = no buffer (continuous contrast)
    if ((currentIsIce && nextIsSauna) || (currentIsSauna && nextIsIce)) {
      return 0;
    }
  }
  
  // All other transitions need 10-minute buffer
  return 10;
}

export async function POST(req: NextRequest) {
  const { pathway_id, customer_email, customer_name, start_time, selected_date } = await req.json();

  if (!pathway_id || !customer_email || !customer_name || !start_time || !selected_date) {
    return NextResponse.json({ 
      error: "Missing required fields" 
    }, { status: 400 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const AOI_VENUE_ID = '20c2f440-9133-42ec-a8d6-6336e649ec4b';

    // Get pathway details
    const { data: pathway, error: pathwayError } = await supabase
      .from('experience_pathways')
      .select('*')
      .eq('id', pathway_id)
      .single();

    if (pathwayError || !pathway) {
      console.error('Pathway error:', pathwayError);
      return NextResponse.json({ 
        error: "Pathway not found",
        details: pathwayError?.message 
      }, { status: 404 });
    }

    // Validate pathway has sequence
    if (!pathway.sequence || !Array.isArray(pathway.sequence) || pathway.sequence.length === 0) {
      return NextResponse.json({ 
        error: "Pathway has no valid sequence" 
      }, { status: 400 });
    }

    // Create bookings for each experience in the sequence
    const bookings = [];
    let currentTime = new Date(`${selected_date}T${start_time}`);

    for (let i = 0; i < pathway.sequence.length; i++) {
      const step = pathway.sequence[i];
      
      if (!step.experience_id || !step.experience_name || !step.duration) {
        console.error('Invalid step:', step);
        continue;
      }
      
      const booking = {
        venue_id: AOI_VENUE_ID,
        experience_id: step.experience_id,
        experience_name: step.experience_name,
        slot_time: currentTime.toISOString(),
        duration_minutes: step.duration,
        customer_email,
        customer_name,
        booking_status: 'sessions_scheduled',
        venue_price: step.price || 0,
        pathway_id: pathway_id,
        pre_drinks: step.pre_drinks || [],
        during_drinks: step.during_drinks || [],
        after_drinks: step.after_drinks || []
      };

      // Add takeaway drinks to the last booking only
      if (i === pathway.sequence.length - 1 && pathway.takeaway && Array.isArray(pathway.takeaway)) {
        booking.after_drinks = [
          ...(booking.after_drinks || []),
          ...pathway.takeaway.map((item: Record<string, unknown>) => ({
            ...item,
            timing: "takeaway"
          }))
        ];
      }

      bookings.push(booking);

      // Calculate next start time with step-specific buffer
      const nextStep = pathway.sequence[i + 1];
      const bufferMinutes = nextStep ? getStepBuffer(step, nextStep, pathway.display_name) : 0;
      currentTime = new Date(currentTime.getTime() + (step.duration + bufferMinutes) * 60000);
    }

    if (bookings.length === 0) {
      return NextResponse.json({ 
        error: "No valid bookings could be created from pathway" 
      }, { status: 400 });
    }

    // Insert all bookings
    const { data: createdBookings, error: insertError } = await supabase
      .from('bookings')
      .insert(bookings)
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ 
        error: "Failed to create bookings",
        details: insertError.message 
      }, { status: 500 });
    }

    const bookingMessage = createdBookings.map((booking: Record<string, unknown>) => ({
      id: booking.id,
      experience: booking.experience_name,
      time: new Date(booking.slot_time as string).toLocaleTimeString(),
      drinks: {
        pre: Array.isArray(booking.pre_drinks) ? booking.pre_drinks.length : 0,
        during: Array.isArray(booking.during_drinks) ? booking.during_drinks.length : 0,
        after: Array.isArray(booking.after_drinks) ? booking.after_drinks.length : 0
      }
    }));

    return NextResponse.json({ 
      success: true,
      message: `Created ${createdBookings.length} bookings for ${pathway.display_name}`,
      pathway: pathway.display_name,
      bookings: bookingMessage
    });

  } catch (error) {
    console.error('Create pathway bookings error:', error);
    return NextResponse.json({ 
      error: "Failed to create pathway bookings",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
