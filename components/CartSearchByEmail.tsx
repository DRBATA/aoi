'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Cart {
  id: string;
  customer_email: string;
  customer_name: string;
  created_at: string;
  booking_id: string | null;
  venue_name: string;
  items_count: number;
}

interface CartSearchByEmailProps {
  onEmailChange?: (email: string) => void;
}

export default function CartSearchByEmail({ onEmailChange }: CartSearchByEmailProps) {
  const [email, setEmail] = useState('');
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCart, setSelectedCart] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const supabase = createClient();

  const searchEmailSuggestions = async (searchEmail: string) => {
    if (searchEmail.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cart_headers')
        .select('customer_email')
        .ilike('customer_email', `%${searchEmail}%`)
        .limit(5);

      if (!error && data) {
        const uniqueEmails = [...new Set(data.map(item => item.customer_email))];
        setSuggestions(uniqueEmails);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching email suggestions:', error);
    }
  };

  const searchCarts = async () => {
    if (!email) return;
    
    setLoading(true);
    setShowSuggestions(false);
    setHasSearched(true);
    
    try {
      const { data, error } = await supabase
        .from('cart_headers')
        .select(`
          id,
          customer_email,
          customer_name,
          created_at,
          booking_id
        `)
        .eq('customer_email', email);

      if (error) {
        console.error('Error searching carts:', error instanceof Error ? error.message : 'Unknown error');
      } else {
        const formattedCarts = data?.map((cart) => ({
          id: cart.id,
          customer_email: cart.customer_email,
          customer_name: cart.customer_name,
          created_at: cart.created_at,
          booking_id: cart.booking_id,
          venue_name: 'No venue',
          items_count: 0
        })) || [];
        
        setCarts(formattedCarts);
      }
    } catch (error: unknown) {
      console.error('Error searching carts:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    setLoading(false);
  };

  const addItemToCart = async (cartId: string, itemType: 'booking' | 'drink' | 'experience') => {
    // This would open a modal to add items to the selected cart
    alert(`Add ${itemType} to cart ${cartId}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Search Customer Carts</h2>
      
      {/* Search */}
      <div className="relative mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setHasSearched(false);
                searchEmailSuggestions(e.target.value);
                onEmailChange?.(e.target.value);
              }}
              onFocus={() => email.length >= 3 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Enter customer email"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
            
            {/* Auto-complete suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 mt-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setEmail(suggestion);
                      setShowSuggestions(false);
                      onEmailChange?.(suggestion);
                      setTimeout(() => searchCarts(), 100);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={searchCarts}
            disabled={loading || !email}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Carts'}
          </button>
        </div>
      </div>

      {/* Results */}
      {carts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Found {carts.length} cart(s)</h3>
          
          {carts.map((cart) => (
            <div 
              key={cart.id} 
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedCart === cart.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedCart(cart.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{cart.customer_name || 'Guest'}</h4>
                  <p className="text-gray-600">{cart.customer_email}</p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(cart.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Venue: {cart.venue_name} • {cart.items_count} items
                  </p>
                  {cart.booking_id && (
                    <p className="text-sm text-green-600">
                      ✓ Has booking: {cart.booking_id.substring(0, 8)}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addItemToCart(cart.id, 'booking');
                    }}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    + Booking
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addItemToCart(cart.id, 'drink');
                    }}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    + Drink
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Different states based on user interaction */}
      {!email && !hasSearched && (
        <p className="text-gray-500 text-center py-8">Begin typing email to find match</p>
      )}

      {email && email.length > 0 && email.length < 3 && !hasSearched && (
        <p className="text-gray-500 text-center py-8">Keep typing...</p>
      )}

      {email && carts.length === 0 && !loading && hasSearched && (
        <p className="text-gray-500 text-center py-8">No carts found for this email</p>
      )}
    </div>
  );
}
