import { NextRequest, NextResponse } from "next/server";
import { searchSquareCustomers, getSquareMemberDetails } from "@/lib/square";
import { signToken } from "@/lib/pwa-auth";
import { prisma } from "@/lib/prisma";
import { getDefaultVenueId } from "@/lib/venue";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    // Strip to digits only
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    const venueId = await getDefaultVenueId();

    // Search Square by phone
    const matches = await searchSquareCustomers(digits);

    if (matches.length > 0) {
      // Square member found — upsert locally
      const match = matches[0];
      const details = await getSquareMemberDetails(match.squareId);
      if (!details) {
        return NextResponse.json({ error: "Could not retrieve member details" }, { status: 500 });
      }

      const member = await prisma.member.upsert({
        where: { squareCustomerId: details.squareId },
        update: {
          name: `${details.firstName} ${details.lastName}`.trim(),
          email: details.email || undefined,
          phone: details.phone || undefined,
          tier: details.tier,
          expirationDate: details.expiration ? new Date(details.expiration) : undefined,
        },
        create: {
          squareCustomerId: details.squareId,
          name: `${details.firstName} ${details.lastName}`.trim(),
          email: details.email || undefined,
          phone: details.phone || undefined,
          tier: details.tier,
          expirationDate: details.expiration ? new Date(details.expiration) : undefined,
          guestAllowance: details.tier === "enthusiast" ? 2 : 0,
        },
      });

      const token = await signToken({
        memberId: member.id,
        squareCustomerId: details.squareId!,
        tier: details.tier,
        name: member.name,
        venueId,
      });

      const nameParts = member.name.split(" ");
      return NextResponse.json({
        token,
        member: {
          id: member.id,
          name: member.name,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          tier: member.tier,
          guestAllowance: member.guestAllowance,
          joinedAt: member.joinedAt,
          expirationDate: member.expirationDate,
        },
      });
    }

    // No Square match — check local DB for invited members
    const localMember = await prisma.member.findFirst({
      where: {
        phone: { contains: digits },
        squareCustomerId: null,
        appAccess: "approved",
      },
    });

    if (!localMember) {
      return NextResponse.json(
        { error: "No membership found for this phone number" },
        { status: 404 }
      );
    }

    const token = await signToken({
      memberId: localMember.id,
      squareCustomerId: null,
      tier: localMember.tier as "classic" | "enthusiast",
      name: localMember.name,
      venueId,
    });

    const nameParts = localMember.name.split(" ");
    return NextResponse.json({
      token,
      member: {
        id: localMember.id,
        name: localMember.name,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        tier: localMember.tier,
        guestAllowance: localMember.guestAllowance,
        joinedAt: localMember.joinedAt,
        expirationDate: localMember.expirationDate,
      },
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
