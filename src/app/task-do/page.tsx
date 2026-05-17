
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trophy, ArrowRight, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useAdminStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function TaskDoPage() {
  const { dailyTasks } = useAdminStore();
  const [currentDay, setCurrentDay] = useState(1);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [showAward, setShowAward] = useState(false);

  const dayTasks = dailyTasks.filter(t => t.day === currentDay);
  const isDayComplete = dayTasks.length > 0 && dayTasks.every(t => completedTaskIds.includes(t.id));

  const toggleTask = (id: string) => {
    setCompletedTaskIds(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (isDayComplete) {
      setShowAward(true);
      toast({
        title: "Day " + currentDay + " Complete!",
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
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-headline font-bold mb-4">Task<span className="text-primary">Do</span></h1>
          <p className="text-muted-foreground text-lg">Fail-proof your routine. One day at a time.</p>
        </header>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5, 6, 7].map(d => (
            <Button 
              key={d}
              variant={currentDay === d ? "default" : "outline"}
              className={cn("rounded-full min-w-[80px]", currentDay < d && "opacity-50")}
              onClick={() => d <= currentDay && setCurrentDay(d)}
              disabled={d > currentDay}
            >
              Day {d} {d < currentDay && <Sparkles className="ml-1 h-3 w-3" />}
            </Button>
          ))}
        </div>

        {dayTasks.length === 0 ? (
          <div className="text-center p-20 bg-secondary/20 rounded-[3rem] border-2 border-dashed">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">The admin has not set tasks for Day {currentDay} yet.</p>
          </div>
        ) : (
          <Card className="relative overflow-hidden border-2 border-primary/20 shadow-xl">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Day {currentDay} Checklist
                </CardTitle>
                <Badge variant="outline" className="text-primary border-primary">Strategic Focus</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {dayTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={cn(
                    "flex items-center space-x-4 p-5 rounded-2xl hover:bg-secondary/50 transition-all cursor-pointer border-2",
                    completedTaskIds.includes(task.id) ? "border-primary/20 bg-primary/5" : "border-transparent bg-secondary/10"
                  )}
                  onClick={() => toggleTask(task.id)}
                >
                  <Checkbox 
                    checked={completedTaskIds.includes(task.id)} 
                    className="h-6 w-6 rounded-full border-2 border-primary" 
                  />
                  <div className="flex-1">
                    <p className={cn("text-lg font-bold", completedTaskIds.includes(task.id) && "line-through text-muted-foreground")}>
                      {task.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {showAward && (
          <div className="mt-12 p-10 rounded-[3rem] bg-primary text-primary-foreground text-center animate-in zoom-in duration-500 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Trophy className="h-32 w-32" />
            </div>
            <Trophy className="h-20 w-20 mx-auto mb-4 animate-bounce" />
            <h2 className="text-4xl font-headline font-bold mb-2">Champion Status!</h2>
            <p className="text-xl opacity-90 mb-8">You've mastered Day {currentDay}. Ready for the next level?</p>
            <Button variant="secondary" size="lg" className="rounded-full font-bold px-12" onClick={handleNextDay}>
              Unlock Day {currentDay + 1} <ArrowRight className="ml-2" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
