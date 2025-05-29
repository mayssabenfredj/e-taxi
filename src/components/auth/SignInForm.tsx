
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface SignInFormProps {
  onToggleMode: () => void;
  onForgotPassword: () => void;
}

export function SignInForm({ onToggleMode, onForgotPassword }: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Connexion réussie!');
    } catch (error) {
      toast.error('Erreur de connexion');
    }
  };

  return (
    <Card className="w-full max-w-md animate-slide-up">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{t('signin')}</CardTitle>
        <CardDescription>
          Connectez-vous à votre espace entreprise
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="transition-all duration-200 focus:ring-2 focus:ring-etaxi-yellow"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-etaxi-yellow"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-etaxi-yellow hover:bg-yellow-500 text-black font-semibold transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('signin')}
          </Button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <Button
            variant="link"
            onClick={onForgotPassword}
            className="text-sm text-muted-foreground hover:text-etaxi-yellow"
          >
            {t('forgotPassword')}
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {t('noAccount')}{' '}
            <Button
              variant="link"
              onClick={onToggleMode}
              className="p-0 h-auto text-etaxi-yellow hover:text-yellow-500"
            >
              {t('signup')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
