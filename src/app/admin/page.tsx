"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useState, useMemo, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { 
  Key, ShieldAlert, Trash2, Award, BookOpen, 
  Newspaper, ShoppingBag, MessageSquare, 
  Plus, Coins, ListChecks,
  ChevronLeft, ChevronRight, Minus, HelpCircle, Upload, Link as LinkIcon,
  Database, Download, RefreshCcw, ShieldCheck, AlertOctagon, Loader2
} from "lucide-react";
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, getDocs, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

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
      toast({ title: "Master Backup Generated", description: "All strategic protocols archived for business continuity." });
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
        toast({ title: "Restoration Initiated", description: "Re-establishing sovereign infrastructure..." });
        
        for (const collName in data) {
          const items = data[collName];
          for (const item of items) {
            const { id, ...rest } = item;
            await setDoc(doc(db, collName, id), rest, { merge: true });
          }
        }
        toast({ title: "Continuity Protocol Successful", description: "Grid fully re-established from legacy data." });
      } catch (err) {
        toast({ title: "Restoration Breach", variant: "destructive" });
      } finally {
        setIsRestoring(false);
        if (restoreRef.current) restoreRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleAssetFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProdFile(reader.result as string);
      reader.readAsDataURL(file);
      toast({ title: "Protocol File Loaded" });
    }
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

    const collRef = collection(db, 'shooppyProducts');
    addDoc(collRef, data).catch(async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: collRef.path,
        operation: 'create',
        requestResourceData: data,
      }));
    });
    toast({ title: "Strategic Asset Deployed" });
    
    setProdTitle(""); setProdDesc(""); setProdImg(""); setProdFile(""); setProdLevel(1); setProdPrice(0); setProdPlacement('Marketplace');
  };

  const handleDispatchBroadcast = () => {
    const data = {
      title: newsTitle,
      content: newsContent,
      imageUrl: newsImg,
      timestamp: serverTimestamp()
    };
    const collRef = collection(db, 'newsPosts');
    addDoc(collRef, data).catch(async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: collRef.path,
        operation: 'create',
        requestResourceData: data,
      }));
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
    
    if (field === 'type') {
      if (value === 'boolean') {
        newDrafts[currentQIdx].options = ["True", "False"];
      } else if (value === 'multiple') {
        newDrafts[currentQIdx].options = ["", "", "", ""];
      } else {
        newDrafts[currentQIdx].options = undefined;
      }
      newDrafts[currentQIdx].answer = "";
    }
    
    setDraftQuestions(newDrafts);
  };

  const updateOption = (optIdx: number, value: string) => {
    const newDrafts = [...draftQuestions];
    const currentOptions = [...(newDrafts[currentQIdx].options || ["", "", "", ""])];
    const oldVal = currentOptions[optIdx];
    currentOptions[optIdx] = value;
    newDrafts[currentQIdx].options = currentOptions;
    
    if (newDrafts[currentQIdx].answer === oldVal) {
      newDrafts[currentQIdx].answer = value;
    }
    
    setDraftQuestions(newDrafts);
  };

  const handleSaveQuiz = () => {
    if (!quizTitle || draftQuestions.some(q => !q.question || !q.answer)) {
      toast({ title: "Incomplete Protocol", description: "Ensure all questions and answers are defined.", variant: "destructive" });
      return;
    }
    const data = {
      title: quizTitle,
      questionCount: draftQuestions.length,
      questions: draftQuestions,
      createdAt: serverTimestamp()
    };
    const collRef = collection(db, 'quizzes');
    addDoc(collRef, data).catch(async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: collRef.path,
        operation: 'create',
        requestResourceData: data,
      }));
    });
    setQuizTitle(""); 
    setDraftQuestions([{ id: Math.random().toString(36).substr(2, 9), type: 'multiple', question: "", answer: "", options: ["", "", "", ""] }]);
    setCurrentQIdx(0);
    toast({ title: "Quiz Protocol Deployed" });
  };

  const handleSaveTask = () => {
    if (!taskTitle || !taskDesc) return;
    const data = {
      day: taskDay,
      title: taskTitle,
      description: taskDesc
    };
    const collRef = collection(db, 'tasks');
    addDoc(collRef, data).catch(async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: collRef.path,
        operation: 'create',
        requestResourceData: data,
      }));
    });
    setTaskTitle(""); setTaskDesc("");
    toast({ title: "Daily Protocol Updated" });
  };

  const handleDeleteDoc = (coll: string, id: string) => {
    const docRef = doc(db, coll, id);
    deleteDoc(docRef).catch(async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      }));
    });
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
            <TabsTrigger value="maintenance" className="rounded-full px-10 h-14 text-[10px] font-black uppercase tracking-widest text-[#1f1610]">Maintenance</TabsTrigger>
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
                          <Label className="text-[#1f1610]">Placement Hub</Label>
                          <select className="w-full h-18 bg-white border-4 border-[#1f1610]/10 rounded-2xl px-8 font-black uppercase text-sm text-[#1f1610]" value={prodPlacement} onChange={e => setProdPlacement(e.target.value as any)}>
                              <option value="Hub">Root Hub (Points/Level)</option>
                              <option value="Marketplace">Shooppy (External Shop)</option>
                          </select>
                        </div>
                      </div>
                   </div>
                   <div className="space-y-8">
                      <div className="space-y-3">
                        <Label className="text-[#1f1610]">
                          {prodPlacement === 'Hub' ? 'Digital Asset File (Import)' : 'Official Shop URL'}
                        </Label>
                        {prodPlacement === 'Hub' ? (
                          <div className="relative">
                            <Upload className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-[#1f1610]/40" />
                            <Input 
                              type="file" 
                              onChange={handleAssetFileImport} 
                              className="h-18 pl-16 pt-5 font-black text-xs bg-white text-[#1f1610] rounded-2xl border-4 border-[#1f1610]/10" 
                            />
                          </div>
                        ) : (
                          <div className="relative">
                            <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-[#1f1610]/40" />
                            <Input 
                              placeholder="https://official-shop.com/product" 
                              value={prodFile} 
                              onChange={e => setProdFile(e.target.value)} 
                              className="h-18 pl-16 font-black text-sm bg-white text-[#1f1610] rounded-2xl border-4 border-[#1f1610]/10" 
                            />
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-[#1f1610]">Level Req.</Label>
                          <Input type="number" min={1} value={prodLevel} onChange={e => setProdLevel(Number(e.target.value))} className="h-18 font-black text-3xl text-center bg-white text-[#1f1610]" />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[#1f1610]">Points Price</Label>
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
                           <Label className="text-[#1f1610]">Correct Answer Selection</Label>
                           {currentDraftQ.type === 'id' ? (
                             <Input 
                               placeholder="Correct Code" 
                               value={currentDraftQ.answer} 
                               onChange={e => updateCurrentQ('answer', e.target.value)} 
                               className="h-18 bg-[#3d332d] border-4 border-[#FFD700]/30 text-white font-bold" 
                             />
                           ) : (
                             <select 
                               className="w-full h-18 bg-[#3d332d] border-4 border-[#FFD700]/30 rounded-2xl px-6 font-black uppercase text-white"
                               value={currentDraftQ.answer}
                               onChange={e => updateCurrentQ('answer', e.target.value)}
                             >
                               <option value="">Select Correct Strategic Response</option>
                               {(currentDraftQ.type === 'multiple' ? (currentDraftQ.options || ["", "", "", ""]) : ["True", "False"])?.map((opt, i) => (
                                 opt ? <option key={i} value={opt}>{opt}</option> : null
                               ))}
                             </select>
                           )}
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

          <TabsContent value="maintenance" className="space-y-12">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <Card className="rounded-[4rem] border-[10px] border-[#FFD700]/10 bg-mocha-cream p-12 shadow-2xl space-y-10 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Database className="h-32 w-32 text-[#1f1610]" />
                   </div>
                   <div className="space-y-4">
                      <CardTitle className="text-4xl font-black uppercase flex items-center gap-5 italic text-[#1f1610]"><Download className="h-10 w-10 text-[#FFD700]" /> Backup Hub</CardTitle>
                      <p className="text-sm font-bold text-[#1f1610]/60 leading-relaxed">Execute a master protocol archive. This includes all strategist profiles, assets, news, and shared knowledge to ensure absolute business continuity.</p>
                   </div>
                   <Button 
                    onClick={handleExportBackup} 
                    disabled={isBackingUp}
                    className="w-full h-24 rounded-full bg-[#1f1610] text-[#FFD700] font-black text-2xl uppercase shadow-2xl hover:scale-[1.02] active:scale-95 transition-all gap-4"
                   >
                     {isBackingUp ? <Loader2 className="h-8 w-8 animate-spin" /> : <Database className="h-8 w-8" />}
                     GENERATE MASTER ARCHIVE
                   </Button>
                </Card>

                <Card className="rounded-[4rem] border-[10px] border-primary/20 bg-[#1f1610] p-12 shadow-2xl space-y-10 relative overflow-hidden border-dashed">
                   <div className="space-y-4">
                      <CardTitle className="text-4xl font-black uppercase flex items-center gap-5 italic text-[#FFD700]"><RefreshCcw className="h-10 w-10" /> Recovery Protocol</CardTitle>
                      <p className="text-sm font-bold text-[#fdfaf6]/40 leading-relaxed uppercase tracking-widest">DANGER: Injecting legacy data will synchronize existing records with archive values. Ensure file integrity before execution.</p>
                   </div>
                   <div className="space-y-6">
                      <input 
                        type="file" 
                        accept=".json" 
                        ref={restoreRef}
                        onChange={handleRestoreBackup} 
                        className="hidden" 
                      />
                      <Button 
                        onClick={() => restoreRef.current?.click()}
                        disabled={isRestoring}
                        className="w-full h-24 rounded-full bg-[#FFD700] text-[#1f1610] font-black text-2xl uppercase shadow-2xl hover:bg-white transition-all gap-4"
                      >
                        {isRestoring ? <Loader2 className="h-8 w-8 animate-spin" /> : <ShieldCheck className="h-8 w-8" />}
                        INJECT LEGACY ARCHIVE
                      </Button>
                      <div className="flex items-center gap-4 px-6 text-red-500/60 font-black uppercase text-[10px] tracking-[0.3em]">
                        <AlertOctagon className="h-4 w-4" />
                        Awaiting Recovery Token Initialization
                      </div>
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
