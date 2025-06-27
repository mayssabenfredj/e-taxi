import React, { createContext, useContext, useState, useEffect } from 'react';
import { LoginResponse, User, UserDetail } from '@/shareds/types/user';
import { authService } from '@/features/auth/services/auth.service';

interface AuthContextType {
  user: UserDetail | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<boolean>;
  isAuthenticated: boolean;
  refreshUser: () => Promise<UserDetail | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!authService.getStoredToken();

  useEffect(() => {
    // Check for existing auth token and fetch user data
    const initializeAuth = async () => {
      try {
        const token = authService.getStoredToken();
        if (token) {
          console.log("[AuthContext] Found stored token, fetching user data...");
          const userData = await authService.getCurrentUser();
          console.log("[AuthContext] User data fetched successfully:", userData);
          setUser(userData);
        } else {
          console.log("[AuthContext] No stored token found");
        }
      } catch (err: any) {
        console.error("[AuthContext] Error during auth initialization:", err);
        // Clear invalid tokens
        authService.clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('[AuthContext] Attempting login for:', email);
      const response: LoginResponse = await authService.login(email, password);
      
      // Store the token
      authService.setTokens(response.access_token);

      // Fetch full user data after successful login
      const userData = await authService.getCurrentUser();
      setUser(userData);
      console.log("[AuthContext] Login successful, user set:", userData);
      
      setIsLoading(false);
      return true;
    } catch (error: any) {
      setIsLoading(false);
      console.error('[AuthContext] Login error:', error);
      const errorMessage = error.message || 'Échec de la connexion';
      setError(errorMessage);
      return false;
    }
  };

  const register = async (data: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement actual registration API call
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
      console.log('[AuthContext] Logging out...');
      await authService.logout();
      setUser(null);
      authService.clearTokens();
      console.log('[AuthContext] Logout successful');
    } catch (error: any) {
      console.error('[AuthContext] Logout error:', error);
      setError(error.message || 'Erreur lors de la déconnexion');
      // Still clear local state even if server logout fails
      setUser(null);
      authService.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement actual email verification API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
      return true;
    } catch (error: any) {
      setIsLoading(false);
      setError(error.message || 'Erreur lors de la vérification de l\'email');
      return false;
    }
  };

  // Add refreshUser function to fetch and update user data
  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (err: any) {
      console.error('[AuthContext] Error refreshing user:', err);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
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
        isAuthenticated,
        refreshUser,
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