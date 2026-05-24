
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Trophy, ArrowRight, Lock, Award, ShieldCheck, 
  Flame, Zap, Target, Coffee, BarChart3, ChevronRight 
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
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
  const { data: globalTasks } = useCollection(tasksQuery);
  
  const profiles = useUserStore(s => s.profiles);
  const profile = useMemo(() => {
    const raw = uid ? profiles[uid] || DEFAULT_PROFILE : DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...raw };
  }, [profiles, uid]);
  
  const { 
    completedTaskIds = [], currentTaskDay = 1, level = 1, points = 0, streak = 0, xp = 0 
  } = profile;
  
  const { toggleTask, unlockNextDay } = useUserStore();

  const [showAward, setShowAward] = useState(false);
  const [showFinalAward, setShowFinalAward] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dayTasks = useMemo(() => globalTasks.filter(t => t.day === currentTaskDay), [globalTasks, currentTaskDay]);
  const isDayComplete = useMemo(() => dayTasks.length > 0 && dayTasks.every(t => (completedTaskIds || []).includes(t.id)), [dayTasks, completedTaskIds]);

  useEffect(() => {
    if (isDayComplete && isMounted && uid) {
      if (currentTaskDay === 30) {
        setShowFinalAward(true);
      } else {
        setShowAward(true);
      }
    } else {
      setShowAward(false);
    }
  }, [isDayComplete, currentTaskDay, isMounted, uid]);

  const handleNextDay = () => {
    if (!uid) return;
    unlockNextDay(uid);
    setShowAward(false);
    toast({
      title: `Day ${currentTaskDay + 1} Protocol Initiated`,
      description: "Previous routines have been archived for sovereignty.",
    });
  };

  const growthMultiplier = (1 + level / 10).toFixed(1);

  if (!isMounted) return null;

  const ALL_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Navigation />
      
      {/* Background Decorations */}
      <div className="absolute top-[15%] left-[5%] opacity-5 -rotate-12 pointer-events-none">
        <Coffee className="w-96 h-96 text-primary" />
      </div>
      <div className="absolute bottom-[10%] right-[5%] opacity-5 rotate-12 pointer-events-none">
        <Target className="w-80 h-80 text-primary" />
      </div>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
          
          {/* Left Side: Executive Summary */}
          <div className="hidden lg:flex flex-col gap-10">
            <Card className="rounded-[3rem] border-4 border-primary/10 bg-card/40 p-10 shadow-2xl space-y-8">
               <div className="space-y-2">
                 <h3 className="text-2xl font-black uppercase text-foreground italic flex items-center gap-3"><BarChart3 className="h-6 w-6 text-primary" /> Power Level</h3>
                 <p className="text-[10px] font-black uppercase text-primary/40 tracking-widest">Growth progression</p>
               </div>
               
               <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full rotate-[-90deg]">
                    <circle cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-primary/10" />
                    <circle cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray="364.4" strokeDashoffset={364.4 - (364.4 * xp) / 100} className="text-primary" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-foreground">Lv.{level}</span>
                    <span className="text-[10px] font-black text-primary/60 uppercase">{xp}%</span>
                  </div>
               </div>

               <div className="space-y-6 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-primary/40">Vault Balance</span>
                    <span className="text-xl font-black text-foreground flex items-center gap-2"><Zap className="h-4 w-4 fill-primary text-primary" /> {points}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-primary/40">Growth Factor</span>
                    <span className="text-xl font-black text-primary italic">x{growthMultiplier}</span>
                  </div>
               </div>
            </Card>

            <Card className="rounded-[3rem] border-4 border-primary/10 bg-card/40 p-10 shadow-2xl text-center space-y-4">
               <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-orange-500/20">
                 <Flame className="h-8 w-8 text-orange-500 fill-orange-500" />
               </div>
               <h4 className="text-4xl font-black text-foreground tracking-tighter italic">{streak}</h4>
               <p className="text-[10px] font-black uppercase text-primary/40 tracking-[0.3em]">Day Consistency</p>
            </Card>
          </div>

          {/* Center: Task List */}
          <div className="lg:col-span-2 space-y-12">
            <header className="text-center space-y-4">
              <h1 className="text-6xl md:text-8xl font-headline font-black text-white tracking-tighter uppercase italic">Task<span className="text-primary">Do</span></h1>
              <p className="text-primary/40 text-[10px] font-black uppercase tracking-[0.8em] max-w-sm mx-auto">Sovereign 30-Day Routine Infrastructure</p>
            </header>

            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide px-2 lg:hidden">
              {ALL_DAYS.map(d => (
                <Button 
                  key={d}
                  variant={currentTaskDay === d ? "default" : "outline"}
                  className={cn("rounded-2xl min-w-[70px] h-12 font-black text-lg shadow-xl transition-all border-2", 
                    currentTaskDay === d ? "bg-primary text-background border-primary" : "border-primary/20 text-primary/40",
                    currentTaskDay > d && "border-primary text-primary opacity-50 grayscale"
                  )}
                  disabled={d !== currentTaskDay}
                >
                  D{d}
                </Button>
              ))}
            </div>

            {dayTasks.length === 0 ? (
              <div className="text-center p-24 bg-card/20 rounded-[4rem] border-8 border-dashed border-primary/10 shadow-2xl animate-in fade-in zoom-in duration-700">
                <Lock className="h-20 w-20 mx-auto text-primary/10 mb-8" />
                <p className="text-3xl text-white/30 font-black uppercase tracking-tighter italic">Waiting for Host deployment...</p>
                <p className="text-[10px] font-black text-primary/20 uppercase mt-4 tracking-widest">Protocol Sync (Day {currentTaskDay})</p>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="flex items-center justify-between px-10">
                   <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Day {currentTaskDay} Routine</h2>
                   <Badge className="bg-primary text-background h-10 px-8 text-[11px] font-black rounded-full uppercase tracking-widest shadow-2xl border-4 border-primary/20">
                    {completedTaskIds?.filter(id => dayTasks.some(t => t.id === id)).length || 0} / {dayTasks.length} DONE
                   </Badge>
                </div>
                
                <Card className="relative overflow-hidden border-[10px] border-primary/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] rounded-[4.5rem] bg-card/60 backdrop-blur-xl">
                  <CardContent className="p-12 space-y-8">
                    {dayTasks.map((task) => {
                      const isComplete = (completedTaskIds || []).includes(task.id);
                      return (
                        <div 
                          key={task.id} 
                          className={cn(
                            "flex items-center space-x-8 p-10 rounded-[3.5rem] transition-all cursor-pointer border-4 group",
                            isComplete 
                              ? "border-primary/40 bg-primary/10" 
                              : "border-primary/5 bg-background/40 hover:border-primary/30"
                          )}
                          onClick={() => uid && toggleTask(uid, task.id)}
                        >
                          <Checkbox 
                            checked={isComplete} 
                            className="h-10 w-10 rounded-full border-[6px] border-primary data-[state=checked]:bg-primary shadow-2xl transition-transform group-active:scale-90" 
                          />
                          <div className="flex-1">
                            <p className={cn("text-3xl font-black text-white uppercase tracking-tight leading-none mb-3", isComplete && "line-through opacity-20")}>
                              {task.title}
                            </p>
                            <p className="text-sm text-primary/60 font-black uppercase tracking-widest italic">{task.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            )}

            {showAward && (
              <div className="p-16 rounded-[5rem] bg-primary text-background text-center animate-in zoom-in duration-700 shadow-[0_60px_120px_rgba(255,215,0,0.4)] relative border-[12px] border-white/40">
                <Trophy className="h-24 w-24 mx-auto mb-8 animate-bounce" />
                <h2 className="text-6xl font-headline font-black mb-6 uppercase tracking-tighter italic leading-none">Day Mastered!</h2>
                <p className="text-2xl font-black uppercase tracking-widest opacity-80 mb-12 leading-relaxed">
                  Strategic consistency complete.<br/>The routine is archived.
                </p>
                <Button 
                  className="rounded-full font-black text-3xl px-20 h-24 bg-background text-primary hover:bg-white transition-all active:scale-95 shadow-2xl uppercase tracking-tighter" 
                  onClick={handleNextDay}
                >
                  Advance to Day {currentTaskDay + 1} <ArrowRight className="ml-6 h-10 w-10" />
                </Button>
              </div>
            )}

            {showFinalAward && (
              <div className="p-16 rounded-[5rem] bg-background text-white text-center animate-in slide-in-from-bottom-20 duration-1000 shadow-2xl border-[15px] border-primary relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.15),transparent)] pointer-events-none" />
                <Award className="h-32 w-32 mx-auto mb-10 text-primary animate-pulse relative z-10" />
                <h2 className="text-7xl font-headline font-black mb-6 tracking-tighter uppercase italic relative z-10">Sovereign Mastery</h2>
                <p className="text-2xl font-black uppercase tracking-widest opacity-60 mb-14 relative z-10">
                  Status: ELITE STRATEGIST.<br/>Full 30-Day Fail-Proof Routine completed.
                </p>
                <Button 
                  className="rounded-full bg-primary text-background font-black px-24 h-28 text-4xl shadow-[0_40px_80px_rgba(255,215,0,0.5)] hover:scale-105 transition-transform uppercase tracking-tighter relative z-10" 
                  onClick={() => setShowFinalAward(false)}
                >
                  Claim Mastery
                </Button>
              </div>
            )}
          </div>

          {/* Right Side: Consistency Roadmap */}
          <div className="hidden lg:flex flex-col gap-10">
             <div className="px-6 space-y-2">
                <h3 className="text-2xl font-black text-foreground uppercase italic">30-Day Roadmap</h3>
                <p className="text-[10px] font-black uppercase text-primary/40 tracking-widest">Protocol Cycle</p>
             </div>

             <ScrollArea className="h-[700px] pr-4">
               <div className="space-y-6">
                  {ALL_DAYS.map((d) => {
                    const isActive = currentTaskDay === d;
                    const isPast = currentTaskDay > d;
                    const isLocked = currentTaskDay < d;

                    return (
                      <div 
                        key={d} 
                        className={cn(
                          "relative flex items-center gap-6 p-6 rounded-[2.5rem] border-4 transition-all duration-500",
                          isActive ? "bg-primary/20 border-primary shadow-xl scale-105" : 
                          isPast ? "bg-primary/5 border-primary/20 opacity-40" : 
                          "bg-card/20 border-white/5 opacity-20"
                        )}
                      >
                         <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl italic shadow-inner",
                          isActive ? "bg-primary text-background" : 
                          isPast ? "bg-primary/20 text-primary" : 
                          "bg-white/5 text-white/20"
                         )}>
                          {isPast ? <ShieldCheck className="h-8 w-8" /> : `D${d}`}
                         </div>
                         
                         <div className="flex-1">
                            <p className={cn("text-xs font-black uppercase tracking-widest", isActive ? "text-primary" : "text-foreground/40")}>
                              {isActive ? "ACTIVE PROTOCOL" : isPast ? "ARCHIVED" : "LOCKED"}
                            </p>
                         </div>

                         {isActive && <ChevronRight className="h-6 w-6 text-primary animate-pulse" />}
                         {isLocked && <Lock className="h-5 w-5 text-white/10" />}
                      </div>
                    );
                  })}
               </div>
             </ScrollArea>

             <Card className="mt-6 rounded-[3rem] border-4 border-dashed border-primary/20 bg-card/10 p-10 text-center">
                <Award className="h-10 w-10 text-primary/20 mx-auto mb-4" />
                <p className="text-[10px] font-black text-primary/20 uppercase tracking-[0.4em] leading-relaxed">
                  Complete all 30 days to unlock the "Sovereign Elite" Achievement
                </p>
             </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
