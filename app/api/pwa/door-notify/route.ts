import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const doorUrl = process.env.VISIT_DOOR_URL;
  if (!doorUrl) {
    return NextResponse.json({ success: true });
  }

  try {
    const { memberId, memberName, memberEmail, tier } = await request.json();

    await fetch(`${doorUrl}/api/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId,
        memberName,
        memberEmail: memberEmail || "",
        tier: tier || "",
        isNew: false,
      }),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
