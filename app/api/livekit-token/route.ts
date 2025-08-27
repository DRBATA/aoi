import { NextResponse } from 'next/server';
import { AccessToken, type AccessTokenOptions, type VideoGrant } from 'livekit-server-sdk';

const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

export const revalidate = 0;

export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
  bookingContext?: {
    venue: string;
    experienceType?: string;
    bookingStatus?: string;
    guestName?: string;
  };
};

export async function POST(request: Request) {
  try {
    const { guestName, experienceType, bookingStatus } = await request.json();
    
    if (!LIVEKIT_URL || !API_KEY || !API_SECRET) {
      throw new Error('LiveKit environment variables not configured');
    }

    // Create AOI-specific room context
    const participantName = guestName || 'AOI Guest';
    const participantIdentity = `aoi_${experienceType || 'general'}_${Math.floor(Math.random() * 10_000)}`;
    const roomName = `aoi_experience_${experienceType || 'general'}_${Math.floor(Math.random() * 10_000)}`;
    
    const participantToken = await createParticipantToken(
      { identity: participantIdentity, name: participantName },
      roomName
    );

    const data: ConnectionDetails = {
      serverUrl: LIVEKIT_URL,
      roomName,
      participantToken,
      participantName,
      bookingContext: {
        venue: 'AOI',
        experienceType,
        bookingStatus,
        guestName
      }
    };

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error) {
    console.error('LiveKit token error:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Token generation failed', 
      { status: 500 }
    );
  }
}

function createParticipantToken(userInfo: AccessTokenOptions, roomName: string) {
  const at = new AccessToken(API_KEY, API_SECRET, {
    ...userInfo,
    ttl: '30m', // Longer for experience sessions
  });
  
  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  
  at.addGrant(grant);
  return at.toJwt();
}
