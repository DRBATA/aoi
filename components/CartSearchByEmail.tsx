'use client';

import React, { useState } from 'react';
import { createClient } from '../lib/supabase/client';
import PaymentButton from './PaymentButton';

// Define TypeScript interfaces
interface CartItem {
  id: string;
  item_id: string;
  qty: number;
  booking_id: string | null;
  product_name: string;
  price: string | null;
}

interface EmailSuggestion {
  customer_email: string;
}

interface OrderRecord {
  cart_id: string;
}

interface RawCartData {
  id: string;
  customer_email: string;
  customer_name: string | null;
  created_at: string;
}

interface RawCartItem {
  id: string;
  item_id: string;
  qty: number;
  venue_id: string;
  booking_id: string | null;
}

interface Cart {
  id: string;
  customer_email: string;
  customer_name: string | null;
  created_at: string;
  venue_name: string;
  items_count: number;
  cart_items: CartItem[];
}

interface CartSearchByEmailProps {
  onEmailChange?: (email: string) => void;
  onCartClick?: () => void;
  onSwitchToBooking?: (email: string, cartId: string) => void;
  onReceiveTransfer?: (cartId: string, bookingId: string) => void;
}

export default function CartSearchByEmail({ onEmailChange, onCartClick, onSwitchToBooking, onReceiveTransfer }: CartSearchByEmailProps) {
  const [searchEmail, setSearchEmail] = useState('');
  const [carts, setCarts] = useState<Cart[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCart, setSelectedCart] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferCode, setTransferCode] = useState('');
  const [processing, setProcessing] = useState(false);

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
        const uniqueEmails = [...new Set(data.map((item: EmailSuggestion) => item.customer_email))];
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
          created_at
        `)
        .eq('customer_email', searchEmail);

      // Filter out paid carts (those that exist in orders table) unless showing order history
      if (!showOrderHistory) {
        const { data: paidCartIds } = await supabase
          .from('orders')
          .select('cart_id')
          .not('cart_id', 'is', null);
        
        if (paidCartIds && paidCartIds.length > 0) {
          const paidIds = paidCartIds.map((order: OrderRecord) => order.cart_id);
          query = query.not('id', 'in', `(${paidIds.join(',')})`);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching carts:', error instanceof Error ? error.message : 'Unknown error');
      } else {
        const formattedCarts = await Promise.all(data?.map(async (cart: RawCartData) => {
          // Fetch cart items for each cart
          const { data: cartItems } = await supabase
            .from('cart_items')
            .select(`
              id,
              item_id,
              qty,
              venue_id,
              booking_id
            `)
            .eq('cart_id', cart.id);

          // Manually fetch product and experience details for each cart item
          const itemsWithDetails = await Promise.all(cartItems?.map(async (item: RawCartItem) => {
            let productDetails = null;
            let experienceDetails = null;
            let venueExperienceDetails = null;

            // Use booking_id presence to determine if it's an experience or product
            if (item.booking_id) {
              // It's an experience - look in experiences table
              const { data: experience } = await supabase
                .from('experiences')
                .select('name')
                .eq('id', item.item_id)
                .single();
              
              experienceDetails = experience;
              
              // Get venue details for pricing
              if (experience && item.venue_id) {
                const { data: venueExp } = await supabase
                  .from('venue_experiences')
                  .select('venue_name, experience_name, venue_price')
                  .eq('venue_id', item.venue_id)
                  .eq('experience_id', item.item_id)
                  .single();
                venueExperienceDetails = venueExp;
              }
            } else {
              // It's a product - look in products table
              const { data: product } = await supabase
                .from('products')
                .select('name')
                .eq('id', item.item_id)
                .single();
              
              productDetails = product;
            }

            return {
              ...item,
              products: productDetails,
              experiences: experienceDetails,
              venue_experiences: venueExperienceDetails
            };
          }) || []);

          const formattedItems = itemsWithDetails?.map((item: RawCartItem & { products?: unknown; experiences?: unknown; venue_experiences?: unknown }) => {
            // Get name from either products or experiences table
            let itemName = 'Unknown Item';
            let itemPrice = null;
            
            if (item.products) {
              itemName = (item.products as unknown as { name: string })?.name || 'Unknown Product';
            } else if (item.experiences) {
              itemName = (item.experiences as unknown as { name: string })?.name || 'Unknown Experience';
              // Get price from venue_experiences but don't show venue name in UI
              if (item.venue_experiences) {
                const venueExp = item.venue_experiences as unknown as { venue_name: string; venue_price: string };
                itemPrice = venueExp.venue_price;
              }
            }
            
            return {
              id: item.id,
              item_id: item.item_id,
              qty: item.qty,
              booking_id: item.booking_id,
              product_name: itemName,
              price: itemPrice
            } as {
              id: string;
              item_id: string;
              qty: number;
              booking_id: string | null;
              product_name: string;
              price: string | null;
            };
          }) || [];

          return {
            id: cart.id,
            customer_email: cart.customer_email,
            customer_name: cart.customer_name,
            created_at: cart.created_at,
            venue_name: 'No venue',
            items_count: formattedItems.length,
            cart_items: formattedItems as Array<{
              id: string;
              item_id: string;
              qty: number;
              booking_id: string | null;
              product_name: string;
              price: string | null;
            }>
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
    if (itemType === 'booking') {
      // Switch to Create Booking tab with pre-populated email and cart context
      onSwitchToBooking?.(searchEmail, cartId);
    } else {
      // Handle drink additions (future implementation)
      alert(`Add ${itemType} to cart ${cartId}`);
    }
  };

  const receiveCartTransfer = async () => {
    if (!selectedCart || !transferCode) {
      alert('Please select a cart and enter transfer code');
      return;
    }
    
    setProcessing(true);
    
    try {
      // Extract transfer ID from QR code URL or use direct code
      const transferId = transferCode.includes('transfer=') 
        ? transferCode.split('transfer=')[1]
        : transferCode;
      
      // Get bookings for this customer email (not cart_id since they may have multiple bookings)
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_email', searchEmail)
        .eq('booking_status', 'sessions_scheduled');
      
      if (!bookings || bookings.length === 0) {
        alert('No active bookings found for this customer');
        setProcessing(false);
        return;
      }
      
      // Call the cart-receive API to process transfer
      const response = await fetch('/api/cart-receive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transferId,
          bookingId: bookings[0].id, // Use first booking or implement selection
          staffId: 'staff_user' // TODO: Get from auth context
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Successfully added ${result.itemsAdded} items to booking`);
        setShowTransferModal(false);
        setTransferCode('');
        searchCarts(); // Refresh
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch (error) {
      alert('Failed to process transfer');
    } finally {
      setProcessing(false);
    }
  };

  const updateItemQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ qty: newQuantity })
        .eq('id', cartItemId);

      if (error) {
        console.error('Error updating quantity:', error);
        alert('Error updating item quantity');
      } else {
        // Refresh the cart data
        searchCarts();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Error updating item quantity');
    }
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
              onClick={() => {
                setSelectedCart(cart.id);
                onCartClick?.();
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{cart.customer_name || 'Guest'}</h4>
                  <p className="text-gray-600">{cart.customer_email}</p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(cart.created_at).toLocaleDateString()}
                  </p>
                  
                  {/* Display individual cart items */}
                  {cart.cart_items && cart.cart_items.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-gray-700">Items:</p>
                      {cart.cart_items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded p-2">
                          <span className="text-sm text-gray-700">
                            • {item.product_name}
                          </span>
                          <div className="flex items-center gap-2">
                            {/* Show quantity controls only for products (no booking_id) */}
                            {!item.booking_id && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateItemQuantity(item.id, item.qty - 1);
                                  }}
                                  disabled={item.qty <= 1}
                                  className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  -
                                </button>
                                <span className="text-sm font-medium min-w-[20px] text-center">
                                  {item.qty}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateItemQuantity(item.id, item.qty + 1);
                                  }}
                                  className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800 text-sm border border-gray-300 rounded"
                                >
                                  +
                                </button>
                              </>
                            )}
                            
                            {/* Show quantity for experiences (read-only) */}
                            {item.booking_id && (
                              <span className="text-sm font-medium min-w-[20px] text-center">
                                Qty: {item.qty}
                              </span>
                            )}
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeItemFromCart(item.id);
                              }}
                              className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded border border-red-200 hover:bg-red-50 ml-2"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {cart.cart_items && cart.cart_items.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">No items in cart</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <p className="text-sm text-gray-600">
                    {cart.items_count} item(s)
                  </p>
                  
                  {/* Add Booking and Receive Transfer Buttons */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addItemToCart(cart.id, 'booking');
                      }}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      + Add Booking
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCart(cart.id);
                        setShowTransferModal(true);
                      }}
                      className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      📥 Receive Transfer
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addItemToCart(cart.id, 'drink');
                      }}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      + Add Drink
                    </button>
                    <PaymentButton customerEmail={cart.customer_email} />
                  </div>
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

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Receive Cart Transfer</h3>
            <p className="text-sm text-gray-600 mb-4">
              Scan QR code or enter transfer code from Water Bar
            </p>
            
            <input
              type="text"
              placeholder="Enter transfer code or QR URL..."
              value={transferCode}
              onChange={(e) => setTransferCode(e.target.value)}
              className="w-full p-3 border rounded-md mb-4"
              autoFocus
            />
            
            <div className="flex gap-2">
              <button
                onClick={receiveCartTransfer}
                disabled={processing || !transferCode}
                className="flex-1 bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {processing ? '⏳ Processing...' : '✅ Receive Items'}
              </button>
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setTransferCode('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              <p>• Items will be intelligently distributed across bookings</p>
              <p>• Celery → before sauna, Coconut → after heat activities</p>
              <p>• Protein drinks → post-workout recovery</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
