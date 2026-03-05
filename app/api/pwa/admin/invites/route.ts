import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "visit2026";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const password = request.nextUrl.searchParams.get("password");
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const memberId = request.nextUrl.searchParams.get("memberId");
  const grant = request.nextUrl.searchParams.get("grant");

  // Grant invite allowance
  if (memberId && grant) {
    const count = parseInt(grant, 10);
    if (isNaN(count) || count < 0) {
      return NextResponse.json({ error: "Invalid grant amount" }, { status: 400 });
    }

    const member = await prisma.member.update({
      where: { id: memberId },
      data: { inviteAllowance: count },
      select: { id: true, name: true, inviteAllowance: true },
    });

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        name: member.name,
        inviteAllowance: member.inviteAllowance,
      },
    });
  }

  // Show invite tree
  const members = await prisma.member.findMany({
    where: {
      OR: [
        { inviteAllowance: { gt: 0 } },
        { invitedBy: { not: null } },
      ],
    },
    select: {
      id: true,
      name: true,
      phone: true,
      tier: true,
      inviteAllowance: true,
      invitedBy: true,
      appAccess: true,
      generatedInvites: {
        select: {
          token: true,
          status: true,
          createdAt: true,
          usedAt: true,
          usedBy: true,
          invitee: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  // Build HTML
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Visit Invites</title>
<style>
  body { font-family: system-ui; background: #1a1a1a; color: #f4f2ec; padding: 20px; max-width: 600px; margin: 0 auto; }
  h1 { font-size: 24px; margin-bottom: 24px; }
  .member { background: rgba(244,242,236,0.05); padding: 16px; margin-bottom: 12px; border-radius: 8px; }
  .member-name { font-size: 18px; font-weight: 700; }
  .meta { font-size: 12px; opacity: 0.5; margin-top: 4px; }
  .invite { padding: 6px 0; font-size: 13px; border-top: 1px solid rgba(244,242,236,0.06); margin-top: 6px; }
  .pending { color: #f39c12; }
  .used { color: #27ae60; }
  .expired { color: #e74c3c; }
  .guest { background: rgba(244,242,236,0.03); padding: 12px 16px; margin-bottom: 8px; border-radius: 8px; border-left: 3px solid rgba(244,242,236,0.1); }
</style></head><body>
<h1>Invite Management</h1>
${members
  .filter((m) => m.inviteAllowance > 0)
  .map((m) => {
    const used = m.generatedInvites.filter((i) => i.status === "used").length;
    return `<div class="member">
      <div class="member-name">${m.name}</div>
      <div class="meta">${m.tier} · ${m.inviteAllowance} allowance · ${m.generatedInvites.length} generated · ${used} used</div>
      ${m.generatedInvites
        .map(
          (i) =>
            `<div class="invite"><span class="${i.status}">${i.status}</span> — ${i.invitee?.name || i.usedBy || "pending"} · ${new Date(i.createdAt).toLocaleDateString()}</div>`
        )
        .join("")}
    </div>`;
  })
  .join("")}

<h2 style="margin-top:32px;font-size:18px;">Guests (invited members)</h2>
${members
  .filter((m) => m.invitedBy)
  .map((m) => {
    const inviter = members.find((x) => x.id === m.invitedBy);
    return `<div class="guest">
      <div class="member-name">${m.name}</div>
      <div class="meta">Guest of ${inviter?.name || m.invitedBy} · ${m.phone || "no phone"}</div>
    </div>`;
  })
  .join("") || '<div class="meta">None yet</div>'}

</body></html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
