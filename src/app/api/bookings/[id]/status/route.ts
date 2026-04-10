import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BOOKING_STATUS_TRANSITIONS } from "@/lib/booking-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, adminNote } = body;

    if (!status) {
      return NextResponse.json({ error: "status 為必填" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ error: "預約不存在" }, { status: 404 });
    }

    const allowed = BOOKING_STATUS_TRANSITIONS[booking.status] ?? [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: `無法從 ${booking.status} 轉換為 ${status}` },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { status };
    if (adminNote !== undefined) {
      updateData.adminNote = adminNote;
    }
    if (status === "CANCELLED") {
      updateData.cancelledAt = new Date();
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Booking status API error:", error);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
