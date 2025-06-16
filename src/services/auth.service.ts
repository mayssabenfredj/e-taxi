import { LoginResponse, User, UserDetail } from "@/types/user";
import apiClient from "./apiClient";

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      console.log("[authService] Login Request:", { email, password });
      console.log("Hii");
      const response = await apiClient.post<LoginResponse>("/auth/login", {
        email,
        password,
      });
      console.log("[authService] Raw API Response:", response);
      console.log("[authService] Response Data:", response.data);
      if (response.data.access_token) {
        authService.setTokens(response.data.access_token);
        console.log("[authService] Token stored successfully");
      } else {
        console.warn("[authService] No access_token in response");
      }
      return response.data;
    } catch (error: any) {
      console.error("[authService] Login Error:", error);
      console.error("[authService] Error Response:", error.response?.data);
      throw new Error(error.response?.data?.message || "Échec de la connexion");
    }
  },
  logout: async (): Promise<void> => {
    try {
      const token = authService.getStoredToken();
      console.log("[authService] Token before logout:", token);
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  },
  resetPassword: async (token: string, newPassword: string): Promise<any> => {
    try {
      const response = await apiClient.post("/auth/reset-password", {
        token,
        newPassword,
      });
      console.log("[authService] Reset Password Response:", response);
      return response.data;
    } catch (error: any) {
      console.error("[authService] Reset Password Error:", error);
      console.error("[authService] Error Response:", error.response?.data);
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
      console.error("[authService] Send Verification Error:", error);
      console.error("[authService] Error Response:", error.response?.data);
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
      console.log("set tokenn ", token);
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
    console.warn("[authService] localStorage is not available");
    return null;
  },
  clearTokens: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  },
};
