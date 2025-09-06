// ==========================
// FILE: app/api/minchat-v4/route.ts
// Simple approach: Just ask AI to make 2 JSON chips directly
// ==========================
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const supa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function get_cart_and_drinks(customer_email: string) {
  // NEW: Find cart items with booking_id (experiences) for this customer
  const { data: cartItems } = await supa
    .from('cart_items')
    .select(`
      booking_id,
      cart_id,
      cart_headers!inner(customer_email, created_at)
    `)
    .eq('cart_headers.customer_email', customer_email)
    .not('booking_id', 'is', null)
    .order('cart_headers.created_at', { ascending: false })
    .limit(1);

  if (!cartItems || cartItems.length === 0) {
    return { experience: null, drinks: [] };
  }

  const cartItem = cartItems[0];
  
  // Get booking with experience details
  const { data: booking } = await supa
    .from('bookings')
    .select(`
      experience_id,
      venue_id
    `)
    .eq('id', cartItem.booking_id)
    .single();

  if (!booking) {
    return { experience: null, drinks: [] };
  }

  // Get experience name from venue_experiences
  const { data: venueExp } = await supa
    .from('venue_experiences')
    .select('experience_name')
    .eq('venue_id', booking.venue_id)
    .eq('experience_id', booking.experience_id)
    .single();

  if (!venueExp) {
    return { experience: null, drinks: [] };
  }

  const experienceName = venueExp.experience_name;
  
  // Get drinks that pair with this experience
  const { data: drinks } = await supa.rpc('search_products_by_trigger', {
    pattern: experienceName,
    lim: 8
  });

  return {
    experience: experienceName,
    drinks: drinks || []
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer_email } = body;

    if (!customer_email) {
      return Response.json({ title: "Need email", choices: [] });
    }

    // Get all the data we need in one shot
    const { experience, drinks } = await get_cart_and_drinks(customer_email);

    if (!experience) {
      return Response.json({ title: "No booking found", choices: [] });
    }

    if (drinks.length === 0) {
      return Response.json({ title: "No drink pairings found", choices: [] });
    }

    // Ask AI to make 2 JSON chips directly
    const response = await client.chat.completions.create({
      model: "gpt-5-mini",
      response_format: { type: "json_object" },
      max_completion_tokens: 800,
      messages: [
        {
          role: "system",
          content: 'You are a drink expert. Respond with valid JSON only.'
        },
        {
          role: "user",
          content: `Experience: ${experience}\n\nAvailable drinks:\n${JSON.stringify(drinks, null, 2)}\n\nReturn JSON: {"title": "string", "choices": [{"kind": "drink", "id": "string", "label": "string", "qty": 1, "reason": "string"}]}. Pick exactly 2 drinks.`
        }
      ]
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return Response.json({ title: "No suggestions", choices: [] });
    }

    // Validate it's proper JSON
    try {
      const parsed = JSON.parse(content);
      if (parsed.title && Array.isArray(parsed.choices)) {
        return new Response(content, { headers: { "Content-Type": "application/json" } });
      }
    } catch (e) {
      console.error("[minchat-v4] JSON parse error:", e);
    }

    // Fallback: create simple chips from first 2 drinks
    const fallback = {
      title: `Drinks for ${experience}`,
      choices: drinks.slice(0, 2).map((drink: { id: string; name: string }) => ({
        kind: "drink",
        id: drink.id,
        label: drink.name,
        qty: 1,
        reason: "Pairs well with your session"
      }))
    };

    return Response.json(fallback);

  } catch (error) {
    console.error("[minchat-v4] Error:", error);
    return Response.json({ title: "Error", choices: [] });
  }
}
