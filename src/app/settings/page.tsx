
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Flame, Droplets, Leaf, CloudRain, Monitor, User, Shield, Lock, Award, Trophy } from "lucide-react";
import { useAppStore, type Theme, useUserStore, useAdminStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { useState, useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { getAuth, updateProfile } from "firebase/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const THEMES: { id: Theme; label: string; icon: any; color: string }[] = [
  { id: 'default', label: 'Classic Mocha', icon: Monitor, color: 'bg-zinc-500' },
  { id: 'fire', label: 'Volcanic', icon: Flame, color: 'bg-orange-500' },
  { id: 'water', label: 'Oceanic', icon: Droplets, color: 'bg-blue-500' },
  { id: 'nature', label: 'Forest', icon: Leaf, color: 'bg-emerald-500' },
  { id: 'raining', label: 'Storm', icon: CloudRain, color: 'bg-slate-600' },
];

export default function SettingsPage() {
  const { theme, setTheme, applyTheme } = useAppStore();
  const { user } = useUser();
  const auth = getAuth();
  
  const { 
    nickname: storeNickname, bio: storeBio, 
    avatarUrl: storeAvatar, coverPhotoUrl: storeCover, 
    updateProfile: updateStoreProfile,
    points, level
  } = useUserStore();

  const { badges } = useAdminStore();

  const [displayName, setDisplayName] = useState(storeNickname);
  const [bio, setBio] = useState(storeBio);
  const [avatar, setAvatar] = useState(storeAvatar);
  const [cover, setCover] = useState(storeCover);
  const [newPass, setNewPass] = useState("");

  useEffect(() => {
    applyTheme();
  }, [theme, applyTheme]);

  const handleUpdateProfile = async () => {
    try {
      if (auth.currentUser) await updateProfile(auth.currentUser, { displayName });
      updateStoreProfile({ nickname: displayName, bio, avatarUrl: avatar, coverPhotoUrl: cover });
      toast({ title: "Sovereign Profile Updated" });
    } catch (e) {
      toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-6xl font-headline font-black mb-12 text-foreground uppercase tracking-tighter italic">Settings</h1>
        
        <Tabs defaultValue="profile" className="space-y-10">
          <TabsList className="bg-card/40 p-1.5 rounded-full w-fit shadow-md border-2 border-primary/10">
            <TabsTrigger value="profile" className="rounded-full px-12 h-12 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-background">Identity</TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-full px-12 h-12 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-background">Atmosphere</TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-full px-12 h-12 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-background">Vault</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
            <Card className="rounded-[3.5rem] border-4 border-primary/10 bg-card/40 p-12 shadow-xl">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <Label>Nickname</Label>
                      <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="h-16 font-black text-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Strategic Bio</Label>
                      <Textarea value={bio} onChange={e => setBio(e.target.value)} className="min-h-[140px] font-medium" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div><Label>Avatar</Label><Input type="file" onChange={e => handleFile(e, setAvatar)} className="mt-2 h-12" /></div>
                       <div><Label>Cover</Label><Input type="file" onChange={e => handleFile(e, setCover)} className="mt-2 h-12" /></div>
                    </div>
                    <Button onClick={handleUpdateProfile} className="w-full h-20 rounded-full bg-primary text-background font-black text-2xl uppercase shadow-xl active:scale-95 transition-all">Update Protocol</Button>
                  </div>
                  <div className="p-10 bg-primary/5 rounded-[3rem] border-2 border-primary/10 space-y-8">
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground flex items-center gap-3"><Lock className="h-6 w-6 text-primary" /> Root Security</h3>
                    <div className="space-y-2">
                      <Label>New Security Key</Label>
                      <Input type="password" placeholder="••••••••" value={newPass} onChange={e => setNewPass(e.target.value)} className="h-16" />
                    </div>
                    <Button className="w-full h-16 rounded-2xl bg-background border-2 border-primary text-primary font-black uppercase text-xs hover:bg-primary hover:text-background transition-all">Update Access Key</Button>
                  </div>
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="animate-in fade-in slide-in-from-bottom-4">
            <Card className="rounded-[3.5rem] border-4 border-primary/10 bg-card/40 p-16 shadow-xl">
               <div className="text-center mb-16 space-y-4">
                  <Trophy className="h-16 w-16 mx-auto text-primary" />
                  <h2 className="text-5xl font-black text-foreground uppercase tracking-tighter italic">Achievement Vault</h2>
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest">Strategy milestones unlocked</p>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {badges.length === 0 ? (
                    <p className="col-span-full text-center text-foreground/30 font-black uppercase italic py-20">No badges deployed by the Host.</p>
                  ) : badges.map((b) => (
                    <div key={b.id} className="p-10 bg-background/40 rounded-[3rem] border-4 border-transparent flex items-center gap-8 group hover:border-primary transition-all shadow-sm">
                       <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform", 
                         b.difficulty === 'Bronze' ? 'bg-[#cd7f32]' : 
                         b.difficulty === 'Silver' ? 'bg-[#c0c0c0]' : 
                         b.difficulty === 'Gold' ? 'bg-primary' : 'bg-purple-900')}>
                          <Award className="h-10 w-10 text-white" />
                       </div>
                       <div>
                         <Badge className="mb-2 bg-primary text-background text-[8px] uppercase border-none">{b.difficulty}</Badge>
                         <h4 className="text-2xl font-black text-foreground uppercase tracking-tight italic">{b.title}</h4>
                         <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{b.description}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="animate-in fade-in slide-in-from-bottom-4">
            <Card className="rounded-[3.5rem] border-4 border-primary/10 bg-card/40 p-16 space-y-16 shadow-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {THEMES.map((t) => (
                    <button key={t.id} onClick={() => setTheme(t.id)} className={cn("flex flex-col p-10 rounded-[3rem] border-4 transition-all shadow-md", theme === t.id ? "border-primary bg-primary/10" : "border-primary/5 bg-background/60")}>
                      <div className={cn("w-16 h-16 rounded-2xl text-white flex items-center justify-center mb-8 shadow-xl", t.color)}>
                        <t.icon className="h-8 w-8" />
                      </div>
                      <p className="font-black text-2xl text-foreground uppercase tracking-tighter italic">{t.label}</p>
                    </button>
                  ))}
                </div>
                <Button onClick={() => { applyTheme(); toast({ title: "Atmosphere Engine Locked" }); }} className="w-full h-24 rounded-full bg-primary text-background font-black text-3xl shadow-2xl active:scale-95 transition-all uppercase tracking-tighter">LOCK ENVIRONMENT</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
