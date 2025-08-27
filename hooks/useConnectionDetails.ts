import { useEffect, useState } from 'react';

export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
};

export default function useConnectionDetails() {
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | undefined>();

  const refreshConnectionDetails = async () => {
    try {
      const response = await fetch('/api/livekit-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: 'AOI Guest',
          experienceType: 'general',
          bookingStatus: 'pending'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get connection details');
      }
      
      const details = await response.json();
      setConnectionDetails(details);
    } catch (error) {
      console.error('Error fetching connection details:', error);
    }
  };

  useEffect(() => {
    refreshConnectionDetails();
  }, []);

  return { connectionDetails, refreshConnectionDetails };
}
