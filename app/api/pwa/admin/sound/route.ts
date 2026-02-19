import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultVenueId } from "@/lib/venue";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "visit2026";

export const dynamic = "force-dynamic";

/**
 * POST: Set the active DJ/sound info.
 * Body: { password, djName, genre }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, djName, genre } = body;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const venueId = await getDefaultVenueId();

    // Deactivate current
    await prisma.sound.updateMany({
      where: { venueId, isActive: true },
      data: { isActive: false },
    });

    // Create new active sound
    const sound = await prisma.sound.create({
      data: {
        venueId,
        djName,
        genre: genre || null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, sound });
  } catch (error) {
    console.error("Admin sound error:", error);
    return NextResponse.json({ error: "Failed to save sound" }, { status: 500 });
  }
}
