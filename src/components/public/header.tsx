"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, Scissors } from "lucide-react";

const NAV_ITEMS = [
  { label: "首頁", href: "/" },
  { label: "關於我們", href: "/about" },
  { label: "服務項目", href: "/services" },
  { label: "最新消息", href: "/news" },
  { label: "聯絡我們", href: "/contact" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Scissors className="h-6 w-6 text-rose-500" />
          <span className="text-xl font-bold tracking-wide">波妮塔</span>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            美髮沙龍
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/booking"
            className={buttonVariants({ className: "bg-rose-500 hover:bg-rose-600" })}
          >
            立即預約
          </Link>
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden" />
            }
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <SheetTitle className="sr-only">導航選單</SheetTitle>
            <nav className="mt-8 flex flex-col gap-4">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium transition-colors hover:text-rose-500"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/booking"
                onClick={() => setOpen(false)}
                className={buttonVariants({ className: "mt-4 bg-rose-500 hover:bg-rose-600" })}
              >
                立即預約
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
