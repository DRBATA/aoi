import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// ============= INTERFACES =============
interface CartItem {
  item_id: string
  product_name: string
  qty: number
  description?: string
  tags?: string[]
  category?: string
}

interface RedistributedItem {
  booking_id: string
  timing: 'pre' | 'during' | 'after' | 'takeaway'
  product_id: string
  name: string
  quantity: number
}

interface Booking {
  id: string
  customer_email: string
  slot_time: string
  duration_minutes?: number
  experience_id?: string
  experiences?: {
    name: string
    description?: string
    tags?: string[]
    duration_minutes?: number
    pairings?: Record<string, unknown>
  }
  pre_drinks: Array<{product_id: string; name: string; quantity: number}>
  during_drinks: Array<{product_id: string; name: string; quantity: number}>
  after_drinks: Array<{product_id: string; name: string; quantity: number}>
  booking_explanation?: string
}

// ============= MAIN HANDLER =============
export async function POST(request: NextRequest) {
  try {
    // Get cart_id and customer_email from QR scan + staff selection
    const { cart_id, customer_email } = await request.json()
    const supabase = await createClient()
    
    // Validate inputs
    if (!cart_id || !customer_email) {
      return NextResponse.json({ 
        error: 'Cart ID and customer email required' 
      }, { status: 400 })
    }
    
    // Get cart items WITH product details for AI context
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          name,
          description,
          tags,
          category
        )
      `)
      .eq('cart_id', cart_id)
    
    if (cartError || !cartItems?.length) {
      return NextResponse.json({ 
        error: 'Cart not found or empty',
        details: cartError?.message 
      }, { status: 404 })
    }
    
    // Format cart items with rich product context
    const items: CartItem[] = cartItems.map(item => ({
      item_id: item.product_id,
      product_name: item.products?.name || 'Unknown Product',
      qty: item.quantity,
      description: item.products?.description,
      tags: item.products?.tags,
      category: item.products?.category
    }))
    
    // Find customer's active bookings WITH experience details
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        experiences (
          name,
          description,
          tags,
          duration_minutes,
          pairings
        )
      `)
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
    
    // AI decides WHERE to place assessment drinks with full context
    const redistributedItems = await redistributeDrinks(items, bookings)
    
    // Group updates by booking for efficiency
    const bookingUpdates = new Map<string, {
      pre: Array<{product_id: string; name: string; quantity: number}>
      during: Array<{product_id: string; name: string; quantity: number}>
      after: Array<{product_id: string; name: string; quantity: number}>
    }>()
    
    // Map "takeaway" items to last booking's after_drinks
    const lastBooking = bookings[bookings.length - 1]
    const processedItems = redistributedItems.map(item => {
      if (item.timing === 'takeaway') {
        return {
          ...item,
          booking_id: lastBooking.id,
          timing: 'after' as const
        }
      }
      return item
    })
    
    // Process each redistributed item
    let skippedCount = 0
    for (const item of processedItems) {
      const targetBooking = bookings.find(b => b.id === item.booking_id)
      if (!targetBooking) continue
      
      // CHECK FOR DUPLICATES - don't add if product already exists
      const isDuplicate = 
        targetBooking.pre_drinks?.some((d: {product_id: string}) => d.product_id === item.product_id) ||
        targetBooking.during_drinks?.some((d: {product_id: string}) => d.product_id === item.product_id) ||
        targetBooking.after_drinks?.some((d: {product_id: string}) => d.product_id === item.product_id)
      
      if (isDuplicate) {
        skippedCount++
        continue // Skip this item, already in booking
      }
      
      // Initialize booking update if needed
      if (!bookingUpdates.has(item.booking_id)) {
        bookingUpdates.set(item.booking_id, {
          pre: [...(targetBooking.pre_drinks || [])],
          during: [...(targetBooking.during_drinks || [])],
          after: [...(targetBooking.after_drinks || [])]
        })
      }
      
      // Add drink to appropriate timing array (NO reason field!)
      const bookingUpdate = bookingUpdates.get(item.booking_id)!
      const drinkToAdd = {
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity
        // NO reason/rationale here!
      }
      
      if (item.timing === 'pre') bookingUpdate.pre.push(drinkToAdd)
      else if (item.timing === 'during') bookingUpdate.during.push(drinkToAdd)
      else if (item.timing === 'after') bookingUpdate.after.push(drinkToAdd)
    }
    
    // Execute all booking updates with enhanced explanations
    let successCount = 0
    for (const [bookingId, updates] of bookingUpdates) {
      const targetBooking = bookings.find(b => b.id === bookingId)
      
      // Build intelligent explanation based on what was added
      const addedDrinks = items.filter(item => 
        processedItems.some(ri => ri.product_id === item.item_id && ri.booking_id === bookingId)
      )
      
      const drinkSummary = addedDrinks.map(drink => {
        const timing = processedItems.find(ri => ri.product_id === drink.item_id)?.timing
        return `${drink.product_name} (${timing})`
      }).join(', ')
      
      const assessmentNote = `\n\n📊 Hydration Assessment: Added ${drinkSummary} based on micronutrient analysis and ${targetBooking?.experiences?.name} experience requirements.`
      const updatedExplanation = `${targetBooking?.booking_explanation || ''}${assessmentNote}`
      
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
    
    // Mark cart as claimed
    await supabase
      .from('cart_headers')
      .update({ 
        venue_claimed_at: new Date().toISOString(),
        venue_id: '20c2f440-9133-42ec-a8d6-6336e649ec4b'
      })
      .eq('id', cart_id)
    
    return NextResponse.json({
      success: true,
      itemsAdded: successCount,
      duplicatesSkipped: skippedCount,
      bookingsUpdated: bookingUpdates.size,
      totalDrinks: items.length,
      message: `Successfully redistributed ${successCount} drinks across ${bookingUpdates.size} booking(s). ${skippedCount} duplicate(s) skipped.`
    })
    
  } catch (error) {
    console.error('Error processing cart transfer:', error)
    return NextResponse.json({ 
      error: 'Failed to process transfer',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// ============= ENHANCED AI REDISTRIBUTION =============
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
      content: `You are an intelligent hydration coordinator with access to complete product and experience data.
      
      CRITICAL RULES:
      1. CHECK FOR DUPLICATES - Skip any product that already exists in bookings
      2. Use product TAGS to determine optimal timing:
         - "hydration/electrolytes/sweating" → during active experiences
         - "energy/focus/mental" → pre-experience preparation  
         - "recovery/gut/calming" → post-experience
      3. Use experience TAGS to understand context:
         - "standing/active" → needs more hydration during
         - "lying/relaxing" → less during, more after
         - "immersive/intense" → pre-preparation important
      4. Maximum ${maxDrinksPerHour} drinks per hour DURING active experiences
      5. ANYTHING that doesn't fit optimally in Pre/During → Place in LAST booking's After-drinks
      6. ALL drinks MUST be placed somewhere - nothing is left out
      
      Make intelligent decisions based on the rich product and experience context provided.
      
      Return JSON: {
        items: [
          {
            booking_id: "uuid",
            timing: "pre|during|after|takeaway",
            product_id: "uuid"
          }
        ]
      }
      
      Note: "takeaway" means place in the last booking's after_drinks slot.
      All drinks from the assessment MUST appear in the output - nothing should be omitted.`
    }, {
      role: "user" as const,
      content: JSON.stringify({
        // RICH DRINK CONTEXT
        assessment_drinks: cartItems.map(item => ({
          id: item.item_id,
          name: item.product_name,
          description: item.description,
          tags: item.tags || [],  // ["hydration", "energy", etc]
          category: item.category,  // "electrolyte sachet"
          quantity: item.qty,
          type: item.product_name.includes('Rite') || 
                item.product_name.includes('Humantra') ? 'sachet' : 'drink'
        })),
        
        // EXISTING PRODUCTS TO AVOID
        existing_products: Array.from(existingProducts),
        
        // RICH EXPERIENCE CONTEXT
        session_info: {
          total_hours: totalHours,
          max_drinks: maxDrinksTotal,
          bookings: bookings.map(b => ({
            booking_id: b.id,
            time: b.slot_time,
            duration_min: b.duration_minutes,
            
            // Experience intelligence
            experience: {
              name: b.experiences?.name,
              description: b.experiences?.description,
              tags: b.experiences?.tags || [],  // ["standing", "immersive", etc]
              duration: b.experiences?.duration_minutes,
              suggested_drinks: b.experiences?.pairings?.drinks || []
            },
            
            // Current state
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
  return (result.items || []).map((item: {booking_id: string; timing: string; product_id: string}) => ({
    booking_id: item.booking_id,
    timing: item.timing,
    product_id: item.product_id,
    name: cartItems.find(c => c.item_id === item.product_id)?.product_name || '',
    quantity: cartItems.find(c => c.item_id === item.product_id)?.qty || 1
  }))
}