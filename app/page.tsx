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
  const [activeTab, setActiveTab] = useState('how-it-works')

  // Neon palette
  const palette = {
    bg0: "#00B4D8",
    bg1: "#90E0EF",
    aqua: "#48CAE4",
    brightBlue: "#33FFFF",
    electricBlue: "#00BFFF",
    lime: "#ECFF17",
    softOrange: "#FFD580",
    hotPink: "#FF2BC2",
    purple: "#A020F0",
    neonGreen: "#00FF85",
    grayText: "#374151",
    card: "#FDFEFF",
    cardEdge: "#CDE9F1"
  }


  const experiences = [
    {
      id: "aoi",
      name: "AOI",
      description: "Immersive light & sound machine – cellular transformation.",
      icon: "✨",
      duration: "20",
      benefits: ["Cellular activation", "Frequency healing", "Energy alignment"],
      feel: "Breathing deepens naturally. Shoulders drop. Mental chatter quiets as coherent frequencies entrain your system.",
      color: "from-purple-400 to-pink-400",
      image: "/aa.png"
    },
    {
      id: "aoi-earth",
      name: "AOI EARTH",
      description: "Grounding bed version – deep relaxation.",
      icon: "🌍",
      duration: "45",
      benefits: ["Deep grounding", "Stress relief", "Restorative healing"],
      feel: "Gravity releases its hold. Micro-tensions in hands and feet dissolve. The body finds itself in horizontal stillness.",
      color: "from-green-400 to-emerald-400",
      image: "/e.png"
    },
    {
      id: "aoi-air",
      name: "AOI AIR",
      description: "Standing version – physical unwinding.",
      icon: "🫧",
      duration: "20",
      benefits: ["Physical release", "Movement therapy", "Postural alignment"],
      feel: "Fascia unwinds in spirals. Movement becomes liquid. The body remembers how to stand without holding.",
      color: "from-cyan-400 to-blue-400",
      image: "/dg.png"
    },
    {
      id: "aoi-air-pro",
      name: "AOI AIR PRO",
      description: "Advanced protocols – deeper transformation.",
      icon: "⭐",
      duration: "30",
      benefits: ["Advanced", "Deeper reset", "Nervous system"],
      feel: "Deeper layers release. The nervous system recalibrates. Old patterns dissolve as new pathways emerge.",
      color: "from-purple-500 to-pink-500",
      image: "/dg.png"
    },
    {
      id: "ice-bath",
      name: "Ice Bath",
      description: "Cold immersion for clarity, circulation, resilience.",
      icon: "❄️",
      duration: "6",
      benefits: ["Circulation", "Clarity", "Resilience"],
      feel: "Attention snaps to the present. Breath sharpens, then lengthens. As you re-warm, vessels reopen and tension melts.",
      color: "from-blue-500 to-cyan-300"
    },
    {
      id: "infrared-sauna",
      name: "Infrared Sauna",
      description: "Deep heat for detox, cardio, recovery.",
      icon: "🔥",
      duration: "30",
      benefits: ["Detox", "Cardio support", "Recovery"],
      feel: "Heat loosens from the inside out. Jaw unhooks, shoulders drop. Mental noise quiets as warmth holds steady.",
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
              The Art of <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Implosion</span>
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Stop exploding onto the world. Turn inward to access your original code.
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {[
              { id: 'philosophy', label: 'The Philosophy', icon: <Brain className="w-4 h-4" /> },
              { id: 'how-it-works', label: 'How It Works', icon: <Sparkles className="w-4 h-4" /> },
              { id: 'technology', label: 'Technology', icon: <Zap className="w-4 h-4" /> },
              { id: 'founder', label: 'Creator', icon: <Users className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
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
            {activeTab === 'philosophy' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-medium text-white mb-4">Implosion vs Explosion</h3>
                  <p className="text-white/60 mb-3">
                    Humans have become addicted to exploding - constantly reacting, consuming, and pushing outward. 
                    We&apos;ve lost our connection to nature and how creation really takes its highest form: through implosion.
                  </p>
                  <p className="text-white/60 mb-3">
                    By "implosion," we don&apos;t mean collapse. We mean folding energy back to center—letting the nervous 
                    system reach a still-point where it can reorganize itself. Your exhale gets longer. Vision steadies. 
                    The forehead softens; the jaw releases without trying.
                  </p>
                  <p className="text-white/60">
                    AOI invites you to turn inward, to implode your true potential onto the world without needing 
                    to destroy your surroundings to grow.
                  </p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-medium text-white mb-4">The 1% vs 99% Within</h3>
                  <p className="text-white/60">
                    Just as 1% controls 99% in the world, within you, 1% of your conscious mind tries to overcome 
                    99% of contradicting information stored in your cells. Your &quot;yes&quot; fights against millions of 
                    ancestral &quot;nos&quot;. AOI helps clear this internal conflict.
                  </p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-medium text-white mb-4">Beyond Replicas</h3>
                  <p className="text-white/60">
                    Most people are replicas - mimicking their ancestors or environment. It&apos;s hard to meet an original 
                    expression because we&apos;re all copies in the same traffic jam. AOI helps you break free from being 
                    just another copy and access your true originality.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'how-it-works' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🧬</span>
                    <h3 className="text-xl font-medium text-white">DNA as the Receiver of Creation</h3>
                  </div>
                  <p className="text-white/60 mb-3">
                    Science tells us DNA is more than just a code for building the body. The truth is, most of DNA&apos;s function is not about proteins at all — it is about receiving and transmitting the subtle information of life itself.
                  </p>
                  <p className="text-white/60">
                    Research reveals DNA functions as an antenna — tuned to light and sound — the fundamental carriers of creation.
                  </p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🌊</span>
                    <h3 className="text-xl font-medium text-white">Light and Sound: The Fabric of the Physical World</h3>
                  </div>
                  <p className="text-white/60 mb-3">
                    Everything we touch, taste, and see is born of vibration. Sound and light are the primal forces that come together to create reality.
                  </p>
                  <p className="text-white/60">
                    The binary code of creation operates through simple &quot;yes&quot; and &quot;no&quot; signals, like a cosmic computer program. When these signals align properly, they create coherence in your system.
                  </p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🌿</span>
                    <h3 className="text-xl font-medium text-white">Resonance With All That is Living</h3>
                  </div>
                  <p className="text-white/60">
                    Because this code underlies all of life, AOI doesn&apos;t only touch humans — it works on plants, water, coffee, even perfume, because everything organic carries this vibrational memory. The same universal patterns resonate through every living thing.
                  </p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">⚡</span>
                    <h3 className="text-xl font-medium text-white">Binary Code and the Dance of Duality</h3>
                  </div>
                  <p className="text-white/60">
                    In the yin and yang of space — light and dark, vibration and stillness — lies the binary code of creation. AOI translates that hidden binary into an experience you can feel with your body.
                  </p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🪞</span>
                    <h3 className="text-xl font-medium text-white">The Mirror Effect</h3>
                  </div>
                  <p className="text-white/60">
                    When AOI surrounds you with harmonic light and sound, your body naturally mirrors it back. Just like a greeting — &quot;hello&quot; answered with &quot;hello&quot; — your cells respond in kind, releasing what does not belong, remembering what does. This mirroring is the gateway to healing and transformation.
                  </p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">✨</span>
                    <h3 className="text-xl font-medium text-white">Simplicity at the Core</h3>
                  </div>
                  <p className="text-white/60">
                    It is not complicated. Just as a child learns by mirroring what is around them, you do not need to study AOI. You only need to experience it. In the simplicity of that exchange lies its power.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'technology' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <Award className="w-8 h-8 text-yellow-400 mb-4" />
                  <h3 className="text-xl font-medium text-white mb-4">Nobel Prize Science</h3>
                  <p className="text-white/60 mb-4">Low Level Light Therapy (LLLT) - Nobel Prize 1903 Niels Ryberg Finsen for treating diseases with concentrated light. Over 4,000 scientific studies since 1967.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                    <h4 className="text-lg font-medium text-white mb-2">Mental Health</h4>
                    <p className="text-white/60 text-sm">Treats depression, anxiety, PTSD, substance abuse, traumatic brain injury</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                    <h4 className="text-lg font-medium text-white mb-2">Brain Function</h4>
                    <p className="text-white/60 text-sm">Boosts brain function, improves mental health, enhances cognitive performance</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                    <h4 className="text-lg font-medium text-white mb-2">Physical Recovery</h4>
                    <p className="text-white/60 text-sm">Enhanced muscle recovery, improved circulation, cellular rejuvenation</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                    <h4 className="text-lg font-medium text-white mb-2">Overall Wellness</h4>
                    <p className="text-white/60 text-sm">Stress relief, improved sleep, enhanced mood, increased energy</p>
                  </div>
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
                className="relative rounded-3xl"
                style={{ filter: `drop-shadow(0 10px 24px ${palette.brightBlue}55) drop-shadow(0 0 54px ${palette.electricBlue}44)` }}
              >
                {/* Neon glow ring */}
                <div
                  className="absolute -inset-[1.5px] rounded-3xl"
                  style={{
                    background: `linear-gradient(90deg, ${palette.brightBlue}, ${palette.hotPink})`,
                    filter: "blur(12px)",
                    opacity: 0.65
                  }}
                />

                {/* Card */}
                <div
                  className="relative rounded-3xl p-5 md:p-6 border overflow-hidden cursor-pointer group"
                  style={{
                    background: palette.card,
                    borderColor: palette.cardEdge
                  }}
                  onClick={() => {
                    const bookingSection = document.getElementById('booking')
                    if (bookingSection) {
                      bookingSection.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                >
                  {/* Neon texture overlay */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: `conic-gradient(from 200deg at 110% -10%, ${palette.lime}22, ${palette.softOrange}11, ${palette.hotPink}14, ${palette.brightBlue}14, ${palette.neonGreen}11, transparent 70%)`
                    }}
                  />

                  <div className="relative">
                    <div className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                      <span className="text-2xl">{exp.icon}</span>
                      {exp.name}
                    </div>
                    <p className="mt-2 text-sm leading-6" style={{ color: palette.grayText }}>{exp.description}</p>
                    
                    {/* What you'll feel section */}
                    <p className="mt-3 text-sm leading-5 italic" style={{ color: '#6B7280' }}>
                      "{exp.feel}"
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: palette.grayText }}>
                      <span className="opacity-80">🕒</span>
                      {exp.duration} min
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {exp.benefits.map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1 rounded-full border text-xs backdrop-blur"
                          style={{
                            borderColor: palette.cardEdge,
                            background: `linear-gradient(90deg, ${palette.brightBlue}18, ${palette.purple}10)`,
                            color: "#1F2937"
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex gap-3">
                      <button
                        className="rounded-full px-4 py-2 font-medium shadow transition hover:scale-[1.02] text-white"
                        style={{ 
                          background: `linear-gradient(90deg, ${palette.hotPink}, ${palette.electricBlue})`, 
                          boxShadow: `0 0 24px ${palette.electricBlue}55` 
                        }}
                      >
                        Book Your Session
                      </button>
                      <button
                        className="rounded-full px-4 py-2 font-medium border backdrop-blur"
                        style={{
                          borderColor: `${palette.brightBlue}70`,
                          color: "#111827",
                          background: `linear-gradient(90deg, ${palette.aqua}20, ${palette.electricBlue}12)`
                        }}
                      >
                        Learn More
                      </button>
                    </div>
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
