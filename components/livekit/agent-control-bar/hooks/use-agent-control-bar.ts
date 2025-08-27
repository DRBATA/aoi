import { useCallback, useState } from 'react';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';

interface UseAgentControlBarProps {
  controls: {
    microphone?: boolean;
    leave?: boolean;
  };
  saveUserChoices?: boolean;
}

export function useAgentControlBar({ controls, saveUserChoices }: UseAgentControlBarProps) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [pending, setPending] = useState(false);

  const microphoneToggle = {
    enabled: microphoneEnabled,
    pending,
    toggle: useCallback(async () => {
      if (!localParticipant) return;
      
      setPending(true);
      try {
        const newState = !microphoneEnabled;
        await localParticipant.setMicrophoneEnabled(newState);
        setMicrophoneEnabled(newState);
        
        if (saveUserChoices) {
          localStorage.setItem('livekit-microphone-enabled', String(newState));
        }
      } catch (error) {
        console.error('Error toggling microphone:', error);
      } finally {
        setPending(false);
      }
    }, [localParticipant, microphoneEnabled, saveUserChoices])
  };

  const handleDisconnect = useCallback(() => {
    if (room) {
      room.disconnect();
    }
  }, [room]);

  return {
    microphoneToggle,
    handleDisconnect,
  };
}
