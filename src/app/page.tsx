
"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Coffee, Sparkles, Target, Zap, ArrowRight, Hourglass, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-accent font-bold text-sm">
                  <Coffee className="h-4 w-4" />
                  Brewing Success Since 2024
                </div>
                <h1 className="text-5xl md:text-7xl font-headline font-bold leading-tight">
                  Fail-Proof Your <span className="text-accent">Strategy</span> With a Touch of <span className="text-primary">Gold</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                  Welcome to FireProof. Join our community of high-earning strategists. We provide the tools, you bring the ambition.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="lg" className="rounded-full px-8 py-7 text-xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground font-bold" asChild>
                    <Link href="/signup">
                      Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full px-8 py-7 text-xl border-accent text-accent hover:bg-accent hover:text-white" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center overflow-hidden">
                        <Image src={`https://picsum.photos/seed/user${i}/32/32`} width={32} height={32} alt="User" />
                      </div>
                    ))}
                  </div>
                  <span>Joined by 1,000+ earners today</span>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
                <div className="relative bg-card border-4 border-accent/10 rounded-[2rem] p-4 shadow-2xl overflow-hidden">
                  <Image 
                    src="https://picsum.photos/seed/mocha-strategy/800/600" 
                    width={800} 
                    height={600} 
                    alt="Digital Strategy" 
                    className="rounded-[1.5rem] object-cover"
                    data-ai-hint="mocha coffee workspace"
                  />
                  <div className="absolute bottom-8 left-8 right-8 bg-background/90 backdrop-blur-md p-6 rounded-2xl border shadow-lg animate-in slide-in-from-bottom-10">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary p-3 rounded-xl">
                        <Zap className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Daily Task Ready</p>
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
        <section className="py-24 bg-accent/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl font-headline font-bold">Why Choose <span className="text-accent">FireProof</span>?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">We've combined professional digital marketing strategy with a fail-proof execution system.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Goal Focused", desc: "Automated daily tasks designed for earners.", icon: Target },
                { title: "Future Proof", desc: "GoalCaps lock your strategy for 5 years.", icon: Hourglass },
                { title: "Host Powered", desc: "Direct access to expert eBooks and bundles.", icon: Star },
              ].map((feature, i) => (
                <div key={i} className="bg-card p-8 rounded-3xl border border-accent/10 hover:border-primary/50 transition-all group shadow-sm">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                    <feature.icon className="h-7 w-7 text-accent group-hover:text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t bg-accent text-accent-foreground">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Coffee className="h-6 w-6 text-primary" />
            <span className="text-xl font-headline font-bold">FireProof<span className="text-primary">.Hub</span></span>
          </div>
          <p className="text-accent-foreground/70 font-medium">© {new Date().getFullYear()} FireProof.ndigtal.app. Stay Gold.</p>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-primary transition-colors">Login</Link>
            <Link href="/signup" className="hover:text-primary transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
