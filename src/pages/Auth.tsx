import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

export default function Auth() {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const emailSchema = z.string().email(t('auth.errors.invalidEmail'));
  const passwordSchema = z.string().min(6, t('auth.errors.passwordTooShort'));

  const validateInputs = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (!isLogin && !fullName.trim()) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) return;
    
    setIsLoading(true);

    try {
      if (isLogin) {
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
          navigate('/dashboard');
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
          navigate('/dashboard');
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

  return (
    <div className="min-h-screen bg-muted/50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? t('auth.signIn') : t('auth.signUp')}</CardTitle>
            <CardDescription>
              {isLogin 
                ? t('auth.signInDescription') 
                : t('auth.signUpDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder={t('auth.fullNamePlaceholder')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading 
                  ? t('common.loading') 
                  : isLogin ? t('auth.signIn') : t('auth.signUp')}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline"
              >
                {isLogin 
                  ? t('auth.noAccount') 
                  : t('auth.hasAccount')}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
