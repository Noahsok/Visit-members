import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "visit2026";

export async function GET(request: NextRequest) {
  try {
    const password = request.nextUrl.searchParams.get("password");
    const phone = request.nextUrl.searchParams.get("phone");

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    if (!phone) {
      // List all pending members
      const pending = await prisma.member.findMany({
        where: { appAccess: "none" },
        select: { id: true, name: true, phone: true, tier: true, joinedAt: true },
        orderBy: { joinedAt: "desc" },
      });

      const html = `<!DOCTYPE html>
<html><head><title>Pending Members</title>
<style>body{font-family:system-ui;background:#1a1a1a;color:#f4f2ec;padding:20px;max-width:500px;margin:0 auto}
h1{font-size:18px;opacity:0.5;text-transform:uppercase;letter-spacing:0.1em}
.member{padding:14px 0;border-bottom:1px solid rgba(244,242,236,0.1);display:flex;justify-content:space-between;align-items:center}
.name{font-size:16px;font-weight:600}.phone{font-size:13px;opacity:0.4;margin-top:2px}
a{color:#f4f2ec;background:rgba(244,242,236,0.1);padding:8px 16px;text-decoration:none;font-size:13px;border-radius:4px}
a:hover{background:rgba(244,242,236,0.2)}
.empty{opacity:0.3;font-style:italic;margin-top:20px}</style></head>
<body><h1>Pending Members</h1>
${pending.length === 0 ? '<p class="empty">No pending members</p>' : pending.map(m => {
  const digits = m.phone?.replace(/\D/g, "") || "";
  return `<div class="member"><div><div class="name">${m.name}</div><div class="phone">${m.phone || "No phone"} · ${m.tier}</div></div>
<a href="/api/pwa/admin/approve?password=${password}&phone=${digits}">Approve</a></div>`;
}).join("")}
</body></html>`;

      return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
    }

    // Approve a specific member by phone
    const digits = phone.replace(/\D/g, "");

    const member = await prisma.member.findFirst({
      where: {
        phone: { contains: digits },
      },
    });

    if (!member) {
      return new NextResponse(
        `<!DOCTYPE html><html><head><title>Not Found</title>
<style>body{font-family:system-ui;background:#1a1a1a;color:#f4f2ec;padding:40px;text-align:center}
h1{font-size:20px}p{opacity:0.5}</style></head>
<body><h1>Member not found</h1><p>No member with phone ${digits}</p></body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    await prisma.member.update({
      where: { id: member.id },
      data: { appAccess: "approved" },
    });

    return new NextResponse(
      `<!DOCTYPE html><html><head><title>Approved</title>
<style>body{font-family:system-ui;background:#1a1a1a;color:#f4f2ec;padding:40px;text-align:center}
h1{font-size:20px}p{opacity:0.5}</style></head>
<body><h1>✓ ${member.name} approved</h1><p>${member.phone} · ${member.tier}</p>
<p><a href="/api/pwa/admin/approve?password=${password}" style="color:#f4f2ec">← Back to list</a></p></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(
      `<!DOCTYPE html><html><head><title>Error</title>
<style>body{font-family:system-ui;background:#1a1a1a;color:#f4f2ec;padding:40px}
h1{font-size:20px}pre{opacity:0.5;white-space:pre-wrap;font-size:13px}</style></head>
<body><h1>Error</h1><pre>${message}</pre></body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}
