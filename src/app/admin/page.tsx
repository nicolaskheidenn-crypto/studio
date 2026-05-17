
"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStore, QuizQuestion } from "@/lib/store";
import { useUser } from "@/firebase";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, BookCheck, ShieldAlert, Key, Bell, ListOrdered, ChevronRight, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
  const { user } = useUser();
  const [adminKey, setAdminKey] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { quizzes, addQuiz, deleteQuiz, dailyTasks, addTask, deleteTask } = useAdminStore();

  const [quizTitle, setQuizTitle] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [tempQuestions, setTempQuestions] = useState<QuizQuestion[]>([]);

  // Current question edit state
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState<'multiple' | 'boolean' | 'id'>('multiple');
  const [qAnswer, setQAnswer] = useState("");
  const [qOptions, setQOptions] = useState(["", "", "", ""]);

  const [taskDay, setTaskDay] = useState(1);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");

  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");

  const ADMIN_EMAIL = "nicolaskheidenn@gmail.com";
  const ADMIN_SECRET_KEY = "2878-2171-2489-2341";

  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-accent text-white p-6">
        <ShieldAlert className="h-24 w-24 mb-6 text-red-500" />
        <h1 className="text-4xl font-headline font-bold">Unauthorized Access</h1>
        <p className="mt-4 text-white/60 text-center max-w-md">This high-security management terminal is reserved for the Host only.</p>
        <Button className="mt-12 rounded-full h-16 px-12 text-xl font-bold bg-primary text-accent shadow-2xl" asChild><a href="/">Return to Hub</a></Button>
      </div>
    );
  }

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === ADMIN_SECRET_KEY) {
      setIsAuthorized(true);
      toast({ title: "Identity Verified", description: "Welcome back, Host." });
    } else {
      toast({ title: "Invalid Key", variant: "destructive", description: "Authorization failed." });
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent p-4">
        <Card className="w-full max-w-md p-10 bg-card rounded-[3.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] border-4 border-white/5">
          <CardHeader className="text-center space-y-6">
            <div className="p-6 bg-primary/10 rounded-[2rem] w-fit mx-auto shadow-inner">
              <Key className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-4xl font-headline font-bold">Master Security Gate</CardTitle>
          </CardHeader>
          <CardContent className="mt-6">
            <form onSubmit={handleAuthorize} className="space-y-8">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.2em] font-black text-muted-foreground ml-2">Verification Code</Label>
                <Input 
                  type="password" 
                  placeholder="0000-0000-0000-0000" 
                  className="h-20 text-center text-3xl font-mono tracking-widest rounded-3xl bg-secondary/20 border-accent/10 focus:ring-primary"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full h-20 rounded-[2rem] font-bold text-2xl bg-accent text-white hover:scale-[1.02] transition-transform active:scale-95 shadow-xl">
                Verify Identity
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const resetQForm = () => {
    setQText("");
    setQType('multiple');
    setQAnswer("");
    setQOptions(["", "", "", ""]);
  };

  const handleNextQuestion = () => {
    if (!qText || !qAnswer) {
      toast({ title: "Incomplete Question", variant: "destructive" });
      return;
    }

    const newQ: QuizQuestion = {
      id: Math.random().toString(),
      type: qType,
      question: qText,
      answer: qAnswer,
      options: qType === 'multiple' ? qOptions.filter(o => o !== "") : undefined
    };

    const updatedQuestions = [...tempQuestions, newQ];
    
    if (currentStep < questionCount) {
      setTempQuestions(updatedQuestions);
      setCurrentStep(currentStep + 1);
      resetQForm();
    } else {
      addQuiz({
        title: quizTitle,
        questionCount,
        questions: updatedQuestions
      });
      setIsCreatingQuiz(false);
      setQuizTitle("");
      setTempQuestions([]);
      setCurrentStep(1);
      toast({ title: "FireQuizzo Published", description: "Your strategic test is now live." });
    }
  };

  const handleBroadcast = () => {
    if (!broadcastTitle || !broadcastMsg) return;
    toast({ title: "Broadcast Dispatched", description: "Global notification sent successfully." });
    setBroadcastTitle(""); setBroadcastMsg("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/10">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-6xl font-headline font-bold text-accent">Host Terminal</h1>
          <Badge className="bg-amber-600 h-10 px-6 rounded-full text-lg font-bold">Admin Privileges Active</Badge>
        </div>

        <Tabs defaultValue="tasks" className="space-y-10">
          <TabsList className="bg-white/50 p-2 rounded-full w-fit shadow-sm border border-accent/5">
            <TabsTrigger value="tasks" className="rounded-full px-12 h-12 text-lg font-bold">Strategic Routine</TabsTrigger>
            <TabsTrigger value="quizzes" className="rounded-full px-12 h-12 text-lg font-bold">FireQuizzo Lab</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-full px-12 h-12 text-lg font-bold">Broadcasting</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[3rem] border-accent/10 shadow-2xl overflow-hidden bg-white">
              <CardHeader className="bg-accent text-white p-10">
                <CardTitle className="text-3xl">Inject Strategic Task</CardTitle>
                <CardDescription className="text-white/60">Define the daily grind for your strategists.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="font-bold">Execution Day</Label>
                    <Input type="number" value={taskDay} onChange={e => setTaskDay(parseInt(e.target.value))} className="h-14 rounded-2xl bg-secondary/10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Task Objective</Label>
                    <Input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="h-14 rounded-2xl bg-secondary/10" placeholder="e.g. Audit ROI" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Strategic Instructions</Label>
                  <Textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} className="min-h-[150px] rounded-[2rem] bg-secondary/10 p-6" placeholder="Break down the execution steps..." />
                </div>
                <Button onClick={() => {
                  addTask({ day: taskDay, title: taskTitle, description: taskDesc });
                  toast({ title: "Objective Saved" });
                  setTaskTitle(""); setTaskDesc("");
                }} className="w-full h-16 rounded-full bg-primary text-accent font-black text-xl shadow-lg hover:scale-[1.01] transition-transform">
                  <Plus className="mr-3" /> Save Objective
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dailyTasks.map(t => (
                <div key={t.id} className="p-8 border-2 border-accent/5 rounded-[2.5rem] bg-white flex items-center justify-between shadow-xl hover:border-primary/40 transition-all">
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-xs font-black border-primary text-primary px-3 py-1">DAY {t.day}</Badge>
                    <h4 className="font-bold text-2xl text-accent">{t.title}</h4>
                    <p className="text-muted-foreground line-clamp-1">{t.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full hover:bg-red-50" onClick={() => deleteTask(t.id)}>
                    <Trash2 className="text-destructive h-6 w-6" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
            {!isCreatingQuiz ? (
              <div className="space-y-8">
                <Card className="rounded-[3rem] p-12 border-dashed border-4 border-accent/10 bg-accent/5 flex flex-col items-center justify-center text-center">
                   <div className="p-8 bg-accent text-white rounded-[2.5rem] mb-6 shadow-2xl">
                      <ListOrdered className="h-16 w-16" />
                   </div>
                   <h3 className="text-4xl font-headline font-bold mb-4">FireQuizzo Lab</h3>
                   <p className="text-xl text-muted-foreground mb-12 max-w-lg">Design intensive filters to test strategist focus. If they fail, they reset.</p>
                   <Button onClick={() => setIsCreatingQuiz(true)} className="h-20 px-16 rounded-full bg-accent text-white font-black text-2xl shadow-xl hover:scale-105 transition-transform">
                      <Plus className="mr-3 h-8 w-8" /> Start New Project
                   </Button>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {quizzes.map(q => (
                     <Card key={q.id} className="rounded-[2rem] p-8 bg-white border-2 border-accent/5 shadow-lg group relative">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteQuiz(q.id)}
                        >
                          <Trash2 className="h-5 w-5 text-destructive" />
                        </Button>
                        <h4 className="text-2xl font-bold mb-2">{q.title}</h4>
                        <p className="text-muted-foreground mb-4">{q.questionCount} Questions</p>
                        <Badge className="bg-secondary text-accent font-bold">Anti-Cheat Active</Badge>
                     </Card>
                   ))}
                </div>
              </div>
            ) : (
              <Card className="rounded-[3.5rem] shadow-2xl border-4 border-white overflow-hidden bg-white">
                 <div className="bg-accent p-10 text-white flex items-center justify-between">
                    <div>
                       <h2 className="text-4xl font-headline font-bold">{quizTitle || "New FireQuizzo"}</h2>
                       <p className="text-white/60 font-medium">Question {currentStep} of {questionCount}</p>
                    </div>
                    <Button variant="ghost" className="text-white hover:bg-white/10 rounded-full" onClick={() => setIsCreatingQuiz(false)}>Cancel Creation</Button>
                 </div>
                 <CardContent className="p-10 space-y-10">
                    {currentStep === 1 && tempQuestions.length === 0 && (
                      <div className="grid grid-cols-2 gap-8 pb-10 border-b">
                         <div className="space-y-3">
                            <Label className="text-lg font-bold">Quiz Title</Label>
                            <Input placeholder="Mastering the Mocha" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} className="h-16 rounded-2xl text-xl font-bold px-6" />
                         </div>
                         <div className="space-y-3">
                            <Label className="text-lg font-bold">Total Questions</Label>
                            <select className="w-full h-16 bg-secondary/10 border-accent/10 rounded-2xl px-6 text-xl font-bold" value={questionCount} onChange={e => setQuestionCount(parseInt(e.target.value))}>
                               <option value={10}>10 Questions</option>
                               <option value={15}>15 Questions</option>
                               <option value={20}>20 Questions</option>
                            </select>
                         </div>
                      </div>
                    )}

                    <div className="space-y-10 animate-in slide-in-from-right-10">
                       <div className="space-y-4">
                          <Label className="text-xl font-bold text-accent">Strategic Question</Label>
                          <Textarea placeholder="What is the primary rule of..." value={qText} onChange={e => setQText(e.target.value)} className="min-h-[120px] rounded-3xl text-2xl font-medium p-8 bg-secondary/5" />
                       </div>

                       <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <Label className="font-bold">Question Type</Label>
                             <select className="w-full h-14 bg-white border-2 border-accent/10 rounded-2xl px-6 font-bold" value={qType} onChange={e => { setQType(e.target.value as any); setQAnswer(""); }}>
                                <option value="multiple">Multiple Choice</option>
                                <option value="boolean">True / False</option>
                                <option value="id">Identification</option>
                             </select>
                          </div>
                          <div className="space-y-3">
                             <Label className="font-bold">Correct Answer</Label>
                             {qType === 'multiple' ? (
                               <select className="w-full h-14 bg-white border-2 border-primary/50 rounded-2xl px-6 font-bold" value={qAnswer} onChange={e => setQAnswer(e.target.value)}>
                                  <option value="">Select Correct Option</option>
                                  {qOptions.map((opt, i) => opt ? <option key={i} value={opt}>{opt}</option> : null)}
                               </select>
                             ) : qType === 'boolean' ? (
                               <select className="w-full h-14 bg-white border-2 border-primary/50 rounded-2xl px-6 font-bold" value={qAnswer} onChange={e => setQAnswer(e.target.value)}>
                                  <option value="">Select T/F</option>
                                  <option value="True">True</option>
                                  <option value="False">False</option>
                               </select>
                             ) : (
                               <Input placeholder="Type exact answer..." value={qAnswer} onChange={e => setQAnswer(e.target.value)} className="h-14 rounded-2xl border-primary/50 font-bold" />
                             )}
                          </div>
                       </div>

                       {qType === 'multiple' && (
                         <div className="space-y-4">
                            <Label className="font-bold">Configure Options</Label>
                            <div className="grid grid-cols-2 gap-4">
                               {qOptions.map((opt, i) => (
                                 <Input 
                                   key={i} 
                                   placeholder={`Option ${i+1}`} 
                                   value={opt} 
                                   onChange={e => {
                                     const n = [...qOptions];
                                     n[i] = e.target.value;
                                     setQOptions(n);
                                   }} 
                                   className="h-14 rounded-2xl bg-secondary/10"
                                 />
                               ))}
                            </div>
                         </div>
                       )}

                       <Button onClick={handleNextQuestion} className="w-full h-20 rounded-[2rem] bg-accent text-white font-black text-2xl shadow-2xl hover:bg-accent/90">
                          {currentStep === questionCount ? "Finalize & Publish" : `Proceed to Question ${currentStep + 1}`} <ChevronRight className="ml-2 h-8 w-8" />
                       </Button>
                    </div>
                 </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="notifications" className="animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[3rem] shadow-2xl border-white border-4 bg-white">
               <CardHeader className="bg-accent p-10 text-white"><CardTitle className="flex items-center gap-4 text-3xl"><Bell className="h-10 w-10 text-primary" /> System Broadcast</CardTitle></CardHeader>
               <CardContent className="space-y-10 p-12">
                  <div className="space-y-4">
                    <Label className="text-lg font-bold">Broadcast Subject</Label>
                    <Input placeholder="URGENT: New Strategic Asset Available" value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} className="h-16 rounded-2xl text-xl font-bold px-6 bg-secondary/10" />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-lg font-bold">Message Content</Label>
                    <Textarea placeholder="Attention strategists..." value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} className="min-h-[200px] rounded-[2rem] text-lg p-8 bg-secondary/10" />
                  </div>
                  <Button onClick={handleBroadcast} className="w-full h-20 rounded-[2rem] bg-primary text-accent font-black text-2xl shadow-xl hover:scale-[1.01] transition-transform">
                     Send Global Notification
                  </Button>
               </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
