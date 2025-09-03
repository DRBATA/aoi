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

async function list_experiences({ q = "", limit = 8 }: { q?: string; limit?: number }) {
  // Search experiences - no status column in this table
  let query = supa.from("experiences").select("id,name,description,tags,category,duration_minutes").limit(Math.min(limit, 20));
  if (q) query = query.ilike("name", `%${q}%`);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

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
  const { mode, text, tags = [], customer_email } = body;

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: "You are AOI's personalized concierge. For drink suggestions, you MUST complete this workflow:\n" +
        "1. Call get_cart_contents to see their booking and cart\n" +
        "2. If they have a booking, extract the experience name from booking.experiences.name\n" +
        "3. Call list_drinks with experience_name to find products that pair with this experience\n" +
        "4. Recommend 2-3 drinks that complement the experience with scientific reasoning\n" +
        "CRITICAL: Use the exact experience name from the booking in list_drinks. Products have trigger arrays containing experience names."
    },
    {
      role: "user",
      content: JSON.stringify({ mode, text, tags, customer_email })
    }
  ];

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

  // Loop until no more tool calls (max 4 rounds for complex workflows)
  for (let i = 0; i < 4; i++) {
    const response = await client.chat.completions.create({
      model: "gpt-5-mini",
      messages,
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

    // If AI wants to call tools, execute them and continue
    if (message.tool_calls?.length) {
      // CRITICAL: Push the assistant message with tool_calls first
      messages.push(message);

      // Execute all tool calls in parallel
      const toolResults = await Promise.all(
        message.tool_calls.map(async (toolCall) => {
          const name = (toolCall as { function: { name: string } }).function.name;
          const args = JSON.parse((toolCall as { function: { arguments?: string } }).function.arguments || "{}");
          
          let result: unknown = {};
          try {
            if (name === "get_cart_contents") result = await get_cart_contents(args);
            if (name === "list_experiences") result = await list_experiences(args);
            if (name === "list_drinks") result = await list_drinks(args);
          } catch {
            result = { error: "Tool execution failed" };
          }

          return {
            role: "tool" as const,
            tool_call_id: toolCall.id,
            content: JSON.stringify(result)
          };
        })
      );

      // Push all tool results
      messages.push(...toolResults);
      
      // Continue loop to let AI process tool results
      continue;
    }

    // No tool calls = the model is ready to answer.
    // Do ONE more call forcing JSON so the UI can render clickable chips.
    const final = await client.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        ...messages,
        {
          role: "system",
          content:
            "Return STRICT JSON: { \"title\": string, \"choices\": [{ \"kind\": \"drink\"|\"experience\"|\"bundle\", \"slug\": string, \"label\": string, \"qty\": number, \"where\": \"here\"|\"to-go\"|null, \"reason\": string }] }\n" +
            "Rules: max 3 experience choices total; 2–6 drink choices total; use ONLY items returned by tools; no medical claims."
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 800
    });

    console.log("[minchat-v2] final JSON model:", final.model);
    const payload = final.choices[0]?.message?.content || "{\"title\":\"Suggestions\",\"choices\":[]}";
    return new Response(payload, { headers: { "Content-Type": "application/json" } });
  }

  // Safety fallback
  return Response.json({ text: "Workflow incomplete. Please try a more specific request." });
}
