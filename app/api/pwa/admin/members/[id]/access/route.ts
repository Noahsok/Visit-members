import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "visit2026";

export const dynamic = "force-dynamic";

const VALID_ACCESS = ["none", "preview", "approved"] as const;

/**
 * PATCH: Update a member's app access level.
 * Body: { password, appAccess: "none" | "preview" | "approved" }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { password, appAccess } = body;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    if (!VALID_ACCESS.includes(appAccess)) {
      return NextResponse.json(
        { error: `Invalid access level. Must be one of: ${VALID_ACCESS.join(", ")}` },
        { status: 400 }
      );
    }

    const member = await prisma.member.update({
      where: { id },
      data: { appAccess },
      select: { id: true, name: true, appAccess: true },
    });

    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }
    console.error("Admin access update error:", error);
    return NextResponse.json({ error: "Failed to update access" }, { status: 500 });
  }
}
