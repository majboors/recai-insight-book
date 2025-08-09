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
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Dashboard | AI Receipt Analyzer";
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load books/instances
      const instancesResponse = await listInstances();
      if (instancesResponse?.instances) {
        setBooks(instancesResponse.instances);
        
        // Load budget data for first book
        if (instancesResponse.instances.length > 0) {
          const firstBookId = instancesResponse.instances[0].id;
          try {
            const budgets = await getBudgets(firstBookId);
            setBudgetData(budgets);
          } catch (e) {
            console.log("No budget data available");
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

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your expense tracking across all books</p>
        </div>
        <Link to="/scanner">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Scan Receipt
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{books.length}</div>
            <p className="text-xs text-muted-foreground">Active expense books</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Month Spending</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,250.75</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Of monthly budget used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Books Overview */}
        <Card className="lg:col-span-2">
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
        <Card>
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
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Plus className="h-6 w-6" />
                Create Book
              </Button>
            </Link>
            <Link to="/analytics">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
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