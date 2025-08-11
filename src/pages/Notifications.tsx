
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, AlertTriangle, TrendingUp, Calendar, DollarSign, CheckCircle } from "lucide-react";
import { listInstances, getBudgets, getInsights, getReports } from "@/lib/recai";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: 'budget_alert' | 'spending_insight' | 'weekly_summary' | 'monthly_summary';
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  bookId: string;
  bookName: string;
  timestamp: Date;
  read: boolean;
}

// API response types
type BudgetDetail = { category: string; limit: number; spent: number; remaining: number };
type BudgetsResponse = { details?: BudgetDetail[] };
type InsightsResponse = { trend?: string; predicted_spending?: number; confidence?: number };
type ReportsResponse = { weekly_spend?: { week: string; total: number }[] };

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Notifications | AI Receipt Analyzer";
    loadBooksAndNotifications();
  }, []);

  const loadBooksAndNotifications = async () => {
    try {
      const response = await listInstances();
      if (response?.instances) {
        setBooks(response.instances);
        await generateNotifications(response.instances);
      }
    } catch (error) {
      console.error("Failed to load books:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateNotifications = async (bookList: any[]) => {
    const allNotifications: Notification[] = [];

    for (const book of bookList) {
      try {
        // Generate budget alerts
        const budgets = (await getBudgets(book.id)) as BudgetsResponse;
        if (budgets?.details) {
          for (const budget of budgets.details) {
            const percentage = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
            
            if (percentage >= 90) {
              allNotifications.push({
                id: `budget-${book.id}-${budget.category}`,
                type: 'budget_alert',
                title: 'Budget Alert',
                message: `You've spent ${percentage.toFixed(0)}% of your ${budget.category} budget (${budget.spent?.toFixed(2) || 0}/${budget.limit?.toFixed(2) || 0})`,
                severity: percentage >= 100 ? 'high' : 'medium',
                bookId: book.id,
                bookName: book.name,
                timestamp: new Date(),
                read: false
              });
            }
          }
        }

        // Generate spending insights
        const insights = (await getInsights(book.id, { insight_type: "spending_forecast" })) as InsightsResponse;
        if (insights?.trend === "increasing" || (insights?.predicted_spending && insights?.confidence > 0.7)) {
          allNotifications.push({
            id: `insight-${book.id}`,
            type: 'spending_insight',
            title: 'Spending Trend Alert',
            message: insights.trend === "increasing" ? 
              `Your spending trend is increasing. Predicted next month: $${insights.predicted_spending?.toFixed(2) || 0}` :
              `AI detected unusual spending patterns in ${book.name}`,
            severity: 'medium',
            bookId: book.id,
            bookName: book.name,
            timestamp: new Date(),
            read: false
          });
        }

        // Generate weekly summary
        const reports = (await getReports(book.id, { period: "weekly" })) as ReportsResponse;
        if (reports?.weekly_spend?.length > 0) {
          const latestWeek = reports.weekly_spend[reports.weekly_spend.length - 1];
          if (latestWeek?.total > 0) {
            allNotifications.push({
              id: `weekly-${book.id}`,
              type: 'weekly_summary',
              title: 'Weekly Summary',
              message: `This week you spent $${latestWeek.total.toFixed(2)} in ${book.name}`,
              severity: 'low',
              bookId: book.id,
              bookName: book.name,
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
              read: false
            });
          }
        }

      } catch (error) {
        console.error(`Failed to generate notifications for book ${book.id}:`, error);
      }
    }

    // Sort by timestamp (newest first)
    allNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    setNotifications(allNotifications);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    toast({
      title: "All notifications marked as read",
      description: "Your notification list has been updated"
    });
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    if (selectedBook !== "all") {
      filtered = filtered.filter(notif => notif.bookId === selectedBook);
    }

    if (filter !== "all") {
      if (filter === "unread") {
        filtered = filtered.filter(notif => !notif.read);
      } else {
        filtered = filtered.filter(notif => notif.type === filter);
      }
    }

    return filtered;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'budget_alert': return <AlertTriangle className="h-4 w-4" />;
      case 'spending_insight': return <TrendingUp className="h-4 w-4" />;
      case 'weekly_summary': 
      case 'monthly_summary': return <Calendar className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="container py-8">
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-muted rounded"></div>
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
      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 sm:h-8 sm:w-8" />
          <div className="flex-1">
            <h1 className="heading-zen text-2xl sm:text-3xl">Notifications</h1>
            <p className="text-zen text-sm">
              Stay updated with your spending alerts and insights
            </p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedBook} onValueChange={setSelectedBook}>
            <SelectTrigger className="w-full sm:w-48 btn-minimal">
              <SelectValue placeholder="All books" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Books</SelectItem>
              {books.map((book) => (
                <SelectItem key={book.id} value={book.id}>
                  {book.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-48 btn-minimal">
              <SelectValue placeholder="All notifications" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Notifications</SelectItem>
              <SelectItem value="unread">Unread Only</SelectItem>
              <SelectItem value="budget_alert">Budget Alerts</SelectItem>
              <SelectItem value="spending_insight">Insights</SelectItem>
              <SelectItem value="weekly_summary">Summaries</SelectItem>
            </SelectContent>
          </Select>

          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead} size="sm" className="w-full sm:w-auto">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {getFilteredNotifications().length === 0 ? (
        <Card className="card-zen text-center py-12">
          <CardContent>
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="heading-zen text-lg mb-2">No notifications</h3>
            <p className="text-zen">
              {filter === "unread" 
                ? "You're all caught up! No unread notifications."
                : "We'll notify you about budget alerts and spending insights here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {getFilteredNotifications().map((notification) => (
            <Card 
              key={notification.id} 
              className={`card-minimal transition-all cursor-pointer hover:shadow-medium ${
                notification.read ? 'opacity-75' : 'border-l-4 border-l-primary shadow-soft'
              }`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-full flex-shrink-0 ${
                      notification.severity === 'high' ? 'bg-destructive/10 text-destructive' :
                      notification.severity === 'medium' ? 'bg-warning/10 text-warning-foreground' :
                      'bg-primary-soft text-primary'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="heading-zen text-base leading-snug break-words">{notification.title}</CardTitle>
                      <CardDescription className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                        <span className="truncate max-w-[60%] sm:max-w-none">{notification.bookName}</span>
                        <Badge 
                          variant={getSeverityColor(notification.severity) as any}
                          className="text-[10px] sm:text-xs w-fit"
                        >
                          {notification.severity}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground sm:text-right sm:flex-shrink-0">
                    <div>{notification.timestamp.toLocaleDateString()}</div>
                    <div>{notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-zen break-words">{notification.message}</p>
                {!notification.read && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>New</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
