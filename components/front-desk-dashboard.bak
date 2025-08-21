"use client"

import type React from "react"
import { useState, createContext, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BadgeCheck, HelpCircle, LogOut, Plus, Settings, Sparkles, User } from "lucide-react"

// --- Style helpers inspired by your references ---
const statusColors: Record<string, string> = {
  Waiting: "bg-slate-100 text-slate-700 border-slate-200",
  "Checked In": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "In Session": "bg-indigo-100 text-indigo-700 border-indigo-200",
  Completed: "bg-amber-100 text-amber-700 border-amber-200",
}

const STATUS_OPTIONS = ["Waiting", "Checked In", "In Session", "Completed"] as const

type StatusType = (typeof STATUS_OPTIONS)[number]

// Theme presets (class strings are predeclared so Tailwind can pick them up)
const THEMES = {
  emerald: {
    name: "Emerald",
    gradient: "from-emerald-500 to-cyan-500",
    button: "bg-emerald-600 hover:bg-emerald-700",
    text: "text-emerald-600",
  },
  purple: {
    name: "Purple",
    gradient: "from-fuchsia-500 to-purple-500",
    button: "bg-fuchsia-600 hover:bg-fuchsia-700",
    text: "text-fuchsia-600",
  },
  amber: {
    name: "Amber",
    gradient: "from-amber-500 to-orange-500",
    button: "bg-amber-600 hover:bg-amber-700",
    text: "text-amber-600",
  },
} as const

// Example data representing guests at the clinic/water bar
const initialGuests = [
  {
    id: 1,
    name: "Alice Johnson",
    status: "Checked In" as StatusType,
    goal: "Recovery",
    drink: "Electrolytes",
    experience: "Sauna Pod",
    cart: [],
    progress: 35,
  },
  {
    id: 2,
    name: "Bob Smith",
    status: "Waiting" as StatusType,
    goal: "Energy",
    drink: "Adaptogens",
    experience: "Ice Bath",
    cart: [],
    progress: 10,
  },
  {
    id: 3,
    name: "Charlie Lee",
    status: "In Session" as StatusType,
    goal: "Relaxation",
    drink: "Sparkling",
    experience: "Float Tank",
    cart: [],
    progress: 65,
  },
]

// Price list for drinks and experiences
const priceList: Record<string, number> = {
  Electrolytes: 8,
  Adaptogens: 10,
  Sparkling: 5,
  "Sauna Pod": 25,
  "Ice Bath": 20,
  "Float Tank": 35,
}

interface DashboardContextType {
  guests: any[]
  setGuests: React.Dispatch<React.SetStateAction<any[]>>
  selectedGuest: any | null
  setSelectedGuest: React.Dispatch<React.SetStateAction<any | null>>
  stock: any
  setStock: React.Dispatch<React.SetStateAction<any>>
  sortBy: string
  setSortBy: React.Dispatch<React.SetStateAction<string>>
  statusFilter: StatusType | "ALL"
  setStatusFilter: React.Dispatch<React.SetStateAction<StatusType | "ALL">>
  themeName: keyof typeof THEMES
  setThemeName: React.Dispatch<React.SetStateAction<keyof typeof THEMES>>
  theme: (typeof THEMES)[keyof typeof THEMES]
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider")
  }
  return context
}

function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [guests, setGuests] = useState(initialGuests)
  const [selectedGuest, setSelectedGuest] = useState<any | null>(null)
  const [stock, setStock] = useState({ Electrolytes: 12, Adaptogens: 8, Sparkling: 20 })
  const [sortBy, setSortBy] = useState("name")
  const [statusFilter, setStatusFilter] = useState<StatusType | "ALL">("ALL")
  const [themeName, setThemeName] = useState<keyof typeof THEMES>("emerald")

  const theme = THEMES[themeName]

  return (
    <DashboardContext.Provider
      value={{
        guests,
        setGuests,
        selectedGuest,
        setSelectedGuest,
        stock,
        setStock,
        sortBy,
        setSortBy,
        statusFilter,
        setStatusFilter,
        themeName,
        setThemeName,
        theme,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export default function FrontDeskDashboard() {
  return (
    <DashboardProvider>
      <div className="relative min-h-screen p-6">
        {/* Gradient background + subtle grid */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0B1220] via-[#0B2A2B] to-[#0B1220]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,_rgba(56,189,248,0.25),_transparent_60%)]" />

        {/* Topbar with account menu + theme switch */}
        <TopBar />

        <div className="mt-6 flex gap-6">
          {/* Main column */}
          <div className="flex-1 space-y-4">
            {/* Mobile tabs */}
            <MobileStageTabs />

            {/* Desktop table */}
            <Card className="p-6 shadow-xl border border-white/10 bg-white/70 backdrop-blur-xl rounded-2xl hidden md:block">
              <HeaderControls />
              <GuestTable />
            </Card>

            {/* Mobile list */}
            <Card className="p-4 shadow-xl border border-white/10 bg-white/70 backdrop-blur-xl rounded-2xl md:hidden">
              <GuestListMobile />
            </Card>
          </div>

          {/* Side Panel */}
          <div className="w-80 hidden md:flex md:flex-col gap-6">
            <StockCard />
            <SnapshotCard />
            <AssistantCard />
          </div>
        </div>

        <ProfileModal />
      </div>
    </DashboardProvider>
  )
}

// --------------------- UI atoms ---------------------
function AvatarBubble({ name }: { name: string }) {
  const { theme } = useDashboard()
  return (
    <div
      className={`w-8 h-8 rounded-full bg-gradient-to-br ${theme.gradient} text-white grid place-items-center text-xs font-semibold shadow-sm`}
      aria-label={`Avatar for ${name}`}
    >
      {name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")}
    </div>
  )
}

function StatusBadge({ value }: { value: StatusType }) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-medium ${statusColors[value]}`}
    >
      {value}
    </span>
  )
}

function ProgressBar({ percent }: { percent: number }) {
  const { theme } = useDashboard()
  return (
    <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${theme.gradient}`}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  )
}

// --------------------- Top bar ---------------------
function TopBar() {
  const [open, setOpen] = useState(false)
  const { themeName, setThemeName, theme } = useDashboard()

  const cycleTheme = () => {
    const keys = Object.keys(THEMES) as Array<keyof typeof THEMES>
    const idx = keys.indexOf(themeName)
    setThemeName(keys[(idx + 1) % keys.length])
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${theme.gradient} grid place-items-center shadow-lg`}>
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-white text-xl font-semibold">Water Bar • Front Desk</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20" onClick={cycleTheme}>
          Theme: {THEMES[themeName].name}
        </Button>
        <div className="relative">
          <Button
            variant="secondary"
            className="bg-white/10 text-white hover:bg-white/20"
            onClick={() => setOpen(!open)}
          >
            <User className="w-4 h-4 mr-2" /> Accounts
          </Button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/90 backdrop-blur-xl shadow-2xl border border-white/30 p-2"
              >
                {["Méschac Irung", "Bernard Ng", "Theo Ng", "Glodie Ng"].map((n) => (
                  <div
                    key={n}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    <AvatarBubble name={n} />
                    <span className="text-sm text-slate-700">{n}</span>
                  </div>
                ))}
                <div className="my-2 border-t" />
                <MenuItem icon={<Plus className="w-4 h-4" />} label="Add new account" />
                <MenuItem icon={<Settings className="w-4 h-4" />} label="Preferences" />
                <MenuItem icon={<HelpCircle className="w-4 h-4" />} label="Help" />
                <MenuItem icon={<LogOut className="w-4 h-4" />} label="Sign out" disabled />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function MenuItem({ icon, label, disabled }: { icon: React.ReactNode; label: string; disabled?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-xl ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 cursor-pointer"}`}
    >
      <div className="w-8 h-8 grid place-items-center text-slate-600">{icon}</div>
      <span className="text-sm text-slate-700">{label}</span>
    </div>
  )
}

// --------------------- Desktop controls/table ---------------------
function HeaderControls() {
  const { sortBy, setSortBy, statusFilter, setStatusFilter } = useDashboard()

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Guests</h2>
        <p className="text-slate-500 text-sm">Manage arrivals, sessions, checkouts — with AI nudges.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select onValueChange={(v) => setStatusFilter(v as StatusType | "ALL")}>
          <SelectTrigger className="w-[180px] bg-white/60">
            <SelectValue placeholder="Filter: All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" className="bg-white/70" onClick={() => setSortBy("name")}>
          Sort by Name
        </Button>
        <Button size="sm" className="bg-white/70" onClick={() => setSortBy("status")}>
          Sort by Status
        </Button>
        <Button size="sm" className="bg-white/70" onClick={() => setSortBy("goal")}>
          Sort by Goal
        </Button>
      </div>
    </div>
  )
}

function GuestTable() {
  const { guests, sortBy, statusFilter } = useDashboard()

  const visible = guests.filter((g: any) => (statusFilter === "ALL" ? true : g.status === statusFilter))
  const sorted = [...visible].sort((a, b) => {
    if (sortBy === "status") return a.status.localeCompare(b.status)
    if (sortBy === "goal") return a.goal.localeCompare(b.goal)
    return a.name.localeCompare(b.name)
  })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Goal</TableHead>
          <TableHead>Experience</TableHead>
          <TableHead>Cart (with prices)</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((guest) => (
          <GuestRow key={guest.id} guest={guest} />
        ))}
      </TableBody>
    </Table>
  )
}

function GuestRow({ guest }: { guest: any }) {
  const { setSelectedGuest, guests, setGuests, stock, setStock, theme } = useDashboard()

  const updateStatus = (id: number, status: StatusType) => {
    setGuests((prev: any) => prev.map((g: any) => (g.id === id ? { ...g, status } : g)))
  }

  const assignExperience = (id: number, experience: string) => {
    setGuests((prev: any) =>
      prev.map((g: any) => (g.id === id ? { ...g, experience, cart: [...g.cart, experience] } : g)),
    )
    alert(`${experience} booked for guest ${id}`)
  }

  const addToCart = (id: number, item: string) => {
    if (stock[item] && stock[item] > 0) {
      setGuests((prev: any) => prev.map((g: any) => (g.id === id ? { ...g, cart: [...g.cart, item], drink: item } : g)))
      setStock((prev: any) => ({ ...prev, [item]: prev[item] - 1 }))
    }
  }

  const finalizeCart = (id: number) => {
    const g = guests.find((x: any) => x.id === id)
    if (g) {
      const total = g.cart.reduce((sum: number, item: string) => sum + (priceList[item] || 0), 0)
      alert(`Guest ${id} cart finalized with Stripe payment. Total: $${total}`)
    }
    setGuests((prev: any) => prev.map((g: any) => (g.id === id ? { ...g, cart: [] } : g)))
  }

  return (
    <TableRow>
      <TableCell>
        <button
          className="flex items-center gap-3 text-slate-800 hover:text-emerald-600"
          onClick={() => setSelectedGuest(guest)}
        >
          <AvatarBubble name={guest.name} />
          <span className="underline decoration-transparent hover:decoration-emerald-400">{guest.name}</span>
        </button>
      </TableCell>
      <TableCell className="min-w-[190px]">
        <div className="flex items-center gap-2">
          <StatusBadge value={guest.status} />
          <Select value={guest.status} onValueChange={(v) => updateStatus(guest.id, v as StatusType)}>
            <SelectTrigger className="h-8 w-28 bg-white/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TableCell>
      <TableCell>{guest.goal}</TableCell>
      <TableCell className="w-64">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/70 border border-white/60 shadow-sm">
            <Sparkles className={`w-3.5 h-3.5`} /> {guest.experience}
            {guest.experience && <span className="text-xs text-slate-500">(${priceList[guest.experience] || 0})</span>}
          </span>
          <ProgressBar percent={guest.progress || 0} />
        </div>
      </TableCell>
      <TableCell>
        {guest.cart.length > 0 ? (
          guest.cart.map((item: string, idx: number) => (
            <div key={idx} className="text-slate-700">
              {item} - ${priceList[item] || 0}
            </div>
          ))
        ) : (
          <span className="text-slate-400">-</span>
        )}
      </TableCell>
      <TableCell className="text-right space-x-2">
        <Button
          size="sm"
          variant="outline"
          className="bg-white/70"
          onClick={() => assignExperience(guest.id, "Sauna Pod")}
        >
          Sauna
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-white/70"
          onClick={() => assignExperience(guest.id, "Ice Bath")}
        >
          Ice Bath
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-white/70"
          onClick={() => assignExperience(guest.id, "Float Tank")}
        >
          Float
        </Button>
        <Button size="sm" variant="outline" className="bg-white/70" onClick={() => addToCart(guest.id, "Electrolytes")}>
          + Electrolytes
        </Button>
        <Button size="sm" variant="outline" className="bg-white/70" onClick={() => addToCart(guest.id, "Adaptogens")}>
          + Adaptogens
        </Button>
        <Button size="sm" variant="outline" className="bg-white/70" onClick={() => addToCart(guest.id, "Sparkling")}>
          + Sparkling
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className={`${theme.button} text-white`}
          onClick={() => finalizeCart(guest.id)}
        >
          Finalize & Pay
        </Button>
      </TableCell>
    </TableRow>
  )
}

// --------------------- Side cards ---------------------
function StockCard() {
  const { stock } = useDashboard()
  return (
    <Card className="p-4 shadow-xl border border-white/10 bg-white/70 backdrop-blur-xl rounded-2xl">
      <h2 className="text-lg font-semibold mb-4 text-slate-800">Stock Levels</h2>
      {Object.entries(stock).map(([item, qty]) => (
        <p key={item} className="text-slate-700 flex justify-between">
          <span>{item}</span>
          <span className={qty < 5 ? "text-red-500" : "text-emerald-600"}>{qty}</span>
        </p>
      ))}
    </Card>
  )
}

function SnapshotCard() {
  const { guests } = useDashboard()
  return (
    <Card className="p-4 shadow-xl border border-white/10 bg-white/70 backdrop-blur-xl rounded-2xl">
      <h2 className="text-lg font-semibold mb-4 text-slate-800">Daily Snapshot</h2>
      <p className="text-slate-700">Guests Today: {guests.length}</p>
      <p className="text-slate-700">Checked In: {guests.filter((g: any) => g.status === "Checked In").length}</p>
      <p className="text-slate-700">In Session: {guests.filter((g: any) => g.status === "In Session").length}</p>
      <p className="text-slate-700">Completed: {guests.filter((g: any) => g.status === "Completed").length}</p>
    </Card>
  )
}

function AssistantCard() {
  const { theme } = useDashboard()
  return (
    <Card className="p-4 shadow-xl border border-white/10 bg-white/70 backdrop-blur-xl rounded-2xl">
      <h2 className="text-lg font-semibold mb-2 text-slate-800 flex items-center gap-2">
        <Sparkles className={`w-4 h-4`} /> Contextual AI Assistant
      </h2>
      <p className="text-slate-600 text-sm mb-3">Personalized nudges based on goals, schedule and availability.</p>
      <div className="rounded-xl border border-white/60 bg-white/80 p-3 shadow-sm">
        <div className="text-sm text-slate-700">"Alice finished Sauna Pod — suggest Electrolytes ($8) now?"</div>
        <div className="mt-3 flex gap-2">
          <Button size="sm" className={`${theme.button} text-white`}>
            Add to Cart
          </Button>
          <Button size="sm" variant="outline" className="bg-white/70">
            Skip
          </Button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-2 opacity-80">
        {["vercel", "openai", "supabase", "stripe", "cloudflare"].map((k) => (
          <div key={k} className="h-10 rounded-xl border border-white/60 bg-white/70" />
        ))}
      </div>
    </Card>
  )
}

// --------------------- Profile ---------------------
function ProfileModal() {
  const { selectedGuest, setSelectedGuest, theme } = useDashboard()
  if (!selectedGuest) return null
  const total = selectedGuest.cart.reduce((sum: number, item: string) => sum + (priceList[item] || 0), 0)
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <Card className="p-0 bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Gradient verification header */}
          <div className="px-6 pt-6">
            <h2 className="text-xl font-semibold">{selectedGuest.name}</h2>
            <p className="text-slate-500 text-sm -mt-0.5">Guest profile</p>
          </div>
          <div className="mt-4 px-6">
            <div className="inline-flex items-center gap-2 rounded-xl overflow-hidden shadow-sm">
              <div className="px-2 py-1 bg-white border">
                {" "}
                <BadgeCheck className={`w-4 h-4`} />{" "}
              </div>
              <div className={`px-3 py-1 bg-gradient-to-r ${theme.gradient} text-white text-sm`}>Verified</div>
            </div>
          </div>
          <div className="px-6 py-5 space-y-3">
            <p>
              <span className="font-semibold">Goal:</span> {selectedGuest.goal}
            </p>
            <p>
              <span className="font-semibold">Status:</span> {selectedGuest.status}
            </p>
            <p>
              <span className="font-semibold">Experience:</span> {selectedGuest.experience}{" "}
              {selectedGuest.experience && `($${(priceList as any)[selectedGuest.experience] || 0})`}
            </p>
            <div>
              <p className="mb-1 font-semibold">Session progress</p>
              <ProgressBar percent={selectedGuest.progress || 0} />
            </div>
            <div>
              <p className="mb-1 font-semibold">Cart:</p>
              {selectedGuest.cart.length > 0 ? (
                <ul className="list-disc pl-4">
                  {selectedGuest.cart.map((item: string, idx: number) => (
                    <li key={idx}>
                      {item} - ${priceList[item] || 0}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500">-</p>
              )}
              <p className="mt-3 font-semibold">Total: ${total}</p>
            </div>
            <div className="pt-2">
              <Button className="w-full" onClick={() => setSelectedGuest(null)}>
                Close
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

// --------------------- Mobile tabs + list ---------------------
function MobileStageTabs() {
  const { statusFilter, setStatusFilter, theme } = useDashboard()
  const tabs: Array<StatusType | "ALL"> = ["ALL", "Waiting", "Checked In", "In Session", "Completed"]
  return (
    <div className="md:hidden">
      <div className="flex gap-2 overflow-auto no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setStatusFilter(t as any)}
            className={`px-3 py-2 rounded-xl text-sm whitespace-nowrap border ${statusFilter === t ? `bg-gradient-to-r ${theme.gradient} text-white` : "bg-white/70"}`}
          >
            {t === "ALL" ? "All" : t}
          </button>
        ))}
      </div>
    </div>
  )
}

function GuestListMobile() {
  const { guests, setGuests, sortBy, statusFilter, theme } = useDashboard()

  const visible = guests.filter((g: any) => (statusFilter === "ALL" ? true : g.status === statusFilter))
  const sorted = [...visible].sort((a, b) => {
    if (sortBy === "status") return a.status.localeCompare(b.status)
    if (sortBy === "goal") return a.goal.localeCompare(b.goal)
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="grid gap-3">
      {sorted.map((g: any) => (
        <div key={g.id} className="rounded-2xl p-4 bg-white/80 border border-white/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AvatarBubble name={g.name} />
              <div>
                <div className="font-semibold text-slate-800">{g.name}</div>
                <div className="text-sm text-slate-500">{g.goal}</div>
              </div>
            </div>
            <StatusBadge value={g.status} />
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4" /> {g.experience}
              {g.experience && <span className="text-xs text-slate-500">(${priceList[g.experience] || 0})</span>}
            </div>
            <ProgressBar percent={g.progress || 0} />
          </div>
          <div className="mt-3 text-sm text-slate-600">Cart: {g.cart.length ? g.cart.join(", ") : "-"}</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-white/70"
              onClick={() =>
                setGuests((prev: any) =>
                  prev.map((x: any) => (x.id === g.id ? { ...x, cart: [...x.cart, "Electrolytes"] } : x)),
                )
              }
            >
              + Electrolytes
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white/70"
              onClick={() =>
                setGuests((prev: any) =>
                  prev.map((x: any) => (x.id === g.id ? { ...x, cart: [...x.cart, "Adaptogens"] } : x)),
                )
              }
            >
              + Adaptogens
            </Button>
            <Button
              size="sm"
              className={`${theme.button} text-white`}
              onClick={() => {
                const guest = guests.find((x: any) => x.id === g.id)
                const total = guest.cart.reduce((s: number, i: string) => s + (priceList[i] || 0), 0)
                alert(`Guest ${g.id} cart finalized with Stripe payment. Total: $${total}`)
                setGuests((prev: any) => prev.map((x: any) => (x.id === g.id ? { ...x, cart: [] } : x)))
              }}
            >
              Pay
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
