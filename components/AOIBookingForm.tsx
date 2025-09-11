'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Experience {
  id: string;
  name: string;
  duration_minutes: number;
  venue_price: number;
}

interface BookingRow {
  id: string;
  experience_id: string;
  experience_name: string;
  duration_minutes: number;
  selected_time: string;
  source: 'user' | 'ai';
  pathway_name?: string;
  pathway_color?: string;
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
  const [isAIControlled, setIsAIControlled] = useState(false);
  const [suggestions, setSuggestions] = useState<Record<string, unknown>[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [bookingRows, setBookingRows] = useState<BookingRow[]>([]);

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
      const formattedExperiences = data.map((item: { experience_id: string; experience_name: string; duration_minutes: number; venue_price: string }) => ({
        id: item.experience_id,
        name: item.experience_name,
        duration_minutes: item.duration_minutes,
        venue_price: parseFloat(item.venue_price)
      }));
      setExperiences(formattedExperiences);
    }
  }, [supabase]);

  const generateSuggestions = useCallback(async () => {
    if (!selectedExperience) return;
    
    setLoadingSuggestions(true);
    try {
      // First call: Fast hardcoded suggestions
      const response = await fetch('/api/pathway-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selected_experience_id: selectedExperience,
          selected_time: selectedTime || null,
          ai_enrich: false
        })
      });

      const data = await response.json();
      if (data.type === 'experience_suggestions') {
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [selectedExperience, selectedTime]);

  const enrichWithAI = useCallback(async () => {
    if (!selectedExperience) return;
    
    try {
      const response = await fetch('/api/pathway-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selected_experience_id: selectedExperience,
          selected_time: selectedTime || null,
          ai_enrich: true
        })
      });

      const data = await response.json();
      if (data.type === 'experience_suggestions') {
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error enriching with AI:', error);
      // Keep original suggestions if AI fails
    }
  }, [selectedExperience, selectedTime]);

  const enrichWithDrinksData = useCallback(async () => {
    if (!selectedExperience || suggestions.length === 0) return;
    
    try {
      // Fetch pathway data for each suggestion
      const enrichedSuggestions = await Promise.all(
        suggestions.map(async (suggestion: Record<string, unknown>) => {
          const response = await fetch('/api/pathway-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              selected_experience_id: suggestion.experience_id,
              pathway_id: suggestion.pathway_id,
              get_drinks_only: true
            })
          });
          
          const data = await response.json();
          return {
            ...suggestion,
            pre_drinks: data.pre_drinks || [],
            during_drinks: data.during_drinks || [],
            after_drinks: data.after_drinks || []
          };
        })
      );
      
      setSuggestions(enrichedSuggestions);
    } catch (error) {
      console.error('Error enriching with drinks data:', error);
      // Keep original suggestions if drinks fetch fails
    }
  }, [selectedExperience, suggestions]);

  useEffect(() => {
    fetchExperiencesCallback();
  }, [fetchExperiencesCallback]);

  useEffect(() => {
    if (selectedExperience) {
      generateSuggestions();
    }
  }, [selectedExperience, generateSuggestions]);
  
  // Trigger enrichments after initial suggestions are loaded
  const [hasEnriched, setHasEnriched] = useState(false);
  
  useEffect(() => {
    if (suggestions.length > 0 && selectedExperience && !hasEnriched) {
      setHasEnriched(true);
      enrichWithAI();
      enrichWithDrinksData();
    }
  }, [suggestions.length, selectedExperience, hasEnriched, enrichWithAI, enrichWithDrinksData]);
  
  // Reset enrichment flag when experience changes
  useEffect(() => {
    setHasEnriched(false);
  }, [selectedExperience]);

  useEffect(() => {
    const handleChatControl = (event: CustomEvent) => {
      const { action, data } = event.detail;
      
      setIsAIControlled(true);
      
      switch(action) {
        case 'selectDate':
          setSelectedDate(data.date);
          break;
        case 'selectTime':
          setSelectedTime(data.time);
          break;
        case 'setCustomerInfo':
          setCustomerName(data.name || '');
          setCustomerEmail(data.email || '');
          break;
        case 'submitBooking':
          // Form submission handled by button click
          break;
      }
      
      // Remove AI control indicator after 2 seconds
      setTimeout(() => setIsAIControlled(false), 2000);
    };

    window.addEventListener('chatControlBooking' as keyof WindowEventMap, handleChatControl as EventListener);
    return () => window.removeEventListener('chatControlBooking' as keyof WindowEventMap, handleChatControl as EventListener);
  }, []);


  const generateAvailableSlots = useCallback(async (date: string, experience: Experience) => {
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
          
          const hasConflict = existingBookings?.some((booking: { slot_time: string; duration_minutes: number }) => {
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
    } catch (error) {
      console.error('Error generating available slots:', error);
      setAvailableTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDate, selectedExperience, experiences, supabase]);

  // Initialize booking rows with user's initial selection
  useEffect(() => {
    if (selectedExperience && selectedTime && experiences.length > 0) {
      const experience = experiences.find(exp => exp.id === selectedExperience);
      if (experience) {
        const initialRow: BookingRow = {
          id: 'initial',
          experience_id: selectedExperience,
          experience_name: experience.name,
          duration_minutes: experience.duration_minutes,
          selected_time: selectedTime,
          source: 'user'
        };
        setBookingRows([initialRow]);
      }
    }
  }, [selectedExperience, selectedTime, experiences]);

  // Helper functions for time calculations
  const calculateBeforeTime = (mainTime: string, duration: number) => {
    const main = new Date(`${selectedDate}T${mainTime}:00`);
    const before = new Date(main.getTime() - (duration + 10) * 60000); // duration + 10min buffer
    return before.toTimeString().slice(0, 5);
  };

  const calculateAfterTime = (mainTime: string, mainExperienceId: string) => {
    const mainExp = experiences.find((exp: Experience) => exp.id === mainExperienceId);
    const main = new Date(`${selectedDate}T${mainTime}:00`);
    const after = new Date(main.getTime() + ((mainExp?.duration_minutes || 30) + 10) * 60000);
    return after.toTimeString().slice(0, 5);
  };

  // Add booking rows from chip selection
  const addBookingRowsFromChip = (chip: Record<string, unknown>) => {
    const newRows: BookingRow[] = [];
    
    if (chip.timing === 'before') {
      // Add single experience before
      const beforeTime = calculateBeforeTime(selectedTime, (chip.duration as number) || 30);
      newRows.push({
        id: `before-${Date.now()}`,
        experience_id: chip.experience_id as string,
        experience_name: chip.experience_name as string,
        duration_minutes: (chip.duration as number) || 30,
        selected_time: beforeTime,
        source: 'ai',
        pathway_name: chip.pathway_name as string,
        pathway_color: chip.pathway_color as string
      });
    } else if (chip.timing === 'after') {
      // Add single experience after
      const afterTime = calculateAfterTime(selectedTime, selectedExperience);
      newRows.push({
        id: `after-${Date.now()}`,
        experience_id: chip.experience_id as string,
        experience_name: chip.experience_name as string,
        duration_minutes: (chip.duration as number) || 30,
        selected_time: afterTime,
        source: 'ai',
        pathway_name: chip.pathway_name as string,
        pathway_color: chip.pathway_color as string
      });
    } else if (chip.timing === 'combo') {
      // Add multiple experiences from combo
      if (chip.pre_experience_id) {
        const beforeTime = calculateBeforeTime(selectedTime, (chip.pre_duration as number) || 10);
        newRows.push({
          id: `combo-before-${Date.now()}`,
          experience_id: chip.pre_experience_id as string,
          experience_name: chip.pre_experience_name as string,
          duration_minutes: (chip.pre_duration as number) || 10,
          selected_time: beforeTime,
          source: 'ai',
          pathway_name: chip.pathway_name as string,
          pathway_color: chip.pathway_color as string
        });
      }
      if (chip.post_experience_id) {
        const afterTime = calculateAfterTime(selectedTime, selectedExperience);
        newRows.push({
          id: `combo-after-${Date.now()}`,
          experience_id: chip.post_experience_id as string,
          experience_name: chip.post_experience_name as string,
          duration_minutes: (chip.post_duration as number) || 10,
          selected_time: afterTime,
          source: 'ai',
          pathway_name: chip.pathway_name as string,
          pathway_color: chip.pathway_color as string
        });
      }
    }
    
    setBookingRows(prev => [...prev, ...newRows]);
  };

  // Generate available time slots when date/experience changes
  useEffect(() => {
    if (selectedDate && selectedExperience && experiences.length > 0) {
      const experience = experiences.find(exp => exp.id === selectedExperience);
      if (experience) {
        generateAvailableSlots(selectedDate, experience);
      }
    }
  }, [selectedDate, selectedExperience, experiences, generateAvailableSlots]);


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setMessage('');

  // For booking rows flow, validate all required fields
  if (bookingRows.length > 0) {
    if (!selectedDate || !customerName || !customerEmail) {
      setMessage('Please fill in date, name, and email');
      setIsLoading(false);
      return;
    }
    
    // Check each booking row has required fields
    for (const row of bookingRows) {
      if (!row.experience_id || !row.selected_time || !row.duration_minutes) {
        setMessage('Each experience must have a time and duration selected');
        setIsLoading(false);
        return;
      }
    }
  } else {
    // Original single experience flow needs all fields
    if (!selectedExperience || !selectedDate || !selectedTime || !customerName || !customerEmail) {
      setMessage('Please fill in all required fields');
      setIsLoading(false);
      return;
    }
  }
    try {
      // Use booking rows if available, otherwise fall back to single experience
      if (bookingRows.length > 0) {
        // Create bookings from all booking rows
        const bookings = bookingRows.map(row => ({
          experience_id: row.experience_id,
          slot_time: `${selectedDate}T${row.selected_time}:00`,
          experience_name: row.experience_name
        }));
        
        // Create all bookings
        console.log('Creating bookings from booking rows:', bookings);
        let allSuccess = true;
        let createdCount = 0;
        
        for (const booking of bookings) {
          const bookingData = {
            venue_id: AOI_VENUE_ID,
            experience_id: booking.experience_id,
            slot_time: booking.slot_time,
            customer_email: customerEmail,
            customer_name: customerName,
            booking_status: 'sessions_scheduled'
          };

          const { error } = await supabase
            .from('bookings')
            .insert([bookingData]);

          if (error) {
            console.error('Error creating booking:', error);
            allSuccess = false;
            break;
          } else {
            createdCount++;
          }
        }

        if (allSuccess) {
          setMessage(`Successfully created ${createdCount} booking${createdCount > 1 ? 's' : ''}! Check your email for confirmation.`);
          // Reset form
          setBookingRows([]);
          setSelectedExperience('');
          setSelectedDate('');
          setSelectedTime('');
          setCustomerName('');
          setCustomerEmail('');
        } else {
          setMessage(`Error creating bookings. ${createdCount} of ${bookings.length} bookings were created.`);
        }
      } else if (selectedSuggestion !== null && suggestions.length > 0) {
        // Fallback to old logic for single experience
        const selectedSuggestionsList = [suggestions[selectedSuggestion]];
      
      if (selectedSuggestionsList.length > 0) {
          const selectedChip = selectedSuggestionsList[0];
          const bookings = [];
          
          // Handle combo selection (before + main + after)
          if (selectedChip.timing === 'combo') {
            console.log('Combo chip selected:', selectedChip);
            // Get main experience details
            const mainExp = experiences.find(exp => exp.id === selectedExperience);
            const mainTime = new Date(`${selectedDate}T${selectedTime}:00`);
            
            // Add before experience from combo
            // Use a fixed 10-min duration for Ice Bath (before)
            const beforeDuration = 10; // Ice Bath is typically 10 minutes
            const beforeTime = new Date(mainTime.getTime() - (beforeDuration + 10) * 60000);
            bookings.push({
              experience_id: selectedChip.pre_experience_id,
              slot_time: beforeTime.toISOString(),
              experience_name: selectedChip.pre_experience_name
            });
            
            // Add main booking
            bookings.push({
              experience_id: selectedExperience,
              slot_time: mainTime.toISOString(),
              experience_name: mainExp?.name
            });
            
            // Add after experience from combo
            const afterTime = new Date(mainTime.getTime() + ((mainExp?.duration_minutes || 30) + 10) * 60000);
            bookings.push({
              experience_id: selectedChip.post_experience_id,
              slot_time: afterTime.toISOString(),
              experience_name: selectedChip.post_experience_name
            });
          } else {
            // Handle individual before/after additions
            
            // Add before experience if selected
            if (selectedChip.timing === 'before') {
              const mainTime = new Date(`${selectedDate}T${selectedTime}:00`);
              const beforeTime = new Date(mainTime.getTime() - ((selectedChip.duration as number) + 10) * 60000);
              bookings.push({
                experience_id: selectedChip.experience_id,
                slot_time: beforeTime.toISOString(),
                experience_name: selectedChip.experience_name
              });
            }
            
            // Add main booking
            bookings.push({
              experience_id: selectedExperience,
              slot_time: `${selectedDate}T${selectedTime}:00`,
              experience_name: experiences.find(exp => exp.id === selectedExperience)?.name
            });
            
            // Add after experience if selected
            if (selectedChip.timing === 'after') {
              const mainExp = experiences.find(exp => exp.id === selectedExperience);
              const mainTime = new Date(`${selectedDate}T${selectedTime}:00`);
              const afterTime = new Date(mainTime.getTime() + ((mainExp?.duration_minutes || 30) + 10) * 60000);
              bookings.push({
                experience_id: selectedChip.experience_id,
                slot_time: afterTime.toISOString(),
                experience_name: selectedChip.experience_name
              });
            }
          }
          
          // Create all bookings
          console.log('Creating bookings:', bookings);
          let allSuccess = true;
          let createdCount = 0;
          
          for (const booking of bookings) {
            // For combo chips, use the selected chip for all bookings
            // For individual chips, match by experience_id
            const matchingSuggestion = selectedChip.timing === 'combo' 
              ? selectedChip 
              : selectedSuggestionsList.find(s => s.experience_id === booking.experience_id);
            
            const bookingData = {
              venue_id: AOI_VENUE_ID,
              experience_id: booking.experience_id,
              slot_time: booking.slot_time,
              customer_email: customerEmail,
              customer_name: customerName,
              pre_drinks: matchingSuggestion?.pre_drinks || [],
              during_drinks: matchingSuggestion?.during_drinks || [],
              after_drinks: matchingSuggestion?.after_drinks || [],
              booking_explanation: matchingSuggestion ? 
                `${matchingSuggestion.pathway_name}: ${matchingSuggestion.reason}. ${matchingSuggestion.pathway_description || ''}` : 
                null
            };
            
            console.log(`Creating booking ${createdCount + 1}/${bookings.length}:`, bookingData);
            
            const response = await fetch('/api/booking/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(bookingData)
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              console.error('Booking failed:', errorData);
              allSuccess = false;
              break;
            }
            createdCount++;
          }
          
          if (allSuccess) {
            setMessage(`✅ All ${bookings.length} experiences booked successfully!`);
            resetForm();
          } else {
            setMessage('❌ Some bookings failed. Please check availability.');
          }
      } else {
        // Single booking only
        const response = await fetch('/api/booking/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            venueId: AOI_VENUE_ID,
            experienceId: selectedExperience,
            slotTime: `${selectedDate}T${selectedTime}:00`,
            customerEmail,
            customerName
          })
        });

        const result = await response.json();
        if (response.ok) {
          const selectedExp = experiences.find(exp => exp.id === selectedExperience);
          setMessage(`✓ Booking confirmed! Your ${selectedExp?.name} session is scheduled for ${selectedDate} at ${selectedTime}.`);
          resetForm();
        } else {
          setMessage(`Error: ${result.error}`);
        }
      }
      } else {
        // No booking rows and no selected suggestion - create single experience booking
        const bookingData = {
          venue_id: AOI_VENUE_ID,
          experience_id: selectedExperience,
          slot_time: `${selectedDate}T${selectedTime}:00`,
          customer_email: customerEmail,
          customer_name: customerName,
          booking_status: 'sessions_scheduled'
        };

        const { error } = await supabase
          .from('bookings')
          .insert([bookingData]);

        if (error) {
          console.error('Error creating booking:', error);
          setMessage('Error creating booking. Please try again.');
        } else {
          setMessage('Successfully created booking! Check your email for confirmation.');
          // Reset form
          setSelectedExperience('');
          setSelectedDate('');
          setSelectedTime('');
          setCustomerName('');
          setCustomerEmail('');
        }
      }
    } catch (error) {
      console.error('Booking error:', error);
      setMessage('There was an error processing your booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedExperience('');
    setSelectedDate('');
    setSelectedTime('');
    setCustomerEmail('');
    setCustomerName('');
    setSuggestions([]);
    setSelectedSuggestion(null);
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

        {/* Booking Rows Display */}
        {bookingRows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 space-y-3"
          >
            <h3 className="text-white font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Your Experience Journey
            </h3>
            {bookingRows.map((row, index) => (
              <div key={row.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                      {index + 1}
                    </span>
                    <span className="text-white font-medium">{row.experience_name}</span>
                    {row.source === 'ai' && (
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                        AI Added
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setBookingRows(prev => prev.filter(r => r.id !== row.id));
                    }}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Time</label>
                    <select
                      value={row.selected_time}
                      onChange={(e) => {
                        setBookingRows(prev => prev.map(r => 
                          r.id === row.id ? {...r, selected_time: e.target.value} : r
                        ));
                      }}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded text-white text-xs"
                    >
                      {availableTimeSlots.map((slot) => (
                        <option key={slot} value={slot} className="bg-gray-900 text-white">
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Duration</label>
                    <div className="w-full p-2 bg-white/10 border border-white/20 rounded text-white text-xs">
                      {(() => {
                        const experience = experiences.find(exp => exp.id === row.experience_id);
                        return experience ? `${experience.duration_minutes} min` : `${row.duration_minutes} min`;
                      })()}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-white/60">
                  {row.pathway_name && (
                    <span>From: {row.pathway_name}</span>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Experience Details */}
        {selectedExp && bookingRows.length === 0 && (
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

        {isAIControlled && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-purple-400 text-sm mb-6">
            AI is controlling the form. Please wait for the AI to complete its actions.
          </div>
        )}

        {/* Suggestion Chips */}
        {selectedExp && selectedDate && selectedTime && (
          <div className="space-y-3">
            {loadingSuggestions ? (
              <div className="space-y-2">
                <p className="text-white/70 text-sm">Finding perfect combinations...</p>
                <div className="flex flex-col gap-2">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/20 animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-white/5 rounded w-1/2"></div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/20 animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-white/5 rounded w-1/2"></div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/20 animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-4/5 mb-2"></div>
                    <div className="h-3 bg-white/5 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ) : suggestions.length > 0 ? (
              <>
                <p className="text-white/70 text-sm">Enhance your experience:</p>
                <div className="flex flex-col gap-2">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      type="button"
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedSuggestion === index
                          ? 'border-blue-500 bg-blue-50'
                          : selectedSuggestion !== null && selectedSuggestion !== index
                          ? 'border-gray-200 opacity-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        // Add the chip directly to booking rows
                        addBookingRowsFromChip(suggestion);
                      }}
                    >
                      <div className="text-left">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-medium">{suggestion.label as string}</span>
                          {selectedSuggestion === index && (
                            <span className="text-green-400 text-sm ml-2">✓ Selected</span>
                          )}
                        </div>
                        <p className="text-white/60 text-sm">{suggestion.reason as string}</p>
                        <p className="text-white/50 text-xs mt-1">From: {suggestion.pathway_name as string}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
                
                  {suggestions.length > 0 && selectedSuggestion !== null && (
                    <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <p className="text-green-400 text-sm">
                        ✓ {suggestions[selectedSuggestion]?.label as string} selected
                      </p>
                    </div>
                  )}
              </>
            ) : null}
          </div>
        )}

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? 'Creating Booking...' : 
           selectedSuggestion !== null ? `Reserve ${suggestions[selectedSuggestion]?.timing === 'combo' ? 'Complete Journey' : '2 Experiences'}` : 'Reserve Your Session'}
        </motion.button>

      </form>
    </motion.div>
  );
}
