import { CreateEnterpriseDto, EnterpriseResponse, EntityStatus, SignUpEntrepriseDto, UpdateEnterpriseDto } from "@/types/entreprise";
import apiClient from "./apiClient";

export const entrepriseService = {
  async createEnterprise(
    dto: SignUpEntrepriseDto,
    file?: File
  ){
    const formData = new FormData();
        formData.append("titre", dto.titre);
        formData.append("email", dto.email);
        if (dto.phone) {
          formData.append("phone", dto.phone);
        }  
    if (file) {
      formData.append("file", file);
    }
        try {
        console.log("FormData:", formData); // Log the FormData object to check its content
      const response = await apiClient.post("/entreprise", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response;
    } catch (error) {
          console.log("Error creating enterprise:", error);
          console.log(error.response.message);
    }
  },

  async findAll(params: {
    skip?: number;
    take?: number;
    status?: EntityStatus;
  }): Promise<EnterpriseResponse> {
    try {
      const response = await apiClient.get("/entreprise", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching enterprises:", error);
      throw error;
    }
  },

  async findOne(id: string): Promise<EnterpriseResponse> {
    try {
      const response = await apiClient.get(`/entreprise/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching enterprise with id ${id}:`, error);
      throw error;
    }
  },

  async getStats(id: string): Promise<EnterpriseResponse> {
    try {
      const response = await apiClient.get(`/entreprise/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching stats for enterprise with id ${id}:`,
        error
      );
      throw error;
    }
  },

  async update(
    id: string,
    dto: UpdateEnterpriseDto
  ): Promise<EnterpriseResponse> {
    try {
      const response = await apiClient.put(`/entreprise/${id}`, dto);
      return response.data;
    } catch (error) {
      console.error(`Error updating enterprise with id ${id}:`, error);
      throw error;
    }
  },

  async verifyAccount(token: string): Promise<EnterpriseResponse> {
    try {
      const response = await apiClient.get(
        `/entreprise/verify-enterprise-account/${token}`
      );
      return response.data;
    } catch (error) {
      console.error("Error verifying enterprise account:", error);
      throw error;
    }
  },
};
