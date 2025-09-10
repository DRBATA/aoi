import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log("Payment completed for session:", session.id);
      
      // Extract metadata from the session
      const customerEmail = session.metadata?.customer_email;
      const venueId = session.metadata?.venue_id;

      if (!customerEmail) {
        console.error("No customer email in session metadata");
        return NextResponse.json({ error: "Missing customer email" }, { status: 400 });
      }

      // Call the migration function
      const supabase = createClient();
      
      try {
        const { data: orderId, error: migrationError } = await supabase
          .rpc('aoi_migrate_cart_to_order', {
            p_customer_email: customerEmail,
            p_stripe_session_id: session.id,
            p_venue_id: venueId || null
          });

        if (migrationError) {
          console.error("Migration failed:", migrationError);
          return NextResponse.json({ error: "Migration failed" }, { status: 500 });
        }

        console.log("Successfully migrated cart to order:", orderId);
        
        // TODO: Send confirmation email here
        // await sendConfirmationEmail(customerEmail, orderId);

      } catch (error) {
        console.error("Error during migration:", error);
        return NextResponse.json({ error: "Migration error" }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
