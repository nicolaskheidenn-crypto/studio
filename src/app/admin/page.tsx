
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, BookCheck, ClipboardList } from "lucide-react";

export default function AdminPage() {
  const { user } = useUser();
  const router = useRouter();
  const { quizzes, addQuiz, deleteQuiz, dailyTasks, addTask, deleteTask } = useAdminStore();

  const [quizTitle, setQuizTitle] = useState("");
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState<'multiple' | 'boolean' | 'id'>('multiple');
  const [qAnswer, setQAnswer] = useState("");
  const [qOptions, setQOptions] = useState("");

  const [taskDay, setTaskDay] = useState(1);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");

  if (user?.email !== "nicolaskheidenn@gmail.com") {
    return <div className="p-20 text-center">Unauthorized Access</div>;
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
    toast({ title: "Quiz Created" });
  };

  const handleCreateTask = () => {
    if (!taskTitle || !taskDay) return;
    addTask({ day: taskDay, title: taskTitle, description: taskDesc });
    setTaskTitle(""); setTaskDesc("");
    toast({ title: "Task Added for Day " + taskDay });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-headline font-bold mb-8">Admin Dashboard</h1>

        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="rounded-full">
            <TabsTrigger value="tasks" className="rounded-full">Manage Daily Tasks</TabsTrigger>
            <TabsTrigger value="quizzes" className="rounded-full">Manage FireQuizzo</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Add Daily Task</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Day Number</Label>
                    <Input type="number" value={taskDay} onChange={e => setTaskDay(parseInt(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Task Title</Label>
                    <Input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
                </div>
                <Button onClick={handleCreateTask} className="w-full rounded-full"><Plus className="mr-2" /> Add Task</Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="font-bold">Current Routine</h3>
              {dailyTasks.map(t => (
                <div key={t.id} className="p-4 border rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase text-primary">Day {t.day}</span>
                    <p className="font-bold">{t.title}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteTask(t.id)}><Trash2 className="text-destructive h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Create New Quiz</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Quiz Title" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <select className="p-2 border rounded-md" value={qType} onChange={e => setQType(e.target.value as any)}>
                    <option value="multiple">Multiple Choice</option>
                    <option value="boolean">True/False</option>
                    <option value="id">Identification</option>
                  </select>
                </div>
                <Textarea placeholder="Question Text" value={qText} onChange={e => setQText(e.target.value)} />
                {qType === 'multiple' && <Input placeholder="Options (comma separated)" value={qOptions} onChange={e => setQOptions(e.target.value)} />}
                <Input placeholder="Correct Answer" value={qAnswer} onChange={e => setQAnswer(e.target.value)} />
                <Button onClick={handleCreateQuiz} className="w-full rounded-full"><BookCheck className="mr-2" /> Publish Quiz</Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="font-bold">Published Quizzes</h3>
              {quizzes.map(q => (
                <div key={q.id} className="p-4 border rounded-2xl flex items-center justify-between">
                  <p className="font-bold">{q.title}</p>
                  <Button variant="ghost" size="icon" onClick={() => deleteQuiz(q.id)}><Trash2 className="text-destructive h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
