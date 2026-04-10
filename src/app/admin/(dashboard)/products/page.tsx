import { prisma } from "@/lib/prisma";
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
import { ProductActions } from "./product-actions";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">產品管理</h1>
        <ProductActions />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名稱</TableHead>
                <TableHead className="hidden sm:table-cell">品牌</TableHead>
                <TableHead className="text-right">價格</TableHead>
                <TableHead className="hidden sm:table-cell text-right">庫存</TableHead>
                <TableHead>上架</TableHead>
                <TableHead className="hidden md:table-cell">狀態</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-neutral-500 py-8">
                    尚無產品
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{product.brand ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      ${product.price.toLocaleString()}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right">{product.stockQuantity}</TableCell>
                    <TableCell>
                      <Badge variant={product.isOnSale ? "default" : "secondary"}>
                        {product.isOnSale ? "販售中" : "未上架"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "啟用" : "停用"}
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
