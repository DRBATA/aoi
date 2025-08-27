import { useEffect, useState, useCallback } from 'react';

export type ConnectionDetails = {
  url: string;
  token: string;
  roomName: string;
  participantIdentity: string;
};

export default function useConnectionDetails() {
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshConnectionDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/connection-details', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to get connection details');
      }
      
      const details = await response.json();
      setConnectionDetails({
        url: details.url,
        token: details.token,
        roomName: details.roomName,
        participantIdentity: details.participantIdentity,
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
