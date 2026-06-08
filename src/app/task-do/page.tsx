
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Trophy, ArrowRight, Lock, ShieldCheck, 
  Flame, Zap, BarChart3, Gift, Download, Sparkles
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { useUserStore, UserProfile } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy } from 'firebase/firestore';
import { PlaceHolderImages } from "@/lib/placeholder-images";

const NODE_GAP = 400;
const MAP_HEIGHT = 650;
const VERTICAL_SCATTER = [0, 160, -160, 90, -90, 200, -200, 120, -120];

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
  claimedRewardWeeks: [],
  stats: {
    quizzesPassed: 0,
    promptsShared: 0,
    triksShared: 0,
    visitedFeatures: [],
    totalDaysInApp: 0
  }
};

export default function TaskDoPage() {
  const { user } = useUser();
  const uid = user?.uid;
  const db = useFirestore();
  
  const tasksQuery = useMemo(() => query(collection(db, 'tasks'), orderBy('day', 'asc')), [db]);
  const rewardsQuery = useMemo(() => query(collection(db, 'rewards'), orderBy('week', 'asc')), [db]);
  
  const { data: globalTasks = [] } = useCollection(tasksQuery);
  const { data: globalRewards = [] } = useCollection(rewardsQuery);
  
  const profiles = useUserStore(s => s.profiles);
  const profile = useMemo(() => {
    const raw = uid ? profiles[uid] || DEFAULT_PROFILE : DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...raw };
  }, [profiles, uid]);
  
  const { 
    completedTaskIds = [], currentTaskDay = 1, points = 0, streak = 0, xp = 0, claimedRewardWeeks = []
  } = profile;
  
  const { toggleTask, unlockNextDay, claimWeeklyReward } = useUserStore();

  const [showAward, setShowAward] = useState(false);
  const [activeReward, setActiveReward] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const mapBg = useMemo(() => 
    PlaceHolderImages.find(img => img.id === 'tactical-map-bg')?.imageUrl || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2500",
  []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dayTasks = useMemo(() => globalTasks.filter(t => t.day === currentTaskDay), [globalTasks, currentTaskDay]);
  const isDayComplete = useMemo(() => dayTasks.length > 0 && dayTasks.every(t => (completedTaskIds || []).includes(t.id)), [dayTasks, completedTaskIds]);

  useEffect(() => {
    if (isDayComplete && isMounted && uid) {
      setShowAward(true);
    } else {
      setShowAward(false);
    }
  }, [isDayComplete, isMounted, uid]);

  const handleNextDay = () => {
    if (!uid) return;
    unlockNextDay(uid);
    setShowAward(false);
    toast({
      title: `Hub ${currentTaskDay + 1} Protocol Initiated`,
      description: "Synchronizing latest daily objectives.",
    });
  };

  const handleClaimTreasure = (reward: any) => {
    if (!uid) return;
    claimWeeklyReward(uid, reward.week);
    setActiveReward(reward);
    toast({ title: "Treasure Secured", description: "Protocol asset archived in vault." });
  };

  const ALL_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

  const nodePositions = useMemo(() => {
    return ALL_DAYS.map((d, i) => ({
      day: d,
      x: i * NODE_GAP + 400,
      y: (MAP_HEIGHT / 2) + VERTICAL_SCATTER[i % VERTICAL_SCATTER.length]
    }));
  }, [ALL_DAYS]);

  const tracePath = useMemo(() => {
    if (nodePositions.length === 0) return "";
    return nodePositions.reduce((acc, pos, i) => {
      if (i === 0) return `M ${pos.x} ${pos.y}`;
      const prev = nodePositions[i-1];
      const cp1x = prev.x + (pos.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (pos.x - prev.x) / 2;
      const cp2y = pos.y;
      return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pos.x} ${pos.y}`;
    }, "");
  }, [nodePositions]);

  if (!isMounted) return null;

  const totalMapWidth = (ALL_DAYS.length * NODE_GAP) + 1600;

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-[1600px] relative z-10 space-y-12">
        
        <header className="text-center space-y-4">
           <h1 className="text-6xl md:text-8xl font-headline font-black text-white tracking-tighter uppercase italic leading-none select-none">
             TASK<span className="text-primary">DO</span>
           </h1>
           <p className="text-primary/40 text-[10px] font-black uppercase tracking-[1em]">Tactical Infrastructure Map</p>
        </header>

        <div className="relative group p-4 border-8 border-primary/20 rounded-[5rem] bg-[#1f1610]">
          <div className="absolute -inset-4 bg-primary/10 blur-2xl opacity-20 rounded-[6rem]" />
          <Card className="rounded-[4.5rem] border-[12px] border-primary/5 bg-[#0a140a] shadow-[0_60px_120px_rgba(0,0,0,0.9)] relative overflow-hidden h-[750px]">
            
            {/* Tactical Map Background (Lush Landscape) */}
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ 
                backgroundImage: `url('${mapBg}')`,
                width: totalMapWidth,
                opacity: 0.6
              }} 
              data-ai-hint="topological landscape"
            />
            <div 
              className="absolute inset-0 bg-gradient-to-r from-[#0a140a]/80 via-transparent to-[#0a140a]/80" 
              style={{ width: totalMapWidth }}
            />
            
            <ScrollArea className="w-full h-full">
              <div className="min-w-max h-full relative px-[600px]" ref={scrollRef}>
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: totalMapWidth }}>
                    <defs>
                      <filter id="glow-line">
                        <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <path 
                      d={tracePath} 
                      fill="none" 
                      stroke="rgba(255,215,0,0.15)" 
                      strokeWidth="24" 
                      strokeLinecap="round"
                    />
                    <path 
                      d={tracePath} 
                      fill="none" 
                      stroke="var(--primary)" 
                      strokeWidth="6" 
                      strokeLinecap="round"
                      strokeDasharray="20, 40"
                      className="opacity-60 animate-pulse"
                      filter="url(#glow-line)"
                    />
                  </svg>

                  {nodePositions.map((pos) => {
                    const d = pos.day;
                    const isActive = currentTaskDay === d;
                    const isPast = currentTaskDay > d;
                    const isWeekEnd = d % 7 === 0;
                    const weekNum = d / 7;
                    const reward = globalRewards.find(r => r.week === weekNum);
                    const isClaimed = claimedRewardWeeks.includes(weekNum);

                    return (
                      <div 
                        key={d} 
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 z-30"
                        style={{ left: pos.x, top: pos.y }}
                      >
                        <div className="relative flex flex-col items-center">
                          {isActive && (
                            <div className="mb-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
                              <div className="bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] px-8 py-2.5 rounded-full shadow-[0_15px_30px_rgba(255,255,255,0.8)] border-4 border-primary/20">
                                ACTIVE HUB
                              </div>
                            </div>
                          )}

                          <button
                            onClick={() => {
                              if (isWeekEnd && isPast && reward && !isClaimed) {
                                handleClaimTreasure(reward);
                              }
                            }}
                            className={cn(
                              "w-44 h-44 rounded-[3.5rem] flex items-center justify-center transition-all duration-700 border-[12px] text-7xl font-black italic shadow-2xl relative",
                              isActive 
                                ? "bg-primary border-white text-black scale-110 shadow-[0_0_100px_rgba(255,215,0,0.9)]" 
                                : isPast 
                                  ? "bg-primary/20 border-primary/40 text-primary opacity-80" 
                                  : "bg-[#1f1610]/40 border-white/10 text-white/5"
                            )}
                          >
                            {isWeekEnd && isPast && !isClaimed ? (
                               <Gift className="h-20 w-20 animate-bounce text-white" />
                            ) : (
                               <span className="leading-none">{d}</span>
                            )}
                            
                            {isActive && <div className="absolute inset-4 rounded-[2.5rem] border-4 border-white/40 animate-pulse" />}
                          </button>
                          
                          <div className="mt-6">
                            <span className={cn(
                              "text-[12px] font-black uppercase tracking-[0.5em] italic",
                              isActive ? "text-primary drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]" : "text-white/20"
                            )}>
                              HUB {d}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <ScrollBar orientation="horizontal" className="bg-white/5 h-4 rounded-full" />
            </ScrollArea>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
           <div className="space-y-10 lg:sticky lg:top-32">
              <Card className="rounded-[4rem] border-8 border-primary/10 bg-card/80 backdrop-blur-3xl p-10 shadow-2xl space-y-10">
                 <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center border-4 border-primary/20 shadow-inner">
                      <BarChart3 className="h-10 w-10 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Command Intel</h3>
                      <p className="text-[10px] font-black uppercase text-primary/40 tracking-[0.4em]">Operational Status</p>
                    </div>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="flex justify-between items-end">
                       <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Mastery Sync</span>
                       <span className="text-3xl font-black text-white italic">{xp}%</span>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full border-2 border-white/10 overflow-hidden shadow-inner">
                       <div className="h-full bg-primary shadow-[0_0_20px_rgba(255,215,0,0.5)] transition-all duration-1000" style={{ width: `${xp}%` }} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8 pt-10 border-t-2 border-primary/5">
                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Points Vault</p>
                       <p className="text-4xl font-black text-white flex items-center gap-3"><Zap className="h-6 w-6 fill-primary text-primary" /> {points}</p>
                    </div>
                    <div className="space-y-2 text-right">
                       <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Streak</p>
                       <p className="text-4xl font-black text-orange-500 italic flex items-center justify-end gap-3"><Flame className="h-6 w-6 fill-orange-500" /> {streak}</p>
                    </div>
                 </div>
              </Card>
           </div>

           <div className="lg:col-span-2 space-y-10">
              <div className="flex items-center justify-between px-10">
                 <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">HUB {currentTaskDay} PROTOCOL</h2>
                 <Badge className="bg-primary text-black h-12 px-8 text-[11px] font-black rounded-full uppercase tracking-widest shadow-xl border-4 border-black/10">
                    {completedTaskIds?.filter(id => dayTasks.some(t => t.id === id)).length || 0} / {dayTasks.length} CONQUERED
                 </Badge>
              </div>

              {dayTasks.length === 0 ? (
                <div className="text-center p-32 bg-card/20 rounded-[5rem] border-[10px] border-dashed border-primary/10 shadow-inner flex flex-col items-center justify-center space-y-10">
                  <Lock className="h-32 w-32 text-primary/10" />
                  <p className="text-4xl text-white/20 font-black uppercase tracking-tighter italic leading-none">Awaiting Protocol Injection...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {dayTasks.map((task) => {
                    const isComplete = (completedTaskIds || []).includes(task.id);
                    return (
                      <Card 
                        key={task.id} 
                        className={cn(
                          "relative overflow-hidden border-[6px] transition-all duration-700 cursor-pointer group rounded-[3.5rem] transform hover:scale-[1.02] active:scale-95",
                          isComplete 
                            ? "border-primary/30 bg-primary/5 opacity-50 shadow-none" 
                            : "border-primary/10 bg-card shadow-2xl hover:border-primary/50"
                        )}
                        onClick={() => uid && toggleTask(uid, task.id)}
                      >
                        <CardContent className="p-10 flex items-center gap-10">
                          <Checkbox 
                            checked={isComplete} 
                            className="h-16 w-16 rounded-[1.2rem] border-[8px] border-primary data-[state=checked]:bg-primary shadow-inner transition-all group-active:scale-90" 
                          />
                          <div className="flex-1 space-y-3">
                            <p className={cn("text-4xl font-black text-white uppercase tracking-tight leading-none italic", isComplete && "line-through opacity-20")}>
                              {task.title}
                            </p>
                            <p className="text-lg text-primary/60 font-black uppercase tracking-[0.3em] italic">{task.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {showAward && (
                <div className="p-20 rounded-[5rem] bg-primary text-black text-center animate-in zoom-in duration-700 shadow-[0_80px_160px_rgba(255,215,0,0.5)] relative border-[20px] border-black/5 overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Sparkles className="h-56 w-56" /></div>
                  <Trophy className="h-48 w-48 mx-auto mb-10 animate-bounce" />
                  <h2 className="text-8xl font-headline font-black mb-8 uppercase tracking-tighter italic leading-none">Hub Conquered!</h2>
                  <p className="text-3xl font-black uppercase tracking-widest opacity-80 mb-16 leading-relaxed italic">
                    Protocol consistency verified. <br/>Advancing to next root...
                  </p>
                  <Button 
                    className="rounded-full font-black text-4xl px-24 h-32 bg-black text-primary hover:bg-white hover:text-black transition-all active:scale-95 shadow-2xl uppercase tracking-tighter border-8 border-primary/10" 
                    onClick={handleNextDay}
                  >
                    DEPLOY NEXT HUB <ArrowRight className="ml-10 h-16 w-16" />
                  </Button>
                </div>
              )}
           </div>
        </div>
      </main>

      <Dialog open={!!activeReward} onOpenChange={() => setActiveReward(null)}>
        <DialogContent className="rounded-[5rem] border-[20px] border-primary/20 bg-mocha-cream p-20 max-w-3xl text-center shadow-[0_80px_200px_rgba(255,215,0,0.6)] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.25),transparent)] pointer-events-none" />
          <div className="relative z-10 space-y-16">
            <div className="w-64 h-64 bg-black text-primary rounded-[5rem] flex items-center justify-center mx-auto shadow-2xl border-[14px] border-primary/20">
              <Gift className="h-40 w-48 animate-pulse" />
            </div>
            <div className="space-y-6">
              <h2 className="text-7xl md:text-8xl font-headline font-black text-black uppercase tracking-tighter italic leading-none">
                TREASURE SECURED
              </h2>
              <div className="h-3 w-48 bg-primary mx-auto rounded-full shadow-lg" />
              <p className="text-4xl font-black text-black uppercase italic tracking-tight">
                {activeReward?.title}
              </p>
            </div>
            <p className="text-xl font-bold text-black/60 uppercase tracking-[0.3em] max-w-xl mx-auto leading-relaxed italic">
              {activeReward?.description}
            </p>
            <Button 
              asChild
              className="w-full h-28 rounded-full bg-black text-primary font-black text-4xl shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-tighter gap-8 border-4 border-primary/10"
            >
              <a href={activeReward?.fileUrl} target="_blank" download>
                <Download className="h-14 w-14" /> DOWNLOAD ASSET
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
