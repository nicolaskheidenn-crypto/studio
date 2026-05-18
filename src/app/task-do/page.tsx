"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trophy, ArrowRight, Lock, Award, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useAdminStore, useUserStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function TaskDoPage() {
  const { dailyTasks } = useAdminStore();
  const { completedTaskIds, toggleTask } = useUserStore();
  const [currentDay, setCurrentDay] = useState(1);
  const [showAward, setShowAward] = useState(false);
  const [showFinalAward, setShowFinalAward] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dayTasks = dailyTasks.filter(t => t.day === currentDay);
  const isDayComplete = dayTasks.length >= 3 && dayTasks.every(t => completedTaskIds.includes(t.id));

  useEffect(() => {
    if (isDayComplete && isMounted) {
      if (currentDay === 7) {
        setShowFinalAward(true);
      } else {
        setShowAward(true);
      }
      toast({
        title: `Day ${currentDay} Mastered!`,
        description: "Excellent consistency. Nico Digital acknowledges your discipline.",
      });
    } else {
      setShowAward(false);
    }
  }, [isDayComplete, currentDay, isMounted]);

  const handleNextDay = () => {
    setCurrentDay(d => d + 1);
    setShowAward(false);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <header className="text-center mb-10 space-y-2">
          <h1 className="text-6xl font-headline font-black text-white tracking-tighter uppercase">Task<span className="text-primary italic">Do</span></h1>
          <p className="text-primary/40 text-[10px] font-black uppercase tracking-[0.5em]">Nico Digital Root Infrastructure</p>
        </header>

        <div className="flex gap-4 mb-12 overflow-x-auto pb-6 scrollbar-hide px-2">
          {[1, 2, 3, 4, 5, 6, 7].map(d => (
            <Button 
              key={d}
              variant={currentDay === d ? "default" : "outline"}
              className={cn("rounded-3xl min-w-[85px] h-14 font-black text-xl shadow-xl transition-all border-2", 
                currentDay === d ? "bg-primary text-background border-primary" : "border-primary/20 text-primary/40",
                currentDay > d && "border-primary text-primary opacity-100"
              )}
              onClick={() => d <= currentDay && setCurrentDay(d)}
              disabled={d > currentDay}
            >
              D{d} {currentDay > d && <ShieldCheck className="ml-1 h-4 w-4" />}
            </Button>
          ))}
        </div>

        {dayTasks.length === 0 ? (
          <div className="text-center p-20 bg-secondary/20 rounded-[3rem] border-4 border-dashed border-primary/10 shadow-2xl">
            <Lock className="h-16 w-16 mx-auto text-primary/20 mb-8" />
            <p className="text-2xl text-white/50 font-black uppercase tracking-tight">The Host is finalizing Day {currentDay} tasks.</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between px-4">
               <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Day {currentDay} Routine</h2>
               <Badge className="bg-primary text-background h-8 px-5 text-[10px] font-black rounded-full uppercase tracking-widest shadow-xl">
                {completedTaskIds.filter(id => dayTasks.some(t => t.id === id)).length} / 3 COMPLETED
               </Badge>
            </div>
            
            <Card className="relative overflow-hidden border-4 border-primary/10 shadow-2xl rounded-[3.5rem] bg-secondary/20 backdrop-blur-sm">
              <CardContent className="p-8 space-y-6">
                {dayTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={cn(
                      "flex items-center space-x-6 p-8 rounded-[2.5rem] transition-all cursor-pointer border-2",
                      completedTaskIds.includes(task.id) 
                        ? "border-primary/40 bg-primary/10" 
                        : "border-primary/5 bg-background/40 hover:border-primary/20"
                    )}
                    onClick={() => toggleTask(task.id)}
                  >
                    <Checkbox 
                      checked={completedTaskIds.includes(task.id)} 
                      className="h-8 w-8 rounded-full border-4 border-primary data-[state=checked]:bg-primary shadow-lg" 
                    />
                    <div className="flex-1">
                      <p className={cn("text-2xl font-black text-white uppercase tracking-tight leading-none mb-2", completedTaskIds.includes(task.id) && "line-through opacity-20")}>
                        {task.title}
                      </p>
                      <p className="text-[11px] text-primary/60 font-black uppercase tracking-widest">{task.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {showAward && (
          <div className="mt-12 p-12 rounded-[3.5rem] bg-primary text-background text-center animate-in zoom-in duration-700 shadow-[0_40px_80px_rgba(255,215,0,0.3)] relative border-4 border-white rotate-1">
            <Trophy className="h-20 w-20 mx-auto mb-6 animate-bounce" />
            <h2 className="text-5xl font-headline font-black mb-4 uppercase tracking-tighter">Day Mastered!</h2>
            <p className="text-xl font-black uppercase tracking-widest opacity-80 mb-10 leading-relaxed">
              Strategic consistency complete.<br/>You are one step closer to Sovereignty.
            </p>
            <Button 
              className="rounded-full font-black text-2xl px-16 h-20 bg-background text-primary hover:bg-secondary transition-all active:scale-95 shadow-2xl uppercase tracking-tighter" 
              onClick={handleNextDay}
            >
              Unlock Day {currentDay + 1} <ArrowRight className="ml-4 h-8 w-8" />
            </Button>
          </div>
        )}

        {showFinalAward && (
          <div className="mt-12 p-12 rounded-[4rem] bg-background text-white text-center animate-in slide-in-from-bottom-20 duration-1000 shadow-2xl border-8 border-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <Award className="h-56 w-56 rotate-12 text-primary" />
            </div>
            <Award className="h-28 w-28 mx-auto mb-8 text-primary animate-pulse" />
            <h2 className="text-6xl font-headline font-black mb-6 tracking-tighter uppercase italic">Sovereign Consistency</h2>
            <p className="text-2xl font-black uppercase tracking-widest opacity-60 mb-12">
              Status: ELITE STRATEGIST.<br/>Full 7-Day Nico Digital routine mastered.
            </p>
            <Button 
              className="rounded-full bg-primary text-background font-black px-20 h-24 text-3xl shadow-[0_30px_60px_rgba(255,215,0,0.4)] hover:scale-105 transition-transform uppercase tracking-tighter" 
              onClick={() => setShowFinalAward(false)}
            >
              Claim Mastery
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
