'use client';

import { useState } from 'react';
import { useAgentRPC } from '@/app/hooks/useAgentRPC';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function BookingWithAI() {
  const { bookExperienceWithAI } = useAgentRPC();
  const [booking, setBooking] = useState(null);
  const [aiRecommendation, setAiRecommendation] = useState(null);

  const handleBooking = async (experience: string) => {
    // User just says what they want, agent figures out the slot
    const result = await bookExperienceWithAI({
      experience_id: experience,
      preferred_time: "around 2pm", // Natural language
      duration_minutes: 60
    });

    if (result.success) {
      setBooking(result);
      // AI recommendation is automatically attached to cart item
      if (result.recommendation) {
        setAiRecommendation(result.recommendation);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Simple booking buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button onClick={() => handleBooking('aoi-sauna')}>
          Book Sauna Session
        </Button>
        <Button onClick={() => handleBooking('aoi-cold-plunge')}>
          Book Cold Plunge
        </Button>
      </div>

      {/* AI Recommendation appears automatically */}
      {aiRecommendation && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="font-bold">AI Hydration Pairing</h3>
          <p className="text-sm mt-2">
            {aiRecommendation.suggested_drink}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {aiRecommendation.reason}
          </p>
          <Button 
            size="sm" 
            className="mt-3"
            onClick={() => {
              // This also goes through RPC to add with AI
              // The agent knows it's a pairing
            }}
          >
            Add to Cart
          </Button>
        </Card>
      )}

      {/* Staff Dashboard sees this in real-time */}
      {booking && (
        <div className="text-sm text-green-600">
          ✓ Booking added to cart with AI recommendations
        </div>
      )}
    </div>
  );
}
