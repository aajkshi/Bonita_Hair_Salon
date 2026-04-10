import { prisma } from "@/lib/prisma";
import { HAIR_LENGTH_LABELS } from "@/lib/booking-utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ServiceActions } from "./service-actions";

export default async function ServicesPage() {
  const categories = await prisma.serviceCategory.findMany({
    include: {
      serviceItems: {
        include: { variants: { orderBy: { price: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">服務項目管理</h1>
        <ServiceActions categories={categories} />
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-neutral-500">
            尚未建立服務類別
          </CardContent>
        </Card>
      ) : (
        categories.map((cat) => (
          <Card key={cat.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{cat.name}</CardTitle>
                <Badge variant={cat.isActive ? "default" : "secondary"}>
                  {cat.isActive ? "啟用" : "停用"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {cat.serviceItems.length === 0 ? (
                <p className="text-sm text-neutral-500">此類別下尚無服務項目</p>
              ) : (
                cat.serviceItems.map((item) => (
                  <div key={item.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{item.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {item.isBookable ? "可預約" : "不可預約"}
                        </Badge>
                        {!item.isActive && (
                          <Badge variant="secondary" className="text-xs">
                            停用
                          </Badge>
                        )}
                      </div>
                    </div>
                    {item.variants.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b text-left text-neutral-500">
                              <th className="pb-2 pr-4">髮長</th>
                              <th className="pb-2 pr-4">時長</th>
                              <th className="pb-2 pr-4 text-right">價格</th>
                              <th className="pb-2">狀態</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.variants.map((v) => (
                              <tr key={v.id} className="border-b last:border-0">
                                <td className="py-2 pr-4">
                                  {v.hairLength
                                    ? HAIR_LENGTH_LABELS[v.hairLength] ?? v.hairLength
                                    : "通用"}
                                </td>
                                <td className="py-2 pr-4">{v.durationMinutes} 分鐘</td>
                                <td className="py-2 pr-4 text-right font-medium">
                                  ${v.price.toLocaleString()}
                                </td>
                                <td className="py-2">
                                  <span
                                    className={`text-xs ${
                                      v.isActive
                                        ? "text-green-600"
                                        : "text-neutral-400"
                                    }`}
                                  >
                                    {v.isActive ? "啟用" : "停用"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
