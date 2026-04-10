import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Clock, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "聯絡我們 | 波妮塔美髮沙龍",
  description: "波妮塔美髮沙龍地址、電話、營業時間等聯絡資訊",
};

const CONTACT_INFO = [
  {
    icon: MapPin,
    title: "地址",
    content: "台北市大安區幸福路 123 號",
    extra: "近捷運大安站 3 號出口，步行約 5 分鐘",
  },
  {
    icon: Phone,
    title: "電話",
    content: "02-1234-5678",
    extra: "歡迎來電預約或諮詢",
  },
  {
    icon: Mail,
    title: "Email",
    content: "hello@bonita-salon.com",
    extra: "我們會盡快回覆您的訊息",
  },
  {
    icon: Clock,
    title: "營業時間",
    content: "週一至週六 10:00 - 20:00",
    extra: "週日公休",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      {/* Page Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">聯絡我們</h1>
        <p className="text-lg text-muted-foreground">
          歡迎透過以下方式與我們聯繫，期待為您服務
        </p>
      </div>

      {/* Contact Info Cards */}
      <div className="mb-12 grid gap-4 sm:grid-cols-2">
        {CONTACT_INFO.map((info) => (
          <Card key={info.title}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                  <info.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{info.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{info.content}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {info.extra}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="my-12" />

      {/* Map Placeholder */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">交通指引</h2>
        <div className="overflow-hidden rounded-lg border">
          <div className="flex h-80 items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-50 text-muted-foreground">
            <div className="text-center">
              <MapPin className="mx-auto mb-3 h-10 w-10 text-rose-300" />
              <p className="text-lg font-medium">台北市大安區幸福路 123 號</p>
              <p className="mt-2 text-sm">
                捷運大安站 3 號出口，沿幸福路步行約 5 分鐘即可抵達
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator className="my-12" />

      {/* Additional Notes */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">溫馨提醒</h2>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
            建議提前 10 分鐘到達，以便設計師了解您的需求
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
            如需取消或更改預約，請提前一天來電告知
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
            店內提供免費 Wi-Fi 及茶水服務
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
            首次來店消費可享有新客優惠，詳情請洽店內
          </li>
        </ul>
      </section>
    </div>
  );
}
