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
  cart_items?: Array<{
    id: string;
    item_id: string;
    qty: number;
    product_name: string;
  }>;
}

interface CartSearchByEmailProps {
  onEmailChange?: (email: string) => void;
}

export default function CartSearchByEmail({ onEmailChange }: CartSearchByEmailProps) {
  const [searchEmail, setSearchEmail] = useState('');
  const [carts, setCarts] = useState<Cart[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
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
    if (!searchEmail) return;
    
    setIsLoading(true);
    setShowSuggestions(false);
    setHasSearched(true);
    
    try {
      // Build query with optional filtering for paid carts
      let query = supabase
        .from('cart_headers')
        .select(`
          id,
          customer_email,
          customer_name,
          created_at,
          booking_id
        `)
        .eq('customer_email', searchEmail);

      // Filter out paid carts (those that exist in orders table) unless showing order history
      if (!showOrderHistory) {
        const { data: paidCartIds } = await supabase
          .from('orders')
          .select('cart_id')
          .not('cart_id', 'is', null);
        
        if (paidCartIds && paidCartIds.length > 0) {
          const paidIds = paidCartIds.map(order => order.cart_id);
          query = query.not('id', 'in', `(${paidIds.join(',')})`);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching carts:', error instanceof Error ? error.message : 'Unknown error');
      } else {
        const formattedCarts = await Promise.all(data?.map(async (cart) => {
          // Fetch cart items for each cart
          const { data: cartItems } = await supabase
            .from('cart_items')
            .select(`
              id,
              item_id,
              qty,
              item_type,
              venue_id,
              products(name),
              venue_experiences(venue_name, experience_name, venue_price)
            `)
            .eq('cart_id', cart.id);

          const formattedItems = cartItems?.map(item => {
            // Get name based on item type
            let itemName = 'Unknown Item';
            let itemPrice = null;
            
            if (item.item_type === 'product' && item.products) {
              itemName = (item.products as unknown as { name: string })?.name || 'Unknown Product';
            } else if (item.item_type === 'experience' && item.venue_experiences) {
              const venueExp = item.venue_experiences as unknown as { venue_name: string; experience_name: string; venue_price: string };
              itemName = `${venueExp.experience_name} at ${venueExp.venue_name}`;
              itemPrice = venueExp.venue_price;
            }
            
            return {
              id: item.id,
              item_id: item.item_id,
              qty: item.qty,
              item_type: item.item_type,
              product_name: itemName,
              price: itemPrice
            };
          }) || [];

          return {
            id: cart.id,
            customer_email: cart.customer_email,
            customer_name: cart.customer_name,
            created_at: cart.created_at,
            booking_id: cart.booking_id,
            venue_name: 'No venue',
            items_count: formattedItems.length,
            cart_items: formattedItems
          };
        }) || []);
        
        setCarts(formattedCarts);
      }
    } catch (error: unknown) {
      console.error('Error searching carts:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    setIsLoading(false);
  };

  const addItemToCart = async (cartId: string, itemType: 'booking' | 'drink' | 'experience') => {
    // This would open a modal to add items to the selected cart
    alert(`Add ${itemType} to cart ${cartId}`);
  };

  const removeItemFromCart = async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) {
        console.error('Error removing item:', error);
        alert('Error removing item from cart');
      } else {
        alert('Item removed from cart');
        // Refresh the cart data
        searchCarts();
      }
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Error removing item from cart');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Search Customer Carts</h2>
      
      {/* Toggle for showing order history */}
      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showOrderHistory}
            onChange={(e) => setShowOrderHistory(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Show order history (include paid carts)</span>
        </label>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => {
                setSearchEmail(e.target.value);
                setHasSearched(false);
                searchEmailSuggestions(e.target.value);
                onEmailChange?.(e.target.value);
              }}
              onFocus={() => searchEmail.length >= 3 && setShowSuggestions(true)}
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
                      setSearchEmail(suggestion);
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
            disabled={isLoading || !searchEmail}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Search Carts'}
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
                    Venue: {cart.venue_name}
                  </p>
                  {cart.booking_id && (
                    <p className="text-sm text-green-600">
                      ✓ Has booking: {cart.booking_id.substring(0, 8)}
                    </p>
                  )}
                  
                  {/* Display individual cart items */}
                  {cart.cart_items && cart.cart_items.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-gray-700">Items:</p>
                      {cart.cart_items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded p-2">
                          <span className="text-sm text-gray-700">
                            • {item.product_name} {item.qty > 1 && `(${item.qty})`}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItemFromCart(item.id);
                            }}
                            className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded border border-red-200 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {cart.cart_items && cart.cart_items.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">No items in cart</p>
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
      {!searchEmail && !hasSearched && (
        <p className="text-gray-500 text-center py-8">Begin typing email to find match</p>
      )}

      {searchEmail && searchEmail.length > 0 && searchEmail.length < 3 && !hasSearched && (
        <p className="text-gray-500 text-center py-8">Keep typing...</p>
      )}

      {searchEmail && searchEmail.length >= 3 && !hasSearched && (
        <p className="text-gray-500 text-center py-8">Click Search to find carts</p>
      )}

      {searchEmail && carts.length === 0 && !isLoading && hasSearched && (
        <p className="text-gray-500 text-center py-8">No carts found for this email</p>
      )}
    </div>
  );
}
