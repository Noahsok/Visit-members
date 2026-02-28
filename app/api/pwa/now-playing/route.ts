import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/pwa-auth";
import { getDefaultVenueId } from "@/lib/venue";
import { getNowPlaying } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = extractToken(request.headers.get("authorization"));
  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const venueId = await getDefaultVenueId();

  try {
    const nowPlaying = await getNowPlaying(venueId);
    return NextResponse.json({ nowPlaying });
  } catch (err) {
    console.error("Now playing error:", err);
    return NextResponse.json({ nowPlaying: null });
  }
}
