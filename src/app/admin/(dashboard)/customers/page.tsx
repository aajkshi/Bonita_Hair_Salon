import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";

  const where = q
    ? {
        OR: [
          { name: { contains: q } },
          { phone: { contains: q } },
        ],
      }
    : {};

  const customers = await prisma.customer.findMany({
    where,
    include: {
      orders: {
        where: { status: "SETTLED" },
        select: { totalAmount: true, orderDate: true },
        orderBy: { orderDate: "desc" },
      },
      bookings: {
        select: { bookingDate: true },
        orderBy: { bookingDate: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">顧客管理</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form className="flex items-end gap-4">
            <div className="flex-1 max-w-sm space-y-1">
              <label className="text-sm font-medium text-foreground">搜尋</label>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="姓名或電話..."
                className="block w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              搜尋
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>姓名</TableHead>
                <TableHead>電話</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden sm:table-cell">最近到店</TableHead>
                <TableHead className="text-right">累計消費</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    無顧客資料
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => {
                  const totalSpent = customer.orders.reduce(
                    (sum, o) => sum + o.totalAmount,
                    0
                  );
                  const lastVisit =
                    customer.bookings[0]?.bookingDate ?? "-";
                  return (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {customer.name}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {customer.phone}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {customer.email ?? "-"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{lastVisit}</TableCell>
                      <TableCell className="text-right">
                        ${totalSpent.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          詳情
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
