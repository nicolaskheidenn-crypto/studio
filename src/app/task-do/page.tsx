
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Trophy, ArrowRight, Lock, Award, ShieldCheck, 
  Flame, Zap, Target, Coffee, BarChart3, ChevronRight, Gift, Download, Map as MapIcon, Sparkles,
  Unlock
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { useUserStore, UserProfile } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy } from 'firebase/firestore';

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

// Configuration for scattered positioning
const NODE_GAP = 220;
const MAP_HEIGHT = 500;
const VERTICAL_SCATTER = [0, 80, -80, 40, -40, 100, -100, 60, -60];

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
    completedTaskIds = [], currentTaskDay = 1, level = 1, points = 0, streak = 0, xp = 0, claimedRewardWeeks = []
  } = profile;
  
  const { toggleTask, unlockNextDay, claimWeeklyReward } = useUserStore();

  const [showAward, setShowAward] = useState(false);
  const [activeReward, setActiveReward] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const growthMultiplier = (1 + level / 10).toFixed(1);

  const ALL_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

  // Generate scattered coordinates for the tracing line
  const nodePositions = useMemo(() => {
    return ALL_DAYS.map((d, i) => ({
      day: d,
      x: i * NODE_GAP + 150,
      y: (MAP_HEIGHT / 2) + VERTICAL_SCATTER[i % VERTICAL_SCATTER.length]
    }));
  }, []);

  // Generate SVG Path for the "Trace"
  const tracePath = useMemo(() => {
    if (nodePositions.length === 0) return "";
    return nodePositions.reduce((acc, pos, i) => {
      if (i === 0) return `M ${pos.x} ${pos.y}`;
      // Use Bezier curve for organic feel
      const prev = nodePositions[i-1];
      const cp1x = prev.x + (pos.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (pos.x - prev.x) / 2;
      const cp2y = pos.y;
      return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pos.x} ${pos.y}`;
    }, "");
  }, [nodePositions]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-[1400px] relative z-10 space-y-12">
        
        <header className="text-center space-y-4">
           <div className="inline-flex items-center gap-4 bg-primary/10 px-8 py-3 rounded-full border-2 border-primary/20 shadow-xl">
             <MapIcon className="h-6 w-6 text-primary" />
             <span className="text-xs font-black uppercase tracking-[0.4em] text-primary">Sovereign Roadmap Infrastructure</span>
           </div>
           <h1 className="text-8xl md:text-9xl font-headline font-black text-white tracking-tighter uppercase italic leading-none">
             TASK<span className="text-primary">DO</span>
           </h1>
        </header>

        {/* Scattered Sideward-Scrolling Tactical Map */}
        <Card className="rounded-[4rem] border-[10px] border-primary/10 bg-card/60 backdrop-blur-2xl shadow-[0_50px_100px_rgba(0,0,0,0.6)] p-1 relative overflow-hidden h-[600px]">
           <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/tactical-map/2000/1000')] bg-cover bg-center opacity-10 pointer-events-none grayscale" />
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/60 pointer-events-none" />
           
           <ScrollArea className="w-full h-full">
             <div className="min-w-max h-full relative px-[200px]" ref={scrollRef}>
                {/* SVG Trace Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: (ALL_DAYS.length * NODE_GAP) + 400 }}>
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  {/* Background Track */}
                  <path 
                    d={tracePath} 
                    fill="none" 
                    stroke="rgba(255,255,255,0.03)" 
                    strokeWidth="12" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Active Trace Line */}
                  <path 
                    d={tracePath} 
                    fill="none" 
                    stroke="url(#traceGradient)" 
                    strokeWidth="6" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-[dash_120s_linear_infinite]"
                    strokeDasharray="20, 20"
                    filter="url(#glow)"
                  />
                  <linearGradient id="traceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.4" />
                  </linearGradient>
                </svg>

                {/* Day Nodes */}
                {nodePositions.map((pos, i) => {
                  const d = pos.day;
                  const isActive = currentTaskDay === d;
                  const isPast = currentTaskDay > d;
                  const isLocked = currentTaskDay < d;
                  const isWeekEnd = d % 7 === 0;
                  const weekNum = d / 7;
                  const reward = globalRewards.find(r => r.week === weekNum);
                  const isClaimed = claimedRewardWeeks.includes(weekNum);

                  return (
                    <div 
                      key={d} 
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000"
                      style={{ left: pos.x, top: pos.y }}
                    >
                      <div className="relative group">
                        <button
                          onClick={() => {
                            if (isWeekEnd && isPast && reward && !isClaimed) {
                              handleClaimTreasure(reward);
                            }
                          }}
                          className={cn(
                            "relative w-20 h-20 rounded-[1.8rem] flex items-center justify-center transition-all duration-700 border-[5px] shadow-2xl z-20",
                            isActive ? "bg-primary border-white text-[#1f1610] scale-125 animate-pulse shadow-[0_0_40px_rgba(255,215,0,0.5)]" :
                            isPast ? "bg-[#1f1610] border-primary text-primary" :
                            "bg-white/5 border-white/5 text-white/10 cursor-default",
                            isWeekEnd && isPast && !isClaimed && "animate-bounce ring-8 ring-primary/30"
                          )}
                        >
                          {isWeekEnd ? (
                            isClaimed ? <ShieldCheck className="h-10 w-10 text-primary" /> : 
                            isPast ? <Gift className="h-10 w-10 text-primary animate-pulse" /> : <Lock className="h-8 w-8 opacity-20" />
                          ) : (
                            isPast ? <ShieldCheck className="h-10 w-10" /> : <span className="font-black text-2xl italic">{d}</span>
                          )}
                          
                          {isActive && (
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-[#1f1610] px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-2xl border-2 border-primary whitespace-nowrap">
                              ACTIVE HUB
                            </div>
                          )}
                        </button>
                        
                        {/* Dot shadow on map */}
                        <div className="absolute inset-0 bg-black/40 blur-xl rounded-full -z-10 scale-150 translate-y-4" />

                        <div className="absolute top-24 left-1/2 -translate-x-1/2 text-center space-y-1 min-w-[100px]">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest block",
                            isActive ? "text-primary" : isPast ? "text-primary/40" : "text-white/10"
                          )}>
                            {isWeekEnd ? `WEEK 0${weekNum}` : `HUB ${d}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
             </div>
             <ScrollBar orientation="horizontal" className="bg-white/5 h-3 rounded-full" />
           </ScrollArea>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
           {/* Sidebar: Executive Progress */}
           <div className="space-y-12 order-2 lg:order-1">
              <Card className="rounded-[3.5rem] border-4 border-primary/10 bg-card/40 p-10 shadow-2xl space-y-8">
                 <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center border-2 border-primary/20">
                      <BarChart3 className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Empire Grid</h3>
                      <p className="text-[10px] font-black uppercase text-primary/40 tracking-[0.3em]">Operational Status</p>
                    </div>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="flex justify-between items-end">
                       <span className="text-[10px] font-black text-primary uppercase tracking-widest">Protocol XP</span>
                       <span className="text-2xl font-black text-white italic">{xp}%</span>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full border-2 border-white/10 overflow-hidden">
                       <div className="h-full bg-primary shadow-[0_0_20px_rgba(255,215,0,0.5)] transition-all duration-1000" style={{ width: `${xp}%` }} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6 pt-6 border-t-2 border-primary/5">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Points Hub</p>
                       <p className="text-3xl font-black text-white flex items-center gap-3"><Zap className="h-5 w-5 fill-primary text-primary" /> {points}</p>
                    </div>
                    <div className="space-y-2 text-right">
                       <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Growth Factor</p>
                       <p className="text-3xl font-black text-primary italic">x{growthMultiplier}</p>
                    </div>
                 </div>
              </Card>

              <Card className="rounded-[3.5rem] border-4 border-primary/10 bg-card/40 p-10 shadow-2xl text-center space-y-6">
                 <div className="w-24 h-24 bg-orange-500/10 rounded-[2rem] flex items-center justify-center mx-auto border-4 border-orange-500/20 shadow-[0_20px_40px_rgba(249,115,22,0.1)]">
                   <Flame className="h-12 w-12 text-orange-500 fill-orange-500 animate-pulse" />
                 </div>
                 <div className="space-y-1">
                    <h4 className="text-6xl font-black text-white tracking-tighter italic">{streak}</h4>
                    <p className="text-[11px] font-black uppercase text-orange-500 tracking-[0.5em]">Consecutive Days</p>
                 </div>
              </Card>
           </div>

           {/* Main: Task Console */}
           <div className="lg:col-span-2 space-y-12 order-1 lg:order-2">
              <div className="flex items-center justify-between px-10">
                 <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">HUB {currentTaskDay} PROTOCOL</h2>
                 <Badge className="bg-primary text-[#1f1610] h-12 px-10 text-xs font-black rounded-full uppercase tracking-widest shadow-[0_15px_30px_rgba(255,215,0,0.3)] border-4 border-[#1f1610]/20">
                    {completedTaskIds?.filter(id => dayTasks.some(t => t.id === id)).length || 0} / {dayTasks.length} CONQUERED
                 </Badge>
              </div>

              {dayTasks.length === 0 ? (
                <div className="text-center p-32 bg-card/20 rounded-[5rem] border-[10px] border-dashed border-primary/10 shadow-inner flex flex-col items-center justify-center space-y-10">
                  <Lock className="h-32 w-32 text-primary/10" />
                  <p className="text-4xl text-white/20 font-black uppercase tracking-tighter italic max-w-md">Awaiting Hub Deployment...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {dayTasks.map((task) => {
                    const isComplete = (completedTaskIds || []).includes(task.id);
                    return (
                      <Card 
                        key={task.id} 
                        className={cn(
                          "relative overflow-hidden border-4 transition-all duration-700 cursor-pointer group rounded-[4rem] transform hover:scale-[1.01]",
                          isComplete 
                            ? "border-primary/40 bg-primary/10 opacity-60" 
                            : "border-primary/10 bg-card shadow-2xl hover:border-primary/40"
                        )}
                        onClick={() => uid && toggleTask(uid, task.id)}
                      >
                        <CardContent className="p-12 flex items-center gap-10">
                          <Checkbox 
                            checked={isComplete} 
                            className="h-14 w-14 rounded-2xl border-[6px] border-primary data-[state=checked]:bg-primary shadow-inner transition-transform group-active:scale-90" 
                          />
                          <div className="flex-1 space-y-2">
                            <p className={cn("text-4xl font-black text-white uppercase tracking-tight leading-none", isComplete && "line-through opacity-20")}>
                              {task.title}
                            </p>
                            <p className="text-base text-primary/60 font-black uppercase tracking-[0.2em] italic">{task.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {showAward && (
                <div className="p-20 rounded-[5rem] bg-primary text-[#1f1610] text-center animate-in zoom-in duration-1000 shadow-[0_80px_160px_rgba(255,215,0,0.5)] relative border-[15px] border-[#1f1610]/10 overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Sparkles className="h-32 w-32" /></div>
                  <Trophy className="h-32 w-32 mx-auto mb-10 animate-bounce" />
                  <h2 className="text-8xl font-headline font-black mb-8 uppercase tracking-tighter italic leading-none">Hub Conquered!</h2>
                  <p className="text-3xl font-black uppercase tracking-widest opacity-80 mb-16 leading-relaxed italic">
                    Protocol consistency verified. <br/>Advancing to next root...
                  </p>
                  <Button 
                    className="rounded-full font-black text-4xl px-24 h-28 bg-[#1f1610] text-primary hover:bg-white hover:text-[#1f1610] transition-all active:scale-95 shadow-2xl uppercase tracking-tighter" 
                    onClick={handleNextDay}
                  >
                    DEPLOY NEXT HUB <ArrowRight className="ml-8 h-12 w-12" />
                  </Button>
                </div>
              )}
           </div>
        </div>
      </main>

      <Dialog open={!!activeReward} onOpenChange={() => setActiveReward(null)}>
        <DialogContent className="rounded-[5rem] border-[15px] border-primary/20 bg-mocha-cream p-24 max-w-2xl text-center shadow-[0_50px_150px_rgba(255,215,0,0.4)] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.15),transparent)] pointer-events-none" />
          <div className="relative z-10 space-y-12">
            <div className="w-56 h-56 bg-[#1f1610] text-primary rounded-[4rem] flex items-center justify-center mx-auto shadow-2xl border-[10px] border-primary/20">
              <Gift className="h-32 w-32 animate-pulse" />
            </div>
            <div className="space-y-6">
              <h2 className="text-6xl md:text-7xl font-headline font-black text-[#1f1610] uppercase tracking-tighter italic leading-none">
                TREASURE SECURED
              </h2>
              <div className="h-2 w-32 bg-primary mx-auto rounded-full" />
              <p className="text-3xl font-black text-[#1f1610] uppercase italic tracking-tight">
                {activeReward?.title}
              </p>
            </div>
            <p className="text-lg font-bold text-[#1f1610]/60 uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
              {activeReward?.description}
            </p>
            <Button 
              asChild
              className="w-full h-24 rounded-full bg-[#1f1610] text-primary font-black text-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-tighter gap-6"
            >
              <a href={activeReward?.fileUrl} target="_blank" download>
                <Download className="h-10 w-10" /> DOWNLOAD ASSET
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -2000;
          }
        }
      `}</style>
    </div>
  );
}
