import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/pwa-auth";
import { squareClient } from "@/lib/square";
import { prisma } from "@/lib/prisma";
import { getDefaultVenueId } from "@/lib/venue";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const token = extractToken(request.headers.get("authorization"));
  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const { firstName, lastName, email, phone, tier } = await request.json();

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First and last name required" },
        { status: 400 }
      );
    }

    const memberTier = tier === "enthusiast" ? "enthusiast" : "classic";

    // Format phone for Square
    let formattedPhone: string | undefined;
    if (phone) {
      let digits = phone.replace(/[\s\-\(\)\.]/g, "");
      if (digits.length === 10) digits = "+1" + digits;
      else if (digits.length === 11 && digits.startsWith("1"))
        digits = "+" + digits;
      else if (!digits.startsWith("+")) digits = "+1" + digits;
      formattedPhone = digits;
    }

    // Calculate dates
    const startDate = new Date().toISOString().split("T")[0];
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    const expirationStr = expirationDate.toISOString().split("T")[0];

    const noteText = `Start: ${startDate} | Expires: ${expirationStr} | Tier: ${memberTier}`;

    // Create Square customer
    const body: any = {
      givenName: firstName,
      familyName: lastName,
      emailAddress: email || undefined,
      note: noteText,
    };
    if (formattedPhone) body.phoneNumber = formattedPhone;

    const { result } = await squareClient.customersApi.createCustomer(body);
    const customer = result.customer;
    const customerId = customer!.id!;

    // Set custom attributes (best-effort)
    try {
      const { result: defsResult } =
        await squareClient.customerCustomAttributesApi.listCustomerCustomAttributeDefinitions();
      const definitions = defsResult.customAttributeDefinitions || [];

      let startKey: string | null = null;
      let expirationKey: string | null = null;

      for (const def of definitions) {
        const name = (def.name || "").toLowerCase();
        if (name.includes("start") && !startKey) startKey = def.key || null;
        if (
          (name.includes("expir") || name.includes("expiration")) &&
          !expirationKey
        )
          expirationKey = def.key || null;
      }

      if (startKey) {
        await squareClient.customerCustomAttributesApi.upsertCustomerCustomAttribute(
          customerId,
          startKey,
          { customAttribute: { value: startDate } }
        );
      }

      if (expirationKey) {
        await squareClient.customerCustomAttributesApi.upsertCustomerCustomAttribute(
          customerId,
          expirationKey,
          { customAttribute: { value: expirationStr } }
        );
      }
    } catch (e) {
      console.error("Custom attributes error (non-fatal):", e);
    }

    // Add to customer group (best-effort)
    try {
      const { result: groupsResult } =
        await squareClient.customerGroupsApi.listCustomerGroups();
      const groups = groupsResult.groups || [];

      const targetGroup = groups.find((g: any) => {
        const name = (g.name || "").toLowerCase();
        return memberTier === "enthusiast"
          ? name.includes("enthusiast")
          : name.includes("classic");
      });

      if (targetGroup?.id) {
        await squareClient.customersApi.addGroupToCustomer(
          customerId,
          targetGroup.id
        );
      }
    } catch (e) {
      console.error("Customer group error (non-fatal):", e);
    }

    const venueId = await getDefaultVenueId();

    // Update local member record
    await prisma.member.update({
      where: { id: payload.memberId },
      data: {
        squareCustomerId: customerId,
        name: `${firstName} ${lastName}`.trim(),
        email: email || undefined,
        phone: formattedPhone || undefined,
        tier: memberTier as any,
        expirationDate,
        invitedBy: null,
        guestAllowance: memberTier === "enthusiast" ? 2 : 0,
      },
    });

    // Record in signups table
    await prisma.signup.create({
      data: {
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        venueId,
      },
    });

    return NextResponse.json({
      success: true,
      member: {
        name: `${firstName} ${lastName}`.trim(),
        tier: memberTier,
        expiration: expirationStr,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}
