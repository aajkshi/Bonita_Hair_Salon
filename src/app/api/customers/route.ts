import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  const where = q
    ? {
        OR: [
          { name: { contains: q } },
          { phone: { contains: q } },
        ],
      }
    : {};

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, name: true, phone: true, email: true },
  });

  return NextResponse.json(customers);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, gender, notes } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "姓名和電話為必填" },
        { status: 400 }
      );
    }

    // Check if phone already exists
    const existing = await prisma.customer.findUnique({
      where: { phone },
    });
    if (existing) {
      return NextResponse.json(
        { error: "此電話號碼已存在" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email: email || null,
        gender: gender || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Customer API error:", error);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
