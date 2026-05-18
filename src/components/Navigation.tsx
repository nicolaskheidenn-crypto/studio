
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, CheckSquare, Hourglass, Settings, LayoutDashboard, Menu, X, User, Crown, BookOpen, MessageCircle, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "Hub", href: "/dashboard", icon: LayoutDashboard },
  { label: "MeText", href: "/dashboard?tab=social", icon: MessageCircle },
  { label: "Shooppy", href: "/dashboard?tab=shooppy", icon: ShoppingBag },
  { label: "TaskDo", href: "/task-do", icon: CheckSquare },
  { label: "Quizzo", href: "/quiz", icon: BookOpen },
  { label: "GoalCaps", href: "/goal-caps", icon: Hourglass },
  { label: "Settings", href: "/settings", icon: Settings },
];

const HOST_EMAIL = "nicolaskheidenn@gmail.com";

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  const isHost = user?.email === HOST_EMAIL;

  if (pathname === "/" && !user) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/home" className="flex items-center gap-3 group">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-headline font-black tracking-tighter text-black leading-none group-hover:text-primary transition-colors">
                ND
              </span>
              <div className="h-1 w-full bg-primary rounded-full" />
            </div>
            <span className="text-xl font-headline font-black tracking-tight text-black hidden sm:block uppercase">
              NICO <span className="text-primary">DIGITAL</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-4 mr-2 border-r pr-6 border-accent/5">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-black transition-colors hover:text-primary uppercase tracking-wider whitespace-nowrap",
                    (pathname === item.href) ? "text-primary" : "text-black/60"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              ))}
              {isHost && (
                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-black text-amber-600 transition-colors hover:text-amber-500 uppercase tracking-wider",
                    pathname === "/admin" ? "text-amber-500 underline" : ""
                  )}
                >
                  <Crown className="h-3.5 w-3.5" />
                  Host
                </Link>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {user ? (
                <Button variant="ghost" className="rounded-full font-black text-xs text-black gap-2 h-9 px-4 uppercase" asChild>
                  <Link href="/settings">
                    <User className="h-4 w-4 text-primary" />
                    {user.displayName?.split(' ')[0] || "Strategist"}
                  </Link>
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" className="rounded-full font-black text-xs uppercase h-9 px-4" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button className="rounded-full bg-black text-white px-6 h-9 font-black text-xs uppercase" asChild>
                    <Link href="/signup">Join</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          <button className="lg:hidden p-2 text-black" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t bg-white p-6 flex flex-col gap-3 animate-in slide-in-from-top">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-4 text-sm font-black p-3 rounded-xl uppercase tracking-widest",
                pathname === item.href ? "bg-primary text-black" : "text-black/60"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          {isHost && (
            <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-sm font-black p-3 rounded-xl text-amber-600 uppercase tracking-widest">
              <Crown className="h-4 w-4" /> Host Terminal
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
