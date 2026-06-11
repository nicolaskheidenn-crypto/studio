
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
  Trash2, AlertTriangle, CheckCircle2, BookOpen, Flame, Share2, LayoutDashboard, Sparkles
} from "lucide-react";
import { useUserStore, UserProfile } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useUser, useFirestore } from "@/firebase";
import { useState, useMemo, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { 
  getAuth, 
  updateProfile, 
  signOut, 
  deleteUser,
  EmailAuthProvider,
  linkWithCredential,
  unlink,
  reload
} from "firebase/auth";
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
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Binding/Security State
  const [newEmailBind, setNewEmailBind] = useState("");
  const [newPassBind, setNewPassBind] = useState("");
  const [isBinding, setIsBinding] = useState(false);
  
  const [showPass, setShowPass] = useState({ new: false });
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

  const handleRebindIdentity = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !newEmailBind || !newPassBind) {
      toast({ title: "Protocol Breach", description: "New email and security key required.", variant: "destructive" });
      return;
    }

    setIsBinding(true);
    try {
      await reload(currentUser);
      const newCredential = EmailAuthProvider.credential(newEmailBind, newPassBind);

      linkWithCredential(currentUser, newCredential)
        .then((linkResult) => {
          toast({ title: "Identity Re-Bound", description: "Strategic email and key updated successfully." });
          setNewEmailBind(""); setNewPassBind("");
        })
        .catch((error: any) => {
          let msg = error.message;
          if (error.code === 'auth/email-already-in-use') msg = "Target email is already bound to another strategist.";
          toast({ title: "Binding Failure", description: msg, variant: "destructive" });
        })
        .finally(() => setIsBinding(false));

    } catch (error: any) {
      toast({ title: "System Error", description: error.message, variant: "destructive" });
      setIsBinding(false);
    }
  };

  const handleUnlinkProtocol = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast({ title: "Unlink Error", description: "Session state missing.", variant: "destructive" });
      return;
    }

    setIsBinding(true);
    try {
      await reload(currentUser);
      unlink(currentUser, 'password')
        .then((updatedUser) => {
          toast({ title: "Provider Unlinked", description: "Identity block detached from root." });
        })
        .catch((error: any) => {
          toast({ title: "Unlink Failed", description: error.message, variant: "destructive" });
        })
        .finally(() => setIsBinding(false));
    } catch (error: any) {
      toast({ title: "System Breach", description: error.message, variant: "destructive" });
      setIsBinding(false);
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
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl relative z-10">
        <header className="mb-12 space-y-4 text-center sm:text-left">
           <h1 className="text-6xl font-headline font-black text-foreground uppercase tracking-tighter italic leading-none">Settings Hub</h1>
           <div className="h-1.5 w-24 bg-primary rounded-full shadow-[0_0_15px_rgba(255,215,0,0.3)] mx-auto sm:mx-0" />
        </header>
        
        <Tabs defaultValue="identity" className="space-y-12">
          <TabsList className="bg-[#1f1610] p-1.5 rounded-full w-fit shadow-2xl border-4 border-primary/10 flex gap-2 mx-auto sm:mx-0 overflow-x-auto scrollbar-hide">
            <TabsTrigger value="identity" className="rounded-full px-10 h-11 text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-[#1f1610] text-white/90">Identity</TabsTrigger>
            <TabsTrigger value="security" className="rounded-full px-10 h-11 text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-[#1f1610] text-white/90">Security</TabsTrigger>
            <TabsTrigger value="privacy" className="rounded-full px-10 h-11 text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-[#1f1610] text-white/90">Privacy</TabsTrigger>
            <TabsTrigger value="vault" className="rounded-full px-10 h-11 text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-[#1f1610] text-white/90">Vault</TabsTrigger>
            <TabsTrigger value="control" className="rounded-full px-10 h-11 text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-[#1f1610] text-white/90">Control</TabsTrigger>
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
                    {isUpdatingProfile ? <Loader2 className="h-10 w-10 animate-spin" /> : 'UPDATE PROTOCOL'}
                  </Button>
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <Card className="rounded-[3.5rem] border-[8px] border-primary/10 bg-card/40 p-12 shadow-2xl space-y-12">
               <div className="flex items-center gap-4 text-primary">
                  <ShieldCheck className="h-10 w-10" />
                  <h3 className="text-4xl font-black uppercase italic tracking-tighter m-0">Strategic Binding</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <Label className="text-primary/60 font-black text-[10px] uppercase tracking-[0.4em]">Target Strategic Email</Label>
                      <Input 
                        placeholder="new-command@identity.com" 
                        value={newEmailBind} 
                        onChange={e => setNewEmailBind(e.target.value)} 
                        className="h-16 bg-background/50 border-4 border-primary/10 rounded-2xl px-6 text-xl font-bold" 
                      />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-primary/60 font-black text-[10px] uppercase tracking-[0.4em]">New Security Passkey</Label>
                      <div className="relative">
                        <Input 
                          type={showPass.new ? 'text' : 'password'} 
                          placeholder="••••••••" 
                          value={newPassBind} 
                          onChange={e => setNewPassBind(e.target.value)} 
                          className="h-16 bg-background/50 border-4 border-primary/10 rounded-2xl px-6 pr-14 text-xl font-bold" 
                        />
                        <button type="button" onClick={() => setShowPass(s => ({...s, new: !s.new}))} className="absolute right-5 top-1/2 -translate-y-1/2 text-primary/30">
                          {showPass.new ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 justify-end">
                    <Button 
                      onClick={handleRebindIdentity} 
                      disabled={isBinding}
                      className="w-full h-20 rounded-2xl bg-primary text-[#1f1610] font-black uppercase text-sm hover:scale-105 transition-all shadow-xl tracking-widest"
                    >
                      {isBinding ? <Loader2 className="h-6 w-6 animate-spin" /> : 'RE-BIND IDENTITY'}
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={handleUnlinkProtocol}
                      className="text-red-600 hover:bg-red-600/10 font-black uppercase text-[10px] tracking-widest"
                    >
                      UNLINK CURRENT PROVIDER
                    </Button>
                  </div>
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <Card className="rounded-[4rem] border-[12px] border-white/20 bg-primary p-12 md:p-16 shadow-[0_0_150px_rgba(255,215,0,0.3)] relative overflow-hidden">
               <div className="absolute top-[-10%] right-[-10%] opacity-10 pointer-events-none rotate-12">
                  <ShieldCheck className="w-[500px] h-[500px] text-white" />
               </div>
               
               <div className="space-y-12 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-[#1f1610] flex items-center justify-center shadow-[0_25px_50px_rgba(0,0,0,0.5)] border-4 border-white/20">
                      <Fingerprint className="h-10 w-10 text-primary" />
                    </div>
                    <div className="bg-[#1f1610] px-12 py-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] border-4 border-white/10">
                      <h3 className="text-5xl font-black uppercase italic m-0 tracking-tighter text-primary">Sovereign Privacy</h3>
                    </div>
                  </div>
                  
                  <div className="space-y-10">
                    <div className="bg-[#1f1610] p-12 rounded-[4.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.6)] border-8 border-white/5 relative overflow-hidden group">
                       <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,215,0,0.05),transparent)] pointer-events-none" />
                       <p className="font-black leading-relaxed m-0 text-3xl italic text-primary tracking-tight relative z-10 uppercase">
                          YOUR STRATEGIC VISIONS ARE SELF-CUSTODIED. WE DEPLOY ZERO-KNOWLEDGE OBFUSCATION FOR GOALCAPS, ENSURING YOUR FUTURE GOALS ARE CRYPTOGRAPHICALLY HIDDEN EVEN FROM THE INFRASTRUCTURE HOST.
                       </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {[
                         { 
                           title: "ZERO-LOG PROTOCOL", 
                           desc: "INDIVIDUAL SESSION KEYSTROKES AND NAVIGATION PATHS ARE NEVER RECORDED. YOUR FOCUS IS ISOLATED WITHIN A SECURED ARCHITECTURE THAT PURGES ALL TEMPORARY ASSETS UPON DISCONNECT.",
                           icon: Shield 
                         },
                         { 
                           title: "NON-CUSTODIAL", 
                           desc: "STRATEGIST DATA IS NEVER EXPORTED, PROCESSED, OR SOLD. YOUR TACTICAL RECORD EXISTS EXCLUSIVELY FOR YOUR GROWTH ONLY, PROTECTED BY DECENTRALIZED IDENTITY NODES.",
                           icon: Fingerprint 
                         },
                         { 
                           title: "AES-256 SHIELD", 
                           desc: "INDUSTRY-STANDARD ENCRYPTION BLOCKS APPLIED TO ALL TEMPORAL DISPATCHES. YOUR PRIVATE VAULT UTILIZES MILITARY-GRADE AES-256 KEY WRAPPING FOR TOTAL DATA ANONYMITY.",
                           icon: Lock 
                         }
                       ].map((item, i) => (
                         <div key={i} className="bg-[#1f1610] p-10 rounded-[3.5rem] border-4 border-white/10 space-y-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)] hover:scale-[1.03] transition-all group overflow-hidden relative shadow-inner">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.6)] border-4 border-white/20 relative z-10">
                              <item.icon className="h-8 w-8 text-[#1f1610]" />
                            </div>
                            <div className="space-y-4 relative z-10">
                              <h4 className="text-3xl font-black text-primary uppercase italic tracking-tighter leading-none">{item.title}</h4>
                              <div className="h-1 w-12 bg-primary/20 rounded-full" />
                              <p className="text-[11px] font-bold text-white uppercase tracking-widest leading-loose">{item.desc}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="vault" className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <Card className="rounded-[4rem] border-[10px] border-primary/10 bg-mocha-cream p-12 md:p-16 shadow-2xl">
              <ScrollArea className="h-[650px] pr-4">
                <div className="space-y-12">
                  <div className="space-y-10">
                    <div className="flex items-center gap-4 text-[#1f1610] mb-8">
                       <Trophy className="h-10 w-10 text-primary" />
                       <h3 className="text-4xl font-black uppercase italic tracking-tighter m-0">Achievement Vault</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-2">
                      {ACHIEVEMENTS.map((item) => {
                        const isUnlocked = item.check(profile);
                        return (
                          <div key={item.id} className={cn(
                            "p-10 rounded-[3.5rem] border-4 flex flex-col items-center text-center gap-8 transition-all shadow-2xl min-h-[380px] justify-between relative overflow-hidden",
                            isUnlocked 
                              ? "bg-[#1f1610] border-primary shadow-[0_30px_60px_rgba(255,215,0,0.2)] scale-[1.02]" 
                              : "bg-[#1f1610]/10 border-[#1f1610]/10 opacity-60"
                          )}>
                            <div className={cn(
                              "w-24 h-24 rounded-[2rem] flex items-center justify-center border-4 shadow-inner transition-colors shrink-0",
                              isUnlocked ? "bg-primary/10 border-primary" : "bg-[#1f1610]/5 border-[#1f1610]/10"
                            )}>
                              <item.icon className={cn("h-12 w-12", isUnlocked ? "text-primary" : "text-[#1f1610]/40")} />
                            </div>

                            <div className="flex flex-col items-center gap-2 w-full">
                              {item.label.split(' ').map((word, wordIdx) => (
                                <div key={wordIdx} className={cn(
                                  "px-6 py-2 skew-x-[-15deg] min-w-fit w-full flex items-center justify-center leading-none transition-all shadow-lg",
                                  isUnlocked ? "bg-primary" : "bg-[#1f1610]/30"
                                )}>
                                  <p 
                                    className="text-xl font-black uppercase italic tracking-tighter skew-x-[15deg] whitespace-nowrap"
                                    style={{ color: isUnlocked ? '#1f1610' : '#1f1610', opacity: isUnlocked ? 1 : 0.6, margin: 0 }}
                                  >
                                    {word}
                                  </p>
                                </div>
                              ))}
                            </div>

                            <div className="flex flex-col items-center gap-4">
                              <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: isUnlocked ? '#ffffff' : '#1f1610', opacity: 0.9 }}>
                                {item.req}
                              </p>
                              {isUnlocked && (
                                <div className="h-8 w-8 rounded-full border-2 border-primary flex items-center justify-center shadow-xl">
                                  <CheckCircle2 className="h-4 w-4 text-primary" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="control" className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <Card className="rounded-[3.5rem] border-[8px] border-primary/10 bg-card/40 p-12 text-center space-y-8 flex flex-col justify-between h-full group hover:border-primary/30 transition-all shadow-2xl">
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border-2 border-primary/20 shadow-inner">
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
                    className="w-full h-20 rounded-2xl bg-white/5 border-4 border-white/10 text-white font-black uppercase text-xs hover:bg-white hover:text-black transition-all"
                  >
                    {isLoggingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : 'AUTHORIZE LOGOUT'}
                  </Button>
               </Card>

               <Card className="rounded-[3.5rem] border-[8px] border-red-600/20 bg-red-600/5 p-12 text-center space-y-8 flex flex-col justify-between h-full group hover:border-red-600/10 transition-all shadow-2xl">
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-red-600/10 rounded-3xl flex items-center justify-center mx-auto border-2 border-primary/20 shadow-inner">
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
                    className="w-full h-20 rounded-2xl bg-red-600/20 border-4 border-red-600/40 text-red-600 font-black uppercase text-xs hover:bg-red-600 hover:text-white transition-all"
                  >
                    {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'PURGE ALL DATA'}
                  </Button>
               </Card>
            </div>

            <div className="p-8 bg-[#1f1610] rounded-[2.5rem] border-[6px] border-red-600/60 shadow-[0_0_30px_rgba(220,38,38,0.3)] relative overflow-hidden flex items-center justify-center">
               <div className="absolute inset-0 bg-red-600/5 pointer-events-none animate-pulse" />
               <p className="text-3xl font-black text-red-600 uppercase tracking-[0.5em] italic relative z-10 leading-none">
                 2.0.5-SOVEREIGN
               </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
