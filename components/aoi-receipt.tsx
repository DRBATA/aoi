'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CheckCircle, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  booking_metadata?: any;
  ai_recommendation?: any;
}

interface AOIReceiptProps {
  orderId: string;
  items: ReceiptItem[];
  total: number;
  email?: string;
  onNewsletterOptIn?: (email: string, optIn: boolean) => void;
}

export function AOIReceipt({ 
  orderId, 
  items, 
  total, 
  email,
  onNewsletterOptIn 
}: AOIReceiptProps) {
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [optInSaved, setOptInSaved] = useState(false);

  const handleOptInChange = async (checked: boolean) => {
    setNewsletterOptIn(checked);
    if (email && onNewsletterOptIn) {
      await onNewsletterOptIn(email, checked);
      setOptInSaved(true);
      setTimeout(() => setOptInSaved(false), 3000);
    }
  };

  // Group items by type
  const bookings = items.filter(item => item.booking_metadata);
  const products = items.filter(item => !item.booking_metadata);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Thank You for Your Order!
          </h1>
          <p className="text-gray-600 mt-2">Order #{orderId}</p>
        </div>

        {/* Receipt Card */}
        <Card className="p-6 bg-white/90 backdrop-blur border-purple-200">
          {/* Bookings Section */}
          {bookings.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-purple-700 mb-3">Your Experiences</h2>
              {bookings.map((item, idx) => (
                <div key={idx} className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.booking_metadata?.time && (
                        <p className="text-sm text-gray-600 mt-1">
                          Scheduled: {item.booking_metadata.time}
                        </p>
                      )}
                      {item.ai_recommendation && (
                        <div className="mt-2 p-2 bg-white/70 rounded border border-purple-200">
                          <div className="flex items-center gap-1 text-xs text-purple-600">
                            <Sparkles className="h-3 w-3" />
                            <span>AI Recommendation</span>
                          </div>
                          <p className="text-xs mt-1">
                            {item.ai_recommendation.suggested_drink} - {item.ai_recommendation.reason}
                          </p>
                        </div>
                      )}
                    </div>
                    <span className="font-medium">{formatCurrency(item.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Products Section */}
          {products.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-blue-700 mb-3">Products & Hydration</h2>
              {products.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="border-t-2 border-purple-200 pt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total</span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Newsletter Opt-in */}
          {email && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="newsletter"
                  checked={newsletterOptIn}
                  onCheckedChange={handleOptInChange}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="newsletter" className="text-sm font-medium cursor-pointer">
                    Stay updated with AOI
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Get exclusive offers, wellness tips, and early access to new experiences
                  </p>
                  {optInSaved && (
                    <p className="text-xs text-green-600 mt-2">
                      ✓ Preference saved
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Important Notes */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm font-medium text-yellow-800 mb-2">Important Information:</p>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Please arrive 10 minutes before your scheduled time</li>
              <li>• Bring a water bottle to stay hydrated</li>
              <li>• Check your email for detailed preparation instructions</li>
            </ul>
          </div>

          {/* Email Confirmation Note */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              A confirmation email has been sent to {email || 'your email address'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
