import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  BOOKING_STATUS_LABELS,
  ORDER_STATUS_LABELS,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { CustomerEditForm } from "./edit-form";

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

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      bookings: {
        include: { staff: true, items: true },
        orderBy: { bookingDate: "desc" },
      },
      orders: {
        include: {
          staff: true,
          serviceItems: true,
          productItems: true,
        },
        orderBy: { orderDate: "desc" },
      },
    },
  });

  if (!customer) notFound();

  const totalSpent = customer.orders
    .filter((o) => o.status === "SETTLED")
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const totalVisits = customer.bookings.filter(
    (b) => b.status === "COMPLETED"
  ).length;
  const lastVisit = customer.bookings[0]?.bookingDate ?? "-";

  // Gather all product purchases across orders
  const allProducts = customer.orders.flatMap((o) =>
    o.productItems.map((p) => ({
      ...p,
      orderNo: o.orderNo,
      orderDate: o.orderDate,
    }))
  );

  // Find favorite services
  const serviceCounts: Record<string, number> = {};
  customer.bookings.forEach((b) =>
    b.items.forEach((i) => {
      serviceCounts[i.serviceName] = (serviceCounts[i.serviceName] ?? 0) + 1;
    })
  );
  const favoriteServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/customers" className="text-sm text-muted-foreground hover:underline">
          &larr; 返回顧客列表
        </Link>
        <h1 className="mt-1 text-2xl font-bold">{customer.name}</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">到店次數</p>
            <p className="text-2xl font-bold">{totalVisits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">累計消費</p>
            <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">常用服務</p>
            <p className="text-sm font-medium mt-1">
              {favoriteServices.length > 0 ? favoriteServices.join("、") : "-"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">最近到店</p>
            <p className="text-2xl font-bold">{lastVisit}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">基本資料</TabsTrigger>
          <TabsTrigger value="bookings">預約歷史</TabsTrigger>
          <TabsTrigger value="orders">消費歷史</TabsTrigger>
          <TabsTrigger value="products">產品購買</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>基本資料</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerEditForm customer={customer} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>預約編號</TableHead>
                    <TableHead>日期</TableHead>
                    <TableHead>時間</TableHead>
                    <TableHead>設計師</TableHead>
                    <TableHead>服務</TableHead>
                    <TableHead>狀態</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        無預約紀錄
                      </TableCell>
                    </TableRow>
                  ) : (
                    customer.bookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>
                          <Link
                            href={`/admin/bookings/${b.id}`}
                            className="text-blue-600 hover:underline font-mono text-sm"
                          >
                            {b.bookingNo}
                          </Link>
                        </TableCell>
                        <TableCell>{b.bookingDate}</TableCell>
                        <TableCell className="font-mono">
                          {b.startTime} - {b.endTime}
                        </TableCell>
                        <TableCell>{b.staff.name}</TableCell>
                        <TableCell className="text-sm">
                          {b.items.map((i) => i.serviceName).join("、")}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColor(b.status)} variant="secondary">
                            {BOOKING_STATUS_LABELS[b.status] ?? b.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>單號</TableHead>
                    <TableHead>日期</TableHead>
                    <TableHead>服務項目</TableHead>
                    <TableHead>產品</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                    <TableHead>狀態</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        無消費紀錄
                      </TableCell>
                    </TableRow>
                  ) : (
                    customer.orders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-sm">{o.orderNo}</TableCell>
                        <TableCell>{o.orderDate}</TableCell>
                        <TableCell className="text-sm">
                          {o.serviceItems.map((s) => s.serviceName).join("、") || "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {o.productItems.map((p) => p.productName).join("、") || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          ${o.totalAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColor(o.status)} variant="secondary">
                            {ORDER_STATUS_LABELS[o.status] ?? o.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>產品名稱</TableHead>
                    <TableHead>品牌</TableHead>
                    <TableHead>數量</TableHead>
                    <TableHead className="text-right">單價</TableHead>
                    <TableHead className="text-right">小計</TableHead>
                    <TableHead>訂單</TableHead>
                    <TableHead>日期</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        無產品購買紀錄
                      </TableCell>
                    </TableRow>
                  ) : (
                    allProducts.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.productName}</TableCell>
                        <TableCell className="text-sm">{p.brand ?? "-"}</TableCell>
                        <TableCell>{p.quantity}</TableCell>
                        <TableCell className="text-right">
                          ${p.unitPrice.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          ${p.subtotal.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{p.orderNo}</TableCell>
                        <TableCell className="text-sm">{p.orderDate}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
