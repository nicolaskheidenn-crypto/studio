
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Flame, Droplets, Leaf, CloudRain, Monitor, User, Shield, Lock, Camera, Save, Eye, EyeOff } from "lucide-react";
import { useAppStore, type Theme } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { getAuth, updateProfile, updatePassword } from "firebase/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const THEMES: { id: Theme; label: string; icon: any; color: string }[] = [
  { id: 'default', label: 'Classic Mocha', icon: Monitor, color: 'bg-zinc-500' },
  { id: 'fire', label: 'Volcanic Fire', icon: Flame, color: 'bg-orange-500' },
  { id: 'water', label: 'Oceanic Blue', icon: Droplets, color: 'bg-blue-500' },
  { id: 'nature', label: 'Calm Nature', icon: Leaf, color: 'bg-emerald-500' },
  { id: 'raining', label: 'Stormy Night', icon: CloudRain, color: 'bg-slate-600' },
];

export default function SettingsPage() {
  const { theme, setTheme, applyTheme } = useAppStore();
  const { user } = useUser();
  const auth = getAuth();
  
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
  }, [user]);

  const validateBio = (text: string) => {
    const lettersOnly = text.replace(/[^a-zA-Z\s]/g, "");
    setBio(lettersOnly);
  };

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;
    if (bio.length > 0 && (bio.length < 15 || bio.length > 60)) {
      toast({ title: "Bio Error", description: "Bio must be between 15 and 60 letters.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName });
      toast({ title: "Profile Updated", description: "All changes synchronized." });
    } catch (e: any) {
      toast({ title: "Update Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTheme = () => {
    applyTheme();
    toast({ title: "Appearance Saved", description: "The interface has been updated globally." });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-5xl font-headline font-bold mb-12">Configuration</h1>
        
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="bg-secondary/40 p-1.5 rounded-full w-fit">
            <TabsTrigger value="profile" className="rounded-full px-10 h-12 text-lg font-bold">Profile Hub</TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-full px-10 h-12 text-lg font-bold">Atmosphere</TabsTrigger>
            <TabsTrigger value="privacy" className="rounded-full px-10 h-12 text-lg font-bold">Legal Proof</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-8">
            <Card className="rounded-[3rem] border-accent/10 shadow-2xl overflow-hidden">
               <div className="h-48 bg-gradient-to-r from-accent to-primary relative">
                  <Button variant="outline" size="sm" className="absolute bottom-4 right-8 rounded-full bg-white/20 border-white text-white backdrop-blur-md">
                    <Camera className="h-4 w-4 mr-2" /> Change Cover
                  </Button>
               </div>
               <CardContent className="p-10 -mt-12 relative z-10">
                  <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                     <div className="w-32 h-32 rounded-full border-4 border-white bg-accent shadow-xl flex items-center justify-center text-white text-4xl font-bold uppercase relative overflow-hidden">
                        {user?.displayName?.[0] || "S"}
                        <Button size="icon" className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-none">
                          <Camera className="h-6 w-6" />
                        </Button>
                     </div>
                     <div className="pt-12 md:pt-14 space-y-1">
                        <h2 className="text-3xl font-bold text-accent">{user?.displayName || "Succemazing"}</h2>
                        <p className="text-muted-foreground font-mono">{user?.email}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-lg font-bold">Username</Label>
                        <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="@username" className="h-14 rounded-2xl bg-secondary/20 border-none px-6" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-lg font-bold">Full Nickname</Label>
                        <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Full Name" className="h-14 rounded-2xl bg-secondary/20 border-none px-6" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-lg font-bold flex justify-between">Bio <span className="text-xs font-normal text-muted-foreground">{bio.length}/60 letters</span></Label>
                        <Textarea 
                          value={bio} 
                          onChange={e => validateBio(e.target.value)} 
                          placeholder="Your professional digital strategy biography (15-60 letters only)..." 
                          className="rounded-[1.5rem] bg-secondary/20 border-none min-h-[120px] p-6 text-lg"
                        />
                      </div>
                      <Button onClick={handleUpdateProfile} disabled={isLoading} className="w-full h-16 rounded-full bg-accent text-white font-bold text-lg shadow-xl">
                        Update Core Profile
                      </Button>
                    </div>

                    <div className="space-y-8">
                       <div className="p-8 bg-secondary/10 rounded-[2.5rem] border border-accent/5">
                          <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Lock className="h-5 w-5" /> Security Shield</h3>
                          <div className="space-y-6">
                             <div className="space-y-2">
                                <Label>New Strong Password</Label>
                                <div className="relative">
                                   <Input 
                                      type={showPassword ? "text" : "password"} 
                                      value={newPassword} 
                                      onChange={e => setNewPassword(e.target.value)}
                                      className="h-14 rounded-2xl bg-white border-accent/10 px-6 pr-14"
                                   />
                                   <button onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent">
                                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                   </button>
                                </div>
                             </div>
                             <Button variant="outline" onClick={() => updatePassword(auth.currentUser!, newPassword)} className="w-full h-14 rounded-full border-accent text-accent font-bold hover:bg-accent hover:text-white transition-all">
                                Update Security Access
                             </Button>
                          </div>
                       </div>
                    </div>
                  </div>
               </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-8">
            <Card className="rounded-[3rem] border-accent/10 shadow-2xl p-10">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">Visual Environment</CardTitle>
                <CardDescription className="text-lg">Select the atmosphere that fuels your productivity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={cn(
                        "group relative overflow-hidden flex flex-col p-8 rounded-[2rem] border-4 transition-all duration-300",
                        theme === t.id ? "border-primary bg-primary/5 shadow-2xl scale-[1.02]" : "border-secondary/20 hover:border-accent/40 bg-card"
                      )}
                    >
                      <div className={cn("w-16 h-16 rounded-2xl text-white flex items-center justify-center mb-6 shadow-lg", t.color)}>
                        <t.icon className="h-8 w-8" />
                      </div>
                      <p className="font-bold text-2xl mb-1">{t.label}</p>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Focus Mode</p>
                      {theme === t.id && <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-primary animate-ping" />}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center">
                  <Button onClick={handleSaveTheme} className="h-20 rounded-full px-20 bg-accent text-white font-bold text-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:scale-105 transition-transform">
                    <Save className="h-6 w-6 mr-3" /> Lock Atmosphere
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-8">
             <Card className="rounded-[3rem] p-12 shadow-2xl border-accent/10">
                <h2 className="text-4xl font-headline font-bold mb-12 text-center">Global Privacy & Policy Framework</h2>
                <div className="space-y-16 max-w-3xl mx-auto text-lg leading-relaxed text-muted-foreground">
                   <section>
                      <h4 className="text-accent text-2xl font-bold mb-6 underline decoration-primary decoration-4 underline-offset-8">I. Data Sovereignity</h4>
                      <p>At FireProof, your strategic intellectual property is treated with the highest tier of isolation. Every goal capsule, daily task completion, and communication log is encrypted using military-grade AES-256 protocols. Your data is your empire; we only provide the vault.</p>
                   </section>
                   <section>
                      <h4 className="text-accent text-2xl font-bold mb-6 underline decoration-primary decoration-4 underline-offset-8">II. Anti-Intrusion Governance</h4>
                      <p>We do not harvest, monetize, or share user behavioral data with third-party advertising networks. Our business model is powered by your ambition, not your exposure. Internal audits are conducted bi-weekly to ensure zero-leak integrity across all Firestore paths.</p>
                   </section>
                   <section>
                      <h4 className="text-accent text-2xl font-bold mb-6 underline decoration-primary decoration-4 underline-offset-8">III. Communication Transparency</h4>
                      <p>By engaging with FireProof, you opt-in to a professional communication stream. This includes real-time notifications for friend requests, administrative broadcasts, and strategic eBook updates. We reserve the right to prune inactive connections to maintain system velocity.</p>
                   </section>
                   <section>
                      <h4 className="text-accent text-2xl font-bold mb-6 underline decoration-primary decoration-4 underline-offset-8">IV. Ethical Interaction</h4>
                      <p>The messaging and social hub must be used exclusively for professional growth and strategic networking. Harassment, data scraping, or malicious automation will result in immediate UID termination without reimbursement for premium assets.</p>
                   </section>
                </div>
             </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
