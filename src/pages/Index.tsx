// Update this page (the content is just a fallback if you fail to update the page)

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createInstance, listInstances } from "@/lib/recai";
import { Link } from "react-router-dom";
import ApiTokenDialog from "@/components/ApiTokenDialog";
import { Activity } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["instances"], queryFn: listInstances });
  const create = useMutation({
    mutationFn: (payload: { name: string; description?: string }) => createInstance(payload),
    onSuccess: () => {
      toast({ title: "Book created" });
      qc.invalidateQueries({ queryKey: ["instances"] });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    document.title = "Insight Books | RecAI";
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-semibold">Insight Books</h1>
          <div className="flex items-center gap-2">
            <ApiTokenDialog />
          </div>
        </div>
      </header>

      <section className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium">Your Books</h2>
            <p className="text-sm text-muted-foreground">Create a book (workspace) and start tracking.</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Create Book</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Book</DialogTitle>
                <DialogDescription>Name and describe your book.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="desc">Description</Label>
                  <Input id="desc" value={desc} onChange={(e) => setDesc(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => create.mutate({ name, description: desc })} disabled={create.isPending}>
                  {create.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && (
            <Card><CardHeader><CardTitle>Loading...</CardTitle></CardHeader></Card>
          )}
          {data?.instances?.map((inst: any) => (
            <Card key={inst.id} className="transition hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">{inst.name}</CardTitle>
                <CardDescription>{inst.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Status: {inst.status || "active"}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button asChild variant="secondary"><Link to={`/books/${inst.id}`}>Open Dashboard</Link></Button>
                <div className="flex items-center gap-1 text-muted-foreground"><Activity className="h-4 w-4" /> API</div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Index;
