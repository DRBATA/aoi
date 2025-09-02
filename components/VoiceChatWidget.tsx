"use client";

import { useState, useCallback, useEffect } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";

type Props = {
  livekitUrl: string;
  tokenEndpoint: string;
};

export default function VoiceChatWidget({ livekitUrl, tokenEndpoint }: Props) {
  const [token, setToken] = useState<string | undefined>();
  const [isReconnecting, setIsReconnecting] = useState(false);

  const fetchToken = useCallback(async () => {
    if (!tokenEndpoint) return;
    console.log('🔗 Fetching token from:', tokenEndpoint);
    console.log('🌐 LiveKit URL:', livekitUrl);
    
    try {
      const response = await fetch(tokenEndpoint);
      const data = await response.json();
      console.log('🎫 Token received:', data.token ? 'Yes' : 'No');
      setToken(data.token);
      setIsReconnecting(false);
    } catch (err) {
      console.error('❌ Token fetch error:', err);
      setIsReconnecting(false);
    }
  }, [tokenEndpoint, livekitUrl]);

  const handleReconnect = useCallback(() => {
    setIsReconnecting(true);
    setToken(undefined);
    fetchToken();
  }, [fetchToken]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  if (!token) {
    return (
      <div style={shell}>
        <div style={header}>Voice Assistant</div>
        <div style={body}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={shell}>
      <div style={header}>Voice Assistant</div>
      <LiveKitRoom
        token={token}
        serverUrl={livekitUrl}
        connect={true}
        audio
        video={false}
        style={{ display: "contents" }}
      >
        <VoiceControls onReconnect={handleReconnect} isReconnecting={isReconnecting} />
      </LiveKitRoom>
    </div>
  );
}

function VoiceControls({ onReconnect, isReconnecting }: { onReconnect: () => void; isReconnecting: boolean }) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [mutedMe, setMutedMe] = useState(false);
  const [agentMuted, setAgentMuted] = useState(false);
  const [needsUnlock, setNeedsUnlock] = useState(false);
  const [connectionState, setConnectionState] = useState<string>('connecting');

  // Track connection state changes
  useEffect(() => {
    setConnectionState(room.state);
    
    if (room.state === 'connected') {
      const initializeAudio = async () => {
        try {
          const ac = new AudioContext();
          if (ac.state === 'suspended') {
            setNeedsUnlock(true);
          } else {
            await ac.resume();
            // Ensure microphone is enabled when connected
            if (localParticipant) {
              await localParticipant.setMicrophoneEnabled(true);
              console.log('🎤 Microphone auto-enabled on connection');
            }
            setNeedsUnlock(false);
          }
        } catch (error) {
          console.error('Audio initialization failed:', error);
          setNeedsUnlock(true);
        }
      };
      
      initializeAudio();
    }
  }, [room.state, localParticipant]);

  // Auto-start audio when component mounts (if user has already granted permission)
  useEffect(() => {
    const tryAutoStart = async () => {
      try {
        const ac = new AudioContext();
        console.log('AudioContext state:', ac.state);
        if (ac.state !== 'suspended') {
          await ac.resume();
          setNeedsUnlock(false);
          console.log('Audio unlocked automatically');
        } else {
          console.log('Audio is suspended, need user gesture');
          setNeedsUnlock(true);
        }
      } catch (e) {
        console.log('Audio blocked, need user gesture:', e);
        setNeedsUnlock(true);
      }
    };
    tryAutoStart();
  }, []);

  const toggleMuteMe = useCallback(async () => {
    try {
      const next = !mutedMe;
      setMutedMe(next);
      await localParticipant?.setMicrophoneEnabled(!next);
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
      // Reset state if operation failed
      setMutedMe(prev => !prev);
    }
  }, [mutedMe, localParticipant]);

  const toggleMuteAgent = useCallback(() => {
    try {
      setAgentMuted(!agentMuted);
      // TODO: Implement actual agent muting via room audio controls
    } catch (error) {
      console.error('Failed to toggle agent mute:', error);
    }
  }, [agentMuted]);

  const doDisconnect = useCallback(() => {
    try {
      room?.disconnect();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }, [room]);

  const handleReconnect = useCallback(() => {
    try {
      doDisconnect();
      onReconnect();
    } catch (error) {
      console.error('Failed to reconnect:', error);
    }
  }, [doDisconnect, onReconnect]);

  // Handle RPC messages from agent for UI control
  useEffect(() => {
    if (!room) return;
    
    const handleDataReceived = (payload: Uint8Array) => {
      try {
        const message = JSON.parse(new TextDecoder().decode(payload));
        
        if (message.type === 'navigate_and_highlight') {
          // Scroll to experiences section
          const experiencesSection = document.getElementById('experiences');
          if (experiencesSection) {
            experiencesSection.scrollIntoView({ behavior: 'smooth' });
          }
          
          // Highlight AOI FLOAT card after scroll
          setTimeout(() => {
            const floatCard = document.querySelector('[data-experience="aoi-float"]') as HTMLElement;
            if (floatCard) {
              floatCard.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.8)';
              floatCard.style.transform = 'scale(1.05)';
              floatCard.style.transition = 'all 0.3s ease';
              floatCard.style.border = '2px solid rgba(139, 92, 246, 0.6)';
              
              // Remove highlight after 5 seconds
              setTimeout(() => {
                floatCard.style.boxShadow = '';
                floatCard.style.transform = '';
                floatCard.style.border = '';
              }, 5000);
            }
          }, 1000);
        }
      } catch {
        // Ignore non-JSON messages
      }
    };

    room.on('dataReceived', handleDataReceived);
    
    return () => {
      room.off('dataReceived', handleDataReceived);
    };
  }, [room]);

  const startAudio = async () => {
    try {
      const ac = new AudioContext();
      await ac.resume();
      
      // Explicitly enable microphone after audio context is ready
      if (localParticipant) {
        await localParticipant.setMicrophoneEnabled(true);
        console.log('✅ Microphone enabled after audio unlock');
      }
      
      setNeedsUnlock(false);
    } catch (e) {
      console.error('Failed to start audio:', e);
    }
  };

  return (
    <>
      <RoomAudioRenderer />
      <div style={body}>
        <div style={status}>
          {isReconnecting ? "Reconnecting..." : 
           connectionState === "connected" ? "Connected" : 
           connectionState === "disconnected" ? "Disconnected" : "Connecting..."}
        </div>
        
        {needsUnlock ? (
          <div style={{ textAlign: 'center', padding: '12px' }}>
            <button onClick={startAudio} style={{
              ...btn,
              background: "rgba(139, 92, 246, 0.3)",
              border: "1px solid rgba(139, 92, 246, 0.5)",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "600"
            }}>
              🎤 Start Voice Chat
            </button>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '8px' }}>
              Click to enable audio
            </div>
          </div>
        ) : (
          <div style={enhancedControlsStyle}>
            <button 
              onClick={toggleMuteMe} 
              style={{
                ...btn,
                background: mutedMe ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)",
                border: mutedMe ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(34, 197, 94, 0.4)"
              }}
              disabled={connectionState !== 'connected'}
            >
              {mutedMe ? "🔇 Unmute me" : "🎤 Mute me"}
            </button>
            <button 
              onClick={toggleMuteAgent} 
              style={{
                ...btn,
                background: agentMuted ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)",
                border: agentMuted ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(34, 197, 94, 0.4)"
              }}
              disabled={connectionState !== 'connected'}
            >
              {agentMuted ? "🔊 Unmute agent" : "🔇 Mute agent"}
            </button>
            <button 
              onClick={doDisconnect} 
              style={{
                ...btn,
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.4)"
              }}
              disabled={connectionState === 'disconnected'}
            >
              ❌ Disconnect
            </button>
            <button 
              onClick={handleReconnect} 
              style={{
                ...btn,
                background: "rgba(59, 130, 246, 0.2)",
                border: "1px solid rgba(59, 130, 246, 0.4)"
              }}
              disabled={isReconnecting || connectionState === 'connecting'}
            >
              {isReconnecting ? "🔄 Reconnecting..." : "🔄 Reconnect"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

const shell: React.CSSProperties = {
  display: "grid",
  gap: 12,
  height: "100%",
};
const header: React.CSSProperties = { 
  fontWeight: 600, 
  fontSize: 14,
  color: "white"
};
const body: React.CSSProperties = { 
  display: "grid", 
  gap: 12,
  flex: 1
};
const status: React.CSSProperties = { 
  fontSize: 12, 
  color: "rgba(255, 255, 255, 0.7)",
  textAlign: "center"
};
const enhancedControlsStyle: React.CSSProperties = { 
  display: "grid", 
  gridTemplateColumns: "1fr 1fr",
  gap: 8
};
const btn: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: 8,
  background: "rgba(255, 255, 255, 0.1)",
  color: "white",
  cursor: "pointer",
  fontSize: 12,
  transition: "all 0.2s",
  backdropFilter: "blur(10px)",
};