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

  const config = await prisma.venueConfig.findUnique({
    where: { venueId },
    include: {
      events: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!config) {
    return NextResponse.json({ events: [] });
  }

  return NextResponse.json({
    events: config.events.map((e) => ({
      id: e.id,
      date: e.date,
      event: e.event,
    })),
  });
}
