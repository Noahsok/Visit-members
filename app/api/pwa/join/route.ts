import { NextRequest, NextResponse } from "next/server";
import { squareClient } from "@/lib/square";
import { prisma } from "@/lib/prisma";
import { getDefaultVenueId } from "@/lib/venue";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, phone, tier } = await request.json();

    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: "First name, last name, and phone are required" },
        { status: 400 }
      );
    }

    const memberTier =
      tier === "enthusiast" ? "enthusiast" : tier === "one" ? "one" : "classic";

    // Format phone for Square (+1XXXXXXXXXX)
    let digits = phone.replace(/\D/g, "");
    if (digits.length === 10) digits = "+1" + digits;
    else if (digits.length === 11 && digits.startsWith("1"))
      digits = "+" + digits;
    else if (!digits.startsWith("+")) digits = "+1" + digits;
    const formattedPhone = digits;

    // Calculate dates
    const now = new Date();
    const startDate = now.toISOString().split("T")[0];

    let expirationDate: Date;
    if (memberTier === "one") {
      // Expires tomorrow at 6am
      expirationDate = new Date(now);
      expirationDate.setDate(expirationDate.getDate() + 1);
      expirationDate.setHours(6, 0, 0, 0);
    } else {
      // One year from now
      expirationDate = new Date(now);
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    }
    const expirationStr = expirationDate.toISOString().split("T")[0];

    const noteText = `Start: ${startDate} | Expires: ${expirationStr} | Tier: ${memberTier}`;

    // Check if this phone already exists in Square
    const allCustomers: any[] = [];
    let cursor: string | undefined;
    while (true) {
      const { result: listResult } = await squareClient.customersApi.listCustomers(cursor);
      allCustomers.push(...(listResult.customers || []));
      cursor = listResult.cursor || undefined;
      if (!cursor) break;
    }
    const phoneDigits = phone.replace(/\D/g, "");
    const existingCustomer = phoneDigits.length >= 7
      ? allCustomers.find((c: any) => {
          const cp = (c.phoneNumber || "").replace(/\D/g, "");
          if (!cp || cp.length < 7) return false;
          return cp.slice(-10) === phoneDigits.slice(-10);
        })
      : undefined;

    let customerId: string;

    if (existingCustomer) {
      // Update existing Square customer
      await squareClient.customersApi.updateCustomer(existingCustomer.id!, {
        givenName: firstName,
        familyName: lastName,
        emailAddress: email || undefined,
        note: noteText,
      });
      customerId = existingCustomer.id!;
    } else {
      // Create new Square customer
      const body: any = {
        givenName: firstName,
        familyName: lastName,
        emailAddress: email || undefined,
        phoneNumber: formattedPhone,
        note: noteText,
      };
      const { result } = await squareClient.customersApi.createCustomer(body);
      customerId = result.customer!.id!;
    }

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
        if (memberTier === "enthusiast") return name.includes("enthusiast");
        if (memberTier === "one") return name.includes("one night");
        return name.includes("classic");
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

    let venueId: string | null = null;
    try {
      venueId = await getDefaultVenueId();
    } catch {}

    // Upsert local member record
    const guestAllowance =
      memberTier === "enthusiast" ? 3 : 0;

    await prisma.member.upsert({
      where: { squareCustomerId: customerId },
      update: {
        name: `${firstName} ${lastName}`.trim(),
        email: email || undefined,
        phone: formattedPhone,
        tier: memberTier as any,
        expirationDate,
        guestAllowance,
      },
      create: {
        squareCustomerId: customerId,
        name: `${firstName} ${lastName}`.trim(),
        email: email || undefined,
        phone: formattedPhone,
        tier: memberTier as any,
        expirationDate,
        guestAllowance,
        appAccess: "approved",
      },
    });

    // Record in signups table (skip if no venue configured)
    if (venueId) {
      await prisma.signup.create({
        data: {
          firstName,
          lastName,
          email: email || null,
          phone: phone || null,
          venueId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      member: {
        name: `${firstName} ${lastName}`.trim(),
        tier: memberTier,
        expiration: expirationStr,
        joined: startDate,
      },
    });
  } catch (error) {
    console.error("Join error:", error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
