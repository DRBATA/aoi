"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Users, Calendar, Clock, Activity, 
  CheckCircle, Circle, AlertCircle, 
  Search, Filter, ChevronRight,
  Sparkles, User, Phone, Mail
} from "lucide-react"

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState("today")
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null)
  const [showHydrationBuilder, setShowHydrationBuilder] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<any>(null)

  // Mock data for bookings
  const bookings = [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@email.com",
      phone: "+971 50 123 4567",
      experience: "AOI BED",
      time: "10:00 AM",
      duration: "60 min",
      status: "waiting",
      venue: "Dubai",
      notes: "First time visitor"
    },
    {
      id: "2",
      name: "Michael Chen",
      email: "michael@email.com",
      phone: "+971 55 987 6543",
      experience: "Detox Trinity Cycle",
      time: "11:30 AM",
      duration: "90 min",
      status: "in-session",
      venue: "Dubai",
      notes: "Regular client, prefers lower light intensity"
    },
    {
      id: "3",
      name: "Emma Williams",
      email: "emma@email.com",
      phone: "+971 52 456 7890",
      experience: "AOI AIR",
      time: "2:00 PM",
      duration: "45 min",
      status: "confirmed",
      venue: "Dubai",
      notes: ""
    },
    {
      id: "4",
      name: "David Martinez",
      email: "david@email.com",
      phone: "+971 56 234 5678",
      experience: "AOI HEAT + ICE",
      time: "3:30 PM",
      duration: "45 min",
      status: "completed",
      venue: "Dubai",
      notes: "Combo session"
    }
  ]

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'waiting': return 'from-yellow-400 to-orange-400'
      case 'in-session': return 'from-blue-400 to-purple-400'
      case 'confirmed': return 'from-green-400 to-emerald-400'
      case 'completed': return 'from-gray-400 to-gray-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'waiting': return <AlertCircle className="w-4 h-4" />
      case 'in-session': return <Activity className="w-4 h-4" />
      case 'confirmed': return <Circle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      default: return <Circle className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-light text-white">AOI</div>
              <div className="text-sm text-white/60">Staff Dashboard</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-white/60">Dubai Location</div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-medium">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Today's Sessions", value: "12", icon: <Calendar className="w-5 h-5" />, color: "from-purple-400 to-pink-400" },
            { label: "In Progress", value: "2", icon: <Activity className="w-5 h-5" />, color: "from-blue-400 to-cyan-400" },
            { label: "Waiting", value: "3", icon: <Clock className="w-5 h-5" />, color: "from-yellow-400 to-orange-400" },
            { label: "Completed", value: "7", icon: <CheckCircle className="w-5 h-5" />, color: "from-green-400 to-emerald-400" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} bg-opacity-20 text-white mb-4`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-light text-white mb-1">{stat.value}</div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bookings List */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10">
              {/* Tabs */}
              <div className="flex items-center gap-2 p-4 border-b border-white/10">
                {["today", "upcoming", "history"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-2">
                  <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                    <Search className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bookings */}
              <div className="p-4 space-y-3">
                {bookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedBooking(booking.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedBooking === booking.id
                        ? "bg-white/10 border-purple-400/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-white font-medium">{booking.name}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gradient-to-r ${getStatusColor(booking.status)} bg-opacity-20 text-white`}>
                            {getStatusIcon(booking.status)}
                            {booking.status.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="text-sm text-white/60">{booking.experience}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">{booking.time}</div>
                        <div className="text-xs text-white/40">{booking.duration}</div>
                      </div>
                    </div>
                    
                    {selectedBooking === booking.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pt-3 border-t border-white/10 space-y-2"
                      >
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <Mail className="w-4 h-4" />
                          {booking.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <Phone className="w-4 h-4" />
                          {booking.phone}
                        </div>
                        {booking.notes && (
                          <div className="text-sm text-white/60 italic">
                            Note: {booking.notes}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & Session Control */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-medium mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setSelectedGuest(bookings.find(b => b.id === selectedBooking))
                    setShowHydrationBuilder(true)
                  }}
                  className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:scale-[1.02] transition-transform"
                >
                  Check In Guest
                </button>
                <button className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 transition-all">
                  Walk-in Booking
                </button>
                <button className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 transition-all">
                  View Inventory
                </button>
              </div>
            </div>

            {/* Active Session Control */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-medium mb-4">Active Session</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Michael Chen</span>
                  <span className="text-white">Detox Trinity</span>
                </div>
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-purple-400"
                    initial={{ width: "0%" }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/40">58:30 / 90:00</span>
                  <span className="text-white/60">31:30 remaining</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 bg-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/20 transition-all">
                    Pause
                  </button>
                  <button className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white hover:scale-[1.02] transition-transform">
                    Complete
                  </button>
                </div>
              </div>
            </div>

            {/* AI Assistant Preview */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-400/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-medium">AI Assistant</h3>
              </div>
              <p className="text-white/60 text-sm mb-4">
                "Michael prefers lower light intensity. Consider starting at 60% for the first 10 minutes."
              </p>
              <button className="text-purple-400 text-sm hover:text-purple-300 transition-colors">
                View recommendations →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hydration Builder Modal */}
      <AnimatePresence>
        {showHydrationBuilder && selectedGuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHydrationBuilder(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-purple-950/90 to-black backdrop-blur-xl rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-purple-400/20"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-light text-white mb-1">Wellness Assessment</h2>
                  <p className="text-white/60">Guest: {selectedGuest.name}</p>
                </div>
                <button
                  onClick={() => setShowHydrationBuilder(false)}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Assessment Flow */}
              <div className="space-y-6">
                {/* Step 1: Diet Lean */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-white font-medium mb-4">What&apos;s your usual diet like?</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: "🍎", label: "Fruits", value: 3 },
                      { icon: "🥗", label: "Salads", value: 2 },
                      { icon: "🍔", label: "Fast Food", value: 1 },
                      { icon: "☕", label: "Coffee", value: 4 }
                    ].map((item) => (
                      <div key={item.label} className="text-center">
                        <div className="relative w-24 h-24 mx-auto mb-2">
                          <div 
                            className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center text-3xl"
                            style={{ transform: `scale(${0.5 + item.value * 0.15})` }}
                          >
                            {item.icon}
                          </div>
                        </div>
                        <p className="text-white/60 text-sm">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 2: Weekly Events */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-white font-medium mb-4">What&apos;s happening this week?</h3>
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <div key={day} className="text-center">
                        <p className="text-white/40 text-xs mb-2">{day}</p>
                        <div className="bg-white/10 rounded-lg p-4 min-h-[80px] border border-white/20">
                          {day === "Tue" && <span className="text-2xl">💪</span>}
                          {day === "Thu" && <span className="text-2xl">🧘</span>}
                          {day === "Sat" && <span className="text-2xl">🍷</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { icon: "💪", label: "Workout" },
                      { icon: "🧘", label: "Stress" },
                      { icon: "🍷", label: "Social" },
                      { icon: "✈️", label: "Travel" },
                      { icon: "🌡️", label: "Heat" }
                    ].map((event) => (
                      <button
                        key={event.label}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all flex items-center gap-2"
                      >
                        <span>{event.icon}</span>
                        <span className="text-sm">{event.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3: Generated Plan */}
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-400/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-medium">Your Personalized Hydration Plan</h3>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">💧</span>
                        <div>
                          <p className="text-white text-sm">Alkaline Water (3x)</p>
                          <p className="text-white/40 text-xs">Morning hydration</p>
                        </div>
                      </div>
                      <span className="text-white/60 text-sm">75 DHS</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">⚡</span>
                        <div>
                          <p className="text-white text-sm">Electrolyte Boost (2x)</p>
                          <p className="text-white/40 text-xs">Post-workout</p>
                        </div>
                      </div>
                      <span className="text-white/60 text-sm">50 DHS</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🍄</span>
                        <div>
                          <p className="text-white text-sm">Chaga Focus Blend (2x)</p>
                          <p className="text-white/40 text-xs">Stressful day support</p>
                        </div>
                      </div>
                      <span className="text-white/60 text-sm">60 DHS</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🌿</span>
                        <div>
                          <p className="text-white text-sm">Gut Support Sachet (3x)</p>
                          <p className="text-white/40 text-xs">Balance after social events</p>
                        </div>
                      </div>
                      <span className="text-white/60 text-sm">45 DHS</span>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white/60">Total (10 items)</span>
                      <span className="text-xl text-white font-light">230 DHS</span>
                    </div>
                    <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:scale-[1.02] transition-transform">
                      Add to Session Checkout
                    </button>
                    <p className="text-white/40 text-xs text-center mt-3">
                      The complete plan with usage instructions will be available in {selectedGuest.name}&apos;s profile
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
