import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';

interface SignInFormProps {
  onToggleMode: () => void;
  onForgotPassword: () => void;
}

export function SignInForm({ onToggleMode, onForgotPassword }: SignInFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        toast.success('Connexion réussie! Redirection vers le dashboard...');
        navigate('/dashboard');
      } else {
        // Use the error from AuthContext if available
        toast.error(error);
      }
    } catch (error: any) {
      const errorMessage = error.response?.message ;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold flex items-center justify-center space-x-2">
          <LogIn className="h-6 w-6 text-etaxi-yellow" />
          <span>Se connecter</span>
        </CardTitle>
        <CardDescription>
          Accédez à votre espace de gestion E-Taxi
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 text-start">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
            />
          </div>
        </CardContent>
        
        <CardFooter className="space-y-4 flex-col">
          <Button 
            type="submit" 
            className="w-full bg-etaxi-yellow hover:bg-yellow-500 text-black"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Se connecter
          </Button>
          
          <div className="flex flex-col space-y-2 text-center">
            <Button 
              variant="link" 
              className="text-sm text-muted-foreground"
              onClick={onForgotPassword}
            >
              Mot de passe oublié ?
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}