
"use client";

import { usePages } from "@/lib/store";
import { Navigation } from "@/components/Navigation";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Page } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Calendar, Coffee } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function PublicPage() {
  const { pages, isLoaded } = usePages();
  const params = useParams();
  const [page, setPage] = useState<Page | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    if (isLoaded) {
      const found = pages.find(p => p.slug === params.slug);
      if (found) {
        setPage(found);
      }
    }
  }, [isLoaded, pages, params.slug]);

  if (!isHydrated || !isLoaded) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-20 flex flex-col items-center gap-8 animate-pulse">
        <div className="w-1/2 h-16 bg-primary/10 rounded-full" />
        <div className="w-full h-96 bg-primary/5 rounded-[4rem]" />
      </div>
    </div>
  );

  if (!page) return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8">
        <Coffee className="h-32 w-32 text-primary opacity-20" />
        <h1 className="text-8xl font-headline font-black text-primary italic">404</h1>
        <p className="text-2xl font-bold text-foreground/40 uppercase tracking-widest italic">Protocol Path Not Found</p>
        <Button asChild className="rounded-full h-20 px-12 bg-primary text-[#1f1610] font-black text-xl uppercase shadow-2xl">
          <Link href="/">Return to Root</Link>
        </Button>
      </div>
    </div>
  );

  const readingTime = Math.ceil(page.content.split(/\s+/).length / 200);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute top-[10%] right-[-10%] opacity-5 pointer-events-none rotate-12">
          <Coffee className="h-[600px] w-[600px] text-primary" />
        </div>

        <article className="container mx-auto px-4 md:px-6 py-16 md:py-24 max-w-4xl relative z-10">
          <Link 
            href="/home" 
            className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 hover:text-primary mb-16 transition-all group"
          >
            <ArrowLeft className="mr-3 h-4 w-4 group-hover:-translate-x-2 transition-transform" />
            BACK TO INFRASTRUCTURE
          </Link>
          
          <header className="mb-20 space-y-8">
            <h1 className="text-6xl md:text-8xl font-headline font-black text-foreground uppercase tracking-tighter italic leading-none">
              {page.title}
            </h1>
            
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-3 bg-primary/10 px-6 py-2 rounded-full border border-primary/20">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                  {new Date(page.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3 bg-[#1f1610] px-6 py-2 rounded-full border border-primary/20">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                  {readingTime} MIN EXECUTION
                </span>
              </div>
            </div>
            
            <div className="h-2 w-48 bg-primary rounded-full shadow-[0_0_20px_rgba(255,215,0,0.3)]" />
          </header>

          <div className="text-xl md:text-2xl font-medium text-foreground/80 leading-[1.8] space-y-10 italic">
            {page.content.split('\n').map((paragraph, idx) => (
              paragraph.trim() ? (
                <p key={idx} className="first-letter:text-5xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left">
                  {paragraph}
                </p>
              ) : <div key={idx} className="h-8" />
            ))}
          </div>
        </article>
      </main>

      <footer className="py-20 border-t-4 border-primary/10 bg-[#1f1610] mt-32">
        <div className="container mx-auto px-4 text-center space-y-4">
          <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.8em]">Sovereign Content Infrastructure</p>
          <p className="text-sm font-bold text-[#fdfaf6]/60">© {new Date().getFullYear()} NICO DIGITAL. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
