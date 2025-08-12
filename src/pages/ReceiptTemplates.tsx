import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Filter, 
  Plus, 
  Zap, 
  Droplets, 
  Flame, 
  Car, 
  Bus, 
  Fuel, 
  Smartphone, 
  ShoppingCart, 
  ShoppingBag, 
  Film, 
  Circle,
     Coffee,
   Pizza,
   Utensils,
  Wifi,
  Home,
  Building2,
  CreditCard,
  Receipt,
  Wallet,
  PiggyBank,
  Gift,
  Heart,
  BookOpen,
  Gamepad,
  Music,
  Camera,
  Plane,
  Train,
  Ship,
  Bike,
  Carrot,
  Apple,
  Milk,
  Egg,
  Fish,
  Hospital,
  Stethoscope,
  Pill,
  GraduationCap,
  Book,
  PenTool,
  Palette,
  Activity,
  Trophy,
  Calendar,
  Clock,
  Star,
  Crown,
  Diamond,
  Sparkles,
  Search
} from "lucide-react";

// Types
interface TemplateItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: CategoryKey;
  usageCount: number;
  createdAt: string; // ISO date
}

const categories = [
  { key: "all", label: "All", icon: Sparkles },
  { key: "utilities", label: "Utilities", icon: Zap },
  { key: "food", label: "Food & Drink", icon: Coffee },
  { key: "transport", label: "Transport", icon: Car },
  { key: "mobile", label: "Mobile", icon: Smartphone },
  { key: "groceries", label: "Groceries", icon: ShoppingCart },
  { key: "leisure", label: "Leisure", icon: Film },
  { key: "health", label: "Health", icon: Stethoscope },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "shopping", label: "Shopping", icon: ShoppingBag },
] as const;

type CategoryKey = typeof categories[number]["key"];

const seedTemplates: TemplateItem[] = [
  // Utilities
  { id: "ke", label: "K-Electric", icon: Zap, category: "utilities", usageCount: 42, createdAt: "2025-06-10" },
  { id: "kwsb", label: "KWSB", icon: Droplets, category: "utilities", usageCount: 31, createdAt: "2025-06-08" },
  { id: "sngpl", label: "SNGPL", icon: Flame, category: "utilities", usageCount: 18, createdAt: "2025-05-22" },
  { id: "lesco", label: "LESCO", icon: Zap, category: "utilities", usageCount: 12, createdAt: "2025-04-30" },
  { id: "wifi", label: "WiFi Bill", icon: Wifi, category: "utilities", usageCount: 15, createdAt: "2025-05-15" },
  { id: "internet", label: "Internet", icon: Wifi, category: "utilities", usageCount: 8, createdAt: "2025-04-20" },
  
  // Food & Drink
  { id: "mcd", label: "McDonald's", icon: Utensils, category: "food", usageCount: 27, createdAt: "2025-06-12" },
  { id: "dhaba", label: "Local Dhaba", icon: Coffee, category: "food", usageCount: 21, createdAt: "2025-06-11" },
  { id: "ph", label: "Pizza Hut", icon: Pizza, category: "food", usageCount: 14, createdAt: "2025-05-26" },
  { id: "restaurant", label: "Restaurant", icon: Utensils, category: "food", usageCount: 19, createdAt: "2025-06-05" },
  { id: "cafe", label: "Café", icon: Coffee, category: "food", usageCount: 16, createdAt: "2025-05-30" },
  { id: "fastfood", label: "Fast Food", icon: Utensils, category: "food", usageCount: 23, createdAt: "2025-06-08" },
  
  // Transport
  { id: "careem", label: "Careem", icon: Car, category: "transport", usageCount: 45, createdAt: "2025-06-09" },
  { id: "bus", label: "Bus Fare", icon: Bus, category: "transport", usageCount: 9, createdAt: "2025-05-29" },
  { id: "fuel", label: "Fuel", icon: Fuel, category: "transport", usageCount: 38, createdAt: "2025-04-18" },
  { id: "uber", label: "Uber", icon: Car, category: "transport", usageCount: 32, createdAt: "2025-06-03" },
  { id: "train", label: "Train", icon: Train, category: "transport", usageCount: 7, createdAt: "2025-05-25" },
  { id: "parking", label: "Parking", icon: Car, category: "transport", usageCount: 12, createdAt: "2025-05-28" },
  
  // Mobile
  { id: "jazz", label: "Jazz Recharge", icon: Smartphone, category: "mobile", usageCount: 33, createdAt: "2025-06-07" },
  { id: "zong", label: "Zong Recharge", icon: Smartphone, category: "mobile", usageCount: 15, createdAt: "2025-06-05" },
  { id: "telenor", label: "Telenor Recharge", icon: Smartphone, category: "mobile", usageCount: 17, createdAt: "2025-05-03" },
  { id: "ufone", label: "Ufone Recharge", icon: Smartphone, category: "mobile", usageCount: 11, createdAt: "2025-05-20" },
  
  // Groceries
  { id: "imtiaz", label: "Imtiaz", icon: ShoppingCart, category: "groceries", usageCount: 22, createdAt: "2025-06-10" },
  { id: "carrefour", label: "Carrefour", icon: ShoppingBag, category: "groceries", usageCount: 16, createdAt: "2025-06-06" },
  { id: "hyperstar", label: "Hyperstar", icon: ShoppingCart, category: "groceries", usageCount: 14, createdAt: "2025-05-29" },
  { id: "metro", label: "Metro", icon: ShoppingBag, category: "groceries", usageCount: 8, createdAt: "2025-05-15" },
  { id: "fruits", label: "Fruits", icon: Apple, category: "groceries", usageCount: 19, createdAt: "2025-06-08" },
  { id: "vegetables", label: "Vegetables", icon: Carrot, category: "groceries", usageCount: 25, createdAt: "2025-06-12" },
  
  // Leisure
  { id: "cinema", label: "Cinema", icon: Film, category: "leisure", usageCount: 7, createdAt: "2025-05-20" },
  { id: "park", label: "Theme Park", icon: Circle, category: "leisure", usageCount: 3, createdAt: "2025-04-10" },
  { id: "gym", label: "Gym", icon: Activity, category: "leisure", usageCount: 12, createdAt: "2025-05-25" },
  { id: "games", label: "Gaming", icon: Gamepad, category: "leisure", usageCount: 5, createdAt: "2025-04-28" },
  { id: "music", label: "Music", icon: Music, category: "leisure", usageCount: 9, createdAt: "2025-05-18" },
  { id: "books", label: "Books", icon: BookOpen, category: "leisure", usageCount: 6, createdAt: "2025-05-12" },
  
  // Health
  { id: "pharmacy", label: "Pharmacy", icon: Pill, category: "health", usageCount: 8, createdAt: "2025-06-02" },
  { id: "hospital", label: "Hospital", icon: Hospital, category: "health", usageCount: 3, createdAt: "2025-05-10" },
  { id: "doctor", label: "Doctor", icon: Stethoscope, category: "health", usageCount: 5, createdAt: "2025-04-25" },
  { id: "dental", label: "Dental", icon: Stethoscope, category: "health", usageCount: 2, createdAt: "2025-04-15" },
  
  // Education
  { id: "tuition", label: "Tuition", icon: GraduationCap, category: "education", usageCount: 15, createdAt: "2025-06-01" },
  { id: "books_edu", label: "Books", icon: Book, category: "education", usageCount: 11, createdAt: "2025-05-22" },
  { id: "stationery", label: "Stationery", icon: PenTool, category: "education", usageCount: 7, createdAt: "2025-05-08" },
  { id: "course", label: "Online Course", icon: GraduationCap, category: "education", usageCount: 4, createdAt: "2025-04-30" },
  
  // Shopping
  { id: "clothing", label: "Clothing", icon: ShoppingBag, category: "shopping", usageCount: 18, createdAt: "2025-06-04" },
  { id: "electronics", label: "Electronics", icon: Smartphone, category: "shopping", usageCount: 6, createdAt: "2025-05-16" },
  { id: "cosmetics", label: "Cosmetics", icon: Sparkles, category: "shopping", usageCount: 13, createdAt: "2025-05-28" },
  { id: "gifts", label: "Gifts", icon: Gift, category: "shopping", usageCount: 9, createdAt: "2025-05-14" },
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
  const navigate = useNavigate();

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
    <div className="pb-24 sm:pb-0 w-full max-w-full">
      <header className="mb-4 sm:mb-6 px-4 sm:px-0">
        <h1 className="heading-zen text-xl sm:text-2xl">Select a Template</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Choose a category and template to quickly log expenses.
        </p>
      </header>

      {/* Search + Filter */}
      <section aria-label="Search and filter" className="mb-4 sm:mb-6 px-4 sm:px-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates..."
              aria-label="Search templates"
              className="w-full"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" aria-label="Sort templates" className="shrink-0">
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

      {/* Category Tabs - Responsive grid instead of horizontal scroll */}
      <nav aria-label="Template categories" className="mb-4 sm:mb-6 px-4 sm:px-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <Button
                  key={c.key}
                  variant={activeCat === c.key ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setActiveCat(c.key)}
                  className="rounded-lg flex items-center justify-center gap-1.5 py-2 px-3 text-xs"
                  aria-pressed={activeCat === c.key}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="truncate">{c.label}</span>
                </Button>
              );
            })}
        </div>
      </nav>

      {/* Templates Grid */}
      <main className="px-4 sm:px-0">
        <section aria-label="Templates list">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {shown.map((t) => {
              const Icon = t.icon;
              return (
                <article 
                  key={t.id} 
                  className="group rounded-xl border border-border bg-card p-3 hover:scale-105 hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/scanner?template=${encodeURIComponent(t.label)}`)}
                >
                  <button className="w-full text-left" aria-label={`Use template ${t.label}`} type="button">
                    <div className="flex items-center justify-center mb-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-primary group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-200">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <h3 className="text-xs font-medium text-center truncate" title={t.label}>
                      {t.label}
                    </h3>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      {t.usageCount} uses
                    </p>
                  </button>
                </article>
              );
            })}

            {/* Add Custom Template Card */}
            <article className="group rounded-xl border-2 border-dashed border-border bg-card p-4 flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 cursor-pointer">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-primary group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-200 mb-3">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-medium">Add Custom</h3>
              <p className="text-xs text-muted-foreground mt-1">Create template</p>
            </article>
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-8" aria-hidden />

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button 
                onClick={() => setVisible((v) => Math.min(v + 12, filtered.length))} 
                variant="outline"
                className="px-6"
              >
                Load more templates
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!shown.length && (
            <div className="text-center py-16 text-muted-foreground">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium mb-2">No templates found</h3>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
