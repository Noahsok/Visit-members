import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/pwa-auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

async function checkAdmin(request: NextRequest) {
  const token = extractToken(request.headers.get("authorization"));
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  const member = await prisma.member.findUnique({
    where: { id: payload.memberId },
    select: { isAdmin: true },
  });
  if (!member?.isAdmin) return null;
  return payload;
}

export async function GET(request: NextRequest) {
  const payload = await checkAdmin(request);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const members = await prisma.member.findMany({
    where: {
      OR: [
        { inviteAllowance: { gt: 0 } },
        { invitedBy: { not: null } },
        { generatedInvites: { some: {} } },
      ],
    },
    select: {
      id: true,
      name: true,
      phone: true,
      tier: true,
      inviteAllowance: true,
      invitedBy: true,
      appAccess: true,
      createdAt: true,
      generatedInvites: {
        select: {
          id: true,
          token: true,
          status: true,
          createdAt: true,
          usedAt: true,
          usedBy: true,
          expiresAt: true,
          invitee: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const inviters = members
    .filter((m) => m.inviteAllowance > 0 || m.generatedInvites.length > 0)
    .map((m) => ({
      id: m.id,
      name: m.name,
      tier: m.tier,
      inviteAllowance: m.inviteAllowance,
      invites: m.generatedInvites.map((i) => ({
        id: i.id,
        token: i.token,
        status: i.status,
        inviteeName: i.invitee?.name || null,
        createdAt: i.createdAt,
        expiresAt: i.expiresAt,
      })),
    }));

  const guests = members
    .filter((m) => m.invitedBy)
    .map((m) => {
      const inviter = members.find((x) => x.id === m.invitedBy);
      return {
        id: m.id,
        name: m.name,
        phone: m.phone,
        inviterName: inviter?.name || m.invitedBy,
        createdAt: m.createdAt,
      };
    });

  // Count stats from all invite tokens
  const allInvites = members.flatMap((m) => m.generatedInvites);
  const stats = {
    totalInviters: inviters.length,
    totalGuests: guests.length,
    pending: allInvites.filter((i) => i.status === "pending").length,
    used: allInvites.filter((i) => i.status === "used").length,
    expired: allInvites.filter((i) => i.status === "expired").length,
    revoked: allInvites.filter((i) => i.status === "revoked").length,
  };

  return NextResponse.json({ inviters, guests, stats });
}

export async function POST(request: NextRequest) {
  const payload = await checkAdmin(request);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action } = body;

  if (action === "revoke_token") {
    const { tokenId } = body;
    const token = await prisma.inviteToken.findUnique({ where: { id: tokenId } });
    if (!token || token.status !== "pending") {
      return NextResponse.json({ error: "Token not found or not pending" }, { status: 400 });
    }
    await prisma.inviteToken.update({
      where: { id: tokenId },
      data: { status: "revoked" },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "set_allowance") {
    const { memberId, count } = body;
    if (typeof count !== "number" || count < 0) {
      return NextResponse.json({ error: "Invalid count" }, { status: 400 });
    }
    await prisma.member.update({
      where: { id: memberId },
      data: { inviteAllowance: count },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "delete_guest") {
    const { memberId } = body;
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { invitedBy: true },
    });
    if (!member?.invitedBy) {
      return NextResponse.json({ error: "Not a guest member" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Delete related records
      await tx.pushSubscription.deleteMany({ where: { memberId } });
      await tx.checkIn.deleteMany({ where: { memberId } });
      await tx.renewalRequest.deleteMany({ where: { memberId } });

      // Reset the invite token that created this guest
      await tx.inviteToken.updateMany({
        where: { usedByMemberId: memberId },
        data: { usedByMemberId: null, usedBy: null, usedAt: null, status: "pending" },
      });

      // Delete the member
      await tx.member.delete({ where: { id: memberId } });
    });

    return NextResponse.json({ success: true });
  }

  if (action === "generate_invite") {
    const { memberId } = body;
    const inviteToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.inviteToken.create({
      data: {
        token: inviteToken,
        generatedBy: memberId,
        expiresAt,
      },
    });

    const baseUrl = request.headers.get("x-forwarded-host")
      ? `https://${request.headers.get("x-forwarded-host")}`
      : new URL(request.url).origin;

    return NextResponse.json({
      success: true,
      token: inviteToken,
      inviteUrl: `${baseUrl}/invite/${inviteToken}`,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
