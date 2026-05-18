
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trophy, ArrowRight, Lock, Award } from "lucide-react";
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
        title: `Day ${currentDay} Complete!`,
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
    <div className="min-h-screen flex flex-col bg-secondary/5">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-2 text-accent">Task<span className="text-primary">Do</span></h1>
          <p className="text-muted-foreground text-sm font-black uppercase tracking-widest">Nico Digital Root Infrastructure</p>
        </header>

        <div className="flex gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide">
          {[1, 2, 3, 4, 5, 6, 7].map(d => (
            <Button 
              key={d}
              variant={currentDay === d ? "default" : "outline"}
              className={cn("rounded-full min-w-[75px] h-12 font-black text-lg shadow-sm transition-all", 
                currentDay < d && "opacity-40",
                currentDay > d && "border-primary text-primary"
              )}
              onClick={() => d <= currentDay && setCurrentDay(d)}
              disabled={d > currentDay}
            >
              D{d} {d < currentDay && <Sparkles className="ml-1 h-4 w-4" />}
            </Button>
          ))}
        </div>

        {dayTasks.length === 0 ? (
          <div className="text-center p-20 bg-white rounded-[3rem] border-4 border-dashed border-accent/10 shadow-xl">
            <Lock className="h-14 w-14 mx-auto text-muted-foreground mb-6 opacity-20" />
            <p className="text-xl text-muted-foreground font-bold">The Host is finalizing the 3 tasks for Day {currentDay}.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h2 className="text-3xl font-black text-accent tracking-tighter">Day {currentDay} Routine</h2>
               <Badge className="bg-primary text-accent h-8 px-4 text-sm font-black rounded-full">
                {completedTaskIds.filter(id => dayTasks.some(t => t.id === id)).length} / 3 COMPLETED
               </Badge>
            </div>
            
            <Card className="relative overflow-hidden border-4 border-white shadow-2xl rounded-[3rem] bg-white">
              <CardContent className="p-6 space-y-4">
                {dayTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={cn(
                      "flex items-center space-x-5 p-6 rounded-[2rem] transition-all cursor-pointer border-2",
                      completedTaskIds.includes(task.id) 
                        ? "border-primary/30 bg-primary/10" 
                        : "border-secondary bg-white hover:border-accent/10"
                    )}
                    onClick={() => toggleTask(task.id)}
                  >
                    <Checkbox 
                      checked={completedTaskIds.includes(task.id)} 
                      className="h-7 w-7 rounded-full border-4 border-primary data-[state=checked]:bg-primary" 
                    />
                    <div className="flex-1">
                      <p className={cn("text-xl font-black text-accent", completedTaskIds.includes(task.id) && "line-through opacity-40")}>
                        {task.title}
                      </p>
                      <p className="text-sm text-muted-foreground font-medium mt-1">{task.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {showAward && (
          <div className="mt-12 p-10 rounded-[3rem] bg-primary text-accent text-center animate-in zoom-in duration-700 shadow-2xl relative border-4 border-white">
            <Trophy className="h-16 w-16 mx-auto mb-4 animate-bounce" />
            <h2 className="text-3xl font-headline font-black mb-2 uppercase">Day Mastered!</h2>
            <p className="text-lg opacity-80 mb-8 font-bold">Consistency is the strategy. Mastery is the result.</p>
            <Button variant="secondary" className="rounded-full font-black text-xl px-12 h-16 bg-accent text-white hover:bg-accent/90 shadow-xl" onClick={handleNextDay}>
              Unlock Day {currentDay + 1} <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </div>
        )}

        {showFinalAward && (
          <div className="mt-12 p-12 rounded-[3.5rem] bg-accent text-white text-center animate-in slide-in-from-bottom-10 duration-1000 shadow-2xl border-8 border-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Award className="h-40 w-40 rotate-12" />
            </div>
            <Award className="h-24 w-24 mx-auto mb-6 text-primary animate-pulse" />
            <h2 className="text-5xl font-headline font-black mb-6 tracking-tighter">SOVEREIGN CONSISTENCY</h2>
            <p className="text-xl opacity-80 mb-10 font-medium">You have completed the full 7-day Nico Digital routine. Status: ELITE.</p>
            <Button className="rounded-full bg-primary text-accent font-black px-16 h-18 text-2xl shadow-2xl hover:scale-105 transition-transform" onClick={() => setShowFinalAward(false)}>
              CLAIM STATUS
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
