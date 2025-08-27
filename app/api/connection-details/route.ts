import { NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export async function GET() {
  try {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json(
        { error: 'LiveKit configuration missing' },
        { status: 500 }
      );
    }

    // Generate a unique room name for this session
    const roomName = `aoi-chat-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Create participant identity
    const participantIdentity = `user-${Date.now()}`;

    // Create access token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      ttl: '24h',
    });

    // Grant permissions for the room
    at.addGrant({ 
      roomJoin: true, 
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({
      url: wsUrl,
      token,
      roomName,
      participantIdentity,
    });
  } catch (error) {
    console.error('Error generating connection details:', error);
    return NextResponse.json(
      { error: 'Failed to generate connection details' },
      { status: 500 }
    );
  }
}
