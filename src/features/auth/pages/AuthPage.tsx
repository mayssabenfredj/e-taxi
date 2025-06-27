import React, { useState } from 'react';
import { Button } from '@/shareds/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/shareds/Logo';
import { SignUpForm } from '@/features/auth/components/SignUpForm';
import { SignInForm } from '@/features/auth/components/SignInForm';
import { useTheme } from '@/shareds/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative">
      {/* Logo en haut à gauche */}
      <div
        className="absolute top-4 left-4 cursor-pointer z-10"
        onClick={() => navigate('/')}
      >
        <Logo className="h-10 w-auto" />
      </div>
      {/* Toggle theme button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-700 shadow hover:bg-yellow-100 dark:hover:bg-gray-600 transition-colors"
        aria-label="Changer le thème"
        type="button"
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5 text-yellow-400" />
        ) : (
          <Moon className="h-5 w-5 text-gray-700" />
        )}
      </button>
      <div className="w-full max-w-2xl">
       

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