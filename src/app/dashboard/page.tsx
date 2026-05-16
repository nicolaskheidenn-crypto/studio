"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Crown, Download, Mail, Lock } from "lucide-react";
import { useUser } from "@/firebase";
import { toast } from "@/hooks/use-toast";

const HOST_EMAIL = "nicolaskheidenn@gmail.com";

export default function DashboardPage() {
  const { user, loading } = useUser();
  const isHost = user?.email === HOST_EMAIL;

  const handleNotifyMe = () => {
    toast({
      title: "Notification Set",
      description: "We'll email you when the next eBook drops!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-headline font-bold text-2xl">Loading Strategist Hub...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-headline font-bold">Welcome, Succemazing</h1>
            <p className="text-muted-foreground">Manage your fail-proof empire here at fireproof.ndigtl.app.</p>
          </div>
          {isHost && (
            <Button className="bg-amber-600 hover:bg-amber-500 rounded-full" asChild>
              <a href="/admin">
                <Crown className="h-4 w-4 mr-2" /> Host Management
              </a>
            </Button>
          )}
        </div>

        {!user ? (
          <div className="max-w-md mx-auto py-20 text-center space-y-6">
            <div className="p-12 bg-accent/5 rounded-[3rem] border border-dashed border-accent/20">
              <Lock className="h-16 w-16 mx-auto text-accent/20 mb-4" />
              <h2 className="text-3xl font-headline font-bold">Member Access Required</h2>
              <p className="text-muted-foreground mt-2 text-lg">Sign in to access your exclusive eBooks, bundles, and progress tracking.</p>
              <Button className="mt-8 rounded-full px-12 py-6 text-lg font-bold shadow-lg" asChild>
                <a href="/login">Sign In to FireProof</a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* E-Books Section */}
            <Card className="md:col-span-2 border-accent/10 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-accent/5">
                <div>
                  <CardTitle>Upcoming eBooks</CardTitle>
                  <CardDescription>New free releases every 2 weeks.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleNotifyMe} className="rounded-full border-accent text-accent">
                  <Mail className="h-4 w-4 mr-2" /> Notify Me
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between p-5 bg-secondary/20 rounded-2xl border border-border/50 group hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/20 rounded-xl group-hover:bg-primary transition-colors">
                      <BookOpen className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-bold">The Mocha Strategy Vol. 1</h4>
                      <p className="text-sm text-muted-foreground">Released recently • FREE</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="rounded-full text-accent hover:text-accent font-bold"><Download className="h-4 w-4 mr-2" /> Download</Button>
                </div>
                
                <div className="flex items-center justify-between p-5 bg-secondary/20 rounded-2xl border border-border/50 opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-muted rounded-xl">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-bold">Next Drop: Digital Velocity</h4>
                      <p className="text-sm text-muted-foreground">Unlocks soon</p>
                    </div>
                  </div>
                  <Button variant="ghost" disabled className="rounded-full">Locked</Button>
                </div>
              </CardContent>
            </Card>

            {/* Bundles Section */}
            <Card className="border-primary/50 bg-primary/5 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Premium Bundles
                </CardTitle>
                <CardDescription>Accelerate your growth path.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="p-5 bg-background rounded-2xl border border-primary/20 shadow-sm">
                  <h4 className="font-bold">Growth Accelerator</h4>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">Master the funnel strategy in 7 days with live coaching sessions.</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-accent">$49.99</span>
                    <Button size="sm" className="rounded-full bg-accent hover:bg-accent/90">Buy Now</Button>
                  </div>
                </div>
                <div className="p-5 bg-background rounded-2xl border border-primary/20 shadow-sm">
                  <h4 className="font-bold">Strategy Blueprint</h4>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">A complete 12-month digital roadmap for six-figure earners.</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-accent">$99.99</span>
                    <Button size="sm" className="rounded-full bg-accent hover:bg-accent/90">Buy Now</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
