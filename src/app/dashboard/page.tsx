
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Package, Crown, Plus, Edit } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useState } from "react";

export default function DashboardPage() {
  const { isAdmin, setIsAdmin } = useAppStore();
  const [showBundles, setShowBundles] = useState(true);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-headline font-bold">Welcome, Strategist</h1>
            <p className="text-muted-foreground">Manage your fail-proof empire here.</p>
          </div>
          <Button variant="outline" onClick={() => setIsAdmin(!isAdmin)}>
            {isAdmin ? "Host Mode Active" : "View as Host"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* E-Books Section */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Free eBooks</CardTitle>
                <CardDescription>New releases every 2 weeks.</CardDescription>
              </div>
              {isAdmin && (
                <Button size="sm" className="rounded-full">
                  <Plus className="h-4 w-4 mr-1" /> Add Ebook
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/20 rounded-lg">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold">Digital Mastery Vol. {i}</h4>
                      <p className="text-sm text-muted-foreground">Available until: {new Date(Date.now() + 1209600000).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="ghost">Download</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Bundles Section */}
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Premium Bundles
              </CardTitle>
              <CardDescription>Earn more with these specialized packs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-background rounded-xl border border-primary/20 shadow-sm">
                <h4 className="font-bold">Growth Accelerator</h4>
                <p className="text-xs text-muted-foreground mb-4">Master the funnel strategy in 7 days.</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">$49.99</span>
                  <Button size="sm" className="rounded-full">Buy Now</Button>
                </div>
              </div>
              <div className="p-4 bg-background rounded-xl border border-primary/20 shadow-sm">
                <h4 className="font-bold">Strategy Blueprint</h4>
                <p className="text-xs text-muted-foreground mb-4">Complete 12-month digital roadmap.</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">$99.99</span>
                  <Button size="sm" className="rounded-full">Buy Now</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
