"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const DAY_NAMES = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

interface Staff {
  id: string;
  name: string;
}

export function ScheduleActions({ staffList }: { staffList: Staff[] }) {
  const router = useRouter();

  // Template dialog
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    staffId: "",
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "18:00",
    slotInterval: 30,
  });

  // Override dialog
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    staffId: "",
    date: "",
    startTime: "",
    endTime: "",
    isAvailable: false,
    reason: "",
  });

  const [loading, setLoading] = useState(false);

  async function handleAddTemplate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "template", ...templateForm }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "新增失敗");
        return;
      }
      toast.success("排班已新增");
      setTemplateOpen(false);
      router.refresh();
    } catch {
      toast.error("新增失敗");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddOverride(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "override",
          staffId: overrideForm.staffId,
          date: overrideForm.date,
          startTime: overrideForm.startTime || null,
          endTime: overrideForm.endTime || null,
          isAvailable: overrideForm.isAvailable,
          reason: overrideForm.reason || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "新增失敗");
        return;
      }
      toast.success("特殊日期已新增");
      setOverrideOpen(false);
      router.refresh();
    } catch {
      toast.error("新增失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogTrigger className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-neutral-50">
          <Plus className="mr-1 h-4 w-4" />
          新增排班
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增每週排班</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTemplate} className="space-y-4">
            <div className="space-y-2">
              <Label>設計師</Label>
              <select
                value={templateForm.staffId}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, staffId: e.target.value })
                }
                className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                required
              >
                <option value="">請選擇...</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>星期</Label>
              <select
                value={templateForm.dayOfWeek}
                onChange={(e) =>
                  setTemplateForm({
                    ...templateForm,
                    dayOfWeek: parseInt(e.target.value),
                  })
                }
                className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              >
                {DAY_NAMES.map((name, idx) => (
                  <option key={idx} value={idx}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>開始時間</Label>
                <Input
                  type="time"
                  value={templateForm.startTime}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, startTime: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>結束時間</Label>
                <Input
                  type="time"
                  value={templateForm.endTime}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, endTime: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>時段間隔（分鐘）</Label>
              <Input
                type="number"
                min={15}
                step={15}
                value={templateForm.slotInterval}
                onChange={(e) =>
                  setTemplateForm({
                    ...templateForm,
                    slotInterval: parseInt(e.target.value) || 30,
                  })
                }
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "新增中..." : "新增"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={overrideOpen} onOpenChange={setOverrideOpen}>
        <DialogTrigger className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800">
          <Plus className="mr-1 h-4 w-4" />
          特殊日期
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增特殊日期設定</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddOverride} className="space-y-4">
            <div className="space-y-2">
              <Label>設計師</Label>
              <select
                value={overrideForm.staffId}
                onChange={(e) =>
                  setOverrideForm({ ...overrideForm, staffId: e.target.value })
                }
                className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                required
              >
                <option value="">請選擇...</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>日期</Label>
              <Input
                type="date"
                value={overrideForm.date}
                onChange={(e) =>
                  setOverrideForm({ ...overrideForm, date: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>開始時間（留空 = 整天）</Label>
                <Input
                  type="time"
                  value={overrideForm.startTime}
                  onChange={(e) =>
                    setOverrideForm({ ...overrideForm, startTime: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>結束時間</Label>
                <Input
                  type="time"
                  value={overrideForm.endTime}
                  onChange={(e) =>
                    setOverrideForm({ ...overrideForm, endTime: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAvailable"
                checked={overrideForm.isAvailable}
                onChange={(e) =>
                  setOverrideForm({ ...overrideForm, isAvailable: e.target.checked })
                }
              />
              <Label htmlFor="isAvailable">可預約（勾選 = 額外開放，不勾 = 休息）</Label>
            </div>
            <div className="space-y-2">
              <Label>原因</Label>
              <Input
                value={overrideForm.reason}
                onChange={(e) =>
                  setOverrideForm({ ...overrideForm, reason: e.target.value })
                }
                placeholder="例如：國定假日..."
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "新增中..." : "新增"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
