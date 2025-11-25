import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().email('Virheellinen sähköpostiosoite');
const passwordSchema = z.string().min(6, 'Salasanan tulee olla vähintään 6 merkkiä');

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateInputs = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (!isLogin && !fullName.trim()) {
        throw new Error('Nimi on pakollinen');
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: 'destructive',
          title: 'Virheellinen syöte',
          description: error.errors[0].message,
        });
      } else if (error instanceof Error) {
        toast({
          variant: 'destructive',
          title: 'Virhe',
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
          if (error.message.includes('Invalid login credentials')) {
            toast({
              variant: 'destructive',
              title: 'Kirjautuminen epäonnistui',
              description: 'Tarkista sähköpostiosoite ja salasana.',
            });
          } else {
            toast({
              variant: 'destructive',
              title: 'Virhe',
              description: error.message,
            });
          }
        } else {
          toast({
            title: 'Tervetuloa takaisin!',
            description: 'Kirjautuminen onnistui.',
          });
          navigate('/dashboard');
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              variant: 'destructive',
              title: 'Käyttäjä on jo olemassa',
              description: 'Tämä sähköpostiosoite on jo rekisteröity. Kirjaudu sisään.',
            });
          } else {
            toast({
              variant: 'destructive',
              title: 'Rekisteröinti epäonnistui',
              description: error.message,
            });
          }
        } else {
          toast({
            title: 'Tervetuloa!',
            description: 'Tili luotu onnistuneesti.',
          });
          navigate('/dashboard');
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Odottamaton virhe',
        description: 'Yritä uudelleen myöhemmin.',
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
            <CardTitle>{isLogin ? 'Kirjaudu sisään' : 'Luo tili'}</CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Kirjaudu sisään jatkaaksesi Jeesi.io -alustalle' 
                : 'Aloita AI-agenttien rakentaminen'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nimi</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Koko nimesi"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Sähköposti</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nimi@yritys.fi"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Salasana</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Vähintään 6 merkkiä"
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
                  ? 'Ladataan...' 
                  : isLogin ? 'Kirjaudu sisään' : 'Luo tili'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline"
              >
                {isLogin 
                  ? 'Ei vielä tiliä? Rekisteröidy' 
                  : 'Onko sinulla jo tili? Kirjaudu sisään'}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
