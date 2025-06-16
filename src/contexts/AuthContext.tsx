import React, { createContext, useContext, useState, useEffect } from 'react';
import { LoginResponse, User, UserDetail } from '@/types/user';
import { authService } from '@/services/auth.service';

interface AuthContextType {
  user: UserDetail | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing auth token and fetch user data
    const initializeAuth = async () => {
      const token = authService.getStoredToken();
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          console.log("user in the context", userData);
          setUser(userData);
          console.log('useeerrr', userData);
        } catch (err) {
          authService.clearTokens();
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('emaill, pass', email);
      const response: LoginResponse = await authService.login(email, password);
      authService.setTokens(response.access_token);

      // Fetch full user data after successful login
      const userData = await authService.getCurrentUser();
      setUser(userData);
console.log("user in the context", userData);
      setIsLoading(false);
      return true;
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la connexion';
      setError(errorMessage);
      return false;
    }
  };

  const register = async (data: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
      return true;
    } catch (error: any) {
      setIsLoading(false);
      setError(error.message || 'Erreur lors de l\'inscription');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.logout();
      setUser(null);
      authService.clearTokens();
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la déconnexion');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
      return true;
    } catch (error: any) {
      setIsLoading(false);
      setError(error.message || 'Erreur lors de la vérification de l\'email');
      return false;
    }
  };

  

 

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        verifyEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}