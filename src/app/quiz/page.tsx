"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  XCircle, Trophy, ShieldAlert, AlertTriangle, ArrowLeft, 
  BookOpen, Award, Zap, Coffee, ShieldCheck, Info, Sparkles 
} from "lucide-react";
import { useUserStore, UserProfile } from "@/lib/store";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { collection, query, orderBy } from 'firebase/firestore';

const DEFAULT_PROFILE: UserProfile = {
  nickname: 'Strategist',
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

export default function QuizPage() {
  const { user } = useUser();
  const uid = user?.uid;
  const db = useFirestore();

  const quizzesQuery = useMemo(() => query(collection(db, 'quizzes'), orderBy('createdAt', 'desc')), [db]);
  const { data: globalQuizzes = [] } = useCollection(quizzesQuery);
  
  const profiles = useUserStore(s => s.profiles);
  const profile = useMemo(() => {
    const raw = uid ? profiles[uid] || DEFAULT_PROFILE : DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...raw };
  }, [profiles, uid]);

  const { incrementQuiz, trackVisit } = useUserStore();

  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [cheatTriggered, setCheatTriggered] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const cheatTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (cheatTimerRef.current) clearTimeout(cheatTimerRef.current);
    };
  }, []);

  const shuffle = useCallback((array: any[]) => {
    return [...array].sort(() => Math.random() - 0.5);
  }, []);

  useEffect(() => {
    if (uid) trackVisit(uid, 'faq');
  }, [uid, trackVisit]);

  const handleCheat = useCallback(() => {
    if (activeQuiz && !isFinished && !cheatTriggered) {
      setCheatTriggered(true);
      cheatTimerRef.current = setTimeout(() => {
        if (!activeQuiz) return;
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
    if (!isMounted) return;
    const onBlur = () => handleCheat();
    const onFocus = () => {
      if (cheatTimerRef.current) {
        clearTimeout(cheatTimerRef.current);
        cheatTimerRef.current = null;
        setCheatTriggered(false);
      }
    };

    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      if (cheatTimerRef.current) clearTimeout(cheatTimerRef.current);
    };
  }, [handleCheat, isMounted]);

  const startQuiz = (quiz: any) => {
    setActiveQuiz(quiz);
    setShuffledQuestions(shuffle(quiz.questions));
    setCurrentIdx(0);
    setScore(0);
    setIsFinished(false);
    setUserAnswer("");
    toast({ title: "Mastery Protocol Initiated", description: "Stay focused. Focus loss will trigger a security reset." });
  };

  const handleNext = () => {
    const currentQuestion = shuffledQuestions[currentIdx];
    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim();
    
    let newScore = score;
    if (isCorrect) {
      newScore = score + 1;
      setScore(newScore);
    }

    if (currentIdx + 1 < shuffledQuestions.length) {
      setCurrentIdx(idx => idx + 1);
      setUserAnswer("");
    } else {
      setIsFinished(true);
      const passing = getPassingScore(shuffledQuestions.length);
      if (newScore >= passing && uid) {
        incrementQuiz(uid);
      }
    }
  };

  const getPassingScore = (total: number) => {
    if (total <= 5) return total; 
    if (total <= 10) return 8;
    if (total <= 15) return 13;
    return Math.ceil(total * 0.85); 
  };

  const getRankStatus = (level: number) => {
    if (level >= 30) return "SOVEREIGN ZENITH";
    if (level >= 20) return "GRAND STRATEGIST";
    if (level >= 10) return "ELITE EXECUTIONER";
    return "MASTER STRATEGIST";
  };

  if (!isMounted) return null;

  if (!activeQuiz) {
    return (
      <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        <Navigation />
        
        <div className="absolute top-[15%] left-[5%] opacity-5 -rotate-12 pointer-events-none will-change-transform">
          <Coffee className="w-48 h-48 text-primary" />
        </div>
        <div className="absolute bottom-[10%] right-[5%] opacity-5 rotate-12 pointer-events-none will-change-transform">
          <ShieldAlert className="w-32 h-32 text-primary" />
        </div>

        <main className="flex-1 container mx-auto px-4 py-12 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
            
            <div className="hidden lg:flex flex-col gap-10">
              <Card className="rounded-[3.5rem] border-4 border-primary/10 bg-card/40 p-10 shadow-2xl space-y-10 animate-in slide-in-from-left-10 duration-700">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black uppercase text-foreground italic tracking-tighter leading-none">MASTERY STATUS</h3>
                  <p className="text-[10px] font-black uppercase text-primary/40 tracking-widest">CERTIFICATION TIER</p>
                </div>
                
                <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full rotate-[-90deg]">
                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-primary/10" />
                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray="439.8" strokeDashoffset={439.8 - (439.8 * profile.xp) / 100} className="text-primary shadow-[0_0_20px_rgba(255,215,0,0.6)] transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-foreground italic tracking-tighter leading-none">Lv.{profile.level}</span>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t-2 border-primary/10">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-primary/40 tracking-widest">SOVEREIGN PROOFS</span>
                    <span className="text-2xl font-black text-foreground italic leading-none">{profile.stats?.quizzesPassed || 0}</span>
                  </div>
                  <div className="flex justify-between items-start pt-2">
                    <span className="text-[10px] font-black uppercase text-primary/40 tracking-widest mt-1">RANK STATUS</span>
                    <span className="text-xl font-black text-primary uppercase italic text-right leading-tight max-w-[120px]">{getRankStatus(profile.level)}</span>
                  </div>
                </div>
              </Card>

              <Card className="rounded-[3rem] border-4 border-primary/10 bg-card/40 p-10 shadow-2xl text-center space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border-2 border-primary/20 shadow-inner">
                  <Zap className="h-8 w-8 text-primary fill-primary" />
                </div>
                <p className="text-[10px] font-black uppercase text-primary/40 tracking-[0.2em] leading-relaxed">
                  PASS CERTIFICATION PROTOCOLS TO EARN MASSIVE XP AND UNLOCK HIGH-LEVEL DIGITAL ASSETS IN THE MARKETPLACE.
                </p>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-12">
              <header className="flex items-center justify-center gap-6 md:gap-10 mb-20 animate-in fade-in slide-in-from-top-4 duration-700">
                <h1 className="text-5xl md:text-[5.5rem] font-headline font-black tracking-tighter uppercase italic leading-none select-none flex">
                  <span className="text-white">FIRE</span><span className="text-primary">QUIZZO</span>
                </h1>
                <div className="text-left space-y-0 pb-2 border-l-4 border-primary/20 pl-6 h-fit">
                  <h3 className="text-xl md:text-3xl font-black text-white uppercase italic leading-[0.85] tracking-tighter">SECURITY<br/>BRIEFING</h3>
                  <p className="text-[8px] md:text-[9px] font-black uppercase text-primary tracking-[0.3em] mt-2">PROTOCOL INSTRUCTIONS</p>
                </div>
              </header>
              
              <div className="grid grid-cols-1 gap-10 px-4">
                {globalQuizzes.length === 0 ? (
                  <div className="p-24 bg-card/20 rounded-[4.5rem] border-8 border-dashed border-primary/10 shadow-2xl text-center flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
                    <div className="relative mb-8">
                       <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                       <ShieldAlert className="h-24 w-24 text-primary/10 relative z-10" />
                    </div>
                    <p className="text-5xl text-foreground/20 font-black uppercase tracking-tighter italic leading-none">WAITING FOR PROTOCOLS...</p>
                    <p className="text-[10px] font-black text-primary/20 uppercase mt-6 tracking-[0.4em]">STRATEGIC VERIFICATION OFFLINE</p>
                  </div>
                ) : (
                  globalQuizzes.map((q: any) => (
                    <Card 
                      key={q.id} 
                      className="group relative overflow-hidden rounded-[4rem] border-4 border-primary/10 bg-mocha-cream shadow-2xl hover:border-primary transition-all cursor-pointer active:scale-[0.98] animate-in slide-in-from-bottom-10" 
                      onClick={() => startQuiz(q)}
                    >
                      <CardContent className="p-12 flex items-center justify-between">
                        <div className="flex items-center gap-12">
                          <div className="w-24 h-24 rounded-[2rem] bg-[#1f1610] flex items-center justify-center shadow-2xl group-hover:bg-primary transition-all duration-500">
                            <BookOpen className="h-12 w-12 text-primary group-hover:text-[#1f1610] group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="space-y-3">
                            <h3 className="text-4xl font-black text-[#1f1610] uppercase italic tracking-tight leading-none">{q.title}</h3>
                            <div className="flex items-center gap-6">
                              <Badge className="bg-[#1f1610]/10 text-[#1f1610] border-none font-black text-[9px] uppercase tracking-widest">{q.questionCount} Questions</Badge>
                              <span className="text-[10px] font-black uppercase text-[#1f1610]/40 tracking-widest">REQ: {getPassingScore(q.questionCount)} Correct</span>
                            </div>
                          </div>
                        </div>
                        <div className="hidden sm:flex w-20 h-20 rounded-full border-4 border-[#1f1610]/5 items-center justify-center group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                           <ArrowLeft className="h-10 w-10 text-[#1f1610]/20 group-hover:text-primary rotate-180 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            <div className="hidden lg:flex flex-col gap-10">
              <Card className="rounded-[3.5rem] border-4 border-primary/10 bg-card/40 p-10 shadow-2xl space-y-10 animate-in slide-in-from-right-10 duration-700">
                 <div className="flex items-center gap-4 text-primary">
                   <ShieldCheck className="h-7 w-7" />
                   <span className="text-xs font-black uppercase tracking-[0.2em] italic">INTEGRITY ACTIVE</span>
                 </div>
                 <div className="space-y-8">
                    <p className="text-base font-bold text-foreground/70 leading-relaxed italic">
                      All Quizzo protocols are monitored by the Sovereign Anti-Cheat sensor. Switching tabs or windows will trigger an immediate security reset.
                    </p>
                    <div className="h-1 w-24 bg-primary/20 rounded-full" />
                    <p className="text-[11px] font-black uppercase text-primary tracking-widest leading-relaxed">
                      CERTIFICATION SUCCESS INJECTS "SOVEREIGN PROOF" STATUS INTO THE COLLECTIVE REGISTRY.
                    </p>
                 </div>
              </Card>

              <Card className="rounded-[4rem] border-4 border-dashed border-primary/10 bg-card/20 p-14 text-center flex flex-col items-center justify-center space-y-10 group hover:border-primary/30 transition-all min-h-[350px]">
                <div className="w-20 h-20 rounded-full border-2 border-primary/20 flex items-center justify-center shadow-inner group-hover:border-primary/40 transition-colors">
                  <Info className="h-10 w-10 text-primary/40 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm font-black text-primary/30 uppercase tracking-[0.5em] leading-loose text-center italic group-hover:text-primary/60 transition-colors scale-y-110">
                  GLOBAL<br/>CERTIFICATION<br/>DATA<br/>IS UPDATED IN<br/>THE<br/>COLLECTIVE<br/>STRATEGIST<br/>REGISTRY.
                </p>
              </Card>
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
      <div className={cn("min-h-screen flex flex-col items-center justify-center p-8 text-center transition-all duration-1000", hasPassed ? "bg-primary text-[#1f1610]" : "bg-red-600 text-white")}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.15),transparent)] pointer-events-none" />
        <div className="relative z-10 space-y-8">
          {hasPassed ? <Trophy className="h-32 w-32 mx-auto mb-8 animate-bounce drop-shadow-2xl" /> : <XCircle className="h-32 w-32 mx-auto mb-8 animate-pulse drop-shadow-2xl" />}
          <h1 className="text-6xl md:text-8xl font-headline font-black mb-4 tracking-tighter uppercase italic leading-none">{hasPassed ? "MASTERY" : "RETAKE"}</h1>
          <p className="text-4xl md:text-5xl font-black mb-8 tracking-tighter italic leading-none">SCORE: {score} / {shuffledQuestions.length}</p>
          <p className="text-lg md:text-xl font-black uppercase tracking-[0.3em] opacity-80 mb-16 max-w-3xl leading-relaxed mx-auto italic">
            {hasPassed 
              ? "STRATEGIC FILTRATION COMPLETE. SOVEREIGN CERTIFICATION HAS BEEN INJECTED INTO YOUR PROFILE VAULT." 
              : `REQUIREMENT NOT MET. ${passing} CORRECT RESPONSES REQUIRED FOR PROTOCOL CERTIFICATION. RE-INITIALIZE.`}
          </p>
          <Button onClick={() => setActiveQuiz(null)} className={cn("rounded-full px-16 h-20 md:h-24 text-2xl md:text-3xl font-black shadow-[0_40px_80px_rgba(0,0,0,0.4)] hover:scale-105 transition-transform uppercase tracking-tighter", hasPassed ? "bg-[#1f1610] text-primary" : "bg-white text-red-600")}>
            RETURN TO COMMAND
          </Button>
        </div>
      </div>
    );
  }

  const currentQ = shuffledQuestions[currentIdx];

  return (
    <div className="min-h-screen flex flex-col bg-[#1f1610] relative">
      <Navigation />
      
      {!isFinished && !cheatTriggered && (
        <div className="fixed top-24 right-8 z-[60] flex items-center gap-3 bg-red-600/10 border-2 border-red-600/30 px-8 py-4 rounded-full animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.3)] pointer-events-none">
          <ShieldAlert className="h-6 w-6 text-red-600" />
          <span className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em]">Anti-Cheat Sensor Active</span>
        </div>
      )}

      {cheatTriggered && (
        <div className="fixed inset-0 z-[200] bg-[#1f1610] flex flex-col items-center justify-center text-[#fdfaf6] p-6 text-center animate-in fade-in duration-300">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
          <div className="relative space-y-12 max-w-5xl w-full">
            <div className="relative w-fit mx-auto">
              <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
              <AlertTriangle className="h-32 w-32 md:h-40 md:w-40 text-primary animate-[bounce_0.5s_infinite] relative z-10" />
            </div>
            
            <div className="space-y-6">
              <h1 className="text-6xl md:text-9xl font-headline font-black mb-2 uppercase tracking-[0.2em] italic leading-none animate-[glitch_0.3s_infinite] text-primary">
                SECURITY ALERT
              </h1>
              <div className="h-2 w-48 bg-primary mx-auto rounded-full shadow-[0_0_40px_rgba(255,215,0,0.8)]" />
            </div>

            <p className="text-2xl md:text-4xl text-[#fdfaf6] font-black uppercase tracking-[0.5em] max-w-4xl mx-auto leading-relaxed italic">
              INTEGRITY SENSOR BREACHED. <br/>
              <span className="text-primary">RESETTING PROTOCOL IN REAL-TIME...</span>
            </p>

            <div className="mt-16 w-full max-w-2xl mx-auto space-y-6">
              <div className="flex justify-between items-end">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">System Purge in Progress</span>
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">0.00% Progress Retained</span>
              </div>
              <div className="h-6 bg-white/5 rounded-full border-4 border-white/10 overflow-hidden shadow-inner">
                 <div className="h-full bg-primary shadow-[0_0_30px_rgba(255,215,0,0.8)] animate-[progress_3s_linear] origin-left" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-8 md:py-16 flex flex-col items-center relative z-10">
        <div className="max-w-5xl w-full space-y-12">
          <div className="flex items-center justify-between px-6">
            <Button variant="ghost" className="text-primary hover:text-primary/60 rounded-full h-12 md:h-16 px-8 md:px-12 font-black uppercase text-[11px] tracking-[0.3em] border-4 border-primary/20 shadow-xl" onClick={() => setActiveQuiz(null)}>
              <ArrowLeft className="mr-4 h-5 w-5" /> EXIT PROTOCOL
            </Button>
            <div className="text-2xl md:text-4xl font-black bg-mocha-cream text-[#1f1610] px-10 py-4 rounded-[2rem] shadow-2xl border-8 border-primary/20 italic tracking-tighter leading-none">
              {currentIdx + 1} <span className="text-[#1f1610]/20 mx-4">/</span> {shuffledQuestions.length}
            </div>
          </div>

          <Card className="rounded-[4rem] border-primary/10 border-[10px] md:border-[15px] shadow-[0_50px_100px_rgba(0,0,0,0.6)] p-10 md:p-16 bg-mocha-cream relative overflow-hidden animate-in zoom-in-95 duration-700">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <Sparkles className="h-32 w-32 text-[#1f1610]" />
            </div>
            
            <h3 className="text-4xl md:text-5xl font-black mb-16 md:mb-24 leading-tight text-center text-[#1f1610] uppercase italic tracking-tighter">{currentQ.question}</h3>
            
            <div className="space-y-6 md:space-y-10">
              {currentQ.type === 'multiple' && currentQ.options && (
                <div className="grid gap-6 md:gap-8">
                  {currentQ.options.map((opt: string, i: number) => (
                    <button 
                      key={i} 
                      onClick={() => setUserAnswer(opt)}
                      className={cn(
                        "p-8 md:p-10 text-left border-[6px] md:border-[8px] rounded-[3rem] text-xl md:text-2xl font-black transition-all active:scale-95 flex items-center gap-8 uppercase tracking-tight shadow-xl leading-none",
                        userAnswer === opt 
                          ? "bg-[#1f1610] text-primary border-[#1f1610] shadow-[0_20px_40px_rgba(0,0,0,0.3)] scale-[1.02]" 
                          : "border-[#1f1610]/5 bg-white text-[#1f1610]/70 hover:border-primary/50"
                      )}
                    >
                      <span className="w-14 h-14 md:w-16 md:h-16 rounded-[1.2rem] bg-primary text-[#1f1610] flex items-center justify-center text-xl md:text-2xl font-black shadow-inner leading-none">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {currentQ.type === 'boolean' && (
                <div className="grid grid-cols-2 gap-8 md:gap-12">
                  {['True', 'False'].map((opt) => (
                    <button 
                      key={opt}
                      onClick={() => setUserAnswer(opt)}
                      className={cn(
                        "p-16 md:p-24 text-center border-[8px] md:border-[12px] rounded-[4rem] text-4xl md:text-5xl font-black transition-all active:scale-95 uppercase italic shadow-2xl leading-none",
                        userAnswer === opt 
                          ? "bg-[#1f1610] text-primary border-[#1f1610] shadow-2xl scale-[1.03]" 
                          : "border-[#1f1610]/5 bg-white text-[#1f1610]/70 hover:border-primary/50"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {currentQ.type === 'id' && (
                <div className="space-y-10">
                  <Input 
                    placeholder="ENTER PROTOCOL CODE..." 
                    className="h-24 md:h-32 rounded-[2.5rem] text-4xl md:text-6xl text-center font-black bg-white border-[10px] md:border-[15px] border-[#1f1610]/5 text-[#1f1610] focus:border-primary shadow-inner placeholder:text-[#1f1610]/10 tracking-widest leading-none" 
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && userAnswer && handleNext()}
                  />
                  <p className="text-center text-[#1f1610]/30 font-black uppercase tracking-[1em] text-xs">SECURITY VERIFICATION REQUIRED (ENTER)</p>
                </div>
              )}
            </div>

            <Button 
              className="w-full mt-20 md:mt-24 h-20 md:h-28 rounded-full font-black text-2xl md:text-4xl bg-primary text-[#1f1610] hover:bg-[#1f1610] hover:text-primary transition-all shadow-[0_30px_60px_rgba(255,215,0,0.4)] active:scale-95 disabled:opacity-20 uppercase tracking-tighter border-[10px] border-white/20 leading-none" 
              onClick={handleNext} 
              disabled={!userAnswer}
            >
              CONFIRM SELECTION
            </Button>
          </Card>
        </div>
      </main>

      <style jsx global>{`
        @keyframes progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes glitch {
          0% { transform: translate(2px, 2px); text-shadow: 2px 0 #fff; }
          25% { transform: translate(-2px, -2px); text-shadow: -2px 0 #FFD700; }
          50% { transform: translate(1px, -1px); text-shadow: 1px 0 #fff; }
          75% { transform: translate(-1px, 1px); text-shadow: -1px 0 #FFD700; }
          100% { transform: translate(0); text-shadow: 0; }
        }
      `}</style>
    </div>
  );
}
