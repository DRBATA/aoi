import React from 'react'
import { motion } from 'framer-motion'

interface PyramidUIProps {
  data: {
    apex: { label: string; action: string; mode: string }
    options: Array<{ key: string; label: string }>
    context: string
  }
  onApexClick: (action: string, mode: string) => void
  onOptionClick: (key: string) => void
  className?: string
}

export default function PyramidUI({ data, onApexClick, onOptionClick, className = "" }: PyramidUIProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 ${className}`}
    >
      {/* APEX - Primary Action */}
      <div className="text-center mb-8">
        <button
          onClick={() => onApexClick(data.apex.action, data.apex.mode)}
          className="text-3xl font-bold text-white mb-4 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl hover:scale-105 transition-transform shadow-lg"
        >
          {data.apex.label}
        </button>
      </div>

      {/* MIDDLE - Alternative Options */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {data.options.map((option) => (
          <button
            key={option.key}
            onClick={() => onOptionClick(option.key)}
            className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 hover:bg-white/20 transition-colors text-sm"
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* BASE - Context */}
      <div className="text-center">
        <p className="text-white/70 text-sm">
          {data.context}
        </p>
      </div>
    </motion.div>
  )
}
