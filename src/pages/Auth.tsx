import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';
import { z } from 'zod';
import { Loader2, ArrowLeft } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'reset';

export default function Auth() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // SEO optimization
  useSEO(SEO_CONFIG.auth);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(redirect || '/dashboard');
    }
  }, [user, navigate, redirect]);

  const emailSchema = z.string().email(t('auth.errors.invalidEmail'));
  const passwordSchema = z.string().min(6, t('auth.errors.passwordTooShort'));

  const validateInputs = (skipPassword = false) => {
    try {
      emailSchema.parse(email);
      if (!skipPassword) {
        passwordSchema.parse(password);
      }
      if (mode === 'signup' && !fullName.trim()) {
        throw new Error(t('auth.errors.nameRequired'));
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: 'destructive',
          title: t('auth.errors.invalidInput'),
          description: error.errors[0].message,
        });
      } else if (error instanceof Error) {
        toast({
          variant: 'destructive',
          title: t('common.error'),
          description: error.message,
        });
      }
      return false;
    }
  };

  const handlePasswordReset = async () => {
    if (!validateInputs(true)) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      
      if (error) {
        toast({
          variant: 'destructive',
          title: t('auth.errors.resetFailed'),
          description: error.message,
        });
      } else {
        toast({
          title: t('auth.resetEmailSent'),
          description: t('auth.resetEmailSentDescription'),
        });
        setMode('login');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('auth.errors.unexpected'),
        description: t('auth.errors.tryAgain'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'reset') {
      await handlePasswordReset();
      return;
    }
    
    if (!validateInputs()) return;
    
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            variant: 'destructive',
            title: t('auth.errors.loginFailed'),
            description: t('auth.errors.checkCredentials'),
          });
        } else {
          toast({
            title: t('auth.welcomeBack'),
            description: t('auth.loginSuccess'),
          });
          navigate(redirect || '/dashboard');
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({
            variant: 'destructive',
            title: t('auth.errors.signupFailed'),
            description: error.message,
          });
        } else {
          toast({
            title: t('auth.welcome'),
            description: t('auth.accountCreated'),
          });
          navigate(redirect || '/dashboard');
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('auth.errors.unexpected'),
        description: t('auth.errors.tryAgain'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return t('auth.signIn');
      case 'signup': return t('auth.signUp');
      case 'reset': return t('auth.resetPassword');
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'login': return t('auth.signInDescription');
      case 'signup': return t('auth.signUpDescription');
      case 'reset': return t('auth.resetPasswordDescription');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Link>
          </Button>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold">
              {getTitle()}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {getDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder={t('auth.fullNamePlaceholder')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {mode !== 'reset' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('reset')}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        {t('auth.forgotPassword')}
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('auth.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  mode === 'reset' ? t('auth.sendResetLink') : getTitle()
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              {mode === 'reset' ? (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('auth.backToLogin')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {mode === 'login' 
                    ? t('auth.noAccount') 
                    : t('auth.hasAccount')}
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
