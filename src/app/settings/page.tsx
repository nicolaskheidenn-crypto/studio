
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Flame, Droplets, Leaf, CloudRain, Monitor, User, Shield, Lock, Save, Eye, EyeOff, Sparkles, Upload, Award, Trophy } from "lucide-react";
import { useAppStore, type Theme, useUserStore, useAdminStore } from "@/lib/store";
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
    updateProfile: updateStoreProfile,
    points, level
  } = useUserStore();

  const { badges } = useAdminStore();

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

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      if (auth.currentUser) await updateProfile(auth.currentUser, { displayName });
      updateStoreProfile({ nickname: displayName, bio, avatarUrl: avatar, coverPhotoUrl: cover });
      toast({ title: "Profile Synchronized" });
    } catch (e: any) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const MOCK_BADGES = [
    { id: '1', title: 'Early Earner', difficulty: 'Bronze', description: 'Reach Level 2' },
    { id: '2', title: 'Task Master', difficulty: 'Silver', description: 'Complete 10 Daily Tasks' },
    { id: '3', title: 'Goal Crusher', difficulty: 'Gold', description: 'Seal 5 GoalCaps' },
    { id: '4', title: 'Nico Sovereign', difficulty: 'Sovereign', description: 'Pass 10 Quizzes' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-6xl font-headline font-black mb-12 text-white uppercase tracking-tighter">Settings</h1>
        
        <Tabs defaultValue="profile" className="space-y-10">
          <TabsList className="bg-secondary/40 p-1.5 rounded-full w-fit shadow-xl border border-primary/10 backdrop-blur-md">
            <TabsTrigger value="profile" className="rounded-full px-12 h-12 text-[10px] font-black uppercase tracking-widest">Identity</TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-full px-12 h-12 text-[10px] font-black uppercase tracking-widest">Atmosphere</TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-full px-12 h-12 text-[10px] font-black uppercase tracking-widest">Vault</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-10">
            <Card className="rounded-[3.5rem] border-primary/10 bg-secondary/20 p-12">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <Label className="font-black text-primary uppercase text-[10px] tracking-widest">Nickname</Label>
                      <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="h-16 font-black text-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-primary uppercase text-[10px] tracking-widest">Bio</Label>
                      <Textarea value={bio} onChange={e => setBio(e.target.value)} className="min-h-[140px] font-medium" />
                    </div>
                    <Button onClick={handleUpdateProfile} className="w-full h-20 rounded-full bg-primary text-background font-black text-2xl uppercase shadow-2xl">Update Root Identity</Button>
                  </div>
                  <div className="p-10 bg-background/40 rounded-[3rem] border border-white/5 space-y-6">
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Security</h3>
                    <Input placeholder="New Security Key" className="h-16" value={newPass} onChange={e => setNewPass(e.target.value)} />
                    <Button className="w-full h-14 rounded-2xl border-2 border-primary text-primary font-black uppercase text-xs">Update Access</Button>
                  </div>
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[3.5rem] border-primary/10 bg-secondary/20 p-16">
               <div className="text-center mb-16 space-y-4">
                  <Trophy className="h-16 w-16 mx-auto text-primary" />
                  <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic">Achievement Vault</h2>
                  <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest">Strategy milestones reached</p>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {MOCK_BADGES.map((b) => (
                    <div key={b.id} className="p-10 bg-background/40 rounded-[3rem] border-4 border-white/5 flex items-center gap-8 group hover:border-primary transition-all">
                       <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform", 
                         b.difficulty === 'Bronze' ? 'bg-orange-800' : 
                         b.difficulty === 'Silver' ? 'bg-slate-400' : 
                         b.difficulty === 'Gold' ? 'bg-primary' : 'bg-purple-900')}>
                          <Award className="h-10 w-10 text-white" />
                       </div>
                       <div>
                         <Badge className="mb-2 bg-white/10 text-white text-[8px] uppercase">{b.difficulty}</Badge>
                         <h4 className="text-2xl font-black text-white uppercase tracking-tight">{b.title}</h4>
                         <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{b.description}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[3.5rem] border-primary/10 bg-secondary/20 p-16 space-y-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {THEMES.map((t) => (
                    <button key={t.id} onClick={() => setTheme(t.id)} className={cn("flex flex-col p-10 rounded-[3rem] border-4 transition-all", theme === t.id ? "border-primary bg-primary/10" : "border-white/5 bg-background/60")}>
                      <div className={cn("w-16 h-16 rounded-3xl text-white flex items-center justify-center mb-8 shadow-2xl", t.color)}>
                        <t.icon className="h-8 w-8" />
                      </div>
                      <p className="font-black text-3xl text-white uppercase tracking-tighter">{t.label}</p>
                    </button>
                  ))}
                </div>
                <Button onClick={() => { applyTheme(); toast({ title: "Atmosphere Locked" }); }} className="w-full h-24 rounded-full bg-primary text-background font-black text-3xl shadow-2xl">Lock Atmosphere</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
