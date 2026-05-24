
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Hourglass, Lock, Unlock, Send, Calendar as CalendarIcon } from "lucide-react";
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

  useEffect(() => {
    setIsMounted(true);
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
    
    const newCap = {
      id: Math.random().toString(36).substring(2, 11),
      message,
      unlockDate,
      createdAt: new Date().toLocaleDateString(),
    };

    addCapsule(uid, newCap);
    setMessage("");
    setUnlockDate("");
    
    toast({
      title: "Vision Sealed",
      description: "Protocol established. Your message is now encrypted in the vault.",
    });
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Navigation />
      
      {/* Background Ambience */}
      <div className="absolute top-[20%] left-[-10%] opacity-5 pointer-events-none scale-150 rotate-12">
        <Hourglass className="h-96 w-96 text-primary" />
      </div>

      <main className="flex-1 container mx-auto px-4 py-16 max-w-7xl relative z-10">
        <div className="space-y-20">
          
          {/* Header Section - High Impact Professional Design */}
          <div className="text-center space-y-8 animate-in fade-in slide-in-from-top-10 duration-1000">
            <h1 className="text-9xl md:text-[12rem] font-headline font-black text-foreground uppercase tracking-tighter italic leading-none">
              GOAL<span className="text-primary">CAPS</span>
            </h1>
            <div className="space-y-4">
              <p className="text-primary font-black uppercase tracking-[0.5em] text-xs md:text-sm">
                LONG-TERM STRATEGIC ENCRYPTION ACTIVE.
              </p>
              <p className="text-primary font-black uppercase tracking-[0.5em] text-xs md:text-sm">
                DOCUMENT YOUR FUTURE STATE TODAY.
              </p>
            </div>
            <div className="h-2 w-32 bg-primary mx-auto rounded-full shadow-[0_0_20px_rgba(255,215,0,0.3)]" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Left Column: SEAL VISION (Light Mocha Cream Card) */}
            <Card className="rounded-[4.5rem] border-[12px] border-primary/10 bg-mocha-cream p-14 md:p-20 shadow-[0_60px_100px_rgba(0,0,0,0.6)] space-y-16 animate-in slide-in-from-left-10 duration-700">
              <div className="space-y-6">
                <h3 className="text-6xl font-black text-[#1f1610] uppercase tracking-tighter italic leading-none">SEAL VISION</h3>
                <div className="h-2 w-24 bg-primary rounded-full" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="space-y-4">
                  <Label className="text-[#1f1610] font-black text-[11px] uppercase tracking-[0.3em]">Protocol Unlock Date</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-8 w-8 text-[#1f1610]/30" />
                    <Input 
                      type="date" 
                      className="h-24 pl-20 rounded-[2.5rem] bg-[#1f1610]/5 border-4 border-[#1f1610]/10 text-3xl font-black text-[#1f1610] focus:border-primary transition-all shadow-inner" 
                      value={unlockDate}
                      onChange={(e) => setUnlockDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[#1f1610] font-black text-[11px] uppercase tracking-[0.3em]">Strategic Narrative</Label>
                  <Textarea 
                    placeholder="Document your vision for the collective..." 
                    className="min-h-[350px] rounded-[3.5rem] bg-[#1f1610]/5 border-4 border-[#1f1610]/10 p-12 text-2xl font-bold text-[#1f1610] placeholder:text-[#1f1610]/20 focus:border-primary transition-all shadow-inner leading-relaxed"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-28 rounded-full bg-[#1f1610] text-primary font-black text-4xl uppercase shadow-[0_40px_80px_rgba(0,0,0,0.4)] hover:scale-[1.03] active:scale-95 transition-all group tracking-tighter"
                >
                  <Send className="h-10 w-10 mr-8 group-hover:translate-x-4 transition-transform" /> 
                  SEAL PROTOCOL
                </Button>
              </form>
            </Card>

            {/* Right Column: SOVEREIGN VAULT (Dark Context) */}
            <div className="space-y-12">
              <div className="flex items-center gap-8 px-8">
                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center border-4 border-primary/20">
                  <Hourglass className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-5xl font-black text-foreground uppercase tracking-tighter italic leading-none">SOVEREIGN VAULT</h3>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/40 mt-2">Temporal Records</p>
                </div>
              </div>

              <div className="space-y-10 max-h-[1000px] overflow-y-auto pr-6 scrollbar-hide">
                {capsules.length === 0 ? (
                  <div className="p-32 border-8 border-dashed border-primary/10 rounded-[5rem] text-center bg-card/20 animate-in fade-in zoom-in duration-1000 flex flex-col items-center justify-center space-y-10">
                    <Lock className="h-24 w-24 text-primary/10" />
                    <p className="text-primary/20 text-3xl font-black uppercase tracking-widest italic leading-tight text-center">
                      Vault Encrypted.<br/>No temporal data found.
                    </p>
                  </div>
                ) : (
                  [...capsules].reverse().map((cap) => {
                    const unlockDateObj = new Date(cap.unlockDate);
                    const isLocked = unlockDateObj > new Date();

                    return (
                      <Card 
                        key={cap.id} 
                        className={cn(
                          "rounded-[4.5rem] border-4 transition-all duration-700 shadow-2xl overflow-hidden animate-in slide-in-from-right-10",
                          isLocked 
                            ? "bg-card/40 border-primary/10" 
                            : "bg-mocha-cream border-primary shadow-[0_30px_60px_rgba(255,215,0,0.1)]"
                        )}
                      >
                        <CardContent className="p-14 space-y-12">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-8">
                              <div className={cn(
                                "w-24 h-24 rounded-[2.2rem] flex items-center justify-center shadow-2xl transition-all border-4",
                                isLocked ? "bg-primary/5 text-primary/20 border-primary/5" : "bg-[#1f1610] text-primary border-[#1f1610]"
                              )}>
                                {isLocked ? <Lock className="h-12 w-12" /> : <Unlock className="h-12 w-12 animate-pulse" />}
                              </div>
                              <div className="space-y-1">
                                <p className={cn(
                                  "text-3xl font-black uppercase italic tracking-tighter leading-none",
                                  isLocked ? "text-foreground/30" : "text-[#1f1610]"
                                )}>
                                  {unlockDateObj.toLocaleDateString()}
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Established: {cap.createdAt}</p>
                              </div>
                            </div>
                            <Badge className={cn(
                              "h-12 px-10 rounded-full font-black text-[10px] uppercase tracking-[0.3em] border-none shadow-xl",
                              isLocked ? "bg-primary/5 text-primary/30" : "bg-primary text-[#1f1610]"
                            )}>
                              {isLocked ? "ENCRYPTED" : "REVEALED"}
                            </Badge>
                          </div>

                          <div className={cn(
                            "p-12 rounded-[3.5rem] border-4 min-h-[200px] flex items-center transition-all",
                            isLocked 
                              ? "bg-[#1f1610]/40 border-primary/5" 
                              : "bg-white border-[#1f1610]/10 shadow-inner"
                          )}>
                            {isLocked ? (
                              <div className="space-y-8 w-full">
                                <p className="text-2xl italic text-primary/5 select-none font-black leading-relaxed blur-[10px]">
                                  Sovereign narrative encryption active. Access permitted on target certification date.
                                </p>
                                <div className="flex gap-6">
                                  <div className="h-3 w-16 bg-primary/10 rounded-full" />
                                  <div className="h-3 w-32 bg-primary/10 rounded-full" />
                                  <div className="h-3 w-10 bg-primary/10 rounded-full" />
                                </div>
                              </div>
                            ) : (
                              <p className="text-3xl font-bold text-[#1f1610] leading-relaxed whitespace-pre-wrap italic tracking-tight">
                                {cap.message}
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
