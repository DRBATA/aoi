"use client";

import { useCallback, useEffect, useState } from "react";
import { LiveKitRoom, useRoomContext, useLocalParticipant } from "@livekit/components-react";
import { resumeAudioContext } from "../lib/audio-context";

interface VoiceChatWidgetProps {
  tokenEndpoint: string;
  livekitUrl: string;
}

export default function VoiceChatWidget({ tokenEndpoint, livekitUrl }: VoiceChatWidgetProps) {
  const [token, setToken] = useState<string>();
  const [tokenNonce, setTokenNonce] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const fetchToken = useCallback(async () => {
    try {
      console.log('🔄 Fetching fresh token from:', tokenEndpoint);
      const response = await fetch(tokenEndpoint);
      if (!response.ok) {
        throw new Error(`Token fetch failed: ${response.status}`);
      }
      const data = await response.json();
      console.log('✅ Fresh token received');
      setToken(data.accessToken);
      setTokenNonce(n => n + 1); // Force remount of LiveKitRoom
      setIsReconnecting(false);
    } catch (err) {
      console.error('❌ Token fetch error:', err);
      setIsReconnecting(false);
    }
  }, [tokenEndpoint]);

  const handleReconnect = useCallback(() => {
    setIsReconnecting(true);
    setToken(undefined); // Unmount room
    fetchToken(); // Get fresh token
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
        key={tokenNonce} // Force clean mount on new token
        token={token}
        serverUrl={livekitUrl}
        connect={true}
        audio={{
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }}
        video={false}
        style={{ display: "contents" }}
        options={{
          publishDefaults: {
            audioPreset: {
              maxBitrate: 20_000,
            },
          },
        }}
        onDisconnected={(reason) => {
          console.log('🔌 Disconnected:', reason);
        }}
        onError={(e) => console.error('LiveKit error:', e)}
      >
        <VoiceControls onReconnect={handleReconnect} isReconnecting={isReconnecting} />
      </LiveKitRoom>
    </div>
  );
}

// Module-level guard to prevent multiple widget instances
let voiceWidgetMounted = false;

function VoiceControls({ onReconnect, isReconnecting }: { onReconnect: () => void; isReconnecting: boolean }) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [mutedMe, setMutedMe] = useState(false);
  const [agentMuted, setAgentMuted] = useState(false);
  const [needsUnlock, setNeedsUnlock] = useState(false);
  const [connectionState, setConnectionState] = useState<string>('connecting');

  // Prevent multiple widget instances
  useEffect(() => {
    if (voiceWidgetMounted) {
      console.warn('Voice widget already mounted - preventing duplicate');
      return () => {};
    }
    voiceWidgetMounted = true;
    return () => {
      voiceWidgetMounted = false;
    };
  }, []);

  // Force disconnect on unmount and tab close
  useEffect(() => {
    const cleanup = () => {
      try {
        room?.disconnect(true); // Force close with stop all tracks
      } catch (error) {
        console.error('Cleanup disconnect error:', error);
      }
    };

    // Cleanup on unmount
    return cleanup;
  }, [room]);

  // Handle tab close and visibility changes
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden && room) {
        try {
          room.disconnect(true);
        } catch (error) {
          console.error('Visibility disconnect error:', error);
        }
      }
    };

    const onBeforeUnload = () => {
      try {
        room?.disconnect(true);
      } catch (error) {
        console.error('Unload disconnect error:', error);
      }
    };

    // Short join watchdog - prevent half-open connects
    const watchdog = setTimeout(() => {
      if (room?.state === 'connecting') {
        console.warn('Connection timeout - forcing disconnect');
        room.disconnect(true);
      }
    }, 10000);

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      clearTimeout(watchdog);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [room]);

  // Track connection state changes
  useEffect(() => {
    if (!room) return;
    
    const handler = () => setConnectionState(room.state);
    handler(); // Set initial state
    room.on('connectionStateChanged', handler);
    
    return () => {
      room.off('connectionStateChanged', handler);
    };
  }, [room]);

  // Initialize audio context on connection
  useEffect(() => {
    if (connectionState === 'connected') {
      const initializeAudio = async () => {
        try {
          await resumeAudioContext();
          // Ensure microphone is enabled when connected
          if (localParticipant) {
            await localParticipant.setMicrophoneEnabled(true);
            console.log('🎤 Microphone auto-enabled on connection');
          }
          setNeedsUnlock(false);
        } catch (error) {
          console.error('Audio initialization failed:', error);
          setNeedsUnlock(true);
        }
      };
      
      initializeAudio();
    }
  }, [connectionState, localParticipant]);

  // Auto-start audio when component mounts
  useEffect(() => {
    const tryAutoStart = async () => {
      try {
        await resumeAudioContext();
        setNeedsUnlock(false);
        console.log('Audio unlocked automatically');
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

  // Agent muting handled via track events

  const doDisconnect = useCallback(() => {
    try {
      room?.disconnect(true);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }, [room]);

  const handleReconnectClick = useCallback(() => {
    onReconnect();
  }, [onReconnect]);

  // Register RPC handlers for UI control
  useEffect(() => {
    if (!room || !localParticipant) return;

    localParticipant.registerRpcMethod(
      "client.ui_control",
      async (data) => {
        const payload = JSON.parse(data.payload);
        console.log('UI control RPC:', payload);
        
        if (payload.action === 'close_widget') {
          // Dispatch event to close widget
          window.dispatchEvent(new CustomEvent('close-voice-widget'));
        }
        
        return "ok"; // RPC methods must return a string
      }
    );
  }, [room, localParticipant]);

  // Handle audio track events with cleanup
  useEffect(() => {
    if (!room) return;

    const handleTrackSubscribed = (track: any, publication: any, participant: any) => {
      if (track.kind === 'audio' && participant.identity !== localParticipant?.identity) {
        console.log('🔊 Agent audio track subscribed');
        
        const handleMuteChanged = () => {
          setAgentMuted(track.isMuted);
        };
        
        // Use 'on' method for LiveKit tracks
        track.on('muted', handleMuteChanged);
        track.on('unmuted', handleMuteChanged);
        
        // Store cleanup function
        (track as any)._cleanup = () => {
          track.off('muted', handleMuteChanged);
          track.off('unmuted', handleMuteChanged);
        };
      }
    };

    const handleTrackUnsubscribed = (track: any) => {
      if (track.kind === 'audio') {
        console.log('🔇 Agent audio track unsubscribed');
        
        // Clean up listeners
        if ((track as any)._cleanup) {
          (track as any)._cleanup();
          delete (track as any)._cleanup;
        }
      }
    };

    room.on('trackSubscribed', handleTrackSubscribed);
    room.on('trackUnsubscribed', handleTrackUnsubscribed);

    return () => {
      room.off('trackSubscribed', handleTrackSubscribed);
      room.off('trackUnsubscribed', handleTrackUnsubscribed);
    };
  }, [room, localParticipant]);

  const unlockAudio = useCallback(async () => {
    try {
      await resumeAudioContext();
      if (localParticipant) {
        await localParticipant.setMicrophoneEnabled(!mutedMe);
      }
      setNeedsUnlock(false);
    } catch (error) {
      console.error('Failed to unlock audio:', error);
    }
  }, [localParticipant, mutedMe]);

  return (
    <div style={{
      padding: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      fontSize: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Status: {connectionState}</span>
        {isReconnecting && <span>Reconnecting...</span>}
      </div>
      
      {needsUnlock && (
        <button 
          onClick={unlockAudio}
          style={{
            padding: '8px 12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔓 Enable Audio
        </button>
      )}
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={toggleMuteMe}
          disabled={needsUnlock}
          style={{
            padding: '6px 10px',
            backgroundColor: mutedMe ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: needsUnlock ? 'not-allowed' : 'pointer',
            opacity: needsUnlock ? 0.5 : 1
          }}
        >
          {mutedMe ? '🔇 Muted' : '🎤 Live'}
        </button>
        
        <button 
          onClick={handleReconnectClick}
          disabled={isReconnecting}
          style={{
            padding: '6px 10px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isReconnecting ? 'not-allowed' : 'pointer',
            opacity: isReconnecting ? 0.5 : 1
          }}
        >
          🔄 Reconnect
        </button>
        
        <button 
          onClick={doDisconnect}
          style={{
            padding: '6px 10px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ❌ Disconnect
        </button>
      </div>
    </div>
  );
}

// CSS styles
const shell = {
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: "8px",
  color: "white",
  fontFamily: "system-ui, sans-serif",
  fontSize: "14px",
  width: "300px",
  maxHeight: "400px",
  overflow: "hidden"
};

const header = {
  padding: "12px 16px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  fontWeight: "600",
  textAlign: "center" as const
};

const body = {
  padding: "16px"
};