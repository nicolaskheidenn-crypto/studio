
"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStore } from "@/lib/store";
import { useUser } from "@/firebase";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, BookCheck, ShieldAlert, Key, Bell } from "lucide-react";

export default function AdminPage() {
  const { user } = useUser();
  const [adminKey, setAdminKey] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { quizzes, addQuiz, deleteQuiz, dailyTasks, addTask, deleteTask } = useAdminStore();

  const [quizTitle, setQuizTitle] = useState("");
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState<'multiple' | 'boolean' | 'id'>('multiple');
  const [qAnswer, setQAnswer] = useState("");
  const [qOptions, setQOptions] = useState("");

  const [taskDay, setTaskDay] = useState(1);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");

  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");

  const ADMIN_EMAIL = "nicolaskheidenn@gmail.com";
  const ADMIN_SECRET_KEY = "2878-2171-2489-2341";

  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-accent text-white">
        <ShieldAlert className="h-20 w-20 mb-4" />
        <h1 className="text-4xl font-headline font-bold">Unauthorized Access</h1>
        <p className="mt-2 text-white/60">This area is reserved for the Host only.</p>
        <Button className="mt-8 rounded-full" asChild><a href="/">Back to Hub</a></Button>
      </div>
    );
  }

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === ADMIN_SECRET_KEY) {
      setIsAuthorized(true);
      toast({ title: "Authorized", description: "Welcome back, Host." });
    } else {
      toast({ title: "Invalid Key", variant: "destructive" });
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent">
        <Card className="w-full max-w-md p-8 bg-card rounded-[3rem] shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-3xl w-fit mx-auto">
              <Key className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-headline">Admin Security Gate</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuthorize} className="space-y-6">
              <Input 
                type="password" 
                placeholder="0000-0000-0000-0000" 
                className="h-16 text-center text-2xl font-mono tracking-widest rounded-2xl"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
              />
              <Button type="submit" className="w-full h-14 rounded-full font-bold text-lg bg-primary text-accent">
                Verify Identity
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateQuiz = () => {
    if (!quizTitle || !qText || !qAnswer) return;
    addQuiz({
      title: quizTitle,
      questions: [{
        id: Math.random().toString(),
        type: qType,
        question: qText,
        answer: qAnswer,
        options: qType === 'multiple' ? qOptions.split(',').map(o => o.trim()) : undefined
      }]
    });
    setQuizTitle(""); setQText(""); setQAnswer(""); setQOptions("");
    toast({ title: "Quiz Published" });
  };

  const handleBroadcast = () => {
    if (!broadcastTitle || !broadcastMsg) return;
    toast({ title: "Broadcast Sent", description: "All users have been notified." });
    setBroadcastTitle(""); setBroadcastMsg("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-5xl font-headline font-bold mb-8">Host Management</h1>
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="bg-secondary/50 p-1 rounded-full w-fit">
            <TabsTrigger value="tasks" className="rounded-full px-8">Daily Routine</TabsTrigger>
            <TabsTrigger value="quizzes" className="rounded-full px-8">FireQuizzo</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-full px-8">Broadcasting</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            <Card className="rounded-[2.5rem] border-accent/10 shadow-xl overflow-hidden">
              <CardHeader className="bg-accent/5 p-8 border-b border-accent/10">
                <CardTitle>Add Strategic Task</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Target Day</Label>
                    <Input type="number" value={taskDay} onChange={e => setTaskDay(parseInt(e.target.value))} className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Task Title</Label>
                    <Input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="h-12 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Strategic Description</Label>
                  <Textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} className="min-h-[100px] rounded-2xl" />
                </div>
                <Button onClick={() => {
                  addTask({ day: taskDay, title: taskTitle, description: taskDesc });
                  toast({ title: "Task Saved" });
                  setTaskTitle(""); setTaskDesc("");
                }} className="w-full h-14 rounded-full bg-primary text-accent font-bold"><Plus className="mr-2" /> Add Task</Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dailyTasks.map(t => (
                <div key={t.id} className="p-6 border rounded-[2rem] bg-white flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Day {t.day}</span>
                    <h4 className="font-bold text-lg">{t.title}</h4>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteTask(t.id)}><Trash2 className="text-destructive" /></Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-6">
             <Card className="rounded-[2.5rem] border-accent/10 shadow-xl overflow-hidden">
              <CardHeader className="bg-accent/5 p-8 border-b border-accent/10">
                <CardTitle>Create New Quiz</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <Input placeholder="Quiz Title" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} className="h-14 rounded-2xl text-lg font-bold" />
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <Label>Question Type</Label>
                    <select className="w-full h-12 bg-secondary/10 border-accent/10 rounded-xl px-4" value={qType} onChange={e => setQType(e.target.value as any)}>
                      <option value="multiple">Multiple Choice</option>
                      <option value="boolean">True/False</option>
                      <option value="id">Identification</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <Input value={qAnswer} onChange={e => setQAnswer(e.target.value)} className="h-12 rounded-xl" />
                  </div>
                </div>
                <Textarea placeholder="The Question" value={qText} onChange={e => setQText(e.target.value)} className="min-h-[120px] rounded-2xl" />
                {qType === 'multiple' && (
                  <Input placeholder="Options (comma separated)" value={qOptions} onChange={e => setQOptions(e.target.value)} className="h-12 rounded-xl" />
                )}
                <Button onClick={handleCreateQuiz} className="w-full h-14 rounded-full bg-accent text-white font-bold"><BookCheck className="mr-2" /> Publish Quiz</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="rounded-[2.5rem] shadow-xl">
               <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-6 w-6" /> System Broadcast</CardTitle></CardHeader>
               <CardContent className="space-y-6 p-8">
                  <Input placeholder="Notification Title" value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} className="h-12 rounded-xl" />
                  <Textarea placeholder="Message to all users..." value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} className="rounded-2xl" />
                  <Button onClick={handleBroadcast} className="w-full h-14 rounded-full bg-primary text-accent font-bold">Send Notification</Button>
               </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
