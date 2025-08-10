import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { listInstances, getBudgets, getReports } from "@/lib/recai";
import { TrendingUp, TrendingDown, DollarSign, Receipt, AlertTriangle, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [books, setBooks] = useState<any[]>([]);
  const [budgetData, setBudgetData] = useState<any>(null);
  const [reports, setReports] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Dashboard | AI Receipt Analyzer";
    loadDashboardData();
  }, []);

  // Ensure Service Worker takes control when on dashboard
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const reloaded = sessionStorage.getItem('sw_reloaded');
      if (!navigator.serviceWorker.controller && !reloaded) {
        const t = setTimeout(() => {
          if (!navigator.serviceWorker.controller) {
            sessionStorage.setItem('sw_reloaded', '1');
            window.location.reload();
          }
        }, 1000);
        return () => clearTimeout(t);
      }
    }
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load books/instances
      const instancesResponse = await listInstances();
      if (instancesResponse?.instances) {
        setBooks(instancesResponse.instances);
        
        // Load budget data and reports for first book
        if (instancesResponse.instances.length > 0) {
          const firstBookId = instancesResponse.instances[0].id;
          try {
            const budgets = await getBudgets(firstBookId);
            setBudgetData(budgets);
          } catch (e) {
            console.log("No budget data available");
          }
          try {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const startStr = start.toISOString().split("T")[0];
            const endStr = end.toISOString().split("T")[0];
            const rep = await getReports(firstBookId, { report_type: "summary", start_date: startStr, end_date: endStr });
            setReports(rep);
          } catch (e) {
            console.log("No reports available");
          }
        }
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-24 mb-2"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Derived metrics for tiles
  const monthSpent = Number(reports?.[0]?.total_spent || 0);
  const txCount = Number(reports?.[0]?.top_items?.length || 0);
  const avgTxn = txCount ? monthSpent / txCount : 0;
  const budgetTotals = (budgetData?.details || []).reduce(
    (acc: any, b: any) => ({ spent: acc.spent + (b.spent || 0), limit: acc.limit + (b.limit || 0) }),
    { spent: 0, limit: 0 }
  );
  const budgetPercent = budgetTotals.limit ? Math.round((budgetTotals.spent / budgetTotals.limit) * 100) : 0;

  return (
    <div className="space-zen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-medium heading-zen">Dashboard</h1>
          <p className="text-zen">Overview of your expense tracking across all books</p>
        </div>
        <Link to="/scanner">
          <Button className="btn-zen" data-tour-id="scan-receipt">
            <Plus className="h-4 w-4 mr-2" />
            Scan Receipt
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid-zen grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-zen">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-zen">Total Books</h3>
            <Receipt className="h-5 w-5 text-primary/60" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-medium heading-zen">{books.length}</div>
            <p className="text-xs text-zen">Active expense books</p>
          </div>
        </div>

        <div className="card-zen">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-zen">Month Spending</h3>
            <DollarSign className="h-5 w-5 text-success/60" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-medium heading-zen">${monthSpent.toFixed(2)}</div>
            <p className="text-xs text-zen flex items-center">
              <TrendingUp className="inline h-3 w-3 mr-1" aria-hidden="true" />
              This month
            </p>
          </div>
        </div>

        <div className="card-zen">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-zen">Budget Status</h3>
            <AlertTriangle className={`h-5 w-5 ${budgetPercent > 80 ? 'text-warning/60' : 'text-primary/60'}`} aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-medium heading-zen">{budgetPercent}%</div>
            <p className="text-xs text-zen">Of monthly budget used</p>
          </div>
        </div>

        <div className="card-zen">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-zen">Avg/Transaction</h3>
            <TrendingDown className="h-5 w-5 text-chart-3/60" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-medium heading-zen">${avgTxn.toFixed(2)}</div>
            <p className="text-xs text-zen flex items-center">
              <TrendingUp className="inline h-3 w-3 mr-1" aria-hidden="true" />
              This month
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Books Overview */}
        <Card className="lg:col-span-2" data-tour-id="books-list">
          <CardHeader>
            <CardTitle>Your Books</CardTitle>
            <CardDescription>Manage your expense tracking workspaces</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {books.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No books created yet</p>
                <Link to="/books">
                  <Button>Create Your First Book</Button>
                </Link>
              </div>
            ) : (
              books.map((book) => (
                <div key={book.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{book.name}</h3>
                    <p className="text-sm text-muted-foreground">Last activity: 2 hours ago</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Active</Badge>
                    <Link to={`/analytics?book=${book.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Budget Overview */}
        <Card data-tour-id="budget-overview">
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>Current month spending by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetData?.details?.length > 0 ? (
              budgetData.details.map((budget: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{budget.category}</span>
                    <span>${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}</span>
                  </div>
                  <Progress value={(budget.spent / budget.limit) * 100} className="h-2" />
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-2">No budgets set</p>
                <Link to="/analytics">
                  <Button variant="outline" size="sm">Set Budgets</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link to="/scanner">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Receipt className="h-6 w-6" />
                Scan Receipt
              </Button>
            </Link>
            <Link to="/books">
              <Button variant="outline" className="w-full h-20 flex-col gap-2" data-tour-id="create-book-action">
                <Plus className="h-6 w-6" />
                Create Book
              </Button>
            </Link>
            <Link to="/analytics">
              <Button variant="outline" className="w-full h-20 flex-col gap-2" data-tour-id="view-reports-action">
                <TrendingUp className="h-6 w-6" />
                View Reports
              </Button>
            </Link>
            <Link to="/chat">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <TrendingDown className="h-6 w-6" />
                AI Insights
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}