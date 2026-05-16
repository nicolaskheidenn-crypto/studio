
"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { usePages } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Plus, ExternalLink, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { pages, deletePage, isLoaded } = usePages();
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this page?")) {
      deletePage(id);
      toast({
        title: "Page Deleted",
        description: "The page has been removed successfully.",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Manage your website's pages and content.</p>
          </div>
          <Button asChild className="rounded-full shadow-lg bg-primary hover:bg-primary/90">
            <Link href="/admin/new">
              <Plus className="mr-2 h-4 w-4" /> New Page
            </Link>
          </Button>
        </div>

        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
          {!isLoaded ? (
            <div className="p-12 text-center text-muted-foreground animate-pulse">
              Loading pages...
            </div>
          ) : pages.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-headline font-bold">No pages yet</h3>
                <p className="text-muted-foreground">Start by creating your first page.</p>
              </div>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/admin/new">Create First Page</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-bold">Page Title</TableHead>
                  <TableHead className="font-bold">Slug</TableHead>
                  <TableHead className="font-bold">Date Created</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id} className="hover:bg-muted/10 transition-colors">
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-xs">
                        /{page.slug}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(page.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild title="View Publicly">
                          <Link href={`/pages/${page.slug}`}>
                            <ExternalLink className="h-4 w-4 text-primary" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="Edit Page">
                          <Link href={`/admin/edit/${page.id}`}>
                            <Edit className="h-4 w-4 text-accent" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(page.id)}
                          title="Delete Page"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
