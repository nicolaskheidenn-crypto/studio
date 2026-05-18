
"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStore, QuizQuestion, ShooppyProduct } from "@/lib/store";
import { useUser } from "@/firebase";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, ShieldAlert, Key, Bell, ListOrdered, ChevronRight, ShoppingBag, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
  const { user } = useUser();
  const [adminKey, setAdminKey] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { quizzes, addQuiz, deleteQuiz, dailyTasks, addTasks, deleteTask, shooppyProducts, addProduct, deleteProduct, broadcastNotification } = useAdminStore();

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

  // Inject TaskDo state
  const [taskDay, setTaskDay] = useState(1);
  const [tasks, setTasks] = useState([
    { title: "", description: "" },
    { title: "", description: "" },
    { title: "", description: "" }
  ]);

  // Shooppy state
  const [pTitle, setPTitle] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pImg, setPImg] = useState("");
  const [pLink, setPLink] = useState("");
  const [pType, setPType] = useState<'Bundle' | 'Template' | 'eBook'>('eBook');
  const [pPrice, setPPrice] = useState("");

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

  const handleSaveTasks = () => {
    if (tasks.some(t => !t.title)) {
      toast({ title: "Incomplete Routine", variant: "destructive", description: "Each day must have 3 tasks." });
      return;
    }
    addTasks(taskDay, tasks);
    toast({ title: "TaskDo Injected", description: `Day ${taskDay} routine updated successfully.` });
    setTasks([{ title: "", description: "" }, { title: "", description: "" }, { title: "", description: "" }]);
  };

  const handleAddProduct = () => {
    if (!pTitle || !pLink) return;
    addProduct({ title: pTitle, description: pDesc, imageUrl: pImg, shopLink: pLink, type: pType, price: pPrice });
    toast({ title: "Shooppy Asset Added" });
    setPTitle(""); setPDesc(""); setPImg(""); setPLink(""); setPPrice("");
  };

  const handleBroadcast = () => {
    if (!broadcastTitle || !broadcastMsg) return;
    broadcastNotification({ title: broadcastTitle, message: broadcastMsg });
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
          <TabsList className="bg-white/50 p-2 rounded-full w-fit shadow-sm border border-accent/5 overflow-x-auto">
            <TabsTrigger value="tasks" className="rounded-full px-8 h-12 text-base font-bold">Inject TaskDo</TabsTrigger>
            <TabsTrigger value="shooppy" className="rounded-full px-8 h-12 text-base font-bold">Shooppy Manager</TabsTrigger>
            <TabsTrigger value="quizzes" className="rounded-full px-8 h-12 text-base font-bold">FireQuizzo Lab</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-full px-8 h-12 text-base font-bold">Broadcasting</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[3rem] border-accent/10 shadow-2xl overflow-hidden bg-white">
              <CardHeader className="bg-accent text-white p-10">
                <CardTitle className="text-3xl">Inject TaskDo</CardTitle>
                <CardDescription className="text-white/60">Define the 3 daily tasks for your strategists.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="space-y-4">
                  <Label className="font-bold text-xl">Execution Day</Label>
                  <Input type="number" value={taskDay} onChange={e => setTaskDay(parseInt(e.target.value))} className="h-16 rounded-2xl bg-secondary/10 text-2xl font-bold" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[0, 1, 2].map(idx => (
                    <div key={idx} className="p-6 bg-secondary/5 rounded-[2rem] border-2 border-accent/5 space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary text-accent rounded-full flex items-center justify-center font-black">T{idx + 1}</div>
                        <h4 className="font-bold text-lg">Task {idx + 1}</h4>
                      </div>
                      <div className="space-y-3">
                        <Label>Objective</Label>
                        <Input 
                          placeholder="e.g. Audit ROI"
                          value={tasks[idx].title}
                          onChange={e => {
                            const n = [...tasks];
                            n[idx].title = e.target.value;
                            setTasks(n);
                          }}
                          className="h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label>Instructions</Label>
                        <Textarea 
                          placeholder="Break down the steps..."
                          value={tasks[idx].description}
                          onChange={e => {
                            const n = [...tasks];
                            n[idx].description = e.target.value;
                            setTasks(n);
                          }}
                          className="min-h-[100px] rounded-xl p-4"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Button onClick={handleSaveTasks} className="w-full h-20 rounded-full bg-primary text-accent font-black text-2xl shadow-xl hover:scale-[1.01] transition-transform">
                  <Plus className="mr-3" /> Save Day {taskDay} Routine
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dailyTasks.map(t => (
                <div key={t.id} className="p-6 border-2 border-accent/5 rounded-[2rem] bg-white flex items-center justify-between shadow-md hover:border-primary/40 transition-all">
                  <div>
                    <Badge variant="outline" className="text-[10px] font-black border-primary text-primary px-2 mb-2">DAY {t.day}</Badge>
                    <h4 className="font-bold text-lg text-accent">{t.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">{t.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-50" onClick={() => deleteTask(t.id)}>
                    <Trash2 className="text-destructive h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="shooppy" className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[3rem] border-accent/10 shadow-2xl overflow-hidden bg-white">
              <CardHeader className="bg-amber-600 text-white p-10">
                <CardTitle className="text-3xl flex items-center gap-4"><ShoppingBag className="h-8 w-8" /> Shooppy Catalog</CardTitle>
                <CardDescription className="text-white/80">Manage your Bundles, Templates, and eBooks for sale.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-bold">Asset Title</Label>
                      <Input value={pTitle} onChange={e => setPTitle(e.target.value)} placeholder="Master Bundle v2" className="h-14 rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">Asset Type</Label>
                      <select className="w-full h-14 bg-secondary/10 border-accent/5 rounded-2xl px-6 font-bold" value={pType} onChange={e => setPType(e.target.value as any)}>
                        <option value="eBook">eBook</option>
                        <option value="Bundle">Bundle</option>
                        <option value="Template">Template</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">Price Label (e.g. $49 or FREE)</Label>
                      <Input value={pPrice} onChange={e => setPPrice(e.target.value)} placeholder="$99" className="h-14 rounded-2xl" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Cover Image URL</Label>
                      <Input value={pImg} onChange={e => setPImg(e.target.value)} placeholder="https://..." className="h-14 rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Checkout Link</Label>
                      <Input value={pLink} onChange={e => setPLink(e.target.value)} placeholder="https://yourshop.com/..." className="h-14 rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">Short Description</Label>
                      <Input value={pDesc} onChange={e => setPDesc(e.target.value)} placeholder="Unlocking the core..." className="h-14 rounded-2xl" />
                    </div>
                  </div>
                </div>
                <Button onClick={handleAddProduct} className="w-full h-20 rounded-full bg-accent text-white font-black text-2xl shadow-xl">
                  Deploy to Shooppy
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shooppyProducts.map(p => (
                <Card key={p.id} className="rounded-[2rem] overflow-hidden bg-white shadow-lg group">
                  <div className="h-40 bg-secondary/20 relative">
                    {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />}
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 rounded-full bg-white/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteProduct(p.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="p-6">
                    <Badge className="bg-primary text-accent mb-2">{p.type}</Badge>
                    <h4 className="font-bold text-xl mb-1">{p.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{p.description}</p>
                    <p className="font-black text-accent text-lg">{p.price || "Contact for Price"}</p>
                  </div>
                </Card>
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
                   <p className="text-xl text-muted-foreground mb-12 max-w-lg">Design intensive filters to test strategist focus.</p>
                   <Button onClick={() => setIsCreatingQuiz(true)} className="h-20 px-16 rounded-full bg-accent text-white font-black text-2xl shadow-xl hover:scale-105 transition-transform">
                      <Plus className="mr-3 h-8 w-8" /> Start New Project
                   </Button>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {quizzes.map(q => (
                     <Card key={q.id} className="rounded-[2rem] p-8 bg-white border-2 border-accent/5 shadow-lg group relative">
                        <Button variant="ghost" size="icon" className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteQuiz(q.id)}>
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
                            <Input placeholder="Mastering the Routine" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} className="h-16 rounded-2xl text-xl font-bold px-6" />
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

                       <Button onClick={() => {
                          const newQ: QuizQuestion = {
                            id: Math.random().toString(),
                            type: qType,
                            question: qText,
                            answer: qAnswer,
                            options: qType === 'multiple' ? qOptions.filter(o => o !== "") : undefined
                          };
                          const updated = [...tempQuestions, newQ];
                          if (currentStep < questionCount) {
                            setTempQuestions(updated);
                            setCurrentStep(currentStep + 1);
                            setQText(""); setQAnswer(""); setQOptions(["", "", "", ""]);
                          } else {
                            addQuiz({ title: quizTitle, questionCount, questions: updated });
                            setIsCreatingQuiz(false); setQuizTitle(""); setTempQuestions([]); setCurrentStep(1);
                            toast({ title: "FireQuizzo Published" });
                          }
                       }} className="w-full h-20 rounded-[2rem] bg-accent text-white font-black text-2xl shadow-2xl">
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
                  <Button onClick={handleBroadcast} className="w-full h-20 rounded-[2rem] bg-primary text-accent font-black text-2xl shadow-xl">
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
