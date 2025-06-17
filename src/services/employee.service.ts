
import { Employee, GetEmployeesPagination, CreateEmployee } from '@/types/employee';
import apiClient from './apiClient';

const API_URL = 'http://localhost:3000/api/v1';

class EmployeeService {
  async getAllEmployees(query: GetEmployeesPagination): Promise<{ data: Employee[]; total: number }> {
    try {
      const response = await apiClient.get(`${API_URL}/users`, {
        params: query,
      });

      const { data, meta } = response.data;
      // Transform response to match Employee interface
      const transformedData: Employee[] = data.map((item: any) => ({
        ...item,
        status: item.enabled ? 'ENABLED' : 'DISABLED', // Map enabled to status
        roles: item.roles || [], // Ensure roles is string[]
        addresses: item.addresses || [],
      }));

      return {
        data: transformedData,
        total: meta.total,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch employees');
    }
  }

  async createEmployee(data: CreateEmployee): Promise<Employee> {
    try {
      const response = await apiClient.post(`${API_URL}/users`, data);

      const employee = response.data.data;
      return {
        ...employee,
        status: employee.enabled ? 'ENABLED' : 'DISABLED',
        roles: employee.roles || [],
        addresses: employee.addresses || [],
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create employee');
    }
  }

  async deleteEmployee(id: string): Promise<void> {
    try {
      await apiClient.delete(`${API_URL}/users/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete employee');
    }
  }

  async updateEmployeeStatus(id: string, enabled: boolean): Promise<Employee> {
    try {
      const response = await apiClient.patch(`${API_URL}/users/${id}/status`, { enabled });

      const employee = response.data.data;
      return {
        ...employee,
        status: employee.enabled ? 'ENABLED' : 'DISABLED',
        roles: employee.roles || [],
        addresses: employee.addresses || [],
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update employee status');
    }
  }

  async getAllRoles(): Promise<any[]> {
    try {
      const response = await apiClient.get(`${API_URL}/roles`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch roles');
    }
  }
}

export default new EmployeeService();
