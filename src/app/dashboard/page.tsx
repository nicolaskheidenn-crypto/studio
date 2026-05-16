
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Crown, Plus, Download, Mail } from "lucide-react";
import { useUser } from "@/firebase";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const HOST_EMAIL = "nicolaskheidenn@gmail.com";

export default function DashboardPage() {
  const { user } = useUser();
  const isHost = user?.email === HOST_EMAIL;

  const handleNotifyMe = () => {
    toast({
      title: "Notification Set",
      description: "We'll email you when the next eBook drops!",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-headline font-bold">Welcome, {user?.displayName?.split(' ')[0] || "Strategist"}</h1>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* E-Books Section */}
          <Card className="md:col-span-2 border-accent/10 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Strategic eBooks</CardTitle>
                <CardDescription>New free releases every 2 weeks.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleNotifyMe} className="rounded-full">
                <Mail className="h-4 w-4 mr-2" /> Notify Me
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-secondary/20 rounded-2xl border border-border/50 group hover:border-primary/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-colors">
                    <BookOpen className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold">The Mocha Strategy Vol. 1</h4>
                    <p className="text-sm text-muted-foreground">Released 2 days ago • FREE</p>
                  </div>
                </div>
                <Button variant="ghost" className="rounded-full"><Download className="h-4 w-4 mr-2" /> Download</Button>
              </div>
              
              <div className="flex items-center justify-between p-5 bg-secondary/20 rounded-2xl border border-border/50 opacity-60">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-muted rounded-xl">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-bold">Next Drop: Digital Velocity</h4>
                    <p className="text-sm text-muted-foreground">Unlocks in 12 days</p>
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
            <CardContent className="space-y-4">
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
      </main>
    </div>
  );
}
