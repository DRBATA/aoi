"use client"

export function SimpleHeader() {
  return (
    <header className="relative z-20 p-6">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="px-6 py-3 bg-black/20 backdrop-blur-sm rounded-full text-white border border-white/20 hover:bg-black/30 transition-all">
            Explore
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full text-white hover:from-orange-500 hover:to-pink-600 transition-all">
            Get Started
          </button>
        </div>

        <div className="flex items-center gap-8 text-white/80">
          <span className="hover:text-white transition-colors cursor-pointer">Features</span>
          <span className="hover:text-white transition-colors cursor-pointer">Pricing</span>
          <span className="hover:text-white transition-colors cursor-pointer">Docs</span>
        </div>

        <button className="px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full text-white hover:from-pink-500 hover:to-purple-600 transition-all">
          Login
        </button>
      </nav>
    </header>
  )
}
