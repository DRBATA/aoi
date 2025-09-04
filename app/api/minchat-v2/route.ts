// ==========================
// FILE: app/api/minchat-v2/route.ts
// Improved Chat Completions with proper tool calling loop
// Based on ChatGPT's suggestion but adapted for our cart-aware system
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

// Removed unused list_experiences function

async function list_drinks(args: { q?: string; experience_name?: string; limit?: number }) {
  const limit = Math.min(args.limit || 6, 6);
  
  // Use RPC for experience-based search (returns minimal JSON)
  if (args.experience_name) {
    console.log('[list_drinks] Using RPC for:', args.experience_name);
    const { data, error } = await supa.rpc('search_products_by_trigger', {
      pattern: args.experience_name,
      lim: limit
    });
    if (error) {
      console.error('[list_drinks] RPC error:', error);
      return [];
    }
    return data || [];
  }
  
  // Fallback: search by name using simple view
  let query = supa.from("simple_products").select("id, name, description, price_aed, category").limit(limit);
  if (args.q) {
    query = query.ilike("name", `%${args.q}%`);
  }
  const { data } = await query;
  return data || [];
}

async function get_cart_contents({ customer_email }: { customer_email: string }) {
  // Get the most recent cart for this customer
  const { data: cart, error: cartError } = await supa
    .from('cart_headers')
    .select('*')
    .eq('customer_email', customer_email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (cartError || !cart) {
    return { cart: null, booking: null, items: [] };
  }

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

  // Skip cart items for now - only need booking experience for drink suggestions
  // TODO: Fix cart items FK relationship later if needed for other features
  
  return { cart, booking, items: [] };
}

export async function POST(req: Request) {
  const body = await req.json();
  // Extract body for use in buildMessages function
  // const { mode, text, tags = [], customer_email } = body; // Unused destructuring removed

  const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
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
    },
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
        description: "Find drinks that pair with a specific experience",
        parameters: {
          type: "object",
          properties: {
            q: { type: "string", description: "Search query for drink name" },
            experience_name: { type: "string", description: "Name of the experience to find drink pairings for" },
            limit: { type: "number" }
          }
        }
      }
    }
  ];

  // State machine for windowed stepper approach
  type State = 
    | { phase: "start" }
    | { phase: "haveCart"; experience: string }
    | { phase: "haveDrinks"; experience: string; drinks: {id:string; name:string}[] };

  let state: State = { phase: "start" };

  // Build fresh messages based on current state
  function buildMessages(state: State) {
    const base = [{ role: "system" as const, content: "You are AOI's personalized concierge. For drink suggestions, you MUST complete this workflow:\n" +
      "1. Call get_cart_contents to see their booking and cart\n" +
      "2. If they have a booking, extract the experience name from booking.experiences.name\n" +
      "3. Call list_drinks with experience_name to find products that pair with this experience\n" +
      "4. Return STRICT JSON: { \"title\": string, \"choices\": [{ \"kind\": \"drink\", \"id\": string, \"label\": string, \"qty\": number, \"reason\": string }] }\n" +
      "CRITICAL: Use product.id for id, product.name for label. Return 2-3 drink choices. Use ONLY products returned by list_drinks." }];
    
    if (state.phase === "start") {
      return [...base, { role: "user" as const, content: JSON.stringify(body) }];
    }
    
    if (state.phase === "haveCart") {
      return [...base,
        { role: "system" as const, content: `booking_experience=${JSON.stringify(state.experience)}` },
        { role: "user" as const, content: "Call list_drinks with experience_name." }
      ];
    }
    
    // haveDrinks - ready for final JSON
    return [...base,
      { role: "system" as const, content: `experience=${JSON.stringify(state.experience)}; drinks=${JSON.stringify(state.drinks)}` },
      { role: "user" as const, content: "Return STRICT JSON with 2-3 drink choices." }
    ];
  }

  // Loop with fresh messages each time (max 3 steps)
  for (let i = 0; i < 3; i++) {
    const response = await client.chat.completions.create({
      model: "gpt-5-mini",
      messages: buildMessages(state),
      tools,
      tool_choice: "auto",
      max_completion_tokens: 400
    });

    console.log("[minchat-v2] tool round model:", response.model, 
                "tool_calls:", response.choices[0]?.message?.tool_calls?.length ?? 0);

    const message = response.choices[0]?.message;
    if (!message) {
      return Response.json({ text: "No response from AI." });
    }

    // Handle tool calls and update state
    const call = message.tool_calls?.[0];
    
    if (call && 'function' in call && call.function.name === "get_cart_contents") {
      const r = await get_cart_contents(JSON.parse(call.function.arguments || "{}"));
      const exp = (r.booking?.experiences as unknown as { name: string })?.name;
      if (!exp) return Response.json({ title: "No booking", choices: [] });
      state = { phase: "haveCart", experience: exp };
      continue;
    }

    if (call && 'function' in call && call.function.name === "list_drinks") {
      const args = JSON.parse(call.function.arguments || "{}");
      const rows = await list_drinks(args);
      const currentExp: string = state.phase === "haveCart" ? state.experience : "Unknown";
      state = {
        phase: "haveDrinks",
        experience: args.experience_name || currentExp,
        drinks: rows.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name }))
      };
      continue;
    }

    // If model already returned final JSON content
    const content = message.content ?? '{"title":"Suggestions","choices":[]}';
    return new Response(content, { headers: { "Content-Type": "application/json" } });
  }

  // Final fallback with nano for clean JSON generation
  if (state.phase === "haveDrinks") {
    const final = await client.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: 'Return STRICT JSON: {"title":string,"choices":[{"kind":"drink","id":string,"label":string,"qty":number,"reason":string}]}' },
        { role: "user", content: JSON.stringify(state) }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 400
    });
    
    console.log("[minchat-v2] final nano JSON:", final.choices[0]?.message?.content);
    return new Response(final.choices[0]?.message?.content ?? '{"title":"Suggestions","choices":[]}', {
      headers: { "Content-Type": "application/json" }
    });
  }

  return Response.json({ title: "No suggestions", choices: [] });
}
