"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { MeshGradient } from "@paper-design/shaders-react"

interface ShaderBackgroundProps {
  children: React.ReactNode
}

export default function ShaderBackground({ children }: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true)
    const handleMouseLeave = () => setIsActive(false)

    const container = containerRef.current
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter)
      container.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter)
        container.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden">
      {/* MeshGradient Background Layers */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#ff9a56", "#ff6b9d", "#c44569", "#546de5", "#0abde3"]}
        speed={isActive ? 0.6 : 0.4}
      />
      
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-60"
        colors={["#f7931e", "#ff6b35", "#c44569", "#40407a", "#00d2d3"]}
        speed={isActive ? 0.3 : 0.2}
      />
      
      {/* Additional overlay for depth */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent transition-all duration-2000 ${
          isActive ? 'opacity-30' : 'opacity-10'
        }`}
      />

      {/* SVG Filters for glass effects */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      <style jsx>{`
        @keyframes flow {
          0%, 100% { 
            background-position: 0% 50%;
            transform: scale(1) rotate(0deg);
          }
          33% { 
            background-position: 100% 20%;
            transform: scale(1.02) rotate(0.5deg);
          }
          66% { 
            background-position: 20% 100%;
            transform: scale(0.98) rotate(-0.3deg);
          }
        }
        
        @keyframes counterFlow {
          0%, 100% { 
            background-position: 100% 50%;
            transform: scale(1) rotate(0deg);
          }
          50% { 
            background-position: 0% 50%;
            transform: scale(1.03) rotate(-0.8deg);
          }
        }
        
        @keyframes drift {
          0% { 
            transform: translateX(-2px) translateY(-2px);
          }
          25% { 
            transform: translateX(2px) translateY(-1px);
          }
          50% { 
            transform: translateX(1px) translateY(2px);
          }
          75% { 
            transform: translateX(-1px) translateY(1px);
          }
          100% { 
            transform: translateX(-2px) translateY(-2px);
          }
        }
      `}</style>

      <div className="relative z-10">{children}</div>
    </div>
  )
}
