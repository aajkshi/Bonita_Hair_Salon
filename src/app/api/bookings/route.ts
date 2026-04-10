import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateBookingNo,
  getAvailableSlots,
  timeToMinutes,
  minutesToTime,
} from "@/lib/booking-utils";
import { z } from "zod/v4";

const bookingItemSchema = z.object({
  serviceVariantId: z.string(),
  serviceName: z.string(),
  categoryName: z.string(),
  hairLength: z.string().nullable().optional(),
  durationMinutes: z.number().int().positive(),
  price: z.number().int().min(0),
});

const createBookingSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  customerEmail: z.string().email().optional(),
  customerNote: z.string().optional(),
  staffId: z.string(),
  bookingDate: z.string(),
  startTime: z.string(),
  items: z.array(bookingItemSchema).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = z.parse(createBookingSchema, body);

    // Calculate total duration and estimated amount
    const totalDuration = parsed.items.reduce(
      (sum, i) => sum + i.durationMinutes,
      0
    );
    const estimatedAmount = parsed.items.reduce(
      (sum, i) => sum + i.price,
      0
    );
    const startMinutes = timeToMinutes(parsed.startTime);
    const endTime = minutesToTime(startMinutes + totalDuration);

    // Check slot availability
    const slots = await getAvailableSlots(
      parsed.staffId,
      parsed.bookingDate,
      totalDuration
    );
    if (!slots.includes(parsed.startTime)) {
      return NextResponse.json(
        { error: "此時段已無法預約" },
        { status: 400 }
      );
    }

    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { phone: parsed.customerPhone },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: parsed.customerName,
          phone: parsed.customerPhone,
          email: parsed.customerEmail ?? null,
        },
      });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingNo: generateBookingNo(),
        customerId: customer.id,
        staffId: parsed.staffId,
        bookingDate: parsed.bookingDate,
        startTime: parsed.startTime,
        endTime,
        totalDuration,
        estimatedAmount,
        customerNote: parsed.customerNote ?? null,
        items: {
          create: parsed.items.map((item) => ({
            serviceVariantId: item.serviceVariantId,
            serviceName: item.serviceName,
            categoryName: item.categoryName,
            hairLength: item.hairLength ?? null,
            durationMinutes: item.durationMinutes,
            price: item.price,
          })),
        },
      },
      include: { items: true, customer: true },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "資料格式不正確", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Booking API error:", error);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
