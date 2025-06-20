import React, { useState } from 'react';
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
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <Logo className="mx-auto mb-4" />
        </div>

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
      </div>
    </div>
  );
}