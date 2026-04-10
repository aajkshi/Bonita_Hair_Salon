import { prisma } from "./prisma";

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function generateBookingNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `B${dateStr}-${rand}`;
}

export function generateOrderNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `O${dateStr}-${rand}`;
}

export async function getAvailableSlots(
  staffId: string,
  date: string,
  durationMinutes: number
): Promise<string[]> {
  const dayOfWeek = new Date(date).getDay();

  // Get schedule template for this day
  const template = await prisma.scheduleTemplate.findFirst({
    where: { staffId, dayOfWeek, isActive: true },
  });
  if (!template) return [];

  // Get overrides for this date
  const overrides = await prisma.scheduleOverride.findMany({
    where: { staffId, date },
  });

  // Check if whole day is blocked
  const wholeDayBlock = overrides.find(
    (o) => !o.startTime && !o.isAvailable
  );
  if (wholeDayBlock) return [];

  // Get existing bookings for this date
  const existingBookings = await prisma.booking.findMany({
    where: {
      staffId,
      bookingDate: date,
      status: { in: ["PENDING", "CONFIRMED", "ARRIVED"] },
    },
  });

  const scheduleStart = timeToMinutes(template.startTime);
  const scheduleEnd = timeToMinutes(template.endTime);
  const interval = template.slotInterval;
  const slots: string[] = [];

  for (let t = scheduleStart; t + durationMinutes <= scheduleEnd; t += interval) {
    const slotStart = t;
    const slotEnd = t + durationMinutes;
    const slotStartStr = minutesToTime(slotStart);
    const slotEndStr = minutesToTime(slotEnd);

    // Check override blocks
    const blocked = overrides.some((o) => {
      if (!o.startTime || !o.endTime) return false;
      if (o.isAvailable) return false;
      const oStart = timeToMinutes(o.startTime);
      const oEnd = timeToMinutes(o.endTime);
      return slotStart < oEnd && slotEnd > oStart;
    });
    if (blocked) continue;

    // Check booking conflicts
    const conflict = existingBookings.some((b) => {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      return slotStart < bEnd && slotEnd > bStart;
    });
    if (conflict) continue;

    slots.push(slotStartStr);
  }

  return slots;
}

export const BOOKING_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "REJECTED", "CANCELLED", "EXPIRED"],
  CONFIRMED: ["ARRIVED", "CANCELLED", "RESCHEDULED"],
  ARRIVED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
  RESCHEDULED: [],
  EXPIRED: [],
};

export const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  OPEN: ["SETTLED", "VOIDED"],
  SETTLED: [],
  VOIDED: [],
};

export const HAIR_LENGTH_LABELS: Record<string, string> = {
  SHORT: "短髮",
  MEDIUM: "中長髮",
  LONG: "長髮",
};

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: "待確認",
  CONFIRMED: "已確認",
  ARRIVED: "已到店",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
  REJECTED: "已拒絕",
  RESCHEDULED: "已改期",
  EXPIRED: "已過期",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  OPEN: "未結帳",
  SETTLED: "已結帳",
  VOIDED: "已作廢",
};
