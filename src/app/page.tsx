
"use client";

import { Navigation } from "@/components/Navigation";
import { usePages } from "@/lib/store";
import { ArrowRight, Sparkles, Layout, Globe, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const { pages, isLoaded } = usePages();
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-image');

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 text-center md:text-left space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered Website Builder
                </div>
                <h1 className="text-4xl md:text-6xl font-headline font-bold text-foreground leading-tight">
                  Craft Your Digital Presence with <span className="text-primary">Intelligence</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Build beautiful, responsive content pages in minutes. Use our AI assistant to generate professional drafts and manage everything from a simple dashboard.
                </p>
                <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                  <Button size="lg" className="rounded-full shadow-lg hover:shadow-primary/20" asChild>
                    <Link href="/admin">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-full" asChild>
                    <Link href="/contact">Contact Sales</Link>
                  </Button>
                </div>
              </div>
              <div className="flex-1 relative w-full aspect-video md:aspect-square">
                <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-3xl" />
                <div className="relative h-full w-full rounded-2xl border-4 border-white shadow-2xl overflow-hidden bg-secondary">
                  {heroImg && (
                    <Image
                      src={heroImg.imageUrl}
                      alt={heroImg.description}
                      fill
                      className="object-cover"
                      priority
                      data-ai-hint={heroImg.imageHint}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Pages Section */}
        <section className="py-20 bg-secondary/20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">Explore Our Content</h2>
              <div className="h-1.5 w-20 bg-primary rounded-full" />
            </div>

            {!isLoaded ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pages.map((page) => (
                  <Link key={page.id} href={`/pages/${page.slug}`}>
                    <Card className="h-full hover:shadow-xl transition-all duration-300 group border-none bg-card/50 backdrop-blur">
                      <CardContent className="p-8 space-y-4">
                        <div className="p-3 bg-primary/10 rounded-xl w-fit group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                          <Layout className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-headline font-bold group-hover:text-primary transition-colors">
                          {page.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                          {page.content}
                        </p>
                        <div className="pt-4 flex items-center text-sm font-semibold text-primary">
                          Read More <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Features Mini Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-accent/10 rounded-full">
                  <Zap className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-headline font-bold">Fast Deployment</h3>
                <p className="text-muted-foreground">Go from idea to live page in minutes with our intuitive interface.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-headline font-bold">Responsive First</h3>
                <p className="text-muted-foreground">Every page you build is automatically optimized for all devices.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-accent/10 rounded-full">
                  <Sparkles className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-headline font-bold">AI Assistance</h3>
                <p className="text-muted-foreground">Never stare at a blank page again. Let AI draft your initial content.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t bg-secondary/10">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} WebCraft Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
