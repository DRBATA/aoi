"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ShoppingCart, CreditCard, Mail, Phone, User,
  Check, ChevronRight, Droplets, Calendar,
  Clock, MapPin, Sparkles, Download, Send
} from "lucide-react"

export default function Checkout() {
  const [step, setStep] = useState<"summary" | "payment" | "complete">("summary")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  
  // Mock session and plan data
  const session = {
    experience: "AOI BED",
    duration: "60 minutes",
    room: "Suite 3",
    time: "2:00 PM",
    date: "Today",
    price: 350
  }
  
  const hydrationPlan = {
    items: [
      { name: "Alkaline Water", quantity: 3, timing: "Morning", price: 75, icon: "💧" },
      { name: "Electrolyte Boost", quantity: 2, timing: "Post-workout", price: 50, icon: "⚡" },
      { name: "Focus Blend", quantity: 2, timing: "Before meetings", price: 60, icon: "🍄" },
      { name: "Recovery Water", quantity: 1, timing: "Evening", price: 45, icon: "🌙" }
    ],
    totalPrice: 230,
    duration: "7 days",
    startDate: "Tomorrow"
  }
  
  const subtotal = session.price + hydrationPlan.totalPrice
  const tax = subtotal * 0.05
  const total = subtotal + tax

  const handlePayment = () => {
    // In production, this would process payment
    setTimeout(() => {
      setStep("complete")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-light text-white">Checkout</h1>
        </div>

        <AnimatePresence mode="wait">
          {step === "summary" && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Session Summary */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl text-white">Today's Session</h2>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">{session.experience}</span>
                    <span className="text-white">{session.price} DHS</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {session.time} • {session.duration}
                    </span>
                    <span className="text-white/40">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      {session.room}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hydration Plan Summary */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Droplets className="w-5 h-5 text-blue-400" />
                    <h2 className="text-xl text-white">Weekly Hydration Plan</h2>
                  </div>
                  <span className="text-sm text-white/60 bg-white/10 px-3 py-1 rounded-full">
                    {hydrationPlan.duration}
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  {hydrationPlan.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <p className="text-white text-sm">{item.name} ({item.quantity}x)</p>
                          <p className="text-white/40 text-xs">{item.timing}</p>
                        </div>
                      </div>
                      <span className="text-white/60 text-sm">{item.price} DHS</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Plan starts</span>
                    <span className="text-white">{hydrationPlan.startDate}</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg text-white mb-4">Delivery Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-white/60 text-sm block mb-2">Email (for plan delivery)</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-12 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/60 text-sm block mb-2">Phone (optional)</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+971 50 123 4567"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-12 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="space-y-3">
                  <div className="flex justify-between text-white/60">
                    <span>Session</span>
                    <span>{session.price} DHS</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Hydration Plan</span>
                    <span>{hydrationPlan.totalPrice} DHS</span>
                  </div>
                  <div className="flex justify-between text-white/60 text-sm">
                    <span>VAT (5%)</span>
                    <span>{tax.toFixed(0)} DHS</span>
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <div className="flex justify-between text-xl">
                      <span className="text-white">Total</span>
                      <span className="text-white font-medium">{total.toFixed(0)} DHS</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg text-white mb-4">Payment Method</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`p-4 rounded-xl border transition-all ${
                      paymentMethod === "card"
                        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400"
                        : "bg-white/5 border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <CreditCard className="w-6 h-6 text-white mb-2 mx-auto" />
                    <p className="text-white text-sm">Card</p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-4 rounded-xl border transition-all ${
                      paymentMethod === "cash"
                        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400"
                        : "bg-white/5 border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <User className="w-6 h-6 text-white mb-2 mx-auto" />
                    <p className="text-white text-sm">Cash</p>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setStep("payment")}
                  className="flex-1 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  Proceed to Payment
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 animate-pulse">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="text-2xl text-white mb-2">Processing Payment</h2>
                <p className="text-white/60 mb-6">Total: {total.toFixed(0)} DHS</p>
                
                {paymentMethod === "card" ? (
                  <div className="space-y-4 mb-6">
                    <p className="text-white/80">Tap your card on the reader</p>
                    <div className="flex justify-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                ) : (
                  <p className="text-white/80 mb-6">Please provide cash to the concierge</p>
                )}
                
                <button
                  onClick={handlePayment}
                  className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-medium"
                >
                  Simulate Payment Complete
                </button>
              </div>
            </motion.div>
          )}

          {step === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6"
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>
                
                <h2 className="text-4xl font-light text-white mb-4">Payment Complete</h2>
                <p className="text-xl text-white/60">Your wellness journey begins now</p>
              </div>

              {/* What Happens Next */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl p-8 border border-purple-400/20 mb-6">
                <h3 className="text-xl text-white mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  What Happens Next
                </h3>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">1</span>
                    </div>
                    <div>
                      <p className="text-white mb-1">Session Begins</p>
                      <p className="text-white/60 text-sm">Your concierge will escort you to {session.room} for your {session.experience}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">2</span>
                    </div>
                    <div>
                      <p className="text-white mb-1">Hydration Plan Delivered</p>
                      <p className="text-white/60 text-sm">Your personalized 7-day plan has been sent to {email || "your email"}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">3</span>
                    </div>
                    <div>
                      <p className="text-white mb-1">Member Portal Access</p>
                      <p className="text-white/60 text-sm">Track your progress and view your plan anytime at aoi.wellness/portal</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">4</span>
                    </div>
                    <div>
                      <p className="text-white mb-1">Daily Reminders</p>
                      <p className="text-white/60 text-sm">Receive gentle nudges for optimal hydration timing</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button className="p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                  <Download className="w-6 h-6 text-purple-400 mb-2 mx-auto" />
                  <p className="text-white text-sm">Download Receipt</p>
                </button>
                <button className="p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                  <Send className="w-6 h-6 text-blue-400 mb-2 mx-auto" />
                  <p className="text-white text-sm">Share Plan</p>
                </button>
              </div>

              {/* Receipt Summary */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white/60 text-sm">Transaction ID</p>
                    <p className="text-white font-mono">AOI-2024-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/60 text-sm">Total Paid</p>
                    <p className="text-white text-xl">{total.toFixed(0)} DHS</p>
                  </div>
                </div>
                
                <div className="text-center pt-4 border-t border-white/10">
                  <p className="text-white/40 text-xs">
                    Thank you for choosing AOI Wellness • Dubai
                  </p>
                </div>
              </div>

              {/* Return Button */}
              <div className="mt-8 text-center">
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  <span>Return to Dashboard</span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
