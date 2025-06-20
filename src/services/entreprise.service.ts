import { CreateEnterpriseDto, EnterpriseResponse, EntityStatus, SignUpEntrepriseDto, UpdateEnterpriseDto } from "@/types/entreprise";
import apiClient from "./apiClient";
import { AxiosResponse } from "axios";

interface CreateEnterpriseResponse {
  success: boolean;
  error?: string;
  data?: any; // Replace 'any' with a more specific type if possible
}
export const entrepriseService = {
  async createEnterprise(
    dto: SignUpEntrepriseDto,
    file?: File
  ): Promise<CreateEnterpriseResponse> {
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
      const response: AxiosResponse = await apiClient.post(
        "/entreprise",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Assuming the API returns a response with success/error fields
      return {
        success: response.status >= 200 && response.status < 300,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Error creating enterprise:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Erreur lors de la création du compte",
      };
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
    dto: UpdateEnterpriseDto,
    file?: File
  ): Promise<any> {
    try {
      console.log("dto:", dto);
      console.log("file:", file);
      const formData = new FormData();
      formData.append("titre", dto.titre || "");
      formData.append("email", dto.email || "");

      if (dto.phone) {
        formData.append("phone", dto.phone);
      }
      if (dto.mobile) {
        formData.append("mobile", dto.mobile);
      }
      if (dto.secteurActivite) {
        formData.append("secteurActivite", dto.secteurActivite);
      }
      if (dto.matriculeFiscal) {
        formData.append("matriculeFiscal", dto.matriculeFiscal);
      }
      if (dto.status) {
        formData.append("status", dto.status);
      }
      if (dto.website) {
        formData.append("website", dto.website);
      }
      if (dto.address) {
        if (dto.address.label)
          formData.append("address[label]", dto.address.label);
        if (dto.address.street)
          formData.append("address[street]", dto.address.street);
        if (dto.address.buildingNumber)
          formData.append(
            "address[buildingNumber]",
            dto.address.buildingNumber
          );
        if (dto.address.complement)
          formData.append("address[complement]", dto.address.complement);
        if (dto.address.postalCode)
          formData.append("address[postalCode]", dto.address.postalCode);
        if (dto.address.cityId)
          formData.append("address[cityId]", dto.address.cityId);
        if (dto.address.regionId)
          formData.append("address[regionId]", dto.address.regionId);
        if (dto.address.countryId)
          formData.append("address[countryId]", dto.address.countryId);
        if (dto.address.latitude)
          formData.append("address[latitude]", dto.address.latitude.toString());
        if (dto.address.longitude)
          formData.append(
            "address[longitude]",
            dto.address.longitude.toString()
          );
        if (dto.address.placeId)
          formData.append("address[placeId]", dto.address.placeId);
        if (dto.address.formattedAddress)
          formData.append(
            "address[formattedAddress]",
            dto.address.formattedAddress
          );
        if (dto.address.isVerified !== undefined)
          formData.append(
            "address[isVerified]",
            dto.address.isVerified.toString()
          );
        if (dto.address.isExact !== undefined)
          formData.append("address[isExact]", dto.address.isExact.toString());
        if (dto.address.manuallyEntered !== undefined)
          formData.append(
            "address[manuallyEntered]",
            dto.address.manuallyEntered.toString()
          );
        if (dto.address.addressType)
          formData.append("address[addressType]", dto.address.addressType);
        if (dto.address.notes)
          formData.append("address[notes]", dto.address.notes);
      }
      if (file) {
        formData.append("file", file);
      }

      const response = await apiClient.patch(`/entreprise/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("response:", response);
      return response;
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
  async getLogoImage(path: string): Promise<string> {
    try {
      console.log("Fetching logo for path:", path);
      const fullUrl = `/entreprise/logo/${path}`;
      console.log(
        "Full logo request URL:",
        `${apiClient.defaults.baseURL}${fullUrl}`
      );
      const response = await apiClient.get(fullUrl, {
        responseType: "json", // Expect JSON response
      });
      console.log("Logo response data:", response.data);
      const { base64, contentType } = response.data.data;
      if (!base64 || !contentType) {
        throw new Error("Invalid logo response: missing base64 or contentType");
      }
      const dataUrl = `data:${contentType};base64,${base64}`;
      console.log("Generated data URL length:", dataUrl.length);
      return dataUrl;
    } catch (error) {
      console.error(
        `Error fetching logo image for path ${path}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  },
};
