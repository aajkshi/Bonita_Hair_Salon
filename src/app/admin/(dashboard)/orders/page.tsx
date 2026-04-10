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
    OPEN: "bg-yellow-100 text-yellow-800",
    SETTLED: "bg-green-100 text-green-800",
    VOIDED: "bg-red-100 text-red-800",
  };
  return map[status] ?? "bg-neutral-100 text-neutral-800";
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
