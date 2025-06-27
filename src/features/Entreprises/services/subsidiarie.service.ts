// src/services/subsidiary.service.ts
import apiClient from "@/shareds/services/apiClient";
import {
  Subsidiary,
  CreateSubsidiary,
  UpdateSubsidiary,
  UpdateStatus,
  EntityStatus,
  SubsidiaryQueryParams,
} from "../types/subsidiary";

export class SubsidiaryService {
  // Create a new subsidiary
  static async createSubsidiary(data: CreateSubsidiary): Promise<Subsidiary> {
    try {
      const response = await apiClient.post<Subsidiary>("/subsidiary", data);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to create subsidiary: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  // Fetch all subsidiaries, optionally filtered by enterpriseId
  static async getAllSubsidiaries(
    query: SubsidiaryQueryParams = {}
  ): Promise<{ data: Subsidiary[]; total: number }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: Subsidiary[];
        meta: { total: number; skip: number; take: number };
      }>("/subsidiary", {
        params: {
          enterpriseId: query.enterpriseId,
          subsidiaryId: query.subsidiaryId,
          name: query.name,
          status: query.status, // Default to ACTIVE
          include: query.include,
          skip: query.skip ?? 0,
          take: query.take ?? 10,
        },
      });
      return { data: response.data.data, total: response.data.meta.total };
    } catch (error: any) {
      throw new Error(
        `Failed to fetch subsidiaries: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  // Fetch a single subsidiary by ID
  static async getSubsidiaryById(id: string): Promise<Subsidiary> {
    try {
      const response = await apiClient.get<Subsidiary>(`/subsidiary/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch subsidiary: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  // Update a subsidiary by ID
  static async updateSubsidiary(
    id: string,
    data: UpdateSubsidiary
  ): Promise<Subsidiary> {
    try {
      const response = await apiClient.put<Subsidiary>(
        `/subsidiary/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to update subsidiary: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  // Delete a subsidiary by ID
  static async deleteSubsidiary(id: string): Promise<void> {
    try {
      await apiClient.delete(`/subsidiary/${id}`);
    } catch (error) {
      throw new Error(
        `Failed to delete subsidiary: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  // Update the status of a subsidiary
  static async updateSubsidiaryStatus(
    id: string,
    status: EntityStatus
  ): Promise<Subsidiary> {
    try {
      const response = await apiClient.put<Subsidiary>(
        `/subsidiary/${id}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to update subsidiary status: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }
}

export default SubsidiaryService;
