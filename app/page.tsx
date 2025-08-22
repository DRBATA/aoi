"use client"

import { useState } from "react"
import ShaderBackground from "@/components/shader-background"
import FloatingPaths from "@/components/kokonutui/floating-paths"
import { motion } from "framer-motion"
import { ChevronDown, Sparkles, Zap, Brain, Clock, Menu, X } from "lucide-react"

export default function LandingPage() {
  const [, setSelectedExperience] = useState<string | null>(null)
  const [selectedVenue, setSelectedVenue] = useState("dubai")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const experiences = [
    {
      id: "aoi-air",
      name: "AOI AIR",
      description: "Standing light & sound shower with 10 LED panels for movement-based release",
      icon: "✨",
      duration: "45 min",
      benefits: ["Energy boost", "Mental clarity", "Posture alignment"],
      color: "from-purple-400 to-pink-400"
    },
    {
      id: "aoi-bed",
      name: "AOI BED",
      description: "Full-body light immersion with vibration for deep cellular rejuvenation",
      icon: "🛸",
      duration: "60 min",
      benefits: ["Deep relaxation", "Energy retention", "Cellular repair"],
      color: "from-blue-400 to-cyan-400"
    },
    {
      id: "aoi-earth",
      name: "AOI EARTH",
      description: "Grounding comfort session for profound relaxation",
      icon: "🌍",
      duration: "45 min",
      benefits: ["Stress relief", "Grounding", "Balance"],
      color: "from-green-400 to-emerald-400"
    },
    {
      id: "aoi-heat",
      name: "AOI HEAT",
      description: "Detoxifying sauna experience with light therapy",
      icon: "🔥",
      duration: "30 min",
      benefits: ["Detox", "Circulation", "Skin health"],
      color: "from-orange-400 to-red-400"
    },
    {
      id: "aoi-ice",
      name: "AOI ICE",
      description: "Invigorating cold plunge for recovery and resilience",
      icon: "❄️",
      duration: "15 min",
      benefits: ["Recovery", "Immunity", "Mental strength"],
      color: "from-cyan-400 to-blue-500"
    },
    {
      id: "detox-trinity",
      name: "Detox Trinity Cycle",
      description: "Ultimate detoxification journey combining heat, cold, and light",
      icon: "♾️",
      duration: "90 min",
      benefits: ["Complete detox", "Full reset", "Peak performance"],
      color: "from-purple-500 via-pink-500 to-orange-500"
    }
  ]

  const venues = [
    { id: "dubai", name: "Dubai", location: "The Johny Dar Experience", address: "Al Quoz" },
    { id: "berlin", name: "Berlin", location: "ORGÆNIC Salon", address: "Berliner Freiheit" },
    { id: "ibiza", name: "Ibiza", location: "Coming Soon", address: "" },
    { id: "costa-rica", name: "Costa Rica", location: "Coming Soon", address: "" }
  ]

  return (
    <div className="relative bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-light text-white tracking-wider">AOI</div>
              <div className="text-xs text-white/60 tracking-widest">ART OF IMPLOSION</div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#home" className="text-white/70 hover:text-white transition-colors">Home</a>
              <a href="#how-it-works" className="text-white/70 hover:text-white transition-colors">Technology</a>
              <a href="#experiences" className="text-white/70 hover:text-white transition-colors">Experiences</a>
              <a href="#booking" className="text-white/70 hover:text-white transition-colors">Book Session</a>
              <a href="#contact" className="text-white/70 hover:text-white transition-colors">Contact</a>
            </div>
            
            {/* Desktop CTA */}
            <div className="hidden md:block">
              <a href="#booking" className="px-6 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white text-sm hover:bg-white/20 transition-all">
                Book AOI Session
              </a>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 z-40"
          >
            <div className="px-4 py-6 space-y-4">
              <a 
                href="#home" 
                className="block text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </a>
              <a 
                href="#how-it-works" 
                className="block text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Technology
              </a>
              <a 
                href="#experiences" 
                className="block text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Experiences
              </a>
              <a 
                href="#booking" 
                className="block text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Session
              </a>
              <a 
                href="#contact" 
                className="block text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
              <div className="border-t border-white/10 pt-4">
                <a 
                  href="/udash" 
                  className="block text-purple-400 hover:text-purple-300 transition-colors py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Staff Login
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section with Shader Background */}
      <section id="home">
      <ShaderBackground>
        <div className="absolute inset-0 z-20 pointer-events-none">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
        
        <div className="min-h-screen flex flex-col items-center justify-center px-4 relative z-30 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-5xl md:text-7xl font-light text-white mb-4">
                Redefine your well-being
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent font-medium">
                  in one session
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              AOI combines synchronized 528 Hz light and sound therapy for 360° cellular rejuvenation.
              Experience the future of wellness through biophotonic technology.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <a href="#booking" className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-medium hover:scale-105 transition-transform shadow-2xl inline-block">
                Book Your Session
              </a>
              <a href="#how-it-works" className="px-8 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white font-medium hover:bg-white/20 transition-all inline-block">
                Learn More
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="flex items-center justify-center gap-2 text-white/60"
            >
              <span className="text-sm">Scroll to explore</span>
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </motion.div>
          </motion.div>
        </div>
      </ShaderBackground>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 bg-gradient-to-b from-black to-purple-950/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
              How <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">AOI</span> Works
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Delivering nutrients in the form of photons directly to your DNA
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Sparkles className="w-8 h-8" />, title: "528 Hz Frequency", description: "The love frequency that resonates with DNA repair and transformation" },
              { icon: <Brain className="w-8 h-8" />, title: "Biophotonic Field", description: "Light patterns targeting energetic pathways for cellular communication" },
              { icon: <Zap className="w-8 h-8" />, title: "Synchronized Delivery", description: "Light and sound work in harmony for maximum cellular absorption" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="text-purple-400 mb-4">{item.icon}</div>
                <h3 className="text-xl font-medium text-white mb-3">{item.title}</h3>
                <p className="text-white/60">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experiences Section */}
      <section id="experiences" className="py-24 px-4 bg-gradient-to-b from-purple-950/20 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
              Choose Your <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Experience</span>
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Each AOI session is designed to target specific wellness goals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => setSelectedExperience(exp.id)}
                className="relative bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${exp.color} opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl`}
                />
                
                <div className="relative z-10">
                  <div className="text-4xl mb-4">{exp.icon}</div>
                  <h3 className="text-xl font-medium text-white mb-2">{exp.name}</h3>
                  <p className="text-white/60 text-sm mb-4">{exp.description}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-white/40" />
                    <span className="text-white/40 text-sm">{exp.duration}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {exp.benefits.map((benefit) => (
                      <span key={benefit} className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/70">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="py-24 px-4 bg-gradient-to-b from-black to-purple-950/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10"
          >
            <h2 className="text-3xl md:text-4xl font-light text-white mb-8 text-center">
              Book Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">AOI Session</span>
            </h2>

            {/* Venue Selector */}
            <div className="mb-8">
              <label className="text-white/70 text-sm mb-3 block">Select Location</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {venues.map((venue) => (
                  <button
                    key={venue.id}
                    onClick={() => setSelectedVenue(venue.id)}
                    className={`p-4 rounded-xl border transition-all ${
                      selectedVenue === venue.id
                        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/50 text-white"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <div className="font-medium">{venue.name}</div>
                    <div className="text-xs opacity-70 mt-1">{venue.location}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Selector */}
            <div className="mb-8">
              <label className="text-white/70 text-sm mb-3 block">Select Experience</label>
              <select className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white appearance-none cursor-pointer">
                <option value="">Choose an experience...</option>
                {experiences.map((exp) => (
                  <option key={exp.id} value={exp.id}>{exp.name} - {exp.duration}</option>
                ))}
              </select>
            </div>

            {/* Date & Time */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Date</label>
                <input type="date" className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white" />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Time</label>
                <input type="time" className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white" />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <input placeholder="Your Name" className="p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40" />
              <input placeholder="Email" type="email" className="p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40" />
            </div>

            <button className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:scale-[1.02] transition-transform">
              Reserve Your Session
            </button>

            <p className="text-white/40 text-xs text-center mt-4">
              Payment is collected at the venue after your session
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 px-4 border-t border-white/10 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <div className="text-2xl font-light text-white mb-2">AOI</div>
              <div className="text-white/40 text-sm">Art of Implosion © 2024</div>
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-white/60 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
