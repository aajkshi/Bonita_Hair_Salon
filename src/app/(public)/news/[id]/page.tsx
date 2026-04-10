import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";

interface NewsDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: NewsDetailPageProps) {
  const { id } = await params;
  const news = await prisma.news.findUnique({ where: { id } });

  if (!news) {
    return { title: "找不到文章 | 波妮塔美髮沙龍" };
  }

  return {
    title: `${news.title} | 波妮塔美髮沙龍`,
    description: news.content.slice(0, 160),
  };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { id } = await params;
  const news = await prisma.news.findUnique({
    where: { id, isPublished: true },
    include: {
      author: { select: { name: true } },
    },
  });

  if (!news) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link
        href="/news"
        className={buttonVariants({ variant: "ghost", className: "mb-6" })}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回最新消息
      </Link>

      <article>
        <h1 className="mb-4 text-3xl font-bold">{news.title}</h1>
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          {news.publishedAt && (
            <time>
              {new Date(news.publishedAt).toLocaleDateString("zh-TW", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
          {news.author?.name && (
            <>
              <span>|</span>
              <span>{news.author.name}</span>
            </>
          )}
        </div>
        <Separator className="mb-8" />
        <div className="prose prose-neutral max-w-none whitespace-pre-wrap leading-relaxed text-muted-foreground">
          {news.content}
        </div>
      </article>
    </div>
  );
}
