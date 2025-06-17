import apiClient from "./apiClient";
import {
  Employee,
  CreateEmployee,
  UpdateEmployee,
  GetEmployeesQuery,
  GetEmployeesPagination,
} from "../types/employee";
import { Role } from "@/types/role";

export class EmployeeService {
  // Get all employees with pagination and filters
  static async getAllEmployees(query: GetEmployeesPagination) {
    try {
      const response = await apiClient.get<{ data: Employee[]; total: number }>(
        "/users",
        { params: query }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch employees: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  // Get a single employee by ID
  static async getEmployee(id: string) {
    try {
      const response = await apiClient.get<Employee>(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch employee: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  // Create a new employee
  static async createEmployee(createData: CreateEmployee) {
    try {
      const response = await apiClient.post<Employee>("/users", createData);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to create employee: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  // Update an existing employee
  static async updateEmployee(id: string, updateData: UpdateEmployee) {
    try {
      const response = await apiClient.put<Employee>(
        `/users/${id}`,
        updateData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to update employee: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  // Delete an employee
  static async deleteEmployee(id: string) {
    try {
      const response = await apiClient.delete<{ message: string }>(
        `/users/${id}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to delete employee: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  // Update employee status
  static async updateEmployeeStatus(id: string, enabled: boolean) {
    try {
      const response = await apiClient.put<Employee>(`/users/${id}/status`, {
        enabled,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to update employee status: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  // Get all roles
  static async getAllRoles() {
    try {
      const response = await apiClient.get<Role[]>("/users/roles");
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch roles: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  // Get all permissions
  static async getAllPermissions() {
    try {
      const response = await apiClient.get<string[]>(
        "/users/roles/permissions"
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch permissions: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }
}

export default EmployeeService;
