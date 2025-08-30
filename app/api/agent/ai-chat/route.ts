import { NextRequest, NextResponse } from 'next/server'

// Simple AI chat without any database access
export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    
    // If OpenAI is not available, use a fallback response
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    
    if (!OPENAI_API_KEY) {
      // Fallback responses without OpenAI
      const lastMessage = messages[messages.length - 1].content.toLowerCase()
      
      let reply = "Welcome to The Water Bar's AOI Journey! "
      
      if (lastMessage.includes('drink') || lastMessage.includes('water')) {
        reply += "We offer premium alkaline water, electrolyte-enhanced hydration, and specialty drinks. Our signature Chaga mushroom water is known for its immune-boosting properties."
      } else if (lastMessage.includes('price') || lastMessage.includes('cost')) {
        reply += "Our drinks range from $3-8 depending on size and type. We also offer subscription plans for regular hydration needs."
      } else if (lastMessage.includes('location') || lastMessage.includes('venue')) {
        reply += "The Water Bar has multiple locations. Visit us for a personalized hydration experience!"
      } else if (lastMessage.includes('benefit') || lastMessage.includes('health')) {
        reply += "Our alkaline water helps balance pH levels, while our electrolyte drinks support optimal hydration and recovery."
      } else {
        reply += "How can I help you discover your perfect hydration journey today?"
      }
      
      return NextResponse.json({ reply })
    }
    
    // Use OpenAI if available
    const systemPrompt = `You are the AOI (Art of Implosion) Journey Guide for The Water Bar. 
    You help customers discover premium water and wellness drinks.
    
    Our offerings include:
    - Premium alkaline water (pH 9.5+)
    - Electrolyte-enhanced hydration
    - Chaga mushroom water (immune support)
    - Specialty wellness drinks
    - Custom hydration plans
    
    Be enthusiastic about hydration and wellness. Keep responses concise and helpful.`
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    })
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    return NextResponse.json({
      reply: data.choices[0].message.content
    })
    
  } catch (error) {
    console.error('AI Chat error:', error)
    
    // Fallback response on error
    return NextResponse.json({
      reply: "Welcome to The Water Bar! I'm here to help you discover our premium hydration options. What would you like to know about our drinks?"
    })
  }
}
