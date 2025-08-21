"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, ShoppingCart, CreditCard, Mail, Phone, User,
  Check, ChevronRight, Droplets,
  Clock, MapPin, Sparkles, Download, Send,
  Receipt, MessageSquare, Banknote
} from "lucide-react"

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  sessionData?: {
    experience: string
    duration: string
    room: string
    time: string
    date: string
    price: number
  }
  hydrationPlan?: {
    items: Array<{
      name: string
      quantity: number
      timing: string
      price: number
      icon: string
    }>
    totalPrice: number
    duration: string
    startDate: string
  }
  guestData?: {
    id: string
    name: string
    email?: string
    phone?: string
  }
  onComplete?: (data: unknown) => void
}

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  sessionData,
  hydrationPlan,
  guestData,
  onComplete 
}: CheckoutModalProps) {
  const [step, setStep] = useState<"summary" | "payment" | "complete">("summary")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash" | "room">("card")
  const [email, setEmail] = useState(guestData?.email || "")
  const [phone, setPhone] = useState(guestData?.phone || "")
  const [receiptMethod, setReceiptMethod] = useState<"email" | "print" | "both">("email")
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Default data if not provided
  const session = sessionData || {
    experience: "Wellness Session",
    duration: "60 minutes",
    room: "Suite 1",
    time: "2:00 PM",
    date: "Today",
    price: 350
  }
  
  const plan = hydrationPlan || {
    items: [],
    totalPrice: 0,
    duration: "7 days",
    startDate: "Tomorrow"
  }
  
  const subtotal = session.price + plan.totalPrice
  const tax = subtotal * 0.05
  const total = subtotal + tax

  const handlePayment = async () => {
    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setStep("complete")
      setIsProcessing(false)
      
      // Prepare checkout data
      const checkoutData = {
        guestId: guestData?.id,
        email,
        phone,
        paymentMethod,
        receiptMethod,
        session,
        hydrationPlan: plan,
        totals: {
          subtotal,
          tax,
          total
        },
        transactionId: `AOI-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        timestamp: new Date().toISOString()
      }
      
      onComplete?.(checkoutData)
    }, 2000)
  }

  const handleClose = () => {
    onClose()
    // Reset state after modal closes
    setTimeout(() => {
      setStep("summary")
      setPaymentMethod("card")
      setReceiptMethod("email")
      setIsProcessing(false)
    }, 300)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && !isProcessing && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-purple-950/50 to-gray-900 rounded-3xl p-8 relative"
          >
            {/* Close button */}
            {!isProcessing && (
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            )}

            <AnimatePresence mode="wait">
              {/* Summary Step */}
              {step === "summary" && (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                      <ShoppingCart className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-light text-white">Checkout</h2>
                    <p className="text-white/60 mt-2">Complete your wellness journey</p>
                  </div>

                  <div className="space-y-4">
                    {/* Session Summary */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <h3 className="text-xl text-white">Today&apos;s Session</h3>
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

                    {/* Hydration Plan Summary (if exists) */}
                    {plan.items.length > 0 && (
                      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/20">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Droplets className="w-5 h-5 text-blue-400" />
                            <h3 className="text-xl text-white">Hydration Plan</h3>
                          </div>
                          <span className="text-sm text-white/60 bg-white/10 px-3 py-1 rounded-full">
                            {plan.duration}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          {plan.items.slice(0, 3).map((item, index) => (
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
                          {plan.items.length > 3 && (
                            <p className="text-center text-white/40 text-sm">+{plan.items.length - 3} more items</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact Information */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                      <h3 className="text-lg text-white mb-4">Contact Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-white/60 text-sm block mb-2">Email Address</label>
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
                          <label className="text-white/60 text-sm block mb-2">Phone Number (Optional)</label>
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

                    {/* Payment Method */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                      <h3 className="text-lg text-white mb-4">Payment Method</h3>
                      <div className="grid grid-cols-3 gap-3">
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
                          <Banknote className="w-6 h-6 text-white mb-2 mx-auto" />
                          <p className="text-white text-sm">Cash</p>
                        </button>
                        <button
                          onClick={() => setPaymentMethod("room")}
                          className={`p-4 rounded-xl border transition-all ${
                            paymentMethod === "room"
                              ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400"
                              : "bg-white/5 border-white/20 hover:bg-white/10"
                          }`}
                        >
                          <User className="w-6 h-6 text-white mb-2 mx-auto" />
                          <p className="text-white text-sm">Room</p>
                        </button>
                      </div>
                    </div>

                    {/* Receipt Method */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                      <h3 className="text-lg text-white mb-4">Receipt Delivery</h3>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => setReceiptMethod("email")}
                          className={`p-4 rounded-xl border transition-all ${
                            receiptMethod === "email"
                              ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400"
                              : "bg-white/5 border-white/20 hover:bg-white/10"
                          }`}
                        >
                          <Mail className="w-6 h-6 text-white mb-2 mx-auto" />
                          <p className="text-white text-sm">Email</p>
                        </button>
                        <button
                          onClick={() => setReceiptMethod("print")}
                          className={`p-4 rounded-xl border transition-all ${
                            receiptMethod === "print"
                              ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400"
                              : "bg-white/5 border-white/20 hover:bg-white/10"
                          }`}
                        >
                          <Receipt className="w-6 h-6 text-white mb-2 mx-auto" />
                          <p className="text-white text-sm">Print</p>
                        </button>
                        <button
                          onClick={() => setReceiptMethod("both")}
                          className={`p-4 rounded-xl border transition-all ${
                            receiptMethod === "both"
                              ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400"
                              : "bg-white/5 border-white/20 hover:bg-white/10"
                          }`}
                        >
                          <MessageSquare className="w-6 h-6 text-white mb-2 mx-auto" />
                          <p className="text-white text-sm">Both</p>
                        </button>
                      </div>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                      <div className="space-y-3">
                        <div className="flex justify-between text-white/60">
                          <span>Session</span>
                          <span>{session.price} DHS</span>
                        </div>
                        {plan.totalPrice > 0 && (
                          <div className="flex justify-between text-white/60">
                            <span>Hydration Plan</span>
                            <span>{plan.totalPrice} DHS</span>
                          </div>
                        )}
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

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => setStep("payment")}
                        disabled={!email && receiptMethod !== "print"}
                        className="flex-1 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        Proceed to Payment
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {!email && receiptMethod !== "print" && (
                      <p className="text-center text-red-400 text-sm">Please enter an email address to continue</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Payment Processing Step */}
              {step === "payment" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-12"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 animate-pulse">
                    {paymentMethod === "card" && <CreditCard className="w-10 h-10 text-white" />}
                    {paymentMethod === "cash" && <Banknote className="w-10 h-10 text-white" />}
                    {paymentMethod === "room" && <User className="w-10 h-10 text-white" />}
                  </div>
                  
                  <h2 className="text-3xl text-white mb-2">Processing Payment</h2>
                  <p className="text-xl text-white/60 mb-8">Total: {total.toFixed(0)} DHS</p>
                  
                  {paymentMethod === "card" && (
                    <div className="space-y-4 mb-8">
                      <p className="text-white/80">Tap your card on the reader</p>
                      <div className="flex justify-center gap-2">
                        <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                  
                  {paymentMethod === "cash" && (
                    <p className="text-white/80 mb-8">Please provide cash to the concierge</p>
                  )}
                  
                  {paymentMethod === "room" && (
                    <p className="text-white/80 mb-8">Charging to room {session.room}</p>
                  )}
                  
                  <button
                    onClick={handlePayment}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-medium hover:scale-[1.02] transition-transform"
                  >
                    Simulate Payment Complete
                  </button>
                </motion.div>
              )}

              {/* Complete Step */}
              {step === "complete" && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
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
                    <p className="text-xl text-white/60">Thank you, {guestData?.name || "Guest"}!</p>
                  </div>

                  {/* What Happens Next */}
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/20 mb-6">
                    <h3 className="text-xl text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      What Happens Next
                    </h3>
                    
                    <div className="space-y-4">
                      {receiptMethod !== "print" && (
                        <div className="flex gap-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Mail className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-left">
                            <p className="text-white mb-1">Receipt Sent</p>
                            <p className="text-white/60 text-sm">
                              Your receipt has been sent to {email}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {plan.items.length > 0 && (
                        <div className="flex gap-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Droplets className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-left">
                            <p className="text-white mb-1">Hydration Plan Active</p>
                            <p className="text-white/60 text-sm">
                              Your {plan.duration} wellness plan starts {plan.startDate.toLowerCase()}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-white mb-1">Member Portal</p>
                          <p className="text-white/60 text-sm">
                            Access your wellness history anytime at our member portal
                          </p>
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
                      <p className="text-white text-sm">Share Experience</p>
                    </button>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={handleClose}
                    className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:scale-[1.02] transition-transform"
                  >
                    Return to Dashboard
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
