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
  Flame, Zap, BarChart3, Gift, Download, Sparkles, Target, Coffee, Loader2
} from "lucide-react";
import { useState, useEffect, useMemo, useRef, memo } from "react";
import { toast } from "@/hooks/use-toast";
import { useUserStore, UserProfile } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy } from 'firebase/firestore';
import { PlaceHolderImages } from "@/lib/placeholder-images";

const NODE_GAP = 550; 
const MAP_HEIGHT = 450; 
const VERTICAL_SCATTER_BASE = [0, 80, -60, 100, -80, 120, -100, 50, -60];

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

// Optimized Plexus Layer to prevent DOM bloat
const NeuralPlexus = memo(({ dots, width }: { dots: any[], width: number }) => {
  const plexusPath = useMemo(() => {
    if (dots.length === 0) return "";
    let path = "";
    const maxDist = 350; // Balanced distance for performance
    
    for (let i = 0; i < dots.length; i++) {
      const d1 = dots[i];
      // Only check a limited number of nearby neighbors (spatial optimization)
      const lookAhead = 25; 
      for (let j = i + 1; j < Math.min(i + lookAhead, dots.length); j++) {
        const d2 = dots[j];
        const dx = d1.left - d2.left;
        const dy = (d1.top / 100 * MAP_HEIGHT) - (d2.top / 100 * MAP_HEIGHT);
        const distSq = dx * dx + dy * dy;
        
        if (distSq < maxDist * maxDist) {
          path += `M ${d1.left} ${d1.top}% L ${d2.left} ${d2.top}% `;
        }
      }
    }
    return path;
  }, [dots]);

  return (
    <svg 
      className="absolute inset-0 pointer-events-none will-change-transform opacity-30" 
      style={{ width, height: '100%' }}
    >
      <path 
        d={plexusPath} 
        fill="none" 
        stroke="var(--primary)" 
        strokeWidth="0.8" 
        strokeOpacity="0.4"
        className="animate-pulse"
      />
      {/* Render dots as rects/circles sparingly or within the path if needed */}
      {dots.filter((_, idx) => idx % 4 === 0).map(dot => (
        <circle 
          key={dot.id} 
          cx={dot.left} 
          cy={`${dot.top}%`} 
          r={dot.size} 
          fill="var(--primary)" 
          className="animate-pulse"
          style={{ opacity: 0.2 }}
        />
      ))}
    </svg>
  );
});
NeuralPlexus.displayName = "NeuralPlexus";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeReward, setActiveReward] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [shiningDots, setShiningDots] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const mapBg = useMemo(() => 
    PlaceHolderImages.find(img => img.id === 'tactical-map-bg')?.imageUrl || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2500",
  []);

  const totalMapWidth = (30 * NODE_GAP) + 3000;

  useEffect(() => {
    setIsMounted(true);
    // Optimized density for fluid performance (800 nodes is sweet spot for visual/speed)
    const dots = Array.from({ length: 800 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * totalMapWidth, 
      size: Math.random() * 1.5 + 0.5,
    })).sort((a, b) => a.left - b.left);
    setShiningDots(dots);
  }, [totalMapWidth]);

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
    if (!uid || isProcessing) return;
    setIsProcessing(true);
    unlockNextDay(uid);
    setShowAward(false);
    toast({ title: `Hub ${currentTaskDay + 1} Protocol Initiated` });
    setTimeout(() => setIsProcessing(false), 800);
  };

  const handleClaimTreasure = (reward: any) => {
    if (!uid || isProcessing) return;
    setIsProcessing(true);
    claimWeeklyReward(uid, reward.week);
    setActiveReward(reward);
    toast({ title: "Treasure Secured" });
    setTimeout(() => setIsProcessing(false), 800);
  };

  const handleTaskToggle = (taskId: string) => {
    if (!uid || isProcessing) return;
    setIsProcessing(true);
    toggleTask(uid, taskId);
    setTimeout(() => setIsProcessing(false), 400);
  };

  const ALL_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

  const nodePositions = useMemo(() => {
    return ALL_DAYS.map((d, i) => ({
      day: d,
      x: i * NODE_GAP + 600,
      y: (MAP_HEIGHT / 2) + VERTICAL_SCATTER_BASE[i % VERTICAL_SCATTER_BASE.length]
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

  const completedTracePath = useMemo(() => {
    if (nodePositions.length === 0) return "";
    const activeNodes = nodePositions.slice(0, currentTaskDay);
    return activeNodes.reduce((acc, pos, i) => {
      if (i === 0) return `M ${pos.x} ${pos.y}`;
      const prev = activeNodes[i-1];
      const cp1x = prev.x + (pos.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (pos.x - prev.x) / 2;
      const cp2y = pos.y;
      return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pos.x} ${pos.y}`;
    }, "");
  }, [nodePositions, currentTaskDay]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-[1600px] relative z-10 space-y-10">
        
        <header className="text-center space-y-2">
           <h1 className="text-5xl font-headline font-black text-white tracking-tighter uppercase italic leading-none select-none">
             TASK<span className="text-primary">DO</span>
           </h1>
           <p className="text-primary/40 text-[10px] font-black uppercase tracking-[0.8em]">Neural Infrastructure Grid</p>
        </header>

        <div className="relative group p-1 border-4 border-primary/10 rounded-[4rem] bg-[#0d120d] shadow-2xl overflow-hidden">
          <Card className="rounded-[3.8rem] border-[8px] border-primary/5 bg-[#0a140a] relative overflow-hidden h-[450px]">
            <div 
              className="absolute inset-0 bg-cover bg-center pointer-events-none" 
              style={{ 
                backgroundImage: `url('${mapBg}')`,
                width: totalMapWidth,
                opacity: 0.15
              }} 
            />
            <div 
              className="absolute inset-0 bg-gradient-to-r from-[#0d120d] via-transparent to-[#0d120d] pointer-events-none" 
              style={{ width: totalMapWidth }}
            />
            
            <ScrollArea className="w-full h-full">
              <div className="min-w-max h-full relative px-[600px]" ref={scrollRef}>
                  
                  {/* Optimized Multiplexed Neural Layer */}
                  <NeuralPlexus dots={shiningDots} width={totalMapWidth} />

                  <svg className="absolute inset-0 w-full h-full pointer-events-none will-change-transform z-10" style={{ minWidth: totalMapWidth }}>
                    <path d={tracePath} fill="none" stroke="rgba(255,215,0,0.06)" strokeWidth="8" strokeLinecap="round" />
                    <path 
                      d={completedTracePath} 
                      fill="none" 
                      stroke="var(--primary)" 
                      strokeWidth="5" 
                      strokeLinecap="round"
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
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 z-30"
                        style={{ left: pos.x, top: pos.y }}
                      >
                        <div className="relative flex flex-col items-center">
                          {isActive && (
                            <div className="mb-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
                              <div className="bg-mocha-cream text-[#1f1610] font-black uppercase text-[10px] tracking-[0.3em] px-10 py-3 rounded-full shadow-[0_0_120px_rgba(255,215,0,0.8)] border-4 border-primary/30 flex items-center justify-center leading-none">
                                ACTIVE HUB
                              </div>
                            </div>
                          )}

                          <button
                            onClick={() => {
                              if (isWeekEnd && isPast && reward && !isClaimed) handleClaimTreasure(reward);
                            }}
                            disabled={isProcessing}
                            className={cn(
                              "rounded-[2.8rem] flex items-center justify-center transition-all duration-700 border-[10px] font-black italic shadow-2xl relative group overflow-hidden",
                              isActive 
                                ? "w-36 h-36 bg-primary border-mocha-cream text-[#1f1610] scale-110 shadow-[0_0_150px_rgba(255,215,0,0.9)]" 
                                : isPast 
                                  ? "w-28 h-28 bg-primary/20 border-primary/40 text-primary" 
                                  : "w-28 h-28 bg-white/5 border-white/10 text-white/10",
                              isProcessing && "cursor-not-allowed opacity-80"
                            )}
                          >
                            {isWeekEnd && isPast && !isClaimed ? (
                               <Gift className="h-14 w-14 animate-bounce text-white" />
                            ) : (
                               <span className={cn(
                                 "leading-[0] drop-shadow-2xl select-none flex items-center justify-center",
                                 isActive ? "text-7xl font-black" : "text-5xl font-bold opacity-30"
                               )}>{d}</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <ScrollBar orientation="horizontal" className="bg-white/5 h-2 rounded-full" />
            </ScrollArea>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
           <div className="space-y-8">
              <Card className="rounded-[3rem] border-4 border-primary/10 bg-card/80 backdrop-blur-3xl p-10 shadow-2xl space-y-10">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-[1.2rem] flex items-center justify-center border-2 border-primary/20 shadow-inner">
                      <BarChart3 className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">COMMAND INTEL</h3>
                      <p className="text-[10px] font-black uppercase text-primary/60 tracking-[0.4em] mt-1">OPERATIONAL HUD</p>
                    </div>
                 </div>
                 
                 <div className="space-y-5">
                    <div className="flex justify-between items-end">
                       <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em]">SYNC PROGRESS</span>
                       <span className="text-3xl font-black text-white italic tracking-tighter">{Math.round(xp)}%</span>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full border-2 border-white/10 overflow-hidden shadow-inner">
                       <div className="h-full bg-primary shadow-[0_0_20px_rgba(255,215,0,0.8)] transition-all duration-1000" style={{ width: `${xp}%` }} />
                    </div>
                 </div>

                 <div className="flex justify-between items-center pt-8 border-t-2 border-primary/10">
                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">VAULT</p>
                       <p className="text-3xl font-black text-white flex items-center gap-3"><Zap className="h-6 w-6 fill-primary text-primary" /> {points}</p>
                    </div>
                    <div className="space-y-2 text-right">
                       <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">STREAK</p>
                       <p className="text-3xl font-black text-orange-500 italic flex items-center justify-end gap-3"><Flame className="h-6 w-6 fill-orange-500" /> {streak}</p>
                    </div>
                 </div>
              </Card>
           </div>

           <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-8">
                 <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic leading-none">HUB {currentTaskDay} PROTOCOL</h2>
                 <Badge className="bg-primary text-[#1f1610] h-12 px-8 text-[11px] font-black rounded-full uppercase tracking-widest shadow-2xl border-4 border-[#1f1610]/10">
                    {completedTaskIds?.filter(id => dayTasks.some(t => t.id === id)).length || 0} / {dayTasks.length} CONQUERED
                 </Badge>
              </div>

              {dayTasks.length === 0 ? (
                <div className="text-center py-32 bg-card/20 rounded-[4rem] border-[8px] border-dashed border-primary/10 shadow-inner flex flex-col items-center justify-center space-y-10">
                  <Lock className="h-20 w-20 text-primary/20 relative z-10" />
                  <p className="text-3xl text-white/20 font-black uppercase tracking-[0.4em] italic leading-none">AWAITING PROTOCOL...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dayTasks.map((task) => {
                    const isComplete = (completedTaskIds || []).includes(task.id);
                    return (
                      <Card 
                        key={task.id} 
                        className={cn(
                          "relative overflow-hidden border-[4px] transition-all duration-700 cursor-pointer group rounded-[2.5rem] transform hover:scale-[1.005] active:scale-95 shadow-2xl",
                          isComplete 
                            ? "border-primary/20 bg-primary/5 opacity-50 shadow-none" 
                            : "border-primary/10 bg-card hover:border-primary/50",
                          isProcessing && "pointer-events-none opacity-80"
                        )}
                        onClick={() => handleTaskToggle(task.id)}
                      >
                        <CardContent className="p-8 flex items-center gap-10">
                          <Checkbox checked={isComplete} className="h-10 w-10 rounded-xl border-[6px] border-primary data-[state=checked]:bg-primary shadow-2xl transition-all" />
                          <div className="flex-1 space-y-2">
                            <p className={cn("text-3xl font-black text-white uppercase tracking-tight leading-none italic", isComplete && "line-through opacity-30")}>{task.title}</p>
                            <p className="text-[12px] text-primary/60 font-black uppercase tracking-[0.3em] italic">{task.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {showAward && (
                <div className="p-16 rounded-[4.5rem] bg-primary text-[#1f1610] text-center animate-in zoom-in duration-700 shadow-[0_50px_100px_rgba(255,215,0,0.6)] relative border-[15px] border-white/20 overflow-hidden mt-12">
                  <Trophy className="h-20 w-20 mx-auto mb-6 animate-bounce drop-shadow-2xl" />
                  <h2 className="text-6xl font-headline font-black mb-4 uppercase tracking-tighter italic leading-none">Hub Conquered!</h2>
                  <Button className="rounded-full font-black text-3xl px-20 h-28 bg-[#1f1610] text-primary hover:bg-white hover:text-[#1f1610] transition-all active:scale-95 shadow-2xl uppercase tracking-tighter border-8 border-primary/20" onClick={handleNextDay} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="h-10 w-10 animate-spin" /> : <>DEPLOY NEXT HUB <ArrowRight className="ml-6 h-12 w-12" /></>}
                  </Button>
                </div>
              )}
           </div>
        </div>
      </main>
    </div>
  );
}
