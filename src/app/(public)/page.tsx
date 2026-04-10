import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Scissors, Sparkles, Heart, Clock, Star, Palette } from "lucide-react";

const SERVICES = [
  {
    icon: Scissors,
    title: "剪髮",
    description: "量身打造專屬造型，展現您的個人風格",
    price: "NT$300 起",
  },
  {
    icon: Sparkles,
    title: "洗髮",
    description: "舒適的頭皮護理體驗，放鬆身心",
    price: "NT$200 起",
  },
  {
    icon: Palette,
    title: "染髮",
    description: "使用高品質染劑，為您打造亮麗髮色",
    price: "NT$1,500 起",
  },
  {
    icon: Star,
    title: "燙髮",
    description: "溫和燙髮技術，塑造自然蓬鬆捲度",
    price: "NT$2,000 起",
  },
];

const FEATURES = [
  {
    icon: Heart,
    title: "用心服務",
    description: "每位設計師都以真心對待每一位顧客，細心聆聽您的需求，為您量身打造最適合的造型。",
  },
  {
    icon: Sparkles,
    title: "專業技術",
    description: "我們的團隊持續進修最新技術與趨勢，確保為您帶來高品質的專業美髮服務。",
  },
  {
    icon: Clock,
    title: "便利預約",
    description: "透過線上預約系統，隨時隨地輕鬆預約，不再需要漫長等待。",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-background to-pink-50 dark:from-rose-950/20 dark:via-background dark:to-pink-950/20">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-sm font-medium tracking-widest text-rose-500 uppercase">
              Bonita Hair Salon
            </p>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              讓美麗從
              <span className="text-rose-500">這裡</span>
              開始
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              波妮塔美髮沙龍，用專業技術與溫暖服務，為每一位顧客打造獨一無二的亮麗造型。
              從剪染燙到頭皮護理，您的美麗，由我們用心守護。
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/booking"
                className={buttonVariants({ size: "lg", className: "bg-rose-500 hover:bg-rose-600" })}
              >
                立即預約
              </Link>
              <Link
                href="/services"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                瀏覽服務
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative blob */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-rose-100/40 dark:bg-rose-900/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-pink-100/40 dark:bg-pink-900/20 blur-3xl" />
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">我們的服務</h2>
            <p className="text-muted-foreground">
              提供多元專業美髮服務，滿足您的所有造型需求
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((service) => (
              <Card
                key={service.title}
                className="group transition-shadow hover:shadow-lg"
              >
                <CardHeader className="pb-3">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-500 transition-colors group-hover:bg-rose-500 group-hover:text-white">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold text-rose-500">
                    {service.price}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/services" className={buttonVariants({ variant: "outline" })}>
              查看完整服務項目
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-muted/50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">為什麼選擇波妮塔</h2>
            <p className="text-muted-foreground">
              我們致力於提供最優質的美髮體驗
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-500">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-8 py-16 text-center text-white">
            <h2 className="mb-4 text-3xl font-bold">準備好煥然一新了嗎？</h2>
            <p className="mx-auto mb-8 max-w-lg text-rose-100">
              立即線上預約，讓波妮塔的專業設計師為您打造完美造型。
              我們期待與您見面！
            </p>
            <Link
              href="/booking"
              className={buttonVariants({ size: "lg", variant: "secondary", className: "bg-white text-rose-500 hover:bg-rose-50" })}
            >
              立即預約
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
