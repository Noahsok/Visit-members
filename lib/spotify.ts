import { prisma } from "./prisma";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "";
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

const SCOPES = "user-read-currently-playing user-read-playback-state user-read-recently-played";
const REDIRECT_URI = `${APP_URL}/api/pwa/admin/spotify/callback`;

export interface TrackData {
  trackName: string;
  artistName: string;
  albumArt: string | null;
}

export interface NowPlayingData {
  trackName: string;
  artistName: string;
  albumArt: string | null;
  isPlaying: boolean;
  previousTrack: TrackData | null;
}

/**
 * Build the Spotify OAuth authorization URL.
 */
export function getSpotifyAuthUrl(venueId: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state: venueId,
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

/**
 * Exchange an authorization code for access + refresh tokens.
 */
export async function exchangeCode(
  code: string,
  venueId: string
): Promise<void> {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Spotify token exchange failed: ${err}`);
  }

  const data = await res.json();
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  await prisma.spotifyToken.upsert({
    where: { venueId },
    create: {
      venueId,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
    },
    update: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
    },
  });
}

/**
 * Refresh the access token using the stored refresh token.
 */
async function refreshAccessToken(tokenId: string, refreshToken: string): Promise<string> {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    throw new Error("Spotify token refresh failed");
  }

  const data = await res.json();
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  await prisma.spotifyToken.update({
    where: { id: tokenId },
    data: {
      accessToken: data.access_token,
      // Spotify may return a new refresh token
      ...(data.refresh_token ? { refreshToken: data.refresh_token } : {}),
      expiresAt,
    },
  });

  return data.access_token;
}

/**
 * Get the currently playing track for a venue's Spotify account.
 * Returns null if nothing is playing or Spotify isn't connected.
 */
export async function getNowPlaying(
  venueId: string
): Promise<NowPlayingData | null> {
  const token = await prisma.spotifyToken.findUnique({
    where: { venueId },
  });

  if (!token) return null;

  // Refresh if expired (with 60s buffer)
  let accessToken = token.accessToken;
  if (token.expiresAt.getTime() < Date.now() + 60000) {
    try {
      accessToken = await refreshAccessToken(token.id, token.refreshToken);
    } catch {
      return null;
    }
  }

  // Fetch current track and recently played in parallel
  const [currentRes, recentRes] = await Promise.all([
    fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
    fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => null),
  ]);

  // 204 = nothing playing
  if (currentRes.status === 204 || !currentRes.ok) return null;

  const data = await currentRes.json();

  if (!data.item || data.currently_playing_type !== "track") return null;

  // Get previous track from recently played
  let previousTrack: TrackData | null = null;
  if (recentRes && recentRes.ok) {
    try {
      const recentData = await recentRes.json();
      const lastPlayed = recentData.items?.[0]?.track;
      if (lastPlayed && lastPlayed.name !== data.item.name) {
        previousTrack = {
          trackName: lastPlayed.name,
          artistName: lastPlayed.artists.map((a: { name: string }) => a.name).join(", "),
          albumArt: lastPlayed.album?.images?.[0]?.url || null,
        };
      }
    } catch {
      // Ignore — recently played is optional
    }
  }

  return {
    trackName: data.item.name,
    artistName: data.item.artists.map((a: { name: string }) => a.name).join(", "),
    albumArt: data.item.album?.images?.[0]?.url || null,
    isPlaying: data.is_playing,
    previousTrack,
  };
}
