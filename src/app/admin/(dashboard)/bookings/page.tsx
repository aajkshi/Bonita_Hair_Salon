import { prisma } from "@/lib/prisma";
import { BOOKING_STATUS_LABELS } from "@/lib/booking-utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

function statusColor(status: string) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30",
    CONFIRMED: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30",
    ARRIVED: "bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30",
    COMPLETED: "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30",
    CANCELLED: "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30",
    REJECTED: "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30",
    RESCHEDULED: "bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30",
    EXPIRED: "bg-neutral-500/20 text-neutral-600 dark:text-neutral-400 border border-neutral-500/30",
  };
  return map[status] ?? "bg-neutral-500/20 text-neutral-600 dark:text-neutral-400";
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; status?: string }>;
}) {
  const params = await searchParams;
  const date = params.date ?? new Date().toISOString().slice(0, 10);
  const status = params.status;

  const where: Record<string, unknown> = { bookingDate: date };
  if (status) where.status = status;

  const bookings = await prisma.booking.findMany({
    where,
    include: { customer: true, staff: true, items: true },
    orderBy: { startTime: "asc" },
  });

  const statuses = Object.keys(BOOKING_STATUS_LABELS);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">預約管理</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>篩選</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">日期</label>
              <input
                type="date"
                name="date"
                defaultValue={date}
                className="block rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">狀態</label>
              <select
                name="status"
                defaultValue={status ?? ""}
                className="block rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="">全部</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {BOOKING_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              篩選
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden sm:table-cell">預約編號</TableHead>
                <TableHead>顧客</TableHead>
                <TableHead className="hidden md:table-cell">設計師</TableHead>
                <TableHead className="hidden lg:table-cell">日期</TableHead>
                <TableHead>時間</TableHead>
                <TableHead>服務項目</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    無預約紀錄
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="hidden sm:table-cell font-mono text-sm">{booking.bookingNo}</TableCell>
                    <TableCell>{booking.customer.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{booking.staff.name}</TableCell>
                    <TableCell className="hidden lg:table-cell">{booking.bookingDate}</TableCell>
                    <TableCell className="font-mono">
                      {booking.startTime} - {booking.endTime}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">
                      {booking.items.map((i) => i.serviceName).join("、")}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColor(booking.status)} variant="secondary">
                        {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        詳情
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
