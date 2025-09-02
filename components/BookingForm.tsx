'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

interface Venue {
  id: string;
  name: string;
}

interface Experience {
  id: string;
  name: string;
  duration_minutes: number;
  venue_price: number;
}

export default function BookingForm() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedVenue, setSelectedVenue] = useState('');
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

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    if (selectedVenue) {
      fetchExperiences();
    }
  }, [selectedVenue]);

  // Generate available time slots when date and experience change
  useEffect(() => {
    if (selectedDate && selectedExperience) {
      generateAvailableSlots(selectedDate, selectedExperience);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDate, selectedExperience]);

  const fetchVenues = async () => {
    const { data } = await supabase
      .from('venue')
      .select('id, name')
      .order('name');
    
    if (data) setVenues(data);
  };

  const fetchExperiences = async () => {
    const { data } = await supabase
      .from('venue_experiences')
      .select(`
        experience_id,
        experience_name,
        duration_minutes,
        venue_price
      `)
      .eq('venue_id', selectedVenue)
      .eq('is_available', true);
    
    if (data) {
      const formattedExperiences = data.map(item => ({
        id: item.experience_id,
        name: item.experience_name,
        duration_minutes: item.duration_minutes,
        venue_price: parseFloat(item.venue_price)
      }));
      setExperiences(formattedExperiences);
    }
  };

  // Generate available time slots based on existing bookings
  const generateAvailableSlots = useCallback(async (date: string, experienceId: string) => {
    if (!date || !experienceId) return [];
    
    setLoadingSlots(true);
    
    try {
      // Get selected experience duration
      const selectedExp = experiences.find(exp => exp.id === experienceId);
      const duration = selectedExp?.duration_minutes || 30;
      
      // Fetch existing bookings for the date and experience
      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('slot_time, duration_minutes')
        .eq('experience_id', experienceId)
        .gte('slot_time', `${date}T00:00:00`)
        .lt('slot_time', `${date}T23:59:59`)
        .in('booking_status', ['active', 'booked', 'ordered']);
      
      // Extract booked time slots
      const bookedSlots = existingBookings?.map(booking => ({
        time: new Date(booking.slot_time).toTimeString().slice(0, 5),
        duration: booking.duration_minutes || 30
      })) || [];
      
      // Generate all possible 10-minute slots from 9 AM to 9 PM
      const allSlots: string[] = [];
      for (let hour = 9; hour < 21; hour++) {
        for (let minute = 0; minute < 60; minute += 10) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          allSlots.push(timeString);
        }
      }
      
      // Filter out unavailable slots based on experience duration with 10-minute separation
      const availableSlots = allSlots.filter(slot => {
        const [slotHour, slotMinute] = slot.split(':').map(Number);
        const slotStart = slotHour * 60 + slotMinute;
        const slotEnd = slotStart + duration;
        
        return !bookedSlots.some(booked => {
          const [bookedHour, bookedMinute] = booked.time.split(':').map(Number);
          const bookedStart = bookedHour * 60 + bookedMinute - 10; // 10-min separation before
          const bookedEnd = bookedStart + booked.duration + 20; // 10-min separation after
          
          // Check if slot overlaps with booked time (including 10-min separation)
          return (slotStart < bookedEnd && slotEnd > bookedStart);
        });
      });
      
      setAvailableTimeSlots(availableSlots);
      return availableSlots;
    } catch (error) {
      console.error('Error generating time slots:', error);
      return [];
    } finally {
      setLoadingSlots(false);
    }
  }, [supabase, experiences]);

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
          venueId: selectedVenue,
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
        setSelectedVenue('');
        setSelectedExperience('');
        setSelectedDate('');
        setSelectedTime('');
        setCustomerEmail('');
        setCustomerName('');
        setExperiences([]);
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
          <select
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            <option value="">Select a venue</option>
            {venues.map(venue => (
              <option key={venue.id} value={venue.id}>{venue.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
          <select
            value={selectedExperience}
            onChange={(e) => setSelectedExperience(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
            disabled={!selectedVenue}
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
            className="w-full border border-gray-300 rounded-md px-3 py-2"
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
              className="w-full border border-gray-300 rounded-md px-3 py-2"
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
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
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
