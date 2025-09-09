import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function POST(req: Request) {
    const { 
        venueId, 
        experienceId, 
        slotTime, 
        customerEmail, 
        customerName,
        preDrinks = [],
        duringDrinks = [],
        afterDrinks = []
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

        // Check for conflicts - same venue, same time slot, or same machine
        const slotStart = new Date(slotTime);
        const slotEnd = new Date(slotStart.getTime() + (venueExperience.duration_minutes * 60000));

        // Get machine conflicts (Air and Air PRO use same machine)
        const airMachineExperiences = [
            'c3447c0f-e775-4de5-99ca-30991daa0366', // AOI Air (20-min)
            'f1516053-d4c0-4ea1-81dd-4cfba0caa60a', // AOI Air (30-min)
            'e5e9fdbd-fa6e-4360-8a5a-4e19f87fbdfe', // AOI Air (50-min)
            'ad77be13-e3f7-4acf-8535-82b6d22dd540', // AOI Air PRO (20-min)
            '7acac09d-a790-49d8-908c-5ebddd9a1ce7', // AOI Air PRO (30-min)
            'f6507cf0-7757-439e-9d4e-f1f8f84c95b0'  // AOI Air PRO (50-min)
        ];

        const conflictExperiences = airMachineExperiences.includes(experienceId) 
            ? airMachineExperiences 
            : [experienceId];

        const { data: conflicts } = await supabase
            .from('bookings')
            .select('id, experience_id')
            .eq('venue_id', venueId)
            .in('experience_id', conflictExperiences)
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
                booking_status: 'active',
                pre_drinks: preDrinks,
                during_drinks: duringDrinks,
                after_drinks: afterDrinks
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
