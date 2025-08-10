import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  getTransactionsDetailed,
  addManualTransaction,
  deleteTransactionByIndex,
  deleteReceiptTransactions,
} from "@/lib/recai";

interface TransactionsManagerProps {
  instanceId: string;
  categories: Array<{ id: number; name: string }>;
}

interface DetailedTxn {
  index: number;
  text: string;
  amount: number;
  category_id?: number;
  category_name?: string;
  date?: string;
  receipt_id?: string;
}

export default function TransactionsManager({ instanceId, categories }: TransactionsManagerProps) {
  const { toast } = useToast();
  const [txns, setTxns] = useState<DetailedTxn[]>([]);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  // Add form
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [receiptId, setReceiptId] = useState<string>("");

  // Delete by receipt
  const [deleteReceipt, setDeleteReceipt] = useState<string>("");

  const categoryMap = useMemo(() => {
    const m = new Map<number, string>();
    (categories || []).forEach((c) => m.set(Number(c.id), c.name));
    return m;
  }, [categories]);

  const loadTxns = async () => {
    if (!instanceId) return;
    setLoading(true);
    try {
      const res: any = await getTransactionsDetailed(instanceId, { limit, offset });
      const arr: any[] = Array.isArray(res) ? res : (res?.transactions || res?.data || []);
      const normalized: DetailedTxn[] = arr.map((t: any) => ({
        index: Number(t.index ?? t.i ?? 0),
        text: t.text ?? t.description ?? "",
        amount: Number(t.amount ?? t.value ?? 0),
        category_id: t.category_id ?? t.categoryId,
        category_name: t.category_name ?? t.category ?? categoryMap.get(Number(t.category_id)) ?? "",
        date: t.date ?? t.txn_date,
        receipt_id: t.receipt_id ?? t.receiptId,
      }));
      setTxns(normalized);
    } catch (e: any) {
      toast({ title: "Failed to load transactions", description: e?.message || "", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTxns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId, limit, offset]);

  const onAdd = async () => {
    if (!text.trim() || !amount || !categoryId) {
      toast({ title: "Missing fields", description: "Text, amount and category are required.", variant: "destructive" });
      return;
    }
    try {
      await addManualTransaction(instanceId, {
        text: text.trim(),
        amount: Number(amount),
        category_id: Number(categoryId),
        ...(date ? { date } : {}),
        ...(receiptId ? { receipt_id: receiptId.trim() } : {}),
      });
      setText("");
      setAmount("");
      setCategoryId("");
      setDate("");
      setReceiptId("");
      toast({ title: "Transaction added" });
      loadTxns();
    } catch (e: any) {
      toast({ title: "Add failed", description: e?.message || "", variant: "destructive" });
    }
  };

  const onDeleteIndex = async (idx: number) => {
    try {
      await deleteTransactionByIndex(instanceId, idx);
      toast({ title: "Transaction deleted" });
      loadTxns();
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message || "", variant: "destructive" });
    }
  };

  const onDeleteReceipt = async () => {
    if (!deleteReceipt.trim()) {
      toast({ title: "Receipt ID required", variant: "destructive" });
      return;
    }
    try {
      await deleteReceiptTransactions(instanceId, deleteReceipt.trim());
      toast({ title: "Receipt transactions deleted" });
      setDeleteReceipt("");
      loadTxns();
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message || "", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="card-minimal">
        <CardHeader>
          <CardTitle className="heading-zen">Add Manual Transaction</CardTitle>
          <CardDescription className="text-zen">Create a transaction without scanning a receipt</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="tx-text">Text</Label>
              <Input id="tx-text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Coffee at Starbucks" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tx-amount">Amount</Label>
              <Input id="tx-amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="4.50" />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="btn-minimal">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tx-date">Date</Label>
              <Input id="tx-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tx-receipt">Receipt ID</Label>
              <Input id="tx-receipt" value={receiptId} onChange={(e) => setReceiptId(e.target.value)} placeholder="manual_entry" />
            </div>
            <div className="flex items-end">
              <Button onClick={onAdd}>Add</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-minimal">
        <CardHeader>
          <CardTitle className="heading-zen">Transactions</CardTitle>
          <CardDescription className="text-zen">List with deletion indices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Label className="text-zen">Limit</Label>
              <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setOffset(0); }}>
                <SelectTrigger className="w-24 btn-minimal">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:ml-auto flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button variant="outline" size="sm" disabled={offset === 0 || loading} onClick={() => setOffset(Math.max(0, offset - limit))}>Prev</Button>
              <Button variant="outline" size="sm" disabled={loading} onClick={() => setOffset(offset + limit)}>Next</Button>
              <Button size="sm" onClick={loadTxns} disabled={loading}>Refresh</Button>
            </div>
          </div>

          {/* Mobile list (no horizontal scroll) */}
          <div className="md:hidden space-y-2">
            {txns.length === 0 ? (
              <p className="text-zen text-center py-6">{loading ? "Loading..." : "No transactions found"}</p>
            ) : (
              txns.map((t) => (
                <div key={`${t.index}-${t.text}`} className="rounded-lg border border-border/50 bg-card p-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{t.text || "—"}</div>
                      <div className="text-xs text-muted-foreground truncate">{t.category_name || categoryMap.get(Number(t.category_id)) || "Uncategorized"}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold heading-zen">${t.amount?.toFixed ? t.amount.toFixed(2) : Number(t.amount).toFixed(2)}</div>
                      <div className="text-[10px] text-muted-foreground">#{t.index}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zen">
                    <span className="truncate">Date: {t.date || "—"}</span>
                    <span className="truncate">Receipt: <span className="break-all">{t.receipt_id || "—"}</span></span>
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" variant="destructive" onClick={() => onDeleteIndex(t.index)}>Delete</Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-zen">
                  <th className="py-2 pr-3">Index</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Text</th>
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3">Amount</th>
                  <th className="py-2 pr-3">Receipt</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {txns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-zen">{loading ? "Loading..." : "No transactions found"}</td>
                  </tr>
                ) : (
                  txns.map((t) => (
                    <tr key={`${t.index}-${t.text}`} className="border-b last:border-0">
                      <td className="py-2 pr-3">{t.index}</td>
                      <td className="py-2 pr-3">{t.date || "—"}</td>
                      <td className="py-2 pr-3 max-w-[260px] truncate">{t.text}</td>
                      <td className="py-2 pr-3">{t.category_name || categoryMap.get(Number(t.category_id)) || ""}</td>
                      <td className="py-2 pr-3">${t.amount?.toFixed ? t.amount.toFixed(2) : Number(t.amount).toFixed(2)}</td>
                      <td className="py-2 pr-3">{t.receipt_id || "—"}</td>
                      <td className="py-2 pr-3">
                        <Button size="sm" variant="destructive" onClick={() => onDeleteIndex(t.index)}>Delete</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="card-minimal">
        <CardHeader>
          <CardTitle className="heading-zen">Delete By Receipt</CardTitle>
          <CardDescription className="text-zen">Remove all transactions from a specific receipt</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input placeholder="receipt_id" value={deleteReceipt} onChange={(e) => setDeleteReceipt(e.target.value)} />
            <Button variant="destructive" onClick={onDeleteReceipt}>Delete All</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
