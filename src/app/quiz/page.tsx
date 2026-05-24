
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const { data: globalQuizzes } = useCollection(quizzesQuery);
  
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
      const finalScore = score + (isCorrect ? 1 : 0);
      if (finalScore >= passing && uid) {
        incrementQuiz(uid);
      }
    }
  };

  const getPassingScore = (total: number) => {
    if (total <= 10) return 8;
    if (total <= 15) return 13;
    return 18;
  };

  if (!isMounted) return null;

  if (!activeQuiz) {
    return (
      <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        <Navigation />
        
        {/* Background Decorations */}
        <div className="absolute top-[15%] left-[5%] opacity-5 -rotate-12 pointer-events-none">
          <Coffee className="w-96 h-96 text-primary" />
        </div>
        <div className="absolute bottom-[10%] right-[5%] opacity-5 rotate-12 pointer-events-none">
          <ShieldAlert className="w-80 h-80 text-primary" />
        </div>

        <main className="flex-1 container mx-auto px-4 py-12 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
            
            {/* Left Column: Mastery Summary */}
            <div className="hidden lg:flex flex-col gap-10">
              <Card className="rounded-[3rem] border-4 border-primary/10 bg-card/40 p-10 shadow-2xl space-y-8">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase text-foreground italic flex items-center gap-3"><Award className="h-6 w-6 text-primary" /> Mastery Level</h3>
                  <p className="text-[10px] font-black uppercase text-primary/40 tracking-widest">Certification Tier</p>
                </div>
                
                <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full rotate-[-90deg]">
                    <circle cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-primary/10" />
                    <circle cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray="364.4" strokeDashoffset={364.4 - (364.4 * profile.xp) / 100} className="text-primary" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white">Lv.{profile.level}</span>
                  </div>
                </div>

                <div className="space-y-6 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-primary/40">Sovereign Proofs</span>
                    <span className="text-xl font-black text-white flex items-center gap-2">{profile.stats.quizzesPassed || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-primary/40">Rank Status</span>
                    <span className="text-xs font-black text-primary uppercase italic tracking-widest">Master Strategist</span>
                  </div>
                </div>
              </Card>

              <Card className="rounded-[3rem] border-4 border-primary/10 bg-card/40 p-10 shadow-2xl space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-primary/20">
                  <Zap className="h-8 w-8 text-primary fill-primary" />
                </div>
                <p className="text-[10px] font-black uppercase text-primary/40 tracking-[0.2em] leading-relaxed">
                  Pass quizzes to earn massive XP and unlock high-level digital assets.
                </p>
              </Card>
            </div>

            {/* Center Column: Quiz List */}
            <div className="lg:col-span-2 space-y-12">
              <header className="text-center space-y-4">
                <h1 className="text-6xl md:text-8xl font-headline font-black text-white tracking-tighter uppercase italic">
                  Fire<span className="text-primary">Quizzo</span>
                </h1>
                <p className="text-primary/40 text-[10px] font-black uppercase tracking-[0.8em] max-w-sm mx-auto">Global Mastery Certification Protocol</p>
              </header>
              
              <div className="grid grid-cols-1 gap-8">
                {globalQuizzes.length === 0 ? (
                  <div className="p-24 bg-card/20 rounded-[4rem] border-8 border-dashed border-primary/10 shadow-2xl text-center animate-in fade-in zoom-in duration-700">
                    <ShieldAlert className="h-20 w-20 mx-auto text-primary/10 mb-8" />
                    <p className="text-3xl text-white/30 font-black uppercase tracking-tighter italic">Waiting for Host Protocols...</p>
                    <p className="text-[10px] font-black text-primary/20 uppercase mt-4 tracking-widest">Strategic Verification Offline</p>
                  </div>
                ) : (
                  globalQuizzes.map((q) => (
                    <Card 
                      key={q.id} 
                      className="group relative overflow-hidden rounded-[3.5rem] border-4 border-primary/10 bg-mocha-cream shadow-2xl hover:border-primary transition-all cursor-pointer active:scale-[0.98]" 
                      onClick={() => startQuiz(q)}
                    >
                      <CardContent className="p-12 flex items-center justify-between">
                        <div className="flex items-center gap-10">
                          <div className="w-20 h-20 rounded-3xl bg-[#1f1610] flex items-center justify-center shadow-xl group-hover:bg-primary transition-colors">
                            <BookOpen className="h-10 w-10 text-primary group-hover:text-[#1f1610]" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-4xl font-black text-[#1f1610] uppercase italic tracking-tight">{q.title}</h3>
                            <div className="flex items-center gap-6">
                              <span className="text-[10px] font-black uppercase text-[#1f1610]/40 tracking-widest">{q.questionCount} Questions</span>
                              <span className="w-1.5 h-1.5 bg-[#1f1610]/10 rounded-full" />
                              <span className="text-[10px] font-black uppercase text-[#1f1610]/40 tracking-widest">Requirement: {getPassingScore(q.questionCount)} Correct</span>
                            </div>
                          </div>
                        </div>
                        <div className="hidden sm:flex w-16 h-16 rounded-full border-4 border-[#1f1610]/5 items-center justify-center group-hover:border-primary/20 transition-all">
                           <ArrowLeft className="h-8 w-8 text-[#1f1610]/20 group-hover:text-primary rotate-180 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Briefing */}
            <div className="hidden lg:flex flex-col gap-10">
              <div className="px-6 space-y-2">
                <h3 className="text-2xl font-black text-white uppercase italic">Security Briefing</h3>
                <p className="text-[10px] font-black uppercase text-primary/40 tracking-widest">Protocol Instructions</p>
              </div>

              <Card className="rounded-[3rem] border-4 border-primary/10 bg-card/40 p-10 shadow-2xl space-y-8">
                 <div className="flex items-center gap-4 text-primary">
                   <ShieldCheck className="h-6 w-6" />
                   <span className="text-xs font-black uppercase tracking-widest">Integrity Active</span>
                 </div>
                 <div className="space-y-4">
                    <p className="text-sm font-bold text-white/70 leading-relaxed">
                      All Quizzo protocols are monitored by the Sovereign Anti-Cheat sensor. Switching tabs or browsers will immediately reset the protocol.
                    </p>
                    <div className="h-1 w-20 bg-primary/20 rounded-full" />
                    <p className="text-[10px] font-black uppercase text-primary/40 tracking-widest">
                      Passing a quiz grants "Sovereign Proof" status and significant Mastery XP.
                    </p>
                 </div>
              </Card>

              <Card className="rounded-[3rem] border-4 border-dashed border-primary/10 bg-card/10 p-10 text-center">
                <Info className="h-10 w-10 text-primary/20 mx-auto mb-4" />
                <p className="text-[10px] font-black text-primary/20 uppercase tracking-[0.4em] leading-relaxed">
                  Global certification data is updated in the collective strategist registry.
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
        {hasPassed ? <Trophy className="h-48 w-48 mb-12 animate-bounce drop-shadow-2xl" /> : <XCircle className="h-48 w-48 mb-12 animate-pulse drop-shadow-2xl" />}
        <h1 className="text-[10rem] font-headline font-black mb-6 tracking-tighter uppercase italic leading-none">{hasPassed ? "MASTERY" : "RETAKE"}</h1>
        <p className="text-5xl font-black mb-6 tracking-tighter">FINAL SCORE: {score} / {shuffledQuestions.length}</p>
        <p className="text-2xl font-black uppercase tracking-[0.3em] opacity-80 mb-16 max-w-2xl leading-relaxed">
          {hasPassed 
            ? "Strategic filtration complete. Sovereign certification has been injected into your profile vault." 
            : `Requirement not met. ${passing} correct answers required for protocol certification. Attempt again.`}
        </p>
        <Button onClick={() => setActiveQuiz(null)} className={cn("rounded-full px-24 h-28 text-3xl font-black shadow-[0_50px_100px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform uppercase tracking-tighter", hasPassed ? "bg-[#1f1610] text-primary" : "bg-white text-red-600")}>
          RETURN TO COMMAND
        </Button>
      </div>
    );
  }

  const currentQ = shuffledQuestions[currentIdx];

  return (
    <div className="min-h-screen flex flex-col bg-[#1f1610] relative">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center relative z-10">
        
        {cheatTriggered && (
          <div className="fixed inset-0 z-[100] bg-[#1f1610]/98 flex flex-col items-center justify-center text-[#fdfaf6] p-6 text-center animate-in fade-in duration-500">
            <AlertTriangle className="h-40 w-40 text-primary mb-10 animate-pulse" />
            <h1 className="text-7xl md:text-9xl font-headline font-black mb-6 uppercase tracking-tighter italic">SECURITY ALERT</h1>
            <p className="text-2xl text-primary font-black uppercase tracking-[0.4em] max-w-2xl">INTEGRITY SENSOR BREACHED. RESETTING PROTOCOL...</p>
            <div className="mt-12 w-64 h-2 bg-primary/20 rounded-full overflow-hidden">
               <div className="h-full bg-primary animate-[progress_3s_linear]" style={{ width: '100%' }} />
            </div>
          </div>
        )}

        <div className="max-w-4xl w-full space-y-12">
          <div className="flex items-center justify-between">
            <Button variant="ghost" className="text-primary hover:text-primary/60 rounded-full h-14 px-10 font-black uppercase text-xs tracking-[0.2em] border-2 border-primary/20" onClick={() => setActiveQuiz(null)}>
              <ArrowLeft className="mr-4 h-6 w-6" /> EXIT PROTOCOL
            </Button>
            <div className="text-3xl font-black bg-mocha-cream text-[#1f1610] px-12 py-5 rounded-[2rem] shadow-2xl border-4 border-primary/20">
              {currentIdx + 1} <span className="text-[#1f1610]/30 mx-3">/</span> {shuffledQuestions.length}
            </div>
          </div>

          <Card className="rounded-[5rem] border-primary/10 border-[12px] shadow-[0_80px_160px_rgba(0,0,0,0.6)] p-20 bg-mocha-cream relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <Sparkles className="h-32 w-32 text-[#1f1610]" />
            </div>
            
            <h3 className="text-5xl font-black mb-20 leading-tight text-center text-[#1f1610] uppercase italic tracking-tighter">{currentQ.question}</h3>
            
            <div className="space-y-8">
              {currentQ.type === 'multiple' && currentQ.options && (
                <div className="grid gap-6">
                  {currentQ.options.map((opt: string, i: number) => (
                    <button 
                      key={i} 
                      onClick={() => setUserAnswer(opt)}
                      className={cn(
                        "p-10 text-left border-[6px] rounded-[3rem] text-2xl font-black transition-all active:scale-95 flex items-center gap-10 uppercase tracking-tight",
                        userAnswer === opt 
                          ? "bg-[#1f1610] text-primary border-[#1f1610] shadow-[0_20px_40px_rgba(0,0,0,0.3)]" 
                          : "border-[#1f1610]/5 bg-white text-[#1f1610]/70 hover:border-primary/40"
                      )}
                    >
                      <span className="w-16 h-16 rounded-[1.5rem] bg-primary text-[#1f1610] flex items-center justify-center text-xl font-black shadow-inner">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {currentQ.type === 'boolean' && (
                <div className="grid grid-cols-2 gap-10">
                  {['True', 'False'].map((opt) => (
                    <button 
                      key={opt}
                      onClick={() => setUserAnswer(opt)}
                      className={cn(
                        "p-20 text-center border-[8px] rounded-[4rem] text-5xl font-black transition-all active:scale-95 uppercase italic",
                        userAnswer === opt 
                          ? "bg-[#1f1610] text-primary border-[#1f1610] shadow-2xl" 
                          : "border-[#1f1610]/5 bg-white text-[#1f1610]/70 hover:border-primary/40"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {currentQ.type === 'id' && (
                <div className="space-y-8">
                  <Input 
                    placeholder="ENTER RESPONSE CODE..." 
                    className="h-32 rounded-[3.5rem] text-5xl text-center font-black bg-white border-[8px] border-[#1f1610]/5 text-[#1f1610] focus:border-primary shadow-inner" 
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && userAnswer && handleNext()}
                  />
                  <p className="text-center text-[#1f1610]/30 font-black uppercase tracking-[0.6em] text-xs">Security Verification via ENTER</p>
                </div>
              )}
            </div>

            <Button 
              className="w-full mt-20 h-28 rounded-full font-black text-4xl bg-primary text-[#1f1610] hover:bg-white transition-all shadow-[0_40px_80px_rgba(255,215,0,0.3)] active:scale-95 disabled:opacity-20 uppercase tracking-tighter" 
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

