import { VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';

interface AgentTileProps {
  trackRef?: any;
  className?: string;
}

export function AgentTile({ trackRef, className }: AgentTileProps) {
  if (!trackRef) return null;
  
  return (
    <VideoTrack 
      trackRef={trackRef}
      className={className}
    />
  );
}
