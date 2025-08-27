"use client"

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X, ChevronDown, Sparkles, Zap, Brain, Award, Users, Clock } from 'lucide-react'
import ShaderBackground from '@/components/shader-background'
import FloatingPaths from "@/components/kokonutui/floating-paths"
import { createClient } from '@/lib/supabase/client'
import { Room, RoomEvent } from 'livekit-client'
import useConnectionDetails from '@/hooks/useConnectionDetails'
import LiveKitChat from '@/components/LiveKitChat'

// AI Journey Chat Modal Component
function AIJourneyChatModal({ onClose }: { onClose: () => void }) {
  const { connectionDetails, isLoading, error } = useConnectionDetails();

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-b from-purple-950/90 to-black/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-white/80">Connecting to AI Journey Guide...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-b from-purple-950/90 to-black/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 max-w-md"
        >
          <div className="flex flex-col items-center gap-4">
            <X className="w-12 h-12 text-red-400" />
            <p className="text-white/80 text-center">Unable to connect to AI agent</p>
            <p className="text-white/60 text-sm text-center">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!connectionDetails) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-b from-purple-950/90 to-black/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-xl font-light text-white">AI Journey Guide</h3>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <LiveKitChat connectionDetails={connectionDetails} onClose={onClose} />
        </div>
      </motion.div>
    </div>
  );
}

export default function LandingPage() {
  const [selectedVenue, setSelectedVenue] = useState("dubai")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('science')
  const [savedUsername, setSavedUsername] = useState('')
  const [realExperiences, setRealExperiences] = useState<Array<{id: string, name: string, price: number, duration_minutes: number}>>([])
  const [selectedBookingExperience, setSelectedBookingExperience] = useState("")
  const [bookingDate, setBookingDate] = useState("")
  const [bookingTime, setBookingTime] = useState("")
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const [aiMessages, setAiMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [userInput, setUserInput] = useState("")
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [activeBookingMode, setActiveBookingMode] = useState<'quick_order' | 'profile_build'>('quick_order')
  const [userMode, setUserMode] = useState<'anonymous' | 'authenticated'>('anonymous')
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [room, setRoom] = useState<Room | null>(null)
  const supabase = createClient()

  const experiences = [
    {
      id: "aoi-air",
      name: "AOI AIR",
      description: "Standing light & sound shower with 10 LED panels for movement-based release",
      icon: "✨",
      duration: "20 min",
      benefits: ["Energy boost", "Mental clarity", "Posture alignment"],
      color: "from-purple-400 to-pink-400"
    },
    {
      id: "aoi-air-pro",
      name: "AOI AIR PRO",
      description: "Enhanced standing experience with premium light & sound protocols",
      icon: "⭐",
      duration: "20 min",
      benefits: ["Peak performance", "Advanced healing", "Optimal alignment"],
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "aoi-air-extended",
      name: "AOI AIR Extended",
      description: "Extended standing session for deeper transformation",
      icon: "✨",
      duration: "50 min",
      benefits: ["Deep transformation", "Extended healing", "Complete alignment"],
      color: "from-purple-400 via-pink-400 to-cyan-400"
    },
    {
      id: "aoi-bed",
      name: "AOI BED",
      description: "Full-body light immersion with vibration for deep cellular rejuvenation",
      icon: "🛸",
      duration: "60 min",
      benefits: ["Deep relaxation", "Energy retention", "Cellular repair"],
      color: "from-blue-400 to-cyan-400"
    },
    {
      id: "aoi-earth",
      name: "AOI EARTH",
      description: "Grounding comfort session for profound relaxation",
      icon: "🌍",
      duration: "45 min",
      benefits: ["Stress relief", "Grounding", "Balance"],
      color: "from-green-400 to-emerald-400"
    },
    {
      id: "aoi-float",
      name: "AOI FLOAT",
      description: "30-minute flotation tank for deep relaxation and toxin expulsion",
      icon: "🌊",
      duration: "30 min",
      benefits: ["Deep relaxation", "Detoxification", "Muscle recovery"],
      color: "from-cyan-400 to-blue-400"
    }
  ]

  const venues = [
    { id: "dubai", name: "Dubai", location: "The Johny Dar Experience", address: "Al Quoz" },
    { id: "berlin", name: "Berlin", location: "ORGÆNIC Salon", address: "Berliner Freiheit" },
    { id: "ibiza", name: "Ibiza", location: "Coming Soon", address: "" },
    { id: "costa-rica", name: "Costa Rica", location: "Coming Soon", address: "" }
  ]

  // Fetch real experiences from Supabase
  useEffect(() => {
    const fetchExperiences = async () => {
      const { data } = await supabase
        .from('venue_experiences')
        .select(`
          experiences(id, name, price, duration_minutes)
        `)
        .eq('venue_id', '20c2f440-9133-42ec-a8d6-6336e649ec4b') // AOI venue ID
        .eq('is_available', true)
      
      if (data) {
        const experiences = data
          .filter(item => item.experiences)
          .map(item => {
            const exp = Array.isArray(item.experiences) ? item.experiences[0] : item.experiences;
            if (!exp) return null;
            return {
              id: exp.id,
              name: exp.name,
              price: exp.price,
              duration_minutes: exp.duration_minutes
            };
          })
          .filter((exp): exp is {id: string, name: string, price: number, duration_minutes: number} => exp !== null)
        setRealExperiences(experiences)
      }
    }
    fetchExperiences()
  }, [supabase])

  // Generate available time slots based on existing bookings
  const generateAvailableSlots = useCallback(async (date: string, experienceId: string) => {
    if (!date || !experienceId) return []
    
    setLoadingSlots(true)
    
    try {
      // Get selected experience duration
      const selectedExp = realExperiences.find(exp => exp.id === experienceId)
      const duration = selectedExp?.duration_minutes || 30
      
      // Fetch existing bookings for the date and experience
      const { data: existingBookings } = await supabase
        .from('cart_items')
        .select(`
          booking_metadata,
          booking_status
        `)
        .eq('item_type', 'booking')
        .eq('item_id', experienceId)
        .in('booking_status', ['pending', 'confirmed', 'checked-in', 'active'])
      
      // Extract booked time slots
      const bookedSlots = existingBookings
        ?.filter(booking => 
          booking.booking_metadata?.date === date
        )
        .map(booking => ({
          time: booking.booking_metadata.time,
          duration: booking.booking_metadata.duration_minutes || 30
        })) || []
      
      // Generate all possible 15-minute slots from 9 AM to 9 PM
      const allSlots: string[] = []
      for (let hour = 9; hour < 21; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          allSlots.push(timeString)
        }
      }
      
      // Filter out unavailable slots (with 10-minute buffer)
      const availableSlots = allSlots.filter(slot => {
        const [slotHour, slotMinute] = slot.split(':').map(Number)
        const slotStart = slotHour * 60 + slotMinute
        const slotEnd = slotStart + duration
        
        return !bookedSlots.some(booked => {
          const [bookedHour, bookedMinute] = booked.time.split(':').map(Number)
          const bookedStart = bookedHour * 60 + bookedMinute - 10 // 10-min buffer before
          const bookedEnd = bookedStart + booked.duration + 20 // 10-min buffer after
          
          // Check if slot overlaps with booked time (including buffers)
          return (slotStart < bookedEnd && slotEnd > bookedStart)
        })
      })
      
      // AI-powered time suggestions: prioritize optimal times
      const suggestedSlots = availableSlots.sort((a, b) => {
        const [aHour] = a.split(':').map(Number)
        const [bHour] = b.split(':').map(Number)
        
        // Priority order: 10-12 AM (morning energy), 2-4 PM (afternoon clarity), 6-8 PM (evening wind-down)
        const getTimePriority = (hour: number) => {
          if (hour >= 10 && hour < 12) return 1 // Morning priority
          if (hour >= 14 && hour < 16) return 2 // Afternoon priority  
          if (hour >= 18 && hour < 20) return 3 // Evening priority
          return 4 // Other times
        }
        
        return getTimePriority(aHour) - getTimePriority(bHour)
      })
      
      setAvailableTimeSlots(suggestedSlots)
      return suggestedSlots
    } catch (error) {
      console.error('Error generating time slots:', error)
      return []
    } finally {
      setLoadingSlots(false)
    }
  }, [supabase, realExperiences])

  // Update available slots when date or experience changes
  useEffect(() => {
    if (bookingDate && selectedBookingExperience) {
      generateAvailableSlots(bookingDate, selectedBookingExperience)
    } else {
      setAvailableTimeSlots([])
    }
  }, [bookingDate, selectedBookingExperience, generateAvailableSlots])

  // Handle AI chat interaction via LiveKit agent
  const handleAiChat = async () => {
    if (!userInput.trim() || isAiThinking) return
    
    const newMessage = { role: 'user' as const, content: userInput }
    setAiMessages(prev => [...prev, newMessage])
    const currentInput = userInput
    setUserInput('')
    setIsAiThinking(true)
    
    try {
      // Connect to LiveKit agent if not already connected
      if (!room) {
        await initializeLiveKitConnection()
      }
      
      // Send message to agent with context for MCP functions
      if (room) {
        await room.localParticipant.publishData(
          new TextEncoder().encode(JSON.stringify({
            type: 'aoi_chat_message',
            content: currentInput,
            userContext: {
              name: guestName || savedUsername,
              email: guestEmail,
              bookingMode: activeBookingMode,
              selectedExperience: selectedBookingExperience,
              bookingDate,
              bookingTime,
              userMode,
              venue: 'AOI'
            },
            requestContext: true // Ask agent to get user journey context via MCP
          })),
          { reliable: true }
        )
      } else {
        throw new Error('LiveKit connection not available')
      }
      
    } catch (error) {
      console.error('AI message error:', error)
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting to the AI agent right now. Please try again in a moment."
      }])
      setIsAiThinking(false)
    }
  }

  // Save username to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('aoi-username')
    if (saved) setSavedUsername(saved)
  }, [])
  
  useEffect(() => {
    if (savedUsername) {
      localStorage.setItem('aoi-username', savedUsername)
    }
  }, [savedUsername])

  // Handle booking form submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedBookingExperience || !bookingDate || !bookingTime || !guestName) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const selectedExp = realExperiences.find(exp => exp.id === selectedBookingExperience)
      if (!selectedExp) {
        alert('Selected experience not found')
        return
      }

      // Check if user has existing active cart to merge with
      let cartId: string
      const { data: existingCart } = await supabase
        .from('cart_headers')
        .select('id, total_amount')
        .eq('customer_name', guestName)
        .eq('status', 'active')
        .maybeSingle()

      if (existingCart) {
        // Merge with existing cart
        cartId = existingCart.id
        
        // Update total amount
        await supabase
          .from('cart_headers')
          .update({
            total_amount: (existingCart.total_amount || 0) + selectedExp.price
          })
          .eq('id', cartId)
      } else {
        // Create new cart
        const { data: cartData, error: cartError } = await supabase
          .from('cart_headers')
          .insert({
            customer_name: guestName,
            customer_email: guestEmail || null,
            venue_id: '20c2f440-9133-42ec-a8d6-6336e649ec4b',
            status: 'active',
            total_amount: selectedExp.price,
            payment_method: 'venue'
          })
          .select()
          .single()

        if (cartError) throw cartError
        cartId = cartData.id
      }

      // Add the booking item to cart
      const { error: itemError } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          item_type: 'booking',
          item_id: selectedBookingExperience,
          quantity: 1,
          unit_price: selectedExp.price,
          total_price: selectedExp.price,
          booking_status: 'pending',
          booking_metadata: {
            date: bookingDate,
            time: bookingTime,
            duration_minutes: selectedExp.duration_minutes,
            experience_name: selectedExp.name
          }
        })

      if (itemError) throw itemError

      const cartMessage = existingCart 
        ? `Added ${selectedExp.name} to your cart! Continue adding more items or checkout when ready.`
        : `${selectedExp.name} added to cart for ${bookingDate} at ${bookingTime}. You can add more experiences or drinks before checkout.`
      
      alert(cartMessage)
      
      // Reset form for next booking
      setSelectedBookingExperience('')
      setBookingTime('')
      
      // TODO: Show cart preview or redirect to checkout
    } catch (error) {
      console.error('Booking error:', error)
      alert('There was an error processing your booking. Please try again.')
    }
  }


  // QR + AI Journey Planning Agent with Location Context
  // const startAIJourney = (orderSource: string = 'main-booking', qrToken?: string) => {
  //   const locationContext = detectLocationContext(orderSource)
  //   
  //   // QR scan provides precise location context
  //   if (qrToken) {
  //     // Agent gets WHO + WHERE + WHEN + WHAT THEY'RE DOING
  //     initializeQRContext(qrToken, locationContext, guestName)
  //     setShowAIChat(true) // Show chat for QR context
  //   } else {
  //     setShowAIChat(true) // Fallback to chat
  //     const contextualMessage = getContextualWelcome(locationContext)
  //     setAiMessages([{
  //       role: 'assistant' as const,
  //       content: contextualMessage
  //     }])
  //   }
  //   
  //   // Trigger context initialization in AI agent
  //   initializeAIContext(locationContext, guestName)
  // }






  // const handlePyramidOptionClick = (key: string) => {
  //   console.log('Pyramid Option Click:', key)
  //   
  //   if (key === 'remind') {
  //     // Set reminder logic
  //     console.log('Setting reminder...')
  //     setShowAIChat(false)
  //     window.location.href = '#booking';
  //   } else if (key === 'electrolyte' || key === 'water') {
  //     // Alternative drink option
  //     handlePyramidApexClick('dispense', key)
  //   } else if (key === 'ai_guide') {
  //     // Switch to AI chat
  //     setShowAIChat(true)
  //   }
  // }



  const initializeLiveKitConnection = async () => {
    try {
      const response = await fetch('/api/livekit-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: guestName || 'anonymous' })
      })
      
      const { token, url } = await response.json()
      const newRoom = new Room()
      
      // Handle agent responses
      newRoom.on(RoomEvent.DataReceived, (payload, participant) => {
        if (participant?.isAgent) {
          try {
            const data = JSON.parse(new TextDecoder().decode(payload))
            
            if (data.type === "aoi_chat_response") {
              setAiMessages(prev => [...prev, {
                role: 'assistant',
                content: data.content
              }])
              setIsAiThinking(false)
              
              // Handle booking confirmations from agent
              if (data.bookingCreated) {
                setAiMessages(prev => [...prev, {
                  role: 'assistant',
                  content: `✅ Perfect! I've created your booking. Would you like me to add any complementary drinks or adjust the timing?`
                }])
              }
              
              // Handle drink recommendations
              if (data.drinksAdded) {
                setAiMessages(prev => [...prev, {
                  role: 'assistant',
                  content: `🥤 I've also added hydration recommendations based on your experience. Check the staff dashboard - they'll have everything ready for you!`
                }])
              }
            }
          } catch (e) {
            console.error('Error parsing agent response:', e)
            setIsAiThinking(false)
          }
        }
      })

      await newRoom.connect(url, token)
      setRoom(newRoom)
      
    } catch (error) {
      console.error('Failed to initialize LiveKit connection:', error)
      throw error
    }
  }

  return (
    <div className="relative bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-light text-white tracking-wider">AOI</div>
              <div className="text-xs text-white/60 tracking-widest">ART OF IMPLOSION</div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="#home" className="text-white/70 hover:text-white transition-colors">Home</Link>
              <Link href="#how-it-works" className="text-white/70 hover:text-white transition-colors">Technology</Link>
              <Link href="#experiences" className="text-white/70 hover:text-white transition-colors">Experiences</Link>
              <Link href="#booking" className="text-white/70 hover:text-white transition-colors">Book Session</Link>
              <Link href="#contact" className="text-white/70 hover:text-white transition-colors">Contact</Link>
            </div>
            
            {/* Desktop CTA */}
            <div className="hidden md:block">
              <Link href="#booking" className="px-6 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white text-sm hover:bg-white/20 transition-all">
                Book AOI Session
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 z-40"
          >
            <div className="px-4 py-6 space-y-4">
              <Link 
                href="#home" 
                className="block text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="#how-it-works" 
                className="block text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Technology
              </Link>
              <Link 
                href="#experiences" 
                className="block text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Experiences
              </Link>
              <Link 
                href="#booking" 
                className="block text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Session
              </Link>
              <Link 
                href="#contact" 
                className="block text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="border-t border-white/10 pt-4">
                <Link 
                  href="/udash" 
                  className="block text-purple-400 hover:text-purple-300 transition-colors py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Staff Dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section with Shader Background */}
      <section id="home">
      <ShaderBackground>
        <div className="absolute inset-0 z-20 pointer-events-none">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
        
        <div className="min-h-screen flex flex-col items-center justify-center px-4 relative z-30 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-5xl md:text-7xl font-light text-white mb-4">
                Redefine your well-being
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent font-medium">
                  in one session
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              AOI combines synchronized 528 Hz light and sound therapy for 360° cellular rejuvenation.
              Experience the future of wellness through biophotonic technology.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Link href="#booking" className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-medium hover:scale-105 transition-transform shadow-2xl inline-block">
                Book Your Session
              </Link>
              <Link href="#how-it-works" className="px-8 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white font-medium hover:bg-white/20 transition-all inline-block">
                Learn More
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="flex items-center justify-center gap-2 text-white/60"
            >
              <span className="text-sm">Scroll to explore</span>
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </motion.div>
          </motion.div>
        </div>
      </ShaderBackground>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 bg-gradient-to-b from-black to-purple-950/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
              How <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">AOI</span> Works
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Delivering nutrients in the form of photons directly to your DNA
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {[
              { id: 'science', label: 'The Science', icon: <Brain className="w-4 h-4" /> },
              { id: 'technology', label: 'Technology', icon: <Zap className="w-4 h-4" /> },
              { id: 'benefits', label: 'Benefits', icon: <Award className="w-4 h-4" /> },
              { id: 'founder', label: 'Founder', icon: <Users className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-w-4xl mx-auto">
            {activeTab === 'science' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid md:grid-cols-3 gap-6"
              >
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <Sparkles className="w-8 h-8 text-purple-400 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-3">528 Hz Frequency</h3>
                  <p className="text-white/60 text-sm">The love frequency that resonates with DNA repair and transformation</p>
                </div>
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <Brain className="w-8 h-8 text-cyan-400 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-3">Biophotonic Field</h3>
                  <p className="text-white/60 text-sm">Light patterns targeting energetic pathways for cellular communication</p>
                </div>
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <Zap className="w-8 h-8 text-pink-400 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-3">360° Cell Rejuvenation</h3>
                  <p className="text-white/60 text-sm">Synchronized sound and light frequencies for maximum cellular absorption</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'technology' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-medium text-white mb-4">AOI AIR - Light & Sound Shower</h3>
                  <p className="text-white/60 mb-4">Standing device with 10 LED panels for movement-based release. Bodies naturally gravitate towards bodily expression, enabling release of mental and emotional patterns.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300">10 LED Panels</span>
                    <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300">Interactive Release</span>
                    <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300">Movement Based</span>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-medium text-white mb-4">AOI BED - Light & Sound Bed</h3>
                  <p className="text-white/60 mb-4">Comfortable relaxation experience like a solarium. Subwoofer installed on lower glass surface induces vibrations throughout the user&apos;s entire body for energy retention.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-cyan-500/20 rounded-full text-xs text-cyan-300">Full Body Vibration</span>
                    <span className="px-3 py-1 bg-cyan-500/20 rounded-full text-xs text-cyan-300">Energy Retention</span>
                    <span className="px-3 py-1 bg-cyan-500/20 rounded-full text-xs text-cyan-300">Solarium Style</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'benefits' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <Award className="w-8 h-8 text-yellow-400 mb-4" />
                  <h3 className="text-xl font-medium text-white mb-4">Nobel Prize Science</h3>
                  <p className="text-white/60 mb-4">Low Level Light Therapy (LLLT) - Nobel Prize 1903 Niels Ryberg Finsen for treating diseases with concentrated light. Over 4,000 scientific studies since 1967.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                    <h4 className="text-lg font-medium text-white mb-2">Mental Health</h4>
                    <p className="text-white/60 text-sm">Treats depression, anxiety, PTSD, substance abuse, traumatic brain injury</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                    <h4 className="text-lg font-medium text-white mb-2">Brain Function</h4>
                    <p className="text-white/60 text-sm">Boosts brain function, improves mental health, enhances cognitive performance</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                    <h4 className="text-lg font-medium text-white mb-2">Physical Recovery</h4>
                    <p className="text-white/60 text-sm">Enhanced muscle recovery, improved circulation, cellular rejuvenation</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                    <h4 className="text-lg font-medium text-white mb-2">Overall Wellness</h4>
                    <p className="text-white/60 text-sm">Stress relief, improved sleep, enhanced mood, increased energy</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'founder' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
              >
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <Users className="w-16 h-16 text-white" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-medium text-white mb-2">Johny Dar</h3>
                    <p className="text-purple-400 mb-4">Founder & Creator of AOI</p>
                    <p className="text-white/60 mb-4">
                      Multi-talented artist, designer, musician, philanthropist, and inventor. 
                      Fashion designer since 1999, launched Johny Wonder label. 
                      Driven to chase dreams and passionate about realization.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300">Artist</span>
                      <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300">Designer</span>
                      <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300">Inventor</span>
                      <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300">Philanthropist</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'ai-guide' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
              >
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center mb-4">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-medium text-white mb-2">AI Journey Guide</h3>
                  <p className="text-cyan-400 mb-4">Personalized guidance for your transformation</p>
                </div>
                
                {/* Username Input */}
                <div className="mb-6">
                  <label className="text-white/70 text-sm mb-2 block">Your Name (saved locally)</label>
                  <input 
                    placeholder="Enter your name..." 
                    value={savedUsername}
                    onChange={(e) => setSavedUsername(e.target.value)}
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40" 
                  />
                  <p className="text-white/40 text-xs mt-2">Stored locally - only email needed to unlock your profile</p>
                </div>

                {/* AI Chat Interface */}
                <div className="bg-black/20 rounded-xl p-6 mb-6 min-h-[300px]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium">AOI Guide</span>
                    <span className="text-green-400 text-xs">● Online</span>
                  </div>
                  
                  <div className="space-y-4 mb-4 max-h-48 overflow-y-auto">
                    {aiMessages.length === 0 ? (
                      <div className="text-white/60 text-sm">
                        👋 Hello! I&apos;m your AOI Journey Guide. I understand where you are in your booking process and can provide personalized recommendations based on your needs.
                        <br /><br />
                        I can help with:
                        <br />• Experience recommendations
                        <br />• Guided meditation preparation
                        <br />• Understanding your transformation goals
                        <br />• Booking assistance
                      </div>
                    ) : (
                      aiMessages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {msg.role === 'assistant' && (
                            <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                              <Brain className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <div className={`max-w-xs p-3 rounded-lg text-sm ${
                            msg.role === 'user' 
                              ? 'bg-purple-500/20 text-white ml-auto' 
                              : 'bg-white/10 text-white/90'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <input 
                      placeholder="Ask about experiences, preparation, or your journey..." 
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm" 
                      onKeyPress={(e) => e.key === 'Enter' && !isAiThinking && userInput.trim() && handleAiChat()}
                    />
                    <button 
                      onClick={handleAiChat}
                      disabled={isAiThinking || !userInput.trim()}
                      className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-white font-medium hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isAiThinking ? '...' : 'Send'}
                    </button>
                  </div>
                </div>

                {/* Audio Dock */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">Guided Meditation</h4>
                    <span className="text-white/40 text-xs">Preparation Audio</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 5v10l8-5-8-5z" />
                      </svg>
                    </button>
                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full" style={{width: '0%'}}></div>
                    </div>
                    <span className="text-white/60 text-xs">0:00 / 5:30</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Experiences Section */}
      <section id="experiences" className="py-24 px-4 bg-gradient-to-b from-purple-950/20 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
              Choose Your <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Experience</span>
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Each AOI session is designed to target specific wellness goals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => setSelectedBookingExperience(exp.id)}
                className="relative bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${exp.color} opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl`}
                />
                
                <div className="relative z-10">
                  <div className="text-4xl mb-4">{exp.icon}</div>
                  <h3 className="text-xl font-medium text-white mb-2">{exp.name}</h3>
                  <p className="text-white/60 text-sm mb-4">{exp.description}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-white/40" />
                    <span className="text-white/40 text-sm">{exp.duration}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {exp.benefits.map((benefit) => (
                      <span key={benefit} className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/70">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="py-24 px-4 bg-gradient-to-b from-black to-purple-950/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-light text-white">Reserve Your Transformation</h3>
              <button
                onClick={() => setShowAIChat(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-sm hover:scale-105 transition-transform"
              >
                <Brain className="w-4 h-4" />
                AI Journey Planner
              </button>
            </div>
            
            {/* Venue Selection */}
            <div className="mb-8">
              <label className="text-white/70 text-sm mb-3 block">Select Location</label>
              <div className="grid grid-cols-2 gap-3">
                {venues.map((venue) => (
                  <button
                    key={venue.id}
                    onClick={() => setSelectedVenue(venue.id)}
                    className={`p-4 rounded-xl border transition-all ${
                      selectedVenue === venue.id
                        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400 text-white"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <div className="font-medium">{venue.name}</div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300">10 LED Panels</span>
                      <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300">Interactive Release</span>
                      <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300">Movement Based</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Booking Mode Tabs */}
            <div className="mb-8">
              <div className="flex bg-white/5 rounded-xl p-1 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveBookingMode('quick_order')}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                    activeBookingMode === 'quick_order'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Order at Venue
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBookingMode('profile_build')}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                    activeBookingMode === 'profile_build'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Build Profile for Recommendations
                </button>
              </div>
            </div>

            <form onSubmit={handleBookingSubmit}>
              {/* Experience Selector */}
              <div className="mb-8">
                <label className="text-white/70 text-sm mb-3 block">
                  {activeBookingMode === 'quick_order' ? 'Select Experience' : 'Initial Experience (we&apos;ll recommend more)'}
                </label>
                <select 
                  value={selectedBookingExperience}
                  onChange={(e) => setSelectedBookingExperience(e.target.value)}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white appearance-none cursor-pointer"
                  required
                >
                  <option value="">
                    {activeBookingMode === 'quick_order' ? 'Choose an experience...' : 'Start with any experience...'}
                  </option>
                  {realExperiences.map((exp) => (
                    <option key={exp.id} value={exp.id}>
                      {exp.name} - {exp.duration_minutes}min - AED {exp.price}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Date</label>
                  <input 
                    type="date" 
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white" 
                    required
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-2 block">
                    Available Times
                    {loadingSlots && <span className="text-purple-400 ml-2">Loading...</span>}
                  </label>
                  {availableTimeSlots.length > 0 ? (
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white appearance-none cursor-pointer"
                      required
                    >
                      <option value="">Select available time...</option>
                      {availableTimeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  ) : bookingDate && selectedBookingExperience && !loadingSlots ? (
                    <div className="w-full p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
                      No available slots for this date. Please select another date.
                    </div>
                  ) : (
                    <div className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white/50 text-sm">
                      Select date and experience to see available times
                    </div>
                  )}
                </div>
              </div>

              {/* User Mode Selection */}
              {activeBookingMode === 'quick_order' && (
                <div className="mb-6">
                  <div className="flex bg-white/5 rounded-xl p-1 mb-4">
                    <button
                      type="button"
                      onClick={() => setUserMode('anonymous')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                        userMode === 'anonymous'
                          ? 'bg-white/10 text-white'
                          : 'text-white/50 hover:text-white/70'
                      }`}
                    >
                      Continue as Guest
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserMode('authenticated')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                        userMode === 'authenticated'
                          ? 'bg-white/10 text-white'
                          : 'text-white/50 hover:text-white/70'
                      }`}
                    >
                      Save My Preferences
                    </button>
                  </div>
                </div>
              )}

              {/* Contact Info - Conditional based on mode */}
              {userMode === 'authenticated' || activeBookingMode === 'profile_build' ? (
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <input 
                    placeholder="Your Name" 
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40" 
                    required
                  />
                  <input 
                    placeholder="Email" 
                    type="email" 
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40" 
                    required={activeBookingMode === 'profile_build'}
                  />
                </div>
              ) : (
                <div className="mb-8">
                  <input 
                    placeholder="First name or nickname (optional)" 
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40" 
                  />
                  <p className="text-white/40 text-xs mt-2">
                    Anonymous booking - no email required. Payment at venue.
                  </p>
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:scale-[1.02] transition-transform"
              >
                {userMode === 'anonymous' && activeBookingMode === 'quick_order' 
                  ? 'Reserve Anonymously' 
                  : activeBookingMode === 'profile_build'
                  ? 'Start Building My Profile'
                  : 'Reserve Your Session'
                }
              </button>
              
              {/* Optional email capture for anonymous users */}
              {userMode === 'anonymous' && activeBookingMode === 'quick_order' && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setShowEmailCapture(!showEmailCapture)}
                    className="text-white/60 text-sm hover:text-white/80 transition-colors"
                  >
                    {showEmailCapture ? '↑ Hide' : '↓ Want session reminders?'}
                  </button>
                  {showEmailCapture && (
                    <div className="mt-3">
                      <input 
                        placeholder="Email for booking confirmation (optional)" 
                        type="email" 
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm" 
                      />
                      <p className="text-white/30 text-xs mt-1">
                        We&apos;ll only send booking confirmation - no marketing emails
                      </p>
                    </div>
                  )}
                </div>
              )}
            </form>

            <p className="text-white/40 text-xs text-center mt-4">
              {userMode === 'anonymous' 
                ? 'Anonymous booking - payment at venue, no data stored'
                : 'Payment is collected at the venue after your session'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* AI Journey Chat Modal with LiveKit */}
      {showAIChat && (
        <AIJourneyChatModal onClose={() => setShowAIChat(false)} />
      )}

      {/* Footer */}
      <footer id="contact" className="py-12 px-4 border-t border-white/10 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <div className="text-2xl font-light text-white mb-2">AOI</div>
              <div className="text-white/40 text-sm">Art of Implosion © 2024</div>
            </div>
            <div className="flex gap-8">
              <Link href="/privacy" className="text-white/60 hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="text-white/60 hover:text-white transition-colors">Terms</Link>
              <Link href="/contact" className="text-white/60 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
