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
            .eq('booking_status', 'sessions_scheduled')
            .single();

        if (bookingError || !booking) {
            return NextResponse.json({ 
                error: "Booking not found or not in scheduled status" 
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
                    venue_id: booking.venue_id
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

        // Update booking to in_session and link to cart
        const { error: updateBookingError } = await supabase
            .from('bookings')
            .update({ 
                cart_id: cartId,
                booking_status: 'in_session' 
            })
            .eq('id', bookingId);

        if (updateBookingError) {
            return NextResponse.json({ 
                error: "Failed to start session", 
                details: updateBookingError.message 
            }, { status: 500 });
        }


        // Check if experience is already in cart to prevent duplicates
        const { data: existingCartItem } = await supabase
            .from('cart_items')
            .select('id')
            .eq('cart_id', cartId)
            .eq('booking_id', bookingId)
            .single();

        if (!existingCartItem) {
            // Add experience to cart_items
            const { error: cartItemError } = await supabase
                .from('cart_items')
                .insert({
                    cart_id: cartId,
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
            message: "Session started successfully",
            cartId: cartId,
            bookingId: bookingId
        });

    } catch (error: unknown) {
        console.error('Failed to start session:', error);
        return NextResponse.json({ 
            error: "Failed to start session", 
            details: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}
