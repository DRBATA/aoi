"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useRoomContext,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";

type Props = {
  /** e.g. wss://your-livekit-domain (no trailing /) */
  livekitUrl: string;
  /** give me an endpoint that returns { token } (recommended) */
  tokenEndpoint: string; // e.g. /api/livekit-token?room=room123&identity=alice&source=aoi-chat
  /** optional: override room & identity if you want to build the URL here */
  roomName?: string;
  identity?: string;
};

export default function VoiceChatWidget({
  livekitUrl,
  tokenEndpoint,
  roomName,
  identity,
}: Props) {
  const [token, setToken] = useState<string | null>(null);
  const [connect, setConnect] = useState(true);
  const [agentMuted, setAgentMuted] = useState(false);
  const [ready, setReady] = useState(false); // audio autoplay gate

  // fetch token (server mints it; includes your metadata)
  useEffect(() => {
    const url = new URL(tokenEndpoint, window.location.origin);
    if (roomName) url.searchParams.set("room", roomName);
    if (identity) url.searchParams.set("identity", identity);
    if (!url.searchParams.has("source")) url.searchParams.set("source", "aoi-chat");

    fetch(url.toString())
      .then((r) => r.json())
      .then(({ token }) => setToken(token))
      .catch((e) => console.error("token fetch failed", e));
  }, [tokenEndpoint, roomName, identity]);

  // Autoplay helper: browsers require a user gesture sometimes
  const room = useRoomContext();
  const startAudio = useCallback(async () => {
    try {
      await room?.startAudio();
      setReady(true);
    } catch (e) {
      console.warn("startAudio blocked, need user gesture", e);
    }
  }, [room]);

  // Mute me (local mic)
  const { localParticipant } = useLocalParticipant();
  const [mutedMe, setMutedMe] = useState(false);
  const toggleMuteMe = useCallback(async () => {
    const next = !mutedMe;
    setMutedMe(next);
    await localParticipant?.setMicrophoneEnabled(!next);
  }, [mutedMe, localParticipant]);

  // Simple agent mute toggle (UI state only for now)
  const toggleMuteAgent = useCallback(() => {
    setAgentMuted(!agentMuted);
    // TODO: Implement actual audio muting when LiveKit API is stable
  }, [agentMuted]);

  // Disconnect / Reconnect
  const doDisconnect = useCallback(async () => {
    setConnect(false);
  }, []);
  const doReconnect = useCallback(() => {
    setConnect(true);
  }, []);

  // auto-run startAudio when room connects (best effort)
  useEffect(() => {
    // small delay to let playback elements mount
    const t = setTimeout(() => {
      startAudio();
    }, 300);
    return () => clearTimeout(t);
  }, [startAudio, connect, token]);

  // Basic chrome UI to drop into your chat panel
  const Controls = useMemo(
    () => (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {!ready && (
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
        <button onClick={doDisconnect} style={{ ...btn, background: "#fee2e2", borderColor: "#fecaca" }}>
          Disconnect
        </button>
        <button onClick={doReconnect} style={{ ...btn, background: "#dcfce7", borderColor: "#bbf7d0" }}>
          Reconnect
        </button>
      </div>
    ),
    [ready, startAudio, toggleMuteMe, mutedMe, toggleMuteAgent, agentMuted, doDisconnect, doReconnect]
  );

  if (!token) {
    return (
      <div style={shell}>
        <div style={header}>Voice Assistant</div>
        <div style={body}>Fetching token…</div>
      </div>
    );
  }

  return (
    <div style={shell}>
      <div style={header}>Voice Assistant</div>

      <LiveKitRoom
        token={token}
        serverUrl={livekitUrl}
        connect={connect}
        audio
        video={false}
        style={{ display: "contents" }}
      >
        {/* Plays all remote audio. If autoplay is blocked, use Start audio button */}
        <RoomAudioRenderer />
        <div style={body}>
          <div style={status}>
            {connect ? "Connected to room" : "Disconnected"}
          </div>
          {Controls}
          {/* your text chat UI can live here, independent of the agent's voice */}
        </div>
      </LiveKitRoom>
    </div>
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
const btn: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  background: "#f9fafb",
  cursor: "pointer",
};
