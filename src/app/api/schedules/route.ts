import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.type === "template") {
      const { staffId, dayOfWeek, startTime, endTime, slotInterval } = body;

      if (!staffId || dayOfWeek === undefined || !startTime || !endTime) {
        return NextResponse.json(
          { error: "請填寫所有必填欄位" },
          { status: 400 }
        );
      }

      // Upsert: deactivate existing template for this staff+day, then create new
      await prisma.scheduleTemplate.updateMany({
        where: { staffId, dayOfWeek },
        data: { isActive: false },
      });

      const template = await prisma.scheduleTemplate.create({
        data: {
          staffId,
          dayOfWeek,
          startTime,
          endTime,
          slotInterval: slotInterval ?? 30,
        },
      });

      return NextResponse.json(template, { status: 201 });
    }

    if (body.type === "override") {
      const { staffId, date, startTime, endTime, isAvailable, reason } = body;

      if (!staffId || !date) {
        return NextResponse.json(
          { error: "設計師和日期為必填" },
          { status: 400 }
        );
      }

      const override = await prisma.scheduleOverride.create({
        data: {
          staffId,
          date,
          startTime: startTime || null,
          endTime: endTime || null,
          isAvailable: isAvailable ?? false,
          reason: reason || null,
        },
      });

      return NextResponse.json(override, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Schedule API error:", error);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
