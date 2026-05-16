
"use client";

import { LayoutDashboard, FileText, PlusCircle, Settings, LogOut, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: PlusCircle, label: "New Page", href: "/admin/new" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-secondary/30">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:block">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 group mb-8">
            <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium text-muted-foreground">Exit Admin</span>
          </Link>
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-3">
              Content
            </div>
            <nav className="space-y-1">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="p-4 md:p-8 container mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
