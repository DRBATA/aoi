"use client"

import React, { useState, useEffect } from 'react'
import { Clock, AlertTriangle, CheckCircle, Coffee } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface TimingAlert {
  id: string
  guest_name: string
  drink_name: string
  timing_type: 'pre-session' | 'during' | 'post-session' | 'ongoing'
  minutes_until_serve: number
  priority: 'high' | 'medium' | 'low'
  ai_reasoning: string
  session_time?: string
  experience_name?: string
  status: 'pending' | 'acknowledged' | 'served'
}

interface Booking {
  id: string
  guestName: string
  time: string
  duration?: number
}

interface TimingAlertsProps {
  bookings: Booking[]
  onAlertAcknowledgeAction: (alertId: string) => void
  onMarkServedAction: (alertId: string) => void
}

export default function TimingAlerts({ bookings, onAlertAcknowledgeAction, onMarkServedAction }: TimingAlertsProps) {
  const [alerts, setAlerts] = useState<TimingAlert[]>([])

  useEffect(() => {
    // Generate simple timing alerts from bookings
    const generateAlerts = () => {
      const newAlerts: TimingAlert[] = bookings.map((booking: Booking) => {
        const sessionStart = new Date(`${booking.date}T${booking.time}`)
        const minutesUntil = Math.round((sessionStart.getTime() - new Date().getTime()) / 60000)
        
        // Only show alerts for upcoming sessions
        if (minutesUntil > -30 && minutesUntil < 120) {
          return {
            id: booking.id,
            guest_name: booking.guestName,
            drink_name: 'Session Starting Soon',
            timing_type: 'session',
            minutes_until_serve: minutesUntil,
            priority: minutesUntil <= 15 ? 'high' : minutesUntil <= 30 ? 'medium' : 'low',
            ai_reasoning: `${booking.experience_name} session`,
            session_time: booking.time,
            experience_name: booking.experience_name,
            status: 'pending'
          }
        }
        return null
      }).filter((alert): alert is TimingAlert => alert !== null)
      
      // Sort by urgency (soonest first)
      newAlerts.sort((a, b) => a.minutes_until_serve - b.minutes_until_serve)
      setAlerts(newAlerts)
    }

    generateAlerts()
    
    // Update alerts every minute
    const interval = setInterval(generateAlerts, 60000)
    return () => clearInterval(interval)
  }, [bookings])

  const calculateServingTime = (booking: Booking, timing: string): Date => {
    const sessionStart = new Date(`${booking.date}T${booking.time}`)
    
    switch(timing) {
      case 'pre-session':
        return new Date(sessionStart.getTime() - 30 * 60000) // 30min before
      case 'during':
        return sessionStart
      case 'post-session':
        return new Date(sessionStart.getTime() + (booking.duration || 60) * 60000)
      default:
        return new Date()
    }
  }

  const getPriority = (minutesUntil: number): 'high' | 'medium' | 'low' => {
    if (minutesUntil <= 0 && minutesUntil >= -5) return 'high' // Serve now
    if (minutesUntil <= 5) return 'high' // Serve very soon
    if (minutesUntil <= 15) return 'medium' // Prepare soon
    return 'low' // Future preparation
  }

  const getTimingIcon = (timing: string) => {
    switch(timing) {
      case 'pre-session': return <Clock className="w-4 h-4" />
      case 'during': return <Coffee className="w-4 h-4" />
      case 'post-session': return <CheckCircle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getTimingText = (minutesUntil: number) => {
    if (minutesUntil <= 0) return 'SERVE NOW'
    if (minutesUntil === 1) return 'in 1 minute'
    return `in ${minutesUntil} minutes`
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    }
  }

  if (alerts.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-xl border-white/20">
        <div className="p-4">
          <h3 className="text-lg font-light text-white mb-2">Drink Timing Alerts</h3>
          <p className="text-white/60 text-sm">No upcoming drink service alerts</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-light text-white">Drink Timing Alerts</h3>
          <Badge className="bg-purple-500/20 text-purple-300">
            {alerts.filter(a => a.priority === 'high').length} urgent
          </Badge>
        </div>
        
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${getPriorityColor(alert.priority)} transition-all`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTimingIcon(alert.timing_type)}
                  <div>
                    <h4 className="font-medium text-white">{alert.guest_name}</h4>
                    <p className="text-sm text-white/70">{alert.drink_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    alert.minutes_until_serve <= 0 ? 'text-red-300' : 'text-white'
                  }`}>
                    {getTimingText(alert.minutes_until_serve)}
                  </div>
                  <div className="text-xs text-white/50 capitalize">
                    {alert.timing_type.replace('-', ' ')}
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-white/60 mb-2">
                <strong>Session:</strong> {alert.experience_name} at {alert.session_time}
              </div>
              
              <div className="text-xs text-white/50 mb-3">
                <strong>AI Reasoning:</strong> {alert.ai_reasoning}
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAlertAcknowledgeAction(alert.id)}
                  className="text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Acknowledge
                </Button>
                <Button
                  size="sm"
                  onClick={() => onMarkServedAction(alert.id)}
                  className="text-xs bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30"
                >
                  Mark Served
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
