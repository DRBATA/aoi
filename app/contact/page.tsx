"use client"

import { useState } from "react"
import Link from 'next/link'
import ShaderBackground from "@/components/shader-background"
import { motion } from "framer-motion"
import { Instagram, MessageCircle, Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

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
                <Link href="/technology" className="text-white/70 hover:text-white transition-colors">Technology</Link>
                <Link href="/experiences" className="text-white/70 hover:text-white transition-colors">Experiences</Link>
                <Link href="/book-session" className="text-white/70 hover:text-white transition-colors">Book Session</Link>
                <Link href="/contact" className="text-white font-medium">Contact</Link>
              </div>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all">
                Book AOI Session
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-6 py-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Get in <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Touch</span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Ready to experience the future of wellness? Connect with us directly.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Methods */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">Connect With Us</h2>
                
                {/* Instagram */}
                <div className="flex items-center space-x-4 mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
                    <Instagram className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">DM Us Directly</h3>
                    <Link 
                      href="https://instagram.com/artofimplosion" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2 mt-2"
                    >  @artofimplosion
                    </Link>
                  </div>
                </div>

                {/* Other Contact Methods */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
                    <MessageCircle className="w-6 h-6 text-cyan-400" />
                    <div>
                      <h3 className="text-white font-medium">Live Chat</h3>
                      <p className="text-white/60">Available 9AM - 9PM</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
                    <Mail className="w-6 h-6 text-green-400" />
                    <div>
                      <h3 className="text-white font-medium">Email</h3>
                      <p className="text-white/60">hello@artofimplosion.com</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
                    <Phone className="w-6 h-6 text-blue-400" />
                    <div>
                      <h3 className="text-white font-medium">Phone</h3>
                      <p className="text-white/60">+1 (555) AOI-HEAL</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
                    <MapPin className="w-6 h-6 text-red-400" />
                    <div>
                      <h3 className="text-white font-medium">Location</h3>
                      <p className="text-white/60">Dubai, UAE</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">Send a Message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-white/70 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-colors"
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-colors"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-2">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-colors resize-none"
                      placeholder="Tell us about your wellness goals..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </ShaderBackground>
  )
}
