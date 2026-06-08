
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
const MAP_HEIGHT = 420; 
const VERTICAL_SCATTER = [0, 60, -60, 40, -40, 80, -80, 50, -50];

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

  const totalMapWidth = (30 * NODE_GAP) + 800;

  useEffect(() => {
    setIsMounted(true);
    // Initialize neural plexus particles
    const dots = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * totalMapWidth, // absolute pixel position for connections
      delay: Math.random() * 8,
      size: Math.random() * 2 + 1,
      duration: 3 + Math.random() * 5
    }));
    setShiningDots(dots);
  }, [totalMapWidth]);

  // Calculate plexus lines (dots within 250px of each other)
  const plexusLines = useMemo(() => {
    if (shiningDots.length === 0) return [];
    const lines = [];
    const maxDist = 250;
    for (let i = 0; i < shiningDots.length; i++) {
      for (let j = i + 1; j < Math.min(i + 15, shiningDots.length); j++) {
        const d1 = shiningDots[i];
        const d2 = shiningDots[j];
        const dist = Math.sqrt(Math.pow(d1.left - d2.left, 2) + Math.pow((d1.top / 100 * MAP_HEIGHT) - (d2.top / 100 * MAP_HEIGHT), 2));
        if (dist < maxDist) {
          lines.push({ id: `${i}-${j}`, x1: d1.left, y1: `${d1.top}%`, x2: d2.left, y2: `${d2.top}%`, opacity: 1 - (dist / maxDist) });
        }
      }
    }
    return lines;
  }, [shiningDots]);

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

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-4 max-w-[1500px] relative z-10 space-y-6">
        
        <header className="text-center space-y-1">
           <h1 className="text-3xl md:text-4xl font-headline font-black text-white tracking-tighter uppercase italic leading-none select-none">
             TASK<span className="text-primary">DO</span>
           </h1>
           <p className="text-primary/40 text-[7px] font-black uppercase tracking-[0.8em]">Neural Infrastructure Grid</p>
        </header>

        <div className="relative group p-1 border-4 border-primary/20 rounded-[2.5rem] bg-[#1f1610] shadow-2xl">
          <Card className="rounded-[2rem] border-[6px] border-primary/5 bg-[#0a140a] relative overflow-hidden h-[450px]">
            
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ 
                backgroundImage: `url('${mapBg}')`,
                width: totalMapWidth,
                opacity: 0.35
              }} 
            />
            <div 
              className="absolute inset-0 bg-gradient-to-r from-[#0a140a]/90 via-transparent to-[#0a140a]/90" 
              style={{ width: totalMapWidth }}
            />

            {/* Neural Plexus Network Layer */}
            <svg className="absolute inset-0 pointer-events-none" style={{ width: totalMapWidth, height: '100%' }}>
               {plexusLines.map(line => (
                 <line 
                   key={line.id} 
                   x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} 
                   stroke="rgba(255,215,0,0.15)" 
                   strokeWidth="0.5" 
                   style={{ opacity: line.opacity }}
                 />
               ))}
               {shiningDots.map(dot => (
                 <circle 
                   key={dot.id}
                   cx={dot.left}
                   cy={`${dot.top}%`}
                   r={dot.size / 2}
                   fill="white"
                   className="animate-twinkle"
                   style={{ 
                     opacity: 0.2,
                     animationDelay: `${dot.delay}s`,
                     animationDuration: `${dot.duration}s`
                   }}
                 />
               ))}
            </svg>
            
            <ScrollArea className="w-full h-full">
              <div className="min-w-max h-full relative px-[300px]" ref={scrollRef}>
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: totalMapWidth }}>
                    <defs>
                      <filter id="glow-line">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    <path d={tracePath} fill="none" stroke="rgba(255,215,0,0.05)" strokeWidth="6" strokeLinecap="round" />

                    <path 
                      d={completedTracePath} 
                      fill="none" 
                      stroke="var(--primary)" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                      filter="url(#glow-line)"
                      className="opacity-60"
                    />
                    <path 
                      d={completedTracePath} 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="1" 
                      strokeLinecap="round"
                      strokeDasharray="10, 20"
                      className="animate-[glitter-flow_1.5s_linear_infinite]"
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
                            <div className="mb-2 animate-in slide-in-from-bottom-2 fade-in duration-500">
                              <Badge className="bg-white text-black font-black uppercase text-[6px] tracking-widest px-2 py-0.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] border border-primary/20">
                                ACTIVE HUB
                              </Badge>
                            </div>
                          )}

                          <button
                            onClick={() => {
                              if (isWeekEnd && isPast && reward && !isClaimed) {
                                handleClaimTreasure(reward);
                              }
                            }}
                            className={cn(
                              "rounded-[1.2rem] flex items-center justify-center transition-all duration-500 border-[4px] text-xl font-black italic shadow-2xl relative group",
                              isActive 
                                ? "w-24 h-24 bg-primary border-white text-black scale-110 shadow-[0_0_80px_rgba(255,215,0,0.8)]" 
                                : isPast 
                                  ? "w-20 h-20 bg-primary/20 border-primary/40 text-primary" 
                                  : "w-18 h-18 bg-white/5 border-white/10 text-white/40"
                            )}
                          >
                            {isWeekEnd && isPast && !isClaimed ? (
                               <Gift className="h-8 w-8 animate-bounce text-white" />
                            ) : (
                               <span className="leading-none drop-shadow-md">{d}</span>
                            )}
                            
                            {isActive && <div className="absolute inset-1 rounded-[0.9rem] border-2 border-white/30 animate-pulse" />}
                          </button>
                          
                          <div className="mt-2">
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-[0.3em] italic px-2 py-0.5 rounded-md",
                              isActive ? "text-primary bg-primary/10 shadow-[0_0_10px_rgba(255,215,0,0.4)]" : "text-white/30"
                            )}>
                              HUB {d}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <ScrollBar orientation="horizontal" className="bg-white/5 h-1.5 rounded-full" />
            </ScrollArea>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
           <div className="space-y-4">
              <Card className="rounded-[2rem] border-4 border-primary/10 bg-card/80 backdrop-blur-3xl p-6 shadow-2xl space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-[0.9rem] flex items-center justify-center border-2 border-primary/20 shadow-inner">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Command Intel</h3>
                      <p className="text-[7px] font-black uppercase text-primary/40 tracking-[0.2em]">Operational HUD</p>
                    </div>
                 </div>
                 
                 <div className="space-y-3">
                    <div className="flex justify-between items-end">
                       <span className="text-[7px] font-black text-primary uppercase tracking-[0.2em]">Mastery Progress</span>
                       <span className="text-lg font-black text-white italic">{xp}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full border border-white/10 overflow-hidden">
                       <div className="h-full bg-primary shadow-[0_0_15px_rgba(255,215,0,0.5)] transition-all duration-1000" style={{ width: `${xp}%` }} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/5">
                    <div className="space-y-0.5">
                       <p className="text-[6px] font-black text-primary/40 uppercase tracking-widest">Vault</p>
                       <p className="text-lg font-black text-white flex items-center gap-1.5"><Zap className="h-3 w-3 fill-primary text-primary" /> {points}</p>
                    </div>
                    <div className="space-y-0.5 text-right">
                       <p className="text-[6px] font-black text-primary/40 uppercase tracking-widest">Streak</p>
                       <p className="text-lg font-black text-orange-500 italic flex items-center justify-end gap-1.5"><Flame className="h-3 w-3 fill-orange-500" /> {streak}</p>
                    </div>
                 </div>
              </Card>
           </div>

           <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between px-4">
                 <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase italic">HUB {currentTaskDay} PROTOCOL</h2>
                 <Badge className="bg-primary text-black h-8 px-4 text-[7px] font-black rounded-full uppercase tracking-widest shadow-lg border-2 border-black/10">
                    {completedTaskIds?.filter(id => dayTasks.some(t => t.id === id)).length || 0} / {dayTasks.length} CONQUERED
                 </Badge>
              </div>

              {dayTasks.length === 0 ? (
                <div className="text-center p-12 bg-card/20 rounded-[2.5rem] border-[4px] border-dashed border-primary/10 shadow-inner flex flex-col items-center justify-center space-y-4">
                  <Lock className="h-12 w-12 text-primary/10" />
                  <p className="text-lg text-white/20 font-black uppercase tracking-tighter italic">Awaiting Protocol Injection...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {dayTasks.map((task) => {
                    const isComplete = (completedTaskIds || []).includes(task.id);
                    return (
                      <Card 
                        key={task.id} 
                        className={cn(
                          "relative overflow-hidden border-2 transition-all duration-500 cursor-pointer group rounded-[1.2rem] transform hover:scale-[1.01] active:scale-95",
                          isComplete 
                            ? "border-primary/20 bg-primary/5 opacity-50 shadow-none" 
                            : "border-primary/10 bg-card shadow-lg hover:border-primary/40"
                        )}
                        onClick={() => uid && toggleTask(uid, task.id)}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <Checkbox 
                            checked={isComplete} 
                            className="h-6 w-6 rounded-[0.4rem] border-[3px] border-primary data-[state=checked]:bg-primary shadow-inner transition-all group-active:scale-90" 
                          />
                          <div className="flex-1 space-y-0.5">
                            <p className={cn("text-lg font-black text-white uppercase tracking-tight leading-none italic", isComplete && "line-through opacity-20")}>
                              {task.title}
                            </p>
                            <p className="text-[10px] text-primary/60 font-black uppercase tracking-[0.1em] italic">{task.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {showAward && (
                <div className="p-8 rounded-[2.5rem] bg-primary text-black text-center animate-in zoom-in duration-500 shadow-[0_20px_40px_rgba(255,215,0,0.4)] relative border-[8px] border-black/5 overflow-hidden mt-4">
                  <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><Sparkles className="h-20 w-20" /></div>
                  <Trophy className="h-12 w-12 mx-auto mb-2 animate-bounce" />
                  <h2 className="text-3xl font-headline font-black mb-1 uppercase tracking-tighter italic">Hub Conquered!</h2>
                  <p className="text-sm font-black uppercase tracking-widest opacity-80 mb-6 italic leading-relaxed">
                    Consistency verified. <br/>Advancing infrastructure root...
                  </p>
                  <Button 
                    className="rounded-full font-black text-lg px-10 h-16 bg-black text-primary hover:bg-white hover:text-black transition-all active:scale-95 shadow-xl uppercase tracking-tighter border-2 border-primary/10" 
                    onClick={handleNextDay}
                  >
                    DEPLOY NEXT HUB <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </div>
              )}
           </div>
        </div>
      </main>

      <Dialog open={!!activeReward} onOpenChange={() => setActiveReward(null)}>
        <DialogContent className="rounded-[3.5rem] border-[10px] border-primary/20 bg-mocha-cream p-10 max-w-xl text-center shadow-[0_80px_80px_rgba(255,215,0,0.5)] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.15),transparent)] pointer-events-none" />
          <div className="relative z-10 space-y-8">
            <div className="w-32 h-32 bg-black text-primary rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl border-[6px] border-primary/20">
              <Gift className="h-16 w-16 animate-pulse" />
            </div>
            <div className="space-y-3">
              <h2 className="text-4xl font-headline font-black text-black uppercase tracking-tighter italic leading-none">
                TREASURE SECURED
              </h2>
              <div className="h-1 w-20 bg-primary mx-auto rounded-full shadow-lg" />
              <p className="text-xl font-black text-black uppercase italic tracking-tight">
                {activeReward?.title}
              </p>
            </div>
            <p className="text-[11px] font-bold text-black/60 uppercase tracking-[0.1em] max-w-xs mx-auto italic">
              {activeReward?.description}
            </p>
            <Button 
              asChild
              className="w-full h-16 rounded-full bg-black text-primary font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-tighter gap-4 border border-primary/10"
            >
              <a href={activeReward?.fileUrl} target="_blank" download>
                <Download className="h-6 w-6" /> DOWNLOAD ASSET
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @keyframes glitter-flow {
          from { stroke-dashoffset: 60; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.05; transform: scale(0.8); }
          50% { opacity: 0.6; transform: scale(1.4); }
        }
        .animate-twinkle {
          animation: twinkle linear infinite;
        }
      `}</style>
    </div>
  );
}
