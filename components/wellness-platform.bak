"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Droplets, Heart, Zap, Brain, Shield, Moon, Activity, Plus, CheckCircle, Users, TrendingUp } from "lucide-react"
import FrontDeskDashboard from "./front-desk-dashboard"

interface Guest {
  id: string
  name: string
  status: "checked-in" | "in-session" | "waiting" | "completed"
  goal: string
  experience: string
  time: string
  avatar?: string
}

interface BookingSlot {
  id: string
  time: string
  service: string
  price: number
  available: boolean
}

interface FoodItem {
  id: string
  name: string
  price: number
  category: "hydration" | "snack" | "supplement"
  description: string
}

interface CartItem extends FoodItem {
  quantity: number
}

interface HydrationPlan {
  id: string
  name: string
  items: string[]
  price: number
  description: string
}

const mockGuests: Guest[] = [
  { id: "1", name: "Alice Johnson", status: "checked-in", goal: "Recovery", experience: "Sauna Pod", time: "10:00am" },
  { id: "2", name: "Charlie Lee", status: "in-session", goal: "Relaxation", experience: "Float Tank", time: "10:30am" },
  { id: "3", name: "Bob Smith", status: "waiting", goal: "Energy", experience: "Ice Bath", time: "11:00am" },
]

const mockBookingSlots: BookingSlot[] = [
  { id: "1", time: "9:00 AM", service: "Sauna Pod", price: 25, available: true },
  { id: "2", time: "9:30 AM", service: "Float Tank", price: 35, available: true },
  { id: "3", time: "10:00 AM", service: "Ice Bath", price: 20, available: false },
  { id: "4", time: "10:30 AM", service: "Sauna Pod", price: 25, available: true },
  { id: "5", time: "11:00 AM", service: "Float Tank", price: 35, available: true },
  { id: "6", time: "11:30 AM", service: "Ice Bath", price: 20, available: true },
]

const mockFoodItems: FoodItem[] = [
  {
    id: "1",
    name: "Electrolyte Boost",
    price: 8,
    category: "hydration",
    description: "Essential minerals for recovery",
  },
  { id: "2", name: "Adaptogen Blend", price: 10, category: "supplement", description: "Stress-fighting botanicals" },
  { id: "3", name: "Sparkling Water", price: 5, category: "hydration", description: "Refreshing mineral water" },
  { id: "4", name: "Energy Bites", price: 12, category: "snack", description: "Organic nuts and dates" },
  { id: "5", name: "Protein Smoothie", price: 15, category: "snack", description: "Plant-based recovery drink" },
  { id: "6", name: "Magnesium Complex", price: 14, category: "supplement", description: "Muscle recovery support" },
]

const hydrationGoals = [
  { icon: Heart, label: "Heat Recovery", color: "text-red-500" },
  { icon: Activity, label: "Muscle Recovery", color: "text-green-500" },
  { icon: Brain, label: "Focus/Calm", color: "text-blue-500" },
  { icon: Shield, label: "Immune", color: "text-purple-500" },
  { icon: Moon, label: "Sleep", color: "text-indigo-500" },
  { icon: Zap, label: "Energy", color: "text-yellow-500" },
]

export function WellnessPlatform() {
  const [activeView, setActiveView] = useState<"staff" | "guest" | "booking" | "dashboard">("staff")
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [weekEvents, setWeekEvents] = useState<{ [key: string]: string }>({})

  const addToCart = (item: FoodItem) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id)
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(itemId)
      return
    }
    setCart((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
  }

  const addWeekEvent = (day: string, event: string) => {
    setWeekEvents((prev) => ({ ...prev, [day]: event }))
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "checked-in":
        return "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
      case "in-session":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
      case "waiting":
        return "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
      case "completed":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      default:
        return "bg-gray-100"
    }
  }

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="glass-strong rounded-2xl p-6 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-blue-500/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Serenity Wellness
            </h1>
            <p className="text-muted-foreground">AI-Powered Wellness Experience</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeView === "staff" ? "default" : "outline"}
              onClick={() => setActiveView("staff")}
              className={
                activeView === "staff"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  : "glass-card"
              }
            >
              Staff View
            </Button>
            <Button
              variant={activeView === "dashboard" ? "default" : "outline"}
              onClick={() => setActiveView("dashboard")}
              className={
                activeView === "dashboard"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  : "glass-card"
              }
            >
              Dashboard
            </Button>
            <Button
              variant={activeView === "booking" ? "default" : "outline"}
              onClick={() => setActiveView("booking")}
              className={
                activeView === "booking"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  : "glass-card"
              }
            >
              Book Now
            </Button>
            <Button
              variant={activeView === "guest" ? "default" : "outline"}
              onClick={() => setActiveView("guest")}
              className={
                activeView === "guest"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  : "glass-card"
              }
            >
              Guest View
            </Button>
          </div>
        </div>

        {activeView !== "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-200/50">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold text-emerald-700">12</p>
                  <p className="text-sm text-emerald-600/80">Guests Today</p>
                </div>
              </div>
            </Card>
            <Card className="glass-card p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-200/50">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-700">8</p>
                  <p className="text-sm text-green-600/80">Completed</p>
                </div>
              </div>
            </Card>
            <Card className="glass-card p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-200/50">
              <div className="flex items-center gap-3">
                <Droplets className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-700">24</p>
                  <p className="text-sm text-blue-600/80">Hydration Plans</p>
                </div>
              </div>
            </Card>
            <Card className="glass-card p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-200/50">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-700">$2,840</p>
                  <p className="text-sm text-purple-600/80">Revenue Today</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {activeView === "dashboard" ? (
        <FrontDeskDashboard />
      ) : activeView === "staff" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Guest Management */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="glass-strong p-6 bg-gradient-to-br from-slate-50/50 to-gray-100/50">
              <h2 className="text-xl font-serif font-semibold mb-4 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                Front Desk Dashboard
              </h2>
              <div className="space-y-4">
                {mockGuests.map((guest) => (
                  <div
                    key={guest.id}
                    className="glass-card p-4 rounded-xl cursor-pointer hover:scale-[1.02] transition-transform bg-gradient-to-r from-white/80 to-gray-50/80 border-gray-200/50"
                    onClick={() => setSelectedGuest(guest)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {guest.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{guest.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {guest.time} • {guest.experience}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(guest.status)}>{guest.status.replace("-", " ")}</Badge>
                        <Badge
                          variant="outline"
                          className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-indigo-200"
                        >
                          {guest.goal}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* AI Recommendations & Stock */}
          <div className="space-y-4">
            <Card className="glass-strong p-6 bg-gradient-to-br from-violet-50/50 to-purple-100/50">
              <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                AI Suggestions
              </h3>
              <div className="space-y-3">
                <div className="glass-card p-3 rounded-lg bg-gradient-to-r from-violet-100/50 to-purple-100/50 border-violet-200/50">
                  <p className="text-sm text-violet-700">Suggest hydration add-ons based on guest goals</p>
                </div>
                <div className="glass-card p-3 rounded-lg bg-gradient-to-r from-blue-100/50 to-cyan-100/50 border-blue-200/50">
                  <p className="text-sm text-blue-700">Check pod availability and propose upgrades</p>
                </div>
                <div className="glass-card p-3 rounded-lg bg-gradient-to-r from-emerald-100/50 to-teal-100/50 border-emerald-200/50">
                  <p className="text-sm text-emerald-700">Highlight cross-sells: electrolytes after sauna</p>
                </div>
              </div>
            </Card>

            <Card className="glass-strong p-6 bg-gradient-to-br from-green-50/50 to-emerald-100/50">
              <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Stock Levels
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Electrolytes ($8)</span>
                  <Badge
                    variant="outline"
                    className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-300"
                  >
                    12
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Adaptogens ($10)</span>
                  <Badge
                    variant="outline"
                    className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-300"
                  >
                    8
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-emerald-700">Sparkling ($5)</span>
                  <Badge
                    variant="outline"
                    className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-300"
                  >
                    20
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : activeView === "booking" ? (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Booking Slots */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="glass-strong p-6 bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-rose-50/50">
                <h2 className="text-2xl font-serif font-semibold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Available Sessions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockBookingSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`glass-card p-4 rounded-xl cursor-pointer transition-all ${
                        slot.available
                          ? "hover:scale-105 bg-gradient-to-br from-white/80 to-gray-50/80 border-gray-200/50"
                          : "opacity-50 bg-gradient-to-br from-gray-100/80 to-gray-200/80"
                      } ${
                        selectedSlot?.id === slot.id
                          ? "ring-2 ring-purple-500 bg-gradient-to-br from-purple-100/80 to-pink-100/80"
                          : ""
                      }`}
                      onClick={() => slot.available && setSelectedSlot(slot)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{slot.service}</h3>
                        <Badge
                          className={
                            slot.available
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                              : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                          }
                        >
                          {slot.available ? "Available" : "Booked"}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">{slot.time}</p>
                      <p className="text-lg font-semibold text-gray-700">${slot.price}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Food Basket */}
              <Card className="glass-strong p-6 bg-gradient-to-br from-orange-50/50 via-amber-50/50 to-yellow-50/50">
                <h3 className="text-xl font-serif font-semibold mb-4 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  Wellness Add-Ons
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockFoodItems.map((item) => (
                    <div
                      key={item.id}
                      className="glass-card p-4 rounded-lg bg-gradient-to-br from-white/80 to-orange-50/80 border-orange-200/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{item.name}</h4>
                        <Badge
                          className={
                            item.category === "hydration"
                              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                              : item.category === "supplement"
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                          }
                        >
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-orange-600">${item.price}</span>
                        <Button
                          onClick={() => addToCart(item)}
                          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Cart & Booking Summary */}
            <div className="space-y-4">
              <Card className="glass-strong p-6 bg-gradient-to-br from-indigo-50/50 to-blue-100/50">
                <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Your Cart
                </h3>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Cart is empty</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="glass-card p-3 rounded-lg bg-gradient-to-br from-white/80 to-indigo-50/80 border-indigo-200/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{item.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-6 w-6 p-0"
                            >
                              -
                            </Button>
                            <span>{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-6 w-6 p-0"
                            >
                              +
                            </Button>
                          </div>
                          <span className="font-semibold">${item.price * item.quantity}</span>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-indigo-600">${getCartTotal()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {selectedSlot && (
                <Card className="glass-strong p-6 bg-gradient-to-br from-green-50/50 to-emerald-100/50">
                  <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Selected Session
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <strong>Service:</strong> {selectedSlot.service}
                    </p>
                    <p>
                      <strong>Time:</strong> {selectedSlot.time}
                    </p>
                    <p>
                      <strong>Price:</strong> ${selectedSlot.price}
                    </p>
                  </div>
                  <Button className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                    Complete Booking (${selectedSlot.price + getCartTotal()})
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Guest Hydration Goals */}
          <Card className="glass-strong p-6 bg-gradient-to-br from-blue-50/50 via-indigo-50/50 to-purple-50/50">
            <h2 className="text-2xl font-serif font-semibold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Your Wellness Goals
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {hydrationGoals.map((goal, index) => (
                <div
                  key={index}
                  className="glass-card p-4 rounded-xl text-center hover:scale-105 transition-transform cursor-pointer gentle-float bg-gradient-to-br from-white/80 to-gray-50/80 border-gray-200/50"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <goal.icon className={`h-8 w-8 mx-auto mb-2 ${goal.color}`} />
                  <p className="text-sm font-medium">{goal.label}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Hydration Plan Builder */}
          <Card className="glass-strong p-6 bg-gradient-to-br from-emerald-50/50 to-teal-100/50">
            <h3 className="text-xl font-serif font-semibold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              AI Hydration Assessment
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-emerald-800">Diet Lean (Tap to adjust)</h4>
                <div className="flex gap-2 flex-wrap">
                  {["Protein", "Carbs", "Fats", "Fiber", "Sodium"].map((item) => (
                    <Button key={item} variant="outline" className="glass-card bg-transparent text-emerald-700">
                      {item}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-blue-800">This Week's Events</h4>
                <div className="grid grid-cols-7 gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div
                      key={day}
                      className="glass-card p-3 rounded-lg text-center bg-gradient-to-r from-white/80 to-gray-50/80 border-gray-200/50"
                    >
                      <p className="text-xs font-medium mb-2">{day}</p>
                      {weekEvents[day] ? (
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs p-1 rounded">
                          {weekEvents[day]}
                        </div>
                      ) : (
                        <div
                          className="h-8 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-blue-400"
                          onClick={() => {
                            const event = prompt(`Add event for ${day}:`)
                            if (event) addWeekEvent(day, event)
                          }}
                        >
                          <Plus className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
                Generate My Hydration Plan
              </Button>
            </div>
          </Card>

          {/* Sample Plan */}
          <Card className="glass-strong p-6 bg-gradient-to-br from-indigo-50/50 to-blue-100/50">
            <h3 className="text-xl font-serif font-semibold mb-4 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Your Personalized Plan
            </h3>
            <div className="space-y-4">
              <div className="glass-card p-4 rounded-lg bg-gradient-to-r from-green-100/80 to-emerald-100/80 border-green-200/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-green-800">Morning Boost</h4>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">Pre-Session</Badge>
                </div>
                <p className="text-sm text-green-700">Electrolyte blend with B-vitamins for energy</p>
              </div>
              <div className="glass-card p-4 rounded-lg bg-gradient-to-r from-blue-100/80 to-cyan-100/80 border-blue-200/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-blue-800">Recovery Complex</h4>
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">Post-Session</Badge>
                </div>
                <p className="text-sm text-blue-700">Magnesium and adaptogens for muscle recovery</p>
              </div>
              <div className="glass-card p-4 rounded-lg bg-gradient-to-r from-purple-100/80 to-pink-100/80 border-purple-200/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-purple-800">Evening Calm</h4>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Post-Session</Badge>
                </div>
                <p className="text-sm text-purple-700">Chamomile and L-theanine for restful sleep</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
