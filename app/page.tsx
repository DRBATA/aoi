"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  Sparkles, Users, Calendar, User, CreditCard,
  ChevronRight, Globe, Shield, Zap
} from "lucide-react"

export default function Home() {
  const portals = [
    {
      title: "Guest Experience",
      description: "Book sessions and explore AOI",
      href: "/landing",
      icon: <Sparkles className="w-6 h-6" />,
      gradient: "from-purple-500 to-pink-500",
      features: ["Book Sessions", "View Experiences", "Multi-venue"]
    },
    {
      title: "Staff Dashboard",
      description: "Manage bookings and check-ins",
      href: "/dashboard",
      icon: <Users className="w-6 h-6" />,
      gradient: "from-blue-500 to-cyan-500",
      features: ["Check-in Guests", "Hydration Plans", "Session Control"]
    },
    {
      title: "Member Portal",
      description: "Your wellness journey",
      href: "/portal",
      icon: <User className="w-6 h-6" />,
      gradient: "from-green-500 to-emerald-500",
      features: ["View Plans", "Track Progress", "Achievements"]
    },
    {
      title: "Quick Check-in",
      description: "Streamlined guest arrival",
      href: "/checkin",
      icon: <Calendar className="w-6 h-6" />,
      gradient: "from-orange-500 to-red-500",
      features: ["Fast Assessment", "Weekly Plans", "Instant Setup"]
    },
    {
      title: "Checkout & Payment",
      description: "Complete purchase & send plans",
      href: "/checkout",
      icon: <CreditCard className="w-6 h-6" />,
      gradient: "from-indigo-500 to-purple-500",
      features: ["Process Payment", "Email Plans", "Receipt Generation"]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-light text-white mb-4">
              AOI Wellness Platform
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Unified system for wellness experiences, staff operations, and member journeys
            </p>
          </motion.div>
        </div>
      </header>

      {/* Portal Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portals.map((portal, index) => (
            <motion.div
              key={portal.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={portal.href}>
                <div className="group relative bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all cursor-pointer overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${portal.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  
                  <div className="relative">
                    <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${portal.gradient} rounded-xl mb-4 text-white`}>
                      {portal.icon}
                    </div>
                    
                    <h2 className="text-2xl font-light text-white mb-2">{portal.title}</h2>
                    <p className="text-white/60 mb-6">{portal.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {portal.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center text-white/60 group-hover:text-white transition-colors">
                      <span className="text-sm">Enter Portal</span>
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <Globe className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-white font-medium mb-2">Multi-Venue Support</h3>
            <p className="text-white/60 text-sm">Dubai, Berlin, Ibiza, Costa Rica - unified experience across all locations</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <Zap className="w-8 h-8 text-yellow-400 mb-4" />
            <h3 className="text-white font-medium mb-2">AI-Powered Plans</h3>
            <p className="text-white/60 text-sm">Personalized hydration and wellness recommendations based on lifestyle</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <Shield className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-white font-medium mb-2">Seamless Integration</h3>
            <p className="text-white/60 text-sm">All-in-one platform for bookings, check-ins, and payment processing</p>
          </div>
        </motion.div>

        {/* Mobile Optimized Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 text-center"
        >
          <p className="text-white/40 text-sm">
            ✨ Optimized for mobile and tablet devices • Works seamlessly on staff iPads
          </p>
        </motion.div>
      </div>
    </div>
  )
}
