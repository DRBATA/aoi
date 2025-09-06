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
            .single();

        if (bookingError || !booking) {
            return NextResponse.json({ 
                error: "Booking not found" 
            }, { status: 404 });
        }

        if (!booking.cart_id) {
            return NextResponse.json({ 
                error: "Booking has no associated cart" 
            }, { status: 400 });
        }

        // Check if experience is already in cart
        const { data: existingCartItem } = await supabase
            .from('cart_items')
            .select('id')
            .eq('cart_id', booking.cart_id)
            .eq('booking_id', bookingId)
            .single();

        if (!existingCartItem) {
            // Re-add the experience to cart
            const { error: cartItemError } = await supabase
                .from('cart_items')
                .insert({
                    cart_id: booking.cart_id,
                    item_id: booking.experience_id,
                    venue_id: booking.venue_id,
                    booking_id: bookingId,
                    qty: 1
                });

            if (cartItemError) {
                return NextResponse.json({ 
                    error: "Failed to add experience to cart", 
                    details: cartItemError.message 
                }, { status: 500 });
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: "Experience ensured in cart",
            cartId: booking.cart_id,
            bookingId: bookingId
        });

    } catch (error: unknown) {
        console.error('Failed to ensure booking in cart:', error);
        return NextResponse.json({ 
            error: "Failed to ensure booking in cart", 
            details: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}
