import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { messages, availableExperiences, availableSlots, userProfile } = await request.json()
    
    const supabase = createClient()
    
    // AOI venue context - automatically set for this website
    const venueContext = {
      venue_name: 'AOI',
      venue_id: 'aoi-venue-001',
      website: 'AOI Experience Platform',
      location: 'Art of Implosion x Johny Dar Experience'
    }
    
    // Get the latest user message
    const userMessage = messages[messages.length - 1]?.content || ''
    
    // Simple intent detection for booking requests
    const isBookingRequest = /book|schedule|reserve|appointment/i.test(userMessage)
    const isDrinkRequest = /drink|water|electrolyte|hydration/i.test(userMessage)
    const isExperienceQuery = /air|earth|dome|bed|experience/i.test(userMessage)
    
    let response = {
      message: '',
      recommendations: null as any
    }
    
    if (isBookingRequest && isExperienceQuery) {
      // Extract experience type from message
      let experienceType = ''
      if (/air/i.test(userMessage)) experienceType = 'air'
      if (/earth/i.test(userMessage)) experienceType = 'earth'
      if (/dome/i.test(userMessage)) experienceType = 'air'
      if (/bed/i.test(userMessage)) experienceType = 'earth'
      
      // Find matching experience
      const matchingExp = availableExperiences.find((exp: any) => 
        exp.name.toLowerCase().includes(experienceType)
      )
      
      if (matchingExp) {
        response.message = `Perfect! I found ${matchingExp.name} for AED ${matchingExp.price}. This ${matchingExp.duration_minutes}-minute experience is ideal for ${experienceType === 'air' ? 'energy activation and standing meditation' : 'deep relaxation and cellular rejuvenation'}.

Would you like me to add this to your cart? I can also recommend complementary drinks for optimal preparation and recovery.`
        
        response.recommendations = {
          experience: matchingExp.id,
          experienceData: matchingExp
        }
      } else {
        response.message = `I'd love to help you book an experience! We have ${availableExperiences.length} options available:

${availableExperiences.slice(0, 3).map((exp: any) => 
  `• ${exp.name} (${exp.duration_minutes}min) - AED ${exp.price}`
).join('\n')}

Which type interests you most - AIR (standing dome) or EARTH (lying bed)?`
      }
    } else if (isDrinkRequest) {
      response.message = `Great question about hydration! I can recommend drinks based on your session timing:

**Pre-session (30min before):**
• Electrolyte preparation for optimal absorption
• Light hydration to prime your system

**Post-session:**
• Recovery electrolytes to replenish
• Cellular hydration for integration

Do you have an experience booked, or would you like me to help you choose one first?`
    } else if (isExperienceQuery) {
      response.message = `Let me explain our experiences:

**AOI AIR (Standing Dome):**
• 528Hz frequency targeting energy pathways
• Standing immersion for active meditation
• 20-50min options available
• Ideal for energy boost and mental clarity

**AOI EARTH (Lying Bed):**
• Meridian activation with bio-photon field
• Full-body LED therapy for cellular rejuvenation
• 20-50min options available
• Perfect for deep relaxation and recovery

Which resonates with your current needs?`
    } else {
      // General welcome/help
      response.message = `Hello${userProfile?.name ? ` ${userProfile.name}` : ''}! I'm your AOI Journey Architect with cart integration powers.

I can help you:
• Choose the perfect experience (AIR or EARTH)
• Add complementary drinks with precise timing
• Build your complete transformation cart
• Book available time slots

What transformation are you seeking today?`
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('AI Journey Planner error:', error)
    return NextResponse.json(
      { 
        message: "I'm having trouble connecting right now. Let me help you manually select the perfect experience for your journey.",
        recommendations: null 
      },
      { status: 500 }
    )
  }
}
