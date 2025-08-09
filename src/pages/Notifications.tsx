import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, AlertTriangle, TrendingUp, Calendar, Check, X, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: "budget_alert" | "insight" | "summary" | "achievement";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  severity: "low" | "medium" | "high";
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState({
    budgetAlerts: true,
    weeklyReports: true,
    spendingInsights: true,
    achievements: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Notifications | AI Receipt Analyzer";
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    // Mock notifications - in real app, these would come from the API
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "budget_alert",
        title: "Budget Alert: Food Category",
        message: "You've spent $450 out of your $400 monthly food budget. Consider reducing dining out expenses.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        severity: "high"
      },
      {
        id: "2",
        type: "insight",
        title: "Spending Trend Analysis",
        message: "Your spending has increased by 15% compared to last month. Your biggest increase is in the Entertainment category (+$85).",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        read: false,
        severity: "medium"
      },
      {
        id: "3",
        type: "summary",
        title: "Weekly Expense Summary",
        message: "This week you spent $285.50 across 12 transactions. Your average transaction was $23.79.",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
        severity: "low"
      },
      {
        id: "4",
        type: "achievement",
        title: "Savings Milestone Reached!",
        message: "Congratulations! You stayed under budget in 3 categories this month and saved $150.",
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
        read: true,
        severity: "low"
      },
      {
        id: "5",
        type: "budget_alert",
        title: "Transportation Budget Warning",
        message: "You've reached 85% of your transportation budget with 8 days left in the month.",
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
        read: true,
        severity: "medium"
      }
    ];

    setNotifications(mockNotifications);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    toast({
      title: "Success",
      description: "All notifications marked as read",
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast({
      title: "Notification deleted",
      description: "The notification has been removed",
    });
  };

  const updateSettings = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Settings updated",
      description: "Your notification preferences have been saved",
    });
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "budget_alert":
        return <AlertTriangle className="h-4 w-4" />;
      case "insight":
        return <TrendingUp className="h-4 w-4" />;
      case "summary":
        return <Calendar className="h-4 w-4" />;
      case "achievement":
        return <Check className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: Notification["severity"]) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">Stay updated on your financial activity</p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Notifications List */}
        <div className="lg:col-span-2 space-y-4">
          {notifications.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-muted-foreground">You're all caught up!</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card key={notification.id} className={`transition-colors ${!notification.read ? "border-primary" : ""}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${!notification.read ? "bg-primary/10" : "bg-muted"}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className={`font-medium ${!notification.read ? "text-primary" : ""}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(notification.severity)}>
                            {notification.severity}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {notification.timestamp.toLocaleDateString()} at {notification.timestamp.toLocaleTimeString()}
                        </span>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="budget-alerts">Budget Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when approaching budget limits
                    </p>
                  </div>
                  <Switch
                    id="budget-alerts"
                    checked={settings.budgetAlerts}
                    onCheckedChange={(checked) => updateSettings("budgetAlerts", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-reports">Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly spending summaries
                    </p>
                  </div>
                  <Switch
                    id="weekly-reports"
                    checked={settings.weeklyReports}
                    onCheckedChange={(checked) => updateSettings("weeklyReports", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="spending-insights">Spending Insights</Label>
                    <p className="text-sm text-muted-foreground">
                      Get AI-powered spending analysis
                    </p>
                  </div>
                  <Switch
                    id="spending-insights"
                    checked={settings.spendingInsights}
                    onCheckedChange={(checked) => updateSettings("spendingInsights", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="achievements">Achievements</Label>
                    <p className="text-sm text-muted-foreground">
                      Celebrate savings milestones
                    </p>
                  </div>
                  <Switch
                    id="achievements"
                    checked={settings.achievements}
                    onCheckedChange={(checked) => updateSettings("achievements", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Summary</CardTitle>
              <CardDescription>Your notification overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Total notifications</span>
                <Badge variant="secondary">{notifications.length}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Unread</span>
                <Badge variant="destructive">{unreadCount}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Budget alerts</span>
                <Badge variant="default">
                  {notifications.filter(n => n.type === "budget_alert").length}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Insights</span>
                <Badge variant="secondary">
                  {notifications.filter(n => n.type === "insight").length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}