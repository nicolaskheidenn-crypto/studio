
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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

  useEffect(() => {
    setIsMounted(true);
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
      // Immediate Reset logic
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

  if (!isMounted) return null;

  if (!activeQuiz) {
    return (
      <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        <Navigation />
        
        <div className="absolute top-[15%] left-[5%] opacity-5 -rotate-12 pointer-events-none">
          <Coffee className="w-96 h-96 text-primary" />
        </div>
        <div className="absolute bottom-[10%] right-[5%] opacity-5 rotate-12 pointer-events-none">
          <ShieldAlert className="w-80 h-80 text-primary" />
        </div>

        <main className="flex-1 container mx-auto px-4 py-12 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
            
            <div className="hidden lg:flex flex-col gap-10">
              <Card className="rounded-[3.5rem] border-4 border-primary/10 bg-card/40 p-10 shadow-2xl space-y-8 animate-in slide-in-from-left-10 duration-700">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase text-foreground italic flex items-center gap-3"><Award className="h-6 w-6 text-primary" /> Mastery Status</h3>
                  <p className="text-[10px] font-black uppercase text-primary/40 tracking-widest">Certification Tier</p>
                </div>
                
                <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full rotate-[-90deg]">
                    <circle cx="72" cy="72" r="66" fill="transparent" stroke="currentColor" strokeWidth="10" className="text-primary/10" />
                    <circle cx="72" cy="72" r="66" fill="transparent" stroke="currentColor" strokeWidth="10" strokeDasharray="414.69" strokeDashoffset={414.69 - (414.69 * profile.xp) / 100} className="text-primary shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-foreground">Lv.{profile.level}</span>
                  </div>
                </div>

                <div className="space-y-6 pt-4 border-t-2 border-primary/10">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-primary/40">Sovereign Proofs</span>
                    <span className="text-xl font-black text-foreground flex items-center gap-2">{profile.stats?.quizzesPassed || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-primary/40">Rank Status</span>
                    <span className="text-xs font-black text-primary uppercase italic tracking-widest">Master Strategist</span>
                  </div>
                </div>
              </Card>

              <Card className="rounded-[3rem] border-4 border-primary/10 bg-card/40 p-10 shadow-2xl text-center space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border-2 border-primary/20">
                  <Zap className="h-8 w-8 text-primary fill-primary" />
                </div>
                <p className="text-[10px] font-black uppercase text-primary/40 tracking-[0.2em] leading-relaxed">
                  Pass certification protocols to earn massive XP and unlock high-level digital assets in the marketplace.
                </p>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-12">
              <header className="text-center space-y-6">
                <h1 className="text-7xl md:text-8xl font-headline font-black text-foreground tracking-tighter uppercase italic leading-none">
                  Fire<span className="text-primary">Quizzo</span>
                </h1>
                <div className="h-2 w-48 bg-primary mx-auto rounded-full shadow-[0_0_20px_rgba(255,215,0,0.3)]" />
                <p className="text-primary/40 text-[10px] font-black uppercase tracking-[0.8em] max-w-sm mx-auto">Global Mastery Certification Protocol</p>
              </header>
              
              <div className="grid grid-cols-1 gap-8 px-2">
                {globalQuizzes.length === 0 ? (
                  <div className="p-24 bg-card/20 rounded-[4.5rem] border-8 border-dashed border-primary/10 shadow-2xl text-center animate-in fade-in zoom-in duration-700">
                    <ShieldAlert className="h-24 w-24 mx-auto text-primary/10 mb-8" />
                    <p className="text-4xl text-foreground/20 font-black uppercase tracking-tighter italic">Waiting for Protocols...</p>
                    <p className="text-[10px] font-black text-primary/20 uppercase mt-4 tracking-widest">Strategic Verification Offline</p>
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
              <div className="px-6 space-y-2">
                <h3 className="text-2xl font-black text-foreground uppercase italic">Security Briefing</h3>
                <p className="text-[10px] font-black uppercase text-primary/40 tracking-widest">Protocol Instructions</p>
              </div>

              <Card className="rounded-[3rem] border-4 border-primary/10 bg-card/40 p-10 shadow-2xl space-y-8 animate-in slide-in-from-right-10 duration-700">
                 <div className="flex items-center gap-4 text-primary">
                   <ShieldCheck className="h-6 w-6" />
                   <span className="text-xs font-black uppercase tracking-widest">Integrity Active</span>
                 </div>
                 <div className="space-y-6">
                    <p className="text-sm font-bold text-foreground/70 leading-relaxed">
                      All Quizzo protocols are monitored by the Sovereign Anti-Cheat sensor. Switching tabs or windows will trigger an immediate security reset.
                    </p>
                    <div className="h-1.5 w-24 bg-primary/20 rounded-full" />
                    <p className="text-[10px] font-black uppercase text-primary/40 tracking-widest leading-relaxed">
                      Certification success injects "Sovereign Proof" status into the collective registry.
                    </p>
                 </div>
              </Card>

              <Card className="rounded-[4rem] border-4 border-dashed border-primary/10 bg-card/20 p-12 text-center flex flex-col items-center justify-center space-y-8 group hover:border-primary/30 transition-all">
                <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center">
                  <Info className="h-8 w-8 text-primary/40 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm font-black text-primary/30 uppercase tracking-[0.4em] leading-loose text-center italic group-hover:text-primary/60 transition-colors">
                  GLOBAL<br/>CERTIFICATION DATA<br/>IS UPDATED IN THE<br/>COLLECTIVE<br/>STRATEGIST<br/>REGISTRY.
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1),transparent)] pointer-events-none" />
        {hasPassed ? <Trophy className="h-24 w-24 md:h-32 md:w-32 mb-8 animate-bounce drop-shadow-2xl" /> : <XCircle className="h-24 w-24 md:h-32 md:w-32 mb-8 animate-pulse drop-shadow-2xl" />}
        <h1 className="text-4xl md:text-6xl font-headline font-black mb-4 tracking-tighter uppercase italic leading-none">{hasPassed ? "MASTERY" : "RETAKE"}</h1>
        <p className="text-3xl md:text-4xl font-black mb-6 tracking-tighter italic">SCORE: {score} / {shuffledQuestions.length}</p>
        <p className="text-base md:text-lg font-black uppercase tracking-[0.2em] opacity-80 mb-12 max-w-2xl leading-relaxed mx-auto italic">
          {hasPassed 
            ? "Strategic filtration complete. Sovereign certification has been injected into your profile vault." 
            : `Requirement not met. ${passing} correct responses required for protocol certification. Re-initialize.`}
        </p>
        <Button onClick={() => setActiveQuiz(null)} className={cn("rounded-full px-10 h-14 md:px-16 md:h-18 text-lg md:text-xl font-black shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform uppercase tracking-tighter", hasPassed ? "bg-[#1f1610] text-primary" : "bg-white text-red-600")}>
          RETURN TO COMMAND
        </Button>
      </div>
    );
  }

  const currentQ = shuffledQuestions[currentIdx];

  return (
    <div className="min-h-screen flex flex-col bg-[#1f1610] relative">
      <Navigation />
      
      {/* High Visibility Security Sensor Badge */}
      {!isFinished && !cheatTriggered && (
        <div className="fixed top-20 right-8 z-[60] flex items-center gap-3 bg-red-600/10 border-2 border-red-600/30 px-6 py-3 rounded-full animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.2)]">
          <ShieldAlert className="h-5 w-5 text-red-600" />
          <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Anti-Cheat Sensor Active</span>
        </div>
      )}

      {cheatTriggered && (
        <div className="fixed inset-0 z-[200] bg-[#1f1610] flex flex-col items-center justify-center text-[#fdfaf6] p-6 text-center animate-in fade-in duration-300">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
          <div className="relative space-y-8 max-w-4xl w-full">
            <div className="relative w-fit mx-auto">
              <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
              <AlertTriangle className="h-24 w-24 md:h-32 md:w-32 text-primary animate-[bounce_0.5s_infinite] relative z-10" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-7xl font-headline font-black mb-2 uppercase tracking-[0.2em] italic leading-none animate-[glitch_0.3s_infinite] text-primary">
                SECURITY ALERT
              </h1>
              <div className="h-1.5 w-32 bg-primary mx-auto rounded-full shadow-[0_0_30px_rgba(255,215,0,0.8)]" />
            </div>

            <p className="text-lg md:text-2xl text-[#fdfaf6] font-black uppercase tracking-[0.4em] max-w-3xl mx-auto leading-relaxed italic">
              INTEGRITY SENSOR BREACHED. <br/>
              <span className="text-primary">RESETTING PROTOCOL IN REAL-TIME...</span>
            </p>

            <div className="mt-10 w-full max-w-xl mx-auto space-y-4">
              <div className="flex justify-between items-end mb-2">
                 <span className="text-[8px] font-black uppercase tracking-widest text-primary/60">System Purge in Progress</span>
                 <span className="text-[8px] font-black uppercase tracking-widest text-primary/60">0.00% Progress Retained</span>
              </div>
              <div className="h-4 bg-white/5 rounded-full border-2 border-white/10 overflow-hidden shadow-inner">
                 <div className="h-full bg-primary shadow-[0_0_20px_rgba(255,215,0,0.6)] animate-[progress_3s_linear] origin-left" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 flex flex-col items-center relative z-10">
        <div className="max-w-4xl w-full space-y-10">
          <div className="flex items-center justify-between px-4">
            <Button variant="ghost" className="text-primary hover:text-primary/60 rounded-full h-10 md:h-12 px-6 md:px-10 font-black uppercase text-xs tracking-[0.2em] border-2 border-primary/20" onClick={() => setActiveQuiz(null)}>
              <ArrowLeft className="mr-3 h-4 w-4" /> EXIT PROTOCOL
            </Button>
            <div className="text-xl md:text-2xl font-black bg-mocha-cream text-[#1f1610] px-8 py-3 rounded-2xl shadow-xl border-4 border-primary/20">
              {currentIdx + 1} <span className="text-[#1f1610]/30 mx-2">/</span> {shuffledQuestions.length}
            </div>
          </div>

          <Card className="rounded-[3rem] border-primary/10 border-8 md:border-[10px] shadow-[0_40px_80px_rgba(0,0,0,0.5)] p-8 md:p-12 bg-mocha-cream relative overflow-hidden animate-in zoom-in-95 duration-700">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Sparkles className="h-24 w-24 text-[#1f1610]" />
            </div>
            
            <h3 className="text-3xl md:text-4xl font-black mb-12 md:mb-16 leading-tight text-center text-[#1f1610] uppercase italic tracking-tighter">{currentQ.question}</h3>
            
            <div className="space-y-6 md:space-y-8">
              {currentQ.type === 'multiple' && currentQ.options && (
                <div className="grid gap-4 md:gap-6">
                  {currentQ.options.map((opt: string, i: number) => (
                    <button 
                      key={i} 
                      onClick={() => setUserAnswer(opt)}
                      className={cn(
                        "p-6 md:p-8 text-left border-4 md:border-[6px] rounded-[2.5rem] text-lg md:text-xl font-black transition-all active:scale-95 flex items-center gap-6 uppercase tracking-tight",
                        userAnswer === opt 
                          ? "bg-[#1f1610] text-primary border-[#1f1610] shadow-[0_15px_30px_rgba(0,0,0,0.2)]" 
                          : "border-[#1f1610]/5 bg-white text-[#1f1610]/70 hover:border-primary/50"
                      )}
                    >
                      <span className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary text-[#1f1610] flex items-center justify-center text-lg md:text-xl font-black shadow-inner">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {currentQ.type === 'boolean' && (
                <div className="grid grid-cols-2 gap-4 md:gap-8">
                  {['True', 'False'].map((opt) => (
                    <button 
                      key={opt}
                      onClick={() => setUserAnswer(opt)}
                      className={cn(
                        "p-12 md:p-16 text-center border-4 md:border-[8px] rounded-[3rem] text-3xl md:text-4xl font-black transition-all active:scale-95 uppercase italic",
                        userAnswer === opt 
                          ? "bg-[#1f1610] text-primary border-[#1f1610] shadow-xl" 
                          : "border-[#1f1610]/5 bg-white text-[#1f1610]/70 hover:border-primary/50"
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
                    placeholder="ENTER PROTOCOL CODE..." 
                    className="h-20 md:h-24 rounded-2xl text-3xl md:text-4xl text-center font-black bg-white border-4 md:border-8 border-[#1f1610]/5 text-[#1f1610] focus:border-primary shadow-inner placeholder:text-[#1f1610]/10" 
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && userAnswer && handleNext()}
                  />
                  <p className="text-center text-[#1f1610]/30 font-black uppercase tracking-[0.8em] text-[10px]">SECURITY VERIFICATION REQUIRED (ENTER)</p>
                </div>
              )}
            </div>

            <Button 
              className="w-full mt-12 md:mt-16 h-16 md:h-20 rounded-full font-black text-xl md:text-2xl bg-primary text-[#1f1610] hover:bg-[#1f1610] hover:text-primary transition-all shadow-[0_20px_40px_rgba(255,215,0,0.2)] active:scale-95 disabled:opacity-20 uppercase tracking-tighter" 
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
