"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  gender: string | null;
  notes: string | null;
}

export function CustomerEditForm({ customer }: { customer: CustomerData }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: customer.name,
    phone: customer.phone,
    email: customer.email ?? "",
    gender: customer.gender ?? "",
    notes: customer.notes ?? "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "更新失敗");
        return;
      }
      toast.success("顧客資料已更新");
      router.refresh();
    } catch {
      toast.error("更新失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">姓名</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">電話</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">性別</Label>
          <select
            id="gender"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">未指定</option>
            <option value="M">男</option>
            <option value="F">女</option>
            <option value="OTHER">其他</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">備註</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={3}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "儲存中..." : "儲存"}
      </Button>
    </form>
  );
}
