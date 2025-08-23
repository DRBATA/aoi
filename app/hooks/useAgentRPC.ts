/**
 * RPC Hook for UI → Agent communication
 * Sends user data and receives AI recommendations via LiveKit
 */

import { useCallback } from 'react';
import { useRoom } from '@livekit/components-react';

export function useAgentRPC() {
  const room = useRoom();

  // Send user profile data to agent
  const updateUserProfile = useCallback(async (data: {
    weight_kg?: number;
    goals?: string;
    hydration_today?: Array<{
      timestamp: string;
      item: string;
      ml: number;
      na_mg?: number;
      k_mg?: number;
    }>;
  }) => {
    if (!room) return;
    
    try {
      const response = await room.localParticipant.performRpc({
        destinationIdentity: 'agent',
        method: 'user_data_update',
        payload: JSON.stringify(data),
      });
      
      return JSON.parse(response);
    } catch (error) {
      console.error('RPC failed:', error);
      return { success: false, error: error.message };
    }
  }, [room]);

  // Add to cart with AI recommendation
  const addToCartWithAI = useCallback(async (data: {
    item_id: string;
    type: 'booking' | 'product';
    booking_details?: {
      experience: string;
      duration_minutes: number;
      time_slot?: string;
    };
    product_name?: string;
  }) => {
    if (!room) return;
    
    try {
      const response = await room.localParticipant.performRpc({
        destinationIdentity: 'agent',
        method: 'add_to_cart_with_ai',
        payload: JSON.stringify(data),
      });
      
      const result = JSON.parse(response);
      
      // If AI recommends a pairing, show it to user
      if (result.recommendation) {
        console.log('AI Recommendation:', result.recommendation);
        // Could trigger a toast or modal here
      }
      
      return result;
    } catch (error) {
      console.error('RPC failed:', error);
      return { success: false, error: error.message };
    }
  }, [room]);

  // Get personalized hydration plan
  const getHydrationPlan = useCallback(async () => {
    if (!room) return;
    
    try {
      const response = await room.localParticipant.performRpc({
        destinationIdentity: 'agent',
        method: 'get_hydration_plan',
        payload: '{}',
      });
      
      return JSON.parse(response);
    } catch (error) {
      console.error('RPC failed:', error);
      return { success: false, error: error.message };
    }
  }, [room]);

  // Book AOI experience with AI hydration pairing
  const bookExperienceWithAI = useCallback(async (data: {
    experience_id: string;
    preferred_time: string;
    duration_minutes: number;
  }) => {
    if (!room) return;
    
    try {
      // First, add booking to cart
      const cartResult = await addToCartWithAI({
        item_id: data.experience_id,
        type: 'booking',
        booking_details: {
          experience: data.experience_id,
          duration_minutes: data.duration_minutes,
          time_slot: data.preferred_time,
        }
      });
      
      // AI will automatically suggest hydration pairing
      // This gets stored in cart_items.ai_recommendation
      
      return cartResult;
    } catch (error) {
      console.error('Booking failed:', error);
      return { success: false, error: error.message };
    }
  }, [addToCartWithAI, room]);

  return {
    updateUserProfile,
    addToCartWithAI,
    getHydrationPlan,
    bookExperienceWithAI,
  };
}
