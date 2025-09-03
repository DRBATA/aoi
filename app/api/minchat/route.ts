// ==========================
// FILE: app/api/minchat/route.ts
// Minimal non-streaming chat endpoint using OpenAI Responses API + Supabase tools
// Env needed: OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (server-only)
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

async function list_experiences({ q = "", limit = 8 }: { q?: string; limit?: number }) {
  // minimal search over name/description/tags
  let query = supa.from("experiences").select("id,name,description,tags,category,duration_minutes").limit(Math.min(limit, 20));
  if (q) query = query.ilike("name", `%${q}%`);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function list_drinks({ q = "", tags = [], limit = 12 }: { q?: string; tags?: string[]; limit?: number }) {
  let query = supa.from("products").select("id,name,description,tags,category,price_aed").limit(Math.min(limit, 30));
  if (q) query = query.ilike("name", `%${q}%`);
  if (tags?.length) query = query.contains("tags", tags);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function get_cart_contents({ customer_email }: { customer_email: string }) {
  // Get cart with booking and any cart items
  const { data: cart, error: cartError } = await supa
    .from('cart_headers')
    .select(`
      id,
      customer_name,
      customer_email,
      booking_status,
      created_at,
      booking_id
    `)
    .eq('customer_email', customer_email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (cartError || !cart) return { cart: null, booking: null, items: [] };

  // Get booking details if exists
  let booking = null;
  if (cart.booking_id) {
    const { data: bookingData } = await supa
      .from('bookings')
      .select(`
        id,
        slot_time,
        duration_minutes,
        experience_id,
        experiences!inner(name, description, tags, category)
      `)
      .eq('id', cart.booking_id)
      .single();
    
    booking = bookingData;
  }

  // Get cart items (drinks/products) - for future use
  const { data: items } = await supa
    .from('cart_items')
    .select(`
      id,
      product_id,
      quantity,
      products!inner(name, description, tags, category, price_aed)
    `)
    .eq('cart_id', cart.id);

  return { cart, booking, items: items || [] };
}

export async function POST(req: Request) {
  const body = await req.json();
  const { mode, text, tags = [], customer_email } = (body || {}) as { mode: "pairs" | "drinks"; text?: string; tags?: string[]; customer_email?: string };

  // 1) First call — let the model decide which tool(s) to call
  let res = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "system",
        content: "You are AOI's personalized concierge. For drink suggestions, you MUST complete this exact workflow:\n" +
          "1. Call get_cart_contents to see their booking\n" +
          "2. Call list_experiences with the exact experience name to get its description\n" +
          "3. Call list_drinks to find products that match the experience's intention\n" +
          "4. Provide specific drink recommendations based on the experience description\n" +
          "For 'pairs' mode: suggest complementary experiences. For 'drinks' mode: follow the 4-step workflow above.\n" +
          "You must call multiple tools in sequence - don't stop after just reading the cart. Complete the full analysis."
      },
      { 
        role: "user", 
        content: JSON.stringify({ mode, text, tags, customer_email })
      }
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "list_experiences",
          description: "Search AOI experiences (live only)",
          parameters: {
            type: "object",
            properties: {
              q: { type: "string", description: "keyword filter" },
              limit: { type: "number" }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "list_drinks",
          description: "Search AOI drinks/products (in stock)",
          parameters: {
            type: "object",
            properties: {
              q: { type: "string" },
              tags: { type: "array", items: { type: "string" } },
              limit: { type: "number" }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_cart_contents",
          description: "Get customer's current cart contents including bookings and items",
          parameters: {
            type: "object",
            properties: {
              customer_email: { type: "string", description: "Customer email to look up cart" }
            },
            required: ["customer_email"]
          }
        }
      }
    ],
    tool_choice: "auto"
  });

  // 2) Fulfil tool calls (if any), then re-ask for final text
  const toolCalls = res.choices[0]?.message?.tool_calls || [];
  
  if (toolCalls.length > 0) {
    const messages: any[] = [
      {
        role: "system",
        content: "CRITICAL: You must call list_drinks to get actual product recommendations. Do not provide final answer until you have called list_drinks and have specific product names. If you see experience data but no drink products yet, call list_drinks immediately with relevant search terms."
      },
      { 
        role: "user", 
        content: JSON.stringify({ mode, text, tags, customer_email })
      },
      res.choices[0].message
    ];

    for (const toolCall of toolCalls) {
      const { id } = toolCall;
      let result: any = {};
      
      try {
        const args = JSON.parse((toolCall as any).function.arguments);
        if ((toolCall as any).function.name === "list_experiences") result = await list_experiences(args || {});
        if ((toolCall as any).function.name === "list_drinks") result = await list_drinks(args || {});
        if ((toolCall as any).function.name === "get_cart_contents") result = await get_cart_contents(args || {});
      } catch (e) {
        result = { error: "Failed to parse arguments" };
      }

      messages.push({
        role: "tool",
        tool_call_id: id,
        content: JSON.stringify(result)
      });
    }

    const finalRes = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages
    });

    const out = { text: finalRes.choices[0]?.message?.content ?? "Sorry, no suggestion this time." };
    return Response.json(out);
  }

  const out = { text: res.choices[0]?.message?.content ?? "Sorry, no suggestion this time." };
  return Response.json(out);
}
