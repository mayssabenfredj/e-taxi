import apiClient from "./apiClient";

export const roleService = {
  async getAllRoles(): Promise<any[]> {
    try {
      const response = await apiClient.get(`/users/roles`);
      console.log('rolee*** : ',response.data);

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch roles");
    }
  },
};
