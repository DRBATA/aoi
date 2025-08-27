import { VideoTrack } from '@livekit/components-react';

interface VideoTileProps {
  trackRef?: any;
  className?: string;
}

export function VideoTile({ trackRef, className }: VideoTileProps) {
  if (!trackRef) return null;
  
  return (
    <VideoTrack 
      trackRef={trackRef}
      className={className}
    />
  );
}
