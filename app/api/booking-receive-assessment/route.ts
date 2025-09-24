import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface DrinkRecommendation {
  product_id: string;
  name: string;
  quantity: number;
  timing: 'before' | 'during' | 'after';
  booking_id: string;
  reasoning: string;
}

export async function POST(request: NextRequest) {
  try {
    const { transferId, bookingId, customerEmail, staffId } = await request.json()
    const supabase = await createClient()
    
    // Fetch the transfer record
    const { data: transfer, error: transferError } = await supabase
      .from('cart_transfers')
      .select('*')
      .eq('id', transferId)
      .eq('status', 'pending')
      .single()
    
    if (transferError || !transfer) {
      return NextResponse.json({ error: 'Invalid or expired transfer' }, { status: 400 })
    }
    
    // Get ALL bookings for this customer for the day
    const today = new Date().toISOString().split('T')[0]
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        experiences (
          name,
          category
        )
      `)
      .eq('customer_email', customerEmail)
      .gte('slot_time', `${today}T00:00:00`)
      .lt('slot_time', `${today}T23:59:59`)
      .order('slot_time', { ascending: true })
    
    if (bookingsError || !bookings || bookings.length === 0) {
      return NextResponse.json({ error: 'No bookings found for today' }, { status: 404 })
    }
    
    // Get product details for assessment drinks
    const productIds = transfer.cart_items.map((item: any) => item.id)
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)
    
    // Resolve existing drink names for better AI context
    const enrichedBookings = await Promise.all(bookings.map(async (booking) => {
      const resolveDrinks = async (drinkIds: string[]) => {
        if (!drinkIds || drinkIds.length === 0) return []
        
        const { data: drinkProducts } = await supabase
          .from('products')
          .select('id, name, description, sodium_mg, potassium_mg, magnesium_mg, protein_g, volume_ml, water_content_ml, polyphenols_mg, vitamin_c_mg, bio_mechanisms, nutrient_profile')
          .in('id', drinkIds)
        
        return drinkIds.map(id => {
          const product = drinkProducts?.find(p => p.id === id)
          return {
            product_id: id,
            name: product?.name || 'Unknown',
            description: product?.description || '',
            sodium_mg: product?.sodium_mg || 0,
            potassium_mg: product?.potassium_mg || 0,
            magnesium_mg: product?.magnesium_mg || 0,
            protein_g: product?.protein_g || 0,
            volume_ml: product?.volume_ml || 0,
            water_content_ml: product?.water_content_ml || 0,
            polyphenols_mg: product?.polyphenols_mg || 0,
            vitamin_c_mg: product?.vitamin_c_mg || 0,
            bio_mechanisms: product?.bio_mechanisms || {},
            nutrient_profile: product?.nutrient_profile || {}
          }
        })
      }

      const [resolvedPre, resolvedDuring, resolvedAfter] = await Promise.all([
        resolveDrinks(booking.pre_drinks || []),
        resolveDrinks(booking.during_drinks || []),
        resolveDrinks(booking.after_drinks || [])
      ])

      return {
        ...booking,
        resolved_pre_drinks: resolvedPre,
        resolved_during_drinks: resolvedDuring,
        resolved_after_drinks: resolvedAfter
      }
    }))

    // AI-powered redistribution with enriched data
    const redistributedDrinks = await aiRedistributeDrinks(
      transfer.cart_items,
      enrichedBookings,
      products || [],
      transfer.assessment_data
    )
    
    // Update bookings with new drinks and explanations
    let itemsAdded = 0
    const bookingsUpdated = new Set()
    
    for (const drink of redistributedDrinks) {
      const targetBooking = bookings.find(b => b.id === drink.booking_id)
      if (!targetBooking) continue
      
      const drinkField = drink.timing === 'before' ? 'pre_drinks' :
                        drink.timing === 'during' ? 'during_drinks' : 'after_drinks'
      
      const currentDrinks = targetBooking[drinkField] || []
      
      // Check if drink already exists
      const existingDrink = currentDrinks.find((d: any) => d.product_id === drink.product_id)
      
      if (!existingDrink) {
        const updatedDrinks = [...currentDrinks, {
          product_id: drink.product_id,
          name: drink.name,
          quantity: drink.quantity,
          reason: drink.reasoning
        }]
        
        // Update booking explanation with AI reasoning
        const currentExplanation = targetBooking.booking_explanation || ''
        const newExplanation = currentExplanation + 
          `\n\n[Assessment Integration] ${drink.reasoning}`
        
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ 
            [drinkField]: updatedDrinks,
            booking_explanation: newExplanation
          })
          .eq('id', drink.booking_id)
        
        if (!updateError) {
          itemsAdded++
          bookingsUpdated.add(drink.booking_id)
        }
      }
    }
    
    // Mark transfer as completed
    await supabase
      .from('cart_transfers')
      .update({ 
        status: 'completed',
        processed_by: staffId,
        processed_at: new Date().toISOString()
      })
      .eq('id', transferId)
    
    return NextResponse.json({ 
      success: true, 
      itemsAdded,
      bookingsUpdated: bookingsUpdated.size,
      message: `Successfully redistributed drinks across ${bookingsUpdated.size} bookings`
    })
    
  } catch (error) {
    console.error('Error processing booking assessment:', error)
    return NextResponse.json({ error: 'Failed to process assessment' }, { status: 500 })
  }
}

async function aiRedistributeDrinks(
  cartItems: any[],
  bookings: any[],
  products: any[],
  assessmentData: any
): Promise<DrinkRecommendation[]> {
  
  const prompt = `You are an expert wellness consultant redistributing hydration products across a customer's wellness experiences.

CUSTOMER'S BOOKINGS TODAY (Structured JSON):
${JSON.stringify(bookings.map(b => ({
  booking_id: b.id,
  experience_name: b.experiences?.name || 'Unknown',
  experience_category: b.experiences?.category || 'Unknown',
  slot_time: b.slot_time,
  duration_minutes: b.duration_minutes,
  booking_status: b.booking_status,
  existing_explanation: b.booking_explanation || '',
  current_drinks: {
    pre_drinks: b.resolved_pre_drinks || [],
    during_drinks: b.resolved_during_drinks || [],
    after_drinks: b.resolved_after_drinks || []
  }
})), null, 2)}

ASSESSMENT PRODUCTS TO DISTRIBUTE:
${cartItems.map((item, i) => `
${i + 1}. ${item.name} (ID: ${item.id})
   Quantity: ${item.quantity || 1}
   Properties: ${JSON.stringify(products.find(p => p.id === item.id) || {})}
`).join('')}

ASSESSMENT DATA:
${JSON.stringify(assessmentData || {}, null, 2)}

CONTEXT: The QR code contains assessment products from a comprehensive Water Bar AI analysis that calculated:
- Total body water requirements for the day
- Specific micronutrient deficits (sodium, potassium, magnesium, etc.)
- Optimal hydration timing across their planned activities
- Personalized product recommendations to correct these deficits

These assessment products are NOT random suggestions - they are deficit-correction prescriptions based on the customer's physiology and planned experiences.

TASK: Intelligently redistribute these deficit-correcting products across the customer's experiences, considering:

1. EXISTING DRINK LOGIC: The current drinks were placed for specific physiological reasons (see explanations). Understand WHY they're there before changing anything.

2. DEFICIT ADDRESSING: The assessment products target specific micronutrient/hydration deficits. Ensure these deficits are addressed optimally across the experience timeline.

3. TOTAL FLUID BALANCE: Consider realistic fluid intake - maximum 2 drinks per hour across all sessions + takeaway sachets for later consumption.

4. EXPERIENCE SYNERGY: Match products to experience physiology (sodium before heat, potassium after, etc.) while respecting existing placements.

5. SMART REPLACEMENT: If assessment products serve the same purpose as existing drinks but better address deficits, consider replacement rather than addition.

INSTRUCTIONS:
- If existing drinks already address the deficit adequately, consider placing assessment products as takeaway
- When multiple deficits exist, choose the most critical deficit-correcting product rather than trying to address all deficits with multiple drinks
- You have THREE strategic options for deficit correction:
  1. ADD assessment product alongside existing drinks (if both serve different purposes)
  2. REPLACE existing drink with assessment product (if assessment product addresses multiple deficits better)
  3. MOVE existing drink to different timing and place assessment product in optimal slot
- Always explain your reasoning in terms of deficit correction and experience optimization
- Remember: Assessment products are prescriptions, not preferences - prioritize deficit correction over convenience

Return a JSON array of recommendations with this exact structure:
[
  {
    "product_id": "product_uuid",
    "name": "Product Name", 
    "quantity": 1,
    "timing": "before|during|after",
    "booking_id": "booking_uuid",
    "reasoning": "Detailed explanation focusing on deficit correction, existing drink logic, and optimal placement",
    "action": "add|replace",
    "replaces_product_id": "uuid_if_replacing"
  }
]

Focus on deficit correction while respecting existing physiological logic.`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2000
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No AI response')

    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON found in AI response')

    const recommendations: DrinkRecommendation[] = JSON.parse(jsonMatch[0])
    
    // Validate recommendations
    return recommendations.filter(rec => 
      rec.product_id && 
      rec.booking_id && 
      ['before', 'during', 'after'].includes(rec.timing) &&
      bookings.some(b => b.id === rec.booking_id)
    )
    
  } catch (error) {
    console.error('AI redistribution failed:', error)
    
    // Fallback: simple distribution
    const fallbackRecommendations: DrinkRecommendation[] = []
    
    cartItems.forEach((item, index) => {
      const bookingIndex = index % bookings.length
      const targetBooking = bookings[bookingIndex]
      
      fallbackRecommendations.push({
        product_id: item.id,
        name: item.name,
        quantity: item.quantity || 1,
        timing: 'during',
        booking_id: targetBooking.id,
        reasoning: 'Distributed evenly across experiences (AI fallback)'
      })
    })
    
    return fallbackRecommendations
  }
}
