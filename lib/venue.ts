import { prisma } from "./prisma";

let cachedVenueId: string | null = null;

/**
 * Get the default venue ID from the slug in env.
 * Cached after first call.
 */
export async function getDefaultVenueId(): Promise<string> {
  if (cachedVenueId) return cachedVenueId;

  const slug = process.env.DEFAULT_VENUE_SLUG || "newburgh";
  const venue = await prisma.venue.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!venue) throw new Error(`Venue not found: ${slug}`);
  cachedVenueId = venue.id;
  return venue.id;
}
