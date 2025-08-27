"use client"

import React, { useState, useEffect } from 'react'
import { 
  Calendar, Plus, Package, Home, TrendingUp, Users
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import CheckinModal from "./checkin-modal"
import CheckoutModal from "./checkout-modal"
import TimingAlerts from "./timing-alerts"
import { createClient } from '@/lib/supabase/client'

// Types
type ViewMode = "all" | "arrived" | "active" | "complete"
interface Booking {
  id: string
  guest_name: string
  name?: string
  date: string
  time: string
  experience_name: string
  service?: string
  status: string
  assignedRoom?: string
  duration?: number
  phone?: string
  email?: string
  cart?: unknown[]
  cart_items?: Array<{
    id: string
    product_name?: string
    quantity?: number
    price?: number
    item_type?: string
    name?: string
    unit_price?: number
    booking_metadata?: {
      experience_name?: string
    }
  }>
  total_amount?: number
  recommendations?: unknown[]
  guestProfile?: {
    weight?: number
    gender?: string
    activityLevel?: string
    dietStyle?: string
    lastVisit?: string
  }
  venueId?: string
  experience?: string
  room?: string
}


const serviceRooms = [
  { id: 'suite1', name: 'Suite 1', status: 'occupied' as const, guest: 'Emma Wilson', service: 'Detox Trinity', timeRemaining: 45 },
  { id: 'suite2', name: 'Suite 2', status: 'available' as const },
  { id: 'suite3', name: 'Suite 3', status: 'available' as const },
]

export default function UnifiedDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>("all")
  const [rooms] = useState(serviceRooms)
  const [bookings, setBookings] = useState<Array<Record<string, unknown>>>([])
  const [selectedGuest, setSelectedGuest] = useState<Booking | null>(null)
  const [showCheckinModal, setShowCheckinModal] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [inventory, setInventory] = useState<Array<{id: string, quantity: number, products: {name: string, category: string}}>>([])
  const [currentVenue, setCurrentVenue] = useState<{
    id?: string;
    name?: string;
    address?: string;
    opening_hours?: string;
  } | null>(null)
  const supabase = createClient()

  // Fetch AOI venue data
  useEffect(() => {
    const fetchVenueData = async () => {
      try {
        const { data: venue } = await supabase
          .from('venue')
          .select('*')
          .ilike('name', '%Art of Implosion%')
          .single();
        setCurrentVenue(venue);
      } catch (error) {
        console.error('Error fetching venue:', error);
        // Fallback for AOI
        setCurrentVenue({
          name: "Art of Implosion x Johny Dar Experience",
          address: "Dubai", 
          opening_hours: "9:00 AM - 10:00 PM"
        });
      }
    };
    fetchVenueData();
  }, [currentVenue?.id, supabase]);

  useEffect(() => {
    // Real-time subscription for dashboard updates
    // const channel = supabase
    //   .channel('dashboard-updates')
    //   .on('postgres_changes', {
    //     event: '*',
    //     schema: 'public', 
    //     table: 'cart_items'
    //   }, (payload) => {
    //     console.log('Cart item change:', payload)
    //     fetchBookings() // Refresh bookings on any cart change
    //   })
    //   .on('postgres_changes', {
    //     event: '*',
    //     schema: 'public',
    //     table: 'cart_headers' 
    //   }, (payload) => {
    //     console.log('Cart header change:', payload)
    //     fetchBookings() // Refresh on cart status changes
    //   })
    //   .subscribe()

    // Subscribe to real-time cart updates
    const fetchBookings = async () => {
      const { data } = await supabase
        .from('cart_items')
        .select(`
          *,
          cart_headers!inner(*)
        `)
        .not('booking_metadata', 'is', null)
        .order('created_at', { ascending: false })
      
      if (data) {
        const formattedBookings = data.map((item) => ({
          id: item.id,
          guest_name: item.cart_headers?.customer_name || 'Guest',
          name: item.cart_headers?.customer_name || 'Guest',
          date: item.booking_metadata?.date || new Date().toISOString().split('T')[0],
          time: item.booking_metadata?.time || 'TBD',
          experience_name: item.booking_metadata?.experience_name || item.product_name,
          service: item.product_name,
          status: item.booking_status || 'waiting',
          assignedRoom: item.booking_metadata?.room,
          cart_items: [],
          total_amount: item.cart_headers?.total_amount || 0,
          cart: [item],
          recommendations: item.ai_recommendation ? [item.ai_recommendation] : [],
          venueId: item.venue_id,
          email: item.cart_headers?.customer_email,
          phone: item.cart_headers?.customer_phone || item.cart_headers?.phone,
          // Staff-only booking context metadata
          bookingContext: {
            experienceType: item.booking_metadata?.experience_type || 'general',
            duration: item.booking_metadata?.duration_minutes || 30,
            room: item.booking_metadata?.room,
            specialRequests: item.booking_metadata?.special_requests,
            arrivalTime: item.booking_metadata?.arrival_time,
            lastInteraction: item.updated_at,
            chatHistory: item.booking_metadata?.chat_history || [],
            staffNotes: item.booking_metadata?.staff_notes || ''
          }
        }))
        setBookings(formattedBookings as Record<string, unknown>[])
      }
    }

    // Fetch inventory data for AOI venue
    const fetchInventory = async () => {
      if (!currentVenue?.id) return;
      
      const { data } = await supabase
        .from('venue_stock')
        .select(`
          id,
          quantity,
          products(name, category)
        `)
        .eq('venue_id', currentVenue.id)
        .gt('quantity', 0)
        .order('products.name', { ascending: true })
      
      if (data) {
        // Transform the data to match our expected type structure
        const transformedData = data.map((item: Record<string, unknown>) => ({
          id: item.id,
          quantity: item.quantity,
          products: Array.isArray(item.products) ? item.products[0] : item.products
        })).filter((item: Record<string, unknown>) => item.products) // Filter out items without product data
        setInventory(transformedData)
      }
    }

    // Fetch AOI experiences available at this venue
    // const fetchExperiences = async () => {
    //   if (!currentVenue?.id) return;
    //   
    //   const { data } = await supabase
    //     .from('venue_experiences')
    //     .select(`
    //       experience_id,
    //       is_available,
    //       max_capacity,
    //       experiences(id, name, price, duration_minutes, stripe_price_id)
    //     `)
    //     .eq('venue_id', currentVenue.id)
    //     .eq('is_available', true)
    //   
    //   if (data) {
    //     // This data is available for future expansion
    //   }
    // }

    fetchBookings()
    fetchInventory()
    
    // Cleanup subscription on unmount
    const bookingChannel = supabase
      .channel('cart-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: 'booking_metadata=not.is.null'
        },
        () => fetchBookings()
      )
      .subscribe()

    const inventoryChannel = supabase
      .channel('inventory-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'venue_stock'
        },
        () => fetchInventory()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(bookingChannel)
      supabase.removeChannel(inventoryChannel)
    }
  }, [supabase, currentVenue?.id])

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

  const handleCheckinComplete = (data: unknown) => {
    console.log('Checkin complete:', data)
    setShowCheckinModal(false)
    setSelectedGuest(null)
  }

  const handleCheckoutComplete = (data: unknown) => {
    console.log('Checkout complete:', data)
    setShowCheckoutModal(false)
    setSelectedGuest(null)
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-400 p-4 md:p-6">
      {/* Mobile-First Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
            <Home className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-light text-white">
              {currentVenue?.name || "Art of Implosion"}
            </h1>
            <p className="text-white/60 text-sm">
              {currentVenue?.opening_hours || "Loading hours..."}
            </p>
            {currentVenue?.address && (
              <p className="text-white/40 text-xs">{currentVenue.address}</p>
            )}
          </div>
        </div>
        
        {/* Mobile-Optimized Action Buttons - Stack on mobile */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            variant="secondary" 
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-400 to-cyan-400 text-white hover:from-emerald-500 hover:to-cyan-500 shadow-lg"
            onClick={() => setShowCheckinModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="sm:inline">New Guest</span>
          </Button>
          <Button 
            variant="secondary" 
            className="w-full sm:w-auto bg-gradient-to-r from-orange-400 to-pink-500 text-white hover:from-orange-500 hover:to-pink-600 shadow-lg"
            onClick={() => console.log('Quick actions coming soon')}
          >
            Quick Actions
          </Button>
          <Button 
            variant="secondary" 
            className="w-full sm:w-auto bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 text-white hover:from-purple-600 hover:via-pink-600 hover:to-yellow-500 shadow-lg"
            onClick={() => console.log('Group checkout feature coming soon')}
          >
            <Users className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Group</span>
            <span className="sm:hidden">Group Checkout</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards - 2x2 on mobile, 1x4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs md:text-sm">Bookings</p>
              <p className="text-xl md:text-2xl font-light text-white">{bookings.length}</p>
            </div>
            <Calendar className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
          </div>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs md:text-sm">Active</p>
              <p className="text-xl md:text-2xl font-light text-white">
                {bookings.filter(b => b.status === "active").length}
              </p>
            </div>
            <Users className="w-6 h-6 md:w-8 md:h-8 text-emerald-400" />
          </div>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs md:text-sm">Revenue</p>
              <p className="text-xl md:text-2xl font-light text-white">2.4k</p>
            </div>
            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-orange-400" />
          </div>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs md:text-sm">Low Stock</p>
              <p className="text-xl md:text-2xl font-light text-white">{inventory.filter(i => i.quantity <= 5).length}</p>
            </div>
            <Package className="w-6 h-6 md:w-8 md:h-8 text-pink-400" />
          </div>
        </Card>
      </div>

      {/* Main Content - Stack on mobile */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Bookings Table - Full width on mobile/tablet */}
        <div className="xl:col-span-2 order-2 xl:order-1">
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <div className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-lg md:text-xl font-light text-white">Today&apos;s Schedule</h2>
                <div className="flex gap-1 sm:gap-2 overflow-x-auto">
                  {(['all', 'arrived', 'active', 'complete'] as ViewMode[]).map((mode) => (
                    <Button
                      key={mode}
                      variant={viewMode === mode ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode(mode)}
                      className={viewMode === mode 
                        ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg" 
                        : "text-white/60 hover:text-white hover:bg-gradient-to-r hover:from-white/10 hover:to-white/20"
                      }
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Mobile-responsive table */}
              <div className="overflow-x-auto -mx-4 md:mx-0">
              <Table className="min-w-[600px]">
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
                  {filteredBookings.map((booking) => (
                    <TableRow 
                      key={booking.id} 
                      className="border-white/10 hover:bg-white/5 cursor-pointer"
                      onClick={() => handleGuestClick(booking)}
                    >
                      <TableCell className="text-white">{booking.time}</TableCell>
                      <TableCell className="text-white">{booking.name}</TableCell>
                      <TableCell className="text-white">{booking.service}</TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            booking.status === 'waiting' ? 'bg-gradient-to-r from-yellow-400/30 to-orange-400/30 text-yellow-200 border-yellow-400/50' :
                            booking.status === 'checked-in' ? 'bg-gradient-to-r from-emerald-400/30 to-green-400/30 text-emerald-200 border-emerald-400/50' :
                            booking.status === 'active' ? 'bg-gradient-to-r from-cyan-400/30 to-blue-400/30 text-cyan-200 border-cyan-400/50' :
                            'bg-gradient-to-r from-purple-400/30 to-pink-400/30 text-purple-200 border-purple-400/50'
                          }
                        >
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/60">
                        {booking.cart?.length || 0} items
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {booking.status === 'waiting' && (
                            <Button size="sm" className="bg-gradient-to-r from-emerald-400/30 to-green-400/30 text-emerald-200 hover:from-emerald-400/50 hover:to-green-400/50 border border-emerald-400/50">
                              Check In
                            </Button>
                          )}
                          {(booking.status === 'active' || booking.status === 'checked-in') && (
                            <Button size="sm" className="bg-gradient-to-r from-purple-400/30 to-pink-400/30 text-purple-200 hover:from-purple-400/50 hover:to-pink-400/50 border border-purple-400/50">
                              View Plan
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar - Timing Alerts & Room Status */}
        <div className="order-1 xl:order-2 space-y-4">
          {/* Timing Alerts */}
          <TimingAlerts 
            bookings={bookings}
            onAlertAcknowledgeAction={(alertId) => console.log('Acknowledged:', alertId)}
            onMarkServedAction={(alertId) => console.log('Marked served:', alertId)}
          />
          {/* Live Inventory Card */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-light text-white">Live Inventory</h2>
                <Package className="w-5 h-5 text-pink-400" />
              </div>
              <div className="space-y-3">
                <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-white">{booking.guest_name || booking.name}</h3>
                        <p className="text-sm text-white/60">{booking.experience_name || booking.service}</p>
                        {/* Show cart items count */}
                        {booking.cart_items && booking.cart_items.length > 1 && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-cyan-300">🛒 {booking.cart_items.length} items in cart</span>
                          </div>
                        )}
                        {/* Show cart preview */}
                        {booking.cart_items && booking.cart_items.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {booking.cart_items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="text-xs text-white/50 flex justify-between">
                                <span>{item.item_type === 'booking' ? '📅' : '🥤'} {item.name || item.booking_metadata?.experience_name}</span>
                                <span>AED {item.unit_price}</span>
                              </div>
                            ))}
                            {booking.cart_items.length > 3 && (
                              <div className="text-xs text-white/40">+{booking.cart_items.length - 3} more items</div>
                            )}
                            <div className="text-xs text-purple-300 font-medium pt-1 border-t border-white/10">
                              Total: AED {booking.total_amount || 0}
                            </div>
                          </div>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        booking.status === 'confirmed' ? 'bg-green-500/20 text-green-300' :
                        booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                        booking.status === 'checked-in' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-white/60">
                      <span>{booking.date} at {booking.time}</span>
                      <div className="flex gap-2">
                        {booking.status === 'confirmed' && (
                          <button 
                            onClick={() => {
                              setSelectedGuest(booking)
                              setShowCheckinModal(true)
                            }}
                            className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30"
                          >
                            Check In
                          </button>
                        )}
                        {booking.status === 'checked-in' && (
                          <button 
                            onClick={() => {
                              setSelectedGuest(booking)
                              setShowCheckoutModal(true)
                            }}
                            className="px-3 py-1 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30"
                          >
                            Check Out
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Room Status Card */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <div className="p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-light text-white mb-4">Room Status</h2>
              <div className="space-y-3">
                {rooms.map((room) => (
                  <div key={room.id} className="p-3 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{room.name}</span>
                      <Badge 
                        className={room.status === 'occupied' 
                          ? 'bg-gradient-to-r from-red-400/30 to-pink-400/30 text-red-200 border-red-400/50' 
                          : 'bg-gradient-to-r from-emerald-400/30 to-green-400/30 text-emerald-200 border-emerald-400/50'
                        }
                      >
                        {room.status}
                      </Badge>
                    </div>
                    {room.status === 'occupied' && (
                      <div className="text-sm text-white/60">
                        <p>{room.guest}</p>
                        <p>{room.service}</p>
                        <p>{room.timeRemaining} min remaining</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Checkin Modal */}
      <CheckinModal
        isOpen={showCheckinModal}
        onClose={() => setShowCheckinModal(false)}
        guestData={selectedGuest ? {
          id: selectedGuest.id,
          name: selectedGuest.guest_name || selectedGuest.name || 'Guest',
          booking: {
            experience: selectedGuest.experience || selectedGuest.experience_name || 'Unknown',
            time: selectedGuest.time,
            room: selectedGuest.room || selectedGuest.assignedRoom
          }
        } : undefined}
        onComplete={handleCheckinComplete}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        sessionData={selectedGuest ? {
          experience: selectedGuest?.experience || selectedGuest?.experience_name || 'Unknown',
          duration: '60',
          room: selectedGuest?.room || selectedGuest?.assignedRoom || 'Suite 1',
          time: selectedGuest?.time || 'TBD',
          date: selectedGuest?.date || new Date().toISOString().split('T')[0],
          price: 350
        } : undefined}
        guestData={selectedGuest ? {
          id: selectedGuest?.id || '',
          name: selectedGuest?.guest_name || selectedGuest?.name || 'Guest',
          email: selectedGuest?.email,
          phone: selectedGuest?.phone
        } : undefined}
        onComplete={handleCheckoutComplete}
      />
    </div>
  )
}
