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

  const tip = await prisma.insiderTip.findFirst({
    where: { venueId, isActive: true },
    orderBy: { updatedAt: "desc" },
  });

  if (!tip) {
    return NextResponse.json({ tip: null });
  }

  return NextResponse.json({
    tip: {
      id: tip.id,
      title: tip.title,
      description: tip.description,
    },
  });
}
