import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/spotify";

export const dynamic = "force-dynamic";

/**
 * GET: Spotify OAuth callback.
 * Receives authorization code, exchanges for tokens, stores in DB.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state"); // venueId
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return new NextResponse(
      `<html><body style="background:#1a1a1a;color:#f4f2ec;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
        <div style="text-align:center">
          <h1>Spotify Connection Failed</h1>
          <p>${error}</p>
        </div>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  if (!code || !state) {
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }

  try {
    await exchangeCode(code, state);

    return new NextResponse(
      `<html><body style="background:#1a1a1a;color:#f4f2ec;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
        <div style="text-align:center">
          <h1 style="color:#4CAF50">Spotify Connected</h1>
          <p>The venue&rsquo;s Spotify account is now linked. Members will see what&rsquo;s playing in real time.</p>
          <p style="opacity:0.5;margin-top:24px">You can close this tab.</p>
        </div>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (err) {
    console.error("Spotify callback error:", err);
    return new NextResponse(
      `<html><body style="background:#1a1a1a;color:#f4f2ec;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
        <div style="text-align:center">
          <h1 style="color:#f44336">Connection Error</h1>
          <p>Failed to connect Spotify. Please try again.</p>
        </div>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }
}
