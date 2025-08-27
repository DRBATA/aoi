import { useState, useEffect, useCallback } from 'react';
import { useChat, useTranscriptions, useRoomContext } from '@livekit/components-react';
import type { ConnectionDetails } from '@/app/api/livekit-token/route';

interface BookingContext {
  venue: string;
  experienceType?: string;
  bookingStatus?: string;
  guestName?: string;
}

interface LiveKitBookingState {
  connectionDetails: ConnectionDetails | null;
  isConnected: boolean;
  transcriptions: any[];
  chatMessages: any[];
  bookingContext: BookingContext | null;
}

export function useLiveKitBooking(initialContext?: BookingContext) {
  const [state, setState] = useState<LiveKitBookingState>({
    connectionDetails: null,
    isConnected: false,
    transcriptions: [],
    chatMessages: [],
    bookingContext: initialContext || null
  });

  const chat = useChat();
  const transcriptions = useTranscriptions();
  const room = useRoomContext();

  // Initialize LiveKit connection for AOI booking
  const initializeConnection = useCallback(async (context: BookingContext) => {
    try {
      const response = await fetch('/api/livekit-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context)
      });

      if (!response.ok) throw new Error('Failed to get LiveKit token');
      
      const connectionDetails: ConnectionDetails = await response.json();
      
      setState(prev => ({
        ...prev,
        connectionDetails,
        bookingContext: context
      }));

      return connectionDetails;
    } catch (error) {
      console.error('LiveKit connection failed:', error);
      throw error;
    }
  }, []);

  // Send booking-aware message to AI agent
  const sendBookingMessage = useCallback(async (message: string) => {
    if (!state.bookingContext) return;

    // Send via LiveKit chat
    await chat.send(message);

    // Also send to AI journey planner with booking context
    try {
      const response = await fetch('/api/ai-journey-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: message }],
          bookingContext: state.bookingContext,
          venueContext: { venue_name: 'AOI' },
          realTimeSession: true
        })
      });

      const aiResponse = await response.json();
      
      // Send AI response back through LiveKit
      if (aiResponse.message) {
        await chat.send(`AI: ${aiResponse.message}`);
      }

      return aiResponse;
    } catch (error) {
      console.error('AI booking message failed:', error);
    }
  }, [chat, state.bookingContext]);

  // Handle transcription to booking actions
  const processTranscription = useCallback(async (transcriptText: string) => {
    // Check for booking-related commands in transcription
    const bookingIntents = {
      orderDrink: /order|drink|water|electrolyte/i.test(transcriptText),
      checkStatus: /status|how long|time left/i.test(transcriptText),
      requestHelp: /help|assistance|staff/i.test(transcriptText),
      completeSession: /done|finished|complete/i.test(transcriptText)
    };

    // Auto-process common requests during experience
    if (state.bookingContext?.bookingStatus === 'active') {
      if (bookingIntents.orderDrink) {
        return await sendBookingMessage(`I'd like to order a drink during my ${state.bookingContext.experienceType} experience`);
      }
      
      if (bookingIntents.checkStatus) {
        return await sendBookingMessage(`Can you check how much time is left in my session?`);
      }
    }

    return null;
  }, [state.bookingContext, sendBookingMessage]);

  // Update state when room connection changes
  useEffect(() => {
    if (room) {
      setState(prev => ({ ...prev, isConnected: room.state === 'connected' }));
    }
  }, [room]);

  // Process new transcriptions
  useEffect(() => {
    if (transcriptions.length > state.transcriptions.length) {
      const newTranscriptions = transcriptions.slice(state.transcriptions.length);
      
      newTranscriptions.forEach(transcription => {
        if (transcription.text) {
          processTranscription(transcription.text);
        }
      });

      setState(prev => ({ ...prev, transcriptions }));
    }
  }, [transcriptions, state.transcriptions.length, processTranscription]);

  // Update chat messages
  useEffect(() => {
    setState(prev => ({ ...prev, chatMessages: chat.chatMessages }));
  }, [chat.chatMessages]);

  return {
    ...state,
    initializeConnection,
    sendBookingMessage,
    processTranscription,
    // Merged messages for UI display
    allMessages: [...state.transcriptions, ...state.chatMessages].sort(
      (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
    )
  };
}
