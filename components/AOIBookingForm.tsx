'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, Brain } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Experience {
  id: string;
  name: string;
  duration_minutes: number;
  venue_price: number;
}

export default function AOIBookingForm() {
  const AOI_VENUE_ID = '20c2f440-9133-42ec-a8d6-6336e649ec4b';
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const supabase = createClient();

  const fetchExperiencesCallback = useCallback(async () => {
    const { data } = await supabase
      .from('venue_experiences')
      .select(`
        experience_id,
        experience_name,
        duration_minutes,
        venue_price
      `)
      .eq('venue_id', AOI_VENUE_ID);

    if (data) {
      const formattedExperiences = data.map((item: any) => ({
        id: item.experience_id,
        name: item.experience_name,
        duration_minutes: item.duration_minutes,
        venue_price: parseFloat(item.venue_price)
      }));
      setExperiences(formattedExperiences);
    }
  }, [supabase]);

  useEffect(() => {
    fetchExperiencesCallback();
  }, [fetchExperiencesCallback]);

  const generateAvailableSlotsCallback = useCallback(async (date: string, experience: Experience) => {
    setLoadingSlots(true);
    try {
      const { data: existingBookings, error } = await supabase
        .from('bookings')
        .select('slot_time, duration_minutes')
        .eq('venue_id', AOI_VENUE_ID)
        .gte('slot_time', `${date}T00:00:00`)
        .lt('slot_time', `${date}T23:59:59`)
        .in('booking_status', ['sessions_scheduled', 'in_session']);
      
      if (error) throw error;

      const slots: string[] = [];
      const startHour = 9;
      const endHour = 21;
      const slotInterval = 10;
      const experienceDuration = experience.duration_minutes || 60;
      const bufferTime = 10;

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotInterval) {
          const slotTime = new Date(`${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`);
          const slotEndTime = new Date(slotTime.getTime() + experienceDuration * 60000);
          
          if (slotEndTime.getHours() > endHour) continue;
          
          const hasConflict = existingBookings?.some((booking: any) => {
            const bookingStart = new Date(booking.slot_time);
            const bookingEnd = new Date(bookingStart.getTime() + (booking.duration_minutes + bufferTime) * 60000);
            const newSlotStart = slotTime;
            const newSlotEnd = new Date(slotTime.getTime() + (experienceDuration + bufferTime) * 60000);
            
            return (newSlotStart < bookingEnd && newSlotEnd > bookingStart);
          });
          
          if (!hasConflict) {
            slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
          }
        }
      }
      
      setAvailableTimeSlots(slots);
    } catch (err) {
      console.error('Error generating time slots:', err);
      setAvailableTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (selectedDate && selectedExperience) {
      const experience = experiences.find(exp => exp.id === selectedExperience);
      if (experience) {
        generateAvailableSlotsCallback(selectedDate, experience);
      }
    }
  }, [selectedDate, selectedExperience, generateAvailableSlotsCallback, experiences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (!selectedExperience || !selectedDate || !selectedTime || !customerName) {
      setMessage('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    const slotDateTime = `${selectedDate}T${selectedTime}:00`;

    try {
      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          venueId: AOI_VENUE_ID,
          experienceId: selectedExperience,
          slotTime: slotDateTime,
          customerEmail,
          customerName
        }),
      });

      const result = await response.json();

      if (response.ok) {
        const selectedExp = experiences.find(exp => exp.id === selectedExperience);
        setMessage(`✓ Booking confirmed! Your ${selectedExp?.name} session is scheduled for ${selectedDate} at ${selectedTime}. ${customerEmail ? `Confirmation sent to ${customerEmail}.` : ''}`);
        // Reset form
        setSelectedExperience('');
        setSelectedDate('');
        setSelectedTime('');
        setCustomerEmail('');
        setCustomerName('');
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch {
      setMessage('There was an error processing your booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedExp = experiences.find(exp => exp.id === selectedExperience);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-light text-white">Reserve Your Transformation</h3>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30">
          <Brain className="w-4 h-4 text-purple-300" />
          <span className="text-purple-300 text-sm">AI-Optimized Booking</span>
        </div>
      </div>
      
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl mb-6 ${
            message.includes('Error') || message.includes('error') 
              ? 'bg-red-500/10 border border-red-500/20 text-red-300' 
              : 'bg-green-500/10 border border-green-500/20 text-green-300'
          }`}
        >
          {message}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Experience Selector */}
        <div>
          <label className="text-white/70 text-sm mb-3 block">Select Experience</label>
          <select 
            value={selectedExperience}
            onChange={(e) => setSelectedExperience(e.target.value)}
            className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white appearance-none cursor-pointer focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
            required
          >
            <option value="" className="bg-gray-900 text-white">Choose an experience...</option>
            {experiences.map(exp => (
              <option key={exp.id} value={exp.id} className="bg-gray-900 text-white">
                {exp.name} - {exp.duration_minutes}min - AED {exp.venue_price}
              </option>
            ))}
          </select>
        </div>

        {/* Date & Time */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">Date</label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all" 
              required
              min={new Date().toISOString().split('T')[0]}
              max={new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="text-white/70 text-sm mb-2 block">
              Available Times
              {loadingSlots && <span className="text-purple-400 ml-2">Loading...</span>}
            </label>
            {availableTimeSlots.length > 0 ? (
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white appearance-none cursor-pointer focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                required
              >
                <option value="" className="bg-gray-900 text-white">Select available time...</option>
                {availableTimeSlots.map((slot) => (
                  <option key={slot} value={slot} className="bg-gray-900 text-white">
                    {slot}
                  </option>
                ))}
              </select>
            ) : selectedDate && selectedExperience && !loadingSlots ? (
              <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
                No available slots for this date. Please select another date.
              </div>
            ) : (
              <div className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white/50 text-sm">
                Select date and experience to see available times
              </div>
            )}
          </div>
        </div>

        {/* Customer Details */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">Name *</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="text-white/70 text-sm mb-2 block">Email (for confirmation)</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
              placeholder="your@email.com"
            />
          </div>
        </div>

        {/* Experience Details */}
        {selectedExp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium">{selectedExp.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/60">Duration:</span>
                <span className="text-white ml-2">{selectedExp.duration_minutes} minutes</span>
              </div>
              <div>
                <span className="text-white/60">Price:</span>
                <span className="text-white ml-2">AED {selectedExp.venue_price}</span>
              </div>
            </div>
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? 'Creating Booking...' : 'Reserve Your Session'}
        </motion.button>
      </form>
    </motion.div>
  );
}
