"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Sparkles, ChevronRight, Check, 
  User, Calendar, Clock, Droplets
} from "lucide-react"

export default function CheckIn() {
  const [step, setStep] = useState<"welcome" | "assessment" | "plan" | "complete">("welcome")
  const [guestName] = useState("Sarah Johnson")
  const [dietLean, setDietLean] = useState({
    fruits: 0,
    salads: 0,
    fastfood: 0,
    coffee: 0
  })

  const handleDietTap = (category: keyof typeof dietLean) => {
    setDietLean(prev => ({
      ...prev,
      [category]: Math.min(prev[category] + 1, 5)
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl text-center"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-8"
            >
              <Sparkles className="w-12 h-12 text-white" />
            </motion.div>
            
            <h1 className="text-5xl font-light text-white mb-4">
              Welcome, <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{guestName}</span>
            </h1>
            <p className="text-xl text-white/60 mb-12">Your AOI BED session begins in 5 minutes</p>
            
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-left">
              <h2 className="text-2xl font-light text-white mb-6">While you&apos;re here...</h2>
              <p className="text-white/80 mb-8">
                Would you like a complimentary wellness assessment? It takes 30 seconds and creates your personalized hydration plan for the week.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => setStep("assessment")}
                  className="w-full p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white text-lg font-medium hover:scale-[1.02] transition-transform flex items-center justify-between group"
                >
                  <span>Yes, create my plan</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={() => setStep("complete")}
                  className="w-full p-6 bg-white/10 border border-white/20 rounded-2xl text-white text-lg hover:bg-white/20 transition-all"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "assessment" && (
          <motion.div
            key="assessment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-4xl"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-light text-white mb-2">Quick Assessment</h2>
              <p className="text-white/60">Tap to show what you usually consume</p>
            </div>

            {/* Diet Lean Visual */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { key: "fruits" as const, icon: "🍎", label: "Fruits" },
                  { key: "salads" as const, icon: "🥗", label: "Salads" },
                  { key: "fastfood" as const, icon: "🍔", label: "Fast Food" },
                  { key: "coffee" as const, icon: "☕", label: "Coffee" }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleDietTap(item.key)}
                    className="group"
                  >
                    <div className="relative w-32 h-32 mx-auto mb-3">
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center text-4xl transition-transform hover:scale-110"
                        style={{ transform: `scale(${0.4 + dietLean[item.key] * 0.12})` }}
                      >
                        {item.icon}
                      </div>
                      {/* Tap indicator */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              i < dietLean[item.key] 
                                ? "bg-gradient-to-r from-purple-400 to-pink-400" 
                                : "bg-white/20"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-white/80 text-sm">{item.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Week Events */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-6">
              <h3 className="text-xl text-white mb-4">This week includes:</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: "💪", label: "2 Workouts", active: true },
                  { icon: "🧘", label: "Stressful presentation", active: true },
                  { icon: "🍷", label: "Social event", active: true },
                  { icon: "✈️", label: "Travel", active: false },
                  { icon: "🌡️", label: "Heat exposure", active: false }
                ].map((event) => (
                  <button
                    key={event.label}
                    className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 ${
                      event.active
                        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-white"
                        : "bg-white/10 border border-white/20 text-white/60 hover:text-white hover:bg-white/20"
                    }`}
                  >
                    <span className="text-xl">{event.icon}</span>
                    <span>{event.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep("plan")}
              className="w-full p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white text-lg font-medium hover:scale-[1.02] transition-transform"
            >
              Generate My Plan
            </button>
          </motion.div>
        )}

        {step === "plan" && (
          <motion.div
            key="plan"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-3xl"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-light text-white mb-2">Your Plan is Ready</h2>
              <p className="text-white/60">Personalized for your week ahead</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-3xl p-8 border border-purple-400/20">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl text-white">Weekly Hydration Plan</h3>
              </div>

              {/* Plan Summary */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span className="text-white/60 text-sm">Hydration</span>
                  </div>
                  <p className="text-white text-lg">10 items</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span className="text-white/60 text-sm">Duration</span>
                  </div>
                  <p className="text-white text-lg">7 days</p>
                </div>
              </div>

              {/* Items Preview */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span>💧</span>
                    <span className="text-white text-sm">Alkaline Water (3x) - Morning</span>
                  </div>
                  <span className="text-white/40 text-sm">75 DHS</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span>⚡</span>
                    <span className="text-white text-sm">Electrolyte Boost (2x) - Post-workout</span>
                  </div>
                  <span className="text-white/40 text-sm">50 DHS</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span>🍄</span>
                    <span className="text-white text-sm">Focus Blend (2x) - Stressful days</span>
                  </div>
                  <span className="text-white/40 text-sm">60 DHS</span>
                </div>
                <div className="text-center text-white/40 text-sm">+ 3 more items</div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/60">Total investment</span>
                  <span className="text-2xl text-white font-light">230 DHS</span>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setStep("complete")}
                    className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:scale-[1.02] transition-transform"
                  >
                    Add to Today&apos;s Checkout
                  </button>
                  <button
                    onClick={() => setStep("complete")}
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
                  >
                    Email Plan Only
                  </button>
                </div>
                
                <p className="text-white/40 text-xs text-center mt-4">
                  Your detailed plan with timing will be in your member portal
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {step === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-8"
            >
              <Check className="w-12 h-12 text-white" />
            </motion.div>
            
            <h1 className="text-4xl font-light text-white mb-4">You&apos;re All Set</h1>
            <p className="text-xl text-white/60 mb-8">Your wellness concierge will escort you to the AOI BED</p>
            
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/60">Session</span>
                <span className="text-white">AOI BED - 60 minutes</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/60">Room</span>
                <span className="text-white">Suite 3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Concierge</span>
                <span className="text-white">Marcus will assist you</span>
              </div>
            </div>
            
            <p className="text-white/40 text-sm mt-8">
              Payment will be collected after your session
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
