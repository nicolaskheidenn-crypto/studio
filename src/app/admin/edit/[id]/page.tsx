
"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { PageEditor } from "@/components/PageEditor";
import { usePages } from "@/lib/store";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Page } from "@/lib/store";

export default function EditPage() {
  const { pages, updatePage, isLoaded } = usePages();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [page, setPage] = useState<Page | null>(null);

  useEffect(() => {
    if (isLoaded) {
      const found = pages.find(p => p.id === params.id);
      if (found) {
        setPage(found);
      } else {
        router.push("/admin");
      }
    }
  }, [isLoaded, pages, params.id, router]);

  const handleSave = (data: { title: string; slug: string; content: string }) => {
    if (page) {
      updatePage(page.id, data);
      toast({
        title: "Page Updated",
        description: "Your changes have been saved successfully.",
      });
      router.push("/admin");
    }
  };

  if (!page) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64 animate-pulse">
        <p className="text-muted-foreground">Loading page data...</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <PageEditor initialData={page} onSave={handleSave} />
    </AdminLayout>
  );
}
