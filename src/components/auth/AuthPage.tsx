
import React, { useState } from 'react';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { Logo } from '../Logo';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      {/* Top controls */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Globe className="h-4 w-4 mr-2" />
              {language.toUpperCase()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setLanguage('fr')}>
              Français
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('en')}>
              English
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center animate-fade-in">
          <Logo className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Plateforme de Transport
          </h1>
          <p className="text-muted-foreground">
            Gérez vos demandes de transport d'entreprise
          </p>
        </div>

        {showForgotPassword ? (
          <div className="text-center">
            <p>Fonctionnalité de récupération à implémenter</p>
            <Button
              variant="link"
              onClick={() => setShowForgotPassword(false)}
              className="text-etaxi-yellow"
            >
              Retour à la connexion
            </Button>
          </div>
        ) : isSignIn ? (
          <SignInForm
            onToggleMode={() => setIsSignIn(false)}
            onForgotPassword={() => setShowForgotPassword(true)}
          />
        ) : (
          <SignUpForm onToggleMode={() => setIsSignIn(true)} />
        )}
      </div>
    </div>
  );
}
