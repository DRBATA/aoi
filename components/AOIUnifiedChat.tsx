"use client"

import { useState, useEffect, useMemo } from "react";
import useConnectionDetails from '@/hooks/useConnectionDetails';
import { Room, RoomEvent, Track } from 'livekit-client';
import { 
  RoomAudioRenderer, 
  RoomContext, 
  StartAudio,
  useVoiceAssistant,
  useRemoteParticipants,
  VideoTrack,
  useTracks,
  type AgentState
} from '@livekit/components-react';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone,
  PhoneOff, 
  Send, 
  MessageSquare,
  Volume2,
  VolumeX,
  X,
  Calendar,
  Clock,
  User,
  Sparkles
} from 'lucide-react';
import useChatAndTranscription from "@/hooks/useChatAndTranscription"
import { cn } from "@/lib/utils"
import { AgentTile } from '@/components/livekit/agent-tile';
import { VideoTile } from '@/components/livekit/video-tile';
import { useAgentControlBar } from '@/components/livekit/agent-control-bar/hooks/use-agent-control-bar';

function isAgentAvailable(agentState: AgentState) {
  return agentState == 'listening' || agentState == 'thinking' || agentState == 'speaking';
}

interface AOIBookingContext {
  guestName?: string;
  guestEmail?: string;
  experienceType?: string;
  bookingStatus?: 'pending' | 'confirmed' | 'checked-in' | 'active' | 'completed';
  sessionId?: string;
}

function AOIUnifiedChatContent({ 
  room, 
  setIsExpanded, 
  bookingContext 
}: { 
  room: Room; 
  setIsExpanded: (value: boolean) => void;
  bookingContext?: AOIBookingContext;
}) {
  const { state: agentState, audioTrack: agentAudioTrack } = useVoiceAssistant();
  const { messages, send } = useChatAndTranscription();
  
  // Use the AgentControlBar hook for reliable mute/disconnect functionality
  const {
    microphoneToggle,
    handleDisconnect,
  } = useAgentControlBar({
    controls: {
      microphone: true,
      leave: true,
    },
    saveUserChoices: true,
  });
  
  // Use education frontend's track management
  const videoTracks = useTracks([Track.Source.Camera], { onlySubscribed: false });
  const agentVideoTrack = videoTracks.find(track => !track.participant.isLocal);

  async function handleSendMessage(message: string) {
    await send(message);
  }

  // Initialize AOI session with venue context
  useEffect(() => {
    if (!room) return;

    // Unregister any existing handler first
    try {
      room.unregisterRpcMethod("client.aoi_booking_request");
    } catch (e) {
      // Handler wasn't registered, that's fine
    }

    // Register RPC handler for AOI booking requests
    room.registerRpcMethod("client.aoi_booking_request", async (data) => {
      console.log("Received AOI booking request from agent:", data.payload);
      try {
        const payload = JSON.parse(data.payload);
        
        if (payload.action === 'get_booking_context') {
          // Agent is requesting current booking context
          const responseData = {
            venue: 'AOI',
            venue_name: 'Art of Implosion x Johny Dar Experience',
            booking_context: bookingContext || {},
            available_experiences: [
              { id: 'aoi-air-20', name: 'AOI Air (20 min)', type: 'air', duration: 20, price: 150 },
              { id: 'aoi-air-30', name: 'AOI Air (30 min)', type: 'air', duration: 30, price: 200 },
              { id: 'aoi-air-50', name: 'AOI Air (50 min)', type: 'air', duration: 50, price: 300 },
              { id: 'aoi-earth-20', name: 'AOI Earth (20 min)', type: 'earth', duration: 20, price: 150 },
              { id: 'aoi-earth-30', name: 'AOI Earth (30 min)', type: 'earth', duration: 30, price: 200 },
              { id: 'aoi-earth-50', name: 'AOI Earth (50 min)', type: 'earth', duration: 50, price: 300 }
            ]
          };
          
          console.log("Sending AOI context to agent:", responseData);
          return JSON.stringify(responseData);
          
        } else if (payload.action === 'create_booking') {
          // Agent wants to create a booking
          console.log("Agent creating booking:", payload.booking_data);
          
          // Trigger booking creation via dashboard
          window.dispatchEvent(new CustomEvent('agent-create-booking', {
            detail: payload.booking_data
          }));
          
          return JSON.stringify({ success: true, message: "Booking created successfully" });
          
        } else if (payload.action === 'check_availability') {
          // Agent checking availability for specific time/experience
          console.log("Agent checking availability:", payload);
          
          // For now, return mock availability - integrate with real availability system
          const isAvailable = Math.random() > 0.3; // 70% chance available
          return JSON.stringify({ 
            available: isAvailable,
            next_available: isAvailable ? null : "2025-08-27T16:00:00Z"
          });
        }
        
        return JSON.stringify({ success: true });
      } catch (error) {
        console.error("Error handling AOI booking request:", error);
        return JSON.stringify({ success: false, error: (error as Error).message });
      }
    });

    // Auto-greet based on booking context
    const initializeAOISession = async () => {
      try {
        let greeting = "Welcome to AOI - Art of Implosion Experience!";
        
        if (bookingContext?.bookingStatus === 'checked-in') {
          greeting = `Welcome ${bookingContext.guestName}! You're checked in for your ${bookingContext.experienceType} experience. How can I assist you today?`;
        } else if (bookingContext?.bookingStatus === 'active') {
          greeting = `Hi ${bookingContext.guestName}! Your ${bookingContext.experienceType} experience is active. Need anything? I can help with drinks or adjustments.`;
        } else if (bookingContext?.guestName) {
          greeting = `Hi ${bookingContext.guestName}! Ready to book your AOI experience? I can help you choose between Air (standing dome) or Earth (lying bed) sessions.`;
        }
        
        console.log('🎯 AOI Session initialized, sending greeting...');
        send(greeting);
      } catch (error) {
        console.error('Error initializing AOI session:', error);
        send("Welcome to AOI! How can I help you today?");
      }
    };

    // Only initialize once when agent is available
    if (isAgentAvailable(agentState) && messages.length === 0) {
      initializeAOISession();
    }
    
  }, [agentState, bookingContext]); // Depend on agentState and bookingContext

  return (
    <div className="flex flex-col h-full">
      {/* Header - AOI Branded */}
      <div className="flex items-center justify-between p-4 border-b border-white/20 flex-shrink-0">
        <div className="flex items-center space-x-3">
          {/* AOI Logo */}
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 p-1">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          
          <div className="text-white">
            <h3 className="font-semibold text-sm">AOI Experience</h3>
            {bookingContext?.bookingStatus && (
              <p className="text-xs text-white/70 capitalize">
                {bookingContext.bookingStatus} • {bookingContext.experienceType}
              </p>
            )}
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center space-x-2">
          {/* Microphone Mute Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => microphoneToggle.toggle()}
            disabled={microphoneToggle.pending}
            className={`text-white/70 hover:text-white hover:bg-white/10 ${
              !microphoneToggle.enabled ? 'bg-red-500/20 text-red-300' : ''
            }`}
            title={microphoneToggle.enabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {microphoneToggle.enabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </Button>
          
          {/* Disconnect Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDisconnect()}
            disabled={agentState === 'disconnected'}
            className="text-white/70 hover:text-white hover:bg-red-500/20 hover:text-red-300"
            title="Disconnect from agent"
          >
            <PhoneOff className="w-4 h-4" />
          </Button>
          
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="text-white/70 hover:text-white hover:bg-white/10"
            title="Close chat"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative p-0 m-0">
        {/* Video Background */}
        <div className="absolute top-0 left-0 right-0 bottom-0 z-0 p-0 m-0">
          {agentVideoTrack ? (
            <VideoTile 
              trackRef={agentVideoTrack}
              className="w-full h-full object-cover absolute inset-0"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <p className="text-white/80 text-sm">
                  {agentState === 'speaking' ? 'AOI Agent speaking...' : 
                   agentState === 'listening' ? 'Listening...' : 
                   agentState === 'thinking' ? 'Thinking...' : 'Connecting to AOI Agent...'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Messages - Cinematic overlay */}
        <div className="absolute bottom-16 left-0 right-0 h-1/2 overflow-hidden z-10">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div 
            className="absolute bottom-0 left-0 right-0 max-h-full overflow-y-auto overscroll-contain p-4 pb-4 space-y-3 select-text scroll-smooth"
            onWheel={(e) => e.stopPropagation()}
          >
            {messages.length === 0 && (
              <div className="text-center text-white/80 text-sm p-4 backdrop-blur-sm rounded-lg">
                ✨ Chat with your AOI Experience Agent...
              </div>
            )}
            
            {messages.map((message, index) => {
              const isLatest = index === messages.length - 1;
              return (
                <div key={`${message.id || 'msg'}-${index}-${message.timestamp || Date.now()}`} 
                     className={`flex ${message.from?.isLocal ? 'justify-end' : 'justify-start'} transition-all duration-500 ${isLatest ? 'opacity-100 scale-100' : 'opacity-70 scale-95'}`}>
                  <div className={`max-w-[60%] p-3 rounded-xl shadow-2xl backdrop-blur-md ${
                    message.from?.isLocal 
                      ? 'bg-purple-500/70 text-white rounded-br-lg border border-purple-300/30'
                      : 'bg-white/70 text-gray-900 rounded-bl-lg border border-white/30'
                  } ${isLatest ? 'ring-1 ring-white/30' : ''}`}>
                    <p className="text-sm whitespace-pre-wrap font-medium">{message.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Chat Input - AOI themed */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent backdrop-blur-md z-20">
          <div className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                <Sparkles className="w-5 h-5 text-purple-400 opacity-70" />
              </div>
              <input
                type="text"
                placeholder="Message your AOI agent..."
                className="w-full pl-12 pr-5 py-3 bg-black/40 backdrop-blur-lg text-white placeholder-white/70 rounded-full border border-purple-400/20 focus:outline-none focus:border-purple-400 focus:bg-black/50 transition-all duration-300 shadow-lg text-base"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim()) {
                      handleSendMessage(input.value);
                      input.value = '';
                    }
                  }
                }}
              />
            </div>
            <button
              onClick={(e) => {
                const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                if (input.value.trim()) {
                  handleSendMessage(input.value);
                  input.value = '';
                }
              }}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AOIUnifiedChat({ bookingContext }: { bookingContext?: AOIBookingContext }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  const room = useMemo(() => new Room(), []);
  const { connectionDetails, refreshConnectionDetails } = useConnectionDetails();

  // Handle room events and connection lifecycle
  useEffect(() => {
    const onDisconnected = () => {
      setSessionStarted(false);
      setConnectionError(true);
      refreshConnectionDetails();
    };

    const onConnected = () => {
      setConnectionError(false);
      console.log('✅ Connected to AOI agent successfully');
    };

    const onConnectionFailed = () => {
      setConnectionError(true);
      setSessionStarted(false);
    };

    // Register AOI-specific RPC methods
    const handleBookingAction = async (data: any): Promise<string> => {
      console.log('Received booking action RPC from AOI agent:', data);
      
      try {
        const payload = typeof data.payload === 'string' 
          ? JSON.parse(data.payload) 
          : data.payload;
        
        switch (payload.action) {
          case 'create_booking':
            window.dispatchEvent(new CustomEvent('aoi-create-booking', {
              detail: payload.booking_data
            }));
            break;
            
          case 'view_bookings':
            window.dispatchEvent(new CustomEvent('aoi-view-bookings', {
              detail: {}
            }));
            break;
            
          case 'update_booking_status':
            window.dispatchEvent(new CustomEvent('aoi-update-booking', {
              detail: payload
            }));
            break;
        }
        return "Success";
      } catch (error) {
        console.error('Error parsing booking RPC payload:', error);
        return "Error: " + (error instanceof Error ? error.message : String(error));
      }
    };

    room.on(RoomEvent.Disconnected, onDisconnected);
    room.on(RoomEvent.Connected, onConnected);
    
    // Register RPC methods for AOI booking actions
    room.localParticipant.registerRpcMethod("client.booking_action", handleBookingAction);

    if (sessionStarted && room.state === 'disconnected' && connectionDetails) {
      Promise.all([
        room.localParticipant.setMicrophoneEnabled(true, undefined, {
          preConnectBuffer: true,
        }),
        room.connect(process.env.NEXT_PUBLIC_LIVEKIT_WS_URL || connectionDetails.serverUrl, connectionDetails.participantToken),
      ]).catch((error) => {
        console.error('Error connecting to the AOI agent', error);
      });
    }

    return () => {
      room.off(RoomEvent.Disconnected, onDisconnected);
      room.off(RoomEvent.Connected, onConnected);
      room.localParticipant.unregisterRpcMethod("client.booking_action");
      room.disconnect();
    };
  }, [room, sessionStarted, connectionDetails, refreshConnectionDetails]);

  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => {
            setIsExpanded(true);
            setSessionStarted(true);
          }}
          className="relative px-6 py-4 rounded-full shadow-2xl flex items-center justify-center gap-3 whitespace-nowrap overflow-hidden group
                     bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 
                     hover:from-indigo-500 hover:via-purple-500 hover:to-blue-500
                     transition-all duration-1000 ease-in-out
                     border-2 border-white/30 backdrop-blur-sm"
        >
          <Sparkles className="w-5 h-5 text-white" />
          <span className="text-white font-medium">AOI Agent</span>
          {bookingContext?.bookingStatus && (
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
      <div className="h-full w-full max-w-4xl mx-auto bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90 backdrop-blur-lg border border-white/20 shadow-2xl">
        <RoomContext.Provider value={room}>
          <RoomAudioRenderer />
          <StartAudio label="Click to enable audio" />
          <AOIUnifiedChatContent 
            room={room} 
            setIsExpanded={setIsExpanded}
            bookingContext={bookingContext}
          />
        </RoomContext.Provider>
      </div>
    </div>
  );
}
