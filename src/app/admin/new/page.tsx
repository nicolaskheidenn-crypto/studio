
"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { PageEditor } from "@/components/PageEditor";
import { usePages } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function NewPage() {
  const { addPage } = usePages();
  const router = useRouter();
  const { toast } = useToast();

  const handleSave = (data: { title: string; slug: string; content: string }) => {
    addPage(data);
    toast({
      title: "Page Created",
      description: "Your new page has been published successfully.",
    });
    router.push("/admin");
  };

  return (
    <AdminLayout>
      <PageEditor onSave={handleSave} isNew />
    </AdminLayout>
  );
}
