"use client"

import React, { useState, useEffect } from 'react'
import { 
  Users, Calendar, Package, 
  Plus, ShoppingCart,
  Home, TrendingUp
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import CheckinModal from "./checkin-modal"
import CheckoutModal from "./checkout-modal"

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

// Mock data
const mockBookings: Booking[] = [
  { id: "1", name: "Sarah Chen", time: "2:30 PM", service: "Sauna + Ice Bath", status: "waiting", assignedRoom: "Sauna 1", duration: 60, phone: "+971501234567", email: "sarah@email.com", cart: [], recommendations: [], guestProfile: { weight: 65, gender: 'female', activityLevel: 'moderate', dietStyle: 'balanced' }, venueId: 'aoi_wellness_hub', experience: "Sauna + Ice Bath", room: "Sauna 1" },
  { id: "2", name: "Ahmed Al-Rashid", time: "3:00 PM", service: "Float Tank", status: "checked-in", assignedRoom: "Float 1", duration: 90, phone: "+971509876543", email: "ahmed@email.com", cart: [], recommendations: [], guestProfile: { weight: 78, gender: 'male', activityLevel: 'high', dietStyle: 'keto', lastVisit: '2024-01-15T10:00:00Z' }, venueId: 'aoi_wellness_hub', experience: "Float Tank", room: "Float 1" },
  { id: "3", name: "Emma Wilson", time: "3:45 PM", service: "Detox Trinity", status: "active", assignedRoom: "Suite 2", duration: 120, phone: "+971507654321", email: "emma@email.com", cart: [], recommendations: [], guestProfile: { weight: 58, gender: 'female', activityLevel: 'low', dietStyle: 'vegan' }, venueId: 'aoi_wellness_hub', experience: "Detox Trinity", room: "Suite 2" },
  { id: "4", name: "James Taylor", time: "3:30 PM", service: "AOI HEAT", status: "waiting", phone: "+971 50 456 7890", cart: [], recommendations: [], experience: "AOI HEAT" },
  { id: "5", name: "Lisa Anderson", time: "4:00 PM", service: "AOI ICE", status: "completed", phone: "+971 50 567 8901", assignedRoom: "Suite 1", cart: [], recommendations: [], experience: "AOI ICE", room: "Suite 1" },
]

const serviceRooms = [
  { id: 'suite1', name: 'Suite 1', status: 'occupied' as const, guest: 'Emma Wilson', service: 'Detox Trinity', timeRemaining: 45 },
  { id: 'suite2', name: 'Suite 2', status: 'available' as const },
  { id: 'suite3', name: 'Suite 3', status: 'available' as const },
]

export default function UnifiedDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>("all")
  const [rooms] = useState(serviceRooms)

  useEffect(() => {
    console.log('🎯 SPA DASHBOARD: Demo mode - LiveKit disabled')
    return () => {}
  }, [])
  
  const [bookings] = useState<Booking[]>(mockBookings)
  const [selectedGuest, setSelectedGuest] = useState<Booking | null>(null)
  const [showCheckinModal, setShowCheckinModal] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)

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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-400 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-light text-white">AOI Wellness Hub</h1>
            <p className="text-white/60">Front Desk Dashboard</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-white hover:from-emerald-500 hover:to-cyan-500 shadow-lg"
            onClick={() => setShowCheckinModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Guest
          </Button>
          <Button 
            variant="secondary" 
            className="bg-gradient-to-r from-orange-400 to-pink-500 text-white hover:from-orange-500 hover:to-pink-600 shadow-lg"
            onClick={() => {
              setSelectedGuest({
                id: "walk-in-" + Date.now(),
                name: "Walk-in Customer",
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                service: "Quick Purchase",
                status: "active",
                cart: [],
                recommendations: []
              })
              setShowCheckoutModal(true)
            }}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Quick Sale
          </Button>
          <Button 
            variant="secondary" 
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 text-white hover:from-purple-600 hover:via-pink-600 hover:to-yellow-500 shadow-lg"
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
            <Calendar className="w-8 h-8 text-yellow-400" />
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
            <Users className="w-8 h-8 text-emerald-400" />
          </div>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Revenue</p>
              <p className="text-2xl font-light text-white">2,450 AED</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-400" />
          </div>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Stock Alert</p>
              <p className="text-2xl font-light text-white">3 Low</p>
            </div>
            <Package className="w-8 h-8 text-pink-400" />
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings Table */}
        <div className="lg:col-span-2">
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-light text-white">Today&apos;s Schedule</h2>
                <div className="flex gap-2">
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
          </Card>
        </div>

        {/* Service Rooms */}
        <div>
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-light text-white">Service Rooms</h3>
                <Badge className="bg-gradient-to-r from-emerald-400/30 to-green-400/30 text-emerald-200 border-emerald-400/50">
                  {rooms.filter(r => r.status === 'available').length} available
                </Badge>
              </div>
              
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
          name: selectedGuest.name,
          booking: {
            experience: selectedGuest.experience || selectedGuest.service,
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
          experience: selectedGuest.experience || selectedGuest.service,
          duration: "60 mins",
          room: selectedGuest.room || selectedGuest.assignedRoom || "Room 1",
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
