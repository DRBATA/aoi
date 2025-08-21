"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Client {
  id: string
  name: string
  time: string
  service: string
  status: "unconfirmed" | "confirmed" | "arrived" | "in-service" | "completed"
  avatar?: string
  duration?: string
  notes?: string
}

const mockClients: Client[] = [
  {
    id: "1",
    name: "Emma Thompson",
    time: "9:00am",
    service: "Deep Tissue Massage",
    status: "confirmed",
    duration: "60min",
  },
  { id: "2", name: "James Wilson", time: "9:30am", service: "Facial Treatment", status: "arrived", duration: "45min" },
  { id: "3", name: "Sarah Chen", time: "10:00am", service: "Sauna Session", status: "unconfirmed", duration: "30min" },
  { id: "4", name: "Michael Brown", time: "10:30am", service: "Aromatherapy", status: "in-service", duration: "90min" },
  {
    id: "5",
    name: "Lisa Garcia",
    time: "11:00am",
    service: "Hot Stone Massage",
    status: "confirmed",
    duration: "75min",
  },
  { id: "6", name: "David Kim", time: "11:30am", service: "Reflexology", status: "completed", duration: "45min" },
]

const services = [
  { name: "Sauna", icon: "🧖‍♀️", color: "bg-orange-100 text-orange-800" },
  { name: "Massage Room 1", icon: "💆‍♀️", color: "bg-blue-100 text-blue-800" },
  { name: "Massage Room 2", icon: "💆‍♂️", color: "bg-purple-100 text-purple-800" },
  { name: "Facial Suite", icon: "✨", color: "bg-pink-100 text-pink-800" },
  { name: "Relaxation Lounge", icon: "🧘‍♀️", color: "bg-green-100 text-green-800" },
]

export function SpaPOSSystem() {
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [draggedClient, setDraggedClient] = useState<Client | null>(null)
  const [dragOverArea, setDragOverArea] = useState<string | null>(null)
  const dragRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (client: Client) => {
    setDraggedClient(client)
  }

  const handleDragEnd = () => {
    setDraggedClient(null)
    setDragOverArea(null)
  }

  const handleDragOver = (e: React.DragEvent, area: string) => {
    e.preventDefault()
    setDragOverArea(area)
  }

  const handleDrop = (e: React.DragEvent, newStatus: Client["status"]) => {
    e.preventDefault()
    if (draggedClient) {
      setClients((prev) =>
        prev.map((client) => (client.id === draggedClient.id ? { ...client, status: newStatus } : client)),
      )
    }
    setDragOverArea(null)
  }

  const getStatusClients = (status: Client["status"]) => clients.filter((client) => client.status === status)

  const getStatusColor = (status: Client["status"]) => {
    switch (status) {
      case "unconfirmed":
        return "bg-yellow-50 border-yellow-200"
      case "confirmed":
        return "bg-blue-50 border-blue-200"
      case "arrived":
        return "bg-green-50 border-green-200"
      case "in-service":
        return "bg-purple-50 border-purple-200"
      case "completed":
        return "bg-gray-50 border-gray-200"
      default:
        return "bg-white border-gray-200"
    }
  }

  const getStatusTitle = (status: Client["status"]) => {
    switch (status) {
      case "unconfirmed":
        return "Unconfirmed"
      case "confirmed":
        return "Confirmed"
      case "arrived":
        return "Arrived"
      case "in-service":
        return "In Service"
      case "completed":
        return "Completed"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spa-mint-light/20 via-white/80 to-spa-mint-light/10">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-md border-b border-spa-mint/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-spa-mint to-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Serenity Spa</h1>
                <p className="text-muted-foreground text-sm">Front Desk Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-spa-mint/10 text-spa-mint-dark border-spa-mint/30">
                Today: {new Date().toLocaleDateString()}
              </Badge>
              <Button className="bg-primary hover:bg-primary/90">New Appointment</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          {/* Status Columns */}
          {(["unconfirmed", "confirmed", "arrived", "in-service", "completed"] as const).map((status) => (
            <Card
              key={status}
              className={`p-4 min-h-[500px] transition-all duration-300 bg-white/40 backdrop-blur-sm border-white/60 ${
                dragOverArea === status ? "ring-2 ring-primary shadow-lg scale-105" : ""
              }`}
              onDragOver={(e) => handleDragOver(e, status)}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">{getStatusTitle(status)}</h3>
                <Badge variant="secondary" className="text-xs">
                  {getStatusClients(status).length}
                </Badge>
              </div>

              <div className="space-y-3">
                {getStatusClients(status).map((client) => (
                  <div
                    key={client.id}
                    draggable
                    onDragStart={() => handleDragStart(client)}
                    onDragEnd={handleDragEnd}
                    className="bg-white rounded-lg p-3 shadow-sm border border-white/50 cursor-move hover:shadow-md transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={client.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-spa-mint/20 text-spa-mint-dark text-xs">
                          {client.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{client.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {client.time} • {client.duration}
                        </p>
                        <p className="text-xs text-spa-mint-dark font-medium">{client.service}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Service Areas - Gesture Drop Zones */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {services.map((service) => (
            <Card
              key={service.name}
              className={`p-6 text-center hover:shadow-lg transition-all duration-300 cursor-pointer bg-white/30 backdrop-blur-sm border-white/50 ${
                dragOverArea === service.name ? "ring-2 ring-primary shadow-xl scale-105" : ""
              }`}
              onDragOver={(e) => handleDragOver(e, service.name)}
              onDrop={(e) => handleDrop(e, "in-service")}
            >
              <div className="text-3xl mb-2 gentle-pulse">{service.icon}</div>
              <h4 className="font-medium text-sm text-foreground mb-1">{service.name}</h4>
              <Badge className={`text-xs ${service.color}`}>Available</Badge>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-4">
            <Button variant="outline" className="glass-effect hover:bg-spa-mint/10 bg-transparent">
              View Schedule
            </Button>
            <Button variant="outline" className="glass-effect hover:bg-spa-mint/10 bg-transparent">
              Client History
            </Button>
            <Button variant="outline" className="glass-effect hover:bg-spa-mint/10 bg-transparent">
              Reports
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
