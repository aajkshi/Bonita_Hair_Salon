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

export function ProductActions() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    brand: "",
    price: 0,
    stockQuantity: 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "新增失敗");
        return;
      }
      toast.success("產品已新增");
      setForm({ name: "", brand: "", price: 0, stockQuantity: 0 });
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("新增失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        <Plus className="mr-1 h-4 w-4" />
        新增產品
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增產品</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>產品名稱</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>品牌</Label>
            <Input
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>價格</Label>
              <Input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: parseInt(e.target.value) || 0 })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>庫存數量</Label>
              <Input
                type="number"
                min={0}
                value={form.stockQuantity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    stockQuantity: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "新增中..." : "新增"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
