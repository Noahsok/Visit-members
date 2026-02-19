import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/pwa-auth";
import { prisma } from "@/lib/prisma";
import { getDefaultVenueId } from "@/lib/venue";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = extractToken(request.headers.get("authorization"));
  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const venueId = await getDefaultVenueId();

  const recipes = await prisma.recipe.findMany({
    where: {
      isMenuActive: true,
      OR: [{ venueId }, { venueId: null }],
    },
    include: {
      recipeIngredients: {
        include: { ingredient: { select: { name: true, category: true } } },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const menu = recipes.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    price: r.menuPrice ? Number(r.menuPrice) : null,
    glassware: r.glassware,
    garnish: r.garnishDescription,
    method: r.method,
    ingredients: r.recipeIngredients.map((ri) => ri.ingredient.name),
    spec: r.recipeIngredients.map((ri) => ri.ingredient.name).join(", "),
  }));

  return NextResponse.json({ menu });
}
