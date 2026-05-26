
"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useState, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { 
  Key, ShieldAlert, Trash2, Award, BookOpen, 
  Newspaper, ShoppingBag, MessageSquare, 
  Plus, Coins, ListChecks,
  ChevronLeft, ChevronRight, Minus, HelpCircle
} from "lucide-react";
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

const ADMIN_EMAIL = "nicolaskheidenn@gmail.com";
const ADMIN_SECRET_KEY = "2878-2171-2489-2341";

export interface QuizQuestion {
  id: string;
  type: 'multiple' | 'boolean' | 'id';
  question: string;
  options?: string[];
  answer: string;
}

export default function AdminPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [adminKey, setAdminKey] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Shared Collections
  const productsQuery = useMemo(() => collection(db, 'shooppyProducts'), [db]);
  const newsQuery = useMemo(() => query(collection(db, 'newsPosts'), orderBy('timestamp', 'desc')), [db]);
  const faqsQuery = useMemo(() => collection(db, 'faqs'), [db]);
  const activityQuery = useMemo(() => query(collection(db, 'activityWall'), orderBy('timestamp', 'desc')), [db]);
  const resourcesQuery = useMemo(() => query(collection(db, 'resources'), orderBy('timestamp', 'desc')), [db]);
  const tasksQuery = useMemo(() => query(collection(db, 'tasks'), orderBy('day', 'asc')), [db]);
  const quizzesQuery = useMemo(() => query(collection(db, 'quizzes'), orderBy('createdAt', 'desc')), [db]);

  const { data: shooppyProducts = [] } = useCollection(productsQuery);
  const { data: newsPosts = [] } = useCollection(newsQuery);
  const { data: faqs = [] } = useCollection(faqsQuery);
  const { data: activityWallData = [] } = useCollection(activityQuery);
  const { data: sharedResources = [] } = useCollection(resourcesQuery);
  const { data: globalTasks = [] } = useCollection(tasksQuery);
  const { data: globalQuizzes = [] } = useCollection(quizzesQuery);

  // Asset State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodTitle, setProdTitle] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodImg, setProdImg] = useState("");
  const [prodFile, setProdFile] = useState("");
  const [prodType, setProdType] = useState<'Bundle' | 'Template' | 'eBook'>('eBook');
  const [prodPlacement, setProdPlacement] = useState<'Hub' | 'Marketplace'>('Marketplace');
  const [prodLevel, setProdLevel] = useState(1);
  const [prodPrice, setProdPrice] = useState(0);

  // Broadcast State
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsImg, setNewsImg] = useState("");

  // FAQ State
  const [faqQ, setFaqQ] = useState("");
  const [faqA, setFaqA] = useState("");

  // Quiz Architect State
  const [quizTitle, setQuizTitle] = useState("");
  const [draftQuestions, setDraftQuestions] = useState<QuizQuestion[]>([
    { id: Math.random().toString(36).substr(2, 9), type: 'multiple', question: "", answer: "", options: ["", "", "", ""] }
  ]);
  const [currentQIdx, setCurrentQIdx] = useState(0);

  // Task State
  const [taskDay, setTaskDay] = useState(1);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === ADMIN_SECRET_KEY) {
      setIsAuthorized(true);
      toast({ title: "Identity Verified" });
    } else {
      toast({ title: "Invalid Protocol Key", variant: "destructive" });
    }
  };

  const handleSaveProduct = async () => {
    const data = {
      title: prodTitle,
      description: prodDesc,
      imageUrl: prodImg,
      fileUrl: prodFile,
      type: prodType,
      placement: prodPlacement,
      requiredLevel: prodLevel,
      price: prodPrice
    };

    if (editingProductId) {
      const ref = doc(db, 'shooppyProducts', editingProductId);
      updateDoc(ref, data);
      setEditingProductId(null);
      toast({ title: "Strategic Asset Updated" });
    } else {
      addDoc(collection(db, 'shooppyProducts'), data);
      toast({ title: "Strategic Asset Deployed" });
    }
    
    setProdTitle(""); setProdDesc(""); setProdImg(""); setProdFile(""); setProdLevel(1); setProdPrice(0); setProdPlacement('Marketplace');
  };

  const handleDispatchBroadcast = async () => {
    addDoc(collection(db, 'newsPosts'), {
      title: newsTitle,
      content: newsContent,
      imageUrl: newsImg,
      timestamp: serverTimestamp()
    });
    setNewsTitle(""); setNewsContent(""); setNewsImg("");
    toast({ title: "Broadcast Dispatched" });
  };

  // Quiz Architect Actions
  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'multiple',
      question: "",
      answer: "",
      options: ["", "", "", ""]
    };
    const newDrafts = [...draftQuestions, newQ];
    setDraftQuestions(newDrafts);
    setCurrentQIdx(newDrafts.length - 1);
    toast({ title: "New Protocol Slot Created" });
  };

  const handleRemoveQuestion = (idx: number) => {
    if (draftQuestions.length <= 1) return;
    const newDrafts = draftQuestions.filter((_, i) => i !== idx);
    setDraftQuestions(newDrafts);
    if (currentQIdx >= newDrafts.length) setCurrentQIdx(Math.max(0, newDrafts.length - 1));
    toast({ title: "Protocol Slot Removed" });
  };

  const updateCurrentQ = (field: keyof QuizQuestion, value: any) => {
    const newDrafts = [...draftQuestions];
    newDrafts[currentQIdx] = { ...newDrafts[currentQIdx], [field]: value };
    
    // Auto-adjust options based on type
    if (field === 'type') {
      if (value === 'boolean') {
        newDrafts[currentQIdx].options = ["True", "False"];
      } else if (value === 'multiple') {
        newDrafts[currentQIdx].options = ["", "", "", ""];
      } else {
        newDrafts[currentQIdx].options = undefined;
      }
    }
    
    setDraftQuestions(newDrafts);
  };

  const updateOption = (optIdx: number, value: string) => {
    const newDrafts = [...draftQuestions];
    const currentOptions = [...(newDrafts[currentQIdx].options || ["", "", "", ""])];
    currentOptions[optIdx] = value;
    newDrafts[currentQIdx].options = currentOptions;
    setDraftQuestions(newDrafts);
  };

  const handleSaveQuiz = async () => {
    if (!quizTitle || draftQuestions.some(q => !q.question || !q.answer)) {
      toast({ title: "Incomplete Protocol", description: "Ensure all questions and answers are defined.", variant: "destructive" });
      return;
    }
    addDoc(collection(db, 'quizzes'), {
      title: quizTitle,
      questionCount: draftQuestions.length,
      questions: draftQuestions,
      createdAt: serverTimestamp()
    });
    setQuizTitle(""); 
    setDraftQuestions([{ id: Math.random().toString(36).substr(2, 9), type: 'multiple', question: "", answer: "", options: ["", "", "", ""] }]);
    setCurrentQIdx(0);
    toast({ title: "Quiz Protocol Deployed" });
  };

  const handleSaveTask = async () => {
    if (!taskTitle || !taskDesc) return;
    addDoc(collection(db, 'tasks'), {
      day: taskDay,
      title: taskTitle,
      description: taskDesc
    });
    setTaskTitle(""); setTaskDesc("");
    toast({ title: "Daily Protocol Updated" });
  };

  const handleDeleteDoc = async (coll: string, id: string) => {
    deleteDoc(doc(db, coll, id));
    toast({ title: "Data Purged" });
  };

  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#1f1610] p-6 text-center">
        <ShieldAlert className="h-32 w-32 mb-8 text-[#FFD700]" />
        <h1 className="text-6xl font-headline font-black uppercase text-[#fdfaf6] italic">Host Terminal Locked</h1>
        <Button className="mt-12 rounded-full h-20 px-16 bg-[#FFD700] text-[#1f1610] font-black text-2xl uppercase shadow-2xl" asChild><a href="/">Return to Gate</a></Button>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1f1610] p-6">
        <Card className="w-full max-w-xl p-16 bg-mocha-cream rounded-[4rem] shadow-2xl border-8 border-[#FFD700]/20">
          <CardHeader className="text-center space-y-8">
            <Key className="h-16 w-16 text-[#FFD700] mx-auto" />
            <CardTitle className="text-5xl font-headline font-black uppercase italic tracking-tighter text-[#1f1610]">Verify Host</CardTitle>
          </CardHeader>
          <CardContent className="mt-10">
            <form onSubmit={handleAuthorize} className="space-y-10">
              <Input type="password" placeholder="Protocol Key" className="h-24 text-center text-5xl font-mono rounded-[2.5rem] border-4 border-[#1f1610]/10 bg-white text-[#1f1610]" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} />
              <Button type="submit" className="w-full h-24 rounded-full font-black text-3xl bg-[#1f1610] text-[#FFD700] shadow-2xl uppercase tracking-tighter">AUTHENTICATE</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentDraftQ = draftQuestions[currentQIdx];

  return (
    <div className="min-h-screen flex flex-col bg-[#1f1610]">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-6xl text-white">
        <h1 className="text-8xl font-headline font-black text-[#fdfaf6] uppercase tracking-tighter mb-16 italic">Host Command</h1>

        <Tabs defaultValue="assets" className="space-y-12">
          <TabsList className="bg-mocha-cream p-2 rounded-full w-fit shadow-2xl border-4 border-[#FFD700]/20 overflow-x-auto scrollbar-hide">
            <TabsTrigger value="assets" className="rounded-full px-10 h-14 text-[10px] font-black uppercase tracking-widest text-[#1f1610]">Assets</TabsTrigger>
            <TabsTrigger value="quizzo" className="rounded-full px-10 h-14 text-[10px] font-black uppercase tracking-widest text-[#1f1610]">Quizzo</TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-full px-10 h-14 text-[10px] font-black uppercase tracking-widest text-[#1f1610]">Tasks</TabsTrigger>
            <TabsTrigger value="broadcast" className="rounded-full px-10 h-14 text-[10px] font-black uppercase tracking-widest text-[#1f1610]">Broadcast</TabsTrigger>
            <TabsTrigger value="moderation" className="rounded-full px-10 h-14 text-[10px] font-black uppercase tracking-widest text-[#1f1610]">Moderation</TabsTrigger>
            <TabsTrigger value="system" className="rounded-full px-10 h-14 text-[10px] font-black uppercase tracking-widest text-[#1f1610]">System</TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="space-y-12">
            <Card className="rounded-[5rem] border-8 border-[#FFD700]/10 bg-mocha-cream p-16 shadow-2xl space-y-12">
                <CardTitle className="text-4xl font-black uppercase flex items-center gap-6 italic text-[#1f1610]"><ShoppingBag className="h-12 w-12 text-[#FFD700]" /> Asset Injector</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                   <div className="space-y-8">
                      <div className="space-y-3">
                        <Label className="text-[#1f1610]">Asset Name</Label>
                        <Input placeholder="Strategy E-book" value={prodTitle} onChange={e => setProdTitle(e.target.value)} className="h-18 font-black text-xl rounded-2xl bg-white text-[#1f1610]" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[#1f1610]">Description</Label>
                        <Textarea placeholder="Asset value..." value={prodDesc} onChange={e => setProdDesc(e.target.value)} className="min-h-[160px] rounded-[2.5rem] p-8 bg-white text-[#1f1610]" />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-[#1f1610]">Category</Label>
                          <select className="w-full h-18 bg-white border-4 border-[#1f1610]/10 rounded-2xl px-8 font-black uppercase text-sm text-[#1f1610]" value={prodType} onChange={e => setProdType(e.target.value as any)}>
                              <option value="eBook">E-Book</option>
                              <option value="Template">Template</option>
                              <option value="Bundle">Bundle</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[#1f1610]">Placement</Label>
                          <select className="w-full h-18 bg-white border-4 border-[#1f1610]/10 rounded-2xl px-8 font-black uppercase text-sm text-[#1f1610]" value={prodPlacement} onChange={e => setProdPlacement(e.target.value as any)}>
                              <option value="Hub">Root Hub</option>
                              <option value="Marketplace">Shooppy</option>
                          </select>
                        </div>
                      </div>
                   </div>
                   <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-[#1f1610]">Level req.</Label>
                          <Input type="number" min={1} value={prodLevel} onChange={e => setProdLevel(Number(e.target.value))} className="h-18 font-black text-3xl text-center bg-white text-[#1f1610]" />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[#1f1610]">Price</Label>
                          <div className="relative">
                            <Coins className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-[#FFD700]" />
                            <Input type="number" min={0} value={prodPrice} onChange={e => setProdPrice(Number(e.target.value))} className="h-18 pl-12 font-black text-3xl text-center bg-white text-[#1f1610]" />
                          </div>
                        </div>
                      </div>
                      <Button onClick={handleSaveProduct} className="w-full h-24 rounded-full bg-[#1f1610] text-[#FFD700] font-black text-2xl uppercase shadow-2xl">Deploy Asset</Button>
                   </div>
                </div>
            </Card>
          </TabsContent>

          <TabsContent value="quizzo" className="space-y-12">
             <Card className="rounded-[5rem] border-8 border-[#FFD700]/10 bg-mocha-cream p-16 shadow-2xl space-y-10">
                <CardTitle className="text-4xl font-black uppercase flex items-center gap-6 italic text-[#1f1610]"><BookOpen className="h-12 w-12 text-[#FFD700]" /> Quizzo Protocol Architect</CardTitle>
                <div className="space-y-10">
                   <div className="space-y-3">
                      <Label className="text-[#1f1610]">Quiz Title</Label>
                      <Input placeholder="Test title" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} className="h-18 font-black text-xl rounded-2xl bg-[#3d332d] border-4 border-[#FFD700]/30 text-white placeholder:text-white/20" />
                   </div>
                   
                   <div className="p-10 bg-[#1f1610]/5 rounded-[3rem] border-4 border-[#1f1610]/10 space-y-10">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-[#1f1610] uppercase tracking-widest text-xs">Question Constructor</h4>
                        <div className="flex items-center gap-6">
                           <Button type="button" variant="ghost" size="icon" className="rounded-full bg-[#1f1610] text-[#FFD700] h-14 w-14 shadow-xl border-2 border-[#FFD700]/20 hover:scale-110" onClick={() => handleRemoveQuestion(currentQIdx)} disabled={draftQuestions.length <= 1}>
                            <Minus className="h-8 w-8" />
                           </Button>
                           
                           {/* HIGH VISIBILITY PAGER PILL */}
                           <div className="flex items-center gap-8 bg-[#FFD700] text-[#1f1610] h-20 px-12 rounded-full font-black shadow-[0_20px_40px_rgba(255,215,0,0.4)] border-4 border-[#1f1610]/10">
                              <button type="button" className="hover:scale-150 transition-transform active:scale-95" onClick={() => setCurrentQIdx(Math.max(0, currentQIdx - 1))}>
                                <ChevronLeft className="h-10 w-10" />
                              </button>
                              <span className="mx-6 text-4xl tracking-tighter italic font-black min-w-[60px] text-center">
                                {currentQIdx + 1}
                              </span>
                              <button type="button" className="hover:scale-150 transition-transform active:scale-95" onClick={() => setCurrentQIdx(Math.min(draftQuestions.length - 1, currentQIdx + 1))}>
                                <ChevronRight className="h-10 w-10" />
                              </button>
                           </div>
                           
                           <Button type="button" variant="ghost" size="icon" className="rounded-full bg-[#FFD700] text-[#1f1610] h-14 w-14 shadow-2xl hover:scale-110 transition-all border-2 border-[#1f1610]/10" onClick={handleAddQuestion}>
                            <Plus className="h-8 w-8" />
                           </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <select 
                            className="h-18 bg-[#1f1610] text-[#FFD700] border-4 border-[#FFD700]/30 rounded-2xl px-6 font-black uppercase" 
                            value={currentDraftQ.type} 
                            onChange={e => updateCurrentQ('type', e.target.value as any)}
                          >
                            <option value="multiple">Multiple Choice</option>
                            <option value="boolean">True/False</option>
                            <option value="id">ID Verification</option>
                         </select>
                         <Input 
                            placeholder="The question text..." 
                            value={currentDraftQ.question} 
                            onChange={e => updateCurrentQ('question', e.target.value)} 
                            className="h-18 md:col-span-2 bg-[#3d332d] border-4 border-[#FFD700]/30 text-white font-bold" 
                          />
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                           <Label className="text-[#1f1610]">Correct Answer</Label>
                           <Input 
                            placeholder="Correct Answer" 
                            value={currentDraftQ.answer} 
                            onChange={e => updateCurrentQ('answer', e.target.value)} 
                            className="h-18 bg-[#3d332d] border-4 border-[#FFD700]/30 text-white" 
                          />
                        </div>
                        
                        {currentDraftQ.type === 'multiple' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(currentDraftQ.options || ["", "", "", ""]).map((opt, i) => (
                              <div key={i} className="space-y-2">
                                <Label className="text-[#1f1610]">Option {i + 1}</Label>
                                <Input 
                                  placeholder={`Option ${i + 1}`} 
                                  value={opt} 
                                  onChange={e => updateOption(i, e.target.value)} 
                                  className="h-16 bg-[#3d332d] border-4 border-[#FFD700]/30 text-white" 
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {currentDraftQ.type === 'boolean' && (
                          <div className="grid grid-cols-2 gap-6 opacity-60">
                            <div className="p-6 bg-[#1f1610] text-[#FFD700] rounded-2xl font-black text-center border-4 border-primary/20">TRUE</div>
                            <div className="p-6 bg-[#1f1610] text-[#FFD700] rounded-2xl font-black text-center border-4 border-primary/20">FALSE</div>
                          </div>
                        )}
                      </div>
                   </div>

                   <Button onClick={handleSaveQuiz} className="w-full h-24 rounded-full bg-[#1f1610] text-[#FFD700] font-black text-3xl uppercase shadow-2xl">Deploy Quiz Protocol</Button>
                </div>
             </Card>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {globalQuizzes.map((q: any) => (
                   <Card key={q.id} className="p-8 rounded-[3rem] border-4 border-[#FFD700]/10 bg-mocha-cream flex justify-between items-center">
                      <div>
                         <h4 className="font-black text-[#1f1610] uppercase italic line-clamp-1">{q.title}</h4>
                         <p className="text-[10px] font-black text-[#1f1610]/40 uppercase tracking-widest">{q.questionCount} Questions</p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-red-500 rounded-full" onClick={() => handleDeleteDoc('quizzes', q.id)}><Trash2 className="h-6 w-6" /></Button>
                   </Card>
                ))}
             </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-12">
             <Card className="rounded-[5rem] border-8 border-[#FFD700]/10 bg-mocha-cream p-16 shadow-2xl space-y-10">
                <CardTitle className="text-4xl font-black uppercase flex items-center gap-6 italic text-[#1f1610]"><ListChecks className="h-12 w-12 text-[#FFD700]" /> Routine Protocol Updates</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                   <div className="space-y-3">
                      <Label className="text-[#1f1610]">Target Day (1-30)</Label>
                      <Input type="number" min={1} max={30} value={taskDay} onChange={e => setTaskDay(Number(e.target.value))} className="h-18 font-black text-center text-3xl bg-white text-[#1f1610]" />
                   </div>
                   <div className="md:col-span-2 space-y-3">
                      <Label className="text-[#1f1610]">Task Headline</Label>
                      <Input placeholder="Define the strategy..." value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="h-18 bg-white text-[#1f1610] font-black text-xl" />
                   </div>
                   <div className="md:col-span-3 space-y-3">
                      <Label className="text-[#1f1610]">Execution Description</Label>
                      <Textarea placeholder="Step-by-step instructions..." value={taskDesc} onChange={e => setTaskDesc(e.target.value)} className="min-h-[120px] bg-white text-[#1f1610] rounded-[2rem] p-8" />
                   </div>
                   <Button onClick={handleSaveTask} className="md:col-span-3 w-full h-24 rounded-full bg-[#1f1610] text-[#FFD700] font-black text-3xl uppercase shadow-2xl">Inject Daily Task</Button>
                </div>
             </Card>

             <div className="space-y-6">
                {globalTasks.map((t: any) => (
                   <div key={t.id} className="p-8 bg-mocha-cream rounded-[3rem] border-4 border-[#FFD700]/10 flex items-center justify-between group">
                      <div className="flex items-center gap-8">
                         <div className="w-16 h-16 bg-[#1f1610] text-[#FFD700] rounded-2xl flex items-center justify-center font-black text-2xl italic">D{t.day}</div>
                         <div>
                            <h4 className="font-black text-[#1f1610] uppercase text-xl italic">{t.title}</h4>
                            <p className="text-xs font-bold text-[#1f1610]/40 line-clamp-1">{t.description}</p>
                         </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-red-500 rounded-full" onClick={() => handleDeleteDoc('tasks', t.id)}><Trash2 className="h-6 w-6" /></Button>
                   </div>
                ))}
             </div>
          </TabsContent>

          <TabsContent value="broadcast" className="space-y-12">
             <Card className="rounded-[5rem] border-8 border-[#FFD700]/10 bg-mocha-cream p-16 shadow-2xl space-y-12">
                <CardTitle className="text-4xl font-black uppercase flex items-center gap-6 italic text-[#1f1610]"><Newspaper className="h-12 w-12 text-[#FFD700]" /> Broadcast Center</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                   <div className="space-y-8">
                      <div className="space-y-3">
                        <Label className="text-[#1f1610]">Headline</Label>
                        <Input placeholder="Broadcast Title" value={newsTitle} onChange={e => setNewsTitle(e.target.value)} className="h-18 font-black text-xl rounded-2xl bg-white text-[#1f1610]" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[#1f1610]">Narrative</Label>
                        <Textarea placeholder="Announcement details..." value={newsContent} onChange={e => setNewsContent(e.target.value)} className="min-h-[200px] rounded-[3rem] p-10 bg-white text-[#1f1610]" />
                      </div>
                      <Button onClick={handleDispatchBroadcast} className="w-full h-24 rounded-full bg-[#1f1610] text-[#FFD700] font-black text-3xl uppercase shadow-2xl">Dispatch</Button>
                   </div>
                   <div className="space-y-6">
                      {newsPosts.map((p: any) => (
                        <div key={p.id} className="p-6 bg-white rounded-3xl flex justify-between items-center shadow-lg border-2 border-[#1f1610]/10">
                           <p className="font-black text-xs uppercase truncate flex-1 mr-6 italic text-[#1f1610]">{p.title}</p>
                           <Button variant="ghost" size="icon" className="text-red-500 rounded-full" onClick={() => handleDeleteDoc('newsPosts', p.id)}><Trash2 className="h-5 w-5" /></Button>
                        </div>
                      ))}
                   </div>
                </div>
             </Card>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <Card className="rounded-[4rem] border-4 border-[#FFD700]/20 bg-mocha-cream p-12 shadow-2xl">
                 <CardTitle className="text-3xl font-black uppercase mb-10 text-[#1f1610]">Strategist Wins</CardTitle>
                 <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 scrollbar-hide">
                   {activityWallData.map((p: any) => (
                     <div key={p.id} className="p-8 bg-white/50 rounded-[3rem] border-2 border-[#1f1610]/10 flex justify-between items-center">
                       <div>
                         <p className="font-black text-[#1f1610] uppercase text-sm">@{p.nickname}</p>
                         <p className="text-xs font-bold text-[#1f1610]/40 mt-1 line-clamp-1">{p.description}</p>
                       </div>
                       <Button variant="ghost" size="icon" className="text-red-500 rounded-full" onClick={() => handleDeleteDoc('activityWall', p.id)}><Trash2 className="h-6 w-6" /></Button>
                     </div>
                   ))}
                 </div>
              </Card>

              <Card className="rounded-[4rem] border-4 border-[#FFD700]/20 bg-mocha-cream p-12 shadow-2xl">
                 <CardTitle className="text-3xl font-black uppercase mb-10 text-[#1f1610]">Resources</CardTitle>
                 <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 scrollbar-hide">
                   {sharedResources.map((r: any) => (
                     <div key={r.id} className="p-8 bg-white/50 rounded-[3rem] border-2 border-[#1f1610]/10 flex justify-between items-center">
                       <div>
                         <p className="font-black text-[#1f1610] uppercase text-sm">{r.title}</p>
                         <p className="text-[10px] font-bold text-[#1f1610]/40 mt-1 uppercase">By @{r.nickname}</p>
                       </div>
                       <Button variant="ghost" size="icon" className="text-red-500 rounded-full" onClick={() => handleDeleteDoc('resources', r.id)}><Trash2 className="h-6 w-6" /></Button>
                     </div>
                   ))}
                 </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-12">
             <Card className="rounded-[4rem] border-8 border-[#FFD700]/10 bg-mocha-cream p-12 shadow-2xl space-y-10">
                <CardTitle className="text-3xl font-black uppercase flex items-center gap-5 italic text-[#1f1610]"><HelpCircle className="h-10 w-10 text-[#FFD700]" /> FAQ Engine</CardTitle>
                <div className="space-y-6">
                   <Input placeholder="Inquiry Question" value={faqQ} onChange={e => setFaqQ(e.target.value)} className="h-16 rounded-2xl bg-white text-[#1f1610]" />
                   <Textarea placeholder="Protocol Response" value={faqA} onChange={e => setFaqA(e.target.value)} className="min-h-[120px] rounded-3xl bg-white text-[#1f1610]" />
                   <Button onClick={() => addDoc(collection(db, 'faqs'), { question: faqQ, answer: faqA }).then(() => { setFaqQ(""); setFaqA(""); toast({ title: "FAQ Injected" }); })} className="w-full h-18 rounded-2xl bg-[#1f1610] text-[#FFD700] font-black uppercase text-sm">Inject FAQ</Button>
                </div>
                <div className="space-y-4">
                  {faqs.map((f: any) => (
                     <div key={f.id} className="p-6 bg-white/50 rounded-2xl flex justify-between items-center border-2 border-[#1f1610]/10">
                        <p className="font-black text-xs uppercase italic text-[#1f1610]">{f.question}</p>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteDoc('faqs', f.id)}><Trash2 className="h-5 w-5" /></Button>
                     </div>
                  ))}
                </div>
             </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
