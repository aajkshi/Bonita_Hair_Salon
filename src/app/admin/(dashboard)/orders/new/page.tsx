"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

interface ServiceCategory {
  id: string;
  name: string;
  serviceItems: ServiceItem[];
}
interface ServiceItem {
  id: string;
  name: string;
  variants: ServiceVariant[];
}
interface ServiceVariant {
  id: string;
  hairLength: string | null;
  durationMinutes: number;
  price: number;
}
interface Product {
  id: string;
  name: string;
  brand: string | null;
  price: number;
}
interface Staff {
  id: string;
  name: string;
}
interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface ServiceLine {
  key: number;
  categoryId: string;
  itemId: string;
  variantId: string;
  serviceName: string;
  categoryName: string;
  hairLength: string | null;
  durationMinutes: number;
  unitPrice: number;
  performedBy: string;
}
interface ProductLine {
  key: number;
  productId: string;
  productName: string;
  brand: string | null;
  unitPrice: number;
  quantity: number;
}

export default function NewOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [customerId, setCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [staffId, setStaffId] = useState("");
  const [serviceLines, setServiceLines] = useState<ServiceLine[]>([]);
  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [lineKey, setLineKey] = useState(0);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [catRes, staffRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/staffs"),
        ]);
        const catData = await catRes.json();
        const staffData = await staffRes.json();
        setCategories(catData);
        setStaffList(staffData);

        // Load products separately
        const prodRes = await fetch("/api/products");
        if (prodRes.ok) {
          setProducts(await prodRes.json());
        }
      } catch {
        toast.error("載入資料失敗");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const searchCustomers = useCallback(async (q: string) => {
    if (q.length < 2) {
      setCustomerResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/customers?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        setCustomerResults(await res.json());
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchCustomers(customerSearch), 300);
    return () => clearTimeout(timer);
  }, [customerSearch, searchCustomers]);

  function addServiceLine() {
    setServiceLines([
      ...serviceLines,
      {
        key: lineKey,
        categoryId: "",
        itemId: "",
        variantId: "",
        serviceName: "",
        categoryName: "",
        hairLength: null,
        durationMinutes: 0,
        unitPrice: 0,
        performedBy: staffId,
      },
    ]);
    setLineKey(lineKey + 1);
  }

  function updateServiceLine(key: number, updates: Partial<ServiceLine>) {
    setServiceLines(
      serviceLines.map((l) => (l.key === key ? { ...l, ...updates } : l))
    );
  }

  function removeServiceLine(key: number) {
    setServiceLines(serviceLines.filter((l) => l.key !== key));
  }

  function addProductLine() {
    setProductLines([
      ...productLines,
      {
        key: lineKey,
        productId: "",
        productName: "",
        brand: null,
        unitPrice: 0,
        quantity: 1,
      },
    ]);
    setLineKey(lineKey + 1);
  }

  function updateProductLine(key: number, updates: Partial<ProductLine>) {
    setProductLines(
      productLines.map((l) => (l.key === key ? { ...l, ...updates } : l))
    );
  }

  function removeProductLine(key: number) {
    setProductLines(productLines.filter((l) => l.key !== key));
  }

  const serviceSubtotal = serviceLines.reduce((sum, l) => sum + l.unitPrice, 0);
  const productSubtotal = productLines.reduce(
    (sum, l) => sum + l.unitPrice * l.quantity,
    0
  );
  const total = serviceSubtotal + productSubtotal - discount;

  async function handleSubmit(settleNow: boolean) {
    if (!selectedCustomer && !customerId) {
      toast.error("請選擇顧客");
      return;
    }
    if (!staffId) {
      toast.error("請選擇設計師");
      return;
    }
    if (serviceLines.length === 0 && productLines.length === 0) {
      toast.error("請至少加入一項服務或產品");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        bookingId: bookingId || undefined,
        customerId: selectedCustomer?.id ?? customerId,
        staffId,
        serviceItems: serviceLines.map((l) => ({
          serviceVariantId: l.variantId || undefined,
          serviceName: l.serviceName,
          categoryName: l.categoryName,
          hairLength: l.hairLength,
          durationMinutes: l.durationMinutes,
          unitPrice: l.unitPrice,
          subtotal: l.unitPrice,
          performedBy: l.performedBy || undefined,
        })),
        productItems: productLines.map((l) => ({
          productId: l.productId || undefined,
          productName: l.productName,
          brand: l.brand,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          subtotal: l.unitPrice * l.quantity,
        })),
        discountAmount: discount,
        paymentMethod,
        settle: settleNow,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "建立失敗");
        return;
      }

      toast.success("消費紀錄已建立");
      router.push("/admin/orders");
    } catch {
      toast.error("建立失敗");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-neutral-500">載入中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">新增消費紀錄</h1>

      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <CardTitle>顧客資訊</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-sm space-y-2">
            <Label>搜尋顧客（姓名或電話）</Label>
            <Input
              placeholder="輸入姓名或電話..."
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setSelectedCustomer(null);
              }}
            />
            {customerResults.length > 0 && !selectedCustomer && (
              <div className="rounded-md border border-neutral-200 bg-white shadow-sm">
                {customerResults.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50 text-left"
                    onClick={() => {
                      setSelectedCustomer(c);
                      setCustomerId(c.id);
                      setCustomerSearch(`${c.name} (${c.phone})`);
                      setCustomerResults([]);
                    }}
                  >
                    <span className="font-medium">{c.name}</span>
                    <span className="text-neutral-500">{c.phone}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedCustomer && (
            <p className="text-sm text-green-700">
              已選擇：{selectedCustomer.name}（{selectedCustomer.phone}）
            </p>
          )}
        </CardContent>
      </Card>

      {/* Staff Selection */}
      <Card>
        <CardHeader>
          <CardTitle>設計師</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm space-y-2">
            <Label>選擇設計師</Label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="">請選擇...</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Service Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>服務項目</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addServiceLine}>
            <Plus className="mr-1 h-4 w-4" />
            新增服務
          </Button>
        </CardHeader>
        <CardContent>
          {serviceLines.length === 0 ? (
            <p className="text-sm text-neutral-500">尚未加入服務項目</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>類別</TableHead>
                  <TableHead>項目</TableHead>
                  <TableHead>方案</TableHead>
                  <TableHead className="text-right">價格</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceLines.map((line) => {
                  const category = categories.find((c) => c.id === line.categoryId);
                  const item = category?.serviceItems.find(
                    (i) => i.id === line.itemId
                  );

                  return (
                    <TableRow key={line.key}>
                      <TableCell>
                        <select
                          value={line.categoryId}
                          onChange={(e) => {
                            const cat = categories.find((c) => c.id === e.target.value);
                            updateServiceLine(line.key, {
                              categoryId: e.target.value,
                              categoryName: cat?.name ?? "",
                              itemId: "",
                              variantId: "",
                              serviceName: "",
                              hairLength: null,
                              durationMinutes: 0,
                              unitPrice: 0,
                            });
                          }}
                          className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                        >
                          <option value="">選擇類別</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell>
                        <select
                          value={line.itemId}
                          onChange={(e) => {
                            const si = category?.serviceItems.find(
                              (i) => i.id === e.target.value
                            );
                            updateServiceLine(line.key, {
                              itemId: e.target.value,
                              serviceName: si?.name ?? "",
                              variantId: "",
                              hairLength: null,
                              durationMinutes: 0,
                              unitPrice: 0,
                            });
                          }}
                          className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                          disabled={!line.categoryId}
                        >
                          <option value="">選擇項目</option>
                          {category?.serviceItems.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.name}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell>
                        <select
                          value={line.variantId}
                          onChange={(e) => {
                            const v = item?.variants.find(
                              (v) => v.id === e.target.value
                            );
                            updateServiceLine(line.key, {
                              variantId: e.target.value,
                              hairLength: v?.hairLength ?? null,
                              durationMinutes: v?.durationMinutes ?? 0,
                              unitPrice: v?.price ?? 0,
                            });
                          }}
                          className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                          disabled={!line.itemId}
                        >
                          <option value="">選擇方案</option>
                          {item?.variants.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.hairLength
                                ? `${v.hairLength === "SHORT" ? "短髮" : v.hairLength === "MEDIUM" ? "中長髮" : "長髮"} - `
                                : ""}
                              {v.durationMinutes}分 $
                              {v.price.toLocaleString()}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${line.unitPrice.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeServiceLine(line.key)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Product Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>產品項目</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addProductLine}>
            <Plus className="mr-1 h-4 w-4" />
            新增產品
          </Button>
        </CardHeader>
        <CardContent>
          {productLines.length === 0 ? (
            <p className="text-sm text-neutral-500">尚未加入產品</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>產品</TableHead>
                  <TableHead>數量</TableHead>
                  <TableHead className="text-right">單價</TableHead>
                  <TableHead className="text-right">小計</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productLines.map((line) => (
                  <TableRow key={line.key}>
                    <TableCell>
                      <select
                        value={line.productId}
                        onChange={(e) => {
                          const prod = products.find((p) => p.id === e.target.value);
                          updateProductLine(line.key, {
                            productId: e.target.value,
                            productName: prod?.name ?? "",
                            brand: prod?.brand ?? null,
                            unitPrice: prod?.price ?? 0,
                          });
                        }}
                        className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                      >
                        <option value="">選擇產品</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} {p.brand ? `(${p.brand})` : ""} - $
                            {p.price.toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) =>
                          updateProductLine(line.key, {
                            quantity: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      ${line.unitPrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${(line.unitPrice * line.quantity).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProductLine(line.key)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary & Payment */}
      <Card>
        <CardHeader>
          <CardTitle>結帳資訊</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
            <div className="space-y-2">
              <Label>付款方式</Label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              >
                <option value="CASH">現金</option>
                <option value="TRANSFER">轉帳</option>
                <option value="OTHER">其他</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>折扣金額</Label>
              <Input
                type="number"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <Separator />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">服務小計</span>
              <span>${serviceSubtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">產品小計</span>
              <span>${productSubtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>折扣</span>
                <span>-${discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>合計</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
            >
              暫存（未結帳）
            </Button>
            <Button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(true)}
            >
              {submitting ? "處理中..." : "結帳"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
