"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Flame, Droplets, Leaf, CloudRain, Monitor, User, Shield, Lock, Camera, Save, Eye, EyeOff, CheckCircle2, Copy, Sparkles, Image as ImageIcon } from "lucide-react";
import { useAppStore, type Theme, useUserStore } from "@/lib/store";
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
  
  const { 
    nickname: storeNickname, 
    bio: storeBio, 
    avatarUrl: storeAvatar, 
    coverPhotoUrl: storeCover, 
    updateProfile: updateStoreProfile 
  } = useUserStore();

  const [displayName, setDisplayName] = useState(storeNickname);
  const [bio, setBio] = useState(storeBio);
  const [avatar, setAvatar] = useState(storeAvatar);
  const [cover, setCover] = useState(storeCover);
  const [newPass, setNewPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    applyTheme();
  }, [theme, applyTheme]);

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName });
      }
      updateStoreProfile({
        nickname: displayName,
        bio,
        avatarUrl: avatar,
        coverPhotoUrl: cover
      });
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
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-5xl font-headline font-bold mb-10 text-primary tracking-tighter uppercase">Personalization</h1>
        
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="bg-secondary/40 p-1 rounded-full w-fit shadow-md border border-white/5 backdrop-blur-sm">
            <TabsTrigger value="profile" className="rounded-full px-10 h-12 text-xs font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-background">Identity</TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-full px-10 h-12 text-xs font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-background">Atmosphere</TabsTrigger>
            <TabsTrigger value="privacy" className="rounded-full px-10 h-12 text-xs font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-background">Legal Proof</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[3rem] border-white/5 shadow-2xl overflow-hidden bg-secondary/20">
               <div className="h-48 bg-secondary relative overflow-hidden">
                  {cover && <img src={cover} className="w-full h-full object-cover opacity-50" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
               </div>
               <CardContent className="p-10 -mt-20 relative z-10">
                  <div className="flex flex-col md:flex-row gap-6 items-end mb-10">
                     <div className="w-32 h-32 rounded-[2rem] border-4 border-background bg-primary shadow-2xl overflow-hidden flex items-center justify-center">
                        {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <span className="text-4xl font-black text-background">{displayName[0]}</span>}
                     </div>
                     <div className="pb-2">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">{displayName || "Strategist"}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-[10px] text-primary font-black bg-secondary/60 px-3 py-1 rounded-full uppercase tracking-tighter border border-primary/20">UID: {user?.uid}</code>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:text-white" onClick={copyUid}><Copy className="h-3 w-3" /></Button>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="font-black text-primary/60 uppercase text-[10px] tracking-widest">Nickname</Label>
                        <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="h-14 rounded-2xl bg-background/40 border-primary/10 font-bold text-white px-6 focus:border-primary" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-black text-primary/60 uppercase text-[10px] tracking-widest flex items-center gap-2"><ImageIcon className="h-3 w-3" /> Avatar URL</Label>
                          <Input value={avatar} onChange={e => setAvatar(e.target.value)} className="h-12 rounded-xl bg-background/40 border-primary/10 font-bold text-white text-xs" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-black text-primary/60 uppercase text-[10px] tracking-widest flex items-center gap-2"><ImageIcon className="h-3 w-3" /> Cover URL</Label>
                          <Input value={cover} onChange={e => setCover(e.target.value)} className="h-12 rounded-xl bg-background/40 border-primary/10 font-bold text-white text-xs" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-black flex justify-between text-primary/60 uppercase text-[10px] tracking-widest">Biography <Badge variant="outline" className="h-5 text-[9px] border-primary/20 text-primary">{bio.length}/60</Badge></Label>
                        <Textarea 
                          value={bio} 
                          onChange={e => setBio(e.target.value.substring(0, 60))} 
                          placeholder="Tell your story..." 
                          className="rounded-[1.5rem] bg-background/40 border-primary/10 min-h-[120px] p-6 font-medium text-white leading-relaxed"
                        />
                      </div>
                      <Button onClick={handleUpdateProfile} disabled={isLoading} className="w-full h-16 rounded-full bg-primary text-background font-black text-xl shadow-2xl hover:bg-white transition-all active:scale-95">
                        <Save className="mr-2 h-5 w-5" /> Save Changes
                      </Button>
                    </div>

                    <div className="space-y-8">
                       <div className="p-8 bg-secondary/20 rounded-[2.5rem] border border-white/5 shadow-inner">
                          <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-primary uppercase tracking-tighter"><Shield className="h-6 w-6" /> Security Gate</h3>
                          <div className="space-y-6">
                             <div className="space-y-2">
                                <Label className="font-black text-primary/60 uppercase text-[10px] tracking-widest">New Hub Password</Label>
                                <div className="relative">
                                   <Input 
                                      type={showPass ? "text" : "password"} 
                                      value={newPass} 
                                      onChange={e => setNewPass(e.target.value)}
                                      className="h-14 rounded-2xl bg-background/40 border-primary/10 px-6 font-bold text-white"
                                      placeholder="••••••••"
                                   />
                                   <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary transition-colors">
                                      {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                   </button>
                                </div>
                             </div>
                             <Button variant="outline" onClick={() => {
                               if (newPass) {
                                 updatePassword(auth.currentUser!, newPass)
                                  .then(() => {
                                    toast({ title: "Password Secured" });
                                    setNewPass("");
                                  })
                                  .catch(e => toast({ title: "Error", description: e.message, variant: "destructive" }));
                               }
                             }} className="w-full h-14 rounded-full border-2 border-primary text-primary font-black hover:bg-primary hover:text-background transition-all">
                                Update Security Key
                             </Button>
                          </div>
                       </div>
                    </div>
                  </div>
               </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[3rem] border-white/5 shadow-2xl p-12 bg-secondary/20 backdrop-blur-xl">
              <CardHeader className="text-center mb-10">
                <CardTitle className="text-4xl font-headline font-black text-primary uppercase tracking-tighter">Atmosphere Engine</CardTitle>
                <CardDescription className="text-lg text-foreground/50 font-bold uppercase tracking-widest text-[10px]">Select and lock your preferred animated environment.</CardDescription>
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
                          : "border-white/5 hover:border-primary/20 bg-background/40"
                      )}
                    >
                      <div className={cn("w-14 h-14 rounded-2xl text-white flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:rotate-12", t.color)}>
                        <t.icon className="h-7 w-7" />
                      </div>
                      <div className="text-left space-y-1">
                        <p className="font-black text-2xl text-white flex items-center gap-2 uppercase tracking-tighter">
                          {t.label} {t.id !== 'default' && <Sparkles className="h-4 w-4 text-primary" />}
                        </p>
                        <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">{t.description}</p>
                      </div>
                      {theme === t.id && (
                        <div className="absolute top-6 right-6 h-4 w-4 rounded-full bg-primary animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center">
                  <Button onClick={handleSaveTheme} className="h-20 rounded-full px-20 bg-primary text-background font-black text-2xl shadow-2xl hover:scale-105 transition-transform hover:bg-white">
                    <Save className="h-6 w-6 mr-3" /> LOCK ENVIRONMENT
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="animate-in fade-in slide-in-from-bottom-5">
             <Card className="rounded-[3rem] p-16 shadow-2xl border-white/5 bg-secondary/20 backdrop-blur-lg">
                <h2 className="text-5xl font-headline font-black mb-12 text-center text-primary tracking-tighter uppercase">Legal Proof & Sovereignty</h2>
                <div className="space-y-16 max-w-4xl mx-auto text-lg leading-relaxed text-foreground/80">
                   <section className="space-y-6">
                      <h4 className="text-white text-3xl font-black flex items-center gap-4 uppercase tracking-tighter">
                        <span className="w-12 h-12 bg-primary text-background rounded-2xl flex items-center justify-center text-lg font-black">01</span>
                        Nico Digital Infrastructure
                      </h4>
                      <p className="font-medium">FireProof is a specialized high-focus utility operating exclusively under the <strong className="text-primary uppercase tracking-widest">Nico Digital</strong> parent brand. This is a sovereign business environment designed for elite strategist growth. All intellectual property, interaction logs, and strategic task structures are hosted on Nico Digital's proprietary configuration.</p>
                   </section>
                   <section className="space-y-6">
                      <h4 className="text-white text-3xl font-black flex items-center gap-4 uppercase tracking-tighter">
                        <span className="w-12 h-12 bg-primary text-background rounded-2xl flex items-center justify-center text-lg font-black">02</span>
                        Data Isolation Protocols
                      </h4>
                      <p className="font-medium">Your strategic vision (GoalCaps), your routine (TaskDo), and your internal communication (MeText) are strictly isolated within your UID. Nico Digital implements top-tier Firestore Security Rules to prevent any cross-leakage of data.</p>
                   </section>
                </div>
             </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}