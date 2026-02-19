import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/pwa-auth";
import { getSquareMemberDetails } from "@/lib/square";
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
    // Get fresh data from Square
    const details = await getSquareMemberDetails(payload.squareCustomerId);
    if (!details) {
      return NextResponse.json({ error: "Member not found in Square" }, { status: 404 });
    }

    // Update local record
    const member = await prisma.member.update({
      where: { id: payload.memberId },
      data: {
        name: `${details.firstName} ${details.lastName}`.trim(),
        email: details.email || undefined,
        phone: details.phone || undefined,
        tier: details.tier,
        expirationDate: details.expiration ? new Date(details.expiration) : undefined,
      },
    });

    return NextResponse.json({
      member: {
        id: member.id,
        name: member.name,
        firstName: details.firstName,
        lastName: details.lastName,
        tier: member.tier,
        guestAllowance: member.guestAllowance,
        joinedAt: member.joinedAt,
        expirationDate: member.expirationDate,
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ error: "Failed to fetch member data" }, { status: 500 });
  }
}
