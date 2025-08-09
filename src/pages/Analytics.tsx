import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listInstances, getReports, getGraphs, getBudgets, exportCSV, upsertBudget } from "@/lib/recai";
import { TrendingUp, TrendingDown, DollarSign, Download, Calendar, PieChart } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Analytics() {
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [reports, setReports] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [budgets, setBudgets] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [newBudgetCategoryId, setNewBudgetCategoryId] = useState("");
  const [newBudgetLimit, setNewBudgetLimit] = useState("");
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    document.title = "Analytics | AI Receipt Analyzer";
    loadBooks();
  }, []);

  useEffect(() => {
    if (selectedBook) {
      loadAnalyticsData();
    }
  }, [selectedBook]);

  const loadBooks = async () => {
    try {
      const response = await listInstances();
      if (response?.instances) {
        setBooks(response.instances);
        if (response.instances.length > 0) {
          const fromUrl = searchParams.get("book");
          const exists = response.instances.find((b: any) => b.id === fromUrl);
          setSelectedBook(exists ? exists.id : response.instances[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load books:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    if (!selectedBook) return;

    try {
      // Load reports
      const reportsData = await getReports(selectedBook, {
        report_type: "summary",
        start_date: "2024-01-01",
        end_date: "2024-12-31"
      });
      setReports(reportsData);

      // Load pie chart data
      const pieData = await getGraphs(selectedBook, {
        chart_type: "pie",
        format: "json"
      });
      setChartData(pieData);

      // Load budgets
      const budgetData = await getBudgets(selectedBook);
      setBudgets(budgetData);
    } catch (error) {
      console.error("Failed to load analytics data:", error);
    }
  };

  const handleSaveBudget = async () => {
    if (!selectedBook || !newBudgetCategoryId || !newBudgetLimit) {
      toast({ title: "Missing information", description: "Enter category ID and limit to create a budget." });
      return;
    }
    try {
      await upsertBudget(selectedBook, {
        category_id: newBudgetCategoryId,
        limit: parseFloat(newBudgetLimit)
      });
      const budgetData = await getBudgets(selectedBook);
      setBudgets(budgetData);
      setShowBudgetForm(false);
      toast({ title: "Budget saved", description: "Your budget was created successfully." });
    } catch (error: any) {
      toast({ title: "Failed to save budget", description: error?.message || "Unknown error", variant: "destructive" });
    }
  };

  const handleExportCSV = async () => {
    if (!selectedBook) return;

    try {
      const blob = await exportCSV(selectedBook);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses-${selectedBook}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to export CSV:", error);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-20"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-24"></div>
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
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Insights and reports for your spending patterns</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedBook} onValueChange={(val) => { setSelectedBook(val); setSearchParams({ book: val }); }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select book" />
            </SelectTrigger>
            <SelectContent>
              {books.map((book) => (
                <SelectItem key={book.id} value={book.id}>
                  {book.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {!selectedBook ? (
        <Card className="text-center py-12">
          <CardContent>
            <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No book selected</h3>
            <p className="text-muted-foreground">Select a book to view analytics</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${reports?.total_spent?.toFixed(2) || "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    This period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reports?.top_items?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Total recorded</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reports?.top_categories?.[0]?.category_name || "None"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ${reports?.top_categories?.[0]?.total?.toFixed(2) || "0.00"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg/Transaction</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${(reports?.total_spent / (reports?.top_items?.length || 1))?.toFixed(2) || "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground">Per transaction</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest expenses</CardDescription>
              </CardHeader>
              <CardContent>
                {reports?.top_items?.length > 0 ? (
                  <div className="space-y-4">
                    {reports.top_items.slice(0, 5).map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{item.text}</div>
                          <div className="text-sm text-muted-foreground">{item.category}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${item.amount.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No transactions found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                  <CardDescription>Distribution of expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  {chartData?.data?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={chartData.data}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          nameKey="label"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.data.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                  <CardDescription>Detailed spending by category</CardDescription>
                </CardHeader>
                <CardContent>
                  {reports?.top_categories?.length > 0 ? (
                    <div className="space-y-4">
                      {reports.top_categories.map((category: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{category.category_name}</span>
                            <span>${category.total.toFixed(2)}</span>
                          </div>
                          <Progress 
                            value={reports.total_spent ? (category.total / reports.total_spent) * 100 : 0} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No categories found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Overview</CardTitle>
                <CardDescription>Track your spending against budgets</CardDescription>
              </CardHeader>
              <CardContent>
                {budgets?.details?.length > 0 ? (
                  <div className="space-y-6">
                    {budgets.details.map((budget: any, index: number) => {
                      const percentage = (budget.spent / budget.limit) * 100;
                      const isOverBudget = percentage > 100;
                      
                      return (
                        <div key={index} className="space-y-3">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">{budget.category}</h3>
                            <Badge variant={isOverBudget ? "destructive" : "secondary"}>
                              {percentage.toFixed(0)}%
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>${budget.spent.toFixed(2)} spent</span>
                              <span>${budget.limit.toFixed(2)} budget</span>
                            </div>
                            <Progress 
                              value={Math.min(percentage, 100)} 
                              className="h-3"
                            />
                            <div className="flex justify-between text-sm">
                              <span className={isOverBudget ? "text-destructive" : "text-muted-foreground"}>
                                {isOverBudget ? `$${(budget.spent - budget.limit).toFixed(2)} over budget` : `$${budget.remaining.toFixed(2)} remaining`}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No budgets set</p>
                    {!showBudgetForm ? (
                      <Button onClick={() => setShowBudgetForm(true)}>Set Your First Budget</Button>
                    ) : (
                      <div className="mx-auto max-w-sm text-left space-y-3">
                        <div className="grid gap-2">
                          <Label htmlFor="catId">Category ID</Label>
                          <Input id="catId" value={newBudgetCategoryId} onChange={(e) => setNewBudgetCategoryId(e.target.value)} placeholder="e.g., 1" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="limit">Monthly Limit</Label>
                          <Input id="limit" type="number" step="0.01" value={newBudgetLimit} onChange={(e) => setNewBudgetLimit(e.target.value)} placeholder="500.00" />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveBudget}>Save Budget</Button>
                          <Button variant="outline" onClick={() => setShowBudgetForm(false)}>Cancel</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Spending Trends</CardTitle>
                <CardDescription>Track your spending patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  Trend analysis coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}