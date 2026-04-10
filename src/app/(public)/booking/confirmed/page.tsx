import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface ConfirmedPageProps {
  searchParams: Promise<{ bookingNo?: string }>;
}

export default async function BookingConfirmedPage({
  searchParams,
}: ConfirmedPageProps) {
  const { bookingNo } = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-24">
      <Card className="text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">預約成功！</CardTitle>
          <CardDescription>
            感謝您的預約，我們會盡快與您確認
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {bookingNo && (
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">預約編號</p>
              <p className="mt-1 text-xl font-bold tracking-wider">
                {bookingNo}
              </p>
            </div>
          )}

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>我們已收到您的預約資訊。</p>
            <p>
              設計師確認後會透過電話或 Email 與您聯繫，請留意來電或信件通知。
            </p>
            <p>如需修改或取消預約，請來電 02-1234-5678。</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/" className={buttonVariants({ variant: "outline" })}>
              返回首頁
            </Link>
            <Link
              href="/booking"
              className={buttonVariants({ className: "bg-rose-500 hover:bg-rose-600" })}
            >
              再次預約
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
