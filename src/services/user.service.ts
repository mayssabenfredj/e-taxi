import apiClient from "./apiClient";

export const userService = {
  getAll: async () => {
    try {
      const response = await apiClient.get("/users");
      return response.data;
    } catch (error) {
      throw new Error("Échec de la récupération des users");
    }
  },
  getById: async (id: string) => {
    try {
      const response = await apiClient.get(`users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error("Échec de la récupération du user");
    }
  },
  create: async (role: any) => {
    try {
      const response = await apiClient.post("/users", role);
      return response.data;
    } catch (error) {
      throw new Error("Échec de la création du user");
    }
  },
  update: async (id: string, role: any) => {
    try {
      const response = await apiClient.put(`/users/${id}`, role);
      return response.data;
    } catch (error) {
      throw new Error("Échec de la mise à jour du user");
    }
  },
  delete: async (id: string) => {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      throw new Error("Échec de la suppression du user");
    }
  },
};
