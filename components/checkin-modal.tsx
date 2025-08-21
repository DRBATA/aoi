"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, Sparkles, ChevronRight, Check, 
  Calendar, Droplets,
  Weight, Activity, Brain, Moon
} from "lucide-react"

interface CheckinModalProps {
  isOpen: boolean
  onClose: () => void
  guestData?: {
    id: string
    name: string
    booking?: {
      experience: string
      time: string
      room?: string
    }
  }
  onComplete?: (data: unknown) => void
}

export default function CheckinModal({ isOpen, onClose, guestData, onComplete }: CheckinModalProps) {
  const [step, setStep] = useState<"welcome" | "assessment" | "advanced" | "plan" | "complete">("welcome")
  
  // Basic diet tracking
  const [dietLean, setDietLean] = useState({
    fruits: 0,
    salads: 0,
    fastfood: 0,
    coffee: 0
  })
  
  // Advanced wellness data
  const [wellnessData, setWellnessData] = useState({
    weight: "",
    bodyType: "average", // lean, average, athletic, heavy
    sleepQuality: 3, // 1-5 scale
    stressLevel: 3, // 1-5 scale
    activityLevel: "moderate" // low, moderate, high, athlete
  })
  
  // Weekly events
  const [weeklyEvents, setWeeklyEvents] = useState({
    workouts: false,
    stress: false,
    social: false,
    travel: false,
    heat: false
  })

  const handleDietTap = (category: keyof typeof dietLean) => {
    setDietLean(prev => ({
      ...prev,
      [category]: Math.min(prev[category] + 1, 5)
    }))
  }

  const toggleEvent = (event: keyof typeof weeklyEvents) => {
    setWeeklyEvents(prev => ({
      ...prev,
      [event]: !prev[event]
    }))
  }

  const handleComplete = () => {
    const assessmentData = {
      guestId: guestData?.id,
      diet: dietLean,
      wellness: wellnessData,
      weeklyEvents,
      timestamp: new Date().toISOString()
    }
    
    onComplete?.(assessmentData)
    onClose()
    
    // Reset for next use
    setTimeout(() => {
      setStep("welcome")
      setDietLean({ fruits: 0, salads: 0, fastfood: 0, coffee: 0 })
      setWeeklyEvents({ workouts: false, stress: false, social: false, travel: false, heat: false })
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
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-purple-950/50 to-gray-900 rounded-3xl p-8 relative"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <AnimatePresence mode="wait">
              {/* Welcome Step */}
              {step === "welcome" && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  
                  <h2 className="text-4xl font-light text-white mb-4">
                    Welcome, <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {guestData?.name || "Guest"}
                    </span>
                  </h2>
                  
                  {guestData?.booking && (
                    <p className="text-xl text-white/60 mb-8">
                      Your {guestData.booking.experience} session begins at {guestData.booking.time}
                    </p>
                  )}
                  
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-left mb-6">
                    <h3 className="text-xl font-light text-white mb-3">Personalized Wellness Assessment</h3>
                    <p className="text-white/70 mb-6">
                      Take 60 seconds to create your custom hydration plan based on your unique needs and this week's activities.
                    </p>
                    
                    <div className="space-y-3">
                      <button
                        onClick={() => setStep("assessment")}
                        className="w-full p-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white text-lg font-medium hover:scale-[1.02] transition-transform flex items-center justify-between group"
                      >
                        <span>Start Assessment</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                      
                      <button
                        onClick={handleComplete}
                        className="w-full p-5 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
                      >
                        Skip for Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Diet Assessment Step */}
              {step === "assessment" && (
                <motion.div
                  key="assessment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="mb-6">
                    <h2 className="text-3xl font-light text-white mb-2">Your Typical Week</h2>
                    <p className="text-white/60">Tap items to show frequency (0-5 times per week)</p>
                  </div>

                  {/* Diet Taps */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { key: "fruits" as const, icon: "🍎", label: "Fruits", color: "from-green-500 to-emerald-500" },
                        { key: "salads" as const, icon: "🥗", label: "Salads", color: "from-blue-500 to-cyan-500" },
                        { key: "fastfood" as const, icon: "🍔", label: "Fast Food", color: "from-red-500 to-orange-500" },
                        { key: "coffee" as const, icon: "☕", label: "Coffee", color: "from-amber-500 to-yellow-500" }
                      ].map((item) => (
                        <button
                          key={item.key}
                          onClick={() => handleDietTap(item.key)}
                          className="group focus:outline-none"
                        >
                          <div className="relative w-28 h-28 mx-auto mb-3">
                            <div 
                              className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-20 rounded-full flex items-center justify-center text-4xl transition-all hover:scale-110`}
                              style={{ 
                                transform: `scale(${0.5 + dietLean[item.key] * 0.1})`,
                                opacity: 0.2 + dietLean[item.key] * 0.16
                              }}
                            >
                              {item.icon}
                            </div>
                            
                            {/* Tap dots */}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    i < dietLean[item.key] 
                                      ? `bg-gradient-to-r ${item.color}` 
                                      : "bg-white/20"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-white/80 text-sm font-light">{item.label}</p>
                          <p className="text-white/40 text-xs mt-1">{dietLean[item.key]}x/week</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weekly Events */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-6">
                    <h3 className="text-xl text-white mb-4">This Week Includes:</h3>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { key: "workouts" as const, icon: "💪", label: "Workouts" },
                        { key: "stress" as const, icon: "😰", label: "High Stress" },
                        { key: "social" as const, icon: "🍷", label: "Social Events" },
                        { key: "travel" as const, icon: "✈️", label: "Travel" },
                        { key: "heat" as const, icon: "🌡️", label: "Heat Exposure" }
                      ].map((event) => (
                        <button
                          key={event.key}
                          onClick={() => toggleEvent(event.key)}
                          className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 ${
                            weeklyEvents[event.key]
                              ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/40 text-white"
                              : "bg-white/10 border border-white/20 text-white/60 hover:text-white hover:bg-white/20"
                          }`}
                        >
                          <span className="text-xl">{event.icon}</span>
                          <span className="text-sm font-light">{event.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep("advanced")}
                      className="flex-1 p-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:scale-[1.02] transition-transform"
                    >
                      Continue
                    </button>
                    <button
                      onClick={() => setStep("plan")}
                      className="px-6 py-5 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
                    >
                      Skip Advanced
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Advanced Assessment Step */}
              {step === "advanced" && (
                <motion.div
                  key="advanced"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="mb-6">
                    <h2 className="text-3xl font-light text-white mb-2">Fine-Tune Your Plan</h2>
                    <p className="text-white/60">Optional: Add more details for precision hydration</p>
                  </div>

                  {/* Body Metrics */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-6">
                    <h3 className="text-lg text-white mb-4 flex items-center gap-2">
                      <Weight className="w-5 h-5 text-purple-400" />
                      Body Metrics
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/60 text-sm mb-2 block">Weight (kg)</label>
                        <input
                          type="number"
                          value={wellnessData.weight}
                          onChange={(e) => setWellnessData(prev => ({ ...prev, weight: e.target.value }))}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                          placeholder="Optional"
                        />
                      </div>
                      
                      <div>
                        <label className="text-white/60 text-sm mb-2 block">Body Type</label>
                        <div className="grid grid-cols-2 gap-2">
                          {["lean", "average", "athletic", "heavy"].map((type) => (
                            <button
                              key={type}
                              onClick={() => setWellnessData(prev => ({ ...prev, bodyType: type }))}
                              className={`p-3 rounded-lg text-sm capitalize transition-all ${
                                wellnessData.bodyType === type
                                  ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/40 text-white"
                                  : "bg-white/10 border border-white/20 text-white/60 hover:text-white"
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Wellness Indicators */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-6">
                    <div className="space-y-4">
                      {/* Sleep Quality */}
                      <div>
                        <label className="text-white/60 text-sm mb-2 flex items-center gap-2">
                          <Moon className="w-4 h-4" />
                          Sleep Quality
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <button
                              key={level}
                              onClick={() => setWellnessData(prev => ({ ...prev, sleepQuality: level }))}
                              className={`flex-1 p-3 rounded-lg transition-all ${
                                wellnessData.sleepQuality >= level
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                                  : "bg-white/10 text-white/40"
                              }`}
                            >
                              {level === 1 ? "😴" : level === 5 ? "😊" : "😐"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Stress Level */}
                      <div>
                        <label className="text-white/60 text-sm mb-2 flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          Stress Level
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <button
                              key={level}
                              onClick={() => setWellnessData(prev => ({ ...prev, stressLevel: level }))}
                              className={`flex-1 p-3 rounded-lg transition-all ${
                                wellnessData.stressLevel >= level
                                  ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                                  : "bg-white/10 text-white/40"
                              }`}
                            >
                              {level === 1 ? "😌" : level === 5 ? "😰" : "😐"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Activity Level */}
                      <div>
                        <label className="text-white/60 text-sm mb-2 flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Activity Level
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {["low", "moderate", "high", "athlete"].map((level) => (
                            <button
                              key={level}
                              onClick={() => setWellnessData(prev => ({ ...prev, activityLevel: level }))}
                              className={`p-3 rounded-lg text-sm capitalize transition-all ${
                                wellnessData.activityLevel === level
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                  : "bg-white/10 border border-white/20 text-white/60 hover:text-white"
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep("plan")}
                    className="w-full p-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:scale-[1.02] transition-transform"
                  >
                    Generate My Plan
                  </button>
                </motion.div>
              )}

              {/* Plan Step */}
              {step === "plan" && (
                <motion.div
                  key="plan"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-light text-white mb-2">Your Hydration Plan</h2>
                    <p className="text-white/60">Personalized for your wellness journey</p>
                  </div>

                  {/* Plan Summary */}
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/20 mb-6">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-white/5 rounded-xl p-4">
                        <Droplets className="w-5 h-5 text-blue-400 mb-2" />
                        <p className="text-white text-lg font-light">2.8L/day</p>
                        <p className="text-white/60 text-sm">Let's get you feeling your best</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <Activity className="w-5 h-5 text-green-400 mb-2" />
                        <p className="text-white text-lg font-light">+450mg</p>
                        <p className="text-white/40 text-xs">Extra Electrolytes</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <Calendar className="w-5 h-5 text-purple-400 mb-2" />
                        <p className="text-white text-lg font-light">7 days</p>
                        <p className="text-white/40 text-xs">Plan Duration</p>
                      </div>
                    </div>

                    {/* Recommended Products */}
                    <div className="space-y-3 mb-6">
                      <h4 className="text-white/60 text-sm">Recommended Products</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span>💧</span>
                            <span className="text-white text-sm">Premium Alkaline Water (3x)</span>
                          </div>
                          <span className="text-white/40 text-sm">75 DHS</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span>⚡</span>
                            <span className="text-white text-sm">Electrolyte Boost (2x)</span>
                          </div>
                          <span className="text-white/40 text-sm">50 DHS</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span>🍄</span>
                            <span className="text-white text-sm">Adaptogen Blend (2x)</span>
                          </div>
                          <span className="text-white/40 text-sm">60 DHS</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white/60">Total Investment</span>
                        <span className="text-2xl text-white font-light">185 DHS</span>
                      </div>
                      
                      <div className="space-y-3">
                        <button
                          onClick={handleComplete}
                          className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:scale-[1.02] transition-transform"
                        >
                          Add to Session Checkout
                        </button>
                        <button
                          onClick={handleComplete}
                          className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
                        >
                          Email Plan Only
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-white/40 text-xs text-center">
                    Your detailed plan will be available in your member portal
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
