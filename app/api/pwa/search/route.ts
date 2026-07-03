import { NextRequest, NextResponse } from "next/server";
import { searchSquareCustomers, getSquareMemberDetails } from "@/lib/square";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q")?.trim();
    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: "Search query too short" },
        { status: 400 }
      );
    }

    // Search Square
    const matches = await searchSquareCustomers(q);

    if (matches.length === 0) {
      return NextResponse.json({ found: false });
    }

    const match = matches[0];
    const details = await getSquareMemberDetails(match.squareId);

    if (!details) {
      return NextResponse.json({ found: false });
    }

    // Check local DB for extra info
    const localMember = await prisma.member.findFirst({
      where: { squareCustomerId: details.squareId },
    });

    const expiration = localMember?.expirationDate ||
      (details.expiration ? new Date(details.expiration) : null);
    const active = expiration ? expiration > new Date() : false;

    return NextResponse.json({
      found: true,
      member: {
        name: `${details.firstName} ${details.lastName}`.trim(),
        firstName: details.firstName,
        lastName: details.lastName,
        email: details.email,
        phone: details.phone,
        tier: localMember?.tier || details.tier,
        expiration: expiration?.toISOString().split("T")[0] || null,
        active,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
