"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  User, Calendar, Droplets, Target, TrendingUp,
  ChevronRight, Plus, Check, Clock, Award,
  Heart, Brain, Zap, Shield, Star
} from "lucide-react"

export default function UserPortal() {
  const [activeView, setActiveView] = useState("overview")
  const [hydrationGoal] = useState(2500)
  const [hydrationProgress] = useState(1750)

  // Mock user data
  const userData = {
    name: "Sarah Johnson",
    memberSince: "January 2024",
    totalSessions: 12,
    favoriteExperience: "AOI BED",
    nextSession: {
      date: "Tomorrow",
      time: "10:00 AM",
      experience: "AOI BED",
      venue: "Dubai"
    },
    hydrationPlan: {
      daily: 2500,
      current: 1750,
      streak: 7,
      recommendations: [
        { name: "Alkaline Water", amount: "500ml", time: "Morning", icon: "💧" },
        { name: "Electrolyte Boost", amount: "250ml", time: "Post-Session", icon: "⚡" },
        { name: "Mineral Water", amount: "750ml", time: "Throughout Day", icon: "💎" }
      ]
    },
    recentSessions: [
      { date: "Aug 18", experience: "AOI BED", duration: "60 min", rating: 5 },
      { date: "Aug 15", experience: "Detox Trinity", duration: "90 min", rating: 5 },
      { date: "Aug 10", experience: "AOI AIR", duration: "45 min", rating: 4 }
    ],
    achievements: [
      { name: "First Session", icon: "🌟", unlocked: true },
      { name: "Hydration Streak", icon: "💧", unlocked: true },
      { name: "Trinity Master", icon: "♾️", unlocked: false },
      { name: "Wellness Warrior", icon: "🛡️", unlocked: false }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-light text-white">AOI</div>
              <div className="text-sm text-white/60">Member Portal</div>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-sm font-medium hover:scale-105 transition-transform">
                Book Session
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-medium">
                SJ
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-light text-white mb-2">
            Welcome back, <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-medium">Sarah</span>
          </h1>
          <p className="text-white/60">Your wellness journey continues</p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: "overview", label: "Overview", icon: <User className="w-4 h-4" /> },
            { id: "hydration", label: "Hydration Plan", icon: <Droplets className="w-4 h-4" /> },
            { id: "sessions", label: "Sessions", icon: <Calendar className="w-4 h-4" /> },
            { id: "progress", label: "Progress", icon: <TrendingUp className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeView === tab.id
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {activeView === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Next Session Card */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-400/20">
                  <h3 className="text-white font-medium mb-4">Your Next Session</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-3xl mb-2">🛸</div>
                      <h4 className="text-xl text-white mb-2">{userData.nextSession.experience}</h4>
                      <div className="space-y-2 text-sm text-white/60">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {userData.nextSession.date}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {userData.nextSession.time}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between">
                      <div className="bg-white/10 rounded-xl p-4">
                        <p className="text-white/60 text-sm mb-2">Pre-session tip:</p>
                        <p className="text-white text-sm">Hydrate well and avoid heavy meals 2 hours before your session</p>
                      </div>
                      <button className="mt-4 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm hover:bg-white/20 transition-all">
                        Manage Booking
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {[
                    { label: "Total Sessions", value: userData.totalSessions, icon: <Calendar className="w-4 h-4" /> },
                    { label: "Hydration Streak", value: `${userData.hydrationPlan.streak} days`, icon: <Droplets className="w-4 h-4" /> },
                    { label: "Favorite", value: userData.favoriteExperience, icon: <Heart className="w-4 h-4" /> },
                    { label: "Member Since", value: userData.memberSince, icon: <Award className="w-4 h-4" /> }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10"
                    >
                      <div className="text-white/40 mb-2">{stat.icon}</div>
                      <div className="text-xl font-light text-white">{stat.value}</div>
                      <div className="text-xs text-white/60">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Hydration Widget */}
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <h3 className="text-white font-medium mb-4">Today's Hydration</h3>
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="url(#gradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${(hydrationProgress / hydrationGoal) * 352} 352`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient">
                          <stop offset="0%" stopColor="#a78bfa" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-2xl font-light text-white">{hydrationProgress}ml</div>
                      <div className="text-xs text-white/60">of {hydrationGoal}ml</div>
                    </div>
                  </div>
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-medium hover:scale-[1.02] transition-transform">
                    Log Water Intake
                  </button>
                </div>

                {/* Achievements */}
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <h3 className="text-white font-medium mb-4">Achievements</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {userData.achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg text-center ${
                          achievement.unlocked
                            ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30"
                            : "bg-white/5 border border-white/10 opacity-50"
                        }`}
                      >
                        <div className="text-2xl mb-1">{achievement.icon}</div>
                        <div className="text-xs text-white/80">{achievement.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeView === "hydration" && (
            <motion.div
              key="hydration"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Hydration Plan Builder */}
              <div className="lg:col-span-2">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <h3 className="text-white font-medium mb-6">Your Personalized Hydration Plan</h3>
                  
                  {/* Daily Schedule */}
                  <div className="space-y-4">
                    {[
                      { time: "7:00 AM", item: "Alkaline Water", amount: "500ml", icon: "💧", completed: true },
                      { time: "9:00 AM", item: "Green Tea", amount: "250ml", icon: "🍵", completed: true },
                      { time: "11:00 AM", item: "Coconut Water", amount: "300ml", icon: "🥥", completed: true },
                      { time: "1:00 PM", item: "Mineral Water", amount: "500ml", icon: "💎", completed: false },
                      { time: "3:00 PM", item: "Electrolyte Mix", amount: "250ml", icon: "⚡", completed: false },
                      { time: "6:00 PM", item: "Herbal Tea", amount: "200ml", icon: "🌿", completed: false }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center justify-between p-4 rounded-xl ${
                          item.completed
                            ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/20"
                            : "bg-white/5 border border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{item.icon}</div>
                          <div>
                            <div className="text-white font-medium">{item.item}</div>
                            <div className="text-sm text-white/60">{item.time} • {item.amount}</div>
                          </div>
                        </div>
                        <button className={`p-2 rounded-lg transition-all ${
                          item.completed
                            ? "bg-green-500/20 text-green-400"
                            : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                        }`}>
                          {item.completed ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Add Custom Item */}
                  <button className="w-full mt-6 p-4 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Custom Hydration
                  </button>
                </div>
              </div>

              {/* Insights & Recommendations */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-400/20">
                  <h3 className="text-white font-medium mb-4">AI Recommendations</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Brain className="w-5 h-5 text-blue-400 mt-1" />
                      <div>
                        <p className="text-white text-sm">Based on your AOI BED session tomorrow</p>
                        <p className="text-white/60 text-xs mt-1">Increase electrolyte intake 2 hours before</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-yellow-400 mt-1" />
                      <div>
                        <p className="text-white text-sm">Energy optimization detected</p>
                        <p className="text-white/60 text-xs mt-1">Add adaptogenic drinks post-session</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-400 mt-1" />
                      <div>
                        <p className="text-white text-sm">Recovery enhancement</p>
                        <p className="text-white/60 text-xs mt-1">Consider mineral water with magnesium</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly Progress */}
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <h3 className="text-white font-medium mb-4">Weekly Progress</h3>
                  <div className="space-y-3">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                      <div key={day} className="flex items-center gap-3">
                        <span className="text-white/60 text-sm w-8">{day}</span>
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-400 to-cyan-400"
                            initial={{ width: "0%" }}
                            animate={{ width: `${index < 5 ? 100 : index === 5 ? 70 : 0}%` }}
                            transition={{ delay: index * 0.1 }}
                          />
                        </div>
                        <span className="text-white/40 text-xs">
                          {index < 5 ? "2.5L" : index === 5 ? "1.8L" : "0L"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
