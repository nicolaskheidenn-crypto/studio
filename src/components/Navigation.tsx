
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, CheckSquare, Hourglass, Settings, LayoutDashboard, Menu, X, User, Crown, BookOpen, MessageCircle, Bell } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "MeText", href: "/dashboard?tab=social", icon: MessageCircle },
  { label: "TaskDo", href: "/task-do", icon: CheckSquare },
  { label: "FireQuizzo", href: "/quiz", icon: BookOpen },
  { label: "GoalCaps", href: "/goal-caps", icon: Hourglass },
  { label: "Settings", href: "/settings", icon: Settings },
];

const HOST_EMAIL = "nicolaskheidenn@gmail.com";

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/";
  const isHost = user?.email === HOST_EMAIL;

  // Don't show nav if user is on entry gate and not logged in
  if (pathname === "/" && !user) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-20 items-center justify-between">
          <Link href="/home" className="flex items-center gap-2 group">
            <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary transition-colors">
              <Coffee className="h-6 w-6 text-accent" />
            </div>
            <span className="text-2xl font-headline font-bold tracking-tight text-accent">
              FireProof
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-5 mr-2 border-r pr-6 border-accent/10">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-bold transition-colors hover:text-primary",
                    (pathname === item.href || (item.label === "MeText" && pathname === "/dashboard")) ? "text-primary" : "text-accent/70"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              {isHost && (
                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center gap-2 text-sm font-bold text-amber-600 transition-colors hover:text-amber-500",
                    pathname === "/admin" ? "text-amber-500 underline" : ""
                  )}
                >
                  <Crown className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative rounded-full text-accent">
                <Bell className="h-6 w-6" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-accent border-2 border-background">2</Badge>
              </Button>
              {user ? (
                <Button variant="ghost" className="rounded-full font-bold text-accent gap-2" asChild>
                  <Link href="/settings">
                    <User className="h-4 w-4" />
                    {user.displayName?.split(' ')[0] || "Strategist"}
                  </Link>
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" className="rounded-full font-bold text-accent" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button className="rounded-full bg-accent text-white px-6 hover:bg-accent/90" asChild>
                    <Link href="/signup">Join Now</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          <button className="md:hidden p-2 text-accent" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t bg-background p-6 flex flex-col gap-4 animate-in slide-in-from-top">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-4 text-lg font-bold p-3 rounded-2xl",
                pathname === item.href ? "bg-primary/10 text-primary" : "text-accent/70"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
          {isHost && (
            <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-lg font-bold p-3 rounded-2xl text-amber-600">
              <Crown className="h-5 w-5" /> Admin
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
