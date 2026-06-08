
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

const NODE_GAP = 280; 
const MAP_HEIGHT = 450; 
const VERTICAL_SCATTER = [0, 80, -80, 50, -50, 110, -110, 60, -60];

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
  const [shiningDots, setShiningDots] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const mapBg = useMemo(() => 
    PlaceHolderImages.find(img => img.id === 'tactical-map-bg')?.imageUrl || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2500",
  []);

  useEffect(() => {
    setIsMounted(true);
    // Initialize shining dots only on client to avoid hydration mismatch
    const dots = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      size: Math.random() * 2 + 1,
      duration: 3 + Math.random() * 5
    }));
    setShiningDots(dots);
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
      x: i * NODE_GAP + 200,
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

  const totalMapWidth = (ALL_DAYS.length * NODE_GAP) + 800;

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-6 max-w-[1600px] relative z-10 space-y-8">
        
        <header className="text-center space-y-2">
           <h1 className="text-4xl md:text-5xl font-headline font-black text-white tracking-tighter uppercase italic leading-none select-none">
             TASK<span className="text-primary">DO</span>
           </h1>
           <p className="text-primary/40 text-[8px] font-black uppercase tracking-[0.8em]">Tactical Infrastructure Map</p>
        </header>

        <div className="relative group p-1.5 border-4 border-primary/20 rounded-[3rem] bg-[#1f1610]">
          <div className="absolute -inset-2 bg-primary/10 blur-xl opacity-20 rounded-[4rem]" />
          <Card className="rounded-[2.5rem] border-[8px] border-primary/5 bg-[#0a140a] shadow-[0_40px_80px_rgba(0,0,0,0.9)] relative overflow-hidden h-[480px]">
            
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ 
                backgroundImage: `url('${mapBg}')`,
                width: totalMapWidth,
                opacity: 0.4
              }} 
            />
            <div 
              className="absolute inset-0 bg-gradient-to-r from-[#0a140a]/90 via-transparent to-[#0a140a]/90" 
              style={{ width: totalMapWidth }}
            />

            {/* Plexus Shining Dots Layer */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ width: totalMapWidth }}>
               {shiningDots.map(dot => (
                 <div 
                   key={dot.id}
                   className="absolute bg-white rounded-full animate-twinkle shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                   style={{
                     top: `${dot.top}%`,
                     left: `${(dot.left / 100) * totalMapWidth}px`,
                     width: dot.size,
                     height: dot.size,
                     animationDelay: `${dot.delay}s`,
                     animationDuration: `${dot.duration}s`,
                     opacity: 0.3
                   }}
                 />
               ))}
            </div>
            
            <ScrollArea className="w-full h-full">
              <div className="min-w-max h-full relative px-[400px]" ref={scrollRef}>
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: totalMapWidth }}>
                    <defs>
                      <filter id="glow-line">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                      <linearGradient id="glitter-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="white" stopOpacity="1" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>
                    
                    <path 
                      d={tracePath} 
                      fill="none" 
                      stroke="rgba(255,215,0,0.08)" 
                      strokeWidth="10" 
                      strokeLinecap="round"
                    />

                    <path 
                      d={completedTracePath} 
                      fill="none" 
                      stroke="var(--primary)" 
                      strokeWidth="3.5" 
                      strokeLinecap="round"
                      filter="url(#glow-line)"
                      className="opacity-70"
                    />
                    <path 
                      d={completedTracePath} 
                      fill="none" 
                      stroke="url(#glitter-grad)" 
                      strokeWidth="1.5" 
                      strokeLinecap="round"
                      strokeDasharray="8, 16"
                      className="animate-[glitter-flow_2s_linear_infinite]"
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
                            <div className="mb-3 animate-in slide-in-from-bottom-2 fade-in duration-700">
                              <div className="bg-white text-black font-black uppercase text-[7px] tracking-[0.2em] px-3 py-1 rounded-full shadow-[0_5px_15px_rgba(255,255,255,0.8)] border-2 border-primary/20">
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
                              "rounded-[1.8rem] flex items-center justify-center transition-all duration-700 border-[6px] text-2xl font-black italic shadow-2xl relative",
                              isActive 
                                ? "w-28 h-28 bg-primary border-white text-black scale-105 shadow-[0_0_100px_rgba(255,215,0,0.9)]" 
                                : isPast 
                                  ? "w-24 h-24 bg-primary/20 border-primary/40 text-primary opacity-80" 
                                  : "w-22 h-22 bg-[#1f1610]/40 border-white/10 text-white/5"
                            )}
                          >
                            {isWeekEnd && isPast && !isClaimed ? (
                               <Gift className="h-10 w-10 animate-bounce text-white" />
                            ) : (
                               <span className="leading-none">{d}</span>
                            )}
                            
                            {isActive && <div className="absolute inset-1.5 rounded-[1.4rem] border-2 border-white/40 animate-pulse" />}
                          </button>
                          
                          <div className="mt-3">
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-[0.4em] italic",
                              isActive ? "text-primary drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]" : "text-white/20"
                            )}>
                              HUB {d}
                            </span>
                          </div>
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
           <div className="space-y-6">
              <Card className="rounded-[2.5rem] border-4 border-primary/10 bg-card/80 backdrop-blur-3xl p-8 shadow-2xl space-y-8">
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-[1.1rem] flex items-center justify-center border-2 border-primary/20 shadow-inner">
                      <BarChart3 className="h-7 w-7 text-primary" />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Command Intel</h3>
                      <p className="text-[7px] font-black uppercase text-primary/40 tracking-[0.3em]">Operational Status</p>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <span className="text-[7px] font-black text-primary uppercase tracking-[0.2em]">Mastery Sync</span>
                       <span className="text-xl font-black text-white italic">{xp}%</span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full border border-white/10 overflow-hidden shadow-inner">
                       <div className="h-full bg-primary shadow-[0_0_15px_rgba(255,215,0,0.5)] transition-all duration-1000" style={{ width: `${xp}%` }} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 pt-6 border-t border-primary/5">
                    <div className="space-y-1">
                       <p className="text-[7px] font-black text-primary/40 uppercase tracking-widest">Points Vault</p>
                       <p className="text-xl font-black text-white flex items-center gap-2"><Zap className="h-3.5 w-3.5 fill-primary text-primary" /> {points}</p>
                    </div>
                    <div className="space-y-1 text-right">
                       <p className="text-[7px] font-black text-primary/40 uppercase tracking-widest">Streak</p>
                       <p className="text-xl font-black text-orange-500 italic flex items-center justify-end gap-2"><Flame className="h-3.5 w-3.5 fill-orange-500" /> {streak}</p>
                    </div>
                 </div>
              </Card>
           </div>

           <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-6">
                 <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic">HUB {currentTaskDay} PROTOCOL</h2>
                 <Badge className="bg-primary text-black h-9 px-5 text-[8px] font-black rounded-full uppercase tracking-widest shadow-lg border-2 border-black/10">
                    {completedTaskIds?.filter(id => dayTasks.some(t => t.id === id)).length || 0} / {dayTasks.length} CONQUERED
                 </Badge>
              </div>

              {dayTasks.length === 0 ? (
                <div className="text-center p-16 bg-card/20 rounded-[3rem] border-[5px] border-dashed border-primary/10 shadow-inner flex flex-col items-center justify-center space-y-6">
                  <Lock className="h-16 w-16 text-primary/10" />
                  <p className="text-xl text-white/20 font-black uppercase tracking-tighter italic leading-none">Awaiting Protocol Injection...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dayTasks.map((task) => {
                    const isComplete = (completedTaskIds || []).includes(task.id);
                    return (
                      <Card 
                        key={task.id} 
                        className={cn(
                          "relative overflow-hidden border-4 transition-all duration-700 cursor-pointer group rounded-[1.8rem] transform hover:scale-[1.01] active:scale-95",
                          isComplete 
                            ? "border-primary/30 bg-primary/5 opacity-50 shadow-none" 
                            : "border-primary/10 bg-card shadow-xl hover:border-primary/50"
                        )}
                        onClick={() => uid && toggleTask(uid, task.id)}
                      >
                        <CardContent className="p-5 flex items-center gap-6">
                          <Checkbox 
                            checked={isComplete} 
                            className="h-8 w-8 rounded-[0.6rem] border-[4px] border-primary data-[state=checked]:bg-primary shadow-inner transition-all group-active:scale-90" 
                          />
                          <div className="flex-1 space-y-0.5">
                            <p className={cn("text-xl font-black text-white uppercase tracking-tight leading-none italic", isComplete && "line-through opacity-20")}>
                              {task.title}
                            </p>
                            <p className="text-xs text-primary/60 font-black uppercase tracking-[0.2em] italic">{task.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {showAward && (
                <div className="p-10 rounded-[3.5rem] bg-primary text-black text-center animate-in zoom-in duration-700 shadow-[0_30px_60px_rgba(255,215,0,0.5)] relative border-[10px] border-black/5 overflow-hidden mt-6">
                  <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12"><Sparkles className="h-24 w-24" /></div>
                  <Trophy className="h-16 w-16 mx-auto mb-4 animate-bounce" />
                  <h2 className="text-4xl font-headline font-black mb-2 uppercase tracking-tighter italic leading-none">Hub Conquered!</h2>
                  <p className="text-lg font-black uppercase tracking-widest opacity-80 mb-8 leading-relaxed italic">
                    Consistency verified. <br/>Advancing next...
                  </p>
                  <Button 
                    className="rounded-full font-black text-xl px-12 h-18 bg-black text-primary hover:bg-white hover:text-black transition-all active:scale-95 shadow-xl uppercase tracking-tighter border-4 border-primary/10" 
                    onClick={handleNextDay}
                  >
                    DEPLOY NEXT HUB <ArrowRight className="ml-4 h-8 w-8" />
                  </Button>
                </div>
              )}
           </div>
        </div>
      </main>

      <Dialog open={!!activeReward} onOpenChange={() => setActiveReward(null)}>
        <DialogContent className="rounded-[4rem] border-[12px] border-primary/20 bg-mocha-cream p-12 max-w-2xl text-center shadow-[0_100px_100px_rgba(255,215,0,0.6)] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.2),transparent)] pointer-events-none" />
          <div className="relative z-10 space-y-10">
            <div className="w-40 h-40 bg-black text-primary rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl border-[8px] border-primary/20">
              <Gift className="h-20 w-24 animate-pulse" />
            </div>
            <div className="space-y-4">
              <h2 className="text-5xl font-headline font-black text-black uppercase tracking-tighter italic leading-none">
                TREASURE SECURED
              </h2>
              <div className="h-1.5 w-24 bg-primary mx-auto rounded-full shadow-lg" />
              <p className="text-2xl font-black text-black uppercase italic tracking-tight">
                {activeReward?.title}
              </p>
            </div>
            <p className="text-sm font-bold text-black/60 uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed italic">
              {activeReward?.description}
            </p>
            <Button 
              asChild
              className="w-full h-18 rounded-full bg-black text-primary font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-tighter gap-5 border-2 border-primary/10"
            >
              <a href={activeReward?.fileUrl} target="_blank" download>
                <Download className="h-7 w-7" /> DOWNLOAD ASSET
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @keyframes glitter-flow {
          from { stroke-dashoffset: 40; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(0.8); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        .animate-twinkle {
          animation: twinkle linear infinite;
        }
      `}</style>
    </div>
  );
}

