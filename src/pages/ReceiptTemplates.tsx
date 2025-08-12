import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Filter, Plus } from "lucide-react";

// Types
interface TemplateItem {
  id: string;
  label: string;
  emoji: string;
  category: CategoryKey;
  usageCount: number;
  createdAt: string; // ISO date
}

const categories = [
  { key: "all", label: "All" },
  { key: "utilities", label: "Utilities ⚡" },
  { key: "food", label: "Food & Drink 🍵" },
  { key: "transport", label: "Transport 🚌" },
  { key: "mobile", label: "Mobile 📱" },
  { key: "groceries", label: "Groceries 🛒" },
  { key: "leisure", label: "Leisure 🎉" },
] as const;

type CategoryKey = typeof categories[number]["key"]; // "all" | "utilities" | ...

const seedTemplates: TemplateItem[] = [
  // Utilities
  { id: "ke", label: "K-Electric", emoji: "⚡", category: "utilities", usageCount: 42, createdAt: "2025-06-10" },
  { id: "kwsb", label: "KWSB", emoji: "💧", category: "utilities", usageCount: 31, createdAt: "2025-06-08" },
  { id: "sngpl", label: "SNGPL", emoji: "🔥", category: "utilities", usageCount: 18, createdAt: "2025-05-22" },
  { id: "lesco", label: "LESCO", emoji: "⚡", category: "utilities", usageCount: 12, createdAt: "2025-04-30" },
  // Food & Drink
  { id: "mcd", label: "McDonald’s", emoji: "🍔", category: "food", usageCount: 27, createdAt: "2025-06-12" },
  { id: "dhaba", label: "Local Dhaba", emoji: "🍵", category: "food", usageCount: 21, createdAt: "2025-06-11" },
  { id: "ph", label: "Pizza Hut", emoji: "🍕", category: "food", usageCount: 14, createdAt: "2025-05-26" },
  // Transport
  { id: "careem", label: "Careem", emoji: "🚗", category: "transport", usageCount: 45, createdAt: "2025-06-09" },
  { id: "bus", label: "Bus Fare", emoji: "🚌", category: "transport", usageCount: 9, createdAt: "2025-05-29" },
  { id: "fuel", label: "Fuel", emoji: "⛽", category: "transport", usageCount: 38, createdAt: "2025-04-18" },
  // Mobile
  { id: "jazz", label: "Jazz Recharge", emoji: "📱", category: "mobile", usageCount: 33, createdAt: "2025-06-07" },
  { id: "zong", label: "Zong Recharge", emoji: "📱", category: "mobile", usageCount: 15, createdAt: "2025-06-05" },
  { id: "telenor", label: "Telenor Recharge", emoji: "📱", category: "mobile", usageCount: 17, createdAt: "2025-05-03" },
  // Groceries
  { id: "grocer1", label: "Imtiaz", emoji: "🛒", category: "groceries", usageCount: 22, createdAt: "2025-06-10" },
  { id: "grocer2", label: "Carrefour", emoji: "🛍️", category: "groceries", usageCount: 16, createdAt: "2025-06-06" },
  // Leisure
  { id: "cinema", label: "Cinema", emoji: "🎬", category: "leisure", usageCount: 7, createdAt: "2025-05-20" },
  { id: "park", label: "Theme Park", emoji: "🎢", category: "leisure", usageCount: 3, createdAt: "2025-04-10" },
];

export default function ReceiptTemplates() {
  // SEO
  useEffect(() => {
    document.title = "Select a Template | WalletWala";
    const desc = "Choose a category and template to quickly log expenses.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
  }, []);

  const [activeCat, setActiveCat] = useState<CategoryKey>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"most" | "recent">("most");
  const [visible, setVisible] = useState(12);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    let list = seedTemplates;
    if (activeCat !== "all") list = list.filter((t) => t.category === activeCat);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((t) => t.label.toLowerCase().includes(q));
    }
    if (sort === "most") {
      list = [...list].sort((a, b) => b.usageCount - a.usageCount);
    } else {
      list = [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    return list;
  }, [activeCat, query, sort]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setVisible((v) => Math.min(v + 12, filtered.length));
      }
    }, { rootMargin: "150px" });
    obs.observe(node);
    return () => obs.disconnect();
  }, [filtered.length]);

  useEffect(() => {
    // Reset shown items when filter changes
    setVisible(12);
  }, [activeCat, query, sort]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <>
      <header className="mb-4">
        <h1 className="heading-zen text-2xl">Select a Template</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a category and template to quickly log expenses.
        </p>
      </header>

      {/* Search + Filter */}
      <section aria-label="Search and filter" className="mb-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates..."
              aria-label="Search templates"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" aria-label="Sort templates">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSort("most")}>
                Most Used {sort === "most" && <Badge variant="secondary" className="ml-2">Active</Badge>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("recent")}>
                Recently Added {sort === "recent" && <Badge variant="secondary" className="ml-2">Active</Badge>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      {/* Category Tabs - Horizontal scroll */}
      <nav aria-label="Template categories" className="mb-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2 overflow-x-auto">
            {categories.map((c) => (
              <Button
                key={c.key}
                variant={activeCat === c.key ? "secondary" : "outline"}
                size="sm"
                onClick={() => setActiveCat(c.key)}
                className="rounded-full"
                aria-pressed={activeCat === c.key}
              >
                {c.label}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </nav>

      {/* Templates Grid */}
      <main>
        <section aria-label="Templates list">
          <div
            className="grid gap-3 sm:gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}
          >
            {shown.map((t) => (
              <article key={t.id} className="rounded-lg border border-border bg-card p-4 hover-scale shadow-soft transition-colors">
                <button className="w-full text-left">
                  <div className="flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-accent/40 flex items-center justify-center text-2xl">
                      <span aria-hidden>{t.emoji}</span>
                    </div>
                  </div>
                  <h3 className="mt-3 text-sm font-medium text-center truncate" title={t.label}>
                    {t.label}
                  </h3>
                </button>
              </article>
            ))}

            {/* Add Custom Template Card */}
            <article className="rounded-lg border border-dashed border-border bg-card p-4 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bg-accent/30 flex items-center justify-center">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-medium">Add Custom Template</h3>
              <p className="text-xs text-muted-foreground mt-1">Create your own quick template</p>
              <Button variant="outline" size="sm" className="mt-2">Add</Button>
            </article>
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-8" aria-hidden />

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center mt-2">
              <Button onClick={() => setVisible((v) => Math.min(v + 12, filtered.length))} variant="secondary">
                Load more
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!shown.length && (
            <div className="text-center py-10 text-muted-foreground">
              No templates match your search.
            </div>
          )}
        </section>
      </main>
    </>
  );
}
