import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/pwa-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const token = extractToken(request.headers.get("authorization"));
  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { guestCount = 0 } = await request.json();

  // Enforce guest allowance
  const member = await prisma.member.findUnique({
    where: { id: payload.memberId },
    select: { guestAllowance: true },
  });

  const allowedGuests = member?.guestAllowance ?? 0;
  const guests = Math.min(Math.max(0, guestCount), allowedGuests);

  // Prevent duplicate check-in today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existing = await prisma.checkIn.findFirst({
    where: {
      memberId: payload.memberId,
      venueId: payload.venueId,
      checkedInAt: { gte: today, lt: tomorrow },
      checkedOutAt: null,
    },
  });

  if (existing) {
    return NextResponse.json({
      success: true,
      message: "Already checked in",
      checkInId: existing.id,
    });
  }

  const checkIn = await prisma.checkIn.create({
    data: {
      memberId: payload.memberId,
      venueId: payload.venueId,
      guestCount: guests,
      checkedInBy: "pwa",
    },
  });

  return NextResponse.json({
    success: true,
    checkInId: checkIn.id,
  });
}

export async function DELETE(request: NextRequest) {
  const token = extractToken(request.headers.get("authorization"));
  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Find today's active check-in
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existing = await prisma.checkIn.findFirst({
    where: {
      memberId: payload.memberId,
      venueId: payload.venueId,
      checkedInAt: { gte: today, lt: tomorrow },
      checkedOutAt: null,
    },
  });

  if (!existing) {
    return NextResponse.json({ success: true, message: "Not checked in" });
  }

  await prisma.checkIn.update({
    where: { id: existing.id },
    data: { checkedOutAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
