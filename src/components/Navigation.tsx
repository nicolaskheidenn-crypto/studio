
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  CheckSquare, Hourglass, Settings, LayoutDashboard, 
  Menu, X, User, Crown, BookOpen, HelpCircle,
  Zap, Trophy, Target, ShieldCheck, Share2, ShoppingBag, 
  Fingerprint, Lock
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const HOST_EMAIL = "nicolaskheidenn@gmail.com";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "TaskDo", href: "/task-do", icon: CheckSquare },
  { label: "Quizzo", href: "/quiz", icon: BookOpen },
  { label: "GoalCaps", href: "/goal-caps", icon: Hourglass },
  { label: "Settings", href: "/settings", icon: Settings },
];

const TUTORIAL_STEPS = [
  {
    title: "ROOT HUB",
    desc: "Share your 'Sovereign Wins' and monitor Host broadcasts for protocol updates.",
    icon: LayoutDashboard,
    color: "text-primary"
  },
  {
    title: "TASKDO PROTOCOL",
    desc: "Execute daily routines to earn Points and XP. Complete 30 days for Elite Status.",
    icon: Target,
    color: "text-orange-500"
  },
  {
    title: "PRIVACY SHIELD",
    desc: "All private data, especially GoalCaps, utilize Sovereign Encryption. Your visions are hidden even from the Host.",
    icon: Lock,
    color: "text-red-500"
  },
  {
    title: "FIREQUIZZO",
    desc: "Pass certifications with 85% accuracy. Stay focused—don't trigger the anti-cheat sensor!",
    icon: Trophy,
    color: "text-yellow-500"
  },
  {
    title: "GOALCAPS VAULT",
    desc: "Write future goals and lock them in the temporal vault until your target date.",
    icon: ShieldCheck,
    color: "text-green-500"
  },
  {
    title: "PROTOCOL ACQUISITION",
    desc: "Spend your earned Points in the Hub to acquire free strategic assets base on Level.",
    icon: Zap,
    color: "text-primary"
  },
  {
    title: "LIBRARY LABS",
    desc: "Contribute AI Prompts and Tactical Archives to the collective library.",
    icon: Share2,
    color: "text-blue-500"
  }
];

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  const isHost = user?.email === HOST_EMAIL;

  if (pathname === "/" && !user) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
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

            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="rounded-full h-9 px-5 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 border border-primary/20 gap-2 transition-all active:scale-95 shadow-sm"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  Tutorial
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[4rem] border-[12px] border-primary/20 bg-mocha-cream p-12 max-w-2xl shadow-2xl">
                <DialogHeader className="text-center mb-10 space-y-4">
                  <DialogTitle className="text-5xl font-headline font-black text-[#1f1610] uppercase italic tracking-tighter">
                    SOVEREIGN <span className="text-primary">BRIEFING</span>
                  </DialogTitle>
                  <div className="h-2 w-24 bg-primary mx-auto rounded-full" />
                </DialogHeader>
                <ScrollArea className="h-[550px] pr-6">
                  <div className="space-y-6">
                    {TUTORIAL_STEPS.map((step, i) => (
                      <div key={i} className="flex gap-6 p-8 bg-white rounded-[3rem] border-4 border-[#1f1610]/5 group hover:border-primary/30 transition-all shadow-sm">
                        <div className="w-20 h-20 rounded-[1.5rem] bg-[#1f1610] flex flex-col items-center justify-center shrink-0 shadow-[0_0_30px_-5px_rgba(255,215,0,0.2)] group-hover:scale-105 transition-transform relative border-2 border-primary/10">
                          <step.icon className={cn("h-8 w-8 mb-1", step.color)} />
                          <span className="text-[8px] font-black tracking-widest uppercase !text-[#fdfaf6] relative z-10">STEP 0{i + 1}</span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-2xl font-black text-[#1f1610] uppercase italic tracking-tight">{step.title}</h4>
                          <p className="text-base font-bold text-[#1f1610]/60 leading-snug uppercase tracking-tight">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="p-14 bg-[#1f1610] rounded-[3rem] text-center space-y-8 shadow-[0_0_60px_-15px_rgba(255,215,0,0.4)] border-4 border-primary/30 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.15),transparent)] pointer-events-none" />
                      
                      <div className="space-y-2 relative z-10">
                        <p className="text-[11px] font-black uppercase tracking-[0.6em] !text-[#FFD700] opacity-80">Command Authenticated</p>
                        <p className="font-black uppercase italic text-4xl md:text-5xl tracking-tighter group-hover:scale-105 transition-transform leading-none !text-[#fdfaf6] drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                          STAY GOLD, STRATEGIST.
                        </p>
                      </div>
                      
                      <div className="h-1.5 w-24 bg-primary mx-auto rounded-full relative z-10 shadow-[0_0_25px_rgba(255,215,0,0.8)]" />
                    </div>
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-4 mr-2 border-r pr-6 border-accent/10">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 text-[10px] font-black transition-colors hover:text-primary uppercase tracking-widest whitespace-nowrap",
                    (pathname === item.href) ? "text-primary" : "text-black/40"
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
                    "flex items-center gap-1.5 text-[10px] font-black text-amber-600 transition-colors hover:text-amber-500 uppercase tracking-widest",
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
                <Button variant="ghost" className="rounded-full font-black text-[10px] text-black gap-2 h-9 px-4 uppercase tracking-widest border border-accent/5" asChild>
                  <Link href="/settings">
                    <User className="h-4 w-4 text-primary" />
                    {user.displayName?.split(' ')[0] || "Strategist"}
                  </Link>
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" className="rounded-full font-black text-[10px] uppercase h-9 px-4 tracking-widest" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button className="rounded-full bg-black text-white px-6 h-9 font-black text-[10px] uppercase tracking-widest" asChild>
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

      {isOpen && (
        <div className="lg:hidden border-t bg-white p-6 flex flex-col gap-3 animate-in slide-in-from-top shadow-2xl">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-4 text-xs font-black p-4 rounded-2xl uppercase tracking-[0.2em]",
                pathname === item.href ? "bg-primary text-black" : "text-black/60"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          {isHost && (
            <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-xs font-black p-4 rounded-2xl text-amber-600 uppercase tracking-[0.2em] border-t">
              <Crown className="h-4 w-4" /> Host Terminal
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
