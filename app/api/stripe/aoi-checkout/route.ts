import Stripe from "stripe"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client"

export async function POST(req: Request) {
  try {
    const { customer_email } = await req.json();
    
    if (!customer_email) {
      return NextResponse.json({ error: "Customer email is required" }, { status: 400 });
    }

    const supabase = createClient();

    // Find cart_header for this customer
    const { data: cartHeader, error: headerError } = await supabase
      .from("cart_headers")
      .select("id")
      .eq("user_email", customer_email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (headerError) {
      return NextResponse.json({ error: `Error finding cart: ${headerError.message}` }, { status: 400 });
    }
    
    if (!cartHeader) {
      return NextResponse.json({ error: "No cart found for this customer" }, { status: 400 });
    }
    
    // Fetch cart items
    const { data: cartRows, error: itemsError } = await supabase
      .from("cart_items")
      .select("item_id, qty")
      .eq("cart_id", cartHeader.id);
      
    if (itemsError) {
      return NextResponse.json({ error: `Error fetching cart items: ${itemsError.message}` }, { status: 400 });
    }
    
    if (!cartRows || cartRows.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Initialize Stripe
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return NextResponse.json({ error: "STRIPE_SECRET_KEY env var missing" }, { status: 500 });
    }
    const stripe = new Stripe(stripeSecret);

    // Determine base URL
    let baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!baseUrl) {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    }

    // Fetch stripe_price_ids from products and experiences
    const { data: productsData } = await supabase
      .from("products")
      .select("id, stripe_price_id");

    const { data: experiencesData } = await supabase
      .from("experiences")
      .select("id, stripe_price_id");

    const priceIdLookup: Record<string, string | null> = {};
    (productsData || []).forEach(p => { priceIdLookup[p.id] = p.stripe_price_id; });
    (experiencesData || []).forEach(e => { priceIdLookup[e.id] = e.stripe_price_id; });

    // Build line items
    const lineItems = cartRows.map((row) => {
      const stripePriceId = priceIdLookup[row.item_id];
      if (!stripePriceId) {
        console.error(`Item '${row.item_id}' missing Stripe Price ID`);
        return null;
      }
      return {
        price: stripePriceId,
        quantity: row.qty,
      };
    }).filter(item => item !== null) as Stripe.Checkout.SessionCreateParams.LineItem[];

    if (lineItems.length === 0) {
      return NextResponse.json({ error: "No items have valid pricing for checkout" }, { status: 400 });
    }

    // Create Stripe checkout session
    const checkout = await stripe.checkout.sessions.create({
      allow_promotion_codes: false,
      mode: "payment",
      line_items: lineItems,
      success_url: `${baseUrl}/aoi/success?session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/aoi`,
      metadata: {
        customer_email,
        cart_id: cartHeader.id,
        venue_id: process.env.AOI_VENUE_ID || ""
      },
    });

    return NextResponse.json({ 
      url: checkout.url,
      session_id: checkout.id 
    });

  } catch (error: unknown) {
    console.error("AOI checkout session creation failed:", error);
    return NextResponse.json({ 
      error: `Checkout Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}
