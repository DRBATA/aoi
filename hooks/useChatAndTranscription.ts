import { useMemo } from 'react';
import {
  type ReceivedChatMessage,
  type TextStreamData,
  useChat,
  useRoomContext,
  useTranscriptions,
} from '@livekit/components-react';

function transcriptionToChatMessage(transcription: TextStreamData, room: any): ReceivedChatMessage {
  return {
    id: `transcription-${transcription.timestamp}`,
    message: transcription.text || '',
    timestamp: transcription.timestamp || Date.now(),
    from: {
      identity: transcription.participant?.identity || 'user',
      name: transcription.participant?.name || 'User',
      isLocal: transcription.participant?.isLocal || false,
    },
  };
}

export default function useChatAndTranscription() {
  const transcriptions: TextStreamData[] = useTranscriptions();
  const chat = useChat();
  const room = useRoomContext();

  const mergedTranscriptions = useMemo(() => {
    const merged: Array<ReceivedChatMessage> = [
      ...transcriptions.map((transcription) => transcriptionToChatMessage(transcription, room)),
      ...chat.chatMessages,
    ];
    return merged.sort((a, b) => a.timestamp - b.timestamp);
  }, [transcriptions, chat.chatMessages, room]);

  return { messages: mergedTranscriptions, send: chat.send };
}
