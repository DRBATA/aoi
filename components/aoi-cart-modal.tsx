'use client';

import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, XCircle, Sparkles } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  booking_status?: string;
  booking_metadata?: any;
  ai_recommendation?: any;
  recommendation_type?: string;
}

interface AOICartModalProps {
  cartItems: CartItem[];
  total: number;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
  onUpdateBookingStatus?: (itemId: string, status: string) => void;
}

export function AOICartModal({ 
  cartItems, 
  total, 
  onRemoveItem, 
  onCheckout,
  onUpdateBookingStatus 
}: AOICartModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Group items by type (bookings vs products)
  const bookings = cartItems.filter(item => item.booking_metadata);
  const products = cartItems.filter(item => !item.booking_metadata);

  const handleCheckout = async () => {
    setLoading(true);
    await onCheckout();
    setLoading(false);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="relative bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-purple-300"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your AOI Experience
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-200px)] mt-6">
          {/* Bookings Section */}
          {bookings.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-purple-600">Bookings</h3>
              {bookings.map((item) => (
                <div key={item.id} className="mb-4 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      {item.booking_metadata?.time && (
                        <p className="text-sm text-gray-600">
                          {item.booking_metadata.time}
                        </p>
                      )}
                      
                      {/* Booking Status */}
                      {item.booking_status && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                            {item.booking_status}
                          </span>
                          {onUpdateBookingStatus && item.booking_status === "booked" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onUpdateBookingStatus(item.id, "arrived")}
                              className="text-xs"
                            >
                              Mark Arrived
                            </Button>
                          )}
                        </div>
                      )}

                      {/* AI Recommendation */}
                      {item.ai_recommendation && (
                        <div className="mt-2 p-2 bg-white/50 rounded border border-purple-200">
                          <div className="flex items-center gap-1 text-xs text-purple-600">
                            <Sparkles className="h-3 w-3" />
                            <span>AI Hydration Pairing</span>
                          </div>
                          <p className="text-xs mt-1">
                            {item.ai_recommendation.suggested_drink}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(item.price)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Products Section */}
          {products.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-blue-600">Hydration & Products</h3>
              {products.map((item) => (
                <div key={item.id} className="flex justify-between items-center mb-3">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                    
                    {/* AI Recommendation if attached */}
                    {item.ai_recommendation && (
                      <p className="text-xs text-purple-600 mt-1">
                        <Sparkles className="inline h-3 w-3 mr-1" />
                        {item.ai_recommendation.reason}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="mt-6 space-y-4">
          <Separator />
          
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total</span>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {formatCurrency(total)}
            </span>
          </div>

          <Button 
            onClick={handleCheckout}
            disabled={loading || cartItems.length === 0}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {loading ? "Processing..." : "Proceed to Checkout"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
