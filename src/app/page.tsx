'use client'

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useEffect, useRef } from "react"

export default function LandingPage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)

    const particles = Array.from({ length: 100 }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 1,
      dy: (Math.random() - 0.5) * 1,
      hover: false,
    }))

    function animate() {
      if (!ctx) return
      ctx.clearRect(0, 0, w, h)
      particles.forEach(p => {
        const isHover = Math.abs(p.x - w / 2) < 150 && Math.abs(p.y - h / 2) < 150
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = isHover ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.15)"
        ctx.shadowColor = isHover ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.1)"
        ctx.shadowBlur = isHover ? 20 : 10
        ctx.fill()
        p.x += p.dx
        p.y += p.dy
        if (p.x < 0 || p.x > w) p.dx *= -1
        if (p.y < 0 || p.y > h) p.dy *= -1
      })
      requestAnimationFrame(animate)
    }

    animate()

    window.addEventListener("resize", () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    })
  }, [])

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-br from-[#0f0c29] via-[#1a1d5e] to-[#111e3c] overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

      <section className="relative z-10 flex flex-col items-center justify-center text-center h-screen px-6 md:px-10">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-6xl font-extrabold text-white mb-3 tracking-tight leading-tight"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500">
            Real Estate Price Predictor
          </span>
        </motion.h1>

        {/* Floating tag */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-sm md:text-base text-gray-400 mb-4"
        >
          🏠 Residential • 🏢 Commercial • 🌍 Any Location
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="text-lg md:text-2xl text-gray-300 max-w-2xl mb-10 font-light"
        >
          Discover the true worth of any property in seconds. Simple, powerful, and beautifully crafted to guide your next move with confidence.
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/predict")}
          className="px-10 py-4 rounded-full text-lg font-semibold text-white bg-gradient-to-r from-emerald-400 via-blue-500 to-indigo-500 shadow-xl hover:shadow-2xl transition duration-300"
        >
          🚀 Get Started
        </motion.button>

        {/* Underline CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mt-4 text-sm text-white relative inline-block"
        >
          <span className="border-b-2 border-indigo-400 animate-pulse pb-1">
            Try your first prediction in under 10 seconds.
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-14 text-sm text-gray-400"
        >
          Built with 🐍 <span className="text-white">Python</span> • ⚙️ <span className="text-white">FastAPI</span> • 🧠 <span className="text-white">ML Model</span> • 💻 <span className="text-white">Next.js</span> • 🎨 <span className="text-white">Tailwind CSS</span>
        </motion.p>
      </section>
    </main>
  )
}
