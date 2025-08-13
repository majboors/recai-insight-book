import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { uploadReceipt, getReceipt, patchReceipt, listInstances } from "@/lib/recai";
import { 
  Camera, 
  Upload, 
  Check, 
  Edit, 
  Trash2, 
  Plus, 
  Image, 
  ChevronLeft, 
  ChevronRight,
  Filter, 
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
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useNavigate } from "react-router-dom";

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

export default function ReceiptScanner() {
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [activeCat, setActiveCat] = useState<CategoryKey>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"most" | "recent">("most");
  const [visible, setVisible] = useState(12);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateName = searchParams.get('template');

  const filtered = seedTemplates.filter((t) => {
    if (activeCat !== "all" && t.category !== activeCat) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      if (!t.label.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sort === "most") {
      return b.usageCount - a.usageCount;
    } else {
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    }
  });

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  useEffect(() => {
    const title = templateName ? `${templateName} | AI Receipt Analyzer` : "Receipt Scanner | AI Receipt Analyzer";
    document.title = title;
    loadBooks();
  }, [templateName]);

  useEffect(() => {
    // Set up scroll listener for arrows
    const container = scrollContainerRef.current;
    if (container) {
      const updateScrollButtons = () => {
        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 1);
      };
      
      updateScrollButtons();
      container.addEventListener('scroll', updateScrollButtons);
      
      // Initial check after content loads
      const timeoutId = setTimeout(updateScrollButtons, 100);
      
      return () => {
        container.removeEventListener('scroll', updateScrollButtons);
        clearTimeout(timeoutId);
      };
    }
  }, [shown]);



  const loadBooks = async () => {
    try {
      const response = await listInstances();
      if (response?.instances) {
        setBooks(response.instances);
        if (response.instances.length > 0) {
          setSelectedBook(response.instances[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load books:", error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleScanReceipt = async () => {
    if (!uploadedFile || !selectedBook) {
      toast({
        title: "Error",
        description: "Please select a book and upload an image",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await uploadReceipt(uploadedFile, selectedBook);
      setScanResult(result);
      toast({
        title: "Success",
        description: "Receipt scanned successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to scan receipt",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCorrectItem = async (index: number, newText: string, newPrice: string) => {
    if (!scanResult?.receipt_id) return;

    try {
      const fixes = [{
        line: index,
        text: newText,
        price: parseFloat(newPrice)
      }];

      await patchReceipt(scanResult.receipt_id, {
        instance_id: selectedBook,
        fixes
      });

      // Update local state
      const updatedItems = [...scanResult.items];
      updatedItems[index] = { ...updatedItems[index], text: newText, price: parseFloat(newPrice) };
      setScanResult({ ...scanResult, items: updatedItems });
      setEditingItem(null);

      toast({
        title: "Success",
        description: "Item corrected successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to correct item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = (index: number) => {
    if (!scanResult?.items) return;
    if (!confirm("Remove this item from the extracted list?")) return;
    const updated = scanResult.items.filter((_: any, i: number) => i !== index);
    setScanResult({ ...scanResult, items: updated });
    if (editingItem !== null) {
      if (editingItem === index) setEditingItem(null);
      else if (editingItem > index) setEditingItem(editingItem - 1);
    }
    toast({ title: "Item removed", description: "The item was removed from this scan." });
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const resetScanner = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setEditingItem(null);
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{templateName || "Receipt Scanner"}</h1>
            {templateName && (
              <Badge variant="secondary" className="text-xs">
                Template
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {templateName 
              ? `Scan and process ${templateName} receipts with AI-powered recognition`
              : "Scan and process receipts with AI-powered recognition"
            }
          </p>
        </div>
        {scanResult && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button
              onClick={() => {
                if (window.history.length > 1) navigate(-1); else navigate('/analytics');
              }}
              className="w-full sm:w-auto"
            >
              <Check className="h-4 w-4 mr-2" />
              Done
            </Button>
            <Button onClick={resetScanner} variant="outline" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Scan Another
            </Button>
          </div>
        )}
      </div>

      {/* Template Selection and Search */}
      <div className="space-y-3 sm:space-y-4">
        {/* Mobile-First Templates Design */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base sm:text-lg font-semibold">Quick Templates</h3>
            
            {/* Search Section - Integrated into header */}
            <div className="relative w-full sm:max-w-xs">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search templates..."
                className="pl-8 pr-4 h-9 text-sm"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          {/* Mobile-First Category Tabs */}
          <nav aria-label="Template categories" className="mb-3 sm:mb-4">
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
                {categories.map((c) => {
                  const Icon = c.icon;
                  return (
                    <Button
                      key={c.key}
                      variant={activeCat === c.key ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setActiveCat(c.key)}
                      className="rounded-full flex items-center justify-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 min-w-fit h-8 sm:h-9"
                      aria-pressed={activeCat === c.key}
                    >
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden xs:inline">{c.label}</span>
                      <span className="xs:hidden">{c.label.split(' ')[0]}</span>
                    </Button>
                  );
                })}
            </div>
          </nav>

          {/* Mobile-First Templates Grid - Single Row Scrollable with Navigation */}
          <div className="relative px-8 sm:px-10">
            {/* Left Arrow */}
            <Button
              variant="outline"
              size="icon"
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/95 backdrop-blur-sm shadow-lg border-2 transition-all duration-200 ${
                canScrollLeft 
                  ? 'opacity-100 hover:bg-background hover:scale-105' 
                  : 'opacity-0 pointer-events-none'
              }`}
              onClick={scrollLeft}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Right Arrow */}
            <Button
              variant="outline"
              size="icon"
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/95 backdrop-blur-sm shadow-lg border-2 transition-all duration-200 ${
                canScrollRight 
                  ? 'opacity-100 hover:bg-background hover:scale-105' 
                  : 'opacity-0 pointer-events-none'
              }`}
              onClick={scrollRight}
              disabled={!canScrollRight}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div ref={scrollContainerRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
                 style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {shown.slice(0, 12).map((t) => {
              const Icon = t.icon;
              return (
                <article 
                  key={t.id} 
                  className={`group rounded-xl border-2 transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-lg flex-shrink-0 w-20 sm:w-24 ${
                    templateName === t.label 
                      ? "border-primary bg-primary/5 shadow-md" 
                      : "border-border bg-card hover:bg-accent/50 hover:border-primary/30"
                  }`}
                  onClick={() => {
                    const url = new URL(window.location.href);
                    if (templateName === t.label) {
                      url.searchParams.delete('template');
                    } else {
                      url.searchParams.set('template', t.label);
                    }
                    window.history.pushState({}, '', url);
                    window.location.reload();
                  }}
                >
                  <div className="p-2 sm:p-3 text-center h-full flex flex-col justify-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        templateName === t.label 
                          ? "bg-primary text-primary-foreground shadow-lg" 
                          : "bg-gradient-to-br from-primary/10 to-primary/20 text-primary group-hover:from-primary/20 group-hover:to-primary/30"
                      }`}>
                        <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                      </div>
                    </div>
                    <h3 className={`text-xs font-medium text-center truncate leading-tight ${
                      templateName === t.label ? "text-primary" : "text-foreground"
                    }`} title={t.label}>
                      {t.label.length > 8 ? t.label.substring(0, 8) + '...' : t.label}
                    </h3>
                    <p className="text-xs text-muted-foreground text-center mt-0.5 leading-tight">
                      {t.usageCount}
                    </p>
                  </div>
                </article>
              );
            })}

            {/* Add Custom Template Card - Single Row Design */}
            <article className="group rounded-xl border-2 border-dashed border-border bg-card flex-shrink-0 w-20 sm:w-24 flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 cursor-pointer">
              <div className="p-2 sm:p-3 text-center h-full flex flex-col justify-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-primary group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-200">
                    <Plus className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                </div>
                <h3 className="text-xs font-medium text-center truncate leading-tight">Custom</h3>
                <p className="text-xs text-muted-foreground text-center mt-0.5 leading-tight">New</p>
              </div>
            </article>
            </div>
          </div>

          {/* Load more - Only show if there are more templates */}
          {filtered.length > 12 && (
            <div className="flex justify-center mt-6">
              <Button 
                onClick={() => setVisible((v) => Math.min(v + 12, filtered.length))} 
                variant="outline"
                className="px-8 py-2 rounded-full"
              >
                Load More Templates
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!shown.length && (
            <div className="text-center py-16 text-muted-foreground">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Search className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No templates found</h3>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Upload Receipt</CardTitle>
            <CardDescription className="text-sm">Select a book and upload your receipt image</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Book Selection */}
            <div className="space-y-2">
              <Label className="text-sm">Select Book</Label>
              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger className="h-9 sm:h-10">
                  <SelectValue placeholder="Choose a book" />
                </SelectTrigger>
                <SelectContent>
                  {books.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div className="space-y-3 sm:space-y-4">
              <Label className="text-sm">Receipt Image</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 sm:p-6 md:p-8 text-center">
                {previewUrl ? (
                  <div className="space-y-3 sm:space-y-4">
                    <img 
                      src={previewUrl} 
                      alt="Receipt preview" 
                      className="max-w-full max-h-48 sm:max-h-64 mx-auto rounded-md"
                    />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('receipt-upload')?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    <Image className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG or JPEG (max 10MB)
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('receipt-upload')?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                )}
                <Input
                  id="receipt-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Scan Button */}
            <Button 
              onClick={handleScanReceipt} 
              disabled={!uploadedFile || !selectedBook || loading}
              className="w-full h-10 sm:h-11"
            >
              {loading ? (
                "Scanning..."
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Scan Receipt
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Scan Results</CardTitle>
            <CardDescription className="text-sm">
              {scanResult ? "Review and correct the extracted data" : "Upload and scan a receipt to see results"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!scanResult ? (
              <div className="text-center py-8 sm:py-12">
                <Camera className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                <p className="text-sm text-muted-foreground">No receipt scanned yet</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Receipt Info */}
                <div className="space-y-2">
                  <h3 className="text-sm sm:text-base font-medium">Receipt Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    {scanResult.vendor && (
                      <div>
                        <span className="text-muted-foreground">Vendor:</span>
                        <div className="font-medium break-words">{scanResult.vendor}</div>
                      </div>
                    )}
                    {scanResult.date && (
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <div className="font-medium">{scanResult.date}</div>
                      </div>
                    )}
                    {scanResult.receipt_id && (
                      <div className="sm:col-span-2">
                        <span className="text-muted-foreground">Receipt ID:</span>
                        <div className="font-medium break-all text-xs sm:text-sm">{scanResult.receipt_id}</div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Items List */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-sm sm:text-base font-medium">Extracted Items</h3>
                  {scanResult.items?.map((item: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3 sm:p-4">
                      {editingItem === index ? (
                        <EditItemForm
                          item={item}
                          index={index}
                          onSave={handleCorrectItem}
                          onCancel={() => setEditingItem(null)}
                        />
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm sm:text-base break-words">{item.text}</div>
                            <div className="text-xs sm:text-sm text-muted-foreground break-words">
                              PKR {item.price?.toFixed(2)} • Category: {item.category_name || item.category_id || "Unknown"}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingItem(index)}
                              aria-label="Edit item"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(index)}
                              aria-label="Delete item"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Total */}
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between items-center font-medium text-sm sm:text-base">
                    <span>Total</span>
                    <span>
                      PKR {scanResult.total?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  {scanResult.total_warning && (
                    <div className="p-2 sm:p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="text-yellow-600 dark:text-yellow-400 text-xs sm:text-sm">
                          ⚠️ {scanResult.total_warning}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Debug Section */}
                <Separator />
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="font-medium text-xs sm:text-sm">Debug - Raw API Response</h3>
                  <div className="bg-muted/50 rounded-lg p-2 sm:p-3 overflow-auto max-h-40 sm:max-h-60">
                    <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                      {JSON.stringify(scanResult, null, 2)}
                    </pre>
                  </div>
                </div>

                <Separator />
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      if (window.history.length > 1) navigate(-1); else navigate('/analytics');
                    }}
                    className="w-full sm:w-auto"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Done
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface EditItemFormProps {
  item: any;
  index: number;
  onSave: (index: number, text: string, price: string) => void;
  onCancel: () => void;
}

function EditItemForm({ item, index, onSave, onCancel }: EditItemFormProps) {
  const [text, setText] = useState(item.text || "");
  const [price, setPrice] = useState(item.price?.toString() || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(index, text, price);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor={`text-${index}`}>Item Name</Label>
        <Input
          id={`text-${index}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Item name"
        />
      </div>
      <div>
        <Label htmlFor={`price-${index}`}>Price</Label>
        <Input
          id={`price-${index}`}
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          <Check className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}