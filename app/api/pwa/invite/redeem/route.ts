import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/pwa-auth";
import { prisma } from "@/lib/prisma";
import { getDefaultVenueId } from "@/lib/venue";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { token, phone, name } = await request.json();

    if (!token || !phone || !name) {
      return NextResponse.json(
        { error: "Token, phone, and name are required" },
        { status: 400 }
      );
    }

    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }

    const venueId = await getDefaultVenueId();

    // Use transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      const invite = await tx.inviteToken.findUnique({
        where: { token },
        include: { generator: { select: { id: true, name: true } } },
      });

      if (!invite) {
        throw new Error("INVALID");
      }

      if (invite.status === "used") {
        throw new Error("USED");
      }

      if (invite.status === "revoked") {
        throw new Error("REVOKED");
      }

      if (invite.expiresAt && invite.expiresAt < new Date()) {
        await tx.inviteToken.update({
          where: { token },
          data: { status: "expired" },
        });
        throw new Error("EXPIRED");
      }

      // Format phone for storage
      let formattedPhone = digits;
      if (digits.length === 10) formattedPhone = "+1" + digits;

      // Use grantAllowance from token (admin invites grant 3), otherwise 0
      const memberAllowance = invite.grantAllowance ?? 0;

      // Create member
      const member = await tx.member.create({
        data: {
          name: name.trim(),
          phone: formattedPhone,
          tier: "classic",
          appAccess: "approved",
          inviteAllowance: memberAllowance,
          guestAllowance: 0,
          invitedBy: invite.generator?.id || null,
        },
      });

      // Mark invite as used
      await tx.inviteToken.update({
        where: { token },
        data: {
          status: "used",
          usedBy: formattedPhone,
          usedByMemberId: member.id,
          usedAt: new Date(),
        },
      });

      return { member, inviterName: invite.generator?.name || "Visit" };
    });

    // Sign JWT
    const jwt = await signToken({
      memberId: result.member.id,
      squareCustomerId: null,
      tier: "classic",
      name: result.member.name,
      venueId,
    });

    const nameParts = result.member.name.split(" ");
    return NextResponse.json({
      token: jwt,
      member: {
        id: result.member.id,
        name: result.member.name,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        tier: "classic",
        guestAllowance: 0,
        joinedAt: result.member.joinedAt,
        expirationDate: null,
      },
    });
  } catch (error: any) {
    if (error.message === "INVALID") {
      return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
    }
    if (error.message === "USED") {
      return NextResponse.json(
        { error: "This invite has already been used" },
        { status: 410 }
      );
    }
    if (error.message === "EXPIRED") {
      return NextResponse.json(
        { error: "This invite has expired" },
        { status: 410 }
      );
    }
    if (error.message === "REVOKED") {
      return NextResponse.json(
        { error: "This invite has been revoked" },
        { status: 410 }
      );
    }
    console.error("Redeem error:", error);
    return NextResponse.json(
      { error: "Failed to redeem invite" },
      { status: 500 }
    );
  }
}
