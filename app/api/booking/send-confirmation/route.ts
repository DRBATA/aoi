import { NextResponse } from "next/server";
import { sendBookingConfirmationEmail } from "@/lib/booking-email";
import { createClient } from "@/lib/supabase/client";

export async function POST(req: Request) {
    const { bookingId } = await req.json();

    if (!bookingId) {
        return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    try {
        const supabase = createClient();

        // Fetch the full booking details for the email
        const { data: bookingData, error: bookingError } = await supabase
            .from('bookings')
            .select(`
                *,
                venue:venue_id (name),
                experiences:experience_id (name)
            `)
            .eq('id', bookingId)
            .single();

        if (bookingError || !bookingData) {
            console.error(`Error fetching booking ${bookingId} for email:`, bookingError);
            return NextResponse.json({ error: "Booking not found or error fetching details." }, { status: 404 });
        }

        // Get venue-specific pricing
        const { data: venueExperience, error: veError } = await supabase
            .from('venue_experiences')
            .select('venue_price')
            .eq('venue_id', bookingData.venue_id)
            .eq('experience_id', bookingData.experience_id)
            .single();

        if (veError) {
            console.error(`Error fetching venue experience pricing:`, veError);
            return NextResponse.json({ error: "Error fetching pricing details." }, { status: 500 });
        }

        const result = await sendBookingConfirmationEmail(
            bookingData.customer_email,
            bookingData.customer_name || 'Valued Guest',
            {
                id: bookingData.id,
                venueName: bookingData.venue.name,
                experienceName: bookingData.experiences.name,
                slotTime: bookingData.slot_time,
                durationMinutes: bookingData.duration_minutes,
                price: parseFloat(venueExperience.venue_price)
            }
        );

        if (!result.success) {
            console.error(`Failed to send booking confirmation email for booking ${bookingId}:`, result.error);
            return NextResponse.json({ error: "Failed to send email.", details: result.error }, { status: 500 });
        }

        console.log(`Booking confirmation email sent successfully to ${bookingData.customer_email} for booking ${bookingId}`);
        return NextResponse.json({ success: true, message: "Booking confirmation email sent successfully." });

    } catch (error: any) {
        console.error(`Failed to send booking confirmation email for booking ${bookingId}:`, error);
        return NextResponse.json({ error: "Failed to send email.", details: error.message }, { status: 500 });
    }
}
