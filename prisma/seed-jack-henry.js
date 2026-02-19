/**
 * Seed script: Jack Henry exhibition at Visit Newburgh
 *
 * Run with: node prisma/seed-jack-henry.js
 *
 * Prerequisites:
 *   - .env with DATABASE_URL set
 *   - `npx prisma generate` already run
 *   - Artwork images placed in /public/artwork/
 */

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const ARTIST_NAME = "Jack Henry";

const EXHIBITION = {
  title: "Jack Henry",
  statement:
    "Works exploring presence, absence, and the natural world. Gouache and graphite on embossed paper with artist-made frames of cement and found objects.",
  startDate: new Date("2025-02-21"),
  endDate: new Date("2025-04-01"),
  isActive: true,
};

const ARTWORKS = [
  {
    title: "No One Behind",
    medium:
      "Gouache and graphite on embossed paper, artist frame: cement and found objects",
    year: "2024",
    imageUrl: "/artwork/jack-henry-no-one-behind.jpg",
    sortOrder: 1,
  },
  {
    title: "Chain",
    medium:
      "Gouache and graphite on embossed paper, artist frame: cement and found objects",
    year: "2024",
    imageUrl: "/artwork/jack-henry-chain.jpg",
    sortOrder: 2,
  },
  {
    title: "Always Forever On One",
    medium:
      "Graphite on embossed paper, artist frame: cement and found objects",
    year: "2024",
    imageUrl: "/artwork/jack-henry-always-forever-on-one.jpg",
    sortOrder: 3,
  },
  {
    title: "No Leave",
    medium:
      "Gouache and graphite on embossed paper, artist frame: cement and found objects",
    year: "2024",
    imageUrl: "/artwork/jack-henry-no-leave.jpg",
    sortOrder: 4,
  },
  {
    title: "No Trace",
    medium:
      "Gouache and graphite on embossed paper, artist frame: cement and found objects",
    year: "2024",
    imageUrl: "/artwork/jack-henry-no-trace.jpg",
    sortOrder: 5,
  },
  {
    title: "One Gets Behind",
    medium:
      "Graphite on embossed paper, artist frame: cement and found objects",
    year: "2024",
    imageUrl: "/artwork/jack-henry-one-gets-behind.jpg",
    sortOrder: 6,
  },
  {
    title: "No One",
    medium:
      "Graphite on embossed paper, artist frame: cement and found objects",
    year: "2024",
    imageUrl: "/artwork/jack-henry-no-one.jpg",
    sortOrder: 7,
  },
  {
    title: "Fence",
    medium:
      "Gouache and graphite on embossed paper, artist frame: cement and found objects",
    year: "2024",
    imageUrl: "/artwork/jack-henry-fence.jpg",
    sortOrder: 8,
  },
];

async function main() {
  // Find the Newburgh venue
  const venue = await prisma.venue.findFirst({
    where: {
      OR: [{ slug: "newburgh" }, { name: { contains: "Newburgh" } }],
    },
  });

  if (!venue) {
    console.error("Could not find Visit Newburgh venue. Aborting.");
    process.exit(1);
  }

  console.log(`Found venue: ${venue.name} (${venue.id})`);

  // Check if exhibition already exists
  const existing = await prisma.exhibition.findFirst({
    where: {
      venueId: venue.id,
      title: EXHIBITION.title,
    },
  });

  if (existing) {
    console.log(
      `Exhibition "${EXHIBITION.title}" already exists (${existing.id}). Skipping.`
    );
    return;
  }

  // Upsert artist
  let artist = await prisma.artist.findFirst({
    where: { name: ARTIST_NAME },
  });

  if (!artist) {
    artist = await prisma.artist.create({
      data: { name: ARTIST_NAME },
    });
    console.log(`Created artist: ${artist.name} (${artist.id})`);
  } else {
    console.log(`Found existing artist: ${artist.name} (${artist.id})`);
  }

  // Create exhibition with artworks
  const exhibition = await prisma.exhibition.create({
    data: {
      artistId: artist.id,
      venueId: venue.id,
      title: EXHIBITION.title,
      statement: EXHIBITION.statement,
      startDate: EXHIBITION.startDate,
      endDate: EXHIBITION.endDate,
      isActive: EXHIBITION.isActive,
      artworks: {
        create: ARTWORKS.map((a) => ({
          title: a.title,
          medium: a.medium,
          year: a.year,
          imageUrl: a.imageUrl,
          sortOrder: a.sortOrder,
        })),
      },
    },
    include: { artworks: true },
  });

  console.log(
    `Created exhibition: "${exhibition.title}" (${exhibition.id})`
  );
  console.log(`Created ${exhibition.artworks.length} artworks:`);
  exhibition.artworks.forEach((a, i) => {
    console.log(`  ${i + 1}. ${a.title} → ${a.imageUrl}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
