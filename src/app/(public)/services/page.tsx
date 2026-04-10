import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "服務項目 | 波妮塔美髮沙龍",
  description: "波妮塔美髮沙龍完整服務項目與價格一覽",
};

const HAIR_LENGTH_LABELS: Record<string, string> = {
  SHORT: "短髮",
  MEDIUM: "中長髮",
  LONG: "長髮",
};

async function getCategories() {
  return prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      serviceItems: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          variants: {
            where: { isActive: true },
            orderBy: { price: "asc" },
          },
        },
      },
    },
  });
}

type CategoryWithItems = Awaited<ReturnType<typeof getCategories>>[number];
type ItemWithVariants = CategoryWithItems["serviceItems"][number];
type Variant = ItemWithVariants["variants"][number];

export default async function ServicesPage() {
  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      serviceItems: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          variants: {
            where: { isActive: true },
            orderBy: { price: "asc" },
          },
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      {/* Page Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">服務項目</h1>
        <p className="text-lg text-muted-foreground">
          提供多元專業美髮服務，每一項都為您精心設計
        </p>
      </div>

      {/* Service Categories */}
      <div className="space-y-12">
        {categories.map((category: CategoryWithItems) => (
          <section key={category.id}>
            <h2 className="mb-6 text-2xl font-bold">{category.name}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.serviceItems.map((item: ItemWithVariants) => {
                const prices = item.variants.map((v: Variant) => v.price);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                const hasLengthVariants = item.variants.some(
                  (v: Variant) => v.hairLength
                );

                return (
                  <Card key={item.id} className="flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        {item.isBookable && (
                          <Badge
                            variant="secondary"
                            className="shrink-0 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          >
                            可預約
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        {prices.length > 0 && (
                          <span className="font-semibold text-rose-500">
                            NT${minPrice.toLocaleString()}
                            {maxPrice > minPrice &&
                              ` ~ NT$${maxPrice.toLocaleString()}`}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      {hasLengthVariants ? (
                        <div className="space-y-2">
                          {item.variants.map((variant: Variant) => (
                            <div
                              key={variant.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-muted-foreground">
                                {variant.hairLength
                                  ? HAIR_LENGTH_LABELS[variant.hairLength] ??
                                    variant.hairLength
                                  : "一般"}
                              </span>
                              <span className="flex items-center gap-3">
                                <span className="text-muted-foreground">
                                  {variant.durationMinutes} 分鐘
                                </span>
                                <span className="font-medium">
                                  NT${variant.price.toLocaleString()}
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {item.variants.map((variant: Variant) => (
                            <div
                              key={variant.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-muted-foreground">
                                約 {variant.durationMinutes} 分鐘
                              </span>
                              <span className="font-medium">
                                NT${variant.price.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <Separator className="mt-8" />
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 text-center">
        <p className="mb-4 text-muted-foreground">
          找到喜歡的服務了嗎？立即線上預約吧！
        </p>
        <Link
          href="/booking"
          className={buttonVariants({ size: "lg", className: "bg-rose-500 hover:bg-rose-600" })}
        >
          立即預約
        </Link>
      </div>
    </div>
  );
}
