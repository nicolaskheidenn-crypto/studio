
"use client";

import { useState, useEffect, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { XCircle, Trophy, ShieldAlert, AlertTriangle, ArrowLeft } from "lucide-react";
import { useAdminStore, QuizQuestion } from "@/lib/store";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

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
    if (activeQuiz && !isFinished && !hasFailed && !cheatTriggered) {
      setCheatTriggered(true);
      // Systemic reset
      setTimeout(() => {
        setShuffledQuestions(shuffle(activeQuiz.questions));
        setCurrentIdx(0);
        setUserAnswer("");
        setCheatTriggered(false);
        toast({
          title: "SECURITY ALERT",
          description: "Cheating detected. Progress zeroed and questions shuffled.",
          variant: "destructive",
        });
      }, 3000);
    }
  }, [activeQuiz, isFinished, hasFailed, cheatTriggered, shuffle]);

  useEffect(() => {
    const onBlur = () => handleCheat();
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-600 text-white p-6 text-center">
        <XCircle className="h-48 w-48 mb-8 animate-pulse" />
        <h1 className="text-8xl font-headline font-bold mb-4 tracking-tighter">FAILED</h1>
        <p className="text-3xl font-medium mb-12 max-w-xl">One mistake proves you are not ready for the strategic tier. Study the Mocha strategy and return when focused.</p>
        <Button onClick={() => { setActiveQuiz(null); setHasFailed(false); }} variant="outline" className="rounded-full px-16 h-20 text-2xl font-black bg-white text-red-600 border-none shadow-2xl hover:scale-110 transition-transform">
          BACK TO FIREQUIZZO
        </Button>
      </div>
    );
  }

  if (!activeQuiz) {
    return (
      <div className="min-h-screen flex flex-col bg-secondary/10">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto space-y-16">
            <header className="text-center space-y-6">
              <h1 className="text-7xl md:text-9xl font-headline font-bold text-accent tracking-tighter">
                Fire<span className="text-primary italic">Quizzo</span>
              </h1>
              <p className="text-2xl text-muted-foreground font-medium max-w-2xl mx-auto">
                The strategic knowledge filter. Anti-cheat sensors active. One mistake leads to failure.
              </p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {quizzes.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-4 border-dashed border-accent/10">
                  <ShieldAlert className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                  <p className="text-xl text-muted-foreground italic font-medium">No tests published by the Host yet.</p>
                </div>
              ) : (
                quizzes.map((q) => (
                  <Card 
                    key={q.id} 
                    className="hover:border-primary/50 transition-all cursor-pointer group rounded-[3rem] p-4 bg-white shadow-xl hover:shadow-2xl border-4 border-white active:scale-95" 
                    onClick={() => startQuiz(q)}
                  >
                    <CardHeader className="p-8">
                      <div className="p-4 bg-primary/10 rounded-2xl w-fit mb-4 group-hover:bg-primary transition-colors">
                        <BookOpen className="h-8 w-8 text-accent" />
                      </div>
                      <CardTitle className="text-3xl font-bold leading-tight">{q.title}</CardTitle>
                      <CardDescription className="text-lg font-medium">{q.questionCount} Questions • Anti-Cheat</CardDescription>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-primary text-accent p-6 text-center">
        <Trophy className="h-48 w-48 mb-8 animate-bounce" />
        <h1 className="text-8xl font-headline font-bold mb-4 tracking-tighter">MASTERY</h1>
        <p className="text-3xl font-medium mb-12">You have passed the strategic filter, Succemazing. Stay Gold.</p>
        <Button onClick={() => setActiveQuiz(null)} className="rounded-full px-16 h-20 text-2xl font-black bg-accent text-white shadow-2xl hover:scale-110 transition-transform">
          RETURN TO HUB
        </Button>
      </div>
    );
  }

  const currentQ = shuffledQuestions[currentIdx];

  return (
    <div className="min-h-screen flex flex-col bg-accent">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center relative">
        {cheatTriggered && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center text-white p-6 text-center animate-in fade-in">
            <AlertTriangle className="h-48 w-48 text-red-600 mb-8 animate-pulse" />
            <h1 className="text-8xl font-headline font-bold mb-4">STOP CHEATING</h1>
            <p className="text-3xl text-red-500 font-black uppercase tracking-[0.3em]">System Resetting...</p>
          </div>
        )}

        <div className="max-w-4xl w-full space-y-12">
          <div className="flex items-center justify-between text-white">
            <Button variant="ghost" className="text-white hover:bg-white/10 rounded-full h-12 px-6" onClick={() => setActiveQuiz(null)}>
              <ArrowLeft className="mr-2" /> Exit Test
            </Button>
            <div className="text-2xl font-black bg-primary text-accent px-8 py-3 rounded-full shadow-lg">
              {currentIdx + 1} <span className="text-accent/50 mx-1">/</span> {shuffledQuestions.length}
            </div>
          </div>

          <Card className="rounded-[4rem] border-8 border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.4)] p-12 md:p-24 bg-white">
            <h3 className="text-3xl md:text-5xl font-bold mb-16 leading-tight text-center text-accent">{currentQ.question}</h3>
            
            <div className="space-y-6">
              {currentQ.type === 'multiple' && currentQ.options && (
                <div className="grid gap-6">
                  {currentQ.options.map((opt, i) => (
                    <button 
                      key={i} 
                      onClick={() => setUserAnswer(opt)}
                      className={cn(
                        "p-8 text-left border-4 rounded-[2.5rem] text-2xl font-bold transition-all shadow-sm active:scale-95",
                        userAnswer === opt 
                          ? "bg-accent text-white border-accent scale-[1.02] shadow-xl" 
                          : "border-secondary/20 hover:border-primary bg-secondary/10 text-accent/80"
                      )}
                    >
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 mr-4 text-xl">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {currentQ.type === 'boolean' && (
                <div className="grid grid-cols-2 gap-8">
                  {['True', 'False'].map((opt) => (
                    <button 
                      key={opt}
                      onClick={() => setUserAnswer(opt)}
                      className={cn(
                        "p-16 text-center border-4 rounded-[3rem] text-4xl font-black transition-all shadow-lg active:scale-95",
                        userAnswer === opt 
                          ? "bg-accent text-white border-accent scale-105" 
                          : "border-secondary/20 hover:border-primary bg-secondary/10 text-accent/80"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {currentQ.type === 'id' && (
                <div className="space-y-4">
                  <Input 
                    placeholder="Type exact strategic answer..." 
                    className="h-24 rounded-[2.5rem] text-3xl text-center font-black bg-secondary/10 border-4 border-transparent focus:border-primary focus:ring-0" 
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && userAnswer && handleNext()}
                  />
                  <p className="text-center text-muted-foreground font-bold uppercase tracking-widest text-sm">Press Enter to Confirm</p>
                </div>
              )}
            </div>

            <Button 
              className="w-full mt-16 h-24 rounded-full font-black text-3xl bg-primary text-accent hover:bg-primary/90 shadow-[0_20px_50px_rgba(255,215,0,0.3)] hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50" 
              onClick={handleNext} 
              disabled={!userAnswer}
            >
              CONFIRM ANSWER
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
