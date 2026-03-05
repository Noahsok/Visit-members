import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const invite = await prisma.inviteToken.findUnique({
    where: { token },
    include: {
      generator: { select: { name: true } },
    },
  });

  if (!invite) {
    return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
  }

  if (invite.status === "used") {
    return NextResponse.json(
      { error: "This invite has already been used" },
      { status: 410 }
    );
  }

  if (invite.status === "revoked") {
    return NextResponse.json(
      { error: "This invite has been revoked" },
      { status: 410 }
    );
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    // Mark as expired
    await prisma.inviteToken.update({
      where: { token },
      data: { status: "expired" },
    });
    return NextResponse.json(
      { error: "This invite has expired" },
      { status: 410 }
    );
  }

  // Format inviter name as "First L."
  const nameParts = invite.generator.name.split(" ");
  const inviterName =
    nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
      : nameParts[0];

  return NextResponse.json({
    valid: true,
    inviterName,
  });
}
