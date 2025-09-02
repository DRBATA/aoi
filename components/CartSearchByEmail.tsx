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

export default function CartSearchByEmail() {
  const [email, setEmail] = useState('');
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCart, setSelectedCart] = useState<string | null>(null);

  const supabase = createClient();

  const searchCarts = async () => {
    if (!email) return;
    
    setLoading(true);
    
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
      <div className="flex gap-4 mb-6">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter customer email"
          className="flex-1 border border-gray-300 rounded-md px-3 py-2"
        />
        <button
          onClick={searchCarts}
          disabled={loading || !email}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search Carts'}
        </button>
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addItemToCart(cart.id, 'experience');
                    }}
                    className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                  >
                    + Experience
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {email && carts.length === 0 && !loading && (
        <p className="text-gray-500 text-center py-8">No carts found for this email</p>
      )}
    </div>
  );
}
