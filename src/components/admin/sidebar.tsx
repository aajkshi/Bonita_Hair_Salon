"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Receipt,
  Scissors,
  Package,
  Clock,
  Newspaper,
  Bell,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "儀表板", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "預約管理", icon: CalendarDays },
  { href: "/admin/customers", label: "顧客管理", icon: Users },
  { href: "/admin/orders", label: "消費紀錄", icon: Receipt },
  { href: "/admin/services", label: "服務項目", icon: Scissors },
  { href: "/admin/products", label: "產品管理", icon: Package },
  { href: "/admin/schedules", label: "時段管理", icon: Clock },
  { href: "/admin/news", label: "最新消息", icon: Newspaper },
  { href: "/admin/notifications", label: "通知紀錄", icon: Bell },
];

function NavLink({
  item,
  active,
  onClick,
}: {
  item: (typeof navItems)[number];
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-white/10 text-white"
          : "text-neutral-400 hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  );
}

function SidebarContent({
  userName,
  onNavigate,
}: {
  userName: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <Link href="/admin" className="text-xl font-bold text-white tracking-wider">
          初相
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isActive(item.href)}
            onClick={onNavigate}
          />
        ))}
      </nav>
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white">
            {userName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-white">{userName}</p>
          </div>
          <ThemeToggle />
          <form action="/api/auth/signout" method="POST">
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function DesktopSidebar({ userName }: { userName: string }) {
  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-neutral-900">
      <SidebarContent userName={userName} />
    </aside>
  );
}

export function MobileSidebar({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-neutral-900 p-0 border-0">
        <SheetTitle className="sr-only">導覽選單</SheetTitle>
        <SidebarContent userName={userName} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
