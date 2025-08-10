import { useState, useEffect } from "react";
import { Plus, BookOpen, Settings, Trash2, BarChart3, Camera, Copy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { listInstances, createInstance, updateInstance, deleteInstance, initializeCategories } from "@/lib/recai";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { TourOverlay } from "@/components/guided/TourOverlay";

export default function BookManagement() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBookName, setNewBookName] = useState("");
  const [editingBook, setEditingBook] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [showNewBookDialog, setShowNewBookDialog] = useState(false);
  const [creatingBook, setCreatingBook] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showTour, setShowTour] = useState(false);
  const tourSteps = [
    { selector: "[data-tour-id='new-book']", title: "Create a Book", description: "Start by creating your first workspace." },
    { selector: "[data-tour-id='scan-receipt']", title: "Scan Receipts", description: "Upload receipts to parse transactions." },
  ];

  useEffect(() => {
    document.title = "Book Management | AI Receipt Analyzer";
    loadBooks();
    if (!localStorage.getItem("tour_seen_books")) setShowTour(true);
  }, []);

  const loadBooks = async () => {
    try {
      const response = await listInstances();
      if (response?.instances) {
        setBooks(response.instances);
      }
    } catch (error) {
      console.error("Failed to load books:", error);
      toast({
        title: "Error",
        description: "Failed to load books",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBook = async () => {
    if (!newBookName.trim()) return;
    
    setCreatingBook(true);
    try {
      const response: any = await createInstance({ name: newBookName });
      
      if (response?.instance_id) {
        // Initialize with default categories
        await initializeCategories(response.instance_id, "Food, Transportation, Entertainment, Shopping, Utilities, Healthcare, Travel, Business");
      }
      
      setNewBookName("");
      setShowNewBookDialog(false);
      loadBooks();
      toast({
        title: "Success",
        description: "Book created successfully"
      });
    } catch (error) {
      console.error("Failed to create book:", error);
      toast({
        title: "Error",
        description: "Failed to create book",
        variant: "destructive"
      });
    } finally {
      setCreatingBook(false);
    }
  };

  const handleUpdateBook = async () => {
    if (!editingBook || !editName.trim()) return;
    
    try {
      await updateInstance(editingBook.id, { name: editName });
      setEditingBook(null);
      setEditName("");
      loadBooks();
      toast({
        title: "Success",
        description: "Book updated successfully"
      });
    } catch (error) {
      console.error("Failed to update book:", error);
      toast({
        title: "Error",
        description: "Failed to update book",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
      await deleteInstance(bookId);
      loadBooks();
      toast({
        title: "Success",
        description: "Book deleted successfully"
      });
    } catch (error) {
      console.error("Failed to delete book:", error);
      toast({
        title: "Error",
        description: "Failed to delete book",
        variant: "destructive"
      });
    }
  };

  const handleViewAnalytics = (bookId: string) => {
    navigate(`/analytics?book=${bookId}`);
  };

  const handleScanReceipt = (bookId: string) => {
    navigate(`/scanner?book=${bookId}`);
  };

  if (loading) {
    return (
      <div className="container-zen py-6">
        <div className="grid-zen grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-32"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-zen py-6 space-zen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="heading-zen text-2xl sm:text-3xl">Book Management</h1>
          <p className="text-zen text-sm">Create and manage your expense books</p>
        </div>
        <Dialog open={showNewBookDialog} onOpenChange={setShowNewBookDialog}>
          <DialogTrigger asChild>
            <Button className="btn-zen w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Book
            </Button>
          </DialogTrigger>
          <DialogContent className="card-zen mx-4">
            <DialogHeader>
              <DialogTitle className="heading-zen">Create New Book</DialogTitle>
              <DialogDescription className="text-zen">
                Create a new expense book to organize your receipts and spending
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-medium">Book Name</Label>
                <Input
                  id="name"
                  value={newBookName}
                  onChange={(e) => setNewBookName(e.target.value)}
                  placeholder="e.g., Personal Expenses"
                  className="focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowNewBookDialog(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={handleCreateBook} disabled={!newBookName.trim() || creatingBook} className="w-full sm:w-auto">
                {creatingBook ? "Creating..." : "Create Book"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Books Grid */}
      {books.length === 0 ? (
        <Card className="card-zen text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="heading-zen text-lg mb-2">No books yet</h3>
            <p className="text-zen mb-4">Create your first expense book to get started</p>
            <Button onClick={() => setShowNewBookDialog(true)} className="btn-zen">
              <Plus className="h-4 w-4 mr-2" />
              Create First Book
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid-zen grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Card key={book.id} className="card-zen group hover:shadow-medium transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="heading-zen text-lg truncate">{book.name}</CardTitle>
                    <CardDescription className="text-zen text-xs">
                      Created {new Date(book.created_at || Date.now()).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-2 text-xs">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className="text-xs text-muted-foreground font-mono cursor-pointer hover:text-primary hover:bg-accent/20 rounded p-2 transition-colors flex items-center gap-1"
                  onClick={() => {
                    navigator.clipboard.writeText(book.id);
                    toast({ title: "Copied!", description: "Book ID copied to clipboard" });
                  }}
                  title="Click to copy full ID"
                >
                  <Copy className="h-3 w-3" />
                  <p>ID: {book.id.slice(0, 8)}...</p>
                </div>
                
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs h-8"
                      onClick={() => handleViewAnalytics(book.id)}
                    >
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Analytics
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs h-8"
                      onClick={() => handleScanReceipt(book.id)}
                    >
                      <Camera className="h-3 w-3 mr-1" />
                      Scan
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full text-xs h-8"
                          onClick={() => {
                            setEditingBook(book);
                            setEditName(book.name);
                          }}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="card-zen mx-4">
                        <DialogHeader>
                          <DialogTitle className="heading-zen">Edit Book</DialogTitle>
                          <DialogDescription className="text-zen">
                            Update the name of your expense book
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="editName" className="text-sm font-medium">Book Name</Label>
                            <Input
                              id="editName"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                          <Button variant="outline" onClick={() => setEditingBook(null)} className="w-full sm:w-auto">
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateBook} className="w-full sm:w-auto">
                            Update
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive" className="w-full text-xs h-8">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="mx-4">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="heading-zen">Delete Book</AlertDialogTitle>
                          <AlertDialogDescription className="text-zen">
                            Are you sure you want to delete "{book.name}"? This action cannot be undone and will permanently delete all receipts and data in this book.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                          <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteBook(book.id)}
                            className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}