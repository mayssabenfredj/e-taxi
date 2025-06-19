import apiClient from "./apiClient";
import {
  CreateTransportRequestDto,
  GetTransportRequestsQueryDto,
  TransportRequestResponse,
  UpdateTransportRequestDto,
} from "@/types/demande";

export class DemandeService {
  /**
   * Create a single transport request
   */
  async createTransportRequest(
    data: CreateTransportRequestDto
  ): Promise<TransportRequestResponse> {
    try {
      console.log("demande", data);
      const response = await apiClient.post(
        "/Demande/transport-requests",
        data
      );
      console.log("demandeess" , response.data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create transport request: ${error.message}`);
    }
  }

  /**
   * Create multiple transport requests (bulk)
   */
  async createMultipleTransportRequests(
    data: CreateTransportRequestDto[]
  ): Promise<TransportRequestResponse[]> {
    try {
      const response = await apiClient.post(
        "/Demande/transport-requests/bulk",
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to create multiple transport requests: ${error.message}`
      );
    }
  }

  /**
   * Get transport request by ID
   */
  async getTransportRequestById(id: string): Promise<TransportRequestResponse> {
    try {
      const response = await apiClient.get(`/Demande/transport-requests/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get transport request: ${error.message}`);
    }
  }

  /**
   * Get all transport requests with pagination and filters
   */
  async getTransportRequests(query: GetTransportRequestsQueryDto): Promise<{
    data: TransportRequestResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const response = await apiClient.get("/Demande/transport-requests", {
        params: query,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get transport requests: ${error.message}`);
    }
  }

  /**
   * Health check for transport management service
   */
  async healthCheck(): Promise<{
    status: string;
    service: string;
    timestamp: string;
    [key: string]: any;
  }> {
    try {
      const response = await apiClient.get("/Demande/health");
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  async updateTransportRequest(id: string, data: UpdateTransportRequestDto) {
    console.log('PATCH updateTransportRequest data:', data);
    const response = await apiClient.patch(`/Demande/transport-requests/${id}`, data);
    return response.data;
  }
}

export const demandeService = new DemandeService();
