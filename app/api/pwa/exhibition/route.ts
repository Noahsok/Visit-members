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

  const exhibition = await prisma.exhibition.findFirst({
    where: { venueId, isActive: true },
    include: {
      artist: { select: { name: true } },
      artworks: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { startDate: "desc" },
  });

  if (!exhibition) {
    return NextResponse.json({ exhibition: null });
  }

  return NextResponse.json({
    exhibition: {
      id: exhibition.id,
      artistName: exhibition.artist.name,
      title: exhibition.title,
      statement: exhibition.statement,
      startDate: exhibition.startDate,
      endDate: exhibition.endDate,
      artworks: exhibition.artworks.map((a) => ({
        id: a.id,
        title: a.title,
        medium: a.medium,
        year: a.year,
        price: a.price ? Number(a.price) : null,
        imageUrl: a.imageUrl,
      })),
    },
  });
}
