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
      ac.resume().catch(() => setNeedsUnlock(true));
    }
  }, [room.state]);

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
          {room?.state === "connected" ? "Connected to room" : "Connecting..."}
        </div>
        
        <div style={controlsStyle}>
          {needsUnlock && (
            <button onClick={startAudio} style={btn}>
              Hello
            </button>
          )}
          <button onClick={toggleMuteMe} style={btn}>
            {mutedMe ? "Mute me" : "Mute me"}
          </button>
          <button onClick={toggleMuteAgent} style={btn}>
            {agentMuted ? "Mute agent" : "Mute agent"}
          </button>
          <button onClick={doDisconnect} style={btn}>
            Disconnect
          </button>
        </div>
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