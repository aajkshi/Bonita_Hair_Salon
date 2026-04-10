import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_LABELS } from "@/lib/booking-utils";
import {
  Card,
  CardContent,
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
    OPEN: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30",
    SETTLED: "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30",
    VOIDED: "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30",
  };
  return map[status] ?? "bg-neutral-500/20 text-neutral-600 dark:text-neutral-400";
}

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: { customer: true, staff: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">消費紀錄</h1>
        <Link
          href="/admin/orders/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          新增消費
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden sm:table-cell">單號</TableHead>
                <TableHead>顧客</TableHead>
                <TableHead>日期</TableHead>
                <TableHead className="hidden md:table-cell">設計師</TableHead>
                <TableHead className="text-right">金額</TableHead>
                <TableHead className="hidden sm:table-cell">付款方式</TableHead>
                <TableHead>狀態</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    無消費紀錄
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="hidden sm:table-cell font-mono text-sm">{order.orderNo}</TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/customers/${order.customerId}`}
                        className="text-blue-600 hover:underline"
                      >
                        {order.customer.name}
                      </Link>
                    </TableCell>
                    <TableCell>{order.orderDate}</TableCell>
                    <TableCell className="hidden md:table-cell">{order.staff.name}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${order.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {order.paymentMethod === "CASH"
                        ? "現金"
                        : order.paymentMethod === "TRANSFER"
                        ? "轉帳"
                        : order.paymentMethod ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColor(order.status)} variant="secondary">
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </Badge>
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
