
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Lock, Award, Trophy, Coffee, FileText, Eye, EyeOff, Loader2, CheckCircle2, User, Sparkles, SmilePlus, Ghost } from "lucide-react";
import { useUserStore, useAdminStore, UserProfile, Badge as BadgeType } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useUser, useFirestore } from "@/firebase";
import { useState, useMemo, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { getAuth, updateProfile, updatePassword } from "firebase/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { doc, setDoc } from 'firebase/firestore';

const DEFAULT_PROFILE: UserProfile = {
  nickname: 'Succemazing',
  bio: '',
  avatarUrl: '',
  coverPhotoUrl: '',
  points: 0,
  xp: 0,
  level: 1,
  streak: 0,
  currentTaskDay: 1,
  lastLogin: null,
  createdAt: new Date().toISOString(),
  completedTaskIds: [],
  capsules: [],
  unlockedBadgeIds: [],
  purchasedProductIds: [],
  stats: {
    quizzesPassed: 0,
    promptsShared: 0,
    triksShared: 0,
    visitedFeatures: [],
    totalDaysInApp: 0
  }
};

const SYSTEM_BADGES: BadgeType[] = [
  { id: 'sb-quiz', title: 'SOVEREIGN MASTERY', description: 'PASSED A STRATEGIC QUIZ PROTOCOL.', difficulty: 'Silver', iconType: 'quiz' },
  { id: 'sb-veteran', title: 'STRATEGIC VETERAN', description: '30 DAYS OF ACTIVE EMPIRE PARTICIPATION.', difficulty: 'Gold', iconType: 'veteran' },
  { id: 'sb-consistency', title: 'CONSISTENCY KING', description: 'COMPLETED A FULL 7-DAY ROUTINE CYCLE.', difficulty: 'Sovereign', iconType: 'consistency' },
  { id: 'sb-explorer', title: 'PROTOCOL EXPLORER', description: 'EXPLORED ALL HUBS OF THE INFRASTRUCTURE.', difficulty: 'Bronze', iconType: 'explorer' },
  { id: 'sb-prompt', title: 'PROMPT ARCHITECT', description: 'UPLOADED 10 AI PROMPT STRATEGIC RESOURCES.', difficulty: 'Silver', iconType: 'prompt' },
  { id: 'sb-trick', title: 'TRICK STRATEGIST', description: 'UPLOADED 10 T&TRIKS TACTICAL RESOURCES.', difficulty: 'Silver', iconType: 'trick' },
  { id: 'sb-level-15', title: 'ELITE EXECUTIONER', description: 'REACHED LEVEL 15 STRATEGIC MASTERY.', difficulty: 'Gold', iconType: 'veteran' },
  { id: 'sb-level-20', title: 'GRAND STRATEGIST', description: 'REACHED LEVEL 20 STRATEGIC MASTERY.', difficulty: 'Gold', iconType: 'veteran' },
  { id: 'sb-level-30', title: 'SOVEREIGN ZENITH', description: 'REACHED THE ABSOLUTE MAXIMUM LEVEL 30 STATUS.', difficulty: 'Sovereign', iconType: 'veteran' },
  { id: 'sb-streak-30', title: 'MONTHLY EXECUTION', description: 'MAINTAINED A 30-DAY CONSISTENCY STREAK.', difficulty: 'Sovereign', iconType: 'consistency' },
];

const MONSTER_AVATARS = [
  { name: 'Alien', url: 'https://api.dicebear.com/7.x/monsters/svg?seed=Alien' },
  { name: 'Blob', url: 'https://api.dicebear.com/7.x/monsters/svg?seed=Blob' },
  { name: 'Fang', url: 'https://api.dicebear.com/7.x/monsters/svg?seed=Fang' },
  { name: 'Gloop', url: 'https://api.dicebear.com/7.x/monsters/svg?seed=Gloop' },
  { name: 'Spike', url: 'https://api.dicebear.com/7.x/monsters/svg?seed=Spike' },
  { name: 'Tentacle', url: 'https://api.dicebear.com/7.x/monsters/svg?seed=Tentacle' },
  { name: 'Zorg', url: 'https://api.dicebear.com/7.x/monsters/svg?seed=Zorg' },
  { name: 'Blink', url: 'https://api.dicebear.com/7.x/monsters/svg?seed=Blink' },
  { name: 'Chomp', url: 'https://api.dicebear.com/7.x/monsters/svg?seed=Chomp' },
  { name: 'Drip', url: 'https://api.dicebear.com/7.x/monsters/svg?seed=Drip' },
];

export default function SettingsPage() {
  const { user } = useUser();
  const uid = user?.uid;
  const db = useFirestore();
  const auth = getAuth();
  
  const profiles = useUserStore(s => s.profiles);
  const profile = useMemo(() => {
    const raw = uid ? profiles[uid] || DEFAULT_PROFILE : DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...raw };
  }, [profiles, uid]);

  const { updateProfile: updateStoreProfile, unlockBadge } = useUserStore();
  const { badges: adminBadges } = useAdminStore();

  const [displayName, setDisplayName] = useState(profile.nickname);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState(profile.avatarUrl);
  
  const [newPass, setNewPass] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Celebration Modal State
  const [unlockedBadge, setUnlockedBadge] = useState<BadgeType | null>(null);

  useEffect(() => {
    if (uid && profiles[uid]) {
      setDisplayName(profiles[uid].nickname);
      setBio(profiles[uid].bio);
      setAvatar(profiles[uid].avatarUrl);
    }
  }, [uid, profiles]);

  const allBadges = useMemo(() => [...SYSTEM_BADGES, ...adminBadges], [adminBadges]);

  // Achievement Check Logic
  useEffect(() => {
    if (!uid) return;

    const handleUnlock = (badgeId: string) => {
      const badge = allBadges.find(b => b.id === badgeId);
      if (badge && !profile.unlockedBadgeIds?.includes(badgeId)) {
        unlockBadge(uid, badgeId);
        setUnlockedBadge(badge);
      }
    };

    if (profile.stats?.quizzesPassed > 0) handleUnlock('sb-quiz');
    if (profile.stats?.totalDaysInApp >= 30) handleUnlock('sb-veteran');
    if (profile.currentTaskDay >= 7 && (profile.completedTaskIds || []).length >= 21) handleUnlock('sb-consistency');
    const required = ['hub', 'shooppy', 'library', 'faq'];
    if (required.every(f => profile.stats?.visitedFeatures?.includes(f))) handleUnlock('sb-explorer');
    if (profile.stats?.promptsShared >= 10) handleUnlock('sb-prompt');
    if (profile.stats?.triksShared >= 10) handleUnlock('sb-trick');
    if (profile.level >= 15) handleUnlock('sb-level-15');
    if (profile.level >= 20) handleUnlock('sb-level-20');
    if (profile.level >= 30) handleUnlock('sb-level-30');
    if (profile.streak >= 30) handleUnlock('sb-streak-30');

  }, [uid, profile, unlockBadge, allBadges]);

  const handleUpdateProfile = async () => {
    if (!uid) return;
    setIsUpdatingProfile(true);
    try {
      if (auth.currentUser) await updateProfile(auth.currentUser, { displayName });
      
      // Update Firestore for global visibility
      const userDocRef = doc(db, 'users', uid);
      await setDoc(userDocRef, {
        nickname: displayName,
        bio: bio,
        avatarUrl: avatar
      }, { merge: true });

      updateStoreProfile(uid, { nickname: displayName, bio, avatarUrl: avatar });
      toast({ title: "Sovereign Profile Updated", description: "Your strategic identity has been synchronized globally." });
    } catch (e) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPass) {
      toast({ title: "Protocol Error", description: "New key required.", variant: "destructive" });
      return;
    }
    if (!auth.currentUser) return;

    setIsUpdatingPass(true);
    try {
      await updatePassword(auth.currentUser, newPass);
      setNewPass("");
      setShowNewPass(false);
      toast({ title: "Root Security Updated", description: "Access key changed successfully." });
    } catch (error: any) {
      toast({ 
        title: "Security Alert", 
        description: error.message.includes("recent-login") 
          ? "Critical security protocol: Please log in again to verify your identity before changing your key." 
          : error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsUpdatingPass(false);
    }
  };

  const selectMonsterAvatar = (url: string) => {
    setAvatar(url);
    setIsAvatarModalOpen(false);
    toast({ title: "Avatar Protocol Selected" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Navigation />
      
      <div className="absolute top-[10%] right-[5%] opacity-10 -rotate-12 pointer-events-none">
        <Coffee className="w-64 h-64 text-primary" />
      </div>
      <div className="absolute bottom-[10%] left-[5%] opacity-5 rotate-12 pointer-events-none">
        <Coffee className="w-80 h-80 text-primary" />
      </div>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl relative z-10">
        <header className="mb-12 space-y-4">
           <h1 className="text-6xl font-headline font-black text-foreground uppercase tracking-tighter italic">Settings</h1>
           <div className="h-1.5 w-24 bg-primary rounded-full shadow-[0_0_15px_rgba(255,215,0,0.3)]" />
        </header>
        
        <Tabs defaultValue="profile" className="space-y-12">
          <TabsList className="bg-[#1f1610] p-1.5 rounded-full w-fit shadow-2xl border-4 border-primary/10 flex gap-2">
            <TabsTrigger value="profile" className="rounded-full px-12 h-12 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-[#1f1610] data-[state=active]:shadow-lg">Identity</TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-full px-12 h-12 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-[#1f1610] data-[state=active]:shadow-lg">Vault</TabsTrigger>
            <TabsTrigger value="privacy" className="rounded-full px-12 h-12 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-[#1f1610] data-[state=active]:shadow-lg">Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <Card className="rounded-[4rem] border-[12px] border-primary/10 bg-mocha-cream p-12 md:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.4)]">
               <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
                  <div className="lg:col-span-3 space-y-10">
                    <div className="space-y-4">
                      <Label className="text-[#1f1610] font-black text-[11px] uppercase tracking-[0.3em]">Nickname</Label>
                      <Input 
                        value={displayName} 
                        onChange={e => setDisplayName(e.target.value)} 
                        className="h-20 font-black text-2xl bg-[#1f1610]/5 border-4 border-[#1f1610]/10 text-[#1f1610] rounded-[2rem] px-8 focus:border-primary transition-all shadow-inner" 
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <Label className="text-[#1f1610] font-black text-[11px] uppercase tracking-[0.3em]">Strategic Bio</Label>
                      <Textarea 
                        value={bio} 
                        onChange={e => setBio(e.target.value)} 
                        placeholder="Document your strategic narrative..."
                        className="min-h-[200px] font-bold text-xl bg-[#1f1610]/5 border-4 border-[#1f1610]/10 text-[#1f1610] rounded-[2.5rem] p-10 focus:border-primary transition-all shadow-inner leading-relaxed placeholder:text-[#1f1610]/20" 
                      />
                    </div>

                    <div className="space-y-4">
                        <Label className="text-[#1f1610] font-black text-[11px] uppercase tracking-[0.3em]">Strategic Avatar</Label>
                        <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
                          <DialogTrigger asChild>
                            <button className="w-full h-20 rounded-[1.5rem] bg-[#1f1610] border-4 border-primary/40 flex items-center justify-between px-10 hover:border-primary transition-all group">
                               <div className="flex items-center gap-6">
                                  {avatar ? (
                                    <div className="w-12 h-12 rounded-xl bg-white border-2 border-primary/20 overflow-hidden shrink-0">
                                      <img src={avatar} className="w-full h-full object-cover" alt="Selected Avatar" />
                                    </div>
                                  ) : (
                                    <SmilePlus className="h-10 w-10 text-primary/40" />
                                  )}
                                  <span className="text-xl font-black text-primary uppercase tracking-tighter italic">Choose your Avatar</span>
                               </div>
                               <Ghost className="h-8 w-8 text-primary/20 group-hover:text-primary transition-colors" />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="rounded-[4rem] border-[12px] border-primary/20 bg-mocha-cream p-16 max-w-4xl shadow-2xl">
                             <DialogHeader className="text-center mb-12 space-y-4">
                                <DialogTitle className="text-6xl font-headline font-black text-[#1f1610] uppercase tracking-tighter italic leading-none">
                                  AVATAR <span className="text-primary">LABORATORY</span>
                                </DialogTitle>
                                <p className="text-[10px] font-black uppercase text-[#1f1610] tracking-[0.4em] opacity-60">SELECT YOUR UNIQUE MONSTER IDENTITY PROTOCOL</p>
                                <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
                             </DialogHeader>
                             <ScrollArea className="h-[500px] pr-4">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
                                   {MONSTER_AVATARS.map((m) => (
                                     <button 
                                      key={m.name}
                                      onClick={() => selectMonsterAvatar(m.url)}
                                      className={cn(
                                        "aspect-square rounded-[2.5rem] bg-white border-[8px] p-2 transition-all hover:scale-105 active:scale-95 shadow-xl group overflow-hidden relative flex flex-col items-center justify-center",
                                        avatar === m.url ? "border-primary shadow-[0_20px_40px_rgba(255,215,0,0.3)]" : "border-[#1f1610]/5 hover:border-primary/40"
                                      )}
                                     >
                                        <div className="absolute top-4 left-6 text-[10px] font-black uppercase tracking-widest text-[#1f1610]/40 z-10">{m.name}</div>
                                        <img src={m.url} className="w-full h-full object-contain" alt={m.name} />
                                     </button>
                                   ))}
                                </div>
                             </ScrollArea>
                          </DialogContent>
                        </Dialog>
                    </div>

                    <Button 
                      onClick={handleUpdateProfile} 
                      disabled={isUpdatingProfile}
                      className="w-full h-24 rounded-full bg-[#1f1610] text-primary font-black text-3xl uppercase shadow-2xl hover:scale-[1.02] active:scale-95 transition-all tracking-tighter"
                    >
                      {isUpdatingProfile ? <Loader2 className="h-10 w-10 animate-spin" /> : 'UPDATE PROTOCOL'}
                    </Button>
                  </div>

                  <div className="lg:col-span-2">
                    <div className="p-12 bg-[#1f1610]/5 rounded-[3.5rem] border-4 border-[#1f1610]/5 space-y-10 shadow-inner">
                      <div className="flex items-center gap-4 text-[#1f1610]">
                        <Lock className="h-8 w-8 text-primary" />
                        <h3 className="text-3xl font-black uppercase tracking-tighter italic">ROOT SECURITY</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <Label className="text-[#1f1610]/40 font-black text-[10px] uppercase tracking-[0.4em]">New Security Key</Label>
                        <div className="relative">
                          <Input 
                            type={showNewPass ? 'text' : 'password'} 
                            placeholder="••••••••" 
                            value={newPass} 
                            onChange={e => setNewPass(e.target.value)} 
                            className="h-20 bg-white border-4 border-[#1f1610]/10 rounded-2xl px-8 pr-16 text-3xl font-black text-[#1f1610] shadow-md focus:border-primary transition-all" 
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowNewPass(!showNewPass)} 
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-[#1f1610]/30 hover:text-primary transition-colors"
                          >
                            {showNewPass ? <Eye className="h-7 w-7" /> : <EyeOff className="h-7 w-7" />}
                          </button>
                        </div>
                      </div>

                      <Button 
                        onClick={handleUpdatePassword}
                        disabled={isUpdatingPass}
                        className="w-full h-20 rounded-2xl bg-[#1f1610] border-4 border-primary/20 text-primary font-black uppercase text-sm hover:bg-primary hover:text-[#1f1610] transition-all shadow-xl tracking-widest"
                      >
                        {isUpdatingPass ? <Loader2 className="h-6 w-6 animate-spin" /> : 'UPDATE ACCESS KEY'}
                      </Button>
                    </div>
                  </div>
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <Card className="rounded-[4.5rem] border-[12px] border-primary/10 bg-mocha-cream p-16 shadow-2xl overflow-hidden">
               <div className="text-center mb-16 space-y-8">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 bg-primary/40 blur-xl rounded-full" />
                    <div className="relative w-20 h-20 bg-primary text-[#1f1610] rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/20">
                      <Trophy className="h-10 w-10" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-6xl font-headline font-black text-[#1f1610] uppercase tracking-tighter italic leading-none">ACHIEVEMENT VAULT</h2>
                    <p className="text-[10px] text-[#1f1610] font-black uppercase tracking-[0.6em] opacity-80">SOVEREIGN MILESTONES UNLOCKED</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {allBadges.map((b) => {
                    const isUnlocked = (profile.unlockedBadgeIds || []).includes(b.id);
                    return (
                      <div key={b.id} className={cn(
                        "p-10 bg-white rounded-[3.5rem] border-[6px] flex items-center gap-10 group transition-all relative overflow-hidden", 
                        isUnlocked ? "border-primary/20 shadow-xl" : "border-[#1f1610]/5 opacity-40"
                      )}>
                         <div className={cn("w-20 h-20 rounded-[1.8rem] flex items-center justify-center shadow-lg border-2 shrink-0 transition-transform group-hover:scale-105", 
                           !isUnlocked ? 'bg-[#1f1610]/5 border-[#1f1610]/5' :
                           b.difficulty === 'Sovereign' ? 'bg-[#1f1610] border-primary/40' : 'bg-primary/10 border-primary/20')}>
                          {isUnlocked ? <Award className={cn("h-10 w-10", b.difficulty === 'Sovereign' ? "text-primary" : "text-primary/60")} /> : <Lock className="h-8 w-8 text-[#1f1610]/10" />}
                       </div>
                       <div className="space-y-2 flex-1">
                         <div className={cn("px-4 py-1 rounded-full w-fit text-[8px] font-black uppercase tracking-[0.3em] mb-1",
                            !isUnlocked ? 'bg-[#1f1610]/5 text-[#1f1610]/20' :
                            b.difficulty === 'Sovereign' ? 'bg-[#1f1610] text-primary' : 'bg-primary/10 text-primary'
                         )}>
                            {b.difficulty}
                         </div>
                         <h4 className="text-2xl md:text-3xl font-black text-[#1f1610] uppercase italic tracking-tighter leading-none">{b.title}</h4>
                         <p className="text-[10px] font-black text-[#1f1610]/40 uppercase tracking-[0.2em] leading-relaxed line-clamp-2">{b.description}</p>
                       </div>
                    </div>
                  )})}
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <Card className="rounded-[4rem] border-[12px] border-primary/10 bg-mocha-cream p-16 shadow-2xl">
              <CardHeader className="text-center pb-12 space-y-6">
                <div className="w-20 h-20 bg-[#1f1610]/5 rounded-full flex items-center justify-center mx-auto border-2 border-[#1f1610]/10">
                  <FileText className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-5xl font-black text-[#1f1610] uppercase italic tracking-tighter">Privacy Policy</CardTitle>
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Protocol Release: May 2026</p>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-10">
                  <div className="prose prose-lg prose-stone max-w-none text-[#1f1610] space-y-10">
                    <p className="text-xl leading-relaxed font-medium">At <strong>Nico Digital</strong>, we are committed to protecting your privacy and building trust through transparency. This Privacy Policy explains how we collect, use, and protect your sovereign data.</p>
                    <div className="space-y-6">
                      <h3 className="text-3xl font-black uppercase italic tracking-tight">1. Information Collection</h3>
                      <p className="leading-relaxed">We collect information to provide, improve, and personalize our services while ensuring a safe and effective learning environment.</p>
                      <ul className="list-disc pl-8 space-y-4 font-bold">
                        <li><strong>Account Protocols</strong>: Strategic email, passkeys, and identity profiles.</li>
                        <li><strong>Temporal Data</strong>: Time Capsule entries and daily routine progress.</li>
                        <li><strong>Visual Assets</strong>: Avatars and gallery uploads.</li>
                      </ul>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-3xl font-black uppercase italic tracking-tight">2. Sovereign Security</h3>
                      <p className="leading-relaxed">We implement high-impact administrative, technical, and physical safeguards. However, no digital infrastructure is completely absolute. Active membership data is retained while your command remains open.</p>
                    </div>
                    <div className="pt-12 border-t-4 border-[#1f1610]/5">
                      <p className="italic text-center font-black text-[#1f1610]/40 uppercase tracking-widest text-xs">
                        By using the infrastructure, you acknowledge these temporal protection protocols.
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Celebration Modal */}
      <Dialog open={!!unlockedBadge} onOpenChange={() => setUnlockedBadge(null)}>
        <DialogContent className="rounded-[5rem] border-[15px] border-primary/20 bg-mocha-cream p-24 max-w-2xl text-center shadow-[0_50px_150px_rgba(255,215,0,0.4)] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.1),transparent)] pointer-events-none" />
          <div className="relative z-10 space-y-12">
            <div className="w-48 h-48 bg-primary text-background rounded-[4rem] flex items-center justify-center mx-auto shadow-2xl animate-bounce border-[10px] border-white/40">
              <Award className="h-24 w-24" />
            </div>
            <div className="space-y-6">
              <h2 className="text-6xl md:text-7xl font-headline font-black text-[#1f1610] uppercase tracking-tighter italic leading-none animate-in zoom-in-90 duration-500">
                MILESTONE REACHED
              </h2>
              <div className="h-2 w-32 bg-primary mx-auto rounded-full" />
              <p className="text-2xl font-black text-[#1f1610] uppercase italic tracking-widest">
                YOU'VE UNLOCKED: <span className="text-primary bg-[#1f1610] px-4 py-1 rounded-lg">{unlockedBadge?.title}</span>
              </p>
            </div>
            <p className="text-lg font-bold text-[#1f1610]/60 uppercase tracking-[0.2em] max-w-sm mx-auto">
              Your sovereign achievement has been archived in the Achievement Vault.
            </p>
            <Button 
              onClick={() => setUnlockedBadge(null)} 
              className="w-full h-24 rounded-full bg-[#1f1610] text-primary font-black text-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-tighter"
            >
              CLAIM TROPHY
            </Button>
          </div>
          <div className="absolute top-10 right-10 animate-pulse"><Sparkles className="h-12 w-12 text-primary/40" /></div>
          <div className="absolute bottom-10 left-10 animate-pulse delay-700"><Sparkles className="h-16 w-16 text-primary/40" /></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
