import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// ============= INTERFACES =============
// Clean, purposeful data structures

interface CartItem {
  item_id: string
  product_name?: string
  qty: number
  assessment_reason?: string  // From Water Bar: "15% Mg deficit"
}

interface RedistributedItem {
  booking_id: string
  timing: 'pre' | 'during' | 'after' | 'takeaway'
  product_id: string
  name: string
  quantity: number
  // NO individual rationale - that goes in booking_explanation
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
  booking_explanation?: string  // Contains pathway reasoning
}

// ============= MAIN HANDLER =============
export async function POST(request: NextRequest) {
  try {
    // Expected from Water Bar QR scan
    const { cart_id, customer_email, items, assessment_summary } = await request.json()
    const supabase = await createClient()
    
    // Validate incoming data
    if (!cart_id || !items || items.length === 0) {
      return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 })
    }
    
    // Find customer's active bookings at AOI
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('*, experiences(name)')  // Get experience names too
      .eq('customer_email', customer_email)
      .eq('venue_id', '20c2f440-9133-42ec-a8d6-6336e649ec4b') // AOI venue
      .in('booking_status', ['sessions_scheduled', 'in_session'])
      .order('slot_time', { ascending: true })
    
    if (bookingError || !bookings || bookings.length === 0) {
      return NextResponse.json({ 
        error: 'No active bookings found for customer',
        details: 'Customer needs an active AOI booking to receive assessment drinks'
      }, { status: 404 })
    }
    
    // AI decides WHERE to place assessment drinks
    const redistributedItems = await redistributeDrinks(items, bookings)
    
    // Group updates by booking for efficiency
    const bookingUpdates = new Map<string, {
      pre: any[]
      during: any[]
      after: any[]
      explanation_append: string
    }>()
    
    // Process each redistributed item
    let skippedCount = 0
    for (const item of redistributedItems) {
      if (item.timing === 'takeaway') continue // Handle separately later
      
      const targetBooking = bookings.find(b => b.id === item.booking_id)
      if (!targetBooking) continue
      
      // CHECK FOR DUPLICATES - don't add if product already exists
      const isDuplicate = 
        targetBooking.pre_drinks?.some((d: any) => d.product_id === item.product_id) ||
        targetBooking.during_drinks?.some((d: any) => d.product_id === item.product_id) ||
        targetBooking.after_drinks?.some((d: any) => d.product_id === item.product_id)
      
      if (isDuplicate) {
        skippedCount++
        continue // Skip this item, already in booking
      }
      
      // Initialize booking update if needed
      if (!bookingUpdates.has(item.booking_id)) {
        bookingUpdates.set(item.booking_id, {
          pre: [...(targetBooking.pre_drinks || [])],
          during: [...(targetBooking.during_drinks || [])],
          after: [...(targetBooking.after_drinks || [])],
          explanation_append: ''
        })
      }
      
      // Add drink to appropriate timing array (NO reason field!)
      const bookingUpdate = bookingUpdates.get(item.booking_id)!
      const drinkToAdd = {
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity
        // NO reason/rationale here - goes in booking_explanation
      }
      
      if (item.timing === 'pre') bookingUpdate.pre.push(drinkToAdd)
      else if (item.timing === 'during') bookingUpdate.during.push(drinkToAdd)
      else if (item.timing === 'after') bookingUpdate.after.push(drinkToAdd)
    }
    
    // Execute all booking updates
    let successCount = 0
    for (const [bookingId, updates] of bookingUpdates) {
      const targetBooking = bookings.find(b => b.id === bookingId)
      
      // Build updated explanation
      const updatedExplanation = assessment_summary 
        ? `${targetBooking?.booking_explanation || ''}\n\n📊 Hydration Assessment Integration:\n${assessment_summary}`
        : targetBooking?.booking_explanation
      
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          pre_drinks: updates.pre,
          during_drinks: updates.during,
          after_drinks: updates.after,
          booking_explanation: updatedExplanation
        })
        .eq('id', bookingId)
      
      if (!updateError) successCount++
    }
    
    // Log cart processing for tracking
    await supabase
      .from('cart_headers')
      .update({ 
        venue_claimed_at: new Date().toISOString(),
        venue_id: '20c2f440-9133-42ec-a8d6-6336e649ec4b',
        processing_notes: `Added ${successCount} items, skipped ${skippedCount} duplicates`
      })
      .eq('id', cart_id)
    
    return NextResponse.json({
      success: true,
      itemsAdded: successCount,
      duplicatesSkipped: skippedCount,
      bookingsUpdated: bookingUpdates.size,
      message: `Successfully integrated assessment drinks`
    })
    
  } catch (error) {
    console.error('Error processing cart transfer:', error)
    return NextResponse.json({ 
      error: 'Failed to process transfer',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// ============= AI REDISTRIBUTION LOGIC =============
async function redistributeDrinks(
  cartItems: CartItem[],
  bookings: Booking[]
): Promise<RedistributedItem[]> {
  
  const totalHours = bookings.reduce((sum, b) => 
    sum + (b.duration_minutes || 30) / 60, 0
  )
  const maxDrinksPerHour = 2
  const maxDrinksTotal = Math.floor(totalHours * maxDrinksPerHour)
  
  // Build product overlap map for AI
  const existingProducts = new Set<string>()
  bookings.forEach(b => {
    [...(b.pre_drinks || []), ...(b.during_drinks || []), ...(b.after_drinks || [])]
      .forEach(d => existingProducts.add(d.product_id))
  })
  
  const params: OpenAI.Chat.Completions.ChatCompletionCreateParams = {
    model: "gpt-4-turbo-preview",
    messages: [{
      role: "system" as const,
      content: `You are a logistics coordinator distributing hydration assessment drinks.
      
      CRITICAL RULES:
      1. CHECK FOR DUPLICATES - Skip any product that already exists in bookings
      2. Treat consecutive bookings (within 60min) as ONE continuous session
      3. Maximum ${maxDrinksPerHour} drinks per hour (${maxDrinksTotal} total)
      4. Sachets (Rite/Humantra) can be takeaway if excess
      5. DO NOT create biochemistry explanations - just decide timing
      
      Read the pathway_explanation to understand existing drink strategy.
      Your ONLY job is WHERE and WHEN to place new drinks.
      
      Return JSON: {
        items: [
          {
            booking_id: "uuid",
            timing: "pre|during|after|takeaway",
            product_id: "uuid"
          }
        ]
      }`
    }, {
      role: "user" as const,
      content: JSON.stringify({
        assessment_drinks: cartItems.map(item => ({
          id: item.item_id,
          name: item.product_name || 'Unknown',
          quantity: item.qty,
          type: item.product_name?.includes('Rite') || 
                item.product_name?.includes('Humantra') ? 'sachet' : 'drink'
        })),
        existing_products: Array.from(existingProducts),
        session_info: {
          total_hours: totalHours,
          max_drinks: maxDrinksTotal,
          bookings: bookings.map(b => ({
            id: b.id,
            time: b.slot_time,
            duration_min: b.duration_minutes,
            experience: b.experiences?.name,
            current_drinks: {
              pre: b.pre_drinks?.map(d => d.name) || [],
              during: b.during_drinks?.map(d => d.name) || [],
              after: b.after_drinks?.map(d => d.name) || []
            },
            pathway_explanation: b.booking_explanation
          }))
        }
      })
    }],
    response_format: { type: "json_object" as const }
  }
  
  const response = await openai.chat.completions.create(params)
  const result = JSON.parse(response.choices[0]?.message?.content || '{"items":[]}')
  
  // Map AI response to our clean format
  return (result.items || []).map((item: any) => ({
    booking_id: item.booking_id,
    timing: item.timing,
    product_id: item.product_id,
    name: cartItems.find(c => c.item_id === item.product_id)?.product_name || '',
    quantity: cartItems.find(c => c.item_id === item.product_id)?.qty || 1
    // NO rationale - explanations go in booking_explanation only
  }))
}