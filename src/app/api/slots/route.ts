import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/booking-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const staffId = searchParams.get("staffId");
  const date = searchParams.get("date");
  const duration = searchParams.get("duration");

  if (!staffId || !date || !duration) {
    return NextResponse.json(
      { error: "staffId, date, duration 為必填" },
      { status: 400 }
    );
  }

  const durationMinutes = parseInt(duration);
  if (isNaN(durationMinutes) || durationMinutes <= 0) {
    return NextResponse.json({ error: "duration 格式不正確" }, { status: 400 });
  }

  const slots = await getAvailableSlots(staffId, date, durationMinutes);
  return NextResponse.json(slots);
}
