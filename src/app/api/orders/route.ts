import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateOrderNo } from "@/lib/booking-utils";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const body = await request.json();
    const {
      bookingId,
      customerId,
      staffId,
      serviceItems = [],
      productItems = [],
      discountAmount = 0,
      paymentMethod,
      settle = false,
    } = body;

    if (!customerId || !staffId) {
      return NextResponse.json(
        { error: "customerId 和 staffId 為必填" },
        { status: 400 }
      );
    }

    const serviceSubtotal = serviceItems.reduce(
      (sum: number, i: { subtotal: number }) => sum + i.subtotal,
      0
    );
    const productSubtotal = productItems.reduce(
      (sum: number, i: { subtotal: number }) => sum + i.subtotal,
      0
    );
    const totalAmount = serviceSubtotal + productSubtotal - discountAmount;

    const order = await prisma.order.create({
      data: {
        orderNo: generateOrderNo(),
        bookingId: bookingId || null,
        customerId,
        staffId,
        orderDate: new Date().toISOString().slice(0, 10),
        serviceSubtotal,
        productSubtotal,
        discountAmount,
        totalAmount: Math.max(totalAmount, 0),
        paymentMethod: paymentMethod || null,
        status: settle ? "SETTLED" : "OPEN",
        settledAt: settle ? new Date() : null,
        createdBy: (session.user as { id: string }).id,
        serviceItems: {
          create: serviceItems.map(
            (item: {
              serviceVariantId?: string;
              serviceName: string;
              categoryName: string;
              hairLength?: string | null;
              durationMinutes: number;
              unitPrice: number;
              subtotal: number;
              performedBy?: string;
            }) => ({
              serviceVariantId: item.serviceVariantId || null,
              serviceName: item.serviceName,
              categoryName: item.categoryName,
              hairLength: item.hairLength || null,
              durationMinutes: item.durationMinutes,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
              performedBy: item.performedBy || null,
            })
          ),
        },
        productItems: {
          create: productItems.map(
            (item: {
              productId?: string;
              productName: string;
              brand?: string | null;
              quantity: number;
              unitPrice: number;
              subtotal: number;
            }) => ({
              productId: item.productId || null,
              productName: item.productName,
              brand: item.brand || null,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
            })
          ),
        },
      },
    });

    // If created from booking, mark booking as COMPLETED
    if (bookingId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "COMPLETED" },
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
