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
import { NewsActions } from "./news-actions";

export default async function NewsPage() {
  const news = await prisma.news.findMany({
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">最新消息</h1>
        <NewsActions />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>標題</TableHead>
                <TableHead>作者</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>發布日期</TableHead>
                <TableHead>建立日期</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {news.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    尚無消息
                  </TableCell>
                </TableRow>
              ) : (
                news.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {item.title}
                    </TableCell>
                    <TableCell className="text-sm">{item.author.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.isPublished ? "default" : "secondary"}
                      >
                        {item.isPublished ? "已發布" : "草稿"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString("zh-TW")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(item.createdAt).toLocaleDateString("zh-TW")}
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
