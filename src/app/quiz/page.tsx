
"use client";

import { useState, useEffect, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trophy, Shuffle, ShieldAlert } from "lucide-react";
import { useAdminStore, QuizQuestion } from "@/lib/store";
import { toast } from "@/hooks/use-toast";

export default function QuizPage() {
  const { quizzes } = useAdminStore();
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [cheatTriggered, setCheatTriggered] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");

  const shuffle = useCallback((array: any[]) => {
    return [...array].sort(() => Math.random() - 0.5);
  }, []);

  const handleCheat = useCallback(() => {
    if (activeQuiz && !isFinished) {
      setCheatTriggered(true);
      setCurrentIdx(0);
      setScore(0);
      setShuffledQuestions(shuffle(activeQuiz.questions));
      toast({
        title: "NO CHEATING!",
        description: "You left the page or alt-tabbed. Progress reset and questions shuffled.",
        variant: "destructive",
      });
      setTimeout(() => setCheatTriggered(false), 3000);
    }
  }, [activeQuiz, isFinished, shuffle]);

  useEffect(() => {
    window.addEventListener("blur", handleCheat);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) handleCheat();
    });
    return () => {
      window.removeEventListener("blur", handleCheat);
    };
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
    if (userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim()) {
      setScore(s => s + 1);
    }

    if (currentIdx + 1 < shuffledQuestions.length) {
      setCurrentIdx(idx => idx + 1);
      setUserAnswer("");
    } else {
      setIsFinished(true);
    }
  };

  if (!activeQuiz) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <header className="text-center space-y-4">
              <h1 className="text-5xl font-headline font-bold">Fire<span className="text-primary">Quizzo</span></h1>
              <p className="text-muted-foreground text-lg">Test your mastery. No cheating allowed—we see everything.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quizzes.length === 0 ? (
                <div className="col-span-full p-12 text-center border-2 border-dashed rounded-[3rem]">
                  <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No quizzes published yet. Check back later!</p>
                </div>
              ) : (
                quizzes.map((q) => (
                  <Card key={q.id} className="hover:border-primary/50 transition-all cursor-pointer group" onClick={() => startQuiz(q)}>
                    <CardHeader>
                      <CardTitle>{q.title}</CardTitle>
                      <CardDescription>{q.questions.length} Questions • Anti-Cheat Active</CardDescription>
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
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <Card className="max-w-md w-full text-center p-8 space-y-6">
            <Trophy className="h-20 w-20 mx-auto text-primary animate-bounce" />
            <h2 className="text-4xl font-headline font-bold">Quiz Complete!</h2>
            <p className="text-2xl font-bold">Your Score: {score} / {shuffledQuestions.length}</p>
            <Button onClick={() => setActiveQuiz(null)} className="w-full rounded-full">Back to Quizzes</Button>
          </Card>
        </main>
      </div>
    );
  }

  const currentQ = shuffledQuestions[currentIdx];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center">
        {cheatTriggered && (
          <div className="fixed inset-0 z-[100] bg-destructive flex flex-col items-center justify-center text-white p-6 text-center animate-in fade-in">
            <AlertTriangle className="h-32 w-32 mb-8 animate-pulse" />
            <h1 className="text-6xl font-headline font-bold mb-4">CHEATING DETECTED</h1>
            <p className="text-2xl">Resetting to question #1 and shuffling the deck...</p>
          </div>
        )}

        <div className="max-w-2xl w-full space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{activeQuiz.title}</h2>
            <span className="font-mono text-sm bg-secondary px-3 py-1 rounded-full">
              Question {currentIdx + 1} of {shuffledQuestions.length}
            </span>
          </div>

          <Card className="border-2 border-primary/20 shadow-xl p-8">
            <h3 className="text-xl font-medium mb-8 leading-relaxed">{currentQ.question}</h3>
            
            <div className="space-y-4">
              {currentQ.type === 'multiple' && currentQ.options && (
                <RadioGroup value={userAnswer} onValueChange={setUserAnswer} className="grid gap-4">
                  {currentQ.options.map((opt, i) => (
                    <div key={i} className="flex items-center space-x-3 p-4 border rounded-2xl hover:bg-secondary/50 transition-colors">
                      <RadioGroupItem value={opt} id={`opt-${i}`} />
                      <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQ.type === 'boolean' && (
                <RadioGroup value={userAnswer} onValueChange={setUserAnswer} className="grid grid-cols-2 gap-4">
                  {['True', 'False'].map((opt) => (
                    <div key={opt} className="flex items-center space-x-3 p-4 border rounded-2xl hover:bg-secondary/50 transition-colors">
                      <RadioGroupItem value={opt} id={`opt-${opt}`} />
                      <Label htmlFor={`opt-${opt}`} className="flex-1 cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQ.type === 'id' && (
                <Input 
                  placeholder="Type your answer here..." 
                  className="h-14 rounded-xl text-lg" 
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                />
              )}
            </div>

            <Button 
              className="w-full mt-10 h-14 rounded-full font-bold text-lg" 
              onClick={handleNext}
              disabled={!userAnswer}
            >
              Next Question
            </Button>
          </Card>

          <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Shuffle className="h-4 w-4" /> Questions shuffle every time you fail or leave.
          </p>
        </div>
      </main>
    </div>
  );
}
