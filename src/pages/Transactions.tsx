import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInstance, recaiRequest } from "@/lib/recai";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt, Plus, Minus, ArrowLeft, Search, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface LedgerEntry {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  category_id: number;
  source: string;
  reference_id?: string;
}

interface LedgerBalance {
  total_income: number;
  total_expenses: number;
  balance: number;
  entries_count: number;
}

export default function Transactions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const instanceId = id!;

  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "income" | "expense">("all");

  // Form states
  const [incomeForm, setIncomeForm] = useState({
    description: "",
    amount: "",
    category_id: "",
    date: format(new Date(), "yyyy-MM-dd")
  });

  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    category_id: "",
    date: format(new Date(), "yyyy-MM-dd")
  });

  const { data: instanceData, isLoading: instanceLoading, error: instanceError } = useQuery({
    queryKey: ["instance", instanceId],
    queryFn: () => getInstance(instanceId),
    enabled: !!instanceId,
    retry: 1, // Don't retry instance fetch if it fails
  });

  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ["ledger-balance", instanceId],
    queryFn: () => recaiRequest<LedgerBalance>("GET", `/v1/instances/${instanceId}/ledger/balance`),
    enabled: !!instanceId,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["ledger-transactions", instanceId],
    queryFn: () => recaiRequest<{ entries: LedgerEntry[], total_count: number, limit: number, offset: number }>("GET", `/v1/instances/${instanceId}/ledger/transactions`),
    enabled: !!instanceId,
  });

  const addIncomeMutation = useMutation({
    mutationFn: (data: any) => 
      recaiRequest("POST", `/v1/instances/${instanceId}/ledger/income`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledger-balance", instanceId] });
      queryClient.invalidateQueries({ queryKey: ["ledger-transactions", instanceId] });
      setShowIncomeDialog(false);
      setIncomeForm({ description: "", amount: "", category_id: "", date: format(new Date(), "yyyy-MM-dd") });
      toast.success("Income added successfully");
    },
    onError: () => {
      toast.error("Failed to add income");
    }
  });

  const addExpenseMutation = useMutation({
    mutationFn: (data: any) => 
      recaiRequest("POST", `/v1/instances/${instanceId}/ledger/expense`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledger-balance", instanceId] });
      queryClient.invalidateQueries({ queryKey: ["ledger-transactions", instanceId] });
      setShowExpenseDialog(false);
      setExpenseForm({ description: "", amount: "", category_id: "", date: format(new Date(), "yyyy-MM-dd") });
      toast.success("Expense added successfully");
    },
    onError: () => {
      toast.error("Failed to add expense");
    }
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (index: number) => 
      recaiRequest("DELETE", `/v1/instances/${instanceId}/ledger/transactions/${index}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledger-balance", instanceId] });
      queryClient.invalidateQueries({ queryKey: ["ledger-transactions", instanceId] });
      toast.success("Transaction deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete transaction");
    }
  });

  const categories = (instanceData as any)?.categories || [];
  
  const filteredTransactions = transactions?.entries?.filter((tx: LedgerEntry) => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || tx.type === selectedType;
    return matchesSearch && matchesType;
  }) || [];

  const handleIncomeSubmit = () => {
    if (!incomeForm.description || !incomeForm.amount || !incomeForm.category_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    addIncomeMutation.mutate({
      description: incomeForm.description,
      amount: parseFloat(incomeForm.amount),
      category_id: parseInt(incomeForm.category_id),
      date: incomeForm.date
    });
  };

  const handleExpenseSubmit = () => {
    if (!expenseForm.description || !expenseForm.amount || !expenseForm.category_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    addExpenseMutation.mutate({
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      category_id: parseInt(expenseForm.category_id),
      date: expenseForm.date
    });
  };

  if (instanceLoading || balanceLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/books")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Receipt className="h-6 w-6" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/books")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Receipt className="h-6 w-6" />
        <div>
          <h1 className="text-3xl font-bold">
            {(instanceData as any)?.name || "Ledger"}
          </h1>
          <p className="text-muted-foreground">Manage your cash flow and transactions</p>
        </div>
      </div>

      {/* Balance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className={`text-2xl font-bold ${(balance?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                PKR {(balance?.balance || 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Net Balance</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="text-2xl font-bold text-green-600">
                PKR {(balance?.total_income || 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total In (+)</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
              <div className="text-2xl font-bold text-red-600">
                PKR {(balance?.total_expenses || 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Out (-)</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="text-2xl font-bold text-blue-600">
                {balance?.entries_count || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Entries</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Dialog open={showIncomeDialog} onOpenChange={setShowIncomeDialog}>
          <DialogTrigger asChild>
            <Button className="h-16 text-white bg-green-600 hover:bg-green-700">
              <Plus className="h-6 w-6 mr-2" />
              <div className="text-left">
                <div className="font-semibold">CASH IN</div>
                <div className="text-sm opacity-90">Add Income</div>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Cash In Entry</DialogTitle>
              <DialogDescription>
                Record income such as salary, freelance payments, or refunds.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="income-description">Description *</Label>
                <Textarea
                  id="income-description"
                  placeholder="e.g., Monthly salary, Freelance payment"
                  value={incomeForm.description}
                  onChange={(e) => setIncomeForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="income-amount">Amount *</Label>
                  <Input
                    id="income-amount"
                    type="number"
                    placeholder="0.00"
                    value={incomeForm.amount}
                    onChange={(e) => setIncomeForm(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="income-date">Date</Label>
                  <Input
                    id="income-date"
                    type="date"
                    value={incomeForm.date}
                    onChange={(e) => setIncomeForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="income-category">Category *</Label>
                <Select value={incomeForm.category_id} onValueChange={(value) => setIncomeForm(prev => ({ ...prev, category_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleIncomeSubmit} disabled={addIncomeMutation.isPending} className="flex-1">
                  {addIncomeMutation.isPending ? "Adding..." : "Save"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
          <DialogTrigger asChild>
            <Button className="h-16 text-white bg-red-600 hover:bg-red-700">
              <Minus className="h-6 w-6 mr-2" />
              <div className="text-left">
                <div className="font-semibold">CASH OUT</div>
                <div className="text-sm opacity-90">Add Expense</div>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Cash Out Entry</DialogTitle>
              <DialogDescription>
                Record expenses such as purchases, bills, or other spending.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="expense-description">Description *</Label>
                <Textarea
                  id="expense-description"
                  placeholder="e.g., Groceries, Fuel, Coffee"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expense-amount">Amount *</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    placeholder="0.00"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="expense-date">Date</Label>
                  <Input
                    id="expense-date"
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="expense-category">Category *</Label>
                <Select value={expenseForm.category_id} onValueChange={(value) => setExpenseForm(prev => ({ ...prev, category_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExpenseSubmit} disabled={addExpenseMutation.isPending} className="flex-1">
                  {addExpenseMutation.isPending ? "Adding..." : "Save"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>
            Showing {filteredTransactions.length} entries
          </CardDescription>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by description or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Entry Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entries</SelectItem>
                <SelectItem value="income">Income Only</SelectItem>
                <SelectItem value="expense">Expenses Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No transactions found</p>
              <p className="text-sm text-muted-foreground">Start by adding your first income or expense</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((transaction: LedgerEntry, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      transaction.type === "income" 
                        ? "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400" 
                        : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                    }`}>
                      {transaction.type === "income" ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{transaction.category}</span>
                        <span>•</span>
                        <span>{format(new Date(transaction.date), "MMM dd, yyyy")}</span>
                        {transaction.source !== "manual" && (
                          <>
                            <span>•</span>
                            <Badge variant="secondary" className="text-xs">
                              {transaction.source}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`text-lg font-semibold ${
                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}>
                      {transaction.type === "income" ? "+" : "-"}PKR {transaction.amount.toLocaleString()}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTransactionMutation.mutate(index)}
                      disabled={deleteTransactionMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Section - API Response Testing */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">🔧 API Debug Info</CardTitle>
          <CardDescription>
            Testing API responses and explaining data flow integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Balance API Response:</h4>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                {JSON.stringify(balance, null, 2)}
              </pre>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Transactions API Response:</h4>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                {JSON.stringify(transactions, null, 2)}
              </pre>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Instance Data (Categories):</h4>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto">
              {instanceError ? 
                `Instance Error: ${instanceError.message}` : 
                JSON.stringify(instanceData, null, 2)
              }
            </pre>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">📋 API Integration Flow:</h4>
            <div className="text-sm space-y-1 bg-muted/50 p-3 rounded">
              <p><strong>1. Receipt Scanning:</strong> POST /v1/receipts → Auto-adds to ledger as expenses</p>
              <p><strong>2. Manual Income:</strong> POST /v1/instances/{id}/ledger/income → Updates balance</p>
              <p><strong>3. Manual Expense:</strong> POST /v1/instances/{id}/ledger/expense → Updates balance</p>
              <p><strong>4. Balance Check:</strong> GET /v1/instances/{id}/ledger/balance → Real-time calculation</p>
              <p><strong>5. Transaction History:</strong> GET /v1/instances/{id}/ledger/transactions → Unified view</p>
              <p><strong>6. Data Consistency:</strong> Receipt scanner + Manual entries = Same ledger</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">🔄 Data Synchronization:</h4>
            <div className="text-sm space-y-1 bg-blue-50 dark:bg-blue-950/20 p-3 rounded">
              <p><strong>Receipt Scanner:</strong> Scanned items appear in both transaction list AND ledger</p>
              <p><strong>Manual Transactions:</strong> Added via transaction system also sync to ledger</p>
              <p><strong>Ledger Entries:</strong> Manual income/expense entries (this page) update balance</p>
              <p><strong>Categories:</strong> Shared across all systems for consistency</p>
              <p><strong>Real-time:</strong> All changes update balance immediately</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}