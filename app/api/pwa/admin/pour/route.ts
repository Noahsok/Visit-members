import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultVenueId } from "@/lib/venue";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "visit2026";

export const dynamic = "force-dynamic";

/**
 * POST: Set the active featured pour.
 * Body: { password, drinkName, spec, tastingNote, imageUrl, recipeId? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, drinkName, spec, tastingNote, imageUrl, recipeId } = body;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const venueId = await getDefaultVenueId();

    // Deactivate current
    await prisma.featuredPour.updateMany({
      where: { venueId, isActive: true },
      data: { isActive: false },
    });

    // Create new active pour
    const pour = await prisma.featuredPour.create({
      data: {
        venueId,
        drinkName,
        spec: spec || null,
        tastingNote: tastingNote || null,
        imageUrl: imageUrl || null,
        recipeId: recipeId || null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, pour });
  } catch (error) {
    console.error("Admin pour error:", error);
    return NextResponse.json({ error: "Failed to save featured pour" }, { status: 500 });
  }
}
