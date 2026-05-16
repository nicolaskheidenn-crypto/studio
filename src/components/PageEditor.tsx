
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, Save, Loader2, ArrowLeft } from "lucide-react";
import { aiContentDraftingTool } from "@/ai/flows/ai-content-drafting-tool";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface PageEditorProps {
  initialData?: {
    id?: string;
    title: string;
    slug: string;
    content: string;
  };
  onSave: (data: { title: string; slug: string; content: string }) => void;
  isNew?: boolean;
}

export function PageEditor({ initialData, onSave, isNew }: PageEditorProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [isDrafting, setIsDrafting] = useState(false);
  const { toast } = useToast();

  const handleAiDraft = async () => {
    if (!title) {
      toast({
        title: "Topic Required",
        description: "Please enter a page title or topic to use as a base for AI drafting.",
        variant: "destructive"
      });
      return;
    }

    setIsDrafting(true);
    try {
      const result = await aiContentDraftingTool({ topic: title });
      setContent(result.draftContent);
      toast({
        title: "Draft Generated",
        description: "AI has successfully generated an initial content draft.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating the AI draft. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) {
      toast({
        title: "Validation Error",
        description: "Title and Slug are required fields.",
        variant: "destructive"
      });
      return;
    }
    onSave({ title, slug, content });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/admin">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-headline font-bold">
          {isNew ? "Create New Page" : "Edit Page"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-card p-8 rounded-2xl border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-semibold">Page Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Services We Offer"
              className="bg-secondary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-base font-semibold">URL Slug</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">/</span>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="services"
                className="pl-6 bg-secondary/20 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="content" className="text-base font-semibold">Page Content</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAiDraft}
              disabled={isDrafting}
              className="text-accent border-accent hover:bg-accent hover:text-white rounded-full transition-all"
            >
              {isDrafting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Draft with AI
            </Button>
          </div>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your content here or use the AI draft tool..."
            className="min-h-[300px] bg-secondary/20 leading-relaxed text-base"
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button variant="ghost" asChild className="rounded-full">
            <Link href="/admin">Cancel</Link>
          </Button>
          <Button type="submit" className="rounded-full px-8 bg-primary hover:bg-primary/90 shadow-lg">
            <Save className="mr-2 h-4 w-4" />
            {isNew ? "Create Page" : "Update Page"}
          </Button>
        </div>
      </form>
    </div>
  );
}
