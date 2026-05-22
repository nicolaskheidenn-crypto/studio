
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { XCircle, Trophy, ShieldAlert, AlertTriangle, ArrowLeft, BookOpen } from "lucide-react";
import { useUserStore, QuizQuestion } from "@/lib/store";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { collection, query, orderBy } from 'firebase/firestore';

export default function QuizPage() {
  const { user } = useUser();
  const uid = user?.uid;
  const db = useFirestore();

  const quizzesQuery = useMemo(() => query(collection(db, 'quizzes'), orderBy('createdAt', 'desc')), [db]);
  const { data: globalQuizzes } = useCollection(quizzesQuery);
  
  const { incrementQuiz, trackVisit } = useUserStore();

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

  useEffect(() => {
    if (uid) trackVisit(uid, 'faq');
  }, [uid, trackVisit]);

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
      const passing = getPassingScore(shuffledQuestions.length);
      if (score + (isCorrect ? 1 : 0) >= passing && uid) {
        incrementQuiz(uid);
      }
    }
  };

  const getPassingScore = (total: number) => {
    if (total <= 10) return 8;
    if (total <= 15) return 13;
    return 18;
  };

  if (!activeQuiz) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
          <div className="space-y-12">
            <header className="text-center space-y-4">
              <h1 className="text-5xl font-headline font-bold text-primary tracking-tighter uppercase italic">
                Fire<span className="text-[#fdfaf6]">Quizzo</span>
              </h1>
              <p className="text-lg text-foreground/60 font-black uppercase tracking-widest max-w-xl mx-auto">
                Global mastery certification. Security active.
              </p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {globalQuizzes.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-mocha-cream rounded-[2rem] border-4 border-dashed border-primary/20">
                  <ShieldAlert className="h-12 w-12 mx-auto text-[#1f1610] mb-4 opacity-20" />
                  <p className="text-[#1f1610] font-black uppercase tracking-widest italic">Waiting for Host protocols...</p>
                </div>
              ) : (
                globalQuizzes.map((q) => (
                  <Card 
                    key={q.id} 
                    className="hover:border-primary transition-all cursor-pointer group rounded-[2.5rem] border-primary/10 bg-mocha-cream shadow-lg hover:shadow-2xl active:scale-95" 
                    onClick={() => startQuiz(q)}
                  >
                    <CardHeader className="p-8">
                      <div className="p-3 bg-[#1f1610] rounded-2xl w-fit mb-4 group-hover:bg-primary transition-colors">
                        <BookOpen className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-2xl font-black leading-tight text-[#1f1610] uppercase italic">{q.title}</CardTitle>
                      <CardDescription className="text-[10px] font-black text-[#1f1610]/40 mt-2 uppercase tracking-widest">
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
      <div className={cn("min-h-screen flex flex-col items-center justify-center p-8 text-center", hasPassed ? "bg-primary text-[#1f1610]" : "bg-red-600 text-white")}>
        {hasPassed ? <Trophy className="h-32 w-32 mb-8 animate-bounce" /> : <XCircle className="h-32 w-32 mb-8 animate-pulse" />}
        <h1 className="text-8xl font-headline font-black mb-4 tracking-tighter uppercase italic">{hasPassed ? "MASTERY" : "RETAKE"}</h1>
        <p className="text-4xl font-black mb-4">SCORE: {score} / {shuffledQuestions.length}</p>
        <p className="text-xl font-black uppercase tracking-widest opacity-80 mb-12 max-w-md leading-relaxed">
          {hasPassed 
            ? "Strategic filtration complete. Certification granted." 
            : `Requirement: ${passing} points. Attempt again.`}
        </p>
        <Button onClick={() => setActiveQuiz(null)} className={cn("rounded-full px-16 h-20 text-xl font-black shadow-2xl hover:scale-105 transition-transform uppercase tracking-tighter", hasPassed ? "bg-[#1f1610] text-primary" : "bg-white text-red-600")}>
          RETURN TO HUB
        </Button>
      </div>
    );
  }

  const currentQ = shuffledQuestions[currentIdx];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center relative">
        {cheatTriggered && (
          <div className="fixed inset-0 z-[100] bg-[#1f1610]/95 flex flex-col items-center justify-center text-[#fdfaf6] p-6 text-center animate-in fade-in">
            <AlertTriangle className="h-32 w-32 text-primary mb-6 animate-pulse" />
            <h1 className="text-5xl md:text-8xl font-headline font-bold mb-4 uppercase tracking-tighter">SECURITY ALERT</h1>
            <p className="text-xl text-primary font-black uppercase tracking-[0.3em]">Protocol Sensor Resetting...</p>
          </div>
        )}

        <div className="max-w-3xl w-full space-y-8">
          <div className="flex items-center justify-between">
            <Button variant="ghost" className="text-primary hover:text-primary/60 rounded-full h-12 px-6 font-black uppercase text-[10px] tracking-widest" onClick={() => setActiveQuiz(null)}>
              <ArrowLeft className="mr-3 h-5 w-5" /> Exit Protocol
            </Button>
            <div className="text-xl font-black bg-mocha-cream text-[#1f1610] px-8 py-3 rounded-full shadow-lg border-2 border-primary/20">
              {currentIdx + 1} <span className="text-[#1f1610]/40 mx-2">/</span> {shuffledQuestions.length}
            </div>
          </div>

          <Card className="rounded-[4rem] border-primary/10 border-4 shadow-2xl p-16 bg-mocha-cream">
            <h3 className="text-4xl font-black mb-16 leading-tight text-center text-[#1f1610] uppercase italic tracking-tight">{currentQ.question}</h3>
            
            <div className="space-y-6">
              {currentQ.type === 'multiple' && currentQ.options && (
                <div className="grid gap-6">
                  {currentQ.options.map((opt, i) => (
                    <button 
                      key={i} 
                      onClick={() => setUserAnswer(opt)}
                      className={cn(
                        "p-8 text-left border-4 rounded-3xl text-xl font-black transition-all active:scale-95 flex items-center gap-6 uppercase",
                        userAnswer === opt 
                          ? "bg-[#1f1610] text-primary border-[#1f1610] shadow-xl" 
                          : "border-[#1f1610]/5 bg-white text-[#1f1610]/80 hover:border-primary"
                      )}
                    >
                      <span className="w-12 h-12 rounded-2xl bg-primary text-[#1f1610] flex items-center justify-center text-sm font-black shadow-inner">
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
                        "p-16 text-center border-4 rounded-[3rem] text-4xl font-black transition-all active:scale-95 uppercase",
                        userAnswer === opt 
                          ? "bg-[#1f1610] text-primary border-[#1f1610] shadow-xl" 
                          : "border-[#1f1610]/5 bg-white text-[#1f1610]/80 hover:border-primary"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {currentQ.type === 'id' && (
                <div className="space-y-6">
                  <Input 
                    placeholder="Inquiry Response..." 
                    className="h-24 rounded-[2.5rem] text-3xl text-center font-black bg-white border-4 border-[#1f1610]/10 text-[#1f1610] focus:border-primary" 
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && userAnswer && handleNext()}
                  />
                  <p className="text-center text-[#1f1610]/40 font-black uppercase tracking-[0.4em] text-[10px]">Verify with Enter</p>
                </div>
              )}
            </div>

            <Button 
              className="w-full mt-16 h-24 rounded-full font-black text-3xl bg-primary text-[#1f1610] hover:bg-white transition-all shadow-[0_30px_60px_rgba(255,215,0,0.3)] active:scale-95 disabled:opacity-20 uppercase tracking-tighter" 
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
