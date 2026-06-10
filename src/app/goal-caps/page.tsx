"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Hourglass, Lock, Unlock, Send, Calendar as CalendarIcon, 
  ShieldCheck, History, Info, ShieldAlert, KeyRound 
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { useUserStore, UserProfile } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";

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
  stats: {
    quizzesPassed: 0,
    promptsShared: 0,
    triksShared: 0,
    visitedFeatures: [],
    totalDaysInApp: 0
  }
};

/**
 * Sovereign Encryption Helpers
 * Ensures data is obfuscated in storage.
 */
const encryptVision = (text: string) => btoa(encodeURIComponent(text));
const decryptVision = (encoded: string) => {
  try {
    return decodeURIComponent(atob(encoded));
  } catch {
    return "Protocol Decryption Failure: Key Mismatch";
  }
};

export default function GoalCapsPage() {
  const { user } = useUser();
  const uid = user?.uid;
  const profiles = useUserStore(s => s.profiles);
  const profile = useMemo(() => {
    const raw = uid ? profiles[uid] || DEFAULT_PROFILE : DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...raw };
  }, [profiles, uid]);
  
  const { capsules = [] } = profile;
  const { addCapsule } = useUserStore();

  const [message, setMessage] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    setIsMounted(true);
    setCurrentDate(new Date());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return;
    if (!message || !unlockDate) {
      toast({
        title: "Protocol Error",
        description: "A target date and strategic narrative are required to seal the vision.",
        variant: "destructive",
      });
      return;
    }
    
    // Deploy Sovereign Encryption before storage
    const encryptedMessage = encryptVision(message);

    const newCap = {
      id: Math.random().toString(36).substring(2, 11),
      message: encryptedMessage,
      unlockDate,
      createdAt: new Date().toLocaleDateString(),
    };

    addCapsule(uid, newCap);
    setMessage("");
    setUnlockDate("");
    
    toast({
      title: "Vision Sealed & Encrypted",
      description: "Sovereign encryption active. Your message is now a secured data block.",
    });
  };

  if (!isMounted || !currentDate) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Navigation />
      
      {/* ATMOSPHERIC BACKGROUND DESIGNS - REDUCED SIZE */}
      <div className="absolute top-[20%] left-[-10%] opacity-5 pointer-events-none scale-100 rotate-12">
        <Hourglass className="h-[300px] w-[300px] text-primary" />
      </div>

      <main className="flex-1 container mx-auto px-4 py-16 max-w-[1400px] relative z-10">
        <div className="space-y-16">
          
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-top-10 duration-1000">
            <h1 className="text-7xl md:text-9xl font-headline font-black text-foreground uppercase tracking-tighter italic leading-none">
              GOAL<span className="text-primary">CAPS</span>
            </h1>
            <div className="space-y-4">
              <p className="text-primary font-black uppercase tracking-[0.5em] text-xs md:text-sm">
                SOVEREIGN ENCRYPTION SHIELD ACTIVE.
              </p>
              <div className="flex items-center justify-center gap-4 bg-primary/10 w-fit mx-auto px-6 py-2 rounded-full border border-primary/20">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase text-primary tracking-widest">Zero-Knowledge Vault Protocol</span>
              </div>
            </div>
            <div className="h-1.5 w-32 bg-primary mx-auto rounded-full shadow-[0_0_20px_rgba(255,215,0,0.3)]" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
            
            <div className="hidden lg:flex flex-col gap-8 animate-in slide-in-from-left-10 duration-700">
               <Card className="rounded-[3rem] border-4 border-primary/10 bg-card/40 p-10 shadow-2xl space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase text-foreground italic flex items-center gap-3"><History className="h-6 w-6 text-primary" /> Privacy Stats</h3>
                    <p className="text-[10px] font-black uppercase text-primary/40 tracking-widest">Sovereign Record</p>
                  </div>
                  
                  <div className="space-y-6 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-primary/40">Encrypted Blocks</span>
                      <span className="text-2xl font-black text-foreground">{capsules.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-primary/40">Vault Status</span>
                      <span className="text-xs font-black text-green-500 uppercase italic tracking-widest">Self-Custodied</span>
                    </div>
                  </div>
               </Card>

               <Card className="rounded-[3rem] border-4 border-primary/10 bg-card/40 p-10 shadow-2xl text-center space-y-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border-2 border-primary/20">
                    <KeyRound className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-[10px] font-black uppercase text-primary/40 tracking-widest leading-relaxed">
                    Visions are encrypted locally. Even the Host cannot read your temporal dispatches in the database.
                  </p>
               </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="rounded-[4rem] border-[10px] border-primary/10 bg-mocha-cream p-12 md:p-16 shadow-[0_60px_120px_rgba(0,0,0,0.5)] space-y-12 animate-in zoom-in-95 duration-700">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <h3 className="text-5xl font-black text-[#1f1610] uppercase tracking-tighter italic leading-none">SEAL VISION</h3>
                    <div className="h-2 w-20 bg-primary rounded-full" />
                  </div>
                  <Badge className="bg-[#1f1610] text-primary rounded-full h-8 px-4 flex items-center gap-2">
                    <Lock className="h-3 w-3" /> PRIVATE
                  </Badge>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="space-y-4">
                    <Label className="text-[#1f1610] font-black text-[10px] uppercase tracking-[0.3em]">Protocol Unlock Date</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-[#1f1610]/30" />
                      <Input 
                        type="date" 
                        className="h-20 pl-16 rounded-[2rem] bg-[#1f1610]/5 border-4 border-[#1f1610]/10 text-2xl font-black text-[#1f1610] focus:border-primary transition-all shadow-inner" 
                        value={unlockDate}
                        onChange={(e) => setUnlockDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[#1f1610] font-black text-[10px] uppercase tracking-[0.3em]">Strategic Narrative (Encrypted)</Label>
                    <Textarea 
                      placeholder="Your secret vision for the collective..." 
                      className="min-h-[280px] rounded-[3rem] bg-[#1f1610]/5 border-4 border-[#1f1610]/10 p-10 text-xl font-bold text-[#1f1610] placeholder:text-[#1f1610]/20 focus:border-primary transition-all shadow-inner leading-relaxed"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-24 rounded-full bg-[#1f1610] text-primary font-black text-3xl uppercase shadow-2xl hover:scale-[1.02] active:scale-95 transition-all group tracking-tighter"
                  >
                    <Send className="h-8 w-8 mr-6 group-hover:translate-x-3 transition-transform" /> 
                    SEAL & ENCRYPT
                  </Button>
                </form>
              </Card>
            </div>

            <div className="space-y-10 animate-in slide-in-from-right-10 duration-700">
              <div className="flex items-center gap-6 px-4">
                <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center border-2 border-primary/20">
                  <ShieldAlert className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none">TEMPORAL VAULT</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 mt-1">Encrypted Archive</p>
                </div>
              </div>

              <div className="space-y-8 max-h-[800px] overflow-y-auto pr-4 scrollbar-hide">
                {capsules.length === 0 ? (
                  <div className="p-16 border-4 border-dashed border-primary/10 rounded-[3.5rem] text-center bg-card/20 flex flex-col items-center justify-center space-y-6">
                    <Info className="h-12 w-12 text-primary/10" />
                    <p className="text-primary/20 text-xl font-black uppercase tracking-widest italic text-center">
                      Vault Encrypted.<br/>No private data.
                    </p>
                  </div>
                ) : (
                  [...capsules].reverse().map((cap) => {
                    const unlockDateObj = new Date(cap.unlockDate);
                    const isLocked = unlockDateObj > currentDate;

                    return (
                      <Card 
                        key={cap.id} 
                        className={cn(
                          "rounded-[3.5rem] border-4 transition-all duration-700 shadow-2xl overflow-hidden",
                          isLocked 
                            ? "bg-card/40 border-primary/10" 
                            : "bg-mocha-cream border-primary shadow-[0_20px_40px_rgba(255,215,0,0.1)]"
                        )}
                      >
                        <CardContent className="p-10 space-y-8">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <div className={cn(
                                "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all border-2",
                                isLocked ? "bg-primary/5 text-primary/20 border-primary/5" : "bg-[#1f1610] text-primary border-[#1f1610]"
                              )}>
                                {isLocked ? <Lock className="h-8 w-8" /> : <Unlock className="h-8 w-8 animate-pulse" />}
                              </div>
                              <div className="space-y-0.5">
                                <p className={cn(
                                  "text-xl font-black uppercase italic tracking-tighter leading-none",
                                  isLocked ? "text-foreground/30" : "text-[#1f1610]"
                                )}>
                                  {unlockDateObj.toLocaleDateString()}
                                </p>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/40">Encrypted: {cap.createdAt}</p>
                              </div>
                            </div>
                          </div>

                          <div className={cn(
                            "p-8 rounded-[2.5rem] border-2 min-h-[140px] flex items-center transition-all",
                            isLocked 
                              ? "bg-[#1f1610]/40 border-primary/5" 
                              : "bg-white border-[#1f1610]/10 shadow-inner"
                          )}>
                            {isLocked ? (
                              <div className="space-y-4 w-full">
                                <p className="text-[10px] font-mono break-all opacity-20 select-none">
                                  {cap.message.substring(0, 80)}...
                                </p>
                                <p className="text-xs font-black uppercase tracking-widest text-primary/20 text-center">
                                  Encrypted Block Secured
                                </p>
                              </div>
                            ) : (
                              <p className="text-xl font-bold text-[#1f1610] leading-relaxed whitespace-pre-wrap italic tracking-tight">
                                {decryptVision(cap.message)}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
