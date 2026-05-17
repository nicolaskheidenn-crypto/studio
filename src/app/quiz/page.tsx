
"use client";

import { useState, useEffect, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { XCircle, Trophy, Shuffle, ShieldAlert, AlertTriangle } from "lucide-react";
import { useAdminStore, QuizQuestion } from "@/lib/store";
import { toast } from "@/hooks/use-toast";

export default function QuizPage() {
  const { quizzes } = useAdminStore();
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [cheatTriggered, setCheatTriggered] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");

  const shuffle = useCallback((array: any[]) => {
    return [...array].sort(() => Math.random() - 0.5);
  }, []);

  const handleCheat = useCallback(() => {
    if (activeQuiz && !isFinished && !hasFailed) {
      setCheatTriggered(true);
      setCurrentIdx(0);
      setShuffledQuestions(shuffle(activeQuiz.questions));
      toast({
        title: "CHEATING DETECTED",
        description: "Focus lost. Progress reset and questions shuffled.",
        variant: "destructive",
      });
      setTimeout(() => setCheatTriggered(false), 4000);
    }
  }, [activeQuiz, isFinished, hasFailed, shuffle]);

  useEffect(() => {
    window.addEventListener("blur", handleCheat);
    return () => window.removeEventListener("blur", handleCheat);
  }, [handleCheat]);

  const startQuiz = (quiz: any) => {
    setActiveQuiz(quiz);
    setShuffledQuestions(shuffle(quiz.questions));
    setCurrentIdx(0);
    setIsFinished(false);
    setHasFailed(false);
    setUserAnswer("");
  };

  const handleNext = () => {
    const currentQuestion = shuffledQuestions[currentIdx];
    if (userAnswer.toLowerCase().trim() !== currentQuestion.answer.toLowerCase().trim()) {
      setHasFailed(true);
      return;
    }

    if (currentIdx + 1 < shuffledQuestions.length) {
      setCurrentIdx(idx => idx + 1);
      setUserAnswer("");
    } else {
      setIsFinished(true);
    }
  };

  if (hasFailed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-destructive text-white p-6 text-center">
        <XCircle className="h-32 w-32 mb-8 animate-bounce" />
        <h1 className="text-6xl font-headline font-bold mb-4">FAILED</h1>
        <p className="text-2xl mb-12">One mistake is all it takes. Study harder.</p>
        <Button onClick={() => setActiveQuiz(null)} variant="secondary" className="rounded-full px-12 h-16 text-xl font-bold">
          Back to FireQuizzo
        </Button>
      </div>
    );
  }

  if (!activeQuiz) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-12">
            <header className="text-center space-y-4">
              <h1 className="text-6xl font-headline font-bold">Fire<span className="text-primary italic">Quizzo</span></h1>
              <p className="text-muted-foreground text-xl">The ultimate knowledge filter. Cheat and you reset.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {quizzes.map((q) => (
                <Card key={q.id} className="hover:border-primary/50 transition-all cursor-pointer group rounded-[2.5rem] p-4 bg-card shadow-lg" onClick={() => startQuiz(q)}>
                  <CardHeader>
                    <CardTitle className="text-2xl">{q.title}</CardTitle>
                    <CardDescription>{q.questions.length} Questions • Anti-Cheat Active</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-primary text-accent p-6 text-center">
        <Trophy className="h-32 w-32 mb-8" />
        <h1 className="text-6xl font-headline font-bold mb-4">MASTERY ACHIEVED</h1>
        <p className="text-2xl mb-12">You have proven your focus, Succemazing.</p>
        <Button onClick={() => setActiveQuiz(null)} variant="ghost" className="rounded-full px-12 h-16 text-xl font-bold border-2 border-accent">
          Return to Hub
        </Button>
      </div>
    );
  }

  const currentQ = shuffledQuestions[currentIdx];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center">
        {cheatTriggered && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center text-white p-6 text-center">
            <AlertTriangle className="h-48 w-48 text-red-600 mb-8 animate-pulse" />
            <h1 className="text-7xl font-headline font-bold mb-4">NO CHEATING</h1>
            <p className="text-3xl text-red-500 font-bold uppercase tracking-widest">System Resetting...</p>
          </div>
        )}

        <div className="max-w-3xl w-full space-y-12">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-accent">{activeQuiz.title}</h2>
            <div className="text-xl font-mono bg-accent text-white px-6 py-2 rounded-full">
              {currentIdx + 1} / {shuffledQuestions.length}
            </div>
          </div>

          <Card className="rounded-[3rem] border-4 border-accent/10 shadow-2xl p-10 md:p-16">
            <h3 className="text-2xl md:text-3xl font-bold mb-12 leading-relaxed text-center">{currentQ.question}</h3>
            <div className="space-y-6">
              {currentQ.type === 'multiple' && currentQ.options && (
                <div className="grid gap-4">
                  {currentQ.options.map((opt, i) => (
                    <button 
                      key={i} 
                      onClick={() => setUserAnswer(opt)}
                      className={`p-6 text-left border-2 rounded-2xl text-lg font-bold transition-all ${userAnswer === opt ? "bg-accent text-white border-accent" : "border-secondary hover:border-primary bg-secondary/20"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
              {currentQ.type === 'boolean' && (
                <div className="grid grid-cols-2 gap-6">
                  {['True', 'False'].map((opt) => (
                    <button 
                      key={opt}
                      onClick={() => setUserAnswer(opt)}
                      className={`p-10 text-center border-2 rounded-[2rem] text-2xl font-bold transition-all ${userAnswer === opt ? "bg-accent text-white border-accent" : "border-secondary hover:border-primary bg-secondary/20"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
              {currentQ.type === 'id' && (
                <Input 
                  placeholder="Type the exact answer..." 
                  className="h-20 rounded-2xl text-2xl text-center font-bold bg-secondary/10" 
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                />
              )}
            </div>
            <Button className="w-full mt-12 h-20 rounded-full font-bold text-2xl bg-accent hover:bg-accent/90 shadow-xl" onClick={handleNext} disabled={!userAnswer}>
              Confirm Answer
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
