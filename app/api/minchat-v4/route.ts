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
  // Get cart and booking in one go
  const { data: cart } = await supa
    .from('cart_headers')
    .select('*')
    .eq('customer_email', customer_email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!cart?.booking_id) {
    return { experience: null, drinks: [] };
  }

  // Get booking with experience
  const { data: booking } = await supa
    .from('bookings')
    .select(`
      experiences!inner(name, description, tags, category)
    `)
    .eq('id', cart.booking_id)
    .single();

  if (!booking) {
    return { experience: null, drinks: [] };
  }

  const experienceName = Array.isArray(booking.experiences) 
    ? booking.experiences[0]?.name 
    : (booking.experiences as { name: string })?.name;
  
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
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content: 'Return ONLY a JSON object with keys: title (string) and choices (array of EXACTLY 2 items). Each item: { "kind":"drink", "id":string, "label":string, "qty":number, "reason":string }. No markdown. No extra text.'
        },
        {
          role: "user",
          content: `Experience: ${experience}\n\nAvailable drinks:\n${JSON.stringify(drinks, null, 2)}\n\nCreate 2 personalized drink recommendations with scientific reasons why they pair well with this experience.`
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
