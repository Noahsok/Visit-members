import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/pwa-auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

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

  const member = await prisma.member.findUnique({
    where: { id: payload.memberId },
    select: { inviteAllowance: true },
  });

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const invites = await prisma.inviteToken.findMany({
    where: { generatedBy: payload.memberId },
    orderBy: { createdAt: "desc" },
    select: {
      token: true,
      status: true,
      createdAt: true,
      usedAt: true,
      expiresAt: true,
      invitee: {
        select: { name: true, phone: true, tier: true, createdAt: true },
      },
    },
  });

  const usedCount = invites.filter((i) => i.status === "used").length;

  return NextResponse.json({
    allowance: member.inviteAllowance,
    remaining: member.inviteAllowance,
    used: usedCount,
    invites: invites.map((i) => ({
      token: i.token,
      status: i.status,
      createdAt: i.createdAt,
      usedAt: i.usedAt,
      expiresAt: i.expiresAt,
      inviteeName: i.invitee?.name || null,
      inviteePhone: i.invitee?.phone || null,
      inviteeTier: i.invitee?.tier || null,
      inviteeJoinedAt: i.invitee?.createdAt || null,
    })),
  });
}

export async function POST(request: NextRequest) {
  const token = extractToken(request.headers.get("authorization"));
  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const member = await prisma.member.findUnique({
    where: { id: payload.memberId },
    select: { inviteAllowance: true },
  });

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  if (member.inviteAllowance <= 0) {
    return NextResponse.json(
      { error: "No invites remaining" },
      { status: 403 }
    );
  }

  const inviteToken = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Create invite token and decrement allowance in one transaction
  await prisma.$transaction([
    prisma.inviteToken.create({
      data: {
        token: inviteToken,
        generatedBy: payload.memberId,
        expiresAt,
      },
    }),
    prisma.member.update({
      where: { id: payload.memberId },
      data: { inviteAllowance: { decrement: 1 } },
    }),
  ]);

  const baseUrl = request.headers.get("x-forwarded-host")
    ? `https://${request.headers.get("x-forwarded-host")}`
    : new URL(request.url).origin;

  return NextResponse.json({
    token: inviteToken,
    inviteUrl: `${baseUrl}/invite/${inviteToken}`,
    remaining: member.inviteAllowance - 1,
  });
}
