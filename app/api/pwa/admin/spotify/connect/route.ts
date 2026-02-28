import { NextRequest, NextResponse } from "next/server";
import { getDefaultVenueId } from "@/lib/venue";
import { getSpotifyAuthUrl } from "@/lib/spotify";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "visit2026";

export const dynamic = "force-dynamic";

/**
 * GET: Start Spotify OAuth flow.
 * Query: ?password=<admin password>
 * Redirects to Spotify authorization page.
 */
export async function GET(request: NextRequest) {
  const password = request.nextUrl.searchParams.get("password");

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const venueId = await getDefaultVenueId();
  const authUrl = getSpotifyAuthUrl(venueId);

  return NextResponse.redirect(authUrl);
}
