import { LoginResponse, User, UserDetail } from "@/types/user";
import apiClient from "./apiClient";

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
     
      const response = await apiClient.post<LoginResponse>("/auth/login", {
        email,
        password,
      });
      
      if (response.data.access_token) {
        authService.setTokens(response.data.access_token);
      } else {
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Échec de la connexion");
    }
  },
  logout: async (): Promise<void> => {
    try {
      const token = authService.getStoredToken();
      await apiClient.post("/auth/logout");
    } catch (error) {
    }
  },
  resetPassword: async (token: string, newPassword: string): Promise<any> => {
    try {
      const response = await apiClient.post("/auth/reset-password", {
        token,
        newPassword,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Échec de la réinitialisation du mot de passe"
      );
    }
  },
  sendVerification: async (email: string): Promise<any> => {
    try {
      const response = await apiClient.post("/auth/send-verification", {
        email,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Échec de l'envoi de l'email de vérification"
      );
    }
  },
  getCurrentUser: async (): Promise<UserDetail> => {
    try {
      const response = await apiClient.get<UserDetail>("/auth/me");
      return response.data;
    } catch (error) {
      authService.clearTokens(); // Use authService.clearTokens
      throw new Error("Échec de la récupération de l'utilisateur");
    }
  },
  setTokens: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    } else {
      console.warn("[authService] localStorage is not available");
    }
  },
  getStoredToken: (): string | null => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      return token;
    }
    return null;
  },
  clearTokens: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  },
};
