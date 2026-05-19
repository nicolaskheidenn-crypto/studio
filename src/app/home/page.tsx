
"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Coffee, Sparkles, Target, Zap, ArrowRight, Hourglass, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const hasAccess = sessionStorage.getItem("fireproof_access_granted");
    if (hasAccess !== "true") {
      router.push("/");
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,215,0,0.1),transparent)] pointer-events-none" />
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm">
                  <Coffee className="h-4 w-4" />
                  Brewing Success
                </div>
                <h1 className="text-5xl md:text-7xl font-headline font-bold leading-tight">
                  Fail-Proof Your <span className="text-primary">Strategy</span> With a Touch of <span className="text-primary italic">Gold</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                  Welcome, Succemazing. Join our community of high-earning strategists. We provide the tools, you bring the ambition.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="lg" className="rounded-full px-12 py-8 text-2xl shadow-2xl shadow-primary/20 bg-primary hover:bg-white text-[#1f1610] font-black uppercase tracking-tighter" asChild>
                    <Link href="/signup">
                      Get Started Free <ArrowRight className="ml-3 h-6 w-6" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full px-12 py-8 text-2xl border-primary text-primary hover:bg-primary hover:text-[#1f1610] font-black uppercase tracking-tighter" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
                <div className="relative bg-card border-4 border-primary/10 rounded-[2.5rem] p-4 shadow-2xl overflow-hidden">
                  <Image 
                    src="https://picsum.photos/seed/mocha-strategy/800/600" 
                    width={800} 
                    height={600} 
                    alt="Digital Strategy" 
                    className="rounded-[2rem] object-cover"
                    data-ai-hint="mocha coffee workspace"
                  />
                  <div className="absolute bottom-8 left-8 right-8 bg-background/90 backdrop-blur-md p-6 rounded-2xl border shadow-lg animate-in slide-in-from-bottom-10 border-primary/20">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary p-3 rounded-xl shadow-inner">
                        <Zap className="h-6 w-6 text-[#1f1610]" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-primary">Daily Task Ready</p>
                        <p className="text-sm text-muted-foreground">Automated checklist for your morning brew.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl font-headline font-bold uppercase tracking-tight">Why Choose <span className="text-primary italic">FireProof</span>?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto font-medium">We've combined professional digital marketing strategy with a fail-proof execution system.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Goal Focused", desc: "Automated daily tasks designed for high earners.", icon: Target, href: "/task-do" },
                { title: "Future Proof", desc: "GoalCaps lock your vision for 5 years.", icon: Hourglass, href: "/goal-caps" },
                { title: "Host Powered", desc: "Direct access to expert eBooks and strategy bundles.", icon: Star, href: "/dashboard" },
              ].map((feature, i) => (
                <Link key={i} href={feature.href} className="block group transition-all hover:scale-[1.02] active:scale-95">
                  <div className="bg-card p-10 rounded-[2.5rem] border border-primary/10 group-hover:border-primary/50 transition-all shadow-sm group-hover:shadow-2xl h-full">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary transition-colors">
                      <feature.icon className="h-8 w-8 text-primary group-hover:text-[#1f1610]" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight italic">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg font-medium">{feature.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t bg-[#1f1610] text-[#fdfaf6]">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Coffee className="h-6 w-6 text-primary" />
            <span className="text-xl font-headline font-black uppercase tracking-tighter">FireProof</span>
          </div>
          <p className="text-[#fdfaf6]/60 font-black uppercase text-[10px] tracking-widest">© {new Date().getFullYear()} fireproof.ndigtl.app. Stay Gold.</p>
          <div className="flex gap-6">
            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Login</Link>
            <Link href="/signup" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
