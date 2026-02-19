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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const checkIn = await prisma.checkIn.findFirst({
    where: {
      memberId: payload.memberId,
      venueId: payload.venueId,
      checkedInAt: { gte: today, lt: tomorrow },
      checkedOutAt: null,
    },
  });

  return NextResponse.json({
    isCheckedIn: !!checkIn,
    checkInId: checkIn?.id || null,
    guestCount: checkIn?.guestCount || 0,
  });
}
