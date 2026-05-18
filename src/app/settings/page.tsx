"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Flame, Droplets, Leaf, CloudRain, Monitor, User, Shield, Lock, Camera, Save, Eye, EyeOff, CheckCircle2, Copy, Sparkles } from "lucide-react";
import { useAppStore, type Theme } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { getAuth, updateProfile, updatePassword } from "firebase/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const THEMES: { id: Theme; label: string; icon: any; color: string; description: string }[] = [
  { id: 'default', label: 'Classic Mocha', icon: Monitor, color: 'bg-zinc-500', description: 'Clean, professional static design.' },
  { id: 'fire', label: 'Volcanic Animated', icon: Flame, color: 'bg-orange-500', description: 'Slow-motion heat gradient flow.' },
  { id: 'water', label: 'Oceanic Animated', icon: Droplets, color: 'bg-blue-500', description: 'Gentle deep-sea wave pulses.' },
  { id: 'nature', label: 'Forest Animated', icon: Leaf, color: 'bg-emerald-500', description: 'Calm breeze-inspired shifts.' },
  { id: 'raining', label: 'Storm Animated', icon: CloudRain, color: 'bg-slate-600', description: 'Dynamic night-sky shimmer.' },
];

export default function SettingsPage() {
  const { theme, setTheme, applyTheme } = useAppStore();
  const { user } = useUser();
  const auth = getAuth();
  
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [newPass, setNewPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
    applyTheme();
  }, [user, applyTheme]);

  const validateBio = (text: string) => {
    const lettersOnly = text.replace(/[^a-zA-Z\s]/g, "");
    if (lettersOnly.length <= 60) {
      setBio(lettersOnly);
    }
  };

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;
    if (bio.length > 0 && bio.length < 15) {
      toast({ title: "Bio Too Short", description: "Minimum 15 characters required.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName });
      toast({ title: "Profile Synchronized", description: "Your strategist identity has been updated." });
    } catch (e: any) {
      toast({ title: "Update Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTheme = () => {
    applyTheme();
    toast({ 
      title: "Atmosphere Locked", 
      description: "The animated environment has been applied globally.",
    });
  };

  const copyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      toast({ title: "UID Copied", description: "Your strategic ID is saved to clipboard." });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-5xl font-headline font-bold mb-10 text-accent tracking-tighter">Personalization</h1>
        
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="bg-white/50 p-1 rounded-full w-fit shadow-md border border-accent/5 backdrop-blur-sm">
            <TabsTrigger value="profile" className="rounded-full px-10 h-12 text-base font-bold">Identity</TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-full px-10 h-12 text-base font-bold">Atmosphere</TabsTrigger>
            <TabsTrigger value="privacy" className="rounded-full px-10 h-12 text-base font-bold">Legal Proof</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[3rem] border-white border-4 shadow-xl overflow-hidden bg-white">
               <div className="h-40 bg-accent relative">
                  <Button variant="outline" size="sm" className="absolute bottom-4 right-6 rounded-full bg-white/30 border-white text-white backdrop-blur-md">
                    <Camera className="h-4 w-4 mr-2" /> Cover Photo
                  </Button>
               </div>
               <CardContent className="p-10 -mt-16 relative z-10">
                  <div className="flex flex-col md:flex-row gap-6 items-end mb-10">
                     <div className="w-32 h-32 rounded-[2rem] border-4 border-white bg-primary shadow-xl flex items-center justify-center text-accent text-4xl font-black uppercase">
                        {user?.displayName?.[0] || "S"}
                     </div>
                     <div className="pb-2">
                        <h2 className="text-3xl font-black text-accent">{user?.displayName || "Strategist"}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs text-muted-foreground bg-secondary/20 px-3 py-1 rounded-full font-bold">UID: {user?.uid}</code>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyUid}><Copy className="h-3 w-3" /></Button>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="font-bold ml-1">Nickname</Label>
                        <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="h-14 rounded-2xl border-2 border-accent/5 bg-secondary/5 font-bold px-6" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold ml-1 flex justify-between">Biography <Badge variant="outline" className="h-5">{bio.length}/60</Badge></Label>
                        <Textarea 
                          value={bio} 
                          onChange={e => validateBio(e.target.value)} 
                          placeholder="Tell your story (15-60 letters only)..." 
                          className="rounded-[1.5rem] border-2 border-accent/5 bg-secondary/5 min-h-[120px] p-6 font-medium"
                        />
                      </div>
                      <Button onClick={handleUpdateProfile} disabled={isLoading} className="w-full h-16 rounded-full bg-accent text-white font-black text-xl shadow-lg">
                        Update Identity
                      </Button>
                    </div>

                    <div className="space-y-8">
                       <div className="p-8 bg-secondary/5 rounded-[2.5rem] border-2 border-dashed border-accent/5">
                          <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-accent"><Shield className="h-6 w-6 text-primary" /> Security</h3>
                          <div className="space-y-6">
                             <div className="space-y-2">
                                <Label className="font-bold">New Hub Password</Label>
                                <div className="relative">
                                   <Input 
                                      type={showPass ? "text" : "password"} 
                                      value={newPass} 
                                      onChange={e => setNewPass(e.target.value)}
                                      className="h-14 rounded-2xl border-2 border-accent/5 px-6"
                                      placeholder="••••••••"
                                   />
                                   <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                      {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                   </button>
                                </div>
                             </div>
                             <Button variant="outline" onClick={() => {
                               if (newPass) {
                                 updatePassword(auth.currentUser!, newPass)
                                  .then(() => toast({ title: "Password Secured" }))
                                  .catch(e => toast({ title: "Error", description: e.message, variant: "destructive" }));
                               }
                             }} className="w-full h-14 rounded-full border-2 border-accent text-accent font-black">
                                Update Password
                             </Button>
                          </div>
                       </div>
                    </div>
                  </div>
               </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[3rem] border-white border-4 shadow-xl p-12 bg-white/90 backdrop-blur-xl">
              <CardHeader className="text-center mb-10">
                <CardTitle className="text-4xl font-headline font-bold text-accent">Atmosphere Engine</CardTitle>
                <CardDescription className="text-lg">Select and lock your preferred animated environment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={cn(
                        "group relative overflow-hidden flex flex-col p-8 rounded-[2rem] border-4 transition-all duration-300",
                        theme === t.id 
                          ? "border-primary bg-primary/10 shadow-inner scale-[1.02]" 
                          : "border-secondary hover:border-accent/20 bg-card/50"
                      )}
                    >
                      <div className={cn("w-14 h-14 rounded-2xl text-white flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:rotate-12", t.color)}>
                        <t.icon className="h-7 w-7" />
                      </div>
                      <div className="text-left space-y-1">
                        <p className="font-black text-2xl text-accent flex items-center gap-2">
                          {t.label} {t.id !== 'default' && <Sparkles className="h-4 w-4 text-primary" />}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.description}</p>
                      </div>
                      {theme === t.id && (
                        <div className="absolute top-6 right-6 h-4 w-4 rounded-full bg-primary animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center">
                  <Button onClick={handleSaveTheme} className="h-20 rounded-full px-20 bg-accent text-white font-black text-2xl shadow-2xl hover:scale-105 transition-transform">
                    <Save className="h-6 w-6 mr-3" /> LOCK ANIMATED WALLPAPER
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="animate-in fade-in slide-in-from-bottom-5">
             <Card className="rounded-[3rem] p-16 shadow-xl border-white border-4 bg-white/95 backdrop-blur-lg">
                <h2 className="text-5xl font-headline font-bold mb-12 text-center text-accent tracking-tighter">Legal Proof & Sovereignty</h2>
                <div className="space-y-16 max-w-4xl mx-auto text-xl leading-relaxed text-muted-foreground">
                   <section className="space-y-6">
                      <h4 className="text-accent text-3xl font-black flex items-center gap-4">
                        <span className="w-12 h-12 bg-primary text-accent rounded-2xl flex items-center justify-center text-lg">01</span>
                        Nico Digital Infrastructure
                      </h4>
                      <p>FireProof is a specialized high-focus utility operating exclusively under the <strong>Nico Digital</strong> parent brand. This is a sovereign business environment designed for elite strategist growth. All intellectual property, interaction logs, and strategic task structures are hosted on Nico Digital's proprietary configuration. We operate with a strict non-centralized data model, prioritizing individual success over mass data harvesting.</p>
                   </section>
                   <section className="space-y-6">
                      <h4 className="text-accent text-3xl font-black flex items-center gap-4">
                        <span className="w-12 h-12 bg-primary text-accent rounded-2xl flex items-center justify-center text-lg">02</span>
                        Data Isolation Protocols
                      </h4>
                      <p>Your strategic vision (GoalCaps), your routine (TaskDo), and your internal communication (MeText) are strictly isolated within your UID. Nico Digital implements top-tier Firestore Security Rules to prevent any cross-leakage of data. We do not sell, share, or monetize user interaction data—your growth is your business, secured by our infrastructure.</p>
                   </section>
                   <section className="space-y-6">
                      <h4 className="text-accent text-3xl font-black flex items-center gap-4">
                        <span className="w-12 h-12 bg-primary text-accent rounded-2xl flex items-center justify-center text-lg">03</span>
                        User Sovereignty
                      </h4>
                      <p>By entering this hub, you agree to the Nico Digital behavior policy. This includes the ethical use of MeText and absolute focus during FireQuizzo sessions. Failure to adhere to these high-standard strategic behaviors may result in UID blacklisting to preserve the hub's elite atmosphere.</p>
                   </section>
                   <section className="space-y-6">
                      <h4 className="text-accent text-3xl font-black flex items-center gap-4">
                        <span className="w-12 h-12 bg-primary text-accent rounded-2xl flex items-center justify-center text-lg">04</span>
                        Business Verification
                      </h4>
                      <p>Nico Digital provides this transparency as proof of a legitimate, high-execution business model. We are a results-driven agency providing the tools for individual earners to achieve peak consistency without the noise of modern centralized platforms.</p>
                   </section>
                </div>
             </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}