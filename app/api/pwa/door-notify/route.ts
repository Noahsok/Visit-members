import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { memberId, memberName, memberEmail, tier } = await request.json();
    const [firstName, ...rest] = (memberName || "").split(" ");
    const lastName = rest.join(" ");

    const notifications: Promise<any>[] = [];

    const doorUrl = process.env.VISIT_DOOR_URL;
    if (doorUrl) {
      notifications.push(
        fetch(`${doorUrl}/api/checkin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memberId,
            memberName,
            memberEmail: memberEmail || "",
            tier: tier || "",
            isNew: false,
          }),
        }).catch(() => {})
      );
    }

    const platformUrl = process.env.VISIT_PLATFORM_URL;
    if (platformUrl) {
      notifications.push(
        fetch(`${platformUrl}/api/join-notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName,
            lastName,
            email: memberEmail || "",
            tier: tier || "classic",
            squareCustomerId: memberId,
            isNew: false,
          }),
        }).catch(() => {})
      );
    }

    await Promise.all(notifications);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
