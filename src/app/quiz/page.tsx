
"use client";

import { useState, useEffect, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { XCircle, Trophy, ShieldAlert, AlertTriangle, ArrowLeft, BookOpen, CheckCircle2 } from "lucide-react";
import { useAdminStore, QuizQuestion } from "@/lib/store";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function QuizPage() {
  const { quizzes } = useAdminStore();
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [cheatTriggered, setCheatTriggered] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");

  const shuffle = useCallback((array: any[]) => {
    return [...array].sort(() => Math.random() - 0.5);
  }, []);

  const handleCheat = useCallback(() => {
    if (activeQuiz && !isFinished && !cheatTriggered) {
      setCheatTriggered(true);
      setTimeout(() => {
        setShuffledQuestions(shuffle(activeQuiz.questions));
        setCurrentIdx(0);
        setScore(0);
        setUserAnswer("");
        setCheatTriggered(false);
        toast({
          title: "SECURITY ALERT",
          description: "Cheating detected. Progress zeroed and questions shuffled.",
          variant: "destructive",
        });
      }, 3000);
    }
  }, [activeQuiz, isFinished, cheatTriggered, shuffle]);

  useEffect(() => {
    const onBlur = () => handleCheat();
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [handleCheat]);

  const startQuiz = (quiz: any) => {
    setActiveQuiz(quiz);
    setShuffledQuestions(shuffle(quiz.questions));
    setCurrentIdx(0);
    setScore(0);
    setIsFinished(false);
    setUserAnswer("");
  };

  const handleNext = () => {
    const currentQuestion = shuffledQuestions[currentIdx];
    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim();
    
    if (isCorrect) {
      setScore(s => s + 1);
    }

    if (currentIdx + 1 < shuffledQuestions.length) {
      setCurrentIdx(idx => idx + 1);
      setUserAnswer("");
    } else {
      setIsFinished(true);
    }
  };

  const getPassingScore = (total: number) => {
    if (total <= 10) return 8;
    if (total <= 15) return 13;
    return 18;
  };

  if (!activeQuiz) {
    return (
      <div className="min-h-screen flex flex-col bg-secondary/10">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
          <div className="space-y-12">
            <header className="text-center space-y-4">
              <h1 className="text-5xl font-headline font-bold text-accent tracking-tighter">
                Fire<span className="text-primary italic">Quizzo</span>
              </h1>
              <p className="text-lg text-muted-foreground font-medium max-w-xl mx-auto">
                One mistake is fine, but you must reach the passing threshold to earn mastery. Nico Digital security active.
              </p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-white rounded-[2rem] border-4 border-dashed border-accent/10">
                  <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground font-medium italic">No strategic tests published by the Host.</p>
                </div>
              ) : (
                quizzes.map((q) => (
                  <Card 
                    key={q.id} 
                    className="hover:border-primary transition-all cursor-pointer group rounded-[2.5rem] border-white border-4 bg-white shadow-lg hover:shadow-2xl active:scale-95" 
                    onClick={() => startQuiz(q)}
                  >
                    <CardHeader className="p-8">
                      <div className="p-3 bg-primary/10 rounded-2xl w-fit mb-4 group-hover:bg-primary transition-colors">
                        <BookOpen className="h-8 w-8 text-accent" />
                      </div>
                      <CardTitle className="text-2xl font-black leading-tight text-accent">{q.title}</CardTitle>
                      <CardDescription className="text-sm font-bold text-muted-foreground mt-2">
                        {q.questionCount} Questions • Pass: {getPassingScore(q.questionCount)}
                      </CardDescription>
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
    const passing = getPassingScore(shuffledQuestions.length);
    const hasPassed = score >= passing;

    return (
      <div className={cn("min-h-screen flex flex-col items-center justify-center p-8 text-center", hasPassed ? "bg-primary text-accent" : "bg-red-600 text-white")}>
        {hasPassed ? <Trophy className="h-32 w-32 mb-8 animate-bounce" /> : <XCircle className="h-32 w-32 mb-8 animate-pulse" />}
        <h1 className="text-6xl font-headline font-black mb-4 tracking-tighter">{hasPassed ? "MASTERY" : "RETAKE"}</h1>
        <p className="text-3xl font-bold mb-4">Score: {score} / {shuffledQuestions.length}</p>
        <p className="text-xl opacity-80 mb-12 max-w-md font-medium">
          {hasPassed 
            ? "Strategic filtration complete. You are certified Succemazing." 
            : `Requirement: ${passing} points. Study the routine and attempt again.`}
        </p>
        <div className="flex gap-6">
          <Button onClick={() => setActiveQuiz(null)} className={cn("rounded-full px-12 h-16 text-xl font-black shadow-2xl hover:scale-105 transition-transform", hasPassed ? "bg-accent text-white" : "bg-white text-red-600")}>
            RETURN TO HUB
          </Button>
          {!hasPassed && (
            <Button onClick={() => startQuiz(activeQuiz)} variant="outline" className="rounded-full px-12 h-16 text-xl font-black bg-transparent border-4 border-white text-white hover:bg-white hover:text-red-600">
              TRY AGAIN
            </Button>
          )}
        </div>
      </div>
    );
  }

  const currentQ = shuffledQuestions[currentIdx];

  return (
    <div className="min-h-screen flex flex-col bg-accent">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center relative">
        {cheatTriggered && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center text-white p-6 text-center animate-in fade-in">
            <AlertTriangle className="h-32 w-32 text-red-600 mb-6 animate-pulse" />
            <h1 className="text-5xl md:text-7xl font-headline font-bold mb-4">STOP CHEATING</h1>
            <p className="text-xl text-red-500 font-black uppercase tracking-[0.3em]">Nico Digital Sensor Resetting...</p>
          </div>
        )}

        <div className="max-w-3xl w-full space-y-8">
          <div className="flex items-center justify-between text-white">
            <Button variant="ghost" className="text-white hover:bg-white/10 rounded-full h-12 px-6 font-bold" onClick={() => setActiveQuiz(null)}>
              <ArrowLeft className="mr-3 h-5 w-5" /> Exit Test
            </Button>
            <div className="text-xl font-black bg-primary text-accent px-8 py-3 rounded-full shadow-lg">
              {currentIdx + 1} <span className="text-accent/40 mx-2">/</span> {shuffledQuestions.length}
            </div>
          </div>

          <Card className="rounded-[3rem] border-white border-4 shadow-2xl p-12 bg-white">
            <h3 className="text-3xl font-black mb-12 leading-tight text-center text-accent">{currentQ.question}</h3>
            
            <div className="space-y-4">
              {currentQ.type === 'multiple' && currentQ.options && (
                <div className="grid gap-4">
                  {currentQ.options.map((opt, i) => (
                    <button 
                      key={i} 
                      onClick={() => setUserAnswer(opt)}
                      className={cn(
                        "p-6 text-left border-2 rounded-2xl text-xl font-bold transition-all active:scale-95 flex items-center gap-4",
                        userAnswer === opt 
                          ? "bg-accent text-white border-accent shadow-lg" 
                          : "border-secondary bg-secondary/5 text-accent/80 hover:border-primary"
                      )}
                    >
                      <span className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-sm font-black">
                        {String.fromCharCode(65 + i)}
                      </span>
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
                      className={cn(
                        "p-12 text-center border-2 rounded-[2rem] text-3xl font-black transition-all active:scale-95",
                        userAnswer === opt 
                          ? "bg-accent text-white border-accent shadow-lg" 
                          : "border-secondary bg-secondary/5 text-accent/80 hover:border-primary"
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
                    placeholder="Type your strategic answer..." 
                    className="h-20 rounded-[1.5rem] text-2xl text-center font-black bg-secondary/5 border-2 border-accent/10 focus:border-primary" 
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && userAnswer && handleNext()}
                  />
                  <p className="text-center text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">Press Enter to Finalize</p>
                </div>
              )}
            </div>

            <Button 
              className="w-full mt-12 h-20 rounded-full font-black text-2xl bg-primary text-accent hover:bg-primary/90 shadow-xl transition-transform active:scale-95 disabled:opacity-50" 
              onClick={handleNext} 
              disabled={!userAnswer}
            >
              CONFIRM SELECTION
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
