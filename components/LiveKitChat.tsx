'use client';

import { useEffect, useState, useRef } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useDataChannel,
  useLocalParticipant,
  useTracks,
} from '@livekit/components-react';
import { Room, Track } from 'livekit-client';
import { ConnectionDetails } from '@/hooks/useConnectionDetails';

interface LiveKitChatProps {
  connectionDetails: ConnectionDetails;
  onCloseAction: () => void;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { localParticipant } = useLocalParticipant();
  // const remoteParticipants = useRemoteParticipants(); // Reserved for future use
  const tracks = useTracks();

  // Handle data channel messages
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  useDataChannel((msg) => {
    if (msg.topic === 'transcription') {
      try {
        const decoded = decoder.decode(msg.payload);
        const data = JSON.parse(decoded);
        
        if (data.text && data.text.trim()) {
          const newMessage: ChatMessage = {
            id: `${Date.now()}-${Math.random()}`,
            text: data.text,
            sender: data.is_final ? 'agent' : 'user',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, newMessage]);
        }
      } catch (error) {
        console.error('Error parsing transcription:', error);
      }
    }
  });

  // Monitor agent speaking state
  useEffect(() => {
    const agentTrack = tracks.find(
      track => track.participant.identity.includes('agent') && 
      track.source === Track.Source.Microphone
    );
    setIsAgentSpeaking(agentTrack?.publication?.isMuted === false);
  }, [tracks]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || !localParticipant) return;

    const message: ChatMessage = {
      id: `${Date.now()}-user`,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, message]);
    
    // Send via data channel
    const payload = encoder.encode(JSON.stringify({
      text: inputValue,
      timestamp: Date.now(),
    }));
    
    await localParticipant.publishData(payload, {
      reliable: true,
      topic: 'chat',
    });
    
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">AI Journey Guide</h3>
          <div className="flex items-center gap-2">
            {isAgentSpeaking && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Agent speaking</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <p>Start a conversation with your AI Journey Guide</p>
            <p className="text-sm mt-2">Ask about experiences, bookings, or recommendations</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LiveKitChat({ connectionDetails, onCloseAction }: LiveKitChatProps) {
  const [room] = useState(() => new Room());

  return (
    <LiveKitRoom
      serverUrl={connectionDetails.serverUrl}
      token={connectionDetails.participantToken}
      room={room}
      connect={true}
      audio={true}
      video={false}
      onDisconnected={onCloseAction}
    >
      <RoomAudioRenderer />
      <ChatInterface />
    </LiveKitRoom>
  );
}
