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

interface Category {
  id: string;
  name: string;
}

export function ServiceActions({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [loading, setLoading] = useState(false);

  // Add service item dialog
  const [itemOpen, setItemOpen] = useState(false);
  const [itemForm, setItemForm] = useState({
    categoryId: "",
    name: "",
    isBookable: true,
    // Variant fields (simple: one default variant)
    durationMinutes: 60,
    price: 0,
  });

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "category", name: catName }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "新增失敗");
        return;
      }
      toast.success("類別已新增");
      setCatName("");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("新增失敗");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "item",
          categoryId: itemForm.categoryId,
          name: itemForm.name,
          isBookable: itemForm.isBookable,
          durationMinutes: itemForm.durationMinutes,
          price: itemForm.price,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "新增失敗");
        return;
      }
      toast.success("服務項目已新增");
      setItemForm({
        categoryId: "",
        name: "",
        isBookable: true,
        durationMinutes: 60,
        price: 0,
      });
      setItemOpen(false);
      router.refresh();
    } catch {
      toast.error("新增失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50">
          <Plus className="mr-1 h-4 w-4" />
          新增類別
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增服務類別</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="space-y-2">
              <Label>類別名稱</Label>
              <Input
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="例如：剪髮、染髮..."
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "新增中..." : "新增"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={itemOpen} onOpenChange={setItemOpen}>
        <DialogTrigger className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-1 h-4 w-4" />
          新增服務
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增服務項目</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="space-y-2">
              <Label>服務類別</Label>
              <select
                value={itemForm.categoryId}
                onChange={(e) =>
                  setItemForm({ ...itemForm, categoryId: e.target.value })
                }
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">請選擇...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>服務名稱</Label>
              <Input
                value={itemForm.name}
                onChange={(e) =>
                  setItemForm({ ...itemForm, name: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>時長（分鐘）</Label>
                <Input
                  type="number"
                  min={1}
                  value={itemForm.durationMinutes}
                  onChange={(e) =>
                    setItemForm({
                      ...itemForm,
                      durationMinutes: parseInt(e.target.value) || 60,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>價格</Label>
                <Input
                  type="number"
                  min={0}
                  value={itemForm.price}
                  onChange={(e) =>
                    setItemForm({
                      ...itemForm,
                      price: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isBookable"
                checked={itemForm.isBookable}
                onChange={(e) =>
                  setItemForm({ ...itemForm, isBookable: e.target.checked })
                }
              />
              <Label htmlFor="isBookable">可線上預約</Label>
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
