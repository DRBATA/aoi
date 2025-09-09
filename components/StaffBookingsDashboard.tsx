'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, GlassWater, Home, ArrowLeft } from "lucide-react";
import MinChat from "./MinChat";
import BookingForm from './BookingForm';
import CartSearchByEmail from './CartSearchByEmail';
import AddDrinkTab from './AddDrinkTab';

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
  cart_id: string | null;
  pre_drinks?: Array<{
    product_id: string;
    name: string;
    quantity: number;
    reason?: string;
  }>;
  during_drinks?: Array<{
    product_id: string;
    name: string;
    quantity: number;
    reason?: string;
  }>;
  after_drinks?: Array<{
    product_id: string;
    name: string;
    quantity: number;
    reason?: string;
  }>;
  drinks_consumed?: boolean;
  pathway_id?: string;
}

export default function StaffBookingsDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string>('');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const [experiences, setExperiences] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'search' | 'drinks'>('dashboard');
  const [aiResults, setAiResults] = useState<{
    title: string;
    choices: Array<{
      kind: "drink" | "experience" | "bundle";
      id: string;
      label: string;
      qty?: number;
      where?: "here" | "to-go" | null;
      reason?: string;
    }>;
  } | null>(null);
  const [showAiSection, setShowAiSection] = useState(false);
  const [previousTab, setPreviousTab] = useState<'dashboard' | 'create' | 'search' | 'drinks'>('dashboard');

  const supabase = createClient();

  // Pre-fire AI search when email reaches 3+ characters
  const prefireAiSearch = useCallback(async (email: string) => {
    if (email.length >= 3 && !aiResults) {
      try {
        const response = await fetch('/api/minchat-v4', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            mode: 'drinks', 
            text: '', 
            customer_email: email 
          })
        });
        const data = await response.json();
        setAiResults(data);
      } catch (error) {
        console.error('Pre-fire AI search failed:', error);
      }
    }
  }, [aiResults]);

  // Enhanced email change handler
  const handleEmailChange = useCallback((email: string) => {
    setSelectedCustomerEmail(email);
    
    // Pre-fire AI search on 3rd character
    if (email.length >= 3) {
      prefireAiSearch(email);
    }
    
    // Reset AI visibility when email changes
    if (email.length < 3) {
      setShowAiSection(false);
      setAiResults(null);
    }
  }, [prefireAiSearch]);

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
          venue_id,
          pre_drinks,
          during_drinks,
          after_drinks,
          drinks_consumed,
          pathway_id,
          experience_id,
          cart_id
        `)
        .gte('slot_time', `${selectedDate}T00:00:00`)
        .lt('slot_time', `${selectedDate}T23:59:59`)
        .order('slot_time');

      if (error) throw error

      // Fetch experience details for each booking
      const formattedBookings = await Promise.all(data?.map(async (booking) => {
        const { data: expData } = await supabase
          .from('venue_experiences')
          .select('experience_name, venue_price')
          .eq('venue_id', booking.venue_id)
          .eq('experience_id', booking.experience_id)
          .single();

          return {
            id: booking.id,
            venue_name: 'Art of Implosion x Johny Dar Experience',
            experience_name: expData?.experience_name || 'Unknown Experience',
            slot_time: booking.slot_time,
            duration_minutes: booking.duration_minutes,
            customer_email: booking.customer_email,
            customer_name: booking.customer_name,
            booking_status: booking.booking_status,
            venue_price: parseFloat(expData?.venue_price || '0'),
            cart_id: booking.cart_id
          };
      }) || []);
      setBookings(formattedBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err)
    } finally {
      setLoading(false);
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



  const getDateTitle = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (dateString === today) return "Today's";
    if (dateString === tomorrow) return "Tomorrow's";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const startSession = async (booking: Booking) => {
    try {
      const response = await fetch('/api/booking/start-session', {
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
        alert(`✓ Session started for ${booking.experience_name}`);
        fetchBookingsCallback();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err: unknown) {
      console.error('Error starting session:', err);
    }
  };

  const addDrinkToCart = async (drink: any, bookingId: string) => {
    try {
      const response = await fetch('/api/cart/add-drink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: drink.product_id,
          qty: drink.quantity || 1,
          where: 'here',
          customerEmail: bookings.find(b => b.id === bookingId)?.customer_email
        })
      });

      if (response.ok) {
        alert(`✅ Added ${drink.name} to cart`);
        // Mark drink as consumed in booking
        await supabase
          .from('bookings')
          .update({ drinks_consumed: true })
          .eq('id', bookingId);
        
        fetchBookingsCallback();
      } else {
        const error = await response.text();
        alert(`Failed to add drink: ${error}`);
      }
    } catch (error) {
      console.error('Error adding drink to cart:', error);
      alert('Failed to add drink to cart');
    }
  };

  const completeSession = async (booking: Booking) => {
    try {
      // Collect all drinks that should be added to cart
      const allDrinks = [
        ...(booking.pre_drinks || []),
        ...(booking.during_drinks || []),
        ...(booking.after_drinks || [])
      ];

      let addDrinks = false;
      if (allDrinks.length > 0) {
        addDrinks = confirm(`Add ${allDrinks.length} drinks to cart?\n${allDrinks.map(d => `• ${d.name}`).join('\n')}`);
      }

      const response = await fetch('/api/booking/complete-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id,
          addDrinksToCart: addDrinks,
          drinks: addDrinks ? allDrinks : []
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✓ Session completed for ${booking.experience_name}${addDrinks ? ' + drinks added to cart' : ''}`);
        // Check if customer has more sessions today
        const otherSessions = bookings.filter(b => 
          b.customer_email === booking.customer_email && 
          b.id !== booking.id && 
          b.booking_status === 'sessions_scheduled'
        );
        
        if (otherSessions.length > 0) {
          const proceed = confirm(`Customer has ${otherSessions.length} more sessions scheduled today. Go to cart now or continue with other sessions?`);
          if (proceed) {
            // Clear AI cache since cart contents just changed
            setAiResults(null);
            setShowAiSection(false);
            setSelectedCustomerEmail(booking.customer_email);
            setActiveTab('search');
          }
        } else {
          // Auto-redirect to cart for payment
          // Clear AI cache since cart contents just changed
          setAiResults(null);
          setShowAiSection(false);
          setSelectedCustomerEmail(booking.customer_email);
          setActiveTab('search');
        }
        
        fetchBookingsCallback();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err: unknown) {
      console.error('Error completing session:', err);
    }
  };

  const getButtonState = (booking: Booking) => {
    switch (booking.booking_status) {
      case 'sessions_scheduled':
        return { 
          text: 'Start Session', 
          action: () => startSession(booking), 
          disabled: false, 
          className: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' 
        };
      case 'in_session':
        return { 
          text: 'Complete Session', 
          action: () => completeSession(booking), 
          disabled: false, 
          className: 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' 
        };
      case 'session_completed':
        return { 
          text: 'Go to Cart', 
          action: async () => {
            // Ensure booking is in cart before redirecting
            try {
              const response = await fetch('/api/booking/ensure-in-cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: booking.id }),
              });
              
              if (response.ok) {
                setSelectedCustomerEmail(booking.customer_email);
                setActiveTab('search');
              } else {
                const result = await response.json();
                alert(`Error: ${result.error}`);
              }
            } catch (err) {
              console.error('Error ensuring booking in cart:', err);
              // Fallback - still go to cart
              setSelectedCustomerEmail(booking.customer_email);
              setActiveTab('search');
            }
          }, 
          disabled: false, 
          className: 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600' 
        };
      case 'paid':
        return { 
          text: 'Completed & Paid', 
          action: () => {}, 
          disabled: true, 
          className: 'bg-gray-400 cursor-not-allowed' 
        };
      default:
        return { 
          text: 'Unknown Status', 
          action: () => {}, 
          disabled: true, 
          className: 'bg-gray-400 cursor-not-allowed' 
        };
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-orange-50 text-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Tab Navigation - AOI Style */}
        <div className="flex justify-between items-center mb-8 pt-6">
          {/* Back Button */}
          {activeTab !== 'dashboard' && (
            <button
              onClick={() => {
                setActiveTab(previousTab);
                // Reset AI state when going back
                if (previousTab === 'dashboard') {
                  setShowAiSection(false);
                  setAiResults(null);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          
          {/* Main Navigation */}
          <div className="flex flex-wrap justify-center gap-2 flex-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
              { id: 'create', label: 'Create Booking', icon: <Plus className="w-4 h-4" /> },
              { id: 'drinks', label: 'Add Drinks', icon: <GlassWater className="w-4 h-4" /> },
              { id: 'search', label: 'Customer Search', icon: <Search className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setPreviousTab(activeTab);
                  setActiveTab(tab.id as 'dashboard' | 'create' | 'search' | 'drinks');
                  
                  // Reset AI state when switching tabs
                  if (tab.id !== 'search') {
                    setShowAiSection(false);
                    setAiResults(null);
                  }
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all border-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-xl border-transparent'
                    : 'bg-white/90 text-gray-700 hover:bg-gradient-to-r hover:from-orange-100 hover:to-yellow-100 hover:shadow-lg border-orange-200 hover:border-orange-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Spacer for alignment */}
          <div className="w-20"></div>
        </div>

      {/* Tab Content */}
      <div className="px-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">{getDateTitle(selectedDate)} Bookings</h1>
                
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border-2 rounded-lg bg-white border-blue-200 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                />
              </div>

              {/* Experience Filter */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-700">Filter by Experience</h3>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="px-4 py-2 border-2 rounded-lg bg-white border-blue-200 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm w-full sm:w-auto min-w-0"
                >
                  <option value="all">All Experiences</option>
                  {experiences.map(exp => (
                    <option key={exp} value={exp} className="text-black">{exp}</option>
                  ))}
                </select>
              </div>

              {/* Time Filter Radio Buttons */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-700">Filter by Time</h3>
                <div className="flex flex-wrap gap-4">
                  {[
                    { value: 'all', label: 'All Times' },
                    { value: 'morning', label: 'Morning (6AM-12PM)' },
                    { value: 'afternoon', label: 'Afternoon (12PM-6PM)' },
                    { value: 'evening', label: 'Evening (6PM-12AM)' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="timeFilter"
                        value={option.value}
                        checked={selectedTimeFilter === option.value}
                        onChange={(e) => setSelectedTimeFilter(e.target.value)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <Card className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-600">Sessions Booked</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {bookings.filter(b => b.booking_status === 'sessions_scheduled').length}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-white to-orange-50 border-2 border-orange-200 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-600">Active Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                    {bookings.filter(b => b.booking_status === 'in_session').length}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-white to-pink-50 border-2 border-pink-200 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-pink-600">Active Carts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    {bookings.filter(b => b.cart_id !== null && b.booking_status !== 'paid').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bookings List */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800">Bookings for {selectedDate}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4 text-gray-600">Loading bookings...</div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-4 text-gray-600">No bookings found for this date</div>
                ) : (
                  <div className="space-y-3">
                    {bookings
                      .filter(booking => {
                        // Experience filter
                        const experienceMatch = selectedExperience === 'all' || booking.experience_name === selectedExperience;
                        
                        // Time filter
                        if (selectedTimeFilter === 'all') return experienceMatch;
                        
                        const bookingHour = new Date(booking.slot_time).getHours();
                        let timeMatch = false;
                        
                        switch (selectedTimeFilter) {
                          case 'morning':
                            timeMatch = bookingHour >= 6 && bookingHour < 12;
                            break;
                          case 'afternoon':
                            timeMatch = bookingHour >= 12 && bookingHour < 18;
                            break;
                          case 'evening':
                            timeMatch = bookingHour >= 18 && bookingHour < 24;
                            break;
                          default:
                            timeMatch = true;
                        }
                        
                        return experienceMatch && timeMatch;
                      })
                      .map((booking) => (
                      <div key={booking.id} className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 bg-white/80">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-800">{booking.experience_name}</h3>
                            <Badge variant={booking.booking_status === 'active' ? 'default' : 'secondary'}>
                              {booking.booking_status}
                            </Badge>
                            {booking.pathway_id && (
                              <Badge variant="outline" className="text-purple-600 border-purple-300">
                                Pathway
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            {(() => {
                              const buttonState = getButtonState(booking);
                              return (
                                <Button
                                  onClick={buttonState.action}
                                  disabled={buttonState.disabled}
                                  size="sm"
                                  className={buttonState.className}
                                >
                                  {buttonState.text}
                                </Button>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Booking Details */}
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>📍 {booking.venue_name}</div>
                            <div>⏰ {new Date(booking.slot_time).toLocaleTimeString()} ({booking.duration_minutes} min)</div>
                            <div>👤 {booking.customer_name} ({booking.customer_email})</div>
                            <div>💰 AED {booking.venue_price}</div>
                          </div>

                          {/* Pathway Drinks */}
                          {(booking.pre_drinks?.length || booking.during_drinks?.length || booking.after_drinks?.length) && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-700">Recommended Drinks:</h4>
                              
                              {booking.pre_drinks?.map((drink, idx) => (
                                <div key={`pre-${idx}`} className="flex items-center justify-between text-xs">
                                  <span className="text-blue-600">🥤 Pre: {drink.name}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addDrinkToCart(drink, booking.id)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    Add to Cart
                                  </Button>
                                </div>
                              ))}

                              {booking.during_drinks?.map((drink, idx) => (
                                <div key={`during-${idx}`} className="flex items-center justify-between text-xs">
                                  <span className="text-green-600">🍹 During: {drink.name}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addDrinkToCart(drink, booking.id)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    Add to Cart
                                  </Button>
                                </div>
                              ))}

                              {booking.after_drinks?.map((drink, idx) => (
                                <div key={`after-${idx}`} className="flex items-center justify-between text-xs">
                                  <span className="text-purple-600">🥛 After: {drink.name}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addDrinkToCart(drink, booking.id)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    Add to Cart
                                  </Button>
                                </div>
                              ))}

                              {booking.drinks_consumed && (
                                <div className="text-xs text-green-600 font-medium">
                                  ✅ Drinks added to cart
                                </div>
                              )}
                            </div>
                          )}
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
          <div className="max-w-4xl mx-auto space-y-6">
            <CartSearchByEmail 
              onEmailChange={handleEmailChange} 
              onCartClick={() => setShowAiSection(true)}
              onSwitchToBooking={(email) => {
                setSelectedCustomerEmail(email);
                setActiveTab('create');
              }}
            />
            
            {/* AI Suggestions - Only show when cart is found and clicked */}
            {showAiSection && (
              <div className="bg-white/80 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🎭 AI Suggestions</h3>
                {selectedCustomerEmail && (
                  <p className="text-sm text-gray-600 mb-3">
                    Suggestions for: <span className="font-medium">{selectedCustomerEmail}</span>
                  </p>
                )}
                <div className="bg-neutral-900 rounded-2xl p-1">
                  <MinChat customerEmail={selectedCustomerEmail} preloadedResults={aiResults} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'drinks' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/80 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <GlassWater className="w-6 h-6 text-blue-500" />
                Add Drinks to Cart
              </h2>
              <AddDrinkTab customerEmail={selectedCustomerEmail} />
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
