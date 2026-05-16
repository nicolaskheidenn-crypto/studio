
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Flame, Droplets, Leaf, CloudRain, Monitor } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const THEMES = [
  { id: 'default', label: 'Classic', icon: Monitor, color: 'bg-zinc-500' },
  { id: 'fire', label: 'Fire', icon: Flame, color: 'bg-orange-500' },
  { id: 'water', label: 'Water', icon: Droplets, color: 'bg-blue-500' },
  { id: 'nature', label: 'Nature', icon: Leaf, color: 'bg-emerald-500' },
  { id: 'raining', label: 'Raining', icon: CloudRain, color: 'bg-slate-600' },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <h1 className="text-4xl font-headline font-bold">Settings</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Personalization</CardTitle>
              <CardDescription>Choose your environment to stay focused.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                      theme === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className={cn("p-3 rounded-xl text-white", t.color)}>
                      <t.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold">{t.label}</p>
                      <p className="text-xs text-muted-foreground">Select {t.label.toLowerCase()} mode</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your strategist profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-xl">
                <div>
                  <p className="font-bold">Host Permissions</p>
                  <p className="text-sm text-muted-foreground">Manage tasks and bundles</p>
                </div>
                <Button variant="outline">Request Elevation</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
