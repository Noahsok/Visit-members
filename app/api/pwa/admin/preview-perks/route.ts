import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "visit2026";

export async function GET(request: NextRequest) {
  const password = request.nextUrl.searchParams.get("password");
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const html = `<!DOCTYPE html>
<html><head>
<title>Perks Preview</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap" rel="stylesheet">
<style>
body { font-family: system-ui; background: #1a1a1a; color: #f4f2ec; padding: 20px; margin: 0; }
.option { margin-bottom: 32px; padding: 20px; border: 1px solid rgba(244,242,236,0.1); border-radius: 8px; }
.option-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; color: rgba(244,242,236,0.6); }
.perk-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.perk-name { font-size: 14px; font-weight: 500; }
</style>
</head><body>

<div class="option">
  <div class="option-label">Option A — opacity 0.45, 10px</div>
  <div style="font-size:10px;font-weight:600;opacity:0.45;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px">Member perks</div>
  <div class="perk-row"><span class="perk-name">Artwork</span><span style="font-size:13px;opacity:0.25">15% off all works</span></div>
  <div class="perk-row"><span class="perk-name">Guest passes</span><span style="font-size:13px;opacity:0.25">2 member passes per night</span></div>
  <div class="perk-row"><span class="perk-name">Private viewings</span><span style="font-size:13px;opacity:0.25">Schedule by request</span></div>
</div>

<div class="option">
  <div class="option-label">Option B — opacity 0.5, 11px</div>
  <div style="font-size:11px;font-weight:600;opacity:0.5;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px">Member perks</div>
  <div class="perk-row"><span class="perk-name">Artwork</span><span style="font-size:13px;opacity:0.25">15% off all works</span></div>
  <div class="perk-row"><span class="perk-name">Guest passes</span><span style="font-size:13px;opacity:0.25">2 member passes per night</span></div>
  <div class="perk-row"><span class="perk-name">Private viewings</span><span style="font-size:13px;opacity:0.25">Schedule by request</span></div>
</div>

<div class="option">
  <div class="option-label">Option C — opacity 0.55, 10px, bold 700</div>
  <div style="font-size:10px;font-weight:700;opacity:0.55;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px">Member perks</div>
  <div class="perk-row"><span class="perk-name">Artwork</span><span style="font-size:13px;opacity:0.25">15% off all works</span></div>
  <div class="perk-row"><span class="perk-name">Guest passes</span><span style="font-size:13px;opacity:0.25">2 member passes per night</span></div>
  <div class="perk-row"><span class="perk-name">Private viewings</span><span style="font-size:13px;opacity:0.25">Schedule by request</span></div>
</div>

</body></html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}
