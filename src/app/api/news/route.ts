import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, isPublished } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "標題和內容為必填" },
        { status: 400 }
      );
    }

    const news = await prisma.news.create({
      data: {
        title,
        content,
        isPublished: isPublished ?? false,
        publishedAt: isPublished ? new Date() : null,
        createdBy: (session.user as { id: string }).id,
      },
    });

    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    console.error("News API error:", error);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
