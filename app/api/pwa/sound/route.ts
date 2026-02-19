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

  const sound = await prisma.sound.findFirst({
    where: { venueId, isActive: true },
  });

  if (!sound) {
    return NextResponse.json({ sound: null });
  }

  return NextResponse.json({
    sound: {
      id: sound.id,
      djName: sound.djName,
      genre: sound.genre,
    },
  });
}
