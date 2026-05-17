
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trophy, ArrowRight, Lock, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useAdminStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function TaskDoPage() {
  const { dailyTasks } = useAdminStore();
  const [currentDay, setCurrentDay] = useState(1);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [showAward, setShowAward] = useState(false);
  const [showFinalAward, setShowFinalAward] = useState(false);

  const dayTasks = dailyTasks.filter(t => t.day === currentDay);
  // Requirement: Exactly 3 tasks per day must be completed
  const isDayComplete = dayTasks.length >= 3 && dayTasks.every(t => completedTaskIds.includes(t.id));

  const toggleTask = (id: string) => {
    setCompletedTaskIds(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (isDayComplete) {
      if (currentDay === 7) {
        setShowFinalAward(true);
      } else {
        setShowAward(true);
      }
      toast({
        title: `Day ${currentDay} Complete!`,
        description: "Excellent consistency, Succemazing. Stay Gold.",
      });
    } else {
      setShowAward(false);
    }
  }, [isDayComplete, currentDay]);

  const handleNextDay = () => {
    setCurrentDay(d => d + 1);
    setShowAward(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/5">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-2">Task<span className="text-primary">Do</span></h1>
          <p className="text-muted-foreground text-sm font-medium">Under Nico Digital Infrastructure</p>
        </header>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-4 scrollbar-hide">
          {[1, 2, 3, 4, 5, 6, 7].map(d => (
            <Button 
              key={d}
              variant={currentDay === d ? "default" : "outline"}
              className={cn("rounded-full min-w-[70px] h-10 font-bold", currentDay < d && "opacity-50")}
              onClick={() => d <= currentDay && setCurrentDay(d)}
              disabled={d > currentDay}
            >
              D{d} {d < currentDay && <Sparkles className="ml-1 h-3 w-3" />}
            </Button>
          ))}
        </div>

        {dayTasks.length === 0 ? (
          <div className="text-center p-16 bg-white rounded-[2rem] border-2 border-dashed border-accent/10 shadow-sm">
            <Lock className="h-10 w-10 mx-auto text-muted-foreground mb-4 opacity-30" />
            <p className="text-muted-foreground font-medium">The Host has not set the 3 tasks for Day {currentDay} yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-2xl font-bold text-accent">Day {currentDay} Checklist</h2>
               <Badge className="bg-primary text-accent h-6">{completedTaskIds.filter(id => dayTasks.some(t => t.id === id)).length}/3 Done</Badge>
            </div>
            
            <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg rounded-[2rem]">
              <CardContent className="p-4 space-y-3">
                {dayTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-xl transition-all cursor-pointer border",
                      completedTaskIds.includes(task.id) ? "border-primary/20 bg-primary/5" : "border-secondary bg-white hover:bg-secondary/5"
                    )}
                    onClick={() => toggleTask(task.id)}
                  >
                    <Checkbox 
                      checked={completedTaskIds.includes(task.id)} 
                      className="h-5 w-5 rounded-full border-2 border-primary" 
                    />
                    <div className="flex-1">
                      <p className={cn("text-base font-bold", completedTaskIds.includes(task.id) && "line-through text-muted-foreground")}>
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground leading-snug">{task.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {showAward && (
          <div className="mt-10 p-8 rounded-[2rem] bg-primary text-accent text-center animate-in zoom-in duration-500 shadow-xl relative overflow-hidden">
            <Trophy className="h-12 w-12 mx-auto mb-2 animate-bounce" />
            <h2 className="text-2xl font-headline font-bold mb-1">Day Complete!</h2>
            <p className="text-base opacity-80 mb-6 font-medium">You've mastered Day {currentDay}. Consistency leads to mastery.</p>
            <Button variant="secondary" className="rounded-full font-bold px-10 bg-accent text-white hover:bg-accent/90" onClick={handleNextDay}>
              Unlock Day {currentDay + 1} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {showFinalAward && (
          <div className="mt-10 p-10 rounded-[2.5rem] bg-accent text-white text-center animate-in slide-in-from-bottom-5 duration-700 shadow-2xl border-4 border-primary">
            <Award className="h-20 w-20 mx-auto mb-4 text-primary animate-pulse" />
            <h2 className="text-4xl font-headline font-bold mb-4">Ultimate Consistency!</h2>
            <p className="text-lg opacity-80 mb-8 font-medium">You have completed the full 7-day strategic routine. Nico Digital acknowledges your excellence.</p>
            <Button className="rounded-full bg-primary text-accent font-black px-12 h-14" onClick={() => setShowFinalAward(false)}>
              CLAIM STATUS
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
