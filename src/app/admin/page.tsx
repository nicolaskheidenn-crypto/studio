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
import { Plus, Trash2, ShieldAlert, Key, Bell, ListOrdered, ChevronRight, ShoppingBag, Link as LinkIcon, Image as ImageIcon, ShieldCheck, FileText, Save } from "lucide-react";
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

  // Sovereignty Editor state
  const [sovereigntyTitle, setSovereigntyTitle] = useState("Legal Proof & Sovereignty");
  const [sovereigntySections, setSovereigntySections] = useState([
    { id: '1', title: 'Infrastructure', content: 'Nico Digital high-focus utility environment.' },
    { id: '2', title: 'Data Isolation', content: 'Proprietary security rules ensuring isolated execution.' }
  ]);

  const ADMIN_EMAIL = "nicolaskheidenn@gmail.com";
  const ADMIN_SECRET_KEY = "2878-2171-2489-2341";

  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-accent text-white p-6">
        <ShieldAlert className="h-24 w-24 mb-6 text-red-500" />
        <h1 className="text-4xl font-headline font-bold">Unauthorized Access</h1>
        <p className="mt-4 text-white/60 text-center max-w-md uppercase tracking-widest text-xs font-black">This high-security management terminal is reserved for Host only.</p>
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
                <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground ml-2">Verification Code</Label>
                <Input 
                  type="password" 
                  placeholder="0000-0000-0000-0000" 
                  className="h-20 text-center text-3xl font-mono tracking-widest rounded-3xl bg-secondary/20 border-accent/10 focus:ring-primary text-accent"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full h-20 rounded-[2rem] font-black text-2xl bg-accent text-white hover:scale-[1.02] transition-transform active:scale-95 shadow-xl">
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
  };

  const handleAddProduct = () => {
    if (!pTitle || !pLink) return;
    addProduct({ title: pTitle, description: pDesc, imageUrl: pImg, shopLink: pLink, type: pType, price: pPrice });
    toast({ title: "Shooppy Asset Added" });
    setPTitle(""); setPDesc(""); setPImg(""); setPLink(""); setPPrice("");
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
            <TabsTrigger value="tasks" className="rounded-full px-8 h-12 text-xs font-black uppercase tracking-widest">Inject TaskDo</TabsTrigger>
            <TabsTrigger value="shooppy" className="rounded-full px-8 h-12 text-xs font-black uppercase tracking-widest">Shooppy Manager</TabsTrigger>
            <TabsTrigger value="sovereignty" className="rounded-full px-8 h-12 text-xs font-black uppercase tracking-widest">Legal Editor</TabsTrigger>
            <TabsTrigger value="quizzes" className="rounded-full px-8 h-12 text-xs font-black uppercase tracking-widest">FireQuizzo Lab</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[3rem] border-accent/10 shadow-2xl overflow-hidden bg-white">
              <CardHeader className="bg-accent text-white p-10">
                <CardTitle className="text-3xl">Inject TaskDo</CardTitle>
                <CardDescription className="text-white/60">Define the 3 daily tasks for your strategists.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="space-y-4">
                  <Label className="font-black text-xl text-accent">Execution Day</Label>
                  <Input type="number" value={taskDay} onChange={e => setTaskDay(parseInt(e.target.value))} className="h-16 rounded-2xl bg-secondary/10 text-2xl font-black text-accent" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[0, 1, 2].map(idx => (
                    <div key={idx} className="p-6 bg-secondary/5 rounded-[2rem] border-2 border-accent/5 space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary text-accent rounded-full flex items-center justify-center font-black">T{idx + 1}</div>
                        <h4 className="font-black text-lg text-accent">Task {idx + 1}</h4>
                      </div>
                      <div className="space-y-3">
                        <Label className="font-black text-accent/60 uppercase text-[10px]">Objective</Label>
                        <Input 
                          placeholder="e.g. Audit ROI"
                          value={tasks[idx].title}
                          onChange={e => {
                            const n = [...tasks];
                            n[idx].title = e.target.value;
                            setTasks(n);
                          }}
                          className="h-12 rounded-xl text-accent font-bold"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="font-black text-accent/60 uppercase text-[10px]">Instructions</Label>
                        <Textarea 
                          placeholder="Break down the steps..."
                          value={tasks[idx].description}
                          onChange={e => {
                            const n = [...tasks];
                            n[idx].description = e.target.value;
                            setTasks(n);
                          }}
                          className="min-h-[100px] rounded-xl p-4 text-accent font-medium"
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

          <TabsContent value="sovereignty" className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[3rem] border-accent/10 shadow-2xl overflow-hidden bg-white">
              <CardHeader className="bg-primary text-accent p-10">
                <CardTitle className="text-3xl flex items-center gap-4"><ShieldCheck className="h-8 w-8" /> Legal Proof Editor</CardTitle>
                <CardDescription className="text-accent/60">Update your business sovereignty clauses and proof of root.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="space-y-4">
                  <Label className="font-black text-accent">Main Title</Label>
                  <Input value={sovereigntyTitle} onChange={e => setSovereigntyTitle(e.target.value)} className="h-14 rounded-xl text-accent font-black" />
                </div>
                
                <div className="space-y-8">
                  {sovereigntySections.map((s, idx) => (
                    <div key={s.id} className="p-8 bg-secondary/5 rounded-3xl border-2 border-accent/5 space-y-6">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-accent text-white">Clause {idx + 1}</Badge>
                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                      <div className="space-y-3">
                        <Label className="font-black text-accent/60 uppercase text-[10px]">Clause Subject</Label>
                        <Input value={s.title} className="h-12 rounded-xl font-bold text-accent" />
                      </div>
                      <div className="space-y-3">
                        <Label className="font-black text-accent/60 uppercase text-[10px]">Legal Description</Label>
                        <Textarea value={s.content} className="min-h-[100px] rounded-xl font-medium text-accent" />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full h-14 rounded-2xl border-dashed border-2 border-accent/20 text-accent font-black">
                    <Plus className="mr-2" /> Add Sovereignty Clause
                  </Button>
                </div>

                <Button className="w-full h-20 rounded-full bg-accent text-white font-black text-2xl shadow-xl">
                  <Save className="mr-3" /> Update Sovereignty Hub
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shooppy" className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
            <Card className="rounded-[3rem] border-accent/10 shadow-2xl overflow-hidden bg-white">
              <CardHeader className="bg-amber-600 text-white p-10">
                <CardTitle className="text-3xl flex items-center gap-4"><ShoppingBag className="h-8 w-8" /> Shooppy Manager</CardTitle>
                <CardDescription className="text-white/80">Manage assets, eBooks, and Bundles.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-black text-accent">Asset Title</Label>
                      <Input value={pTitle} onChange={e => setPTitle(e.target.value)} placeholder="Master Bundle v2" className="h-14 rounded-2xl text-accent font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-accent">Asset Type</Label>
                      <select className="w-full h-14 bg-secondary/10 border-accent/5 rounded-2xl px-6 font-black text-accent" value={pType} onChange={e => setPType(e.target.value as any)}>
                        <option value="eBook">eBook</option>
                        <option value="Bundle">Bundle</option>
                        <option value="Template">Template</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-accent">Price Label</Label>
                      <Input value={pPrice} onChange={e => setPPrice(e.target.value)} placeholder="$99" className="h-14 rounded-2xl text-accent font-bold" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-black text-accent flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Cover Image URL</Label>
                      <Input value={pImg} onChange={e => setPImg(e.target.value)} placeholder="https://..." className="h-14 rounded-2xl text-accent font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-accent flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Checkout Link</Label>
                      <Input value={pLink} onChange={e => setPLink(e.target.value)} placeholder="https://..." className="h-14 rounded-2xl text-accent font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-accent">Short Description</Label>
                      <Input value={pDesc} onChange={e => setPDesc(e.target.value)} placeholder="Unlocking the core..." className="h-14 rounded-2xl text-accent font-bold" />
                    </div>
                  </div>
                </div>
                <Button onClick={handleAddProduct} className="w-full h-20 rounded-full bg-accent text-white font-black text-2xl shadow-xl">
                  Deploy to Shooppy Hub
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shooppyProducts.map(p => (
                <Card key={p.id} className="rounded-[2rem] overflow-hidden bg-white shadow-lg group border-2 border-accent/5">
                  <div className="h-40 bg-secondary/20 relative">
                    {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />}
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 rounded-full bg-white/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteProduct(p.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="p-6">
                    <Badge className="bg-primary text-accent mb-2">{p.type}</Badge>
                    <h4 className="font-black text-xl mb-1 text-accent">{p.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{p.description}</p>
                    <p className="font-black text-accent text-lg">{p.price || "FREE"}</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}