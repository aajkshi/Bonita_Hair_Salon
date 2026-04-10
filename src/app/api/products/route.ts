import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true, isOnSale: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, brand: true, price: true },
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, brand, price, stockQuantity } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: "名稱和價格為必填" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        brand: brand || null,
        price,
        stockQuantity: stockQuantity ?? 0,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Product API error:", error);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
