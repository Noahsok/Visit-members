import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultVenueId } from "@/lib/venue";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "visit2026";

export const dynamic = "force-dynamic";

/**
 * POST: Set the active insider tip.
 * Body: { password, title, description }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, title, description } = body;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const venueId = await getDefaultVenueId();

    // Deactivate current
    await prisma.insiderTip.updateMany({
      where: { venueId, isActive: true },
      data: { isActive: false },
    });

    // Create new active tip
    const tip = await prisma.insiderTip.create({
      data: {
        venueId,
        title,
        description: description || null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, tip });
  } catch (error) {
    console.error("Admin tip error:", error);
    return NextResponse.json({ error: "Failed to save insider tip" }, { status: 500 });
  }
}
