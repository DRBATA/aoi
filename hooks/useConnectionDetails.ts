import { useEffect, useState, useCallback } from 'react';

export type ConnectionDetails = {
  serverUrl: string;
  participantToken: string;
  roomName: string;
  participantName: string;
};

export default function useConnectionDetails() {
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshConnectionDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/livekit-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get connection details');
      }
      
      const details = await response.json();
      setConnectionDetails({
        serverUrl: details.serverUrl,
        participantToken: details.participantToken,
        roomName: details.roomName,
        participantName: details.participantName,
      });
    } catch (error) {
      console.error('Error fetching connection details:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshConnectionDetails();
  }, [refreshConnectionDetails]);

  return { connectionDetails, refreshConnectionDetails, isLoading, error };
}
