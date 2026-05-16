
"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Flame, Sparkles, Target, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-background">
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold mb-8 animate-bounce">
              <Sparkles className="h-4 w-4" />
              Digital Strategy Powerhouse
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-bold leading-tight mb-8">
              Become <span className="text-primary italic">FireProof</span> in the Digital Era
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              Daily tasks, future planning, and high-performance strategy bundles designed by digital marketing experts to help you earn more.
            </p>
            <div className="flex flex-wrap items-center gap-6 justify-center">
              <Button size="lg" className="rounded-full px-8 py-7 text-xl shadow-xl shadow-primary/20" asChild>
                <Link href="/task-do">
                  Start Daily Task <Zap className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 py-7 text-xl" asChild>
                <Link href="/dashboard">View Bundles</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section className="py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Goal Focused</h3>
                <p className="text-muted-foreground">Stay on track with automated daily tasks specifically for earners.</p>
              </div>
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center">
                  <Hourglass className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Future Proof</h3>
                <p className="text-muted-foreground">Use GoalCaps to lock in your strategy for the next 4-5 years.</p>
              </div>
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center">
                  <Flame className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Host Powered</h3>
                <p className="text-muted-foreground">Directly receive eBooks and bundles from professional strategists.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t bg-card">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground font-medium">© {new Date().getFullYear()} FireProof.ndigtal.app. Built for high performance.</p>
        </div>
      </footer>
    </div>
  );
}
