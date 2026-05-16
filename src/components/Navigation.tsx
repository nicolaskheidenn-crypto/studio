"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, CheckSquare, Hourglass, Settings, LayoutDashboard, Menu, X, User, Crown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "TaskDo", href: "/task-do", icon: CheckSquare },
  { label: "GoalCaps", href: "/goal-caps", icon: Hourglass },
  { label: "Settings", href: "/settings", icon: Settings },
];

const HOST_EMAIL = "nicolaskheidenn@gmail.com";

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isHost = user?.email === HOST_EMAIL;

  if (isAuthPage) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary transition-colors">
              <Coffee className="h-6 w-6 text-accent" />
            </div>
            <span className="text-2xl font-headline font-bold tracking-tight text-accent">
              FireProof
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 mr-4 border-r pr-6 border-accent/10">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-bold transition-colors hover:text-primary",
                    pathname === item.href ? "text-primary" : "text-accent/70"
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
                  Host Admin
                </Link>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {user ? (
                <Button variant="ghost" className="rounded-full font-bold text-accent gap-2" asChild>
                  <Link href="/settings">
                    <User className="h-4 w-4" />
                    {user.displayName || "Profile"}
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" className="rounded-full font-bold text-accent" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button className="rounded-full bg-accent text-white px-6 hover:bg-accent/90" asChild>
                    <Link href="/signup">Join Now</Link>
                  </Button>
                </>
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
        <div className="md:hidden border-t bg-background p-6 flex flex-col gap-6 animate-in slide-in-from-top">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-4 text-lg font-bold p-3 rounded-2xl",
                pathname === item.href ? "bg-primary/10 text-primary" : "text-accent/70 hover:bg-secondary"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
          {isHost && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 text-lg font-bold p-3 rounded-2xl text-amber-600"
            >
              <Crown className="h-5 w-5" />
              Host Admin
            </Link>
          )}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-accent/10">
            {user ? (
              <Button className="col-span-2 rounded-xl bg-accent text-white font-bold h-12" asChild>
                <Link href="/settings">Settings</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" className="rounded-xl font-bold h-12" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button className="rounded-xl bg-accent text-white font-bold h-12" asChild>
                  <Link href="/signup">Join Now</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}