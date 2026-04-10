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

function notifStatusColor(status: string) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30",
    SENT: "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30",
    FAILED: "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30",
  };
  return map[status] ?? "bg-neutral-500/20 text-neutral-600 dark:text-neutral-400";
}

const notifStatusLabel: Record<string, string> = {
  PENDING: "待發送",
  SENT: "已發送",
  FAILED: "失敗",
};

export default async function NotificationsPage() {
  const logs = await prisma.notificationLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">通知紀錄</h1>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>類型</TableHead>
                <TableHead>頻道</TableHead>
                <TableHead>收件人</TableHead>
                <TableHead>主旨</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>發送時間</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    尚無通知紀錄
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">{log.type}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.channel}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.recipientName ?? log.recipientEmail ?? "-"}
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">
                      {log.subject ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={notifStatusColor(log.status)} variant="secondary">
                        {notifStatusLabel[log.status] ?? log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.sentAt
                        ? new Date(log.sentAt).toLocaleString("zh-TW")
                        : "-"}
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
