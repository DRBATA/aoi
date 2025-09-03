'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';


interface Experience {
  id: string;
  name: string;
  duration_minutes: number;
  venue_price: number;
}

export default function BookingForm() {
  const AOI_VENUE_ID = '20c2f440-9133-42ec-a8d6-6336e649ec4b'; // Art of Implosion x Johny Dar Experience
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
      const formattedExperiences = data.map(item => ({
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
    setLoadingSlots(true)
    try {
      const { data: existingBookings, error } = await supabase
        .from('bookings')
        .select('slot_time, duration_minutes')
        .eq('venue_id', AOI_VENUE_ID)
        .gte('slot_time', `${date}T00:00:00`)
        .lt('slot_time', `${date}T23:59:59`)
        .eq('booking_status', 'booked')
      
      if (error) throw error

      const slots: string[] = []
      const startHour = 9
      const endHour = 21
      const slotInterval = 10
      const experienceDuration = experience.duration_minutes || 60
      const bufferTime = 10

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotInterval) {
          const slotTime = new Date(`${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`)
          const slotEndTime = new Date(slotTime.getTime() + experienceDuration * 60000)
          
          if (slotEndTime.getHours() > endHour) continue
          
          const hasConflict = existingBookings?.some(booking => {
            const bookingStart = new Date(booking.slot_time)
            const bookingEnd = new Date(bookingStart.getTime() + (booking.duration_minutes + bufferTime) * 60000)
            const newSlotStart = slotTime
            const newSlotEnd = new Date(slotTime.getTime() + (experienceDuration + bufferTime) * 60000)
            
            return (newSlotStart < bookingEnd && newSlotEnd > bookingStart)
          })
          
          if (!hasConflict) {
            slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
          }
        }
      }
      
      setAvailableTimeSlots(slots)
    } catch (err) {
      console.error('Error creating booking:', err)
      setMessage('Error creating booking. Please try again.')
      setIsLoading(false)
      setAvailableTimeSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }, [supabase])

  useEffect(() => {
    if (selectedDate && selectedExperience) {
      const experience = experiences.find(exp => exp.id === selectedExperience)
      if (experience) {
        generateAvailableSlotsCallback(selectedDate, experience)
      }
    }
  }, [selectedDate, selectedExperience, generateAvailableSlotsCallback, experiences])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

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
        setMessage(`Booking created successfully! Booking ID: ${result.booking.id}`);
        // Reset form
        setSelectedExperience('');
        setSelectedDate('');
        setSelectedTime('');
        setCustomerEmail('');
        setCustomerName('');
        setExperiences([]);
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch {
      setMessage('Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedExp = experiences.find(exp => exp.id === selectedExperience);

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Create Booking</h2>
      
      {message && (
        <div className={`p-3 rounded mb-4 ${
          message.includes('Error') || message.includes('Failed') 
            ? 'bg-red-100 text-red-700 border border-red-300' 
            : 'bg-green-100 text-green-700 border border-green-300'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
          <select
            value={selectedExperience}
            onChange={(e) => setSelectedExperience(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select an experience</option>
            {experiences.map(exp => (
              <option key={exp.id} value={exp.id}>
                {exp.name} ({exp.duration_minutes} min) - {exp.venue_price} AED
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min={new Date().toISOString().split('T')[0]}
            max={new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Available Times
            {loadingSlots && <span className="text-purple-600 ml-2">Loading...</span>}
          </label>
          {availableTimeSlots.length > 0 ? (
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select available time...</option>
              {availableTimeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          ) : selectedDate && selectedExperience && !loadingSlots ? (
            <div className="w-full p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              No available slots for this date. Please select another date.
            </div>
          ) : (
            <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-500 text-sm">
              Select date and experience to see available times
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Optional"
          />
        </div>

        {selectedExp && (
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Duration:</strong> {selectedExp.duration_minutes} minutes<br/>
              <strong>Price:</strong> {selectedExp.venue_price} AED
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Booking...' : 'Create Booking'}
        </button>
      </form>
    </div>
  );
}
