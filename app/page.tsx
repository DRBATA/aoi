"use client"

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X, ChevronDown, Clock, Sparkles, Users, Brain, Zap } from 'lucide-react'

import ShaderBackground from '@/components/shader-background'
import FloatingPaths from "@/components/kokonutui/floating-paths"
import AOIBookingForm from '@/components/AOIBookingForm'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('how-it-works')
  const experiences = [
    {
      id: "aoi-air",
      name: "AOI AIR",
      description: "Stand in light and sound. Your fascia unwinds, shoulders drop, breath naturally lengthens.",
      icon: "✨",
      duration: "20 min",
      benefits: ["Jaw unhooks without trying", "Feet find the ground differently", "Movement feels easier"],
      color: "from-purple-400 via-pink-400 to-orange-400",
      image: "/experiences/aoi_(art_of_implosion).png"
    },
    {
      id: "aoi-earth",
      name: "AOI EARTH",
      description: "Lie down, load off. Light and sound create space for your system to reorganize itself.",
      icon: "🌍",
      duration: "30-45 min",
      benefits: ["Spine lengthens", "Breathing deepens", "Thoughts settle"],
      color: "from-teal-400 via-cyan-400 to-blue-400",
      image: "/experiences/aoi_(art_of_implosion).png"
    },
    {
      id: "float",
      name: "FLOAT",
      description: "Weightless in warm salt water. Maximum subtraction lets spontaneous reorganization happen.",
      icon: "💫",
      duration: "30 min",
      benefits: ["Boundaries dissolve then reform", "Mental chatter quiets", "Deep reset"],
      color: "from-blue-400 via-purple-400 to-pink-400",
      image: "/experiences/float.png"
    },
    {
      id: "sauna",
      name: "INFRARED SAUNA",
      description: "Gentle heat opens circulation, lengthens breath. Finish with our signature electrolyte drinks.",
      icon: "🔥",
      duration: "30 min",
      benefits: ["Muscles soften", "Breath flows easier", "Ready for what's next"],
      color: "from-orange-400 via-pink-400 to-purple-400",
      image: "/experiences/sauna.png"
    },
    {
      id: "ice-bath",
      name: "ICE BATH",
      description: "Brief cold creates focus then release. Your system learns to find calm in intensity.",
      icon: "❄️",
      duration: "3-6 min",
      benefits: ["Mind sharpens", "Body rebounds", "Confidence builds"],
      color: "from-cyan-400 via-teal-400 to-blue-400",
      image: "/experiences/ice-bath.png"
    }
  ]










  // LiveKit connection function removed

  return (
    <div className="relative bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-xl border-b border-cyan-500/20">
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
<section id="how-it-works" className="py-24 px-4 bg-gradient-to-b from-gray-900 via-emerald-900/10 to-cyan-900/10">  
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
              ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white shadow-lg shadow-purple-500/25'
              : 'bg-white/15 text-white/80 hover:bg-white/25 hover:shadow-md hover:shadow-white/10'
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
          className="space-y-8"
        >
          {/* Simple 3-Step Process */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">1</div>
              <h4 className="text-xl font-medium text-white mb-3">Choose Experience</h4>
              <p className="text-white/70">Pick what calls to you. Each experience creates different conditions for transformation.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">2</div>
              <h4 className="text-xl font-medium text-white mb-3">We Enhance</h4>
              <p className="text-white/70">Perfect combinations suggested. Temperature, timing, and complementary experiences.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">3</div>
              <h4 className="text-xl font-medium text-white mb-3">Auto-Hydrate</h4>
              <p className="text-white/70">Optimal drinks added automatically. Electrolytes and nutrients to elevate your experience.</p>
            </div>
          </div>

          {/* What Makes It Work */}
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all">
            <h3 className="text-2xl font-medium text-white mb-6 text-center">What Makes It Work</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-medium mb-2">🎨 Art-Built Containers</h4>
                <p className="text-white/70 text-sm">Each experience is an artisanal state-changer. Light and sound create ritual containers where your nervous system finds its steadier set point.</p>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">💧 Intelligent Hydration</h4>
                <p className="text-white/70 text-sm">Your experience determines your drink. Ice bath gets warming spices. Sauna gets cooling electrolytes. Heat gets minerals.</p>
              </div>
            </div>
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
            <p className="text-white/60">Art Gallery | Wellness Lounge | Social Hub </p>
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
          
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all mt-8">
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
          {/* Move technical explanations here */}
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
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
          
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
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

          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
            <h3 className="text-xl font-medium text-white mb-4">Implosion vs Explosion</h3>
            <p className="text-white/60 mb-3">
              Humans have become addicted to exploding - constantly reacting, consuming, and pushing outward. 
              We&apos;ve lost our connection to nature and how creation really takes its highest form: through implosion.
            </p>
            <p className="text-white/60">
              AOI invites you to turn inward, to implode your true potential onto the world without needing 
              to destroy your surroundings to grow.
            </p>
          </div>
          
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
            <h3 className="text-xl font-medium text-white mb-4">Beyond Replicas</h3>
            <p className="text-white/60">
              It&apos;s easy to get caught in patterns - doing what we&apos;ve always done, thinking how we&apos;ve always thought. 
              AOI creates space for something different to emerge. Your own rhythm, your own expression, 
              without the noise telling you who to be.
            </p>
          </div>
        </motion.div>
      )}

      {activeTab === 'founder' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/15 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all"
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
<section id="experiences" className="py-24 px-4 bg-gradient-to-b from-gray-900 via-pink-900/10 to-purple-900/15">
  <div className="max-w-7xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="text-center mb-16"
    >
      <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
        Choose Your <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Experience</span>
      </h2>
      <p className="text-white/70 max-w-2xl mx-auto">
        Each journey creates the right conditions for your body to find its way
      </p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {experiences.map((exp, index) => (
        <motion.div
          key={exp.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          viewport={{ once: true }}
          onClick={() => {
            const bookingSection = document.getElementById('booking')
            if (bookingSection) {
              bookingSection.scrollIntoView({ behavior: 'smooth' })
            }
          }}
          data-experience={exp.id}
          className="relative overflow-hidden rounded-3xl cursor-pointer group active:scale-95 transition-transform"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src={exp.image} 
              alt={exp.name}
              className="w-full h-full object-cover object-center opacity-50"
            />
            <div className={`absolute inset-0 bg-gradient-to-br ${exp.color} opacity-70 mix-blend-multiply`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          </div>
          
          {/* Content - Always Visible */}
          <div className="relative z-10 p-6 min-h-[420px] flex flex-col justify-between">
            {/* Top Content */}
            <div>
              <div className="text-4xl mb-3 filter drop-shadow-lg">{exp.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-lg">{exp.name}</h3>
              <p className="text-white/95 text-sm mb-3 leading-relaxed drop-shadow">{exp.description}</p>
              
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-white/80" />
                <span className="text-white/80 text-sm font-medium">{exp.duration}</span>
              </div>
            </div>

            {/* Bottom Content - Always Visible */}
            <div className="space-y-3">
              <div>
              <h4 className="text-white font-medium text-xs uppercase tracking-wide mb-2 opacity-90">You might feel:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {exp.benefits.map((benefit) => (
                    <span 
                      key={benefit} 
                      className="px-2.5 py-1 bg-white/25 backdrop-blur-md rounded-full text-xs text-white/95 border border-white/20 font-medium"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Selection Indicator - Always Visible */}
          <div className="absolute top-4 right-4">
            <div className="w-8 h-8 bg-white/25 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg">
              <span className="text-white text-sm font-bold">→</span>
            </div>
          </div>

          {/* Glow Effect - Always Visible */}
          <div className={`absolute inset-x-0 bottom-0 h-px bg-gradient-to-r ${exp.color} opacity-80`} />
          <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${exp.color} opacity-40`} />
        </motion.div>
      ))}
    </div>

    {/* Call to Action - Mobile Optimized */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      viewport={{ once: true }}
      className="text-center mt-16"
    >
      <p className="text-white/70 mb-4 text-sm md:text-base">
        Select your core experience below, then choose which combination aligns with your goals. We&apos;ll automatically match hydration for when you arrive.
      </p>
      <p className="text-white/50 text-xs md:text-sm">
        You&apos;ll see all options in your confirmation email. For complete daily hydration balance, visit thewater.bar on arrival for a personalized assessment.
      </p>
      <div className="flex flex-col gap-4 items-center">
        <button 
          onClick={() => {
            const bookingSection = document.getElementById('booking')
            if (bookingSection) {
              bookingSection.scrollIntoView({ behavior: 'smooth' })
            }
          }}
          className="w-full max-w-sm px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full text-white font-medium active:scale-95 transition-transform shadow-2xl"
        >
          Start Your Journey
        </button>
        <p className="text-white/50 text-sm text-center max-w-xs">
          Hydration drinks automatically added based on your selections
        </p>
      </div>
    </motion.div>
  </div>
</section>

      {/* Booking Section */}
      <section id="booking" className="py-24 px-4 bg-gradient-to-b from-gray-900 via-yellow-900/8 to-orange-900/12">        
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
<footer id="contact" className="py-16 px-4 border-t border-white/20 bg-gradient-to-b from-gray-900 to-black">
  <div className="max-w-7xl mx-auto">
    {/* Main Footer Content */}
    <div className="grid md:grid-cols-3 gap-8 mb-8">
      {/* Brand */}
      <div>
        <div className="text-3xl font-light text-white mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">AOI</div>
        <div className="text-white/60 text-sm mb-4">Art of Implosion</div>
        <p className="text-white/50 text-sm leading-relaxed">
          Creating conditions for transformation through light, sound, and honest mechanisms.
        </p>
      </div>
      
      {/* Quick Links */}
      <div>
        <h4 className="text-white font-medium mb-4">Experience</h4>
        <div className="space-y-2">
          <Link href="#experiences" className="block text-white/60 hover:text-white transition-colors text-sm">All Experiences</Link>
          <Link href="#booking" className="block text-white/60 hover:text-white transition-colors text-sm">Book Session</Link>
          <Link href="#how-it-works" className="block text-white/60 hover:text-white transition-colors text-sm">How It Works</Link>
        </div>
      </div>
      
      {/* Contact */}
      <div>
        <h4 className="text-white font-medium mb-4">Connect</h4>
        <div className="space-y-2">
          <Link href="/contact" className="block text-white/60 hover:text-white transition-colors text-sm">Contact Us</Link>
          <Link href="/privacy" className="block text-white/60 hover:text-white transition-colors text-sm">Privacy Policy</Link>
          <Link href="/terms" className="block text-white/60 hover:text-white transition-colors text-sm">Terms of Service</Link>
        </div>
      </div>
    </div>
    
    {/* Bottom Bar */}
    <div className="pt-8 border-t border-white/10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-white/40 text-sm">
          © 2024 Art of Implosion. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
          <span className="text-white/50 text-sm">Dubai, UAE</span>
        </div>
      </div>
    </div>
  </div>
</footer>
    </div>
  )
}
