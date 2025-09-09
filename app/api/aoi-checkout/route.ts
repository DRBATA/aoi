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

    // Find cart header for this customer email (using email as session_id for AOI)
    const { data: cartHeader, error: headerError } = await supabase
      .from("cart_headers")
      .select("id")
      .eq("session_id", customer_email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (headerError) {
      return NextResponse.json({ error: `Error finding cart: ${headerError.message}` }, { status: 400 });
    }

    if (!cartHeader) {
      return NextResponse.json({ error: "No cart found for customer" }, { status: 400 });
    }

    // Find cart_items for this cart
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select("item_id, qty")
      .eq("cart_id", cartHeader.id);

    if (cartError) {
      console.error("Error fetching cart items:", cartError);
      return NextResponse.json({ error: "Failed to fetch cart items" }, { status: 400 });
    }

    if (!cartItems || cartItems.length === 0) {
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
      const host = req.headers.get("host");
      baseUrl = host ? `https://${host}` : undefined;
    }
    if (!baseUrl?.startsWith("http")) {
      return NextResponse.json({ error: "BASE_URL missing or invalid" }, { status: 500 });
    }

    // Fetch stripe_price_ids for products and experiences
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("id, stripe_price_id");

    const { data: experiencesData, error: experiencesError } = await supabase
      .from("experiences")
      .select("id, stripe_price_id");

    if (productsError || experiencesError) {
      console.error("Error fetching pricing data:", { productsError, experiencesError });
      return NextResponse.json({ error: "Failed to fetch pricing data" }, { status: 500 });
    }

    // Create price lookup
    const priceIdLookup: Record<string, string | null> = {};
    (productsData || []).forEach(p => { priceIdLookup[p.id] = p.stripe_price_id; });
    (experiencesData || []).forEach(e => { priceIdLookup[e.id] = e.stripe_price_id; });

    // Build line items
    const lineItems = cartItems.map((item) => {
      const stripePriceId = priceIdLookup[item.item_id];
      if (!stripePriceId) {
        console.error(`Item '${item.item_id}' missing Stripe Price ID. Skipping.`);
        return null;
      }
      return {
        price: stripePriceId,
        quantity: item.qty,
      };
    }).filter(item => item !== null) as Stripe.Checkout.SessionCreateParams.LineItem[];

    if (lineItems.length === 0) {
      return NextResponse.json({ error: "No items have valid pricing information" }, { status: 400 });
    }

    // Create Stripe checkout session
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${baseUrl}/aoi-success?session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/aoi`,
      customer_email: customer_email,
      metadata: {
        customer_email: customer_email,
        aoi_booking: "true"
      },
    });

    return NextResponse.json({ 
      url: checkout.url,
      session_id: checkout.id 
    });

  } catch (error: any) {
    console.error("AOI checkout session creation failed:", error);
    return NextResponse.json({ error: `Stripe Error: ${error.message}` }, { status: 500 });
  }
}
