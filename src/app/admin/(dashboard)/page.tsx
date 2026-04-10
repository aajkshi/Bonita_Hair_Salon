import { prisma } from "@/lib/prisma";
import { BOOKING_STATUS_LABELS, ORDER_STATUS_LABELS } from "@/lib/booking-utils";
import {
  Card,
  CardContent,
  CardDescription,
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
import { CalendarDays, DollarSign, Users, Clock } from "lucide-react";

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
    OPEN: "bg-yellow-100 text-yellow-800",
    SETTLED: "bg-green-100 text-green-800",
    VOIDED: "bg-red-100 text-red-800",
  };
  return map[status] ?? "bg-neutral-100 text-neutral-800";
}

export default async function DashboardPage() {
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7) + "-01";

  const [todayBookings, pendingBookings, monthRevenue, customerCount, recentOrders] =
    await Promise.all([
      prisma.booking.findMany({
        where: { bookingDate: today },
        include: { customer: true, staff: true, items: true },
        orderBy: { startTime: "asc" },
      }),
      prisma.booking.count({
        where: { status: "PENDING" },
      }),
      prisma.order.aggregate({
        where: {
          status: "SETTLED",
          orderDate: { gte: monthStart },
        },
        _sum: { totalAmount: true },
      }),
      prisma.customer.count(),
      prisma.order.findMany({
        include: { customer: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const stats = [
    {
      title: "今日預約",
      value: todayBookings.length,
      icon: CalendarDays,
      description: "筆預約",
    },
    {
      title: "本月營收",
      value: `$${(monthRevenue._sum.totalAmount ?? 0).toLocaleString()}`,
      icon: DollarSign,
      description: "已結帳金額",
    },
    {
      title: "顧客總數",
      value: customerCount,
      icon: Users,
      description: "位顧客",
    },
    {
      title: "待確認預約",
      value: pendingBookings,
      icon: Clock,
      description: "筆待處理",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">儀表板</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>今日預約</CardTitle>
            <CardDescription>{today}</CardDescription>
          </CardHeader>
          <CardContent>
            {todayBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">今日無預約</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>時間</TableHead>
                    <TableHead>顧客</TableHead>
                    <TableHead>服務</TableHead>
                    <TableHead>狀態</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-sm">
                        {booking.startTime}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/bookings/${booking.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {booking.customer.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {booking.items.map((i) => i.serviceName).join("、")}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColor(booking.status)} variant="secondary">
                          {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近消費紀錄</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">尚無消費紀錄</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>單號</TableHead>
                    <TableHead>顧客</TableHead>
                    <TableHead>金額</TableHead>
                    <TableHead>狀態</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.orderNo}
                      </TableCell>
                      <TableCell>{order.customer.name}</TableCell>
                      <TableCell>${order.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={statusColor(order.status)} variant="secondary">
                          {ORDER_STATUS_LABELS[order.status] ?? order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
