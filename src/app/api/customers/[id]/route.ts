import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      bookings: {
        include: { staff: true, items: true },
        orderBy: { bookingDate: "desc" },
      },
      orders: {
        include: {
          staff: true,
          serviceItems: true,
          productItems: true,
        },
        orderBy: { orderDate: "desc" },
      },
    },
  });

  if (!customer) {
    return NextResponse.json({ error: "顧客不存在" }, { status: 404 });
  }

  return NextResponse.json(customer);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, phone, email, gender, notes } = body;

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email: email || null }),
        ...(gender !== undefined && { gender: gender || null }),
        ...(notes !== undefined && { notes: notes || null }),
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Customer update error:", error);
    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}
