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

  useEffect(() => {
    if (!tokenEndpoint) return;
    console.log('🔗 Fetching token from:', tokenEndpoint);
    console.log('🌐 LiveKit URL:', livekitUrl);
    fetch(tokenEndpoint)
      .then(r => r.json())
      .then(data => {
        console.log('🎫 Token received:', data.token ? 'Yes' : 'No');
        setToken(data.token);
      })
      .catch(err => {
        console.error('❌ Token fetch error:', err);
      });
  }, [tokenEndpoint, livekitUrl]);

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
        <VoiceControls />
      </LiveKitRoom>
    </div>
  );
}

function VoiceControls() {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [mutedMe, setMutedMe] = useState(false);
  const [agentMuted, setAgentMuted] = useState(false);
  const [needsUnlock, setNeedsUnlock] = useState(false);

  useEffect(() => {
    if (room.state === 'connected') {
      const ac = new AudioContext();
      if (ac.state === 'suspended') {
        setNeedsUnlock(true);
      } else {
        // Auto-start if audio context is already allowed
        ac.resume().catch(() => setNeedsUnlock(true));
      }
    }
  }, [room.state]);

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
    const next = !mutedMe;
    setMutedMe(next);
    await localParticipant?.setMicrophoneEnabled(!next);
  }, [mutedMe, localParticipant]);

  const toggleMuteAgent = useCallback(() => {
    setAgentMuted(!agentMuted);
  }, [agentMuted]);

  const doDisconnect = useCallback(() => {
    room?.disconnect();
  }, [room]);

  // Handle RPC messages from agent for UI control
  useEffect(() => {
    if (!room) return;
    
    const handleDataReceived = (payload: Uint8Array, participant?: any) => {
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
      } catch (e) {
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
          {room?.state === "connected" ? "Connected" : "Connecting..."}
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
          <div style={controlsStyle}>
            <button onClick={toggleMuteMe} style={btn}>
              {mutedMe ? "Unmute me" : "Mute me"}
            </button>
            <button onClick={toggleMuteAgent} style={btn}>
              {agentMuted ? "Unmute agent" : "Mute agent"}
            </button>
            <button onClick={doDisconnect} style={btn}>
              Disconnect
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
const controlsStyle: React.CSSProperties = { 
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