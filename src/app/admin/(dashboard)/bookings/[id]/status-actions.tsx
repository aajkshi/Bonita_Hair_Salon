"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BOOKING_STATUS_LABELS } from "@/lib/booking-utils";
import { toast } from "sonner";

const statusButtonStyle: Record<string, string> = {
  CONFIRMED: "bg-blue-600 hover:bg-blue-700 text-white",
  ARRIVED: "bg-purple-600 hover:bg-purple-700 text-white",
  COMPLETED: "bg-green-600 hover:bg-green-700 text-white",
  CANCELLED: "bg-red-600 hover:bg-red-700 text-white",
  REJECTED: "bg-red-600 hover:bg-red-700 text-white",
  EXPIRED: "bg-neutral-600 hover:bg-neutral-700 text-white",
  RESCHEDULED: "bg-orange-600 hover:bg-orange-700 text-white",
};

export function BookingStatusActions({
  bookingId,
  currentStatus,
  allowedTransitions,
  adminNote,
}: {
  bookingId: string;
  currentStatus: string;
  allowedTransitions: string[];
  adminNote: string;
}) {
  const router = useRouter();
  const [note, setNote] = useState(adminNote);
  const [loading, setLoading] = useState(false);

  async function handleStatusChange(newStatus: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, adminNote: note }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "操作失敗");
        return;
      }

      toast.success(`已更新為${BOOKING_STATUS_LABELS[newStatus]}`);
      router.refresh();
    } catch {
      toast.error("操作失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  if (allowedTransitions.length === 0) {
    return <p className="text-sm text-muted-foreground">此預約已無可執行的狀態變更</p>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">管理員備註</label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="選填備註..."
          rows={2}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {allowedTransitions.map((status) => (
          <Button
            key={status}
            onClick={() => handleStatusChange(status)}
            disabled={loading}
            className={statusButtonStyle[status] ?? ""}
          >
            {BOOKING_STATUS_LABELS[status] ?? status}
          </Button>
        ))}
      </div>
    </div>
  );
}
