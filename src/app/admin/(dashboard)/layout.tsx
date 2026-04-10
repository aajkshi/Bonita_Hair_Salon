import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DesktopSidebar, MobileSidebar } from "@/components/admin/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const userName = session.user.name ?? "管理員";

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar userName={userName} />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background px-4 lg:px-8">
          <MobileSidebar userName={userName} />
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{userName}</span>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
