import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TransactionsManager from "@/components/analytics/TransactionsManager";
import { useQuery } from "@tanstack/react-query";
import { getInstance } from "@/lib/recai";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt } from "lucide-react";

export default function Transactions() {
  const { id } = useParams();
  const instanceId = id!;

  const { data: instanceData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["instance", instanceId],
    queryFn: () => getInstance(instanceId),
    enabled: !!instanceId,
  });

  const categories = (instanceData as any)?.categories || [];

  if (categoriesLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Receipt className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Transactions</h1>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Receipt className="h-6 w-6" />
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">Manage your financial transactions</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Management</CardTitle>
          <CardDescription>
            Add manual transactions, view your transaction history, and manage receipt data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories && (
            <TransactionsManager 
              instanceId={instanceId} 
              categories={categories} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}