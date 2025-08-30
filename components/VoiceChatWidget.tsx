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
  const [messages, setMessages] = useState<{text: string, isUser: boolean, timestamp: number}[]>([]);
  const [inputValue, setInputValue] = useState('');

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

  const sendTextMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    
    // Add user message to display
    setMessages(prev => [...prev, {
      text: text.trim(),
      isUser: true,
      timestamp: Date.now()
    }]);
    
    // Send via LiveKit data channel
    room.localParticipant.publishData(
      new TextEncoder().encode(JSON.stringify({
        type: 'chat_message',
        message: text.trim()
      })),
      { reliable: true }
    );
  }, [room]);

  // Listen for agent responses via data channel
  useEffect(() => {
    const handleDataReceived = (payload: Uint8Array) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(payload));
        if (data.type === 'agent_response') {
          setMessages(prev => [...prev, {
            text: data.message,
            isUser: false,
            timestamp: Date.now()
          }]);
        }
      } catch (e) {
        console.error('Failed to parse data:', e);
      }
    };

    room.on('dataReceived', handleDataReceived);
    return () => {
      room.off('dataReceived', handleDataReceived);
    };
  }, [room]);

  return (
    <>
      <RoomAudioRenderer />
      <div style={body}>
        <div style={status}>
          {room?.state === "connected" ? "Connected to room" : "Connecting..."}
        </div>
        
        {/* Message Display Area */}
        {messages.length > 0 && (
          <div style={messagesStyle}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                ...messageStyle,
                ...(msg.isUser ? userMessageStyle : agentMessageStyle)
              }}>
                {msg.text}
              </div>
            ))}
          </div>
        )}
        
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
        
        {/* Text Input */}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type message..."
            style={textInputStyle}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && inputValue.trim()) {
                sendTextMessage(inputValue);
                setInputValue('');
              }
            }}
          />
          <button
            onClick={() => {
              if (inputValue.trim()) {
                sendTextMessage(inputValue);
                setInputValue('');
              }
            }}
            style={sendBtnStyle}
          >
            Send
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
const messagesStyle: React.CSSProperties = {
  maxHeight: 120,
  overflowY: "auto",
  marginBottom: 8,
  padding: 8,
  border: "1px solid #e5e7eb",
  borderRadius: 6,
  background: "#f9fafb",
};
const messageStyle: React.CSSProperties = {
  padding: "4px 8px",
  marginBottom: 4,
  borderRadius: 4,
  fontSize: 11,
  maxWidth: "80%",
};
const userMessageStyle: React.CSSProperties = {
  background: "#3b82f6",
  color: "white",
  marginLeft: "auto",
  textAlign: "right",
};
const agentMessageStyle: React.CSSProperties = {
  background: "#e5e7eb",
  color: "#374151",
  marginRight: "auto",
};
const textInputStyle: React.CSSProperties = {
  flex: 1,
  padding: "4px 8px",
  border: "1px solid #d1d5db",
  borderRadius: 4,
  fontSize: 12,
};
const sendBtnStyle: React.CSSProperties = {
  padding: "4px 12px",
  border: "1px solid #3b82f6",
  borderRadius: 4,
  background: "#3b82f6",
  color: "white",
  cursor: "pointer",
  fontSize: 12,
};