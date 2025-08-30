import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const room = url.searchParams.get("room") || "waterbar-demo";
  const identity = url.searchParams.get("identity") || `user-${Math.random().toString(36).slice(2, 8)}`;
  const source = url.searchParams.get("source") || "aoi-chat";

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      identity,
      name: identity,
      metadata: JSON.stringify({
        source,            // "aoi-chat" or custom source
        ui: "voice-widget",
        ts: Date.now(),
      }),
    }
  );

  at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });

  const token = await at.toJwt();
  return NextResponse.json({ token });
}
