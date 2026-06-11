"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Shield, Lock, Award, Trophy, Coffee, 
  Eye, EyeOff, Loader2, User, ShieldCheck, 
  Fingerprint, Target, Zap, MailPlus, LogOut, 
  Trash2, AlertTriangle, CheckCircle2, BookOpen, Flame, Share2, LayoutDashboard
} from "lucide-react";
import { useUserStore, UserProfile } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useUser, useFirestore } from "@/firebase";
import { useState, useMemo, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { getAuth, updateProfile, updatePassword, verifyBeforeUpdateEmail, signOut, deleteUser } from "firebase/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from "next/navigation";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const DEFAULT_PROFILE: UserProfile = {
  nickname: 'Strategist',
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
  claimedRewardWeeks: [],
  stats: {
    quizzesPassed: 0,
    promptsShared: 0,
    triksShared: 0,
    visitedFeatures: [],
    totalDaysInApp: 0
  }
};

export default function SettingsPage() {
  const { user } = useUser();
  const uid = user?.uid;
  const db = useFirestore();
  const auth = getAuth();
  const router = useRouter();
  
  const profiles = useUserStore(s => s.profiles);
  const profile = useMemo(() => {
    const raw = uid ? profiles[uid] || DEFAULT_PROFILE : DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...raw };
  }, [profiles, uid]);

  const { updateProfile: updateStoreProfile, resetUserStats } = useUserStore();

  const [displayName, setDisplayName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [newPass, setNewPass] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (uid && profiles[uid] && !isInitialized) {
      setDisplayName(profiles[uid].nickname);
      setIsInitialized(true);
    }
  }, [uid, profiles, isInitialized]);

  const handleUpdateProfile = async () => {
    if (!uid || !auth.currentUser) return;
    setIsUpdatingProfile(true);
    try {
      await updateProfile(auth.currentUser, { displayName });
      
      const userDocRef = doc(db, 'users', uid);
      setDoc(userDocRef, {
        nickname: displayName
      }, { merge: true })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'update',
          requestResourceData: { nickname: displayName },
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });

      updateStoreProfile(uid, { nickname: displayName });
      toast({ title: "Callsign Updated", description: "Your strategic identity has been synchronized." });
    } catch (e) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail || !auth.currentUser) {
      toast({ title: "Protocol Error", description: "Valid email required.", variant: "destructive" });
      return;
    }
    setIsUpdatingEmail(true);
    try {
      await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
      toast({ 
        title: "Authorization Dispatched", 
        description: "Check your new inbox for the confirmation link to complete the binding." 
      });
      setNewEmail("");
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        toast({ title: "Security Threshold", description: "Please re-authenticate to confirm this identity shift.", variant: "destructive" });
      } else {
        toast({ title: "Binding Error", description: error.message, variant: "destructive" });
      }
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPass || !auth.currentUser) {
      toast({ title: "Protocol Error", description: "New key required.", variant: "destructive" });
      return;
    }
    setIsUpdatingPass(true);
    try {
      await updatePassword(auth.currentUser, newPass);
      setNewPass("");
      setShowNewPass(false);
      toast({ title: "Security Key Updated", description: "Access protocol re-established." });
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        toast({ title: "Security Threshold", description: "Recent login required. Please logout and back in.", variant: "destructive" });
      } else {
        toast({ title: "Security Alert", description: error.message, variant: "destructive" });
      }
    } finally {
      setIsUpdatingPass(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      if (uid) resetUserStats(uid);
      router.push("/");
      toast({ title: "Session Terminated", description: "Sovereign cache cleared." });
    } catch (e) {
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser || !confirm("CRITICAL: This will permanently purge your strategist identity. Proceed?")) return;
    setIsDeleting(true);
    try {
      await deleteUser(auth.currentUser);
      if (uid) resetUserStats(uid);
      router.push("/");
      toast({ title: "Identity Purged", description: "All data cleared from the registry." });
    } catch (error: any) {
      toast({ title: "Purge Failed", description: "Please re-authenticate and try again.", variant: "destructive" });
      setIsDeleting(false);
    }
  };

  const ACHIEVEMENTS = [
    { id: 'lv1', req: 'LEVEL 1', label: 'MASTER STRATEGIST', icon: User, check: (p: UserProfile) => p.level >= 1 },
    { id: 'lv10', req: 'LEVEL 10', label: 'ELITE EXECUTIONER', icon: Zap, check: (p: UserProfile) => p.level >= 10 },
    { id: 'lv20', req: 'LEVEL 20', label: 'GRAND STRATEGIST', icon: Target, check: (p: UserProfile) => p.level >= 20 },
    { id: 'lv30', req: 'LEVEL 30', label: 'SOVEREIGN ZENITH', icon: ShieldCheck, check: (p: UserProfile) => p.level >= 30 },
    { id: 'quiz10', req: '10 QUIZZES', label: 'QUIZ VETERAN', icon: BookOpen, check: (p: UserProfile) => (p.stats?.quizzesPassed || 0) >= 10 },
    { id: 'streak30', req: '30 DAY STREAK', label: 'CONSISTENCY KING', icon: Flame, check: (p: UserProfile) => (p.streak || 0) >= 30 },
    { id: 'share5', req: '5 INJECTIONS', label: 'KNOWLEDGE SOURCE', icon: Share2, check: (p: UserProfile) => ((p.stats?.promptsShared || 0) + (p.stats?.triksShared || 0)) >= 5 },
    { id: 'explorer', req: 'ALL HUBS', label: 'GRID EXPLORER', icon: LayoutDashboard, check: (p: UserProfile) => (p.stats?.visitedFeatures || []).length >= 5 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Navigation />
      
      <div className="absolute top-[10%] left-[-5%] opacity-[0.03] pointer-events-none rotate-12 scale-[1.2] animate-pulse duration-[8000ms] will-change-transform">
        <User className="w-[200px] h-[200px] text-primary" />
      </div>
      <div className="absolute bottom-[10%] right-[-5%] opacity-[0.03] pointer-events-none -rotate-12 scale-[1.2] animate-pulse duration-[10000ms] will-change-transform">
        <ShieldCheck className="w-[220px] h-[220px] text-primary" />
      </div>
      <div className="absolute top-[40%] right-[10%] opacity-[0.02] pointer-events-none scale-[1.1] will-change-transform">
        <Coffee className="w-[180px] h-[180px] text-primary" />
      </div>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl relative z-10">
        <header className="mb-12 space-y-4 text-center sm:text-left">
           <h1 className="text-6xl font-headline font-black text-foreground uppercase tracking-tighter italic leading-none">Settings</h1>
           <div className="h-1.5 w-24 bg-primary rounded-full shadow-[0_0_15px_rgba(255,215,0,0.3)] mx-auto sm:mx-0" />
        </header>
        
        <Tabs defaultValue="identity" className="space-y-12">
          <TabsList className="bg-[#1f1610] p-1.5 rounded-full w-fit shadow-2xl border-4 border-primary/10 flex gap-2 mx-auto sm:mx-0 overflow-x-auto scrollbar-hide">
            <TabsTrigger value="identity" className="rounded-full px-10 h-11 text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-[#1f1610]">Identity</TabsTrigger>
            <TabsTrigger value="security" className="rounded-full px-10 h-11 text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-[#1f1610]">Security</TabsTrigger>
            <TabsTrigger value="vault" className="rounded-full px-10 h-11 text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-[#1f1610]">Vault</TabsTrigger>
            <TabsTrigger value="control" className="rounded-full px-10 h-11 text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-[#1f1610]">Control</TabsTrigger>
          </TabsList>

          <TabsContent value="identity" className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <Card className="rounded-[4rem] border-[10px] border-primary/10 bg-mocha-cream p-12 md:p-16 shadow-2xl">
               <div className="max-w-2xl mx-auto space-y-12">
                  <div className="text-center space-y-3">
                    <User className="h-12 w-12 text-[#1f1610]/20 mx-auto" />
                    <h3 className="text-4xl font-black text-[#1f1610] uppercase italic tracking-tighter">Identity Protocol</h3>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[#1f1610] font-black text-[11px] uppercase tracking-[0.4em]">Active Callsign</Label>
                    <Input 
                      value={displayName} 
                      onChange={e => setDisplayName(e.target.value)} 
                      className="h-20 font-black text-3xl bg-[#1f1610]/5 border-4 border-[#1f1610]/10 text-[#1f1610] rounded-[2rem] px-8 text-center focus:border-primary transition-all shadow-inner uppercase tracking-widest italic" 
                    />
                  </div>

                  <Button 
                    onClick={handleUpdateProfile} 
                    disabled={isUpdatingProfile}
                    className="w-full h-24 rounded-full bg-[#1f1610] text-primary font-black text-2xl uppercase shadow-2xl hover:scale-[1.02] active:scale-95 transition-all tracking-tighter border-4 border-primary/10"
                  >
                    {isUpdatingProfile ? <Loader2 className="h-10 w-10 animate-spin" /> : 'UPDATE CALLSIGN'}
                  </Button>
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Card className="rounded-[3.5rem] border-[8px] border-primary/10 bg-card/40 p-10 shadow-2xl space-y-8">
                 <div className="flex items-center gap-4 text-primary">
                    <MailPlus className="h-8 w-8" />
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter m-0">Email Binding</h3>
                 </div>
                 <div className="space-y-4">
                    <Label className="text-primary/40 font-black text-[10px] uppercase tracking-[0.4em]">New Strategic Email</Label>
                    <Input 
                      type="email" 
                      placeholder="name@example.com" 
                      value={newEmail} 
                      onChange={e => setNewEmail(e.target.value)} 
                      className="h-16 bg-background/50 border-4 border-primary/10 rounded-2xl px-6 text-xl font-bold focus:border-primary transition-all" 
                    />
                    <Button 
                      onClick={handleUpdateEmail}
                      disabled={isUpdatingEmail}
                      className="w-full h-16 rounded-2xl bg-primary text-[#1f1610] font-black uppercase text-xs hover:scale-105 transition-all shadow-xl tracking-widest"
                    >
                      {isUpdatingEmail ? <Loader2 className="h-5 w-5 animate-spin" /> : 'BIND NEW EMAIL'}
                    </Button>
                 </div>
              </Card>

              <Card className="rounded-[3.5rem] border-[8px] border-primary/10 bg-card/40 p-10 shadow-2xl space-y-8">
                 <div className="flex items-center gap-4 text-primary">
                    <Lock className="h-8 w-8" />
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter m-0">Security Key</h3>
                 </div>
                 <div className="space-y-4">
                    <Label className="text-primary/40 font-black text-[10px] uppercase tracking-[0.4em]">New Access Key</Label>
                    <div className="relative">
                      <Input 
                        type={showNewPass ? 'text' : 'password'} 
                        placeholder="••••••••" 
                        value={newPass} 
                        onChange={e => setNewPass(e.target.value)} 
                        className="h-16 bg-background/50 border-4 border-primary/10 rounded-2xl px-6 pr-14 text-xl font-bold focus:border-primary transition-all" 
                      />
                      <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-primary/30 hover:text-primary transition-colors">
                        {showNewPass ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                      </button>
                    </div>
                    <Button 
                      onClick={handleUpdatePassword}
                      disabled={isUpdatingPass}
                      className="w-full h-16 rounded-2xl bg-[#1f1610] border-4 border-primary/20 text-primary font-black uppercase text-xs hover:scale-105 transition-all shadow-xl tracking-widest"
                    >
                      {isUpdatingPass ? <Loader2 className="h-5 w-5 animate-spin" /> : 'UPDATE ACCESS KEY'}
                    </Button>
                 </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vault" className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <Card className="rounded-[4rem] border-[10px] border-primary/10 bg-mocha-cream p-12 md:p-16 shadow-2xl">
              <ScrollArea className="h-[650px] pr-10">
                <div className="space-y-12 text-[#1f1610]">
                  {/* Achievement Vault Re-engineered */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 text-[#1f1610]">
                       <Trophy className="h-10 w-10 text-primary" />
                       <h3 className="text-4xl font-black uppercase italic tracking-tighter m-0">Achievement Vault</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {ACHIEVEMENTS.map((item) => {
                        const isUnlocked = item.check(profile);
                        return (
                          <div key={item.id} className={cn(
                            "p-10 rounded-[3.5rem] border-4 flex flex-col items-center text-center gap-6 transition-all shadow-xl min-h-[340px] justify-between relative",
                            isUnlocked 
                              ? "bg-[#1f1610] text-primary border-primary shadow-[0_30px_60px_rgba(255,215,0,0.15)] scale-[1.02]" 
                              : "bg-[#1f1610]/5 text-[#1f1610]/30 border-[#1f1610]/10 opacity-60"
                          )}>
                            <div className={cn(
                              "w-24 h-24 rounded-[1.8rem] flex items-center justify-center border-2 shadow-inner transition-colors",
                              isUnlocked ? "bg-primary/10 border-primary" : "bg-[#1f1610]/5 border-[#1f1610]/10"
                            )}>
                              <item.icon className={cn("h-12 w-12", isUnlocked ? "text-primary" : "text-[#1f1610]/20")} />
                            </div>
                            <div className="space-y-3 w-full">
                              <p className={cn(
                                "text-[10px] font-black uppercase tracking-widest", 
                                isUnlocked ? "text-white" : "text-[#1f1610]/40"
                              )}>
                                {item.req}
                              </p>
                              <div className="flex flex-col items-center gap-1">
                                {item.label.split(' ').map((word, idx) => (
                                  <div key={idx} className={cn(
                                    "px-4 py-1.5 skew-x-[-15deg] min-w-fit w-full max-w-[200px] flex items-center justify-center leading-none",
                                    isUnlocked ? "bg-blue-700" : "bg-[#1f1610]/5"
                                  )}>
                                    <p className={cn(
                                      "text-lg font-black uppercase italic tracking-tighter text-white skew-x-[15deg] whitespace-nowrap",
                                      !isUnlocked && "text-[#1f1610]/10"
                                    )}>
                                      {word}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="h-10 flex items-center justify-center">
                              {isUnlocked && <CheckCircle2 className="h-6 w-6 text-primary fill-primary/10 animate-in zoom-in" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-1 bg-[#1f1610]/5 rounded-full" />

                  <div className="p-8 bg-[#1f1610] text-primary rounded-[2.5rem] border-4 border-primary/30 space-y-4">
                     <div className="flex items-center gap-4">
                        <Fingerprint className="h-8 w-8" />
                        <h3 className="text-3xl font-black uppercase italic m-0">Sovereign Privacy</h3>
                     </div>
                     <p className="font-bold leading-relaxed m-0 text-base">
                        Your strategic visions are self-custodied. We deploy Zero-Knowledge obfuscation for GoalCaps, ensuring your future goals are cryptographically hidden even from the Infrastructure Host.
                     </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h3 className="text-3xl font-black uppercase italic tracking-tight flex items-center gap-3">
                        <ShieldCheck className="h-7 w-7 text-primary" /> Encryption Protocol
                      </h3>
                      <p className="font-medium leading-relaxed">Visions utilize a multi-layer encoding process. Raw data stored in the global registry is unreadable without an active, authenticated session key.</p>
                      <ul className="space-y-4 font-bold text-sm uppercase tracking-wide">
                        <li className="flex gap-3"><CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> Zero-Visibility Private Dispatches</li>
                        <li className="flex gap-3"><CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> Host Isolation Architecture</li>
                        <li className="flex gap-3"><CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> Local-Only Decryption Keys</li>
                      </ul>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-3xl font-black uppercase italic tracking-tight flex items-center gap-3">
                        <Target className="h-7 w-7 text-primary" /> Data Retention
                      </h3>
                      <p className="font-medium leading-relaxed">NICO DIGITAL retains minimal identifiers required for growth scaling. Membership data is active only while your command remains open.</p>
                      <div className="p-6 border-4 border-[#1f1610]/10 rounded-3xl bg-[#1f1610]/5 italic font-black text-xs uppercase tracking-widest">
                        "Your data. Your empire. Your sovereignty."
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="control" className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <Card className="rounded-[3.5rem] border-[8px] border-primary/10 bg-card/40 p-12 text-center space-y-8 flex flex-col justify-between h-full group hover:border-primary/30 transition-all">
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border-2 border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
                      <LogOut className="h-10 w-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-black uppercase italic text-foreground tracking-tighter leading-none">Terminate Session</h3>
                      <p className="text-[10px] font-black uppercase text-primary/40 tracking-[0.4em]">CLEAN EXIT PROTOCOL</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full h-20 rounded-2xl bg-white/5 border-4 border-white/10 text-white font-black uppercase text-xs hover:bg-white hover:text-black transition-all shadow-xl"
                  >
                    {isLoggingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : 'AUTHORIZE LOGOUT'}
                  </Button>
               </Card>

               <Card className="rounded-[3.5rem] border-[8px] border-red-600/20 bg-red-600/5 p-12 text-center space-y-8 flex flex-col justify-between h-full group hover:bg-red-600/10 transition-all">
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-red-600/10 rounded-3xl flex items-center justify-center mx-auto border-2 border-red-600/20 shadow-inner group-hover:scale-110 transition-transform">
                      <AlertTriangle className="h-10 w-10 text-red-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-black uppercase italic text-red-600 tracking-tighter leading-none">Purge Identity</h3>
                      <p className="text-[10px] font-black uppercase text-red-600/40 tracking-[0.4em]">IRREVERSIBLE TERMINATION</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="w-full h-20 rounded-2xl bg-red-600/20 border-4 border-red-600/40 text-red-600 font-black uppercase text-xs hover:bg-red-600 hover:text-white transition-all shadow-xl"
                  >
                    {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'PURGE ALL DATA'}
                  </Button>
               </Card>
            </div>

            <div className="p-8 bg-[#1f1610] rounded-[2.5rem] border-[6px] border-red-600/40 shadow-2xl relative overflow-hidden flex items-center justify-center">
               <div className="absolute inset-0 bg-red-600/5 pointer-events-none animate-pulse" />
               <p className="text-3xl font-black text-red-600 uppercase tracking-[0.5em] italic relative z-10 leading-none drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                 2.0.5-SOVEREIGN
               </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
