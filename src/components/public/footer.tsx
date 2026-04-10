import { Scissors } from "lucide-react";
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Scissors className="h-5 w-5 text-rose-500" />
              <span className="text-lg font-bold">波妮塔美髮沙龍</span>
            </div>
            <p className="text-sm text-muted-foreground">
              用心打造每一位顧客的美麗，讓您由內而外散發自信光彩。
            </p>
          </div>
          <div>
            <h3 className="mb-4 font-semibold">快速連結</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/services" className="hover:text-foreground">
                  服務項目
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-foreground">
                  線上預約
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-foreground">
                  最新消息
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  聯絡我們
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold">營業資訊</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>營業時間：週一至週六 10:00 - 20:00</li>
              <li>週日公休</li>
              <li>電話：02-1234-5678</li>
              <li>地址：台北市大安區幸福路 123 號</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; 2026 波妮塔美髮沙龍 Bonita Hair Salon. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
