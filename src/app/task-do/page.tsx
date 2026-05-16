
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trophy, Plus, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export default function TaskDoPage() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Plan your next digital campaign', completed: false },
    { id: '2', title: 'Post 3 times on social media', completed: false },
    { id: '3', title: 'Reach out to 5 potential clients', completed: false },
  ]);
  const [showAward, setShowAward] = useState(false);

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
  };

  useEffect(() => {
    if (tasks.length > 0 && tasks.every(t => t.completed)) {
      setShowAward(true);
      toast({
        title: "Achievement Unlocked!",
        description: "You've completed all daily tasks. Keep the momentum!",
      });
    } else {
      setShowAward(false);
    }
  }, [tasks]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-headline font-bold mb-4">Task<span className="text-primary">Do</span></h1>
          <p className="text-muted-foreground text-lg">Fail-proof your day with these automatic tasks.</p>
        </header>

        <Card className="relative overflow-hidden border-2 border-primary/20">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Daily Checklist
              </CardTitle>
              <Badge variant="outline" className="text-primary border-primary">{new Date().toLocaleDateString()}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => toggleTask(task.id)}>
                <Checkbox id={task.id} checked={task.completed} className="h-6 w-6 rounded-full border-2 border-primary" />
                <label 
                  htmlFor={task.id} 
                  className={cn(
                    "text-lg font-medium flex-1 cursor-pointer",
                    task.completed && "line-through text-muted-foreground"
                  )}
                >
                  {task.title}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        {showAward && (
          <div className="mt-12 p-8 rounded-3xl bg-primary text-primary-foreground text-center animate-in zoom-in-50 duration-500 shadow-2xl">
            <Trophy className="h-20 w-20 mx-auto mb-4 animate-bounce" />
            <h2 className="text-3xl font-bold mb-2">Daily Champion!</h2>
            <p className="text-primary-foreground/90">Consistency is the bridge between goals and accomplishment.</p>
            <Button variant="secondary" className="mt-6 rounded-full font-bold" onClick={() => setTasks(tasks.map(t => ({...t, completed: false})))}>
              Reset for Tomorrow
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
