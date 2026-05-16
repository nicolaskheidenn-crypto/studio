
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Flame, Droplets, Leaf, CloudRain, Monitor, User, Shield, Lock, Camera } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { getAuth, updateProfile, updatePassword } from "firebase/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const THEMES = [
  { id: 'default', label: 'Classic', icon: Monitor, color: 'bg-zinc-500' },
  { id: 'fire', label: 'Fire', icon: Flame, color: 'bg-orange-500' },
  { id: 'water', label: 'Water', icon: Droplets, color: 'bg-blue-500' },
  { id: 'nature', label: 'Nature', icon: Leaf, color: 'bg-emerald-500' },
  { id: 'raining', label: 'Raining', icon: CloudRain, color: 'bg-slate-600' },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useAppStore();
  const { user } = useUser();
  const auth = getAuth();
  
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;
    setIsLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName });
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
    } catch (e: any) {
      toast({ title: "Update Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!auth.currentUser || !newPassword) return;
    setIsLoading(true);
    try {
      await updatePassword(auth.currentUser, newPassword);
      setNewPassword("");
      toast({ title: "Password Updated", description: "Security settings saved." });
    } catch (e: any) {
      toast({ title: "Update Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl font-headline font-bold">Settings</h1>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-muted p-1 rounded-full">
              <TabsTrigger value="profile" className="rounded-full px-6">Profile</TabsTrigger>
              <TabsTrigger value="appearance" className="rounded-full px-6">Appearance</TabsTrigger>
              <TabsTrigger value="privacy" className="rounded-full px-6">Privacy & Policy</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Personal Profile</CardTitle>
                  <CardDescription>Manage your public identity and credentials.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6 pb-6 border-b">
                    <div className="relative">
                      <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center border-2 border-primary/20">
                        <User className="h-12 w-12 text-accent/50" />
                      </div>
                      <Button size="icon" variant="outline" className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 bg-background">
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{user?.displayName || "Strategist"}</h4>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                      <p className="text-xs font-mono mt-1 text-muted-foreground">ID: {user?.uid}</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nickname">Nickname / Full Name</Label>
                      <Input 
                        id="nickname" 
                        value={displayName} 
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your display name"
                      />
                    </div>
                    <Button onClick={handleUpdateProfile} disabled={isLoading} className="w-fit">Save Changes</Button>
                  </div>

                  <div className="pt-6 border-t space-y-4">
                    <h3 className="font-bold flex items-center gap-2"><Lock className="h-4 w-4" /> Security</h3>
                    <div className="space-y-2">
                      <Label htmlFor="password">Change Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    <Button variant="outline" onClick={handleChangePassword} disabled={isLoading} className="w-fit">Update Password</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Monitor className="h-5 w-5" /> Personalization</CardTitle>
                  <CardDescription>Choose your environment to stay focused.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {THEMES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left bg-card",
                          theme === t.id ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
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
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Privacy & Policy</CardTitle>
                  <CardDescription>How we handle your fail-proof strategy data.</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                  <h4 className="text-foreground">1. Data Isolation</h4>
                  <p>All your tasks, goal capsules, and progress data are encrypted and accessible only by you. We use industry-standard Firebase security protocols to ensure your strategy remains private.</p>
                  
                  <h4 className="text-foreground">2. Communication</h4>
                  <p>By using fireproof.ndigtl.app, you agree to receive strategic updates and eBook notifications via your registered email. You can opt-out at any time.</p>

                  <h4 className="text-foreground">3. Cookie Policy</h4>
                  <p>We use local storage only to remember your theme preferences and login session. No third-party tracking cookies are utilized.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
