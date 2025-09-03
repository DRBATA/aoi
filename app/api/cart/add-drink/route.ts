import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function POST(req: Request) {
    const { slug, qty = 1, where = "here", customerEmail } = await req.json();

    if (!slug || !customerEmail) {
        return NextResponse.json({ 
            error: "Missing required fields: slug, customerEmail" 
        }, { status: 400 });
    }

    try {
        const supabase = createClient();

        // Get drink details by slug
        const { data: drink, error: drinkError } = await supabase
            .from('drinks')
            .select('*')
            .eq('slug', slug)
            .single();

        if (drinkError || !drink) {
            return NextResponse.json({ 
                error: "Drink not found" 
            }, { status: 404 });
        }

        // Check for existing cart for this customer
        const { data: existingCart } = await supabase
            .from('cart_headers')
            .select('id, customer_name, venue_id')
            .eq('customer_email', customerEmail)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        let cartId;
        let customerName = '';
        let venueId = '';

        if (existingCart) {
            // Use existing cart
            cartId = existingCart.id;
            customerName = existingCart.customer_name || '';
            venueId = existingCart.venue_id || '';
        } else {
            return NextResponse.json({ 
                error: "No active cart found. Please create a booking first." 
            }, { status: 404 });
        }

        // Check if drink already exists in cart
        const { data: existingItem } = await supabase
            .from('cart_items')
            .select('*')
            .eq('cart_id', cartId)
            .eq('drink_id', drink.id)
            .eq('location', where)
            .single();

        if (existingItem) {
            // Update quantity
            const { error: updateError } = await supabase
                .from('cart_items')
                .update({ 
                    quantity: existingItem.quantity + qty,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingItem.id);

            if (updateError) {
                return NextResponse.json({ 
                    error: "Failed to update cart item", 
                    details: updateError.message 
                }, { status: 500 });
            }

            return NextResponse.json({ 
                success: true, 
                message: `Updated ${drink.name} quantity to ${existingItem.quantity + qty}`,
                cartId: cartId
            });
        } else {
            // Add new item to cart
            const { error: insertError } = await supabase
                .from('cart_items')
                .insert({
                    cart_id: cartId,
                    drink_id: drink.id,
                    quantity: qty,
                    location: where,
                    price_aed: drink.price_aed
                });

            if (insertError) {
                return NextResponse.json({ 
                    error: "Failed to add drink to cart", 
                    details: insertError.message 
                }, { status: 500 });
            }

            return NextResponse.json({ 
                success: true, 
                message: `Added ${qty}x ${drink.name} (${where}) to cart`,
                cartId: cartId
            });
        }

    } catch (error: unknown) {
        console.error('Failed to add drink to cart:', error);
        return NextResponse.json({ 
            error: "Failed to add drink to cart", 
            details: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}
