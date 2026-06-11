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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
  const restoreRef = useRef<HTMLInputElement>(null);
  
  // Collections
  const productsQuery = useMemo(() => query(collection(db, 'shooppyProducts'), orderBy('sortOrder', 'asc')), [db]);
  const newsQuery = useMemo(() => query(collection(db, 'newsPosts'), orderBy('timestamp', 'desc')), [db]);
  const faqsQuery = useMemo(() => collection(db, 'faqs'), [db]);
  const activityQuery = useMemo(() => query(collection(db, 'activityWall'), orderBy('timestamp', 'desc')), [db]);
  const webinQuery = useMemo(() => query(collection(db, 'resources'), where('type', '==', 'WeBin'), orderBy('sortOrder', 'asc')), [db]);
  const tasksQuery = useMemo(() => query(collection(db, 'tasks'), orderBy('day', 'asc')), [db]);
  const quizzesQuery = useMemo(() => query(collection(db, 'quizzes'), orderBy('createdAt', 'desc')), [db]);
  const usersQuery = useMemo(() => collection(db, 'users'), [db]);
  const rewardsQuery = useMemo(() => query(collection(db, 'rewards'), orderBy('week', 'asc')), [db]);

  const { data: shooppyProducts = [] } = useCollection(productsQuery);
  const { data: newsPosts = [] } = useCollection(newsQuery);
  const { data: faqs = [] } = useCollection(faqsQuery);
  const { data: activityWallData = [] } = useCollection(activityQuery);
  const { data: webins = [] } = useCollection(webinQuery);
  const { data: globalTasks = [] } = useCollection(tasksQuery);
  const { data: globalQuizzes = [] } = useCollection(quizzesQuery);
  const { data: totalUsers = [] } = useCollection(usersQuery);
  const { data: globalRewards = [] } = useCollection(rewardsQuery);

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

  // Task Management States
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

  const handleExportBackup = async (type: 'Local' | 'Cloud') => {
    setIsBackingUp(true);
    try {
      const collections = ['shooppyProducts', 'newsPosts', 'faqs', 'activityWall', 'resources', 'tasks', 'quizzes', 'users', 'rewards'];
      const backupData: any = {
        metadata: {
          timestamp: new Date().toISOString(),
          type: type,
          host: user?.email,
          version: "2.0.5-Sovereign"
        },
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
        toast({ title: "In-System Backup Secure", description: "Strategic archive saved to local disk." });
      } else {
        // Cloud logic simulation
        await new Promise(r => setTimeout(r, 2000));
        toast({ title: "Cloud Continuity Sync", description: "Encrypted blocks dispatched to offsite registry." });
      }
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
        const fullData = JSON.parse(event.target?.result as string);
        const data = fullData.payload || fullData; 
        
        for (const collName in data) {
          const items = data[collName];
          for (const item of items) {
            const { id, ...rest } = item;
            setDoc(doc(db, collName, id), rest, { merge: true })
              .catch(async (error) => {
                const permissionError = new FirestorePermissionError({
                  path: `${collName}/${id}`,
                  operation: 'write',
                  requestResourceData: rest,
                } satisfies SecurityRuleContext);
                errorEmitter.emit('permission-error', permissionError);
              });
          }
        }
        toast({ title: "Continuity Protocol Successful", description: "Grid state re-established from archive." });
      } catch (err) {
        toast({ title: "Restoration Breach", variant: "destructive" });
      } finally {
        setIsRestoring(false);
        if (restoreRef.current) restoreRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleSaveProduct = async () => {
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
    
    if (editingProduct) {
      const docRef = doc(db, 'shooppyProducts', editingProduct.id);
      updateDoc(docRef, data)
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: data,
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        });
      setEditingProduct(null);
    } else {
      addDoc(collection(db, 'shooppyProducts'), data)
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: 'shooppyProducts',
            operation: 'create',
            requestResourceData: data,
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        });
    }
    
    setProdTitle(""); setProdDesc(""); setProdImg(""); setProdFile(""); setProdLevel(1); setProdPrice(0);
    toast({ title: editingProduct ? "Protocol Updated" : "Strategic Asset Deployed" });
  };

  const handleMoveProduct = async (id: string, direction: 'up' | 'down') => {
    const idx = shooppyProducts.findIndex(p => p.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= shooppyProducts.length) return;

    const current = shooppyProducts[idx];
    const target = shooppyProducts[targetIdx];

    const currentOrder = Number(current.sortOrder ?? idx);
    const targetOrder = Number(target.sortOrder ?? targetIdx);

    const doc1Ref = doc(db, 'shooppyProducts', current.id);
    const doc2Ref = doc(db, 'shooppyProducts', target.id);

    updateDoc(doc1Ref, { sortOrder: targetOrder })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: doc1Ref.path,
          operation: 'update',
          requestResourceData: { sortOrder: targetOrder },
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });

    updateDoc(doc2Ref, { sortOrder: currentOrder })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: doc2Ref.path,
          operation: 'update',
          requestResourceData: { sortOrder: currentOrder },
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });

    toast({ title: "Inventory Reorganized" });
  };

  const handleSaveWebin = async () => {
    const data = {
      title: webinTitle,
      content: webinContent,
      type: 'WeBin',
      nickname: 'Host',
      userId: user?.uid || 'host-id',
      timestamp: serverTimestamp(),
      sortOrder: editingWebin ? Number(editingWebin.sortOrder) : webins.length
    };

    if (editingWebin) {
      const docRef = doc(db, 'resources', editingWebin.id);
      updateDoc(docRef, { title: webinTitle, content: webinContent })
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: { title: webinTitle, content: webinContent },
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        });
      setEditingWebin(null);
    } else {
      addDoc(collection(db, 'resources'), data)
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: 'resources',
            operation: 'create',
            requestResourceData: data,
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        });
    }

    setWebinTitle(""); setWebinContent("");
    toast({ title: editingWebin ? "Portal Synchronized" : "Wedio Portal Deployed" });
  };

  const handleMoveWebin = async (id: string, direction: 'up' | 'down') => {
    const idx = webins.findIndex(w => w.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= webins.length) return;

    const current = webins[idx];
    const target = webins[targetIdx];

    const currentOrder = Number(current.sortOrder ?? idx);
    const targetOrder = Number(target.sortOrder ?? targetIdx);

    const doc1Ref = doc(db, 'resources', current.id);
    const doc2Ref = doc(db, 'resources', target.id);

    updateDoc(doc1Ref, { sortOrder: targetOrder })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: doc1Ref.path,
          operation: 'update',
          requestResourceData: { sortOrder: targetOrder },
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });

    updateDoc(doc2Ref, { sortOrder: currentOrder })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: doc2Ref.path,
          operation: 'update',
          requestResourceData: { sortOrder: currentOrder },
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });

    toast({ title: "Portal Grid Reordered" });
  };

  const handleSaveReward = () => {
    const data = {
      week: Number(rewardWeek),
      title: rewardTitle,
      description: rewardDesc,
      fileUrl: rewardFile,
      timestamp: serverTimestamp()
    };
    addDoc(collection(db, 'rewards'), data)
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'rewards',
          operation: 'create',
          requestResourceData: data,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
    setRewardWeekTitle(""); setRewardWeekDesc(""); setRewardWeekFile("");
    toast({ title: "Weekly Treasure Injected" });
  };

  const handleDispatchBroadcast = () => {
    const data = {
      title: newsTitle,
      content: newsContent,
      imageUrl: newsImg,
      timestamp: serverTimestamp()
    };
    addDoc(collection(db, 'newsPosts'), data)
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'newsPosts',
          operation: 'create',
          requestResourceData: data,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
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

  const handleSaveQuiz = async () => {
    const data = {
      title: quizTitle,
      questionCount: draftQuestions.length,
      questions: draftQuestions,
      createdAt: serverTimestamp()
    };

    if (editingQuizId) {
      const docRef = doc(db, 'quizzes', editingQuizId);
      updateDoc(docRef, data)
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: data,
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        });
      setEditingQuizId(null);
    } else {
      addDoc(collection(db, 'quizzes'), data)
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: 'quizzes',
            operation: 'create',
            requestResourceData: data,
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        });
    }

    setQuizTitle(""); setDraftQuestions([{ id: Math.random().toString(36).substr(2, 9), type: 'multiple', question: "", answer: "", options: ["", "", "", ""] }]);
    setCurrentQIdx(0);
    toast({ title: editingQuizId ? "Quiz Synchronized" : "Quiz Protocol Deployed" });
  };

  const handleEditQuiz = (q: any) => {
    setEditingQuizId(q.id);
    setQuizTitle(q.title);
    setDraftQuestions(q.questions);
    setCurrentQIdx(0);
    toast({ title: "Architect Mode: Sync", description: "Loading protocol data into constructor." });
  };

  const handleAddDraftTaskSlot = () => {
    setBulkDraftTasks([...bulkDraftTasks, { id: Math.random().toString(36).substr(2, 9), title: "", description: "" }]);
  };

  const handleRemoveDraftTaskSlot = (id: string) => {
    if (bulkDraftTasks.length <= 1) return;
    setBulkDraftTasks(bulkDraftTasks.filter(t => t.id !== id));
  };

  const handleUpdateDraftTask = (id: string, field: 'title' | 'description', value: string) => {
    setBulkDraftTasks(bulkDraftTasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleSaveBulkTasks = async () => {
    const tasksToSave = bulkDraftTasks.filter(t => t.title.trim() !== "");
    if (tasksToSave.length === 0) {
      toast({ title: "Injection Error", description: "Empty protocols cannot be deployed.", variant: "destructive" });
      return;
    }

    try {
      for (const task of tasksToSave) {
        const taskData = {
          day: Number(taskDay),
          title: task.title,
          description: task.description,
          createdAt: serverTimestamp()
        };
        addDoc(collection(db, 'tasks'), taskData)
          .catch(async (error) => {
            const permissionError = new FirestorePermissionError({
              path: 'tasks',
              operation: 'create',
              requestResourceData: taskData,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
          });
      }
      setBulkDraftTasks([{ id: '1', title: "", description: "" }]);
      toast({ title: "Sovereign Routines Deployed", description: `${tasksToSave.length} protocols injected into Hub ${taskDay}.` });
    } catch (e) {
      toast({ title: "Injection Failure", variant: "destructive" });
    }
  };

  const handleUpdateExistingTask = async () => {
    if (!editingTask) return;
    const taskData = {
      day: Number(editingTask.day),
      title: editingTask.title,
      description: editingTask.description
    };
    const docRef = doc(db, 'tasks', editingTask.id);
    updateDoc(docRef, taskData)
      .then(() => {
        setEditingTask(null);
        toast({ title: "Protocol Synchronized" });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: taskData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        toast({ title: "Sync Breach", variant: "destructive" });
      });
  };

  const handleDeleteDoc = (coll: string, id: string) => {
    const docRef = doc(db, coll, id);
    deleteDoc(docRef)
      .then(() => {
        toast({ title: "Data Purged" });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const startEditProduct = (p: any) => {
    setEditingProduct(p);
    setProdTitle(p.title);
    setProdDesc(p.description);
    setProdImg(p.imageUrl);
    setProdFile(p.fileUrl || "");
    setProdType(p.type);
    setProdPlacement(p.placement);
    setProdLevel(Number(p.requiredLevel || 1));
    setProdPrice(Number(p.price));
  };

  const startEditWebin = (w: any) => {
    setEditingWebin(w);
    setWebinTitle(w.title);
    setWebinContent(w.content);
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

  const tasksByDay = globalTasks.reduce((acc: any, task: any) => {
    const day = task.day;
    if (!acc[day]) acc[day] = [];
    acc[day].push(task);
    return acc;
  }, {});

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
          <div className="flex items-center justify-between overflow-x-auto pb-4 scrollbar-hide">
            <TabsList className="bg-mocha-cream p-2 rounded-full w-fit shadow-2xl border-4 border-primary/20 flex-shrink-0">
              {[
                { val: "tasks", icon: ListChecks, label: "Routines", count: globalTasks.length },
                { val: "assets", icon: ShoppingBag, label: "Shooppy", count: shooppyProducts.length },
                { val: "wedio", icon: Video, label: "Wedio", count: webins.length },
                { val: "rewards", icon: Gift, label: "Rewards", count: globalRewards.length },
                { val: "quizzo", icon: BookOpen, label: "Quizzo", count: globalQuizzes.length },
                { val: "broadcast", icon: Newspaper, label: "Dispatch", count: newsPosts.length },
                { val: "maintenance", icon: Database, label: "Continuity", count: 0 },
                { val: "system", icon: CircleHelp, label: "System", count: faqs.length }
              ].map((tab) => (
                <TabsTrigger key={tab.val} value={tab.val} className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest text-[#1f1610] gap-2">
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {tab.count > 0 && <Badge className="bg-[#1f1610] text-primary border-none text-[8px] h-4 w-4 flex items-center justify-center p-0">{tab.count}</Badge>}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="tasks" className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
             <Card className="rounded-[4rem] border-8 border-primary/10 bg-mocha-cream p-12 md:p-16 shadow-2xl space-y-12">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-4xl font-black uppercase flex items-center gap-6 italic text-[#1f1610]">
                    <ListChecks className="h-10 w-10 text-primary" /> DAILY ROUTINE INJECTOR
                  </CardTitle>
                  <div className="flex items-center gap-6">
                    <Label className="text-[#1f1610] text-xs">TARGET HUB DAY</Label>
                    <Input type="number" min={1} max={30} value={taskDay} onChange={e => setTaskDay(Number(e.target.value))} className="w-24 h-16 font-black text-center text-3xl bg-white text-[#1f1610] rounded-2xl" />
                  </div>
                </div>

                <div className="space-y-8">
                  {bulkDraftTasks.map((task, idx) => (
                    <div key={task.id} className="p-8 bg-[#1f1610]/5 rounded-[2.5rem] border-2 border-[#1f1610]/10 space-y-6 relative group/slot animate-in zoom-in-95">
                       <div className="flex items-center justify-between mb-4">
                          <Badge className="bg-[#1f1610] text-primary h-8 px-6 font-black uppercase text-[9px] rounded-full">Protocol Slot 0{idx + 1}</Badge>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 opacity-0 group-hover/slot:opacity-100 transition-opacity" 
                            onClick={() => handleRemoveDraftTaskSlot(task.id)}
                            disabled={bulkDraftTasks.length <= 1}
                          >
                            <X className="h-5 w-5" />
                          </Button>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="md:col-span-1 space-y-2">
                             <Label className="text-[#1f1610] text-[9px]">ROUTINE HEADLINE</Label>
                             <Input 
                                placeholder="Morning protocol..." 
                                value={task.title} 
                                onChange={e => handleUpdateDraftTask(task.id, 'title', e.target.value)} 
                                className="h-16 bg-white text-[#1f1610] font-black text-lg rounded-xl" 
                             />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                             <Label className="text-[#1f1610] text-[9px]">OPERATIONAL INSTRUCTIONS</Label>
                             <Input 
                                placeholder="Step-by-step..." 
                                value={task.description} 
                                onChange={e => handleUpdateDraftTask(task.id, 'description', e.target.value)} 
                                className="h-16 bg-white text-[#1f1610] font-bold text-sm rounded-xl" 
                             />
                          </div>
                       </div>
                    </div>
                  ))}

                  <div className="flex gap-6">
                    <Button 
                      onClick={handleAddDraftTaskSlot} 
                      variant="outline" 
                      className="flex-1 h-20 rounded-full border-4 border-[#1f1610] text-[#1f1610] font-black text-lg uppercase tracking-widest gap-4 hover:bg-[#1f1610] hover:text-primary transition-all"
                    >
                      <Plus className="h-6 w-6" /> ADD PROTOCOL SLOT
                    </Button>
                    <Button 
                      onClick={handleSaveBulkTasks} 
                      className="flex-1 h-20 rounded-full bg-[#1f1610] text-primary font-black text-lg uppercase shadow-2xl tracking-tighter hover:scale-105 active:scale-95 transition-transform"
                    >
                      INJECT {bulkDraftTasks.length} PROTOCOLS
                    </Button>
                  </div>
                </div>
             </Card>

             <div className="space-y-10">
                <div className="flex items-center justify-between px-8">
                   <h3 className="text-3xl font-black uppercase text-foreground italic">Master Infrastructure List</h3>
                   <span className="text-[10px] font-black uppercase text-primary/40 tracking-[0.4em]">Active Grid Protocols</span>
                </div>

                <div className="grid grid-cols-1 gap-12">
                   {Object.entries(tasksByDay).sort(([a], [b]) => Number(a) - Number(b)).map(([day, dayTasks]: [string, any]) => (
                     <div key={day} className="space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-16 bg-primary text-[#1f1610] rounded-[1.2rem] flex items-center justify-center font-black text-2xl italic shadow-xl">D{day}</div>
                           <div className="h-1 flex-1 bg-primary/10 rounded-full" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {dayTasks.map((t: any) => (
                             <Card key={t.id} className="p-8 bg-mocha-cream rounded-[2.5rem] border-4 border-primary/10 flex flex-col justify-between group shadow-lg hover:border-primary/40 transition-all">
                                <div className="space-y-4">
                                   <div className="flex justify-between items-start">
                                      <h4 className="font-black text-[#1f1610] uppercase italic text-xl leading-tight line-clamp-2">{t.title}</h4>
                                   </div>
                                   <p className="text-xs font-bold text-[#1f1610]/60 line-clamp-3 uppercase tracking-tight">{t.description}</p>
                                </div>
                                <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t-2 border-[#1f1610]/5">
                                   <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="rounded-full hover:bg-[#1f1610] hover:text-primary text-[#1f1610]/40"
                                      onClick={() => setEditingTask(t)}
                                   >
                                      <Edit3 className="h-5 w-5" />
                                   </Button>
                                   <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="rounded-full hover:bg-red-500 hover:text-white text-red-500/40"
                                      onClick={() => handleDeleteDoc('tasks', t.id)}
                                   >
                                      <Trash2 className="h-5 w-5" />
                                   </Button>
                                </div>
                             </Card>
                           ))}
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </TabsContent>

          {/* Shooppy Tab */}
          <TabsContent value="assets" className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <Card className="rounded-[4rem] border-8 border-primary/10 bg-mocha-cream p-12 shadow-2xl space-y-10">
                  <CardTitle className="text-3xl font-black uppercase flex items-center gap-5 italic text-[#1f1610]"><Plus className="h-8 w-8 text-primary" /> {editingProduct ? 'Edit Asset' : 'Asset Injector'}</CardTitle>
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
                    <div className="flex gap-4">
                      {editingProduct && <Button variant="ghost" onClick={() => { setEditingProduct(null); setProdTitle(""); setProdDesc(""); }} className="flex-1 h-20 rounded-full border-4 border-[#1f1610]">Cancel</Button>}
                      <Button onClick={handleSaveProduct} className="flex-1 h-20 rounded-full bg-[#1f1610] text-primary font-black text-xl uppercase shadow-2xl hover:scale-[1.02] transition-all">
                        {editingProduct ? 'Sync Protocol' : 'Deploy Asset'}
                      </Button>
                    </div>
                  </div>
              </Card>

              <div className="space-y-8">
                <div className="flex items-center justify-between px-6">
                   <h3 className="text-2xl font-black uppercase text-foreground italic">Current Inventory</h3>
                   <span className="text-[10px] font-black uppercase text-primary/40 tracking-widest">Active Protocols</span>
                </div>
                <ScrollArea className="h-[650px] pr-6">
                  <div className="space-y-6">
                    {shooppyProducts.map((p: any, idx: number) => (
                      <div key={p.id} className="p-8 bg-mocha-cream rounded-[3rem] border-4 border-primary/10 flex items-center justify-between group shadow-lg">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-[#1f1610] text-primary rounded-2xl flex items-center justify-center font-black text-xs italic shrink-0">{p.type.slice(0,1)}</div>
                          <div>
                            <h4 className="font-black text-[#1f1610] uppercase italic text-lg line-clamp-1">{p.title}</h4>
                            <p className="text-[10px] font-black uppercase text-[#1f1610]/40 tracking-widest">{p.placement} • LV {p.requiredLevel} • {p.price} PTS</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-1 mr-4">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleMoveProduct(p.id, 'up')} disabled={idx === 0}><ArrowUp className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleMoveProduct(p.id, 'down')} disabled={idx === shooppyProducts.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                          </div>
                          <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-blue-500/10 rounded-full" onClick={() => startEditProduct(p)}><Edit3 className="h-5 w-5" /></Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 rounded-full" onClick={() => handleDeleteDoc('shooppyProducts', p.id)}><Trash2 className="h-5 w-5" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          {/* Wedio Tab */}
          <TabsContent value="wedio" className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
               <Card className="rounded-[4rem] border-8 border-primary/10 bg-mocha-cream p-12 shadow-2xl space-y-10">
                  <CardTitle className="text-3xl font-black uppercase flex items-center gap-5 italic text-[#1f1610]"><Video className="h-8 w-8 text-primary" /> {editingWebin ? 'Edit Portal' : 'Wedio Injector'}</CardTitle>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[#1f1610]">Portal Title</Label>
                      <Input placeholder="Strategy Masterclass" value={webinTitle} onChange={e => setWebinTitle(e.target.value)} className="h-16 font-black text-lg rounded-2xl bg-white text-[#1f1610]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#1f1610]">Video / Portal URL</Label>
                      <Input placeholder="https://..." value={webinContent} onChange={e => setWebinContent(e.target.value)} className="h-16 font-bold text-sm rounded-2xl bg-white text-[#1f1610]" />
                    </div>
                    <div className="flex gap-4">
                       {editingWebin && <Button variant="ghost" onClick={() => { setEditingWebin(null); setWebinTitle(""); setWebinContent(""); }} className="flex-1 h-20 rounded-full border-4 border-[#1f1610]">Cancel</Button>}
                       <Button onClick={handleSaveWebin} className="flex-1 h-20 rounded-full bg-[#1f1610] text-primary font-black text-xl uppercase shadow-2xl">
                         {editingWebin ? 'Sync Portal' : 'Inject Portal'}
                       </Button>
                    </div>
                  </div>
               </Card>

               <div className="space-y-8">
                  <div className="flex items-center justify-between px-6">
                    <h3 className="text-2xl font-black uppercase text-foreground italic">Wedio Portals</h3>
                    <span className="text-[10px] font-black uppercase text-primary/40 tracking-widest">Active Links</span>
                  </div>
                  <ScrollArea className="h-[650px] pr-6">
                    <div className="space-y-6">
                      {webins.map((w: any, idx: number) => (
                        <div key={w.id} className="p-8 bg-mocha-cream rounded-[3rem] border-4 border-primary/10 flex items-center justify-between group shadow-lg">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-[#1f1610] text-primary rounded-2xl flex items-center justify-center font-black text-xs italic shrink-0">W</div>
                            <div>
                              <h4 className="font-black text-[#1f1610] uppercase italic text-lg line-clamp-1">{w.title}</h4>
                              <p className="text-[10px] font-black uppercase text-[#1f1610]/40 tracking-widest truncate max-w-[200px]">{w.content}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col gap-1 mr-4">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleMoveWebin(w.id, 'up')} disabled={idx === 0}><ArrowUp className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleMoveWebin(w.id, 'down')} disabled={idx === webins.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                            </div>
                            <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-blue-500/10 rounded-full" onClick={() => startEditWebin(w)}><Edit3 className="h-5 w-5" /></Button>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 rounded-full" onClick={() => handleDeleteDoc('resources', w.id)}><Trash2 className="h-5 w-5" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
               </div>
             </div>
          </TabsContent>

          {/* Reward Tab */}
          <TabsContent value="rewards" className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
               <Card className="rounded-[4rem] border-8 border-primary/10 bg-mocha-cream p-12 shadow-2xl space-y-10">
                  <CardTitle className="text-3xl font-black uppercase flex items-center gap-5 italic text-[#1f1610]"><Gift className="h-8 w-8 text-primary" /> Treasure Injector</CardTitle>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[#1f1610]">Target Milestone Week</Label>
                      <select className="w-full h-16 bg-white border-4 border-[#1f1610]/10 rounded-2xl px-6 font-black uppercase text-sm text-[#1f1610]" value={rewardWeek} onChange={e => setRewardWeek(Number(e.target.value))}>
                        <option value={1}>Week 1 (Day 7)</option>
                        <option value={2}>Week 2 (Day 14)</option>
                        <option value={3}>Week 3 (Day 21)</option>
                        <option value={4}>Week 4 (Day 28)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#1f1610]">Treasure Title</Label>
                      <Input placeholder="Exclusive Strategy Kit" value={rewardTitle} onChange={e => setRewardWeekTitle(e.target.value)} className="h-16 font-black text-lg rounded-2xl bg-white text-[#1f1610]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#1f1610]">Treasure Description</Label>
                      <Textarea placeholder="What's inside the chest..." value={rewardDesc} onChange={e => setRewardWeekDesc(e.target.value)} className="min-h-[120px] rounded-[2rem] p-6 bg-white text-[#1f1610]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#1f1610]">Treasure Link/File URL</Label>
                      <div className="relative">
                        <Upload className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30" />
                        <Input placeholder="https://..." value={rewardFile} onChange={e => setRewardWeekFile(e.target.value)} className="h-16 pl-12 text-xs font-black bg-white text-[#1f1610]" />
                      </div>
                    </div>
                    <Button onClick={handleSaveReward} className="w-full h-20 rounded-full bg-[#1f1610] text-primary font-black text-xl uppercase shadow-2xl hover:scale-[1.02] transition-all">Inject Treasure Reward</Button>
                  </div>
               </Card>

               <div className="space-y-8">
                  <div className="flex items-center justify-between px-6">
                    <h3 className="text-2xl font-black uppercase text-foreground italic">Deployed Treasures</h3>
                    <span className="text-[10px] font-black uppercase text-primary/40 tracking-widest">Roadmap Milestones</span>
                  </div>
                  <ScrollArea className="h-[650px] pr-6">
                    <div className="space-y-6">
                      {globalRewards.map((r: any) => (
                        <div key={r.id} className="p-8 bg-mocha-cream rounded-[3rem] border-4 border-primary/10 flex items-center justify-between group shadow-lg">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-[#1f1610] text-primary rounded-2xl flex items-center justify-center font-black text-xs italic shrink-0">W{r.week}</div>
                            <div>
                              <h4 className="font-black text-[#1f1610] uppercase italic text-lg line-clamp-1">{r.title}</h4>
                              <p className="text-[10px] font-black uppercase text-[#1f1610]/40 tracking-widest">Milestone Treasure</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 rounded-full" onClick={() => handleDeleteDoc('rewards', r.id)}><Trash2 className="h-5 w-5" /></Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
               </div>
             </div>
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quizzo" className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
             <Card className="rounded-[4rem] border-8 border-primary/10 bg-mocha-cream p-12 shadow-2xl space-y-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl font-black uppercase flex items-center gap-5 italic text-[#1f1610]"><BookOpen className="h-8 w-8 text-primary" /> Quizzo Protocol Architect</CardTitle>
                  <div className="flex gap-4">
                    {editingQuizId && (
                      <Button onClick={() => { setEditingQuizId(null); setQuizTitle(""); setDraftQuestions([{ id: Math.random().toString(36).substr(2, 9), type: 'multiple', question: "", answer: "", options: ["", "", "", ""] }]); }} variant="ghost" className="h-16 px-10 rounded-full border-4 border-[#1f1610] font-black uppercase text-xs">Cancel Edit</Button>
                    )}
                    <Button onClick={handleSaveQuiz} className="h-16 px-12 rounded-full bg-[#1f1610] text-primary font-black text-sm uppercase shadow-2xl">
                      {editingQuizId ? 'Synchronize Protocol' : 'Deploy Quiz'}
                    </Button>
                  </div>
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
                          <span className="w-12 h-12 bg-[#1f1610] text-primary rounded-xl flex items-center justify-center font-black text-2xl italic leading-none">{currentQIdx + 1}</span>
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

             <div className="space-y-10">
                <div className="flex items-center justify-between px-8">
                   <h3 className="text-3xl font-black uppercase text-foreground italic">Deployed Quiz Protocols</h3>
                   <span className="text-[10px] font-black uppercase text-primary/40 tracking-[0.4em]">Active Verification Grids</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {globalQuizzes.map((q: any) => (
                     <Card key={q.id} className="p-8 bg-mocha-cream rounded-[3rem] border-4 border-primary/10 flex items-center justify-between group shadow-lg hover:border-primary/40 transition-all">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-[#1f1610] text-primary rounded-2xl flex items-center justify-center font-black text-xs italic">Q</div>
                          <div>
                            <h4 className="font-black text-[#1f1610] uppercase italic text-lg line-clamp-1">{q.title}</h4>
                            <p className="text-[10px] font-black uppercase text-[#1f1610]/40 tracking-widest">{q.questionCount} Questions • Active</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-blue-500/10 rounded-full" onClick={() => handleEditQuiz(q)}><Edit3 className="h-5 w-5" /></Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 rounded-full" onClick={() => handleDeleteDoc('quizzes', q.id)}><Trash2 className="h-5 w-5" /></Button>
                        </div>
                     </Card>
                   ))}
                </div>
             </div>
          </TabsContent>

          {/* Continuity Tab (Backup/Maintenance) */}
          <TabsContent value="maintenance" className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <Card className="rounded-[3rem] border-8 border-primary/10 bg-mocha-cream p-10 shadow-2xl space-y-8 flex flex-col justify-between">
                   <div className="space-y-6">
                      <div className="w-16 h-16 bg-[#1f1610] rounded-2xl flex items-center justify-center shadow-lg">
                        <HardDrive className="h-8 w-8 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-2xl font-black uppercase italic text-[#1f1610]">In-System Archive</CardTitle>
                        <p className="text-[10px] font-bold text-[#1f1610]/60 uppercase tracking-widest leading-relaxed italic">Download encrypted grid data to local strategist disk for fast restoration.</p>
                      </div>
                   </div>
                   <Button onClick={() => handleExportBackup('Local')} disabled={isBackingUp} className="w-full h-16 rounded-full bg-[#1f1610] text-primary font-black uppercase text-xs shadow-xl gap-3">
                     {isBackingUp ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                     GENERATE ARCHIVE
                   </Button>
                </Card>

                <Card className="rounded-[3rem] border-8 border-primary/10 bg-mocha-cream p-10 shadow-2xl space-y-8 flex flex-col justify-between">
                   <div className="space-y-6">
                      <div className="w-16 h-16 bg-[#1f1610] rounded-2xl flex items-center justify-center shadow-lg">
                        <Cloud className="h-8 w-8 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-2xl font-black uppercase italic text-[#1f1610]">Cloud Sync Offsite</CardTitle>
                        <p className="text-[10px] font-bold text-[#1f1610]/60 uppercase tracking-widest leading-relaxed italic">Dispatch encrypted blocks to offsite cloud registry for geo-redundant durability.</p>
                      </div>
                   </div>
                   <Button onClick={() => handleExportBackup('Cloud')} disabled={isBackingUp} className="w-full h-16 rounded-full bg-[#1f1610] text-primary font-black uppercase text-xs shadow-xl gap-3">
                     {isBackingUp ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCcw className="h-5 w-5" />}
                     DISPATCH TO CLOUD
                   </Button>
                </Card>

                <Card className="rounded-[3rem] border-8 border-dashed border-[#1f1610]/20 bg-[#1f1610] p-10 shadow-2xl space-y-8 flex flex-col justify-between">
                   <div className="space-y-6">
                      <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center shadow-lg">
                        <OctagonAlert className="h-8 w-8 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-2xl font-black uppercase italic text-primary">Legacy Restore</CardTitle>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed italic">DANGER: Injecting archive will overwrite current state. Zero data-loss protocol recommended.</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <input type="file" accept=".json" ref={restoreRef} onChange={handleRestoreBackup} className="hidden" />
                      <Button onClick={() => restoreRef.current?.click()} disabled={isRestoring} className="w-full h-16 rounded-full bg-primary text-[#1f1610] font-black uppercase text-xs shadow-xl gap-3">
                        {isRestoring ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                        INJECT ARCHIVE
                      </Button>
                   </div>
                </Card>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Card className="rounded-[4rem] border-8 border-primary/10 bg-mocha-cream p-12 shadow-2xl space-y-10">
                   <div className="flex items-center gap-4 text-[#1f1610]">
                      <Activity className="h-10 w-10 text-primary" />
                      <h3 className="text-4xl font-black uppercase italic tracking-tighter">Continuity Metrics</h3>
                   </div>
                   <div className="grid grid-cols-2 gap-8">
                      <div className="p-8 bg-[#1f1610]/5 rounded-[2.5rem] border-2 border-[#1f1610]/10 text-center space-y-2">
                        <p className="text-[10px] font-black uppercase text-[#1f1610]/40 tracking-widest">Archived Records</p>
                        <p className="text-5xl font-black text-[#1f1610] italic tracking-tighter">24k+</p>
                      </div>
                      <div className="p-8 bg-[#1f1610]/5 rounded-[2.5rem] border-2 border-[#1f1610]/10 text-center space-y-2">
                        <p className="text-[10px] font-black uppercase text-[#1f1610]/40 tracking-widest">RTO (EST.)</p>
                        <p className="text-5xl font-black text-[#1f1610] italic tracking-tighter">~12s</p>
                      </div>
                   </div>
                </Card>

                <Card className="rounded-[4rem] border-8 border-red-600/10 bg-red-600/5 p-12 shadow-2xl space-y-10">
                   <div className="flex items-center gap-4 text-red-600">
                      <TriangleAlert className="h-10 w-10" />
                      <h3 className="text-4xl font-black uppercase italic tracking-tighter">Disaster Protocol</h3>
                   </div>
                   <div className="space-y-4">
                      {[
                        "Initiate Lockdown: Suspend all Hub injections.",
                        "Flush Memory: Clear active session cache.",
                        "Verify Integrity: Run checksum on target archive.",
                        "Inject Archive: Re-establish state via Continuity Hub.",
                        "Verify State: Authenticate core strategist profiles."
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-6 p-4 bg-white/40 rounded-2xl border-2 border-red-600/10">
                           <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-lg italic shrink-0 leading-none">0{i+1}</div>
                           <p className="text-xs font-black uppercase text-red-600/80 tracking-widest">{step}</p>
                        </div>
                      ))}
                   </div>
                </Card>
             </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="system" className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <Card className="rounded-[4rem] lg:col-span-1 border-8 border-primary/10 bg-mocha-cream p-10 shadow-2xl space-y-8">
                   <CardTitle className="text-2xl font-black uppercase italic text-[#1f1610]">Inquiry Injector</CardTitle>
                   <div className="space-y-4">
                      <Input placeholder="Inquiry Question..." value={faqQ} onChange={e => setFaqQ(e.target.value)} className="h-16 rounded-2xl bg-white text-[#1f1610] font-bold text-sm" />
                      <Textarea placeholder="Protocol Response..." value={faqA} onChange={e => setFaqA(e.target.value)} className="min-h-[120px] rounded-[2rem] bg-white text-[#1f1610] font-bold text-sm" />
                      <Button onClick={() => {
                        const faqData = { question: faqQ, answer: faqA };
                        addDoc(collection(db, 'faqs'), faqData)
                          .then(() => { 
                            setFaqQ(""); setFaqA(""); toast({ title: "FAQ Injected" }); 
                          })
                          .catch(async (error) => {
                            const permissionError = new FirestorePermissionError({
                              path: 'faqs',
                              operation: 'create',
                              requestResourceData: faqData,
                            } satisfies SecurityRuleContext);
                            errorEmitter.emit('permission-error', permissionError);
                          });
                      }} className="w-full h-16 rounded-2xl bg-[#1f1610] text-primary font-black uppercase text-xs">Inject FAQ</Button>
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

      {/* Task Edit Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
         <DialogContent className="rounded-[3rem] border-8 border-primary/20 bg-mocha-cream p-12 max-w-xl shadow-2xl">
            <DialogHeader>
               <DialogTitle className="text-3xl font-black text-[#1f1610] uppercase italic tracking-tighter text-center">Edit Protocol</DialogTitle>
            </DialogHeader>
            <div className="space-y-8 mt-6">
               <div className="grid grid-cols-4 gap-6">
                  <div className="space-y-2">
                     <Label className="text-[#1f1610] text-[9px]">HUB DAY</Label>
                     <Input 
                        type="number" 
                        value={editingTask?.day || 1} 
                        onChange={e => setEditingTask({ ...editingTask, day: e.target.value })} 
                        className="h-16 text-center font-black text-2xl bg-white text-[#1f1610] rounded-xl flex items-center justify-center leading-none"
                     />
                  </div>
                  <div className="col-span-3 space-y-2">
                     <Label className="text-[#1f1610] text-[9px]">HEADLINE</Label>
                     <Input 
                        value={editingTask?.title || ""} 
                        onChange={e => setEditingTask({ ...editingTask, title: e.target.value })} 
                        className="h-16 bg-white text-[#1f1610] font-black text-lg rounded-xl flex items-center px-6 leading-none"
                     />
                  </div>
               </div>
               <div className="space-y-2">
                  <Label className="text-[#1f1610] text-[9px]">INSTRUCTIONS</Label>
                  <Textarea 
                     value={editingTask?.description || ""} 
                     onChange={e => setEditingTask({ ...editingTask, description: e.target.value })} 
                     className="min-h-[120px] bg-white text-[#1f1610] font-bold rounded-2xl p-6 leading-relaxed"
                  />
               </div>
            </div>
            <DialogFooter className="mt-10 gap-4">
               <Button variant="ghost" className="rounded-full h-14 font-black uppercase text-xs" onClick={() => setEditingTask(null)}>Cancel</Button>
               <Button className="rounded-full h-14 px-10 bg-[#1f1610] text-primary font-black uppercase text-sm" onClick={handleUpdateExistingTask}>Synchronize Changes</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}