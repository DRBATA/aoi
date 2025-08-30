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
    fetch(tokenEndpoint)
      .then(r => r.json())
      .then(data => setToken(data.token))
      .catch(console.error);
  }, [tokenEndpoint]);

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
              Start audio
            </button>
          )}
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
      </div>
    </>
  );
}

const shell: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 12,
  display: "grid",
  gap: 12,
  background: "#fff",
};
const header: React.CSSProperties = { fontWeight: 600, fontSize: 14 };
const body: React.CSSProperties = { display: "grid", gap: 10 };
const status: React.CSSProperties = { fontSize: 12, color: "#6b7280" };
const controlsStyle: React.CSSProperties = { display: "flex", gap: 8 };
const btn: React.CSSProperties = {
  padding: "6px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  background: "#f9fafb",
  cursor: "pointer",
  fontSize: 12,
};