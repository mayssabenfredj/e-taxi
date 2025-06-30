import apiClient from "../../../shareds/services/apiClient";

export const roleService = {
  async getAllRoles(): Promise<any[]> {
    try {
      const response = await apiClient.get(`/users/roles`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch roles");
    }
  },

  getById: async (id: string) => {
    try {
      const response = await apiClient.get(`users/roles/${id}`);
      return response.data;
    } catch (error) {
      throw new Error("Échec de la récupération du rôle");
    }
  },
  create: async (role: any) => {
    try {
      const response = await apiClient.post("/users/roles", role);
      return response.data;
    } catch (error) {
      throw new Error("Échec de la création du rôle");
    }
  },
  update: async (id: string, role: any) => {
    try {
      const response = await apiClient.put(`/users/roles/${id}`, role);
      return response.data;
    } catch (error) {
      throw new Error("Échec de la mise à jour du rôle");
    }
  },
  delete: async (id: string) => {
    try {
      await apiClient.delete(`/users/roles/${id}`);
    } catch (error) {
      throw new Error("Échec de la suppression du rôle");
    }
  },
};
