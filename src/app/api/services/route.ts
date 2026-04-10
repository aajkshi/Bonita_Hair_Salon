import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    include: {
      serviceItems: {
        where: { isActive: true },
        include: {
          variants: {
            where: { isActive: true },
            orderBy: { price: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.type === "category") {
      const category = await prisma.serviceCategory.create({
        data: { name: body.name },
      });
      return NextResponse.json(category);
    }

    if (body.type === "item") {
      const item = await prisma.serviceItem.create({
        data: {
          categoryId: body.categoryId,
          name: body.name,
          isBookable: body.isBookable ?? true,
        },
      });

      // Create default variant
      if (body.price !== undefined) {
        await prisma.serviceVariant.create({
          data: {
            serviceItemId: item.id,
            durationMinutes: body.durationMinutes ?? 60,
            price: body.price ?? 0,
          },
        });
      }

      return NextResponse.json(item);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Service API error:", error);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
