"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Flame, Droplets, Leaf, CloudRain, Monitor, User, Shield, Lock, Save, Eye, EyeOff, CheckCircle2, Copy, Sparkles, Upload } from "lucide-react";
import { useAppStore, type Theme, useUserStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { useState, useEffect, useRef } from "react";
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

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    applyTheme();
  }, [theme, applyTheme]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (target === 'avatar') setAvatar(base64);
        if (target === 'cover') setCover(base64);
        toast({ title: "Identity Asset Locked" });
      };
      reader.readAsDataURL(file);
    }
  };

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
      toast({ title: "Profile Synchronized", description: "Your strategist identity is updated." });
    } catch (e: any) {
      toast({ title: "Update Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTheme = () => {
    applyTheme();
    toast({ title: "Atmosphere Locked", description: "The animated environment has been applied." });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
      <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-6xl font-headline font-black mb-12 text-white uppercase tracking-tighter">Settings</h1>
        
        <Tabs defaultValue="profile" className="space-y-10">
          <TabsList className="bg-secondary/40 p-1.5 rounded-full w-fit shadow-2xl border border-primary/10 backdrop-blur-md">
            <TabsTrigger value="profile" className="rounded-full px-12 h-12 text-[10px] font-black uppercase tracking-widest">Identity</TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-full px-12 h-12 text-[10px] font-black uppercase tracking-widest">Atmosphere</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[3.5rem] border-primary/10 shadow-2xl overflow-hidden bg-secondary/20 backdrop-blur-sm">
               <div className="h-64 bg-background relative overflow-hidden group">
                  {cover ? <img src={cover} className="w-full h-full object-cover opacity-60" /> : <div className="w-full h-full bg-primary/5" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                  <Button 
                    onClick={() => coverInputRef.current?.click()}
                    className="absolute top-8 right-8 bg-background/80 text-primary font-black uppercase text-[10px] tracking-widest h-10 px-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Change Cover
                  </Button>
               </div>
               <CardContent className="p-12 -mt-24 relative z-10">
                  <div className="flex flex-col md:flex-row gap-8 items-end mb-12">
                     <div className="relative group">
                        <div className="w-40 h-40 rounded-[2.5rem] border-8 border-background bg-primary shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-center">
                           {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <span className="text-5xl font-black text-background">{displayName[0]}</span>}
                        </div>
                        <Button 
                          onClick={() => avatarInputRef.current?.click()}
                          className="absolute -bottom-2 -right-2 h-12 w-12 rounded-2xl bg-primary text-background p-0 shadow-2xl border-4 border-background"
                        >
                          <Upload className="h-5 w-5" />
                        </Button>
                     </div>
                     <div className="pb-4 space-y-2">
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{displayName}</h2>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-primary/20 text-primary font-black uppercase tracking-widest text-[9px] border-none px-4 py-1">Sovereign Strategist</Badge>
                          <code className="text-[10px] font-bold text-white/30 tracking-tight uppercase">UID: {user?.uid}</code>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <Label className="font-black text-primary uppercase text-[10px] tracking-widest ml-1">Nickname</Label>
                        <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="h-16 rounded-2xl font-black text-xl px-6" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="font-black flex justify-between text-primary uppercase text-[10px] tracking-widest ml-1">
                          Strategic Biography <Badge variant="outline" className="h-5 text-[9px] border-primary/20 text-primary">{bio.length}/60</Badge>
                        </Label>
                        <Textarea 
                          value={bio} 
                          onChange={e => setBio(e.target.value.substring(0, 60))} 
                          placeholder="Your success philosophy..." 
                          className="rounded-[2rem] bg-background/40 min-h-[140px] p-8 text-lg font-medium leading-relaxed"
                        />
                      </div>
                      <Button onClick={handleUpdateProfile} disabled={isLoading} className="w-full h-20 rounded-full bg-primary text-background font-black text-2xl shadow-2xl hover:bg-white transition-all">
                        <Save className="mr-3 h-6 w-6" /> Save Profile
                      </Button>
                    </div>

                    <div className="space-y-10">
                       <div className="p-10 bg-background/40 rounded-[3rem] border-2 border-primary/10 shadow-inner space-y-8">
                          <h3 className="text-2xl font-black flex items-center gap-4 text-white uppercase tracking-tighter"><Lock className="h-8 w-8 text-primary" /> Security Hub</h3>
                          <div className="space-y-6">
                             <div className="space-y-2">
                                <Label className="font-black text-primary uppercase text-[10px] tracking-widest ml-1">New Security Key</Label>
                                <div className="relative">
                                   <Input 
                                      type={showPass ? "text" : "password"} 
                                      value={newPass} 
                                      onChange={e => setNewPass(e.target.value)}
                                      className="h-16 rounded-2xl font-bold px-6 border-2 border-primary/20"
                                      placeholder="••••••••"
                                   />
                                   <button onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary">
                                      {showPass ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                                   </button>
                                </div>
                             </div>
                             <Button variant="outline" onClick={() => {
                               if (newPass) {
                                 updatePassword(auth.currentUser!, newPass)
                                  .then(() => { toast({ title: "Security Key Updated" }); setNewPass(""); })
                                  .catch(e => toast({ title: "Update Failed", description: e.message, variant: "destructive" }));
                               }
                             }} className="w-full h-16 rounded-2xl border-2 border-primary text-primary font-black hover:bg-primary hover:text-background transition-all uppercase tracking-widest text-xs">
                                Update Key
                             </Button>
                          </div>
                       </div>
                    </div>
                  </div>
               </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[3.5rem] border-primary/10 shadow-2xl p-16 bg-secondary/20 backdrop-blur-xl">
              <CardHeader className="text-center mb-12 space-y-4 p-0">
                <CardTitle className="text-5xl font-black text-white uppercase tracking-tighter italic">Atmosphere Engine</CardTitle>
                <CardDescription className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Select and lock your sovereign animated environment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-16 p-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={cn(
                        "group relative overflow-hidden flex flex-col p-10 rounded-[3rem] border-4 transition-all duration-500",
                        theme === t.id 
                          ? "border-primary bg-primary/10 shadow-[0_0_40px_rgba(255,215,0,0.2)] scale-[1.05]" 
                          : "border-primary/5 hover:border-primary/30 bg-background/60"
                      )}
                    >
                      <div className={cn("w-16 h-16 rounded-3xl text-white flex items-center justify-center mb-8 shadow-2xl transition-transform group-hover:rotate-12", t.color)}>
                        <t.icon className="h-8 w-8" />
                      </div>
                      <div className="text-left space-y-2">
                        <p className="font-black text-3xl text-white flex items-center gap-3 uppercase tracking-tighter">
                          {t.label} {t.id !== 'default' && <Sparkles className="h-5 w-5 text-primary" />}
                        </p>
                        <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest leading-relaxed">{t.description}</p>
                      </div>
                      {theme === t.id && (
                        <div className="absolute top-8 right-8 h-5 w-5 rounded-full bg-primary animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center">
                  <Button onClick={handleSaveTheme} className="h-24 rounded-full px-24 bg-primary text-background font-black text-3xl shadow-[0_40px_80px_rgba(255,215,0,0.3)] hover:scale-110 transition-transform">
                    <Save className="h-8 w-8 mr-4" /> Lock Atmosphere
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
