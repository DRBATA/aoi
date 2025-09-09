import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Only process AOI bookings
    if (session.metadata?.aoi_booking === "true") {
      const customer_email = session.metadata.customer_email;
      const stripe_session_id = session.id;

      if (!customer_email) {
        console.error("Missing customer_email in session metadata");
        return NextResponse.json({ error: "Missing customer email" }, { status: 400 });
      }

      try {
        const supabase = createClient();
        
        // Call the migration function
        const { data, error } = await supabase.rpc('aoi_migrate_booking_to_order', {
          p_customer_email: customer_email,
          p_stripe_session_id: stripe_session_id
        });

        if (error) {
          console.error("Error migrating AOI booking to order:", error);
          return NextResponse.json({ error: "Migration failed" }, { status: 500 });
        }

        console.log(`✅ AOI booking migrated to order for ${customer_email}, order_id: ${data}`);
        
      } catch (error) {
        console.error("Error processing AOI webhook:", error);
        return NextResponse.json({ error: "Processing failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
