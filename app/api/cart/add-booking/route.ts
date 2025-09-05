import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function POST(req: Request) {
    const { bookingId, customerEmail } = await req.json();

    if (!bookingId || !customerEmail) {
        return NextResponse.json({ 
            error: "Missing required fields: bookingId, customerEmail" 
        }, { status: 400 });
    }

    try {
        const supabase = createClient();

        // Get booking details
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .eq('booking_status', 'active')
            .single();

        if (bookingError || !booking) {
            return NextResponse.json({ 
                error: "Booking not found or already added to cart" 
            }, { status: 404 });
        }

        // Check for existing cart for this customer
        const { data: existingCart } = await supabase
            .from('cart_headers')
            .select('id')
            .eq('customer_email', customerEmail)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        let cartId;

        if (existingCart) {
            // Use existing cart
            cartId = existingCart.id;
        } else {
            // Create new cart
            const { data: newCart, error: cartError } = await supabase
                .from('cart_headers')
                .insert({
                    customer_email: customerEmail,
                    customer_name: booking.customer_name,
                    venue_id: booking.venue_id,
                    session_id: `booking_${Date.now()}`
                })
                .select()
                .single();

            if (cartError) {
                return NextResponse.json({ 
                    error: "Failed to create cart", 
                    details: cartError.message 
                }, { status: 500 });
            }

            cartId = newCart.id;
        }

        // Update cart with booking reference
        const { error: updateCartError } = await supabase
            .from('cart_headers')
            .update({ 
                booking_id: bookingId
            })
            .eq('id', cartId);

        if (updateCartError) {
            return NextResponse.json({ 
                error: "Failed to link booking to cart", 
                details: updateCartError.message 
            }, { status: 500 });
        }

        // Update booking with cart_id and status
        const { error: updateBookingError } = await supabase
            .from('bookings')
            .update({ 
                cart_id: cartId,
                booking_status: 'booked' 
            })
            .eq('id', bookingId);

        if (updateBookingError) {
            return NextResponse.json({ 
                error: "Failed to update booking status", 
                details: updateBookingError.message 
            }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: "Booking added to cart successfully",
            cartId: cartId,
            bookingId: bookingId
        });

    } catch (error: unknown) {
        console.error('Failed to add booking to cart:', error);
        return NextResponse.json({ 
            error: "Failed to add booking to cart", 
            details: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}
