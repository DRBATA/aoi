import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function POST(req: Request) {
    const { 
        venueId, 
        experienceId, 
        slotTime, 
        customerEmail, 
        customerName 
    } = await req.json();

    if (!venueId || !experienceId || !slotTime || !customerEmail) {
        return NextResponse.json({ 
            error: "Missing required fields: venueId, experienceId, slotTime, customerEmail" 
        }, { status: 400 });
    }

    try {
        const supabase = createClient();

        // Get experience duration and venue details
        const { data: venueExperience, error: veError } = await supabase
            .from('venue_experiences')
            .select('duration_minutes, venue_price, venue_name, experience_name')
            .eq('venue_id', venueId)
            .eq('experience_id', experienceId)
            .single();

        if (veError || !venueExperience) {
            return NextResponse.json({ 
                error: "Experience not available at this venue" 
            }, { status: 404 });
        }

        // Check for conflicts - same venue, same time slot
        const slotStart = new Date(slotTime);
        const slotEnd = new Date(slotStart.getTime() + (venueExperience.duration_minutes * 60000));

        const { data: conflicts } = await supabase
            .from('bookings')
            .select('id')
            .eq('venue_id', venueId)
            .gte('slot_time', slotStart.toISOString())
            .lt('slot_time', slotEnd.toISOString())
            .in('booking_status', ['active', 'booked', 'ordered']);

        if (conflicts && conflicts.length > 0) {
            return NextResponse.json({ 
                error: "Time slot not available - conflicts with existing booking" 
            }, { status: 409 });
        }

        // Create the booking
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                venue_id: venueId,
                experience_id: experienceId,
                slot_time: slotTime,
                duration_minutes: venueExperience.duration_minutes,
                customer_email: customerEmail,
                customer_name: customerName,
                booking_status: 'active'
            })
            .select()
            .single();

        if (bookingError) {
            console.error('Error creating booking:', bookingError);
            return NextResponse.json({ 
                error: "Failed to create booking", 
                details: bookingError.message 
            }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            booking: {
                id: booking.id,
                venueId: booking.venue_id,
                experienceId: booking.experience_id,
                slotTime: booking.slot_time,
                durationMinutes: booking.duration_minutes,
                customerEmail: booking.customer_email,
                customerName: booking.customer_name,
                bookingStatus: booking.booking_status,
                venueName: venueExperience.venue_name,
                experienceName: venueExperience.experience_name,
                price: venueExperience.venue_price
            }
        });

    } catch (error: unknown) {
        console.error('Failed to create booking:', error);
        return NextResponse.json({ 
            error: "Failed to create booking", 
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
