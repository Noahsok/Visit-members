import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/pwa-auth";
import { prisma } from "@/lib/prisma";

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

  try {
    // Read from local DB — Square data was synced at login
    const member = await prisma.member.findUnique({
      where: { id: payload.memberId },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Count total check-ins for this member
    const visitCount = await prisma.checkIn.count({
      where: { memberId: member.id },
    });

    const nameParts = (member.name || "").split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Resolve inviter name if this is a guest
    let inviterName: string | null = null;
    if (member.invitedBy) {
      const inviter = await prisma.member.findUnique({
        where: { id: member.invitedBy },
        select: { name: true },
      });
      if (inviter) {
        inviterName = inviter.name.split(" ")[0] || inviter.name;
      }
    }

    return NextResponse.json({
      member: {
        id: member.id,
        name: member.name,
        firstName,
        lastName,
        tier: member.tier,
        guestAllowance: member.guestAllowance,
        joinedAt: member.joinedAt,
        expirationDate: member.expirationDate,
        appAccess: member.appAccess,
        visitCount,
        inviteAllowance: member.inviteAllowance,
        invitedBy: member.invitedBy,
        inviterName,
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ error: "Failed to fetch member data" }, { status: 500 });
  }
}
