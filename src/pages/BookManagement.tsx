import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { listInstances, createInstance, updateInstance, deleteInstance } from "@/lib/recai";
import { Plus, Edit, Trash2, Book, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function BookManagement() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const { toast } = useToast();

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
      toast({
        title: "Error",
        description: "Failed to load books",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBook = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    try {
      await createInstance({ name, description: description || undefined });
      toast({
        title: "Success",
        description: "Book created successfully",
      });
      setShowCreateDialog(false);
      loadBooks();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create book",
        variant: "destructive",
      });
    }
  };

  const handleEditBook = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    try {
      await updateInstance(editingBook.id, { name, description: description || undefined });
      toast({
        title: "Success",
        description: "Book updated successfully",
      });
      setEditingBook(null);
      loadBooks();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update book",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
      await deleteInstance(bookId);
      toast({
        title: "Success",
        description: "Book deleted successfully",
      });
      loadBooks();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete book",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="h-3 bg-muted rounded w-48"></div>
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
          <p className="text-muted-foreground">Create and manage your expense tracking workspaces</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Book
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Book</DialogTitle>
              <DialogDescription>Create a new expense tracking workspace</DialogDescription>
            </DialogHeader>
            <form action={handleCreateBook} className="space-y-4">
              <div>
                <Label htmlFor="name">Book Name</Label>
                <Input id="name" name="name" placeholder="e.g., Personal Expenses" required />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input id="description" name="description" placeholder="e.g., My personal monthly expenses" />
              </div>
              <Button type="submit" className="w-full">Create Book</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Books Grid */}
      {books.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No books created yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first expense tracking book to get started
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Book
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Card key={book.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{book.name}</CardTitle>
                    <CardDescription>
                      {book.description || "No description"}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingBook(book)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteBook(book.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span>Today</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Transactions</span>
                  <span>0</span>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Analytics
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Scan Receipt
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingBook} onOpenChange={() => setEditingBook(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
            <DialogDescription>Update your book details</DialogDescription>
          </DialogHeader>
          <form action={handleEditBook} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Book Name</Label>
              <Input 
                id="edit-name" 
                name="name" 
                defaultValue={editingBook?.name} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Input 
                id="edit-description" 
                name="description" 
                defaultValue={editingBook?.description || ""} 
              />
            </div>
            <Button type="submit" className="w-full">Update Book</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}