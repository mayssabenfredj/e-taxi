import apiClient from "../../../shareds/services/apiClient";
import {
  CreateTransportRequestDto,
  GetTransportRequestsQueryDto,
  TransportRequestResponse,
  TransportStatus,
  UpdateTransportRequestDto,
} from "@/features/transports/types/demande";

export class DemandeService {
  /**
   * Create a single transport request
   */
  async createTransportRequest(
    data: CreateTransportRequestDto
  ): Promise<TransportRequestResponse> {
    try {
      const response = await apiClient.post(
        "/Demande/transport-requests",
        data
      );
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
    pagination: { total: number; page: number; limit: number };
  }> {
    try {
      const response = await apiClient.get("/Demande/transport-requests", {
        params: query,
      });
      // Ensure the response matches the expected structure
      const { data, pagination } = response.data;
      return { data, pagination };
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
    const response = await apiClient.patch(
      `/Demande/transport-requests/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Update the status of a transport request
   */
  async updateTransportRequestStatus(
    id: string,
    status: TransportStatus
  ): Promise<TransportRequestResponse> {
    try {
      const response = await apiClient.patch(
        `/Demande/transport-requests/${id}/status`,
        { status: status }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to update transport request status: ${error.message}`
      );
    }
  }

  /**
   * Duplicate a transport request with new scheduled dates
   */
  async duplicateTransport(
    id: string,
    scheduledDates: string[]
  ): Promise<TransportRequestResponse[]> {
    try {
      const response = await apiClient.post(
        `/Demande/transport-requests/${id}/duplicate`,
        { scheduledDates }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to duplicate transport request: ${error.message}`
      );
    }
  }
}

export const demandeService = new DemandeService();
