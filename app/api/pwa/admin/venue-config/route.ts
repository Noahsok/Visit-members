import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultVenueId } from "@/lib/venue";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "visit2026";

export async function GET(request: NextRequest) {
  try {
    const password = request.nextUrl.searchParams.get("password");
    const forceOpen = request.nextUrl.searchParams.get("forceOpen");
    const forceClosed = request.nextUrl.searchParams.get("forceClosed");

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const venueId = await getDefaultVenueId();

    // If params provided, update config
    if (forceOpen !== null || forceClosed !== null) {
      const data: Record<string, boolean> = {};
      if (forceOpen !== null) data.forceOpen = forceOpen === "true";
      if (forceClosed !== null) data.forceClosed = forceClosed === "true";

      await prisma.venueConfig.update({
        where: { venueId },
        data,
      });
    }

    // Return current config
    const config = await prisma.venueConfig.findUnique({
      where: { venueId },
      select: { forceOpen: true, forceClosed: true, lateNightClose: true },
    });

    const html = `<!DOCTYPE html>
<html><head><title>Venue Config</title>
<style>body{font-family:system-ui;background:#1a1a1a;color:#f4f2ec;padding:20px;max-width:500px;margin:0 auto}
h1{font-size:18px;opacity:0.5;text-transform:uppercase;letter-spacing:0.1em}
.row{padding:14px 0;border-bottom:1px solid rgba(244,242,236,0.1);display:flex;justify-content:space-between;align-items:center}
.label{font-size:14px}.value{font-size:14px;opacity:0.5}
a{color:#f4f2ec;background:rgba(244,242,236,0.1);padding:8px 16px;text-decoration:none;font-size:13px;border-radius:4px;margin-left:8px}
a:hover{background:rgba(244,242,236,0.2)}
.on{color:#4f4;opacity:1}.off{opacity:0.3}</style></head>
<body><h1>Venue Config</h1>
<div class="row">
  <span class="label">Force Open</span>
  <div>
    <span class="${config?.forceOpen ? "on" : "off"}">${config?.forceOpen ? "ON" : "OFF"}</span>
    <a href="?password=${password}&forceOpen=${!config?.forceOpen}">${config?.forceOpen ? "Turn Off" : "Turn On"}</a>
  </div>
</div>
<div class="row">
  <span class="label">Force Closed</span>
  <div>
    <span class="${config?.forceClosed ? "on" : "off"}">${config?.forceClosed ? "ON" : "OFF"}</span>
    <a href="?password=${password}&forceClosed=${!config?.forceClosed}">${config?.forceClosed ? "Turn Off" : "Turn On"}</a>
  </div>
</div>
<div class="row">
  <span class="label">Late Night Close</span>
  <span class="value">${config?.lateNightClose || "Not set"}</span>
</div>
</body></html>`;

    return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(
      `<html><body style="font-family:system-ui;background:#1a1a1a;color:#f4f2ec;padding:40px"><h1>Error</h1><pre>${message}</pre></body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}
