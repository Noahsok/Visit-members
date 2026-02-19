import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/pwa-auth";
import { prisma } from "@/lib/prisma";
import { getDefaultVenueId } from "@/lib/venue";

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

  const venueId = await getDefaultVenueId();

  const pour = await prisma.featuredPour.findFirst({
    where: { venueId, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  if (!pour) {
    return NextResponse.json({ pour: null });
  }

  return NextResponse.json({
    pour: {
      id: pour.id,
      drinkName: pour.drinkName,
      spec: pour.spec,
      tastingNote: pour.tastingNote,
      imageUrl: pour.imageUrl,
    },
  });
}
