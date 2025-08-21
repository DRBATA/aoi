"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

interface UnifiedBackgroundProps {
  children: React.ReactNode
  mode?: "kaleidoscope" | "flow" | "hybrid"
  intensity?: number
}

export function UnifiedBackground({ children, mode = "hybrid", intensity = 0.3 }: UnifiedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isActive, setIsActive] = useState(false)
  const animationRef = useRef<number>()
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
    })

    if (!gl) {
      console.log("WebGL not supported, using CSS fallback")
      return
    }

    glRef.current = gl

    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `

    const fragmentShaderSource = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_intensity;
      uniform float u_mode; // 0: kaleidoscope, 1: flow, 2: hybrid

      // Noise function for organic movement
      float noise(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      // Enhanced color palette
      vec3 palette(float t) {
        vec3 a = vec3(0.5, 0.5, 0.5);
        vec3 b = vec3(0.5, 0.5, 0.5);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.263, 0.416, 0.557);
        return a + b * cos(6.28318 * (c * t + d));
      }

      // Kaleidoscope transformation
      vec2 kaleidoscope(vec2 uv, float segments) {
        float angle = atan(uv.y, uv.x);
        float radius = length(uv);
        float segment = mod(angle, 6.28318 / segments);
        return vec2(cos(segment), sin(segment)) * radius;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
        vec2 uv0 = uv;
        
        // Apply kaleidoscope effect based on mode
        if (u_mode < 0.5 || u_mode > 1.5) {
          uv = kaleidoscope(uv, 6.0);
        }
        
        vec3 finalColor = vec3(0.0);
        float time = u_time * 0.15;
        
        // Main fractal loop
        for (float i = 0.0; i < 4.0; i++) {
          uv = fract(uv * 1.5) - 0.5;
          
          float d = length(uv) * exp(-length(uv0));
          
          // Add noise for organic feel
          float noiseVal = noise(uv0 * 2.0 + time) * 0.1;
          vec3 col = palette(length(uv0) + i * 0.4 + time + noiseVal);
          
          d = sin(d * 8.0 + time) / 8.0;
          d = abs(d);
          d = pow(0.01 / d, 1.2);
          
          finalColor += col * d;
        }
        
        // Base gradient for depth
        vec2 gradientUV = gl_FragCoord.xy / u_resolution.xy;
        float flowX = gradientUV.x + sin(time + gradientUV.y * 3.14) * 0.05;
        float flowY = gradientUV.y + cos(time * 0.7 + gradientUV.x * 2.0) * 0.03;
        
        vec3 baseGradient = mix(
          vec3(1.0, 0.6, 0.3),
          mix(vec3(1.0, 0.3, 0.6), vec3(0.3, 0.6, 1.0), flowX),
          flowY
        );
        
        // Mix based on mode
        float mixFactor = u_mode > 0.5 && u_mode < 1.5 ? 0.1 : 0.3;
        finalColor = mix(baseGradient * 0.2, finalColor, mixFactor);
        
        gl_FragColor = vec4(finalColor * u_intensity, 1.0);
      }
    `

    function createShader(type: number, source: string) {
      const shader = gl.createShader(type)
      if (!shader) return null

      gl.shaderSource(shader, source)
      gl.compileShader(shader)

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }

      return shader
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource)

    if (!vertexShader || !fragmentShader) return

    const program = gl.createProgram()
    if (!program) return

    programRef.current = program
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program))
      return
    }

    // Get locations
    const positionLocation = gl.getAttribLocation(program, "a_position")
    const timeLocation = gl.getUniformLocation(program, "u_time")
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution")
    const intensityLocation = gl.getUniformLocation(program, "u_intensity")
    const modeLocation = gl.getUniformLocation(program, "u_mode")

    // Create buffer
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)

    function render(time: number) {
      if (!gl || !program || !canvas) return

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl["useProgram"](program)

      gl.enableVertexAttribArray(positionLocation)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

      if (timeLocation !== null) {
        gl.uniform1f(timeLocation, time * 0.001)
      }
      if (resolutionLocation !== null) {
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
      }
      if (intensityLocation !== null) {
        gl.uniform1f(intensityLocation, isActive ? intensity * 1.3 : intensity)
      }
      if (modeLocation !== null) {
        gl.uniform1f(modeLocation, mode === "kaleidoscope" ? 0 : mode === "flow" ? 1 : 2)
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6)

      animationRef.current = requestAnimationFrame(render)
    }

    function resize() {
      if (!canvas || !gl) return // Added gl null check
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    resize()
    window.addEventListener("resize", resize)
    animationRef.current = requestAnimationFrame(render)

    return () => {
      window.removeEventListener("resize", resize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, mode, intensity])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseEnter = () => setIsActive(true)
    const handleMouseLeave = () => setIsActive(false)

    container.addEventListener("mouseenter", handleMouseEnter)
    container.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter)
      container.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ mixBlendMode: "screen" }} />

      {/* CSS Fallback */}
      <div className="absolute inset-0 w-full h-full pointer-events-none webgl-fallback">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500 opacity-30" />
        <div
          className={`absolute inset-0 bg-gradient-to-tr from-orange-400 via-pink-500 to-cyan-500 transition-all duration-2000 ${
            isActive ? "opacity-40 scale-105" : "opacity-20 scale-100"
          }`}
        />
      </div>

      <style jsx>{`
        .webgl-fallback {
          display: none;
        }
        canvas:not([width]) + .webgl-fallback {
          display: block;
        }
      `}</style>

      <div className="relative z-10">{children}</div>
    </div>
  )
}
