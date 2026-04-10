import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "最新消息 | 波妮塔美髮沙龍",
  description: "波妮塔美髮沙龍最新活動消息與優惠公告",
};

async function getNewsList() {
  return prisma.news.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    include: {
      author: { select: { name: true } },
    },
  });
}

type NewsWithAuthor = Awaited<ReturnType<typeof getNewsList>>[number];

export default async function NewsPage() {
  const newsList = await prisma.news.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    include: {
      author: { select: { name: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      {/* Page Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">最新消息</h1>
        <p className="text-lg text-muted-foreground">
          掌握波妮塔美髮沙龍的最新動態與優惠活動
        </p>
      </div>

      {/* News List */}
      {newsList.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          目前暫無最新消息，請稍後再回來查看！
        </div>
      ) : (
        <div className="space-y-4">
          {newsList.map((news: NewsWithAuthor) => (
            <Link key={news.id} href={`/news/${news.id}`} className="block">
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg hover:text-rose-500 transition-colors">
                        {news.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {news.publishedAt
                          ? new Date(news.publishedAt).toLocaleDateString(
                              "zh-TW",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : ""}
                        {news.author?.name && ` | ${news.author.name}`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {news.content}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
