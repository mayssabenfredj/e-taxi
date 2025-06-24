import {
  Employee,
  GetEmployeesPagination,
  CreateEmployee,
  UpdateEmployee,
  CreateMultipleUsersDto,
} from "@/types/employee";
import apiClient from "./apiClient";


class EmployeeService {
  async getAllEmployees(
    query: GetEmployeesPagination
  ): Promise<{ data: Employee[]; total: number }> {
    try {
      const response = await apiClient.get(`/users`, {
        params: query,
      });

      const { data, meta } = response.data;
      const transformedData: Employee[] = data.map((item: any) => ({
        ...item,
        status: item.enabled ? "ENABLED" : "DISABLED",
        roles: item.roles || [],
        roleIds: item.roleIds || [],
        addresses: item.addresses || [],
      }));

      return {
        data: transformedData,
        total: meta.total,
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch employees"
      );
    }
  }
  async getEmployeeById(id: string): Promise<Employee> {
    try {
      const response = await apiClient.get(`/users/${id}`);
      const employee = response.data;
      return {
        ...employee,
        status: employee.enabled ? "ENABLED" : "DISABLED",
        roles: employee.roles || [],
        roleIds: employee.roleIds || [],
        addresses: employee.addresses || [],
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch employee"
      );
    }
  }

  async createEmployee(data: CreateEmployee): Promise<Employee> {
    try {

      // Prepare payload
      const payload: CreateEmployee = {
        ...data,
        addresses: data.addresses?.map((addr) => ({
          address: {
            street: addr.address.street,
            postalCode: addr.address.postalCode,
            cityId: addr.address.cityId,
            countryId: addr.address.countryId,
            buildingNumber: addr.address.buildingNumber,
            complement: addr.address.complement,
            regionId: addr.address.regionId,
            latitude: addr.address.latitude,
            longitude: addr.address.longitude,
            placeId: addr.address.placeId,
            formattedAddress: addr.address.formattedAddress,
            isVerified: addr.address.isVerified,
            isExact: addr.address.isExact,
            manuallyEntered: addr.address.manuallyEntered,
            addressType: addr.address.addressType,
            notes: addr.address.notes,
          },
          isDefault: addr.isDefault,
          label: addr.label,
        })),
      };

      const response = await apiClient.post(`/users`, payload);
      const employee = response.data;
      return {
        ...employee,
        status: employee.enabled ? "ENABLED" : "DISABLED",
        roles: employee.roles || [],
        roleIds: employee.roleIds || [],
        addresses: employee.addresses || [],
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to create employee: ${error.message}`
      );
    }
  }

  async deleteEmployee(id: string) {
    try {
      const response = await apiClient.delete(`/users/${id}`);
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete employee"
      );
    }
  }

  async updateEmployee(id: string, data: UpdateEmployee) {
    try {
      const response = await apiClient.put(`/users/${id}`, data);
      const employee = response.data;
      return {
        ...employee,
        status: employee.enabled ? "ENABLED" : "DISABLED",
        roles: employee.roles || [],
        roleIds: employee.roleIds || [],
        addresses: employee.addresses || [],
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update employee"
      );
    }
  }

  async updateEmployeeStatus(id: string, enabled: boolean): Promise<Employee> {
    try {
      const response = await apiClient.patch(`/users/${id}/status`, {
        enabled,
      });

      const employee = response.data;
      return {
        ...employee,
        status: employee.enabled ? "ENABLED" : "DISABLED",
        roles: employee.roles || [],
        roleIds: employee.roleIds || [],
        addresses: employee.addresses || [],
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update employee status"
      );
    }
  }

  async createMultipleEmployees(
    data: CreateMultipleUsersDto
  ): Promise<any> {
    try {

      // Prepare payload
      const payload: CreateMultipleUsersDto = {
        users: data.users.map((user) => ({
          ...user,
          addresses: user.addresses?.map((addr) => ({
            address: {
              street: addr.address.street,
              postalCode: addr.address.postalCode,
              cityId: addr.address.cityId,
              countryId: addr.address.countryId,
              buildingNumber: addr.address.buildingNumber,
              complement: addr.address.complement,
              regionId: addr.address.regionId,
              latitude: addr.address.latitude,
              longitude: addr.address.longitude,
              placeId: addr.address.placeId,
              formattedAddress: addr.address.formattedAddress,
              isVerified: addr.address.isVerified,
              isExact: addr.address.isExact,
              manuallyEntered: addr.address.manuallyEntered,
              addressType: addr.address.addressType,
              notes: addr.address.notes,
            },
            isDefault: addr.isDefault,
            label: addr.label,
          })),
        })),
        continueOnError: data.continueOnError,
      };

      const response = await apiClient.post(`/users/bulk`, payload);
      const employees = response.data;
    
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to create multiple employees: ${error.message}`
      );
    }
  }
}

export default new EmployeeService();
