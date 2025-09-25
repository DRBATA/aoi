import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Function removed - no longer needed since we pass original cart items directly

export async function POST(request: NextRequest) {
  try {
    const { cart_id, customer_email, items } = await request.json()
    const supabase = await createClient()
    
    // Directly use the cart data passed in QR code
    // No need for cart_transfers table
    
    if (!cart_id || !items || items.length === 0) {
      return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 })
    }
    
    // Find customer's bookings at AOI venue
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('customer_email', customer_email)
      .eq('venue_id', '20c2f440-9133-42ec-a8d6-6336e649ec4b') // AOI venue ID
      .in('booking_status', ['sessions_scheduled', 'in_session'])
    
    if (bookingError || !bookings || bookings.length === 0) {
      return NextResponse.json({ error: 'No active bookings found for customer' }, { status: 404 })
    }
    
    // Validate bookings exist
    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ error: 'No active bookings provided' }, { status: 404 })
    }
    
    // AI redistribution of drinks across all bookings
    // Pass the ORIGINAL cart items with their AI explanations
    const redistributedItems = await redistributeDrinks(
      items,  // Keep original cart items with AI context
      bookings
    )
    
    // Update each booking with new items, checking existing drinks
    const updates = []
    for (const item of redistributedItems) {
      const targetBooking = bookings.find(b => b.id === item.booking_id)
      if (!targetBooking) continue
      
      // Check if item already exists in pre/during/after drinks
      const existingPre = targetBooking.pre_drinks?.some((d: { product_id: string }) => d.product_id === item.product_id)
      const existingDuring = targetBooking.during_drinks?.some((d: { product_id: string }) => d.product_id === item.product_id)
      const existingAfter = targetBooking.after_drinks?.some((d: { product_id: string }) => d.product_id === item.product_id)
      
      if (!existingPre && !existingDuring && !existingAfter) {
        // Add to appropriate drinks array based on timing
        const drinkField = item.timing === 'before' ? 'pre_drinks' :
                          item.timing === 'during' ? 'during_drinks' : 'after_drinks'
        
        const currentDrinks = targetBooking[drinkField] || []
        const updatedDrinks = [...currentDrinks, {
          product_id: item.product_id,
          name: item.name,
          quantity: item.quantity,
          reason: item.rationale
        }]
        
        updates.push({
          booking_id: item.booking_id,
          field: drinkField,
          value: updatedDrinks
        })
      }
    }
    
    // Update bookings with new drinks
    if (updates.length > 0) {
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ [update.field]: update.value })
          .eq('id', update.booking_id)
        
        if (updateError) throw updateError
      }
    }
    
    // Log the cart processing (optional - could track in cart_headers)
    await supabase
      .from('cart_headers')
      .update({ 
        venue_claimed_at: new Date().toISOString(),
        venue_id: '20c2f440-9133-42ec-a8d6-6336e649ec4b'
      })
      .eq('id', cart_id)
    
    return NextResponse.json({
      success: true,
      itemsAdded: updates.length,
      message: `Added ${updates.length} items to booking`
    })
    
  } catch (error) {
    console.error('Error processing cart transfer:', error)
    return NextResponse.json({ error: 'Failed to process transfer' }, { status: 500 })
  }
}

interface RedistributedItem {
  booking_id: string
  timing: string
  rationale: string
  product_id: string
  name: string
  quantity: number
  rationale: string
}

interface ApiResponse {
  items: Array<{
    booking_id: string
    timing: string
    product_id: string
    rationale: string
  }>
}

interface Booking {
  id: string
  customer_email: string
  slot_time: string
  duration_minutes?: number
  experience_id?: string
  experiences?: { name: string }
  pre_drinks: Array<{product_id: string; name: string; quantity: number}>
  during_drinks: Array<{product_id: string; name: string; quantity: number}>
  after_drinks: Array<{product_id: string; name: string; quantity: number}>
  booking_explanation?: string  // THIS is where the reasoning goes
}

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function redistributeDrinks(
  cartItems: Array<{
    item_id: string
    product_name?: string
    qty: number
    ai_recommendation?: { reason?: string }
    reason?: string
  }>,
  bookings: Booking[]
): Promise<RedistributedItem[]> {
  // CRITICAL INSIGHTS:
  // 1. Drinks come with AI explanations of WHY they were selected
  // 2. Multiple bookings = ONE session (check same email, same day)
  // 3. Look at booking pathway explanations for drink placement guidance
  // 4. Trust the original AI's reasoning, just distribute timing
  
  const totalHours = bookings.reduce((sum, b) => sum + (b.duration_minutes || 30) / 60, 0)
  const maxDrinksToDistribute = Math.floor(totalHours * 2)
  
  const params: OpenAI.Chat.Completions.ChatCompletionCreateParams = {
    model: "gpt-4-turbo-preview",
    messages: [{
      role: "system" as const,
      content: `You are distributing drinks that were ALREADY scientifically selected for this customer's deficits.
      
      CRITICAL: These are likely MULTIPLE bookings for ONE continuous session.
      Look at the timeline - if bookings are consecutive (30-60min apart), treat as one session.
      
      Each drink comes with its ORIGINAL AI explanation of why it was selected.
      RESPECT that reasoning when placing drinks.
      
      RULES:
      - Total session time: ${totalHours} hours (max ${maxDrinksToDistribute} drinks @ 2/hour)
      - Sachets (Rite/Humantra) can be takeaway if excess
      - If bookings already have drinks with explanations, READ those explanations
      - Distribute to maintain steady hydration across the ENTIRE session
      
      DO NOT reassess nutritional needs - trust the original AI selection.
      Just optimize WHEN each drink should be consumed.
      
      Return JSON: {items: [{booking_id, timing: "before|during|after|takeaway", product_id, rationale}]}`
    }, {
      role: "user" as const,
      content: JSON.stringify({
        drinks_to_distribute: cartItems.filter(i => i.product_name).map(i => ({
          id: i.item_id,
          name: i.product_name,
          original_ai_reason: i.ai_recommendation?.reason || i.reason,  // Keep original explanation!
          type: i.product_name?.includes('Rite') || i.product_name?.includes('Humantra') ? 'sachet' : 'drink'
        })),
        session_timeline: {
          customer_email: bookings[0]?.customer_email,
          total_duration_hours: totalHours,
          bookings: bookings.sort((a,b) => new Date(a.slot_time).getTime() - new Date(b.slot_time).getTime()).map(b => ({
            booking_id: b.id,
            slot_time: b.slot_time,
            experience: b.experiences?.name,
            duration_minutes: b.duration_minutes || 30,
            existing_drinks_with_explanations: {
              pre: b.pre_drinks || [],
              during: b.during_drinks || [],
              after: b.after_drinks || []
            }
          }))
        }
      })
    }],
    response_format: { type: "json_object" as const }
  }
  
  const response = await openai.chat.completions.create(params)
  const result: ApiResponse = JSON.parse(response.choices[0]?.message?.content || '{items:[]}')
  
  // Map the AI response to our RedistributedItem format
  return (result.items || []).map((item) => ({
    booking_id: item.booking_id,
    timing: item.timing,
    product_id: item.product_id,  // This will be the product.id
    name: cartItems.find(i => i.item_id === item.product_id)?.product_name || '',
    quantity: cartItems.find(i => i.item_id === item.product_id)?.qty || 1,
    rationale: item.rationale
  }))
}
