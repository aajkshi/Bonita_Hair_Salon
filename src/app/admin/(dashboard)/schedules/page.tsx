import { prisma } from "@/lib/prisma";
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
import { ScheduleActions } from "./schedule-actions";

const DAY_NAMES = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

export default async function SchedulesPage() {
  const [staffList, templates, overrides] = await Promise.all([
    prisma.staff.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.scheduleTemplate.findMany({
      include: { staff: true },
      orderBy: [{ staffId: "asc" }, { dayOfWeek: "asc" }],
    }),
    prisma.scheduleOverride.findMany({
      include: { staff: true },
      orderBy: { date: "desc" },
      take: 50,
    }),
  ]);

  // Group templates by staff
  const templatesByStaff: Record<
    string,
    { staff: { id: string; name: string }; days: typeof templates }
  > = {};
  templates.forEach((t) => {
    if (!templatesByStaff[t.staffId]) {
      templatesByStaff[t.staffId] = { staff: t.staff, days: [] };
    }
    templatesByStaff[t.staffId].days.push(t);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">時段管理</h1>
        <ScheduleActions staffList={staffList} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>每週排班</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(templatesByStaff).length === 0 ? (
            <p className="text-sm text-neutral-500">尚未設定排班</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(templatesByStaff).map(([staffId, data]) => (
                <div key={staffId}>
                  <h3 className="font-medium mb-2">{data.staff.name}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="border-b bg-neutral-50">
                          {DAY_NAMES.map((d, i) => (
                            <th key={i} className="px-3 py-2 text-center font-medium">
                              {d}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {DAY_NAMES.map((_, dayIdx) => {
                            const tmpl = data.days.find((d) => d.dayOfWeek === dayIdx);
                            return (
                              <td key={dayIdx} className="border px-3 py-2 text-center">
                                {tmpl && tmpl.isActive ? (
                                  <div>
                                    <span className="font-mono text-xs">
                                      {tmpl.startTime}-{tmpl.endTime}
                                    </span>
                                    <br />
                                    <span className="text-xs text-neutral-500">
                                      {tmpl.slotInterval}分一段
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-neutral-400 text-xs">休息</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>特殊日期設定</CardTitle>
        </CardHeader>
        <CardContent>
          {overrides.length === 0 ? (
            <p className="text-sm text-neutral-500">尚無特殊日期設定</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>設計師</TableHead>
                  <TableHead>日期</TableHead>
                  <TableHead>時段</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>原因</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overrides.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>{o.staff.name}</TableCell>
                    <TableCell className="font-mono">{o.date}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {o.startTime && o.endTime
                        ? `${o.startTime} - ${o.endTime}`
                        : "整天"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={o.isAvailable ? "default" : "secondary"}>
                        {o.isAvailable ? "可預約" : "不可預約"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{o.reason ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
