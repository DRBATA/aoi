import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Dynamic import for OpenAI to handle potential module issues
let OpenAI: any
try {
  OpenAI = require('openai')
} catch (e) {
  console.log('OpenAI module not found, using fallback')
}

const openai = OpenAI ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
}) : null

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Tool definitions for OpenAI
const tools = [
  {
    type: "function" as const,
    function: {
      name: "query_products",
      description: "Query product information from the database including drinks, prices, and availability",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "Product category to filter by (e.g., 'drinks', 'water', 'coffee')"
          },
          search_term: {
            type: "string",
            description: "Search term to find specific products"
          },
          limit: {
            type: "number",
            description: "Maximum number of results to return",
            default: 10
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_product_details",
      description: "Get detailed information about a specific product",
      parameters: {
        type: "object",
        properties: {
          product_id: {
            type: "string",
            description: "The ID of the product to get details for"
          }
        },
        required: ["product_id"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "check_inventory",
      description: "Check inventory levels for products at specific venues",
      parameters: {
        type: "object",
        properties: {
          product_id: {
            type: "string",
            description: "Product ID to check inventory for"
          },
          venue_id: {
            type: "string",
            description: "Venue ID to check inventory at"
          }
        }
      }
    }
  }
]

// Function implementations
async function queryProducts(args: any) {
  let query = supabase.from('products').select('*')
  
  if (args.category) {
    query = query.ilike('category', `%${args.category}%`)
  }
  
  if (args.search_term) {
    query = query.or(`name.ilike.%${args.search_term}%,description.ilike.%${args.search_term}%`)
  }
  
  if (args.limit) {
    query = query.limit(args.limit)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

async function getProductDetails(args: any) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', args.product_id)
    .single()
  
  if (error) throw error
  return data
}

async function checkInventory(args: any) {
  let query = supabase.from('inventory').select('*')
  
  if (args.product_id) {
    query = query.eq('product_id', args.product_id)
  }
  
  if (args.venue_id) {
    query = query.eq('venue_id', args.venue_id)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    
    // System prompt for the AI
    const systemMessage = {
      role: "system" as const,
      content: `You are the AOI (Art of Implosion) Journey Guide, a helpful assistant for The Water Bar. 
      You help customers discover and learn about our premium water and drink offerings. 
      Use the available tools to query real product data and provide accurate information.
      Be friendly, knowledgeable, and enthusiastic about hydration and wellness.
      When discussing products, mention their unique features, benefits, and prices when available.`
    }
    
    // Call OpenAI with tools
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [systemMessage, ...messages],
      tools: tools,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 500
    })
    
    const responseMessage = completion.choices[0].message
    
    // Handle tool calls if any
    if (responseMessage.tool_calls) {
      const toolResults = []
      
      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name
        const functionArgs = JSON.parse(toolCall.function.arguments)
        
        let result
        try {
          switch (functionName) {
            case 'query_products':
              result = await queryProducts(functionArgs)
              break
            case 'get_product_details':
              result = await getProductDetails(functionArgs)
              break
            case 'check_inventory':
              result = await checkInventory(functionArgs)
              break
            default:
              result = { error: `Unknown function: ${functionName}` }
          }
          
          toolResults.push({
            tool_call_id: toolCall.id,
            role: "tool" as const,
            content: JSON.stringify(result)
          })
        } catch (error) {
          toolResults.push({
            tool_call_id: toolCall.id,
            role: "tool" as const,
            content: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })
          })
        }
      }
      
      // Get final response with tool results
      const finalCompletion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          systemMessage,
          ...messages,
          responseMessage,
          ...toolResults
        ],
        temperature: 0.7,
        max_tokens: 500
      })
      
      return NextResponse.json({
        reply: finalCompletion.choices[0].message.content,
        tool_calls: responseMessage.tool_calls
      })
    }
    
    // Return response without tool calls
    return NextResponse.json({
      reply: responseMessage.content
    })
    
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
