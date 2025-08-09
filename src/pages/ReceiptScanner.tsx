import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { uploadReceipt, getReceipt, patchReceipt, listInstances } from "@/lib/recai";
import { Camera, Upload, Check, Edit, Trash2, Plus, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ReceiptScanner() {
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Receipt Scanner | AI Receipt Analyzer";
    loadBooks();
  }, []);

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

  const resetScanner = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setEditingItem(null);
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receipt Scanner</h1>
          <p className="text-muted-foreground">Scan and process receipts with AI-powered recognition</p>
        </div>
        {scanResult && (
          <Button onClick={resetScanner} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Scan Another
          </Button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Receipt</CardTitle>
            <CardDescription>Select a book and upload your receipt image</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Book Selection */}
            <div className="space-y-2">
              <Label>Select Book</Label>
              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger>
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
            <div className="space-y-4">
              <Label>Receipt Image</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                {previewUrl ? (
                  <div className="space-y-4">
                    <img 
                      src={previewUrl} 
                      alt="Receipt preview" 
                      className="max-w-full max-h-64 mx-auto rounded-md"
                    />
                    <Button variant="outline" onClick={() => document.getElementById('receipt-upload')?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Image className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG or JPEG (max 10MB)
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => document.getElementById('receipt-upload')?.click()}>
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
              className="w-full"
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
          <CardHeader>
            <CardTitle>Scan Results</CardTitle>
            <CardDescription>
              {scanResult ? "Review and correct the extracted data" : "Upload and scan a receipt to see results"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!scanResult ? (
              <div className="text-center py-12">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No receipt scanned yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Receipt Info */}
                <div className="space-y-2">
                  <h3 className="font-medium">Receipt Details</h3>
                  <div className="text-sm text-muted-foreground">
                    Receipt ID: {scanResult.receipt_id}
                  </div>
                </div>

                <Separator />

                {/* Items List */}
                <div className="space-y-4">
                  <h3 className="font-medium">Extracted Items</h3>
                  {scanResult.items?.map((item: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      {editingItem === index ? (
                        <EditItemForm
                          item={item}
                          index={index}
                          onSave={handleCorrectItem}
                          onCancel={() => setEditingItem(null)}
                        />
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{item.text}</div>
                            <div className="text-sm text-muted-foreground">
                              ${item.price?.toFixed(2)} • Category: {item.category_id || "Unknown"}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingItem(index)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Total */}
                <Separator />
                <div className="flex justify-between items-center font-medium">
                  <span>Total</span>
                  <span>
                    ${scanResult.items?.reduce((sum: number, item: any) => sum + (item.price || 0), 0).toFixed(2)}
                  </span>
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