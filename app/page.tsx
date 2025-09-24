"use client"

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X, ChevronDown, Sparkles, Zap, Brain, Award, Users, Clock } from 'lucide-react'
import ShaderBackground from '@/components/shader-background'
import FloatingPaths from "@/components/kokonutui/floating-paths"
import AOIBookingForm from '@/components/AOIBookingForm'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('philosophy')


  const experiences = [
    {
      id: "aoi",
      name: "AOI",
      description: "The core light & sound machine experience - immersive frequencies for cellular transformation",
      icon: "✨",
      duration: "20 min",
      benefits: ["Cellular activation", "Frequency healing", "Energy alignment"],
      color: "from-purple-400 to-pink-400"
    },
    {
      id: "aoi-earth",
      name: "AOI EARTH",
      description: "Horizontal lying bed version - grounding light & sound therapy for deep relaxation",
      icon: "🌍",
      duration: "45 min",
      benefits: ["Deep grounding", "Stress relief", "Restorative healing"],
      color: "from-green-400 to-emerald-400"
    },
    {
      id: "aoi-air",
      name: "AOI AIR",
      description: "Standing light & sound experience for physical unwinding and movement-based release",
      icon: "🌬️",
      duration: "20 min",
      benefits: ["Physical unwinding", "Movement therapy", "Postural alignment"],
      color: "from-cyan-400 to-blue-400"
    },
    {
      id: "aoi-air-pro",
      name: "AOI AIR PRO",
      description: "Intense version of AOI AIR with advanced protocols for deeper transformation",
      icon: "⭐",
      duration: "30 min",
      benefits: ["Advanced healing", "Peak performance", "Intensive unwinding"],
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "ice-bath",
      name: "Ice Bath",
      description: "Cold immersion therapy for mental clarity, circulation boost and resilience training",
      icon: "❄️",
      duration: "6 min",
      benefits: ["Mental clarity", "Circulation boost", "Resilience training"],
      color: "from-blue-500 to-cyan-300"
    },
    {
      id: "infrared-sauna",
      name: "Infrared Sauna",
      description: "Deep heat therapy for detoxification, cardiovascular stimulation and recovery",
      icon: "🔥",
      duration: "30 min",
      benefits: ["Deep detox", "Cardiovascular boost", "Recovery"],
      color: "from-red-400 to-orange-400"
    }
  ]










  // LiveKit connection function removed

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
              <Link href="#home" className="text-white/70 hover:text-white transition-colors">Home</Link>
              <Link href="#how-it-works" className="text-white/70 hover:text-white transition-colors">Technology</Link>
              <Link href="#experiences" className="text-white/70 hover:text-white transition-colors">Experiences</Link>
              <Link href="#booking" className="text-white/70 hover:text-white transition-colors">Book Session</Link>
              <Link href="#contact" className="text-white/70 hover:text-white transition-colors">Contact</Link>
            </div>
            
            {/* Desktop CTA */}
            <div className="hidden md:block">
              <Link href="#booking" className="px-6 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white text-sm hover:bg-white/20 transition-all">
                Book AOI Session
              </Link>
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
              <Link 
                href="#home" 
                className="block text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="#how-it-works" 
                className="block text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Technology
              </Link>
              <Link 
                href="#experiences" 
                className="block text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Experiences
              </Link>
              <Link 
                href="#booking" 
                className="block text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Session
              </Link>
              <Link 
                href="#contact" 
                className="block text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="border-t border-white/10 pt-4">
                <Link 
                  href="/udash" 
                  className="block text-purple-400 hover:text-purple-300 transition-colors py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Staff Dashboard
                </Link>
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
                Your wellbeing journey
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent font-medium">
                  starts here
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Experience how AOI weaves together temperature, sound, light and stillness 
              in perfect rhythm, creating the conditions for deep transformation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Link href="#booking" className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-medium hover:scale-105 transition-transform shadow-2xl inline-block">
                Book Your Session
              </Link>
              <Link href="#how-it-works" className="px-8 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white font-medium hover:bg-white/20 transition-all inline-block">
                Learn More
              </Link>
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
        Not forcing anything. <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">Just creating conditions.</span>
      </h2>
      <p className="text-white/70 max-w-2xl mx-auto">
        Light, sound, and temperature create space for your body to do what it already knows.
      </p>
    </motion.div>

    {/* Tab Navigation */}
    <div className="flex flex-wrap justify-center gap-2 mb-12">
      {[
        { id: 'how-it-works', label: 'How It Works', icon: <Sparkles className="w-4 h-4" /> },
        { id: 'social', label: 'The Vibe', icon: <Users className="w-4 h-4" /> },
        { id: 'philosophy', label: 'Philosophy', icon: <Brain className="w-4 h-4" /> },
        { id: 'founder', label: 'Creator', icon: <Zap className="w-4 h-4" /> }
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
            activeTab === tab.id
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>

    {/* Tab Content */}
    <div className="max-w-4xl mx-auto">
      {activeTab === 'how-it-works' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🎨</span>
              <h3 className="text-xl font-medium text-white">Art-Built Containers</h3>
            </div>
            <p className="text-white/60 mb-3">
              Each AOI experience is an artisanal state-changer. Immersive light and sound create a ritual container where your nervous system can find its own steadier set point.
            </p>
            <p className="text-white/60">
              It's not about forcing anything — it's about giving your body the right conditions to do what it already knows.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🌊</span>
              <h3 className="text-xl font-medium text-white">How Position Changes Everything</h3>
            </div>
            <div className="space-y-3 text-white/60">
              <p><strong className="text-white">Standing (AIR):</strong> Movement permission. Your fascia unwinds through micro-movements. Shoulders drop without trying.</p>
              <p><strong className="text-white">Lying (EARTH):</strong> Load off. Subtraction lets your spine lengthen, breath deepen, thoughts settle.</p>
              <p><strong className="text-white">Floating:</strong> Maximum subtraction. Boundaries dissolve then reform clearer. Spontaneous reorganization.</p>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🔥❄️</span>
              <h3 className="text-xl font-medium text-white">Temperature as Teacher</h3>
            </div>
            <p className="text-white/60 mb-3">
              <strong className="text-white">Ice:</strong> Brief cold creates focus then release. Your system learns to find calm in intensity. Mind sharpens, body rebounds.
            </p>
            <p className="text-white/60">
              <strong className="text-white">Heat:</strong> Gentle warmth opens circulation, lengthens breath. Muscles soften, you're ready for what's next.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">✨</span>
              <h3 className="text-xl font-medium text-white">What You'll Actually Feel</h3>
            </div>
            <ul className="space-y-2 text-white/60">
              <li>• "Jaw unhooks, breath lengthens, movements feel smoother"</li>
              <li>• "Attention snaps clear, then softens into steady focus"</li>
              <li>• "Feet find the ground differently"</li>
              <li>• "Spine lengthens without effort"</li>
              <li>• "Mental chatter goes quiet"</li>
            </ul>
          </div>
        </motion.div>
      )}

      {activeTab === 'social' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-light text-white mb-2">Where Dubai's Creative Community Gathers</h3>
            <p className="text-white/60">Art gallery meets wellness lounge meets social club</p>
          </div>
          
          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="relative group overflow-hidden rounded-xl">
              <img src="/party.jpg" alt="Community celebrations" className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="absolute bottom-3 left-3 text-white text-sm font-medium">Celebrations</p>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-xl">
              <img src="/movement.jpg" alt="Dance & movement" className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="absolute bottom-3 left-3 text-white text-sm font-medium">Movement</p>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-xl">
              <img src="/connection.jpg" alt="Deep connections" className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="absolute bottom-3 left-3 text-white text-sm font-medium">Connection</p>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-xl">
              <img src="/community.jpg" alt="Water Bar gatherings" className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="absolute bottom-3 left-3 text-white text-sm font-medium">Water Bar</p>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-xl">
              <img src="/conversation.jpg" alt="Lounge vibes" className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="absolute bottom-3 left-3 text-white text-sm font-medium">Lounge Vibes</p>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-xl">
              <img src="/shop.jpg" alt="Fashion x Wellness" className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="absolute bottom-3 left-3 text-white text-sm font-medium">Johny Dar Fashion</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mt-8">
            <div className="text-center">
              <h4 className="text-xl font-medium text-white mb-3">Book Together</h4>
              <p className="text-white/60 mb-4">
                AOI is best experienced with friends. Book 3-4 experiences back-to-back for your complete wellness journey. 
                Dance between sessions, share signature drinks, create memories.
              </p>
              <div className="flex justify-center gap-8 text-center">
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">500+</p>
                  <p className="text-white/50 text-sm">Weekly Visitors</p>
                </div>
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">70%</p>
                  <p className="text-white/50 text-sm">Come in Groups</p>
                </div>
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">3-4</p>
                  <p className="text-white/50 text-sm">Avg Experiences</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'philosophy' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Keep existing philosophy content */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-medium text-white mb-4">Implosion vs Explosion</h3>
            <p className="text-white/60 mb-3">
              Humans have become addicted to exploding - constantly reacting, consuming, and pushing outward. 
              We've lost our connection to nature and how creation really takes its highest form: through implosion.
            </p>
            <p className="text-white/60">
              AOI invites you to turn inward, to implode your true potential onto the world without needing 
              to destroy your surroundings to grow.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-medium text-white mb-4">Beyond Replicas</h3>
            <p className="text-white/60">
              Most people are replicas - mimicking their ancestors or environment. It's hard to meet an original 
              expression because we're all copies in the same traffic jam. AOI helps you break free from being 
              just another copy and access your true originality.
            </p>
          </div>
        </motion.div>
      )}

{activeTab === 'founder' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
        >
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <Users className="w-16 h-16 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-medium text-white mb-2">Johny Dar</h3>
              <p className="text-purple-400 mb-4">Founder & Creator of AOI</p>
              <p className="text-white/60 mb-4">
                Multi-talented artist, designer, musician, philanthropist, and inventor. 
                Fashion designer since 1999, launched Johny Wonder label. 
                Driven to chase dreams and passionate about realization.
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300">Artist</span>
                <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300">Designer</span>
                <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300">Inventor</span>
                <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300">Philanthropist</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
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
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                onClick={() => {
                  // Scroll to booking section when experience is clicked
                  const bookingSection = document.getElementById('booking')
                  if (bookingSection) {
                    bookingSection.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                data-experience={exp.id}
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
                      <span key={benefit} className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/70">{benefit}</span>
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
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
              Let&apos;s Create Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Journey</span>
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Chat with our wellness guide to find your perfect pathway, or book directly below
            </p>
          </motion.div>

          <AOIBookingForm />
        </div>
      </section>


      {/* Footer */}
      <footer id="contact" className="py-12 px-4 border-t border-white/10 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <div className="text-2xl font-light text-white mb-2">AOI</div>
              <div className="text-white/40 text-sm">Art of Implosion &copy; 2024</div>
            </div>
            <div className="flex gap-8">
              <Link href="/privacy" className="text-white/60 hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="text-white/60 hover:text-white transition-colors">Terms</Link>
              <Link href="/contact" className="text-white/60 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
