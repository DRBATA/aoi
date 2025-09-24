import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { cart_id, session_id, customer_email, items, assessment_data } = await request.json()
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
    const redistributedItems = await redistributeDrinks(
      items,
      bookings,
      assessment_data
    )
    
    // Update each booking with new items, checking existing drinks
    const updates = []
    for (const item of redistributedItems) {
      const targetBooking = bookings.find(b => b.id === item.booking_id)
      if (!targetBooking) continue
      
      // Check if item already exists in pre/during/after drinks
      const existingPre = targetBooking.pre_drinks?.some((d: any) => d.product_id === item.product_id)
      const existingDuring = targetBooking.during_drinks?.some((d: any) => d.product_id === item.product_id)
      const existingAfter = targetBooking.after_drinks?.some((d: any) => d.product_id === item.product_id)
      
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

async function redistributeDrinks(
  cartItems: any[],
  bookings: any[],
  assessmentData: any
): Promise<any[]> {
  // Sort bookings by time
  const sortedBookings = bookings.sort((a, b) => 
    new Date(a.slot_time).getTime() - new Date(b.slot_time).getTime()
  )
  
  const redistributed = []
  
  for (const item of cartItems) {
    // Determine optimal timing based on product type and experience
    let bestPlacement = null
    
    // High sodium (celery) → before sauna/heat experiences
    if (item.name?.includes('Celery') || item.name?.includes('SoSodium') || item.na_mg > 100) {
      const heatExperience = sortedBookings.find(b => 
        b.experiences?.name?.toLowerCase().includes('sauna') ||
        b.experiences?.name?.toLowerCase().includes('float') ||
        b.experiences?.name?.toLowerCase().includes('air')
      )
      if (heatExperience) {
        bestPlacement = {
          booking_id: heatExperience.id,
          timing: 'before',
          rationale: 'Sodium pre-loading for heat experience'
        }
      }
    }
    
    // Coconut water → after hot activities
    else if (item.name?.includes('Coconut') || item.name?.includes('Once Upon')) {
      const heatExperience = sortedBookings.find(b => 
        b.experiences?.name?.toLowerCase().includes('sauna') ||
        b.experiences?.name?.toLowerCase().includes('float') ||
        b.experiences?.name?.toLowerCase().includes('earth')
      )
      if (heatExperience) {
        bestPlacement = {
          booking_id: heatExperience.id,
          timing: 'after',
          rationale: 'Potassium replenishment post-heat'
        }
      }
    }
    
    // Protein (kefir) → post-workout or any intensive experience
    else if (item.protein_g > 5 || item.name?.includes('Kefir')) {
      const intensiveExperience = sortedBookings.find(b => 
        b.experiences?.name?.toLowerCase().includes('hiit') ||
        b.experiences?.name?.toLowerCase().includes('gym') ||
        b.experiences?.name?.toLowerCase().includes('air')
      )
      if (intensiveExperience) {
        bestPlacement = {
          booking_id: intensiveExperience.id,
          timing: 'after',
          rationale: 'Protein for recovery'
        }
      }
    }
    
    // Default: distribute evenly across bookings
    if (!bestPlacement) {
      const bookingIndex = redistributed.filter(r => 
        r.product_id === item.id
      ).length % sortedBookings.length
      
      bestPlacement = {
        booking_id: sortedBookings[bookingIndex].id,
        timing: 'during',
        rationale: 'Balanced hydration throughout experience'
      }
    }
    
    redistributed.push({
      ...bestPlacement,
      product_id: item.id,
      name: item.name,
      quantity: item.quantity || 1
    })
  }
  
  return redistributed
}
