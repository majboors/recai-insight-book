import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Authentication | Receipt Zen';
    
    // Redirect if already authenticated
    if (user) {
      const key = `onboarding_complete:${user.id}`;
      const legacy = localStorage.getItem('onboarding_complete') === 'true';
      const local = localStorage.getItem(key) === 'true' || legacy;
      const meta = Boolean((user as any)?.user_metadata?.onboarding_complete);

      // Migrate legacy flag if present
      if (legacy && !localStorage.getItem(key)) {
        localStorage.setItem(key, 'true');
      }

      if (local || meta) {
        navigate('/');
      } else {
        navigate('/onboarding');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let error;
      
      if (isSignUp) {
        const result = await signUp(email, password, displayName);
        error = result.error;
        
        if (!error) {
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account.",
          });
        }
      } else {
        const result = await signIn(email, password);
        error = result.error;
        
        if (!error) {
          const legacy = localStorage.getItem('onboarding_complete') === 'true';
          const perKey = user ? `onboarding_complete:${user.id}` : null;
          const perLocal = perKey ? localStorage.getItem(perKey) === 'true' : false;
          if (perLocal || legacy) {
            navigate('/');
          } else {
            navigate('/onboarding');
          }
        }
      }

      if (error) {
        let message = error.message;
        
        // Handle common auth errors with friendly messages
        if (error.message.includes('Invalid login credentials')) {
          message = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('User already registered')) {
          message = 'This email is already registered. Try signing in instead.';
        } else if (error.message.includes('Password should be at least 6 characters')) {
          message = 'Password must be at least 6 characters long.';
        }
        
        toast({
          title: "Authentication Error",
          description: message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Unexpected Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-muted">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-2xl font-light text-foreground">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isSignUp ? 'Sign up to get started with Receipt Zen' : 'Sign in to your account'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm font-medium">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="border-muted focus:border-primary"
                  placeholder="Your name"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-muted focus:border-primary"
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-muted focus:border-primary"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}