import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function POST(req: Request) {
    const { id, customerEmail } = await req.json();

    if (!id || !customerEmail) {
        return NextResponse.json({ 
            error: "Missing required fields: id, customerEmail" 
        }, { status: 400 });
    }

    try {
        const supabase = createClient();

        // Find the customer's cart
        const { data: existingCart } = await supabase
            .from('cart_headers')
            .select('id')
            .eq('customer_email', customerEmail)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!existingCart) {
            return NextResponse.json({ 
                error: "No cart found for customer" 
            }, { status: 404 });
        }

        // Find the cart item
        const { data: existingItem } = await supabase
            .from('cart_items')
            .select('*')
            .eq('cart_id', existingCart.id)
            .eq('item_id', id)
            .single();

        if (!existingItem) {
            return NextResponse.json({ 
                error: "Item not found in cart" 
            }, { status: 404 });
        }

        if (existingItem.qty > 1) {
            // Reduce quantity by 1
            const { error: updateError } = await supabase
                .from('cart_items')
                .update({ 
                    qty: existingItem.qty - 1
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
                message: `Reduced quantity to ${existingItem.qty - 1}`,
                newQuantity: existingItem.qty - 1
            });
        } else {
            // Remove item completely
            const { error: deleteError } = await supabase
                .from('cart_items')
                .delete()
                .eq('id', existingItem.id);

            if (deleteError) {
                return NextResponse.json({ 
                    error: "Failed to remove cart item", 
                    details: deleteError.message 
                }, { status: 500 });
            }

            return NextResponse.json({ 
                success: true, 
                message: "Item removed from cart",
                newQuantity: 0
            });
        }

    } catch (error: unknown) {
        console.error('Failed to remove from cart:', error);
        return NextResponse.json({ 
            error: "Failed to remove from cart", 
            details: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}
