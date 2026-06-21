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
import { useState, useMemo, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { 
  Key, ShieldAlert, Trash2, Award, BookOpen, 
  Newspaper, ShoppingBag, MessageSquare, 
  Plus, Coins, ListChecks, Gift,
  ChevronLeft, ChevronRight, Minus, CircleHelp, Upload, Link as LinkIcon,
  Database, Download, RefreshCcw, ShieldCheck, OctagonAlert, Loader2,
  Users, Zap, Activity, Edit3, Save, X, ArrowUp, ArrowDown, Video, HardDrive, Cloud, TriangleAlert, FileCheck
} from "lucide-react";
import { collection, addDoc, deleteDoc, doc, serverTimestamp, getDocs, setDoc, query, orderBy, updateDoc, where } from 'firebase/firestore';
import { cn } from "@/lib/utils";
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
  const [isSaving, setIsSaving] = useState(false);
  const restoreRef = useRef<HTMLInputElement>(null);
  const assetFileInputRef = useRef<HTMLInputElement>(null);
  const webinFileInputRef = useRef<HTMLInputElement>(null);
  const rewardFileInputRef = useRef<HTMLInputElement>(null);
  const newsFileInputRef = useRef<HTMLInputElement>(null);
  
  // Source Type Toggles
  const [assetSourceType, setAssetSourceType] = useState<'Link' | 'File'>('Link');
  const [webinSourceType, setWebinSourceType] = useState<'Link' | 'File'>('Link');
  const [rewardSourceType, setRewardSourceType] = useState<'Link' | 'File'>('Link');
  const [newsSourceType, setNewsSourceType] = useState<'Link' | 'File'>('Link');

  // Queries
  const productsRef = useMemo(() => collection(db, 'shooppyProducts'), [db]);
  const newsRef = useMemo(() => collection(db, 'newsPosts'), [db]);
  const activityRef = useMemo(() => collection(db, 'activityWall'), [db]);
  const resourcesRef = useMemo(() => collection(db, 'resources'), [db]);
  const tasksRef = useMemo(() => collection(db, 'tasks'), [db]);
  const quizzesRef = useMemo(() => collection(db, 'quizzes'), [db]);
  const usersRef = useMemo(() => collection(db, 'users'), [db]);
  const rewardsRef = useMemo(() => collection(db, 'rewards'), [db]);

  const { data: allProducts = [] } = useCollection(productsRef);
  const { data: allNews = [] } = useCollection(newsRef);
  const { data: allActivity = [] } = useCollection(activityRef);
  const { data: allResources = [] } = useCollection(resourcesRef);
  const { data: allTasks = [] } = useCollection(tasksRef);
  const { data: allQuizzes = [] } = useCollection(quizzesRef);
  const { data: totalUsers = [] } = useCollection(usersRef);
  const { data: allRewards = [] } = useCollection(rewardsRef);

  // Grouping Tasks for Organization
  const groupedTasks = useMemo(() => {
    const groups: Record<number, any[]> = {};
    allTasks.forEach((task: any) => {
      const d = task.day || 1;
      if (!groups[d]) groups[d] = [];
      groups[d].push(task);
    });
    return Object.entries(groups).sort(([a], [b]) => Number(a) - Number(b));
  }, [allTasks]);

  // Sorting
  const shooppyProducts = useMemo(() => [...allProducts].sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0)), [allProducts]);
  const newsPosts = useMemo(() => [...allNews].sort((a: any, b: any) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)), [allNews]);
  const activityWallData = useMemo(() => [...allActivity].sort((a: any, b: any) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)), [allActivity]);
  const webins = useMemo(() => allResources.filter((r: any) => r.type === 'WeBin').sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0)), [allResources]);
  const globalQuizzes = useMemo(() => [...allQuizzes].sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)), [allQuizzes]);
  const globalRewards = useMemo(() => [...allRewards].sort((a: any, b: any) => (a.week || 0) - (b.week || 0)), [allRewards]);

  // Form States
  const [prodTitle, setProdTitle] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodImg, setProdImg] = useState("");
  const [prodFile, setProdFile] = useState(""); 
  const [prodType, setProdType] = useState<'Bundle' | 'Template' | 'eBook'>('eBook');
  const [prodPlacement, setProdPlacement] = useState<'Hub' | 'Marketplace'>('Marketplace');
  const [prodLevel, setProdLevel] = useState(1);
  const [prodPrice, setProdPrice] = useState(0);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [webinTitle, setWebinTitle] = useState("");
  const [webinContent, setWebinContent] = useState("");
  const [editingWebin, setEditingWebin] = useState<any>(null);

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
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

  const [taskDay, setTaskDay] = useState(1);
  const [bulkDraftTasks, setBulkDraftTasks] = useState([{ id: '1', title: "", description: "" }]);
  const [editingTask, setEditingTask] = useState<any>(null);

  const [rewardWeek, setRewardWeek] = useState(1);
  const [rewardTitle, setRewardWeekTitle] = useState("");
  const [rewardDesc, setRewardWeekDesc] = useState("");
  const [rewardFile, setRewardWeekFile] = useState("");

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === ADMIN_SECRET_KEY) {
      setIsAuthorized(true);
      toast({ title: "Identity Verified" });
    } else {
      toast({ title: "Invalid Protocol Key", variant: "destructive" });
    }
  };

  const handleAssetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProdFile(reader.result as string);
      toast({ title: "Protocol File Loaded", description: `${file.name} ready for injection.` });
    };
    reader.readAsDataURL(file);
  };

  const handleWebinFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setWebinContent(reader.result as string);
      toast({ title: "Wedio Asset Loaded", description: `${file.name} ready for sync.` });
    };
    reader.readAsDataURL(file);
  };

  const handleRewardFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setRewardWeekFile(reader.result as string);
      toast({ title: "Treasure Asset Loaded", description: `${file.name} ready for deployment.` });
    };
    reader.readAsDataURL(file);
  };

  const handleNewsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewsImg(reader.result as string);
      toast({ title: "Broadcast Asset Loaded", description: `${file.name} ready for dispatch.` });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = () => {
    if (isSaving || !prodTitle) return;
    setIsSaving(true);
    const data = {
      title: prodTitle,
      description: prodDesc,
      imageUrl: prodImg,
      fileUrl: prodFile, 
      type: prodType,
      placement: prodPlacement,
      requiredLevel: Number(prodLevel),
      price: Number(prodPrice),
      sortOrder: editingProduct ? Number(editingProduct.sortOrder) : shooppyProducts.length
    };
    
    const operation = editingProduct ? 
      updateDoc(doc(db, 'shooppyProducts', editingProduct.id), data) :
      addDoc(collection(db, 'shooppyProducts'), data);

    operation
      .then(() => {
        setEditingProduct(null);
        setProdTitle(""); setProdDesc(""); setProdImg(""); setProdFile(""); setProdLevel(1); setProdPrice(0);
        toast({ title: editingProduct ? "Protocol Updated" : "Strategic Asset Deployed" });
      })
      .catch(async (error: any) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'shooppyProducts', operation: 'write', requestResourceData: data }));
      })
      .finally(() => setIsSaving(false));
  };

  const handleSaveWebin = () => {
    if (isSaving || !webinTitle || !webinContent) {
      if (!webinTitle || !webinContent) toast({ title: "Incomplete Protocol", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    const data = {
      title: webinTitle,
      content: webinContent,
      type: 'WeBin',
      nickname: 'Host',
      userId: user?.uid || 'host-id',
      timestamp: serverTimestamp(),
      sortOrder: editingWebin ? Number(editingWebin.sortOrder) : webins.length
    };

    const operation = editingWebin ?
      updateDoc(doc(db, 'resources', editingWebin.id), { title: webinTitle, content: webinContent }) :
      addDoc(collection(db, 'resources'), data);

    operation
      .then(() => {
        setEditingWebin(null);
        setWebinTitle(""); setWebinContent("");
        toast({ title: editingWebin ? "Portal Synchronized" : "Wedio Portal Deployed" });
      })
      .catch(async (error: any) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'resources', operation: 'write', requestResourceData: data }));
      })
      .finally(() => setIsSaving(false));
  };

  const handleSaveNews = () => {
    if (isSaving || !newsTitle) return;
    setIsSaving(true);
    const data = {
      title: newsTitle,
      content: newsContent,
      imageUrl: newsImg,
      timestamp: serverTimestamp()
    };
    
    addDoc(collection(db, 'newsPosts'), data)
      .then(() => {
        setNewsTitle(""); setNewsContent(""); setNewsImg("");
        toast({ title: "Broadcast Dispatched" });
      })
      .catch(async (error: any) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'newsPosts', operation: 'create', requestResourceData: data }));
      })
      .finally(() => setIsSaving(false));
  };

  const handleSaveReward = () => {
    if (isSaving || !rewardTitle) return;
    setIsSaving(true);
    const data = {
      week: Number(rewardWeek),
      title: rewardTitle,
      description: rewardDesc,
      fileUrl: rewardFile,
      timestamp: serverTimestamp()
    };
    addDoc(collection(db, 'rewards'), data)
      .then(() => {
        setRewardWeekTitle(""); setRewardWeekDesc(""); setRewardWeekFile("");
        toast({ title: "Weekly Treasure Injected" });
      })
      .catch(async (e) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'rewards', operation: 'create', requestResourceData: data }));
      })
      .finally(() => setIsSaving(false));
  };

  const handleSaveQuiz = () => {
    if (isSaving || !quizTitle) return;
    setIsSaving(true);
    const data = { title: quizTitle, questionCount: draftQuestions.length, questions: draftQuestions, createdAt: serverTimestamp() };
    const operation = editingQuizId ? updateDoc(doc(db, 'quizzes', editingQuizId), data) : addDoc(collection(db, 'quizzes'), data);
    operation
      .then(() => { setEditingQuizId(null); setQuizTitle(""); setDraftQuestions([{ id: Math.random().toString(36).substr(2, 9), type: 'multiple', question: "", answer: "", options: ["", "", "", ""] }]); setCurrentQIdx(0); toast({ title: "Quiz Synchronized" }); })
      .catch(async (error: any) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'quizzes', operation: 'write', requestResourceData: data })))
      .finally(() => setIsSaving(false));
  };

  const handleAddQuestionSlot = () => {
    setDraftQuestions([...draftQuestions, { 
      id: Math.random().toString(36).substr(2, 9), 
      type: 'multiple', 
      question: "", 
      answer: "", 
      options: ["", "", "", ""] 
    }]);
    setCurrentQIdx(draftQuestions.length);
  };

  const handleDeleteQuestion = (id: string) => {
    if (draftQuestions.length === 1) return;
    const newQs = draftQuestions.filter(q => q.id !== id);
    setDraftQuestions(newQs);
    setCurrentQIdx(Math.max(0, currentQIdx - 1));
  };

  const handleUpdateQuestion = (index: number, data: Partial<QuizQuestion>) => {
    const newQs = [...draftQuestions];
    newQs[index] = { ...newQs[index], ...data };
    setDraftQuestions(newQs);
  };

  const handleSaveBulkTasks = async () => {
    const tasksToSave = bulkDraftTasks.filter(t => t.title.trim() !== "");
    if (tasksToSave.length === 0 || isSaving) return;
    setIsSaving(true);
    try {
      for (const task of tasksToSave) {
        await addDoc(collection(db, 'tasks'), { 
          day: Number(taskDay), 
          title: task.title, 
          description: task.description, 
          createdAt: serverTimestamp() 
        });
      }
      setBulkDraftTasks([{ id: '1', title: "", description: "" }]);
      toast({ title: "Sovereign Routines Deployed" });
    } catch (e) { toast({ title: "Injection Failure", variant: "destructive" }); }
    finally { setIsSaving(false); }
  };

  const handleUpdateTask = (task: any) => {
    if (isSaving || !task.title) return;
    setIsSaving(true);
    updateDoc(doc(db, 'tasks', task.id), {
      title: task.title,
      description: task.description,
      day: Number(task.day)
    })
    .then(() => {
      setEditingTask(null);
      toast({ title: "Protocol Synchronized" });
    })
    .finally(() => setIsSaving(false));
  };

  const handleDeleteDoc = (coll: string, id: string) => {
    if (isSaving) return;
    deleteDoc(doc(db, coll, id)).then(() => toast({ title: "Data Purged" })).catch(e => {});
  };

  const handleExportBackup = async (type: 'Local' | 'Cloud') => {
    if (isBackingUp) return;
    setIsBackingUp(true);
    try {
      const collections = ['shooppyProducts', 'newsPosts', 'faqs', 'activityWall', 'resources', 'tasks', 'quizzes', 'users', 'rewards'];
      const backupData: any = {
        metadata: { timestamp: new Date().toISOString(), type: type, host: user?.email, version: "2.0.5-Sovereign" },
        payload: {}
      };
      for (const collName of collections) {
        const collRef = collection(db, collName);
        const snapshot = await getDocs(collRef);
        backupData.payload[collName] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      if (type === 'Local') {
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SOVEREIGN_ARCHIVE_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: "Backup Secure" });
      } else {
        await new Promise(r => setTimeout(r, 1500));
        toast({ title: "Cloud Sync Complete" });
      }
    } catch (e) { toast({ title: "Backup Failure", variant: "destructive" }); }
    finally { setIsBackingUp(false); }
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isRestoring) return;
    setIsRestoring(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const fullData = JSON.parse(event.target?.result as string);
        const data = fullData.payload || fullData; 
        for (const collName in data) {
          const items = data[collName];
          for (const item of items) {
            const { id, ...rest } = item;
            setDoc(doc(db, collName, id), rest, { merge: true })
              .catch(async (error) => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `${collName}/${id}`, operation: 'write', requestResourceData: rest }));
              });
          }
        }
        toast({ title: "Grid state re-established" });
      } catch (err) { toast({ title: "Restoration Breach", variant: "destructive" }); }
      finally { setIsRestoring(false); if (restoreRef.current) restoreRef.current.value = ""; }
    };
    reader.readAsText(file);
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
              <span className="text-primary font-black uppercase tracking-widest text-[10px] mb-2">Wedio Portals</span>
              <div className="flex items-center gap-4">
                <Video className="h-8 w-8 text-primary" />
                <span className="text-4xl font-black text-foreground italic tracking-tighter">{webins.length}</span>
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
        <Tabs defaultValue="tasks" className="space-y-12">
          <TabsList className="bg-mocha-cream p-2 rounded-full w-fit shadow-2xl border-4 border-primary/20 overflow-x-auto scrollbar-hide">
            <TabsTrigger value="tasks" className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest text-[#1f1610]">Routines</TabsTrigger>
            <TabsTrigger value="assets" className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest text-[#1f1610]">Shooppy</TabsTrigger>
            <TabsTrigger value="wedio" className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest text-[#1f1610]">Wedio</TabsTrigger>
            <TabsTrigger value="rewards" className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest text-[#1f1610]">Rewards</TabsTrigger>
            <TabsTrigger value="quizzo" className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest text-[#1f1610]">Quizzo</TabsTrigger>
            <TabsTrigger value="dispatch" className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest text-[#1f1610] gap-2"><Newspaper className="h-3.5 w-3.5" /> Dispatch</TabsTrigger>
            <TabsTrigger value="maintenance" className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest text-[#1f1610]">Continuity</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <Card className="rounded-[4rem] border-8 border-primary/10 bg-mocha-cream p-12 md:p-16 shadow-2xl space-y-12">
                   <div className="flex items-center justify-between">
                     <CardTitle className="text-4xl font-black uppercase italic text-[#1f1610]">Routine Injector</CardTitle>
                     <div className="flex items-center gap-6">
                       <Label className="text-[#1f1610] text-xs">HUB DAY</Label>
                       <Input type="number" min={1} max={30} value={taskDay} onChange={e => setTaskDay(Number(e.target.value))} className="w-24 h-16 font-black text-center text-3xl bg-white text-[#1f1610] rounded-2xl" />
                     </div>
                   </div>

                   <div className="space-y-8">
                     {bulkDraftTasks.map((task, idx) => (
                       <div key={task.id} className="p-8 bg-[#1f1610]/5 rounded-[2.5rem] border-2 border-[#1f1610]/10 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                          <div className="md:col-span-1 space-y-2">
                             <Label className="text-[#1f1610] text-[9px]">HEADLINE</Label>
                             <Input placeholder="Routine name..." value={task.title} onChange={e => setBulkDraftTasks(prev => prev.map(t => t.id === task.id ? {...t, title: e.target.value} : t))} className="h-16 bg-white text-[#1f1610] font-black" />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                             <Label className="text-[#1f1610] text-[9px]">INSTRUCTIONS</Label>
                             <div className="flex gap-4">
                               <Input placeholder="Step details..." value={task.description} onChange={e => setBulkDraftTasks(prev => prev.map(t => t.id === task.id ? {...t, description: e.target.value} : t))} className="h-16 bg-white text-[#1f1610] font-bold" />
                               <Button variant="ghost" size="icon" className="h-16 w-16 text-red-500" onClick={() => setBulkDraftTasks(prev => prev.filter(t => t.id !== task.id))} disabled={bulkDraftTasks.length === 1}><X /></Button>
                             </div>
                          </div>
                       </div>
                     ))}
                     <div className="flex gap-6">
                       <Button onClick={() => setBulkDraftTasks([...bulkDraftTasks, { id: Math.random().toString(36), title: "", description: "" }])} variant="outline" className="flex-1 h-20 rounded-full border-4 border-[#1f1610] text-[#1f1610] font-black">ADD SLOT</Button>
                       <Button onClick={handleSaveBulkTasks} className="flex-1 h-20 rounded-full bg-[#1f1610] text-primary font-black" disabled={isSaving}>INJECT PROTOCOLS</Button>
                     </div>
                   </div>
                </Card>

                <div className="space-y-8">
                   <h3 className="text-2xl font-black uppercase italic text-primary">Deployed Routines</h3>
                   <ScrollArea className="h-[750px] pr-4">
                      <div className="space-y-12">
                        {groupedTasks.map(([day, tasks]) => (
                          <div key={day} className="space-y-6">
                            <div className="flex items-center gap-4">
                               <Badge className="bg-primary text-[#1f1610] font-black uppercase px-6 h-8 rounded-full text-[10px] tracking-widest shadow-lg">HUB DAY {day}</Badge>
                               <div className="h-0.5 flex-1 bg-primary/10" />
                            </div>
                            
                            <div className="space-y-4">
                              {tasks.map((task: any) => (
                                <div key={task.id} className="p-8 bg-mocha-cream rounded-[2.5rem] shadow-xl border-4 border-primary/5 group hover:border-primary/20 transition-all">
                                   {editingTask?.id === task.id ? (
                                     <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                           <div className="space-y-2">
                                              <Label className="text-[9px]">TITLE</Label>
                                              <Input value={editingTask.title} onChange={e => setEditingTask({...editingTask, title: e.target.value})} className="h-14 bg-white text-[#1f1610] font-black" />
                                           </div>
                                           <div className="space-y-2">
                                              <Label className="text-[9px]">DAY</Label>
                                              <Input type="number" value={editingTask.day} onChange={e => setEditingTask({...editingTask, day: e.target.value})} className="h-14 bg-white text-[#1f1610] font-black" />
                                           </div>
                                        </div>
                                        <div className="space-y-2">
                                           <Label className="text-[9px]">INSTRUCTIONS</Label>
                                           <Textarea value={editingTask.description} onChange={e => setEditingTask({...editingTask, description: e.target.value})} className="bg-white text-[#1f1610] min-h-[100px]" />
                                        </div>
                                        <div className="flex gap-4">
                                          <Button size="lg" className="flex-1 bg-[#1f1610] text-primary font-black rounded-full" onClick={() => handleUpdateTask(editingTask)}>SAVE CHANGES</Button>
                                          <Button size="lg" variant="ghost" className="rounded-full" onClick={() => setEditingTask(null)}>CANCEL</Button>
                                        </div>
                                     </div>
                                   ) : (
                                     <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-6">
                                           <div className="w-12 h-6 bg-[#1f1610] rounded-full shrink-0" />
                                           <div className="space-y-1">
                                              <h4 className="text-xl font-black text-[#1f1610] uppercase italic tracking-tight">{task.title}</h4>
                                              <p className="text-xs text-[#1f1610]/60 font-bold leading-relaxed">{task.description}</p>
                                           </div>
                                        </div>
                                        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                           <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full text-[#1f1610]/20 hover:text-primary hover:bg-primary/5" onClick={() => setEditingTask(task)}>
                                              <Edit3 className="h-5 w-5" />
                                           </Button>
                                           <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full text-red-500 hover:bg-red-500/5" onClick={() => handleDeleteDoc('tasks', task.id)}>
                                              <Trash2 className="h-5 w-5" />
                                           </Button>
                                        </div>
                                     </div>
                                   )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                   </ScrollArea>
                </div>
             </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <Card className="rounded-[4rem] border-8 border-primary/10 bg-mocha-cream p-12 shadow-2xl space-y-10">
                  <CardTitle className="text-3xl font-black uppercase italic text-[#1f1610]">{editingProduct ? 'Edit Asset' : 'Asset Injector'}</CardTitle>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[#1f1610]">Asset Name</Label>
                        <Input placeholder="Strategy E-book" value={prodTitle} onChange={e => setProdTitle(e.target.value)} className="h-16 font-black bg-white text-[#1f1610]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[#1f1610]">Category</Label>
                        <select className="w-full h-16 bg-white border-4 border-[#1f1610]/10 rounded-2xl px-6 font-black uppercase text-[#1f1610]" value={prodType} onChange={e => setProdType(e.target.value as any)}>
                          <option value="eBook">E-Book</option>
                          <option value="Template">Template</option>
                          <option value="Bundle">Bundle</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                       <Label className="text-[#1f1610]">Source Type</Label>
                       <div className="flex gap-4 p-2 bg-[#1f1610]/5 rounded-2xl border-2 border-[#1f1610]/10">
                          <Button 
                            variant={assetSourceType === 'Link' ? 'default' : 'ghost'} 
                            onClick={() => setAssetSourceType('Link')} 
                            className={cn("flex-1 rounded-xl h-12 font-black", assetSourceType === 'Link' ? "bg-[#1f1610] text-primary" : "text-[#1f1610]")}
                          >LINK</Button>
                          <Button 
                            variant={assetSourceType === 'File' ? 'default' : 'ghost'} 
                            onClick={() => setAssetSourceType('File')} 
                            className={cn("flex-1 rounded-xl h-12 font-black", assetSourceType === 'File' ? "bg-[#1f1610] text-primary" : "text-[#1f1610]")}
                          >UPLOAD</Button>
                       </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#1f1610]">{assetSourceType === 'File' ? 'Upload Asset' : 'Shop/Resource URL'}</Label>
                      <div className="relative">
                        <button 
                          type="button" 
                          className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 hover:opacity-100 transition-opacity z-10"
                          onClick={() => assetFileInputRef.current?.click()}
                        >
                          {assetSourceType === 'File' ? <Upload className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                        </button>
                        <input type="file" ref={assetFileInputRef} className="hidden" onChange={handleAssetFileChange} />
                        <Input 
                          placeholder={assetSourceType === 'File' ? "Click icon to upload..." : "https://..."} 
                          value={prodFile.startsWith('data:') ? 'DATA_PROTOCOL_LOADED' : prodFile}
                          onChange={e => setProdFile(e.target.value)}
                          className="h-16 pl-12 text-xs font-black bg-white text-[#1f1610]" 
                          readOnly={assetSourceType === 'File'}
                          onClick={() => assetSourceType === 'File' && assetFileInputRef.current?.click()}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[#1f1610]">Target Hub</Label>
                        <select className="w-full h-16 bg-white border-4 border-[#1f1610]/10 rounded-2xl px-6 font-black uppercase text-[#1f1610]" value={prodPlacement} onChange={e => setProdPlacement(e.target.value as any)}>
                          <option value="Hub">Root Hub (Free/Points)</option>
                          <option value="Marketplace">Shooppy (External)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[#1f1610]">Cover Image URL</Label>
                        <Input placeholder="https://..." value={prodImg} onChange={e => setProdImg(e.target.value)} className="h-16 bg-white text-[#1f1610]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[#1f1610]">Points Price</Label>
                        <Input type="number" value={prodPrice} onChange={e => setProdPrice(Number(e.target.value))} className="h-16 font-black bg-white text-[#1f1610]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[#1f1610]">Level Req.</Label>
                        <Input type="number" value={prodLevel} onChange={e => setProdLevel(Number(e.target.value))} className="h-16 font-black bg-white text-[#1f1610]" />
                      </div>
                    </div>
                    
                    <Button onClick={handleSaveProduct} className="w-full h-20 rounded-full bg-[#1f1610] text-primary font-black uppercase shadow-2xl" disabled={isSaving}>DEPLOY ASSET</Button>
                  </div>
              </Card>

              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {shooppyProducts.map(p => (
                    <div key={p.id} className="p-6 bg-mocha-cream rounded-3xl border-4 border-primary/10 flex justify-between items-center">
                       <div>
                          <h4 className="font-black text-[#1f1610] uppercase italic">{p.title}</h4>
                          <p className="text-[10px] font-black text-[#1f1610]/40 uppercase tracking-widest">{p.price} PTS • LV {p.requiredLevel}</p>
                       </div>
                       <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteDoc('shooppyProducts', p.id)}><Trash2 /></Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="wedio" className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
               <Card className="rounded-[4rem] border-8 border-primary/10 bg-mocha-cream p-12 shadow-2xl space-y-10">
                  <CardTitle className="text-3xl font-black uppercase italic text-[#1f1610]">Wedio Injector</CardTitle>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[#1f1610]">Portal Title</Label>
                      <Input placeholder="Strategy Masterclass" value={webinTitle} onChange={e => setWebinTitle(e.target.value)} className="h-16 font-black bg-white text-[#1f1610]" />
                    </div>
                    
                    <div className="flex flex-col gap-4">
                       <Label className="text-[#1f1610]">Portal Source</Label>
                       <div className="flex gap-4 p-2 bg-[#1f1610]/5 rounded-2xl border-2 border-[#1f1610]/10">
                          <Button 
                            variant={webinSourceType === 'Link' ? 'default' : 'ghost'} 
                            onClick={() => setWebinSourceType('Link')} 
                            className={cn("flex-1 rounded-xl h-12 font-black", webinSourceType === 'Link' ? "bg-[#1f1610] text-primary" : "text-[#1f1610]")}
                          >LINK</Button>
                          <Button 
                            variant={webinSourceType === 'File' ? 'default' : 'ghost'} 
                            onClick={() => setWebinSourceType('File')} 
                            className={cn("flex-1 rounded-xl h-12 font-black", webinSourceType === 'File' ? "bg-[#1f1610] text-primary" : "text-[#1f1610]")}
                          >UPLOAD</Button>
                       </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#1f1610]">{webinSourceType === 'File' ? 'Upload Video' : 'Portal / YouTube URL'}</Label>
                      <div className="relative">
                        <button type="button" className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" onClick={() => webinFileInputRef.current?.click()}>
                          {webinSourceType === 'File' ? <Upload className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                        </button>
                        <input type="file" ref={webinFileInputRef} className="hidden" accept="video/*" onChange={handleWebinFileChange} />
                        <Input 
                          placeholder={webinSourceType === 'File' ? "Click icon to upload video..." : "https://..."} 
                          value={webinContent.startsWith('data:') ? 'DATA_PROTOCOL_LOADED' : webinContent}
                          onChange={e => setWebinContent(e.target.value)}
                          className="h-16 pl-12 bg-white text-[#1f1610]" 
                          readOnly={webinSourceType === 'File'}
                          onClick={() => webinSourceType === 'File' && webinFileInputRef.current?.click()}
                        />
                      </div>
                    </div>

                    <Button onClick={handleSaveWebin} className="w-full h-20 rounded-full bg-[#1f1610] text-primary font-black uppercase shadow-2xl" disabled={isSaving}>INJECT PORTAL</Button>
                  </div>
               </Card>

               <ScrollArea className="h-[600px]">
                 <div className="space-y-4">
                   {webins.map(w => (
                     <div key={w.id} className="p-6 bg-mocha-cream rounded-3xl border-4 border-primary/10 flex justify-between items-center">
                        <div>
                          <h4 className="font-black text-[#1f1610] uppercase italic">{w.title}</h4>
                          <p className="text-[9px] font-black text-[#1f1610]/40 uppercase tracking-widest truncate max-w-[200px]">{w.content}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteDoc('resources', w.id)}><Trash2 /></Button>
                     </div>
                   ))}
                 </div>
               </ScrollArea>
             </div>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
               <Card className="rounded-[4rem] border-8 border-primary/10 bg-mocha-cream p-12 shadow-2xl space-y-10">
                  <CardTitle className="text-3xl font-black uppercase italic text-[#1f1610]">Treasure Injector</CardTitle>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[#1f1610]">Target Milestone Week</Label>
                      <select className="w-full h-16 bg-white border-4 border-[#1f1610]/10 rounded-2xl px-6 font-black uppercase text-[#1f1610]" value={rewardWeek} onChange={e => setRewardWeek(Number(e.target.value))}>
                        <option value={1}>Week 1</option>
                        <option value={2}>Week 2</option>
                        <option value={3}>Week 3</option>
                        <option value={4}>Week 4</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#1f1610]">Treasure Title</Label>
                      <Input placeholder="Strategy Kit" value={rewardTitle} onChange={e => setRewardWeekTitle(e.target.value)} className="h-16 font-black bg-white text-[#1f1610]" />
                    </div>

                    <div className="flex flex-col gap-4">
                       <Label className="text-[#1f1610]">Treasure Source</Label>
                       <div className="flex gap-4 p-2 bg-[#1f1610]/5 rounded-2xl border-2 border-[#1f1610]/10">
                          <Button 
                            variant={rewardSourceType === 'Link' ? 'default' : 'ghost'} 
                            onClick={() => setRewardSourceType('Link')} 
                            className={cn("flex-1 rounded-xl h-12 font-black", rewardSourceType === 'Link' ? "bg-[#1f1610] text-primary" : "text-[#1f1610]")}
                          >LINK</Button>
                          <Button 
                            variant={rewardSourceType === 'File' ? 'default' : 'ghost'} 
                            onClick={() => setRewardSourceType('File')} 
                            className={cn("flex-1 rounded-xl h-12 font-black", rewardSourceType === 'File' ? "bg-[#1f1610] text-primary" : "text-[#1f1610]")}
                          >UPLOAD</Button>
                       </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#1f1610]">{rewardSourceType === 'File' ? 'Upload Asset' : 'Treasure Link'}</Label>
                      <div className="relative">
                        <button type="button" className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" onClick={() => rewardFileInputRef.current?.click()}>
                          {rewardSourceType === 'File' ? <Upload className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                        </button>
                        <input type="file" ref={rewardFileInputRef} className="hidden" onChange={handleRewardFileChange} />
                        <Input 
                          placeholder={rewardSourceType === 'File' ? "Click icon to upload asset..." : "https://..."} 
                          value={rewardFile.startsWith('data:') ? 'DATA_PROTOCOL_LOADED' : rewardFile}
                          onChange={e => setRewardWeekFile(e.target.value)}
                          className="h-16 pl-12 bg-white text-[#1f1610]" 
                          readOnly={rewardSourceType === 'File'}
                          onClick={() => rewardSourceType === 'File' && rewardFileInputRef.current?.click()}
                        />
                      </div>
                    </div>
                    <Button onClick={handleSaveReward} className="w-full h-20 rounded-full bg-[#1f1610] text-primary font-black uppercase shadow-2xl" disabled={isSaving}>INJECT TREASURE</Button>
                  </div>
               </Card>

               <ScrollArea className="h-[600px]">
                 <div className="space-y-4">
                   {globalRewards.map(r => (
                     <div key={r.id} className="p-6 bg-mocha-cream rounded-3xl border-4 border-primary/10 flex justify-between items-center">
                        <div>
                          <h4 className="font-black text-[#1f1610] uppercase italic">{r.title}</h4>
                          <p className="text-[10px] font-black text-[#1f1610]/40 uppercase tracking-widest">W{r.week} Milestone</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteDoc('rewards', r.id)}><Trash2 /></Button>
                     </div>
                   ))}
                 </div>
               </ScrollArea>
             </div>
          </TabsContent>

          <TabsContent value="quizzo" className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
             <Card className="rounded-[4rem] border-8 border-primary/10 bg-mocha-cream p-12 md:p-16 shadow-2xl space-y-12">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <BookOpen className="h-10 w-10 text-[#1f1610]" />
                    <h2 className="text-4xl font-black uppercase italic text-[#1f1610] tracking-tighter">QUIZZO PROTOCOL ARCHITECT</h2>
                  </div>
                  <Button 
                    onClick={handleSaveQuiz} 
                    disabled={isSaving}
                    className="rounded-full h-16 px-12 bg-[#1f1610] text-primary font-black text-lg uppercase shadow-2xl"
                  >
                    {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : 'DEPLOY QUIZ'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                  <div className="lg:col-span-2 space-y-12">
                    <div className="space-y-4">
                      <Label className="text-[#1f1610] text-[10px] font-black uppercase tracking-[0.3em]">PROTOCOL TITLE</Label>
                      <Input 
                        placeholder="Verification Level 01" 
                        value={quizTitle} 
                        onChange={e => setQuizTitle(e.target.value)} 
                        className="h-20 bg-[#1f1610]/5 border-4 border-[#1f1610]/10 rounded-[1.5rem] px-8 text-2xl font-black text-[#1f1610]" 
                      />
                    </div>

                    {/* Question Constructor Card */}
                    <div className="bg-[#1f1610]/5 p-12 rounded-[3.5rem] border-4 border-[#1f1610]/5 space-y-10 relative">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#1f1610] rounded-xl flex items-center justify-center text-primary font-black">{currentQIdx + 1}</div>
                            <span className="text-[#1f1610] font-black uppercase text-xs tracking-widest">CONSTRUCTING QUESTION</span>
                         </div>
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:bg-red-500/10" 
                            onClick={() => handleDeleteQuestion(draftQuestions[currentQIdx].id)}
                            disabled={draftQuestions.length === 1}
                         >
                           <Trash2 className="h-6 w-6" />
                         </Button>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <select 
                            className="h-16 bg-[#1f1610] border-none rounded-2xl px-6 text-primary font-black uppercase text-[10px] tracking-widest"
                            value={draftQuestions[currentQIdx].type}
                            onChange={e => handleUpdateQuestion(currentQIdx, { type: e.target.value as any })}
                          >
                            <option value="multiple">MULTIPLE CHOICE</option>
                            <option value="boolean">TRUE / FALSE</option>
                            <option value="id">PROTOCOL ID</option>
                          </select>
                          <Input 
                            placeholder="Question text..." 
                            className="md:col-span-2 h-16 bg-white border-4 border-[#1f1610]/10 rounded-2xl px-6 font-bold text-[#1f1610]"
                            value={draftQuestions[currentQIdx].question}
                            onChange={e => handleUpdateQuestion(currentQIdx, { question: e.target.value })}
                          />
                       </div>

                       {draftQuestions[currentQIdx].type === 'multiple' && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {draftQuestions[currentQIdx].options?.map((opt, optIdx) => (
                              <div key={optIdx} className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-[#1f1610]/20 text-xs">{optIdx + 1}</span>
                                <Input 
                                  placeholder={`Option ${optIdx + 1}`} 
                                  className="h-16 pl-12 bg-white border-4 border-[#1f1610]/10 rounded-2xl font-bold text-[#1f1610]"
                                  value={opt}
                                  onChange={e => {
                                    const newOpts = [...(draftQuestions[currentQIdx].options || [])];
                                    newOpts[optIdx] = e.target.value;
                                    handleUpdateQuestion(currentQIdx, { options: newOpts });
                                  }}
                                />
                              </div>
                            ))}
                         </div>
                       )}

                       <div className="space-y-4">
                          <Label className="text-[#1f1610] text-[10px]">CORRECT STRATEGIC RESPONSE</Label>
                          <select 
                            className="w-full h-16 bg-[#1f1610] border-none rounded-2xl px-8 text-primary font-black uppercase text-sm tracking-widest"
                            value={draftQuestions[currentQIdx].answer}
                            onChange={e => handleUpdateQuestion(currentQIdx, { answer: e.target.value })}
                          >
                            <option value="">SELECT CORRECT ANSWER</option>
                            {draftQuestions[currentQIdx].type === 'multiple' ? (
                              draftQuestions[currentQIdx].options?.map((opt, idx) => opt && <option key={idx} value={opt}>{opt}</option>)
                            ) : draftQuestions[currentQIdx].type === 'boolean' ? (
                              <>
                                <option value="True">True</option>
                                <option value="False">False</option>
                              </>
                            ) : (
                              <option value={draftQuestions[currentQIdx].answer}>{draftQuestions[currentQIdx].answer || 'Custom ID (Manual entry)'}</option>
                            )}
                          </select>
                          {draftQuestions[currentQIdx].type === 'id' && (
                            <Input 
                              placeholder="Enter correct ID string..." 
                              className="h-16 bg-white border-4 border-[#1f1610]/10 rounded-2xl px-6 font-black text-[#1f1610]"
                              value={draftQuestions[currentQIdx].answer}
                              onChange={e => handleUpdateQuestion(currentQIdx, { answer: e.target.value })}
                            />
                          )}
                       </div>
                    </div>
                  </div>

                  <div className="space-y-12">
                    <div className="space-y-4">
                       <Label className="text-[#1f1610] text-[10px]">PROTOCOL LAYOUT ({draftQuestions.length})</Label>
                       <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 scrollbar-hide">
                         {draftQuestions.map((q, idx) => (
                           <button 
                             key={q.id} 
                             onClick={() => setCurrentQIdx(idx)}
                             className={cn(
                               "w-full p-6 rounded-2xl border-4 transition-all flex items-center justify-between group",
                               idx === currentQIdx ? "bg-[#1f1610] border-primary text-primary shadow-xl" : "bg-white border-[#1f1610]/10 text-[#1f1610]/40"
                             )}
                           >
                             <span className="font-black text-xs uppercase tracking-tighter truncate max-w-[150px]">
                               {q.question || `UNTITLED SLOT ${idx + 1}`}
                             </span>
                             <ChevronRight className={cn("h-4 w-4", idx === currentQIdx ? "text-primary" : "text-[#1f1610]/10")} />
                           </button>
                         ))}
                       </div>
                    </div>

                    <Button 
                      onClick={handleAddQuestionSlot} 
                      className="w-full h-20 rounded-[1.5rem] bg-primary text-[#1f1610] font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-all"
                    >
                      + ADD PROTOCOL SLOT
                    </Button>
                  </div>
                </div>
             </Card>

             <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {globalQuizzes.map(q => (
                    <Card key={q.id} className="p-8 bg-mocha-cream rounded-[3rem] border-4 border-primary/10 flex justify-between items-center group">
                       <div className="space-y-1">
                          <h4 className="font-black text-[#1f1610] uppercase italic tracking-tight">{q.title}</h4>
                          <p className="text-[10px] font-black text-[#1f1610]/40 uppercase tracking-widest">{q.questionCount} PROTOCOLS</p>
                       </div>
                       <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteDoc('quizzes', q.id)}><Trash2 /></Button>
                    </Card>
                  ))}
                </div>
             </ScrollArea>
          </TabsContent>

          <TabsContent value="dispatch" className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <Card className="rounded-[4rem] border-8 border-primary/10 bg-mocha-cream p-12 shadow-2xl space-y-10">
                <div className="flex items-center gap-6">
                   <Newspaper className="h-10 w-10 text-[#1f1610]" />
                   <CardTitle className="text-3xl font-black uppercase italic text-[#1f1610]">Broadcast Dispatcher</CardTitle>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[#1f1610]">Broadcast Title</Label>
                    <Input placeholder="Important Update" value={newsTitle} onChange={e => setNewsTitle(e.target.value)} className="h-16 font-black bg-white text-[#1f1610]" />
                  </div>

                  <div className="flex flex-col gap-4">
                    <Label className="text-[#1f1610]">Cover Image Source</Label>
                    <div className="flex gap-4 p-2 bg-[#1f1610]/5 rounded-2xl border-2 border-[#1f1610]/10">
                      <Button 
                        variant={newsSourceType === 'Link' ? 'default' : 'ghost'} 
                        onClick={() => setNewsSourceType('Link')} 
                        className={cn("flex-1 rounded-xl h-12 font-black", newsSourceType === 'Link' ? "bg-[#1f1610] text-primary" : "text-[#1f1610]")}
                      >LINK</Button>
                      <Button 
                        variant={newsSourceType === 'File' ? 'default' : 'ghost'} 
                        onClick={() => setNewsSourceType('File')} 
                        className={cn("flex-1 rounded-xl h-12 font-black", newsSourceType === 'File' ? "bg-[#1f1610] text-primary" : "text-[#1f1610]")}
                      >UPLOAD</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#1f1610]">{newsSourceType === 'File' ? 'Upload Cover Image' : 'Cover Image URL'}</Label>
                    <div className="relative">
                      <button type="button" className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" onClick={() => newsFileInputRef.current?.click()}>
                        {newsSourceType === 'File' ? <Upload className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                      </button>
                      <input type="file" ref={newsFileInputRef} className="hidden" accept="image/*" onChange={handleNewsFileChange} />
                      <Input 
                        placeholder={newsSourceType === 'File' ? "Click icon to upload image..." : "https://..."} 
                        value={newsImg.startsWith('data:') ? 'DATA_PROTOCOL_LOADED' : newsImg}
                        onChange={e => setNewsImg(e.target.value)}
                        className="h-16 pl-12 bg-white text-[#1f1610]" 
                        readOnly={newsSourceType === 'File'}
                        onClick={() => newsSourceType === 'File' && newsFileInputRef.current?.click()}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#1f1610]">Broadcast Content</Label>
                    <Textarea placeholder="Share details with the collective..." value={newsContent} onChange={e => setNewsContent(e.target.value)} className="min-h-[200px] bg-white text-[#1f1610] font-bold" />
                  </div>
                  <Button onClick={handleSaveNews} className="w-full h-20 rounded-full bg-[#1f1610] text-primary font-black uppercase shadow-2xl" disabled={isSaving}>DISPATCH BROADCAST</Button>
                </div>
              </Card>

              <div className="space-y-12">
                 <div className="space-y-4">
                    <h3 className="text-2xl font-black uppercase italic text-primary">Deployed Broadcasts</h3>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {newsPosts.map(post => (
                          <div key={post.id} className="p-6 bg-mocha-cream rounded-3xl border-4 border-primary/10 flex justify-between items-center group">
                            <div className="flex gap-4 items-center">
                               {post.imageUrl && <img src={post.imageUrl} className="h-12 w-12 rounded-xl object-cover border-2 border-[#1f1610]/10" alt="" />}
                               <div>
                                  <h4 className="font-black text-[#1f1610] uppercase italic leading-none">{post.title}</h4>
                                  <p className="text-[9px] font-black text-[#1f1610]/40 uppercase tracking-widest mt-1">DISPATCHED: {post.timestamp?.toDate ? post.timestamp.toDate().toLocaleDateString() : 'RECENT'}</p>
                               </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteDoc('newsPosts', post.id)}><Trash2 /></Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-2xl font-black uppercase italic text-primary">Live Activity Moderation</h3>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {activityWallData.map(post => (
                          <div key={post.id} className="p-6 bg-mocha-cream rounded-3xl border-4 border-primary/10 flex justify-between items-center">
                            <div>
                              <h4 className="font-black text-[#1f1610] uppercase italic">@{post.nickname}</h4>
                              <p className="text-[10px] font-black text-[#1f1610]/40 uppercase tracking-widest line-clamp-1">{post.description}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteDoc('activityWall', post.id)}><Trash2 /></Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                 </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-12">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <Card className="rounded-[3rem] border-8 border-primary/10 bg-mocha-cream p-10 shadow-2xl text-center space-y-8">
                   <div className="w-16 h-16 bg-[#1f1610] rounded-2xl flex items-center justify-center mx-auto"><HardDrive className="h-8 w-8 text-primary" /></div>
                   <h3 className="text-2xl font-black uppercase italic text-[#1f1610]">In-System Archive</h3>
                   <Button onClick={() => handleExportBackup('Local')} disabled={isBackingUp} className="w-full h-16 rounded-full bg-[#1f1610] text-primary font-black uppercase text-xs">GENERATE ARCHIVE</Button>
                </Card>
                <Card className="rounded-[3rem] border-8 border-primary/10 bg-mocha-cream p-10 shadow-2xl text-center space-y-8">
                   <div className="w-16 h-16 bg-[#1f1610] rounded-2xl flex items-center justify-center mx-auto"><Cloud className="h-8 w-8 text-primary" /></div>
                   <h3 className="text-2xl font-black uppercase italic text-[#1f1610]">Cloud Sync</h3>
                   <Button onClick={() => handleExportBackup('Cloud')} disabled={isBackingUp} className="w-full h-16 rounded-full bg-[#1f1610] text-primary font-black uppercase text-xs">DISPATCH TO CLOUD</Button>
                </Card>
                <Card className="rounded-[3rem] border-8 border-dashed border-[#1f1610]/20 bg-[#1f1610] p-10 shadow-2xl text-center space-y-8">
                   <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto"><OctagonAlert className="h-8 w-8 text-primary" /></div>
                   <h3 className="text-2xl font-black uppercase italic text-primary">Inject Archive</h3>
                   <input type="file" accept=".json" ref={restoreRef} onChange={handleRestoreBackup} className="hidden" />
                   <Button onClick={() => restoreRef.current?.click()} disabled={isRestoring} className="w-full h-16 rounded-full bg-primary text-[#1f1610] font-black uppercase text-xs">INJECT ARCHIVE</Button>
                </Card>
             </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
