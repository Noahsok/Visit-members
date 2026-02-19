import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultVenueId } from "@/lib/venue";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "visit2026";

export const dynamic = "force-dynamic";

/**
 * POST: Create/update exhibition with artworks.
 * Body: { password, artistName, title, startDate, endDate, artworks: [{title, medium, year, price, imageUrl}] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, artistName, title, startDate, endDate, artworks = [] } = body;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const venueId = await getDefaultVenueId();

    // Deactivate any current exhibition
    await prisma.exhibition.updateMany({
      where: { venueId, isActive: true },
      data: { isActive: false },
    });

    // Find or create artist
    let artist = await prisma.artist.findFirst({
      where: { name: artistName },
    });
    if (!artist) {
      artist = await prisma.artist.create({
        data: { name: artistName },
      });
    }

    // Create exhibition
    const exhibition = await prisma.exhibition.create({
      data: {
        artistId: artist.id,
        venueId,
        title,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
        artworks: {
          create: artworks.map((a: any, i: number) => ({
            title: a.title,
            medium: a.medium || null,
            year: a.year || null,
            price: a.price || null,
            imageUrl: a.imageUrl || null,
            sortOrder: i,
          })),
        },
      },
      include: { artworks: true, artist: true },
    });

    return NextResponse.json({ success: true, exhibition });
  } catch (error) {
    console.error("Admin exhibition error:", error);
    return NextResponse.json({ error: "Failed to save exhibition" }, { status: 500 });
  }
}
