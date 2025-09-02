'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Search } from 'lucide-react';
import BookingForm from './BookingForm';
import CartSearchByEmail from './CartSearchByEmail';

interface Booking {
  id: string;
  venue_name: string;
  experience_name: string;
  slot_time: string;
  duration_minutes: number;
  customer_email: string;
  customer_name: string;
  booking_status: string;
  venue_price: number;
}

export default function StaffBookingsDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [experiences, setExperiences] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  const supabase = createClient();

  const fetchBookingsCallback = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          slot_time,
          duration_minutes,
          customer_email,
          customer_name,
          booking_status,
          venue:venue_id (name),
          experiences:experience_id (name),
          venue_experiences!inner (venue_price, venue_name, experience_name)
        `)
        .gte('slot_time', `${selectedDate}T00:00:00`)
        .lt('slot_time', `${selectedDate}T23:59:59`)
        .order('slot_time');

      if (error) throw error
      const formattedBookings = data?.map((booking) => ({
        id: booking.id,
        venue_name: booking.venue_experiences[0]?.venue_name || 'Unknown Venue',
        experience_name: booking.venue_experiences[0]?.experience_name || 'Unknown Experience',
        slot_time: booking.slot_time,
        duration_minutes: booking.duration_minutes,
        customer_email: booking.customer_email,
        customer_name: booking.customer_name,
        booking_status: booking.booking_status,
        venue_price: parseFloat(booking.venue_experiences[0]?.venue_price || '0')
      })) || [];
      setBookings(formattedBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err)
    }
  }, [selectedDate, supabase]);

  const fetchExperiencesCallback = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('venue_experiences')
        .select('experience_name')
        .order('experience_name');
      
      if (error) throw error
      const uniqueExperiences = [...new Set(data.map(item => item.experience_name))];
      setExperiences(uniqueExperiences);
    } catch (err) {
      console.error('Error fetching experiences:', err)
    }
  }, [supabase]);

  useEffect(() => {
    fetchBookingsCallback();
    fetchExperiencesCallback();
  }, [fetchBookingsCallback, fetchExperiencesCallback, selectedDate, selectedExperience]);

  const addToCart = async (booking: Booking) => {
    try {
      const response = await fetch('/api/cart/add-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id,
          customerEmail: booking.customer_email
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✓ ${booking.experience_name} added to cart for ${booking.customer_email}\nCart ID: ${result.cartId}`);
        // Refresh bookings to show updated status
        fetchBookingsCallback();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err: unknown) {
      console.error('Error adding booking to cart:', err);
    }
  };


  return (
    <div className="min-h-screen bg-black text-white">
      {/* Tab Navigation - AOI Style */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 pt-6">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: <Calendar className="w-4 h-4" /> },
          { id: 'create', label: 'Create Booking', icon: <Plus className="w-4 h-4" /> },
          { id: 'search', label: 'Search Carts', icon: <Search className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-2xl font-bold text-white">Today's Bookings</h1>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border rounded-lg bg-white/10 border-white/20 text-white"
                />
                
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="px-3 py-2 border rounded-lg bg-white/10 border-white/20 text-white"
                >
                  <option value="all">All Experiences</option>
                  {experiences.map(exp => (
                    <option key={exp} value={exp} className="text-black">{exp}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white/60">Total Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{bookings.length}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white/60">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    ${bookings.reduce((sum, booking) => sum + booking.venue_price, 0).toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white/60">Active Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {bookings.filter(b => b.booking_status === 'active').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bookings List */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Bookings for {selectedDate}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4 text-white/60">Loading bookings...</div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-4 text-white/60">No bookings found for this date</div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:bg-white/5">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-white">{booking.experience_name}</h3>
                            <Badge variant={booking.booking_status === 'active' ? 'default' : 'secondary'}>
                              {booking.booking_status}
                            </Badge>
                          </div>
                          <div className="text-sm text-white/60 space-y-1">
                            <div>📍 {booking.venue_name}</div>
                            <div>⏰ {new Date(booking.slot_time).toLocaleTimeString()} ({booking.duration_minutes} min)</div>
                            <div>👤 {booking.customer_name} ({booking.customer_email})</div>
                            <div>💰 ${booking.venue_price}</div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => addToCart(booking)}
                            disabled={booking.booking_status !== 'active'}
                            size="sm"
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto">
            <BookingForm />
          </div>
        )}

        {activeTab === 'search' && (
          <div className="max-w-4xl mx-auto">
            <CartSearchByEmail />
          </div>
        )}
      </div>
    </div>
  );
}
