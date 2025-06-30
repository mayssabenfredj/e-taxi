import apiClient from "@/shareds/services/apiClient";
import { Permission } from "../types/permission";

export const permissionService = {
  getPermissions: async (): Promise<Permission[]> => {
    try {
      const response = await apiClient.get("/users/roles/permissions");
      return response.data;
    } catch (error) {
      console.error("Error fetching permissions:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(
        error.response?.data?.message || "Failed to fetch permissions"
      );
    }
  },
};
