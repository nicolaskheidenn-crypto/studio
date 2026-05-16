
"use client";

import { usePages } from "@/lib/store";
import { Navigation } from "@/components/Navigation";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Page } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import Link from "next/link";

export default function PublicPage() {
  const { pages, isLoaded } = usePages();
  const params = useParams();
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);

  useEffect(() => {
    if (isLoaded) {
      const found = pages.find(p => p.slug === params.slug);
      if (found) {
        setPage(found);
      }
    }
  }, [isLoaded, pages, params.slug]);

  if (!isLoaded) return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-20 flex flex-col items-center gap-4">
        <div className="w-1/2 h-8 bg-muted animate-pulse rounded" />
        <div className="w-full h-64 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );

  if (!page) return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-6xl font-headline font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8 text-center">We couldn't find the page you're looking for.</p>
        <Button asChild className="rounded-full shadow-lg">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        <article className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-4xl">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-12 transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <header className="mb-12 space-y-4">
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-foreground">
              {page.title}
            </h1>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(page.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {Math.ceil(page.content.split(/\s+/).length / 200)} min read
              </span>
            </div>
            <div className="h-1.5 w-24 bg-primary rounded-full" />
          </header>

          <div className="prose prose-lg prose-blue max-w-none text-foreground/90 leading-relaxed space-y-6">
            {page.content.split('\n').map((paragraph, idx) => (
              paragraph.trim() ? <p key={idx} className="text-lg md:text-xl">{paragraph}</p> : <br key={idx} />
            ))}
          </div>
        </article>
      </main>

      <footer className="py-12 border-t bg-secondary/10 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} WebCraft Hub. Crafting the web, one page at a time.</p>
        </div>
      </footer>
    </div>
  );
}
