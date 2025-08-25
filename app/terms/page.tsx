"use client"

import ShaderBackground from "@/components/shader-background"
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FileText, AlertTriangle, Users, Calendar } from "lucide-react"

export default function TermsOfServicePage() {
  return (
    <ShaderBackground>
      <div className="min-h-screen pt-20">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-white">
                AOI <span className="text-sm font-normal text-white/60">ART OF IMPLOSION</span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-white/70 hover:text-white transition-colors">Home</Link>
                <Link href="/contact" className="text-white/70 hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full">
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Terms of <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Service</span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Clear terms for your AOI wellness journey and our commitment to your safety.
            </p>
            <p className="text-white/50 mt-4">Last updated: January 2025</p>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Age Requirements */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <div className="flex items-center mb-6">
                <Users className="w-6 h-6 text-purple-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Age & Eligibility</h2>
              </div>
              <div className="space-y-4 text-white/70">
                <p><strong className="text-white">Minimum Age:</strong> You must be 18+ to book AOI sessions independently.</p>
                <p><strong className="text-white">Minors:</strong> Ages 16-17 require parental consent and supervision.</p>
                <p><strong className="text-white">Health Requirements:</strong> Certain medical conditions may require physician clearance.</p>
              </div>
            </div>

            {/* Booking & Cancellation */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <div className="flex items-center mb-6">
                <Calendar className="w-6 h-6 text-cyan-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Booking & Cancellation</h2>
              </div>
              <div className="space-y-4 text-white/70">
                <p><strong className="text-white">Booking:</strong> Sessions must be booked in advance through our platform.</p>
                <p><strong className="text-white">Payment:</strong> Payment is collected on-site after your session.</p>
                <p><strong className="text-white">Cancellation:</strong> 24-hour notice required for cancellations.</p>
                <p><strong className="text-white">No-Show:</strong> Missed appointments may incur fees.</p>
              </div>
            </div>

            {/* Health & Safety */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <div className="flex items-center mb-6">
                <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Health & Safety Disclaimer</h2>
              </div>
              <div className="space-y-4 text-white/70">
                <p><strong className="text-white">Not Medical Treatment:</strong> AOI sessions are wellness experiences, not medical treatments.</p>
                <p><strong className="text-white">Consult Healthcare Providers:</strong> Always consult your doctor before starting any wellness program.</p>
                <p><strong className="text-white">Contraindications:</strong> Certain conditions may prevent safe participation in AOI sessions.</p>
                <p><strong className="text-white">Assumption of Risk:</strong> You participate at your own risk and responsibility.</p>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
              <h2 className="text-2xl font-bold text-white mb-6">Questions About Terms?</h2>
              <div className="space-y-4 text-white/70">
                <p>Contact us for clarification on any terms:</p>
                <div className="space-y-2">
                  <p><strong className="text-white">Email:</strong> legal@artofimplosion.com</p>
                  <p><strong className="text-white">Instagram:</strong> @artofimplosion (DM us directly)</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </ShaderBackground>
  )
}
