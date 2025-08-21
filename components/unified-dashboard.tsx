"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar,
  Clock,
  Users,
  MapPin,
  X,
  TrendingUp,
  CreditCard,
  Package,
  Plus,
  ShoppingCart,
  Home
} from 'lucide-react'
// import { Room } from 'livekit-client'
// import useConnectionDetails from '@/hooks/useConnectionDetails'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import CheckinModal from "./checkin-modal"
import CheckoutModal from "./checkout-modal"
// Supabase imports disabled for demo mode
// import {
//   supabase, 
//   getStockLevels, 
//   getBookings, 
//   updateBookingStatus,
//   subscribeToStockChanges,
//   subscribeToBookingChanges,
//   type StockItem,
//   type Booking as SupabaseBooking
// } from "@/lib/supabase"

// Types
type BookingStatus = 'waiting' | 'checked-in' | 'active' | 'completed'
type ViewMode = "all" | "arrived" | "active" | "complete"

export interface Booking {
  id: string
  name: string
  time: string
  service: string
  status: BookingStatus
  assignedRoom?: string
  duration?: number
  phone?: string
  email?: string
  cart?: unknown[]
  recommendations?: unknown[]
  total?: number
  paymentMethod?: 'card' | 'cash'
  // Guest profile data attached to this booking
  guestProfile?: {
    weight?: number
    gender?: 'male' | 'female' | 'prefer_not_to_say'
    activityLevel?: 'low' | 'moderate' | 'high'
    dietStyle?: 'balanced' | 'keto' | 'vegan' | 'paleo'
    bodyType?: string
    lbm?: number
    lastVisit?: string
    preferences?: {
      allergies?: string[]
      dislikes?: string[]
      goals?: string[]
    }
  }
  venueId?: string
}

// StockLevel interface disabled for demo mode
// interface StockLevel {
//   id: string
//   product_id: string
//   product_name: string
//   venue_id: string
//   current_stock: number
//   min_stock: number
//   last_updated: string
// }


// Mock booking data with room assignments
const mockBookings: Booking[] = [
  { id: "1", name: "Sarah Chen", time: "2:30 PM", service: "Sauna + Ice Bath", status: "waiting", assignedRoom: "Sauna 1", duration: 60, phone: "+971501234567", email: "sarah@email.com", cart: [], recommendations: [], guestProfile: { weight: 65, gender: 'female', activityLevel: 'moderate', dietStyle: 'balanced' }, venueId: 'aoi_wellness_hub' },
  { id: "2", name: "Ahmed Al-Rashid", time: "3:00 PM", service: "Float Tank", status: "checked-in", assignedRoom: "Float 1", duration: 90, phone: "+971509876543", email: "ahmed@email.com", cart: [], recommendations: [], guestProfile: { weight: 78, gender: 'male', activityLevel: 'high', dietStyle: 'keto', lastVisit: '2024-01-15T10:00:00Z' }, venueId: 'aoi_wellness_hub' },
  { id: "3", name: "Emma Wilson", time: "3:45 PM", service: "Detox Trinity", status: "active", assignedRoom: "Suite 2", duration: 120, phone: "+971507654321", email: "emma@email.com", cart: [], recommendations: [], guestProfile: { weight: 58, gender: 'female', activityLevel: 'low', dietStyle: 'vegan' }, venueId: 'aoi_wellness_hub' },
  { id: "4", name: "James Taylor", time: "3:30 PM", service: "AOI HEAT", status: "waiting", phone: "+971 50 456 7890", cart: [], recommendations: [] },
  { id: "5", name: "Lisa Anderson", time: "4:00 PM", service: "AOI ICE", status: "completed", phone: "+971 50 567 8901", assignedRoom: "Suite 1", cart: [], recommendations: [] },
]

// Service rooms data
const serviceRooms = [
  { id: "suite-1", name: "Suite 1", icon: "", status: "occupied" as const, currentGuest: "Lisa Anderson", endTime: "4:45 PM" },
  { id: "suite-2", name: "Suite 2", icon: "", status: "occupied" as const, currentGuest: "Emma Wilson", endTime: "3:45 PM" },
  { id: "suite-3", name: "Suite 3", icon: "", status: "available" as const, currentGuest: null, endTime: null },
  { id: "sauna", name: "Sauna", icon: "", status: "available" as const, currentGuest: null, endTime: null },
  { id: "ice-room", name: "Ice Room", icon: "", status: "maintenance" as const, currentGuest: null, endTime: null },
  { id: "air-chamber", name: "AIR Chamber", icon: "", status: "available" as const, currentGuest: null, endTime: null },
]

// const experiences = ["Sauna + Ice Bath", "Float Tank", "Detox Trinity", "Heat Therapy", "Earth Grounding", "Air Purification"]
// Remove static stock levels - will fetch from Supabase

// Export component as default
export default function UnifiedDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>("all")
  const [showQuickCheckin, setShowQuickCheckin] = useState(false)
  const [showGroupCheckout, setShowGroupCheckout] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [rooms, setRooms] = useState(serviceRooms)
  // const [room, setRoom] = useState<Room | null>(null)
  
  // LiveKit connection for AI agent (disabled for demo)
  // const connectionDetails = useConnectionDetails()
  
  // Connect to LiveKit room on mount (disabled for demo)
  useEffect(() => {
    console.log('🎯 SPA DASHBOARD: Demo mode - LiveKit disabled')
    // if (!connectionDetails) return
    
    // const connectToRoom = async () => {
    //   const newRoom = new Room()
    //   
    //   try {
    //     await newRoom.connect(connectionDetails.wsUrl, connectionDetails.token)
    //     setRoom(newRoom)
        
        // Register RPC handler for agent responses (disabled for demo)
        // newRoom.registerRpcMethod('spa.guest_recommendations', async (data: any) => {
        //   console.log('🤖 Received recommendations from agent:', data.payload)
        //   try {
        //     const response = JSON.parse(data.payload)
        //     const { booking_id, recommendations, profile_updated } = response
            
        //     // Update the specific booking with AI recommendations
        //     setBookings(prev => prev.map(b => {
        //       if (b.id === booking_id) {
        //         return {
        //           ...b,
        //           recommendations: recommendations || [],
        //           // Update profile if agent calculated LBM or other data
        //           guestProfile: profile_updated ? {
        //             ...b.guestProfile,
        //             ...profile_updated
        //           } : b.guestProfile
        //         }
        //       }
        //       return b
        //     }))
            
        //     // Auto-add to cart if agent suggests it
        //     if (response.auto_add && recommendations) {
        //       recommendations.forEach((item: any) => {
        //         window.dispatchEvent(new CustomEvent('agent-add-to-cart', {
        //           detail: {
        //             product_id: item.product_id,
        //             quantity: item.quantity || 1,
        //             metadata: {
        //               booking_id: booking_id,
        //               recommendation: true,
        //               reason: item.reason,
        //               venue_id: 'aoi_wellness_hub'
        //             }
        //           }
        //         }))
        //       })
        //     }
            
        //     return JSON.stringify({ success: true })
        //   } catch (error) {
        //     console.error('Error processing recommendations:', error)
        //     return JSON.stringify({ success: false, error: (error as Error).message })
        //   }
        // })
        
        // Register handler for agent profile requests (disabled for demo)
        // newRoom.registerRpcMethod('spa.get_guest_profile', async (data: any) => {
        //   console.log('🤖 Agent requesting guest profile:', data.payload)
        //   try {
        //     const { booking_id } = JSON.parse(data.payload)
            
        //     // Find the booking and return its profile
        //     const booking = bookings.find(b => b.id === booking_id)
        //     if (booking && booking.guestProfile) {
        //       return JSON.stringify({
        //         success: true,
        //         profile: booking.guestProfile,
        //         booking_info: {
        //           service: booking.service,
        //           venue_id: booking.venueId || 'aoi_wellness_hub',
        //           guest_name: booking.name
        //         }
        //       })
        //     }
            
        //     return JSON.stringify({ success: false, error: 'No profile found for booking' })
        //   } catch (error) {
        //     console.error('Error getting guest profile:', error)
        //     return JSON.stringify({ success: false, error: (error as Error).message })
        //   }
        // })
    
    // connectToRoom()
    
    return () => {
      // if (room) {
      //   room.disconnect()
      // }
    }
  }, [])
  
  const [bookings, setBookings] = useState<Booking[]>(mockBookings)
  const [groupCheckout, setGroupCheckout] = useState<Booking[]>([])
  const [selectedGuest, setSelectedGuest] = useState<Booking | null>(null)
  const [showCheckinModal, setShowCheckinModal] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  // const [stockLevels, setStockLevels] = useState<StockItem[]>([])
  // const [loading, setLoading] = useState(false)

  // Supabase data loading disabled for demo mode
  // useEffect(() => {
  //   loadInitialData()
    
  //   // Set up real-time subscriptions
  //   const stockSubscription = subscribeToStockChanges((payload) => {
  //     console.log('Stock change:', payload)
  //     loadStockLevels()
  //   })
    
  //   const bookingSubscription = subscribeToBookingChanges((payload) => {
  //     console.log('Booking change:', payload)
  //     loadBookings()
  //   })
    
  //   return () => {
  //     stockSubscription.unsubscribe()
  //     bookingSubscription.unsubscribe()
  //   }
  // }, [])
  
  // Supabase functions disabled for demo mode
  // const loadInitialData = async () => {
  //   setLoading(true)
  //   await Promise.all([
  //     loadStockLevels(),
  //     loadBookings()
  //   ])
  //   setLoading(false)
  // }
  
  // const loadStockLevels = async () => {
  //   const stocks = await getStockLevels()
  //   setStockLevels(stocks)
  // }
  
  // const loadBookings = async () => {
  //   const today = new Date()
  //   const supabaseBookings = await getBookings(today)
    
  //   // Convert Supabase bookings to component format
  //   if (supabaseBookings.length > 0) {
  //     const formattedBookings: Booking[] = supabaseBookings.map(b => ({
  //       id: b.id,
  //       name: b.guest_name,
  //       time: new Date(b.scheduled_time).toLocaleTimeString('en-US', { 
  //         hour: 'numeric', 
  //         minute: '2-digit' 
  //       }),
  //       service: b.experience,
  //       status: b.status as BookingStatus,
  //       phone: b.phone,
  //       assignedRoom: b.room || undefined,
  //       cart: [],
  //       recommendations: []
  //     }))
  //     setBookings(formattedBookings)
  //   }
  // }
  
  // Filter bookings based on view mode
  const filteredBookings = bookings

  const handleGuestClick = (booking: Booking) => {
    if (booking.status === 'waiting') {
      setSelectedGuest(booking)
      setShowCheckinModal(true)
    } else if (booking.status === 'active' || booking.status === 'checked-in') {
      setSelectedGuest(booking)
      setShowCheckoutModal(true)
    }
  }

  // Handle AI recommendations - trigger cart UI
  const handleRecommendation = async (booking: Booking, productId: string, quantity: number = 1) => {
    // Update booking with recommendation
    setBookings(prev => prev.map(b => 
      b.id === booking.id 
        ? { ...b, recommendations: [...(b.recommendations || []), { product_id: productId, quantity }] }
        : b
    ))
  }

  // Generate recommendations (mock AI)
  const generateRecommendations = ({ hydrationGoal }: { hydrationGoal: string }) => {
    return [
      {
        drink: "Electrolyte Boost",
        timing: "Now - before starting",
        reason: "Prepares your body for heat exposure",
        price: 35
      }
    ]
  }

  // Handle checkin with AI recommendations
  const handleCheckin = async (activityLevel: string, dietStyle: string) => {
    if (!selectedGuest) return
    
    // Update booking with profile data first
    const updatedProfile = {
      ...selectedGuest.guestProfile,
      activityLevel,
      dietStyle,
      lastVisit: new Date().toISOString()
    }
    
    // Update local booking with profile
    setBookings(prev => prev.map(b => 
      b.id === selectedGuest.id 
        ? { ...b, guestProfile: updatedProfile as any, venueId: 'aoi_wellness_hub' }
        : b
    ))
    
    // Send calculation request to AI agent
    const calculationRequest = {
      booking_id: selectedGuest.id,
      guest_name: selectedGuest.name,
      service: selectedGuest.service,
      venue_id: 'aoi_wellness_hub',
      session_type: 'spa_visit',
      // Agent will call back to get full profile via spa.get_guest_profile
      request_profile: true
    }
    
    try {
      console.log('🎯 Sending calculation request to AI agent:', calculationRequest)
      
      // Call agent to get personalized recommendations (disabled for demo)
      // const response = await room.performRpc({
      //   destinationIdentity: 'agent',
      //   method: 'spa.calculate_recommendations',
      //   payload: JSON.stringify(calculationRequest)
      // })
      const response = { success: true }
      
      console.log('🤖 Agent response:', response)
      
      // Update booking status
      setBookings(prev => prev.map(b => 
        b.id === selectedGuest.id 
          ? { ...b, status: "checked-in" as BookingStatus }
          : b
      ))
      
      // Update in Supabase (disabled for demo)
      // await updateBookingStatus(selectedGuest.id.toString(), "active")
      
    } catch (error) {
      console.error('Failed to get AI recommendations:', error)
      // Fallback to mock recommendations
      const fallbackRecs = generateRecommendations({ hydrationGoal: 'moderate' })
      setBookings(prev => prev.map(b => 
        b.id === selectedGuest.id 
          ? { ...b, status: "checked-in" as BookingStatus, recommendations: fallbackRecs }
          : b
      ))
    }
    
    setShowCheckinModal(false)
    setShowCheckoutModal(true)
  }

  // Complete check-in
  const completeCheckin = async (activityLevel: string, dietStyle: string) => {
    if (!selectedGuest) return
    
    const recommendations = generateRecommendations({ hydrationGoal: 'moderate' })
    
    // Update local state
    setBookings(prev => prev.map(b => 
      b.id === selectedGuest.id 
        ? { ...b, status: "checked-in" as BookingStatus, recommendations }
        : b
    ))
    
    // Update in Supabase (disabled for demo)
    // await updateBookingStatus(selectedGuest.id.toString(), "active")
    
    setShowCheckinModal(false)
    setShowCheckoutModal(true)
  }

  // Add to cart
  const updateBookingWithRecommendations = async (booking: Booking) => {
    // Mock AI recommendation call
    const recommendations = generateRecommendations({ hydrationGoal: 'moderate' })
    
    // Update booking with recommendations
    const updatedBooking = { ...booking, recommendations }
    setBookings(prev => prev.map(b => 
      b.id === booking.id ? updatedBooking : b
    ))
    
    // Note: We'll handle status updates in the checkout flow
    // Supabase status mapping may differ from our local status
    
    return updatedBooking
  }

  // Add to cart
  const handleCheckinComplete = (data: unknown) => {
    // This function would handle checkin completion
    console.log('Checkin complete:', data)
    setShowCheckinModal(false)
    setSelectedGuest(null)
  }

  // Handle checkout completion  
  const handleCheckoutComplete = (data: unknown) => {
    // This function would handle checkout completion
    console.log('Checkout complete:', data)
    setShowCheckoutModal(false)
    setSelectedGuest(null)
  }


  // Add to cart helper
  const handleCheckout = (booking: Booking, recommendations?: unknown[]) => {
    const updatedBooking = {
      ...booking,
      cart: [...(booking.cart || []), ...(recommendations || [])]
    }
    setBookings(prev => prev.map(b => 
      b.id === booking.id ? updatedBooking : b
    ))
  }

  // Start group checkout
  const startGroupCheckout = () => {
    const checkedIn = bookings.filter(b => b.status === 'checked-in')
    setGroupCheckout(checkedIn)
    setShowGroupCheckout(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl grid place-items-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-light text-white">AOI Wellness Hub</h1>
            <p className="text-white/60 text-sm">Front Desk Dashboard</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            className="bg-white/10 text-white hover:bg-white/20"
            onClick={() => setShowCheckinModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Walk-in
          </Button>
          <Button 
            variant="secondary" 
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            onClick={startGroupCheckout}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Group Checkout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Today&apos;s Bookings</p>
              <p className="text-2xl font-light text-white">{bookings.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-400" />
          </div>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Active Now</p>
              <p className="text-2xl font-light text-white">
                {bookings.filter(b => b.status === "active").length}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Revenue</p>
              <p className="text-2xl font-light text-white">2,450 AED</p>
            </div>
            <TrendingUp className="w-8 h-8 text-amber-400" />
          </div>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Stock Alert</p>
              <p className="text-2xl font-light text-white">3 Low</p>
            </div>
            <Package className="w-8 h-8 text-red-400" />
          </div>
        </Card>
      </div>

      {/* View Switcher */}
      <div className="flex gap-2 mb-4">
        {(["all", "arrived", "active", "complete"] as ViewMode[]).map(mode => (
          <Button
            key={mode}
            variant={viewMode === mode ? "default" : "secondary"}
            className={viewMode === mode 
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" 
              : "bg-white/10 text-white hover:bg-white/20"
            }
            onClick={() => setViewMode(mode)}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Button>
        ))}
      </div>

      {/* Bookings Table */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead className="text-white/60">Time</TableHead>
              <TableHead className="text-white/60">Guest</TableHead>
              <TableHead className="text-white/60">Service</TableHead>
              <TableHead className="text-white/60">Status</TableHead>
              <TableHead className="text-white/60">Cart</TableHead>
              <TableHead className="text-white/60">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map(booking => (
              <TableRow key={booking.id} className="border-white/10">
                <TableCell className="text-white">{booking.time}</TableCell>
                <TableCell className="text-white">{booking.name}</TableCell>
                <TableCell className="text-white">{booking.service}</TableCell>
                <TableCell>
                  <Badge className={
                    booking.status === "waiting" ? "bg-slate-500" :
                    booking.status === "checked-in" ? "bg-green-500" :
                    booking.status === "active" ? "bg-blue-500" :
                    "bg-amber-500"
                  }>
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-white">
                  {booking.cart.length} items
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {booking.status === "waiting" && (
                      <Button 
                        size="sm" 
                        variant="secondary"
                        className="bg-white/10 text-white hover:bg-white/20"
                        onClick={() => handleGuestClick(booking)}
                      >
                        Check In
                      </Button>
                    )}
                    {booking.recommendations && (
                      <Button 
                        size="sm" 
                        variant="secondary"
                        className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                        onClick={() => {
                          setSelectedGuest(booking)
                          setShowCheckoutModal(true)
                        }}
                      >
                        View Plan
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Service Rooms Section */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl text-white flex items-center gap-2">
            <Home className="w-5 h-5" />
            Service Rooms
          </h3>
          <span className="text-sm text-white/60">
            {rooms.filter(r => r.status === "available").length} available
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <motion.div
              key={room.id}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                room.status === "available"
                  ? "bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
                  : room.status === "occupied"
                  ? "bg-purple-500/10 border-purple-500/30"
                  : "bg-orange-500/10 border-orange-500/30"
              }`}
              onClick={async () => {
                if (room.status === "available" && selectedGuest) {
                  // Assign room to selected guest
                  setBookings(prev => prev.map(b => 
                    b.id === selectedGuest.id 
                      ? { ...b, room: room.name, status: "active" as const }
                      : b
                  ))
                  setRooms(prev => prev.map(r => 
                    r.id === room.id
                      ? { ...r, status: "occupied" as const, currentGuest: selectedGuest.name, endTime: "In 60 min" }
                      : r
                  ))
                  
                  // Update in Supabase (disabled for demo)
                  // await updateBookingStatus(selectedGuest.id.toString(), "active", room.name)
                  
                  setSelectedGuest(null)
                }
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{room.icon}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  room.status === "available"
                    ? "bg-green-500/20 text-green-400"
                    : room.status === "occupied"
                    ? "bg-purple-500/20 text-purple-400"
                    : "bg-orange-500/20 text-orange-400"
                }`}>
                  {room.status}
                </span>
              </div>
              <p className="text-white font-medium mb-1">{room.name}</p>
              {room.currentGuest && (
                <div className="text-xs text-gray-400">
                  <p>{room.currentGuest}</p>
                  <p className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Until {room.endTime}
                  </p>
                </div>
              )}
              {room.status === "available" && selectedGuest && (
                <p className="text-xs text-green-400 mt-2">Click to assign {selectedGuest.name}</p>
              )}
            </motion.div>
          ))}
        </div>
        
        {selectedGuest && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <p className="text-sm text-blue-400">
              Select an available room for <span className="font-medium">{selectedGuest.name}</span>
            </p>
          </div>
        )}
      </div>

      {/* Quick Check-in Modal */}
      <AnimatePresence>
        {showQuickCheckin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowQuickCheckin(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-8 max-w-md w-full border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-light text-white">Quick Check-in</h2>
                <button 
                  onClick={() => setShowQuickCheckin(false)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-white/60 text-sm block mb-3">Activity Level Today</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Light", "Moderate", "Intense"].map(level => (
                      <button
                        key={level}
                        className="p-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all"
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-sm block mb-3">Diet Style</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Clean", "Balanced", "Flexible"].map(diet => (
                      <button
                        key={diet}
                        className="p-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all"
                      >
                        {diet}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  onClick={() => completeCheckin("moderate", "balanced")}
                >
                  Generate Hydration Plan
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommendations Modal */}
      <AnimatePresence>
        {showRecommendations && selectedGuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRecommendations(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-8 max-w-lg w-full border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-light text-white">Hydration Plan</h2>
                  <p className="text-white/60 text-sm">{selectedGuest.name}</p>
                </div>
                <button 
                  onClick={() => setShowRecommendations(false)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {selectedGuest.recommendations?.map((rec, idx) => (
                  <div key={idx} className="bg-white/10 rounded-xl p-4 border border-white/20">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-white font-medium">{rec.drink}</h3>
                        <p className="text-white/60 text-sm">{rec.timing}</p>
                      </div>
                      <span className="text-white">{rec.price} AED</span>
                    </div>
                    <p className="text-white/40 text-sm">{rec.reason}</p>
                    <Button 
                      size="sm"
                      className="mt-3 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                      onClick={() => {
                        if (selectedGuest) {
                          addToCart(selectedGuest, {
                            id: `${Date.now()}`,
                            name: rec.drink,
                            price: rec.price,
                            quantity: 1,
                            timing: rec.timing
                          })
                        }
                      }}
                    >
                      Add to Cart
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group Checkout Modal */}
      <AnimatePresence>
        {showGroupCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowGroupCheckout(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-8 max-w-2xl w-full border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-light text-white">Group Checkout</h2>
                <button 
                  onClick={() => setShowGroupCheckout(false)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {groupCheckout.map(booking => (
                  <div key={booking.id} className="bg-white/10 rounded-xl p-4 border border-white/20">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-white font-medium">{booking.name}</h3>
                        <p className="text-white/60 text-sm">{booking.service}</p>
                        {booking.assignedRoom && (
                          <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {booking.assignedRoom}
                          </span>
                        )}
                      </div>
                      <span className="text-white">
                        {booking.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)} AED
                      </span>
                    </div>
                    <div className="space-y-1">
                      {booking.cart.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-white/60">{item.name} x{item.quantity}</span>
                          <span className="text-white/60">{item.price * item.quantity} AED</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/20 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl text-white">Total</span>
                  <span className="text-2xl font-light text-white">
                    {groupCheckout.reduce((sum, b) => 
                      sum + (b.cart?.reduce((s, i) => s + (i.price * i.quantity), 0) || 0), 0
                    )} AED
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button className="bg-white/10 text-white hover:bg-white/20">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Card Payment
                  </Button>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Get AI Recommendations
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkin Modal */}
      <CheckinModal
        isOpen={showCheckinModal}
        onClose={() => setShowCheckinModal(false)}
        guestData={selectedGuest ? {
          id: selectedGuest.id,
          name: selectedGuest.name,
          booking: {
            experience: selectedGuest.experience,
            time: selectedGuest.time,
            room: selectedGuest.room
          }
        } : undefined}
        onComplete={handleCheckinComplete}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        sessionData={selectedGuest ? {
          experience: selectedGuest.experience,
          duration: "60 mins",
          room: selectedGuest.room || "Room 1",
          time: selectedGuest.time,
          date: new Date().toLocaleDateString(),
          price: 150
        } : undefined}
        guestData={selectedGuest ? {
          id: selectedGuest.id,
          name: selectedGuest.name,
          email: selectedGuest.email,
          phone: selectedGuest.phone
        } : undefined}
        onComplete={handleCheckoutComplete}
      />
    </div>
  )
}
