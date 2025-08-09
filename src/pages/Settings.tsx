import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, Globe, Bell, Shield, Trash2, Link as LinkIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRecaiAuth } from '@/hooks/useRecaiAuth';
import { listInstances } from '@/lib/recai';
import { supabase } from '@/integrations/supabase/client';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { token: recaiToken, baseUrl, healthy, setToken, setBaseUrl } = useRecaiAuth();
  const [tkn, setTkn] = useState(recaiToken || "");
  const [base, setBase] = useState(baseUrl || "");
  const [instances, setInstances] = useState<any[]>([]);
  const [defaultInstance, setDefaultInstance] = useState<string>("");

  useEffect(() => { setTkn(recaiToken || ""); setBase(baseUrl || ""); }, [recaiToken, baseUrl]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        if (recaiToken) {
          const res = await listInstances();
          setInstances(res?.instances || []);
        } else {
          setInstances([]);
        }
        const { data } = await supabase
          .from('profiles')
          .select('default_instance_id')
          .eq('user_id', user.id)
          .maybeSingle();
        setDefaultInstance(data?.default_instance_id || "");
      } catch (e) {
        // ignore
      }
    })();
  }, [user, recaiToken]);

  useEffect(() => {
    document.title = 'Settings | Receipt Zen';
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      // TODO: Implement data clearing functionality
      console.log('Clear data functionality would be implemented here');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Separator />

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Your account details and personal information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">User ID</Label>
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                {user?.id?.slice(0, 8)}...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RecAI Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            RecAI Connection
          </CardTitle>
          <CardDescription>
            Connect your personal RecAI API token and set a default book (instance).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>API Base URL</Label>
              <Input value={base} onChange={(e) => setBase(e.target.value)} placeholder="https://recai.applytocollege.pk" />
            </div>
            <div className="grid gap-2">
              <Label>Bearer Token</Label>
              <Input value={tkn} onChange={(e) => setTkn(e.target.value)} placeholder="YOUR_TOKEN" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={async () => { await setBaseUrl(base); await setToken(tkn); }}>
              Save & Test
            </Button>
            {healthy === true && <span className="text-sm text-green-600">Connected</span>}
            {healthy === false && <span className="text-sm text-destructive">Connection failed</span>}
          </div>

          <div className="grid gap-2">
            <Label>Default Instance (Book)</Label>
            <Select value={defaultInstance} onValueChange={setDefaultInstance}>
              <SelectTrigger>
                <SelectValue placeholder={instances.length ? "Select a book" : (tkn ? "No books found" : "Connect API first") } />
              </SelectTrigger>
              <SelectContent>
                {instances.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <Button variant="outline" className="mt-2" onClick={async () => {
                if (!user) return; 
                await supabase.from('profiles').update({ default_instance_id: defaultInstance || null }).eq('user_id', user.id);
              }}>Save Default</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language & Region
          </CardTitle>
          <CardDescription>
            Choose your preferred language and regional settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Language</Label>
              <p className="text-sm text-muted-foreground">
                Select your preferred language for the interface.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
              className="w-32"
            >
              {language === 'en' ? 'English' : 'اردو'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how you receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about your receipts and spending via email.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get real-time alerts about important activities.
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly spending summaries and insights.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription>
            Manage your privacy settings and account security.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Data Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Allow anonymous usage data to help improve the app.
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Receipt Data Retention</Label>
              <p className="text-sm text-muted-foreground">
                Keep receipt images for improved categorization accuracy.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that will affect your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Clear All Data</Label>
              <p className="text-sm text-muted-foreground">
                Remove all receipts, transactions, and personal data.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleClearData}
              size="sm"
            >
              Clear Data
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Sign Out</Label>
              <p className="text-sm text-muted-foreground">
                Sign out of your account on this device.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              size="sm"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}