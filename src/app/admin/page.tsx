
"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { 
  Key, ShieldAlert, Trash2, Award, BookOpen, 
  Newspaper, ShoppingBag, MessageSquare, 
  Plus, Coins, ListChecks,
  ChevronLeft, ChevronRight, Minus, HelpCircle, Upload, Link as LinkIcon,
  Database, Download, RefreshCcw, ShieldCheck, AlertOctagon, Loader2,
  Users, Zap, Activity, Filter, Search, MoreVertical
} from "lucide-react";
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, getDocs, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from "@/lib/utils";

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
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const restoreRef = useRef<HTMLInputElement>(null);
  
  // Collections
  const productsQuery = useMemo(() => collection(db, 'shooppyProducts'), [db]);
  const newsQuery = useMemo(() => query(collection(db, 'newsPosts'), orderBy('timestamp', 'desc')), [db]);
  const faqsQuery = useMemo(() => collection(db, 'faqs'), [db]);
  const activityQuery = useMemo(() => query(collection(db, 'activityWall'), orderBy('timestamp', 'desc')), [db]);
  const resourcesQuery = useMemo(() => query(collection(db, 'resources'), orderBy('timestamp', 'desc')), [db]);
  const tasksQuery = useMemo(() => query(collection(db, 'tasks'), orderBy('day', 'asc')), [db]);
  const quizzesQuery = useMemo(() => query(collection(db, 'quizzes'), orderBy('createdAt', 'desc')), [db]);
  const usersQuery = useMemo(() => collection(db, 'users'), [db]);

  const { data: shooppyProducts = [] } = useCollection(productsQuery);
  const { data: newsPosts = [] } = useCollection(newsQuery);
  const { data: faqs = [] } = useCollection(faqsQuery);
  const { data: activityWallData = [] } = useCollection(activityQuery);
  const { data: sharedResources = [] } = useCollection(resourcesQuery);
  const { data: globalTasks = [] } = useCollection(tasksQuery);
  const { data: globalQuizzes = [] } = useCollection(quizzesQuery);
  const { data: totalUsers = [] } = useCollection(usersQuery);

  // Form States
  const [prodTitle, setProdTitle] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodImg, setProdImg] = useState("");
  const [prodFile, setProdFile] = useState(""); 
  const [prodType, setProdType] = useState<'Bundle' | 'Template' | 'eBook'>('eBook');
  const [prodPlacement, setProdPlacement] = useState<'Hub' | 'Marketplace'>('Marketplace');
  const [prodLevel, setProdLevel] = useState(1);
  const [prodPrice, setProdPrice] = useState(0);

  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsImg, setNewsImg] = useState("");

  const [faqQ, setFaqQ] = useState("");
  const [faqA, setFaqA] = useState("");

  const [quizTitle, setQuizTitle] = useState("");
  const [draftQuestions, setDraftQuestions] = useState<QuizQuestion[]>([
    { id: Math.random().toString(36).substr(2, 9), type: 'multiple', question: "", answer: "", options: ["", "", "", ""] }
  ]);
  const [currentQIdx, setCurrentQIdx] = useState(0);

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

  const handleExportBackup = async () => {
    setIsBackingUp(true);
    try {
      const collections = ['shooppyProducts', 'newsPosts', 'faqs', 'activityWall', 'resources', 'tasks', 'quizzes', 'users'];
      const backupData: any = {};
      for (const collName of collections) {
        const collRef = collection(db, collName);
        const snapshot = await getDocs(collRef);
        backupData[collName] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SOVEREIGN_ARCHIVE_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Master Backup Generated" });
    } catch (e) {
      toast({ title: "Backup Failure", variant: "destructive" });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsRestoring(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        for (const collName in data) {
          const items = data[collName];
          for (const item of items) {
            const { id, ...rest } = item;
            await setDoc(doc(db, collName, id), rest, { merge: true });
          }
        }
        toast({ title: "Continuity Protocol Successful" });
      } catch (err) {
        toast({ title: "Restoration Breach", variant: "destructive" });
      } finally {
        setIsRestoring(false);
        if (restoreRef.current) restoreRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleSaveProduct = () => {
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
    addDoc(collection(db, 'shooppyProducts'), data);
    setProdTitle(""); setProdDesc(""); setProdImg(""); setProdFile(""); setProdLevel(1); setProdPrice(0);
    toast({ title: "Strategic Asset Deployed" });
  };

  const handleDispatchBroadcast = () => {
    addDoc(collection(db, 'newsPosts'), {
      title: newsTitle,
      content: newsContent,
      imageUrl: newsImg,
      timestamp: serverTimestamp()
    });
    setNewsTitle(""); setNewsContent(""); setNewsImg("");
    toast({ title: "Broadcast Dispatched" });
  };

  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'multiple',
      question: "",
      answer: "",
      options: ["", "", "", ""]
    };
    setDraftQuestions([...draftQuestions, newQ]);
    setCurrentQIdx(draftQuestions.length);
  };

  const updateCurrentQ = (field: keyof QuizQuestion, value: any) => {
    const newDrafts = [...draftQuestions];
    newDrafts[currentQIdx] = { ...newDrafts[currentQIdx], [field]: value };
    if (field === 'type') {
      if (value === 'boolean') newDrafts[currentQIdx].options = ["True", "False"];
      else if (value === 'multiple') newDrafts[currentQIdx].options = ["", "", "", ""];
      else newDrafts[currentQIdx].options = undefined;
      newDrafts[currentQIdx].answer = "";
    }
    setDraftQuestions(newDrafts);
  };

  const handleSaveQuiz = () => {
    addDoc(collection(db, 'quizzes'), {
      title: quizTitle,
      questionCount: draftQuestions.length,
      questions: draftQuestions,
      createdAt: serverTimestamp()
    });
    setQuizTitle(""); setDraftQuestions([{ id: Math.random().toString(36).substr(2, 9), type: 'multiple', question: "", answer: "", options: ["", "", "", ""] }]);
    setCurrentQIdx(0);
    toast({ title: "Quiz Protocol Deployed" });
  };

  const handleSaveTask = () => {
    addDoc(collection(db, 'tasks'), { day: taskDay, title: taskTitle, description: taskDesc });
    setTaskTitle(""); setTaskDesc("");
    toast({ title: "Daily Protocol Updated" });
  };

  const handleDeleteDoc = (coll: string, id: string) => {
    deleteDoc(doc(db, coll, id));
    toast({ title: "Data Purged" });
  };

  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#1f1610] p-6 text-center">
        <ShieldAlert className="h-32 w-32 mb-8 text-primary" />
        <h1 className="text-6xl font-headline font-black uppercase text-foreground italic">Host Terminal Locked</h1>
        <Button className="mt-12 rounded-full h-20 px-16 bg-primary text-[#1f1610] font-black text-2xl uppercase shadow-2xl" asChild><a href="/">Return to Gate</a></Button>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1f1610] p-6">
        <Card className="w-full max-w-xl p-16 bg-mocha-cream rounded-[4rem] shadow-2xl border-8 border-primary/20">
          <CardHeader className="text-center space-y-8">
            <Key className="h-16 w-16 text-primary mx-auto" />
            <CardTitle className="text-5xl font-headline font-black uppercase italic tracking-tighter text-[#1f1610]">Verify Host</CardTitle>
          </CardHeader>
          <CardContent className="mt-10">
            <form onSubmit={handleAuthorize} className="space-y-10">
              <Input type="password" placeholder="Protocol Key" className="h-24 text-center text-5xl font-mono rounded-[2.5rem] border-4 border-[#1f1610]/10 bg-white text-[#1f1610]" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} />
              <Button type="submit" className="w-full h-24 rounded-full font-black text-3xl bg-[#1f1610] text-primary shadow-2xl uppercase tracking-tighter">AUTHENTICATE</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#1f1610]">
      <Navigation />
      
      {/* Command Intelligence Stats */}
      <div className="bg-primary/5 border-b-4 border-primary/10 py-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col">
              <span className="text-primary font-black uppercase tracking-widest text-[10px] mb-2">Total Strategists</span>
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-primary" />
                <span className="text-4xl font-black text-foreground italic tracking-tighter">{totalUsers.length}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-primary font-black uppercase tracking-widest text-[10px] mb-2">Shared Resources</span>
              <div className="flex items-center gap-4">
                <Activity className="h-8 w-8 text-primary" />
                <span className="text-4xl font-black text-foreground italic tracking-tighter">{sharedResources.length}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-primary font-black uppercase tracking-widest text-[10px] mb-2">Deployed Assets</span>
              <div className="flex items-center gap-4">
                <ShoppingBag className="h-8 w-8 text-primary" />
                <span className="text-4xl font-black text-foreground italic tracking-tighter">{shooppyProducts.length}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-primary font-black uppercase tracking-widest text-[10px] mb-2">Global Wins</span>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <span className="text-4xl font-black text-foreground italic tracking-tighter">{activityWallData.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-16 max-w-6xl">
        <Tabs defaultValue="assets" className="space-y-12">
          <div className="flex items-center justify-between overflow-x-auto pb-4 scrollbar-hide">
            <TabsList className="bg-mocha-cream p-2 rounded-full w-fit shadow-2xl border-4 border-primary/20 flex-shrink-0">
              {[
                { val: "assets", icon: ShoppingBag, label: "Assets", count: shooppyProducts.length },
                { val: "quizzo", icon: BookOpen, label: "Quizzo", count: globalQuizzes.length },
                { val: "tasks", icon: ListChecks, label: "Tasks", count: globalTasks.length },
                { val: "broadcast", icon: Newspaper, label: "Dispatch", count: newsPosts.length },
                { val: "moderation", icon: ShieldAlert, label: "Ops", count: activityWallData.length + sharedResources.length },
                { val: "maintenance", icon: Database, label: "Backup", count: 0 },
                { val: "system", icon: HelpCircle, label: "System", count: faqs.length }
              ].map((tab) => (
                <TabsTrigger key={tab.val} value={tab.val} className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest text-[#1f1610] gap-2">
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {tab.count > 0 && <Badge className="bg-[#1f1610] text-primary border-none text-[8px] h-4 w-4 flex items-center justify-center p-0">{tab.count}</Badge>}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="assets" className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <Card className="rounded-[4rem] border-8 border-primary/10 bg-mocha-cream p-12 shadow-2xl space-y-10">
                  <CardTitle className="text-3xl font-black uppercase flex items-center gap-5 italic text-[#1f1610]"><Plus className="h-8 w-8 text-primary" /> Asset Injector</CardTitle>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[#1f1610]">Asset Name</Label>
                        <Input placeholder="Strategy E-book" value={prodTitle} onChange={e => setProdTitle(e.target.value)} className="h-16 font-black text-lg rounded-2xl bg-white text-[#1f1610]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[#1f1610]">Category</Label>
                        <select className="w-full h-16 bg-white border-4 border-[#1f1610]/10 rounded-2xl px-6 font-black uppercase text-xs text-[#1f1610]" value={prodType} onChange={e => setProdType(e.target.value as any)}>
                          <option value="eBook">E-Book</option>
                          <option value="Template">Template</option>
                          <option value="Bundle">Bundle</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#1f1610]">Detailed Narrative</Label>
                      <Textarea placeholder="Asset value..." value={prodDesc} onChange={e => setProdDesc(e.target.value)} className="min-h-[120px] rounded-[2rem] p-6 bg-white text-[#1f1610]" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[#1f1610]">Target Hub</Label>
                        <select className="w-full h-16 bg-white border-4 border-[#1f1610]/10 rounded-2xl px-6 font-black uppercase text-xs text-[#1f1610]" value={prodPlacement} onChange={e => setProdPlacement(e.target.value as any)}>
                          <option value="Hub">Root Hub (Free/Points)</option>
                          <option value="Marketplace">Shooppy (Paid External)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[#1f1610]">{prodPlacement === 'Hub' ? 'Protocol File' : 'Shop URL'}</Label>
                        <div className="relative">
                          {prodPlacement === 'Hub' ? <Upload className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30" /> : <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30" />}
                          <Input 
                            placeholder={prodPlacement === 'Hub' ? "Upload asset..." : "https://..."} 
                            value={prodFile}
                            onChange={e => setProdFile(e.target.value)}
                            className="h-16 pl-12 text-xs font-black bg-white text-[#1f1610]" 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[#1f1610]">Level Req.</Label>
                        <Input type="number" min={1} value={prodLevel} onChange={e => setProdLevel(Number(e.target.value))} className="h-16 font-black text-2xl text-center bg-white text-[#1f1610]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[#1f1610]">Points Price</Label>
                        <Input type="number" min={0} value={prodPrice} onChange={e => setProdPrice(Number(e.target.value))} className="h-16 font-black text-2xl text-center bg-white text-[#1f1610]" />
                      </div>
                    </div>
                    <Button onClick={handleSaveProduct} className="w-full h-20 rounded-full bg-[#1f1610] text-primary font-black text-xl uppercase shadow-2xl hover:scale-[1.02] transition-all">Deploy Asset Protocol</Button>
                  </div>
              </Card>

              <div className="space-y-8">
                <div className="flex items-center justify-between px-6">
                   <h3 className="text-2xl font-black uppercase text-foreground italic">Current Inventory</h3>
                   <span className="text-[10px] font-black uppercase text-primary/40 tracking-widest">Active Protocols</span>
                </div>
                <ScrollArea className="h-[650px] pr-6">
                  <div className="space-y-6">
                    {shooppyProducts.map((p: any) => (
                      <div key={p.id} className="p-8 bg-mocha-cream rounded-[3rem] border-4 border-primary/10 flex items-center justify-between group shadow-lg">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-[#1f1610] text-primary rounded-2xl flex items-center justify-center font-black text-xs italic shrink-0">{p.type.slice(0,1)}</div>
                          <div>
                            <h4 className="font-black text-[#1f1610] uppercase italic text-lg line-clamp-1">{p.title}</h4>
                            <p className="text-[10px] font-black uppercase text-[#1f1610]/40 tracking-widest">{p.placement} • LV {p.requiredLevel} • {p.price} PTS</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 rounded-full" onClick={() => handleDeleteDoc('shooppyProducts', p.id)}><Trash2 className="h-5 w-5" /></Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quizzo" className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
             <Card className="rounded-[4rem] border-8 border-primary/10 bg-mocha-cream p-12 shadow-2xl space-y-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl font-black uppercase flex items-center gap-5 italic text-[#1f1610]"><BookOpen className="h-8 w-8 text-primary" /> Quizzo Protocol Architect</CardTitle>
                  <Button onClick={handleSaveQuiz} className="h-16 px-12 rounded-full bg-[#1f1610] text-primary font-black text-sm uppercase shadow-2xl">Deploy Quiz</Button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-2">
                      <Label className="text-[#1f1610]">Protocol Title</Label>
                      <Input placeholder="Verification Level 01" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} className="h-16 font-black text-xl rounded-2xl bg-white text-[#1f1610]" />
                    </div>
                    
                    <div className="p-10 bg-[#1f1610]/5 rounded-[3rem] border-4 border-[#1f1610]/10 space-y-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="w-12 h-12 bg-[#1f1610] text-primary rounded-xl flex items-center justify-center font-black text-2xl italic">{currentQIdx + 1}</span>
                          <span className="text-[10px] font-black uppercase text-[#1f1610] tracking-widest">Constructing Question</span>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="text-red-500 rounded-full h-10 w-10" onClick={() => {
                          const newDrafts = draftQuestions.filter((_, i) => i !== currentQIdx);
                          setDraftQuestions(newDrafts);
                          setCurrentQIdx(Math.max(0, currentQIdx - 1));
                        }} disabled={draftQuestions.length <= 1}><Trash2 className="h-5 w-5" /></Button>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-6">
                          <select className="h-16 bg-white text-[#1f1610] border-4 border-[#1f1610]/10 rounded-2xl px-6 font-black uppercase text-xs" value={draftQuestions[currentQIdx].type} onChange={e => updateCurrentQ('type', e.target.value as any)}>
                            <option value="multiple">Multiple Choice</option>
                            <option value="boolean">True/False</option>
                            <option value="id">ID Code</option>
                          </select>
                          <Input placeholder="Question text..." value={draftQuestions[currentQIdx].question} onChange={e => updateCurrentQ('question', e.target.value)} className="col-span-2 h-16 bg-white text-[#1f1610] font-bold" />
                        </div>

                        {draftQuestions[currentQIdx].type === 'multiple' && (
                          <div className="grid grid-cols-2 gap-4">
                            {draftQuestions[currentQIdx].options?.map((opt, i) => (
                              <div key={i} className="flex gap-2 items-center">
                                <span className="text-[10px] font-black opacity-20">{i+1}</span>
                                <Input placeholder={`Option ${i+1}`} value={opt} onChange={e => {
                                  const newOpts = [...(draftQuestions[currentQIdx].options || [])];
                                  newOpts[i] = e.target.value;
                                  updateCurrentQ('options', newOpts);
                                }} className="h-12 bg-white text-[#1f1610] text-xs" />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label className="text-[#1f1610] text-[10px]">CORRECT STRATEGIC RESPONSE</Label>
                          {draftQuestions[currentQIdx].type === 'id' ? (
                            <Input placeholder="Answer code..." value={draftQuestions[currentQIdx].answer} onChange={e => updateCurrentQ('answer', e.target.value)} className="h-14 bg-white text-[#1f1610] text-sm" />
                          ) : (
                            <select className="w-full h-14 bg-white border-4 border-[#1f1610]/10 rounded-2xl px-6 font-black uppercase text-xs text-[#1f1610]" value={draftQuestions[currentQIdx].answer} onChange={e => updateCurrentQ('answer', e.target.value)}>
                              <option value="">Select Correct Answer</option>
                              {(draftQuestions[currentQIdx].type === 'multiple' ? draftQuestions[currentQIdx].options : ["True", "False"])?.map((opt, i) => (
                                opt && <option key={i} value={opt}>{opt}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <Label className="text-[#1f1610] font-black uppercase tracking-widest text-[10px]">Protocol Layout ({draftQuestions.length})</Label>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-3">
                        {draftQuestions.map((q, i) => (
                          <button key={q.id} onClick={() => setCurrentQIdx(i)} className={cn("w-full p-4 rounded-2xl border-4 text-left transition-all flex justify-between items-center", currentQIdx === i ? "bg-[#1f1610] border-primary text-primary" : "bg-white border-[#1f1610]/5 text-[#1f1610] opacity-60 hover:opacity-100")}>
                            <span className="font-black italic text-sm">Q{i+1}: {q.question || "Untitled"}</span>
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                    <Button onClick={handleAddQuestion} className="w-full h-16 rounded-2xl bg-primary text-[#1f1610] font-black uppercase text-[10px] tracking-widest gap-2"><Plus className="h-4 w-4" /> Add Protocol Slot</Button>
                  </div>
                </div>
             </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
             <Card className="rounded-[4rem] border-8 border-primary/10 bg-mocha-cream p-12 shadow-2xl space-y-10">
                <CardTitle className="text-3xl font-black uppercase flex items-center gap-5 italic text-[#1f1610]"><ListChecks className="h-8 w-8 text-primary" /> Daily Routine Injector</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                   <div className="space-y-2">
                      <Label className="text-[#1f1610]">Target Day</Label>
                      <Input type="number" min={1} max={30} value={taskDay} onChange={e => setTaskDay(Number(e.target.value))} className="h-16 font-black text-center text-3xl bg-white text-[#1f1610]" />
                   </div>
                   <div className="md:col-span-3 space-y-2">
                      <Label className="text-[#1f1610]">Routine Headline</Label>
                      <Input placeholder="Morning protocol..." value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="h-16 bg-white text-[#1f1610] font-black text-xl" />
                   </div>
                   <div className="md:col-span-4 space-y-2">
                      <Label className="text-[#1f1610]">Operational Instructions</Label>
                      <Textarea placeholder="Step-by-step..." value={taskDesc} onChange={e => setTaskDesc(e.target.value)} className="min-h-[100px] bg-white text-[#1f1610] rounded-[2rem] p-6" />
                   </div>
                   <Button onClick={handleSaveTask} className="md:col-span-4 w-full h-20 rounded-full bg-[#1f1610] text-primary font-black text-xl uppercase shadow-2xl">Inject Daily Task</Button>
                </div>
             </Card>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {globalTasks.map((t: any) => (
                   <div key={t.id} className="p-6 bg-mocha-cream rounded-[2.5rem] border-4 border-primary/10 flex items-center justify-between group shadow-lg">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-[#1f1610] text-primary rounded-xl flex items-center justify-center font-black text-sm italic shrink-0">D{t.day}</div>
                         <h4 className="font-black text-[#1f1610] uppercase text-sm italic truncate max-w-[150px]">{t.title}</h4>
                      </div>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 rounded-full" onClick={() => handleDeleteDoc('tasks', t.id)}><Trash2 className="h-4 w-4" /></Button>
                   </div>
                ))}
             </div>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <Card className="rounded-[4rem] border-8 border-primary/10 bg-mocha-cream p-10 shadow-2xl flex flex-col h-[700px]">
                 <div className="flex items-center justify-between mb-8">
                   <CardTitle className="text-2xl font-black uppercase text-[#1f1610]">Sovereign Win Feed</CardTitle>
                   <Badge className="bg-[#1f1610] text-primary rounded-full px-4">{activityWallData.length}</Badge>
                 </div>
                 <ScrollArea className="flex-1 pr-4">
                   <div className="space-y-6">
                     {activityWallData.map((p: any) => (
                       <div key={p.id} className="p-6 bg-white/50 rounded-[2.5rem] border-2 border-[#1f1610]/5 flex justify-between items-center group">
                         <div className="flex-1 min-w-0 mr-4">
                           <p className="font-black text-[#1f1610] uppercase text-xs truncate">@{p.nickname}</p>
                           <p className="text-[10px] font-bold text-[#1f1610]/40 mt-1 truncate">{p.description}</p>
                         </div>
                         <Button variant="ghost" size="icon" className="text-red-500 rounded-full shrink-0" onClick={() => handleDeleteDoc('activityWall', p.id)}><Trash2 className="h-5 w-5" /></Button>
                       </div>
                     ))}
                   </div>
                 </ScrollArea>
              </Card>

              <Card className="rounded-[4rem] border-8 border-primary/10 bg-mocha-cream p-10 shadow-2xl flex flex-col h-[700px]">
                 <div className="flex items-center justify-between mb-8">
                   <CardTitle className="text-2xl font-black uppercase text-[#1f1610]">Strategic Vault</CardTitle>
                   <Badge className="bg-[#1f1610] text-primary rounded-full px-4">{sharedResources.length}</Badge>
                 </div>
                 <ScrollArea className="flex-1 pr-4">
                   <div className="space-y-6">
                     {sharedResources.map((r: any) => (
                       <div key={r.id} className="p-6 bg-white/50 rounded-[2.5rem] border-2 border-[#1f1610]/5 flex justify-between items-center group">
                         <div className="flex-1 min-w-0 mr-4">
                           <p className="font-black text-[#1f1610] uppercase text-xs truncate">{r.title}</p>
                           <p className="text-[10px] font-bold text-[#1f1610]/40 mt-1 uppercase truncate">By @{r.nickname}</p>
                         </div>
                         <Button variant="ghost" size="icon" className="text-red-500 rounded-full shrink-0" onClick={() => handleDeleteDoc('resources', r.id)}><Trash2 className="h-5 w-5" /></Button>
                       </div>
                     ))}
                   </div>
                 </ScrollArea>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <Card className="rounded-[4rem] border-[10px] border-primary/10 bg-mocha-cream p-12 shadow-2xl space-y-10">
                   <div className="space-y-4 text-center">
                      <Download className="h-20 w-20 text-primary mx-auto" />
                      <CardTitle className="text-3xl font-black uppercase italic text-[#1f1610]">Master Backup</CardTitle>
                      <p className="text-xs font-bold text-[#1f1610]/60 uppercase tracking-widest leading-relaxed">Download a complete snapshot of all empire protocols for business continuity.</p>
                   </div>
                   <Button onClick={handleExportBackup} disabled={isBackingUp} className="w-full h-20 rounded-full bg-[#1f1610] text-primary font-black text-xl uppercase shadow-2xl gap-4">
                     {isBackingUp ? <Loader2 className="h-6 w-6 animate-spin" /> : <Database className="h-6 w-6" />}
                     GENERATE ARCHIVE
                   </Button>
                </Card>

                <Card className="rounded-[4rem] border-[10px] border-dashed border-[#1f1610]/20 bg-[#1f1610] p-12 shadow-2xl space-y-10">
                   <div className="space-y-4 text-center">
                      <RefreshCcw className="h-20 w-20 text-primary mx-auto" />
                      <CardTitle className="text-3xl font-black uppercase italic text-primary">Legacy Restore</CardTitle>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest leading-relaxed italic">DANGER: Injecting archive data will overwrite current grid state. Protocol integrity check recommended.</p>
                   </div>
                   <div className="space-y-6">
                      <input type="file" accept=".json" ref={restoreRef} onChange={handleRestoreBackup} className="hidden" />
                      <Button onClick={() => restoreRef.current?.click()} disabled={isRestoring} className="w-full h-20 rounded-full bg-primary text-[#1f1610] font-black text-xl uppercase shadow-2xl gap-4">
                        {isRestoring ? <Loader2 className="h-6 w-6 animate-spin" /> : <ShieldCheck className="h-6 w-6" />}
                        INJECT ARCHIVE
                      </Button>
                   </div>
                </Card>
             </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <Card className="rounded-[4rem] lg:col-span-1 border-8 border-primary/10 bg-mocha-cream p-10 shadow-2xl space-y-8">
                   <CardTitle className="text-2xl font-black uppercase italic text-[#1f1610]">Inquiry Injector</CardTitle>
                   <div className="space-y-4">
                      <Input placeholder="Inquiry Question..." value={faqQ} onChange={e => setFaqQ(e.target.value)} className="h-16 rounded-2xl bg-white text-[#1f1610] font-bold text-sm" />
                      <Textarea placeholder="Protocol Response..." value={faqA} onChange={e => setFaqA(e.target.value)} className="min-h-[120px] rounded-[2rem] bg-white text-[#1f1610] font-bold text-sm" />
                      <Button onClick={() => addDoc(collection(db, 'faqs'), { question: faqQ, answer: faqA }).then(() => { setFaqQ(""); setFaqA(""); toast({ title: "FAQ Injected" }); })} className="w-full h-16 rounded-2xl bg-[#1f1610] text-primary font-black uppercase text-xs">Inject FAQ</Button>
                   </div>
                </Card>
                
                <Card className="lg:col-span-2 rounded-[4rem] border-8 border-primary/10 bg-mocha-cream p-10 shadow-2xl flex flex-col h-[600px]">
                   <CardTitle className="text-2xl font-black uppercase text-[#1f1610] mb-8">Active System FAQs</CardTitle>
                   <ScrollArea className="flex-1 pr-4">
                     <div className="space-y-4">
                       {faqs.map((f: any) => (
                          <div key={f.id} className="p-6 bg-white/50 rounded-[2rem] border-2 border-[#1f1610]/5 flex justify-between items-center group">
                             <div className="flex-1 mr-4">
                               <p className="font-black text-[#1f1610] uppercase text-xs italic line-clamp-1">{f.question}</p>
                               <p className="text-[9px] font-bold text-[#1f1610]/40 mt-1 truncate">{f.answer}</p>
                             </div>
                             <Button variant="ghost" size="icon" className="text-red-500 rounded-full shrink-0" onClick={() => handleDeleteDoc('faqs', f.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                       ))}
                     </div>
                   </ScrollArea>
                </Card>
             </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
