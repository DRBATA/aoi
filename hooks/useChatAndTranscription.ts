import { useMemo } from 'react';
import {
  type ReceivedChatMessage,
  type TextStreamData,
  useChat,
  useRoomContext,
  useTranscriptions,
} from '@livekit/components-react';

function transcriptionToChatMessage(transcription: TextStreamData, room: any, index: number): ReceivedChatMessage {
  return {
    id: `transcription-${Date.now()}-${index}`,
    message: transcription.text || '',
    timestamp: Date.now(),
    from: {
      identity: 'transcription',
      name: 'AI Agent',
      isLocal: false,
    } as any,
  };
}

export default function useChatAndTranscription() {
  const transcriptions: TextStreamData[] = useTranscriptions();
  const chat = useChat();
  const room = useRoomContext();

  const mergedTranscriptions = useMemo(() => {
    const merged: Array<ReceivedChatMessage> = [
      ...transcriptions.map((transcription, index) => transcriptionToChatMessage(transcription, room, index)),
      ...chat.chatMessages,
    ];
    return merged.sort((a, b) => a.timestamp - b.timestamp);
  }, [transcriptions, chat.chatMessages, room]);

  return { messages: mergedTranscriptions, send: chat.send };
}
