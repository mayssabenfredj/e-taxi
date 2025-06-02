import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { SignInForm } from '@/components/auth/SignInForm';

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">
            {isSignUp ? 'Créer un compte' : 'Connexion'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isSignUp 
              ? 'Rejoignez notre plateforme de transport' 
              : 'Accédez à votre tableau de bord'
            }
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {isSignUp ? 'Inscription' : 'Se connecter'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isSignUp ? (
              <SignUpForm />
            ) : (
              <SignInForm 
                onForgotPassword={handleForgotPassword}
                onToggleMode={handleToggleMode}
              />
            )}
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isSignUp ? 'Vous avez déjà un compte?' : "Vous n'avez pas de compte?"}
              </p>
              <Button
                variant="link"
                onClick={handleToggleMode}
                className="text-etaxi-yellow hover:text-yellow-600"
              >
                {isSignUp ? 'Se connecter' : 'Créer un compte'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}