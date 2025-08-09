
import { useState, useEffect } from "react";
import { Plus, BookOpen, Settings, Trash2, BarChart3, Camera } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, DialogClose, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { listInstances, createInstance, updateInstance, deleteInstance, initializeCategories } from "@/lib/recai";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";

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

  useEffect(() => {
    document.title = "Book Management | AI Receipt Analyzer";
    loadBooks();
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
      const response = await createInstance({ name: newBookName });
      
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
      <div className="container py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Book Management</h1>
          <p className="text-muted-foreground">Create and manage your expense books</p>
        </div>
        <Dialog open={showNewBookDialog} onOpenChange={setShowNewBookDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Book
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Book</DialogTitle>
              <DialogDescription>
                Create a new expense book to organize your receipts and spending
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Book Name</Label>
                <Input
                  id="name"
                  value={newBookName}
                  onChange={(e) => setNewBookName(e.target.value)}
                  placeholder="e.g., Personal Expenses"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewBookDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBook} disabled={!newBookName.trim() || creatingBook}>
                {creatingBook ? "Creating..." : "Create Book"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Books Grid */}
      {books.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No books yet</h3>
            <p className="text-muted-foreground mb-4">Create your first expense book to get started</p>
            <Button onClick={() => setShowNewBookDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Book
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Card key={book.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{book.name}</CardTitle>
                    <CardDescription>
                      Created {new Date(book.created_at || Date.now()).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>ID: {book.id}</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleViewAnalytics(book.id)}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleScanReceipt(book.id)}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Scan Receipt
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            setEditingBook(book);
                            setEditName(book.name);
                          }}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Book</DialogTitle>
                          <DialogDescription>
                            Update the name of your expense book
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="editName">Book Name</Label>
                            <Input
                              id="editName"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditingBook(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateBook}>
                            Update
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive" className="flex-1">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Book</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{book.name}"? This action cannot be undone and will permanently delete all receipts and data in this book.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteBook(book.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
