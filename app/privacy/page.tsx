"use client"

import ShaderBackground from "@/components/shader-background"
import { motion } from "framer-motion"
import { Shield, Eye, Lock, Database, UserCheck, Globe } from "lucide-react"

export default function PrivacyPolicyPage() {
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
                <a href="/" className="text-white/70 hover:text-white transition-colors">Home</a>
                <a href="/technology" className="text-white/70 hover:text-white transition-colors">Technology</a>
                <a href="/experiences" className="text-white/70 hover:text-white transition-colors">Experiences</a>
                <a href="/book-session" className="text-white/70 hover:text-white transition-colors">Book Session</a>
                <a href="/contact" className="text-white/70 hover:text-white transition-colors">Contact</a>
              </div>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all">
                Book AOI Session
              </button>
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
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Privacy <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Your privacy and data security are fundamental to our mission of wellness transformation.
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
            {/* Information We Collect */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <div className="flex items-center mb-6">
                <Database className="w-6 h-6 text-purple-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Information We Collect</h2>
              </div>
              <div className="space-y-4 text-white/70">
                <p><strong className="text-white">Personal Information:</strong> Name, email address, phone number, and booking preferences when you schedule AOI sessions.</p>
                <p><strong className="text-white">Health Information:</strong> Wellness goals, medical conditions relevant to AOI therapy, and session feedback (with your explicit consent).</p>
                <p><strong className="text-white">Technical Data:</strong> IP address, browser type, device information, and website usage analytics to improve your experience.</p>
                <p><strong className="text-white">Session Data:</strong> Biometric responses during AOI sessions (only with your consent and for therapeutic optimization).</p>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <div className="flex items-center mb-6">
                <Eye className="w-6 h-6 text-cyan-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">How We Use Your Information</h2>
              </div>
              <div className="space-y-4 text-white/70">
                <p><strong className="text-white">Service Delivery:</strong> To provide personalized AOI experiences, schedule sessions, and optimize therapeutic outcomes.</p>
                <p><strong className="text-white">Communication:</strong> To send booking confirmations, session reminders, and wellness insights (you can opt-out anytime).</p>
                <p><strong className="text-white">Research & Development:</strong> To advance AOI technology and improve therapeutic protocols (anonymized data only).</p>
                <p><strong className="text-white">Legal Compliance:</strong> To meet regulatory requirements and protect our legal rights.</p>
              </div>
            </div>

            {/* Data Protection */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <div className="flex items-center mb-6">
                <Lock className="w-6 h-6 text-green-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Data Protection & Security</h2>
              </div>
              <div className="space-y-4 text-white/70">
                <p><strong className="text-white">Encryption:</strong> All data is encrypted in transit and at rest using industry-standard AES-256 encryption.</p>
                <p><strong className="text-white">Access Control:</strong> Strict role-based access controls ensure only authorized personnel can access your information.</p>
                <p><strong className="text-white">Data Minimization:</strong> We collect only the information necessary to provide exceptional AOI experiences.</p>
                <p><strong className="text-white">Regular Audits:</strong> Our security practices are regularly reviewed and updated to maintain the highest standards.</p>
              </div>
            </div>

            {/* Your Rights */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <div className="flex items-center mb-6">
                <UserCheck className="w-6 h-6 text-blue-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Your Privacy Rights</h2>
              </div>
              <div className="space-y-4 text-white/70">
                <p><strong className="text-white">Access:</strong> Request a copy of all personal information we hold about you.</p>
                <p><strong className="text-white">Correction:</strong> Update or correct any inaccurate personal information.</p>
                <p><strong className="text-white">Deletion:</strong> Request deletion of your personal information (subject to legal requirements).</p>
                <p><strong className="text-white">Portability:</strong> Receive your data in a structured, machine-readable format.</p>
                <p><strong className="text-white">Opt-out:</strong> Withdraw consent for marketing communications or data processing at any time.</p>
              </div>
            </div>

            {/* International Transfers */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <div className="flex items-center mb-6">
                <Globe className="w-6 h-6 text-pink-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">International Data Transfers</h2>
              </div>
              <div className="space-y-4 text-white/70">
                <p>AOI operates globally with facilities in Dubai, UAE. Your data may be transferred to and processed in countries with different privacy laws.</p>
                <p>We ensure adequate protection through:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Standard Contractual Clauses approved by regulatory authorities</li>
                  <li>Adequacy decisions for countries with equivalent protection</li>
                  <li>Your explicit consent where required</li>
                </ul>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
              <h2 className="text-2xl font-bold text-white mb-6">Privacy Questions?</h2>
              <div className="space-y-4 text-white/70">
                <p>For any privacy-related questions or to exercise your rights, contact our Data Protection Officer:</p>
                <div className="space-y-2">
                  <p><strong className="text-white">Email:</strong> privacy@artofimplosion.com</p>
                  <p><strong className="text-white">Address:</strong> AOI Privacy Office, Dubai, UAE</p>
                  <p><strong className="text-white">Response Time:</strong> We respond to all privacy requests within 30 days</p>
                </div>
              </div>
            </div>

            {/* Updates */}
            <div className="text-center">
              <p className="text-white/50 text-sm">
                This privacy policy may be updated periodically. We&apos;ll notify you of significant changes via email or website notice.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </ShaderBackground>
  )
}
