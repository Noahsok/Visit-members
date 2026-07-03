import { Client } from "square/legacy";

export const squareClient = new Client({
  accessToken: (process.env.SQUARE_ACCESS_TOKEN || "").trim(),
  environment: "production",
});

/**
 * Search Square customers by name, email, or phone.
 * Uses Square's search API with fuzzy matching.
 */
export async function searchSquareCustomers(query: string) {
  const parts = query.trim().split(/\s+/);

  const filters: any[] = [];

  if (parts.length >= 2) {
    // Try first + last name exact filter
    filters.push({
      exact: { attribute: "given_name", value: parts[0] },
    });
    filters.push({
      exact: { attribute: "family_name", value: parts.slice(1).join(" ") },
    });
  }

  try {
    const { result } = await squareClient.customersApi.searchCustomers({
      query: {
        filter: {
          ...(parts.length >= 2
            ? {}
            : {}),
        },
      },
    });

    const allCustomers = result.customers || [];
    const q = query.toLowerCase();
    const qParts = q.split(/\s+/);

    const matched = allCustomers
      .filter((c: any) => {
        const first = (c.givenName || "").toLowerCase();
        const last = (c.familyName || "").toLowerCase();

        if (qParts.length >= 2) {
          return (
            first.includes(qParts[0]) &&
            last.includes(qParts[qParts.length - 1])
          );
        }
        const fullName = `${first} ${last}`;
        const email = (c.emailAddress || "").toLowerCase();
        const phone = (c.phoneNumber || "").replace(/\D/g, "");
        const qClean = q.replace(/\D/g, "");

        return (
          fullName.includes(q) ||
          email.includes(q) ||
          (qClean.length >= 7 && phone.includes(qClean))
        );
      })
      .slice(0, 20)
      .map((c: any) => ({
        squareId: c.id,
        firstName: c.givenName || "",
        lastName: c.familyName || "",
        email: c.emailAddress || "",
        phone: c.phoneNumber || "",
      }));

    return matched;
  } catch (e) {
    console.error("Square search error, falling back to list:", e);

    // Fallback: list all and filter
    const allCustomers: any[] = [];
    let cursor: string | undefined;
    while (true) {
      const { result } = await squareClient.customersApi.listCustomers(cursor);
      allCustomers.push(...(result.customers || []));
      cursor = result.cursor || undefined;
      if (!cursor) break;
    }

    const q = query.toLowerCase();
    const qParts = q.split(/\s+/);

    return allCustomers
      .filter((c: any) => {
        const first = (c.givenName || "").toLowerCase();
        const last = (c.familyName || "").toLowerCase();
        if (qParts.length >= 2) {
          return first.includes(qParts[0]) && last.includes(qParts[qParts.length - 1]);
        }
        return `${first} ${last}`.includes(q);
      })
      .slice(0, 20)
      .map((c: any) => ({
        squareId: c.id,
        firstName: c.givenName || "",
        lastName: c.familyName || "",
        email: c.emailAddress || "",
        phone: c.phoneNumber || "",
      }));
  }
}

/**
 * Get full member details from Square including tier and expiration.
 */
export async function getSquareMemberDetails(customerId: string) {
  const { result } = await squareClient.customersApi.retrieveCustomer(
    customerId
  );

  const customer = result.customer;
  if (!customer) return null;

  let tier: "one" | "classic" | "enthusiast" = "classic";
  let expiration: string | null = null;

  // Tier from customer groups
  const groupIds = customer.groupIds || [];
  if (groupIds.length > 0) {
    try {
      const { result: groupsResult } =
        await squareClient.customerGroupsApi.listCustomerGroups();
      const groups = groupsResult.groups || [];
      const groupMap = new Map(groups.map((g: any) => [g.id, g.name || ""]));

      for (const gid of groupIds) {
        const groupName = (groupMap.get(gid) || "").toLowerCase();
        if (groupName.includes("enthusiast")) {
          tier = "enthusiast";
          break;
        }
        if (groupName.includes("one night")) {
          tier = "one";
          break;
        }
      }
    } catch (e) {
      console.error("Error fetching groups:", e);
    }
  }

  // Expiration from custom attributes
  try {
    const { result: defsResult } =
      await squareClient.customerCustomAttributesApi.listCustomerCustomAttributeDefinitions();
    const definitions = defsResult.customAttributeDefinitions || [];

    let expirationKey: string | null = null;
    for (const def of definitions) {
      const name = (def.name || "").toLowerCase();
      if (name.includes("expir") || name.includes("expiration")) {
        expirationKey = def.key || null;
        break;
      }
    }

    if (expirationKey) {
      try {
        const { result: attrResult } =
          await squareClient.customerCustomAttributesApi.retrieveCustomerCustomAttribute(
            customerId,
            expirationKey
          );
        const value = attrResult.customAttribute?.value;

        if (typeof value === "string" && value) {
          const isoMatch = value.match(/(\d{4}-\d{2}-\d{2})/);
          if (isoMatch) {
            expiration = isoMatch[1];
          } else {
            const parsed = new Date(value.trim());
            if (!isNaN(parsed.getTime())) {
              expiration = parsed.toISOString().split("T")[0];
            }
          }
        }
      } catch (e) {
        // Attribute might not exist for this customer
      }
    }
  } catch (e) {
    console.error("Error fetching custom attributes:", e);
  }

  // Fallback: check note field
  if (!expiration) {
    const note = customer.note || "";
    const match = note.match(/(\d{4}-\d{2}-\d{2})/);
    if (match) expiration = match[1];
  }

  return {
    squareId: customer.id,
    firstName: customer.givenName || "",
    lastName: customer.familyName || "",
    email: customer.emailAddress || "",
    phone: customer.phoneNumber || "",
    tier,
    expiration,
  };
}
