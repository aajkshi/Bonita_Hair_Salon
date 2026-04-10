import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_TRANSITIONS,
  HAIR_LENGTH_LABELS,
} from "@/lib/booking-utils";
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
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { BookingStatusActions } from "./status-actions";

function statusColor(status: string) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    ARRIVED: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    REJECTED: "bg-red-100 text-red-800",
    RESCHEDULED: "bg-orange-100 text-orange-800",
    EXPIRED: "bg-neutral-100 text-neutral-800",
  };
  return map[status] ?? "bg-neutral-100 text-neutral-800";
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      customer: true,
      staff: true,
      items: { include: { serviceVariant: true } },
      orders: true,
    },
  });

  if (!booking) notFound();

  const allowedTransitions = BOOKING_STATUS_TRANSITIONS[booking.status] ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/bookings" className="text-sm text-neutral-500 hover:underline">
            &larr; 返回預約列表
          </Link>
          <h1 className="mt-1 text-2xl font-bold">預約詳情 {booking.bookingNo}</h1>
        </div>
        <Badge className={statusColor(booking.status)} variant="secondary">
          {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>預約資訊</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-500">顧客</span>
                <p className="font-medium">
                  <Link
                    href={`/admin/customers/${booking.customerId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {booking.customer.name}
                  </Link>
                </p>
              </div>
              <div>
                <span className="text-neutral-500">電話</span>
                <p className="font-medium">{booking.customer.phone}</p>
              </div>
              <div>
                <span className="text-neutral-500">設計師</span>
                <p className="font-medium">{booking.staff.name}</p>
              </div>
              <div>
                <span className="text-neutral-500">日期</span>
                <p className="font-medium">{booking.bookingDate}</p>
              </div>
              <div>
                <span className="text-neutral-500">時段</span>
                <p className="font-medium font-mono">
                  {booking.startTime} - {booking.endTime}
                </p>
              </div>
              <div>
                <span className="text-neutral-500">總時長</span>
                <p className="font-medium">{booking.totalDuration} 分鐘</p>
              </div>
              {booking.estimatedAmount && (
                <div>
                  <span className="text-neutral-500">預估金額</span>
                  <p className="font-medium">${booking.estimatedAmount.toLocaleString()}</p>
                </div>
              )}
            </div>
            {booking.customerNote && (
              <>
                <Separator />
                <div>
                  <span className="text-sm text-neutral-500">顧客備註</span>
                  <p className="text-sm">{booking.customerNote}</p>
                </div>
              </>
            )}
            {booking.adminNote && (
              <div>
                <span className="text-sm text-neutral-500">管理員備註</span>
                <p className="text-sm">{booking.adminNote}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>服務項目</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>類別</TableHead>
                  <TableHead>項目</TableHead>
                  <TableHead>髮長</TableHead>
                  <TableHead>時長</TableHead>
                  <TableHead className="text-right">價格</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {booking.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-sm">{item.categoryName}</TableCell>
                    <TableCell className="font-medium">{item.serviceName}</TableCell>
                    <TableCell className="text-sm">
                      {item.hairLength ? HAIR_LENGTH_LABELS[item.hairLength] ?? item.hairLength : "-"}
                    </TableCell>
                    <TableCell className="text-sm">{item.durationMinutes} 分</TableCell>
                    <TableCell className="text-right">${item.price.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>狀態操作</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingStatusActions
            bookingId={booking.id}
            currentStatus={booking.status}
            allowedTransitions={allowedTransitions}
            adminNote={booking.adminNote ?? ""}
          />
          {booking.status === "COMPLETED" && booking.orders.length === 0 && (
            <div className="mt-4 pt-4 border-t">
              <Link
                href={`/admin/orders/new?bookingId=${booking.id}`}
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                建立消費紀錄
              </Link>
            </div>
          )}
          {booking.orders.length > 0 && (
            <div className="mt-4 pt-4 border-t space-y-1">
              <p className="text-sm font-medium text-neutral-700">關聯消費紀錄</p>
              {booking.orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders`}
                  className="block text-sm text-blue-600 hover:underline"
                >
                  {order.orderNo} - ${order.totalAmount.toLocaleString()}
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
