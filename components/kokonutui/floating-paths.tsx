"use client"

import { motion } from "framer-motion"

export default function FloatingPaths({ position = 1 }: { position?: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => {
    const progress = i / 35
    let color

    if (progress < 0.33) {
      const localProgress = progress / 0.33
      color = `hsl(${120 + localProgress * 60}, ${80 + localProgress * 20}%, ${50 + localProgress * 20}%)`
    } else if (progress < 0.66) {
      const localProgress = (progress - 0.33) / 0.33
      color = `hsl(${300 + localProgress * 60}, ${85 + localProgress * 15}%, ${55 + localProgress * 15}%)`
    } else {
      const localProgress = (progress - 0.66) / 0.34
      color = `hsl(${20 + localProgress * 40}, ${90 + localProgress * 10}%, ${55 + localProgress * 15}%)`
    }

    return {
      id: i,
      d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
        380 - i * 5 * position
      } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
        152 - i * 5 * position
      } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
        684 - i * 5 * position
      } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
      color,
      width: 1.0 + i * 0.05,
      opacity: 0.7 + i * 0.01,
    }
  })

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <svg className="w-full h-full" viewBox="0 0 696 316" fill="none">
        <title>Floating Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke={path.color}
            strokeWidth={path.width}
            strokeOpacity={path.opacity}
            initial={{ pathLength: 0.5, opacity: 0.8 }}
            animate={{
              pathLength: 1,
              opacity: [0.6, 1, 0.6],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  )
}
