"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Scissors,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { zhTW } from "date-fns/locale";

/* ---------- Types ---------- */

interface ServiceVariant {
  id: string;
  hairLength: string | null;
  durationMinutes: number;
  price: number;
}

interface ServiceItem {
  id: string;
  name: string;
  isBookable: boolean;
  variants: ServiceVariant[];
}

interface ServiceCategory {
  id: string;
  name: string;
  serviceItems: ServiceItem[];
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface SelectedService {
  categoryName: string;
  itemName: string;
  variant: ServiceVariant;
}

/* ---------- Constants ---------- */

const HAIR_LENGTH_LABELS: Record<string, string> = {
  SHORT: "短髮",
  MEDIUM: "中長髮",
  LONG: "長髮",
};

const STEPS = ["選擇服務", "選擇時間", "填寫資料", "確認預約"];

/* ---------- Component ---------- */

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Step 1 - service selection
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    []
  );

  // Step 2 - date & time
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Step 3 - customer info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  // Submission
  const [submitting, setSubmitting] = useState(false);

  // Computed
  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + s.variant.durationMinutes,
    0
  );
  const totalPrice = selectedServices.reduce(
    (sum, s) => sum + s.variant.price,
    0
  );

  /* ---------- Fetch services ---------- */

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoadingServices(false);
      })
      .catch(() => {
        toast.error("無法載入服務項目，請稍後再試");
        setLoadingServices(false);
      });
  }, []);

  /* ---------- Fetch slots ---------- */

  const fetchSlots = useCallback(async () => {
    if (!selectedDate || totalDuration === 0) return;

    setLoadingSlots(true);
    setSelectedSlot(null);

    const dateStr = selectedDate.toISOString().split("T")[0];

    try {
      const res = await fetch(
        `/api/slots?date=${dateStr}&duration=${totalDuration}`
      );
      const data = await res.json();
      setSlots(data);
    } catch {
      toast.error("無法載入可預約時段");
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDate, totalDuration]);

  useEffect(() => {
    if (step === 1 && selectedDate) {
      fetchSlots();
    }
  }, [step, selectedDate, fetchSlots]);

  /* ---------- Toggle service selection ---------- */

  function toggleVariant(
    category: ServiceCategory,
    item: ServiceItem,
    variant: ServiceVariant
  ) {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.variant.id === variant.id);
      if (exists) {
        return prev.filter((s) => s.variant.id !== variant.id);
      }
      // Remove any other variant from the same item
      const filtered = prev.filter(
        (s) =>
          !item.variants.some((v) => v.id === s.variant.id) ||
          s.variant.id === variant.id
      );
      return [
        ...filtered,
        {
          categoryName: category.name,
          itemName: item.name,
          variant,
        },
      ];
    });
  }

  function isVariantSelected(variantId: string) {
    return selectedServices.some((s) => s.variant.id === variantId);
  }

  /* ---------- Submit booking ---------- */

  async function handleSubmit() {
    if (!selectedSlot || !selectedDate) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate.toISOString().split("T")[0],
          startTime: selectedSlot.startTime,
          variantIds: selectedServices.map((s) => s.variant.id),
          customerName,
          customerPhone,
          customerEmail: customerEmail || undefined,
          customerNote: customerNote || undefined,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "預約失敗");
      }

      const data = await res.json();
      router.push(`/booking/confirmed?bookingNo=${data.bookingNo}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "預約失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------- Step validation ---------- */

  function canProceed() {
    switch (step) {
      case 0:
        return selectedServices.length > 0;
      case 1:
        return selectedDate && selectedSlot;
      case 2:
        return customerName.trim() && customerPhone.trim();
      default:
        return false;
    }
  }

  /* ---------- Render ---------- */

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">線上預約</h1>
        <p className="text-muted-foreground">
          只需幾個步驟，輕鬆完成預約
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    i < step
                      ? "bg-rose-500 text-white"
                      : i === step
                        ? "bg-rose-500 text-white"
                        : "bg-neutral-100 text-muted-foreground"
                  }`}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className="mt-1.5 text-xs text-muted-foreground hidden sm:block">
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 transition-colors ${
                    i < step ? "bg-rose-500" : "bg-neutral-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 0: Select Services */}
      {step === 0 && (
        <div className="space-y-6">
          {loadingServices ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
            </div>
          ) : (
            categories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>
                    請選擇您需要的服務項目
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.serviceItems
                    .filter((item) => item.isBookable)
                    .map((item) => (
                      <div key={item.id}>
                        <h4 className="mb-2 text-sm font-semibold">
                          {item.name}
                        </h4>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {item.variants.map((variant) => {
                            const selected = isVariantSelected(variant.id);
                            return (
                              <button
                                key={variant.id}
                                type="button"
                                onClick={() =>
                                  toggleVariant(category, item, variant)
                                }
                                className={`flex flex-col rounded-lg border p-3 text-left text-sm transition-colors ${
                                  selected
                                    ? "border-rose-500 bg-rose-50"
                                    : "hover:border-rose-300"
                                }`}
                              >
                                <span className="font-medium">
                                  {variant.hairLength
                                    ? HAIR_LENGTH_LABELS[variant.hairLength] ??
                                      variant.hairLength
                                    : item.name}
                                </span>
                                <span className="mt-1 text-muted-foreground">
                                  {variant.durationMinutes} 分鐘 | NT$
                                  {variant.price.toLocaleString()}
                                </span>
                                {selected && (
                                  <Badge className="mt-2 w-fit bg-rose-500">
                                    已選擇
                                  </Badge>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))
          )}

          {/* Selected summary */}
          {selectedServices.length > 0 && (
            <Card className="border-rose-200 bg-rose-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">已選擇的服務</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {selectedServices.map((s) => (
                    <li key={s.variant.id} className="flex justify-between">
                      <span>
                        {s.categoryName} - {s.itemName}
                        {s.variant.hairLength &&
                          ` (${HAIR_LENGTH_LABELS[s.variant.hairLength] ?? s.variant.hairLength})`}
                      </span>
                      <span className="font-medium">
                        NT${s.variant.price.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
                <Separator className="my-3" />
                <div className="flex justify-between text-sm font-semibold">
                  <span>
                    預估時間：{totalDuration} 分鐘
                  </span>
                  <span className="text-rose-500">
                    合計：NT${totalPrice.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 1: Select Date & Time */}
      {step === 1 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>選擇日期</CardTitle>
              <CardDescription>請選擇您希望的預約日期</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date ?? undefined);
                  setSelectedSlot(null);
                }}
                locale={zhTW}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today || date.getDay() === 0;
                }}
              />
            </CardContent>
          </Card>

          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle>選擇時段</CardTitle>
                <CardDescription>
                  {selectedDate.toLocaleDateString("zh-TW", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                  })}
                  ，預估服務時間 {totalDuration} 分鐘
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
                  </div>
                ) : slots.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    該日期無可預約時段，請選擇其他日期
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {slots.map((slot) => {
                      const selected =
                        selectedSlot?.startTime === slot.startTime;
                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                            selected
                              ? "border-rose-500 bg-rose-500 text-white"
                              : "hover:border-rose-300"
                          }`}
                        >
                          {slot.startTime}
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 2: Customer Info */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>填寫預約資料</CardTitle>
            <CardDescription>
              請填寫您的聯絡資訊，方便我們與您確認預約
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                姓名 <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="請輸入您的姓名"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                手機號碼 <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="例：0912-345-678"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email（選填）</Label>
              <Input
                id="email"
                type="email"
                placeholder="例：your@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">備註（選填）</Label>
              <Textarea
                id="note"
                placeholder="如有特殊需求，請在此說明"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
                <Scissors className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <CardTitle>確認預約資訊</CardTitle>
                <CardDescription>
                  請確認以下資訊無誤後送出預約
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                預約服務
              </h4>
              <ul className="space-y-1 text-sm">
                {selectedServices.map((s) => (
                  <li key={s.variant.id} className="flex justify-between">
                    <span>
                      {s.categoryName} - {s.itemName}
                      {s.variant.hairLength &&
                        ` (${HAIR_LENGTH_LABELS[s.variant.hairLength] ?? s.variant.hairLength})`}
                    </span>
                    <span>NT${s.variant.price.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                預約時間
              </h4>
              <p className="text-sm">
                {selectedDate?.toLocaleDateString("zh-TW", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </p>
              <p className="text-sm">
                {selectedSlot?.startTime} ~ {selectedSlot?.endTime}
                （約 {totalDuration} 分鐘）
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                顧客資料
              </h4>
              <div className="space-y-1 text-sm">
                <p>姓名：{customerName}</p>
                <p>手機：{customerPhone}</p>
                {customerEmail && <p>Email：{customerEmail}</p>}
                {customerNote && <p>備註：{customerNote}</p>}
              </div>
            </div>

            <Separator />

            <div className="flex justify-between font-semibold">
              <span>預估金額</span>
              <span className="text-rose-500">
                NT${totalPrice.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          上一步
        </Button>

        {step < 3 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="bg-rose-500 hover:bg-rose-600"
          >
            下一步
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-rose-500 hover:bg-rose-600"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                預約中...
              </>
            ) : (
              "確認預約"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
