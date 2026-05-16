
"use client";

import { useEffect, useState } from "react";

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  createdAt: string;
}

const DEFAULT_PAGES: Page[] = [
  {
    id: "1",
    slug: "home",
    title: "Welcome to WebCraft Hub",
    content: "WebCraft Hub is your ultimate platform for building modern, responsive websites with ease. Use our AI tools to draft content and manage your pages effortlessly.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    slug: "about",
    title: "About Our Mission",
    content: "We believe in empowering creators through simple yet powerful digital tools. Our mission is to bridge the gap between complex development and intuitive design.",
    createdAt: new Date().toISOString(),
  }
];

export function usePages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("webcraft_pages");
    if (stored) {
      setPages(JSON.parse(stored));
    } else {
      setPages(DEFAULT_PAGES);
      localStorage.setItem("webcraft_pages", JSON.stringify(DEFAULT_PAGES));
    }
    setIsLoaded(true);
  }, []);

  const savePages = (newPages: Page[]) => {
    setPages(newPages);
    localStorage.setItem("webcraft_pages", JSON.stringify(newPages));
  };

  const addPage = (page: Omit<Page, "id" | "createdAt">) => {
    const newPage: Page = {
      ...page,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    const updated = [...pages, newPage];
    savePages(updated);
    return newPage;
  };

  const updatePage = (id: string, updates: Partial<Page>) => {
    const updated = pages.map((p) => (p.id === id ? { ...p, ...updates } : p));
    savePages(updated);
  };

  const deletePage = (id: string) => {
    const updated = pages.filter((p) => p.id !== id);
    savePages(updated);
  };

  return { pages, isLoaded, addPage, updatePage, deletePage };
}
