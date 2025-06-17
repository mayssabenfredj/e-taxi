import { useState, useEffect } from "react";
import { toast } from "sonner";
import EmployeeService from "@/services/employee.service";
import {
  Employee,
  GetEmployeesPagination,
  CreateEmployee,
} from "@/types/employee";

interface UseEmployeesProps {
  enterpriseId?: string;
  roleFilter: string;
  subsidiaryFilter: string;
  statusFilter: string;
  skip: number;
  take: number;
}

export const useEmployees = ({
  enterpriseId,
  roleFilter,
  subsidiaryFilter,
  statusFilter,
  skip,
  take,
}: UseEmployeesProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!enterpriseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const query: GetEmployeesPagination = {
          enterpriseId,
          subsidiaryId:
            subsidiaryFilter !== "all" ? subsidiaryFilter : undefined,
          roleName: roleFilter !== "all" ? roleFilter : undefined,
          skip,
          take,
          includeAllData: true,
        };
        const { data, total } = await EmployeeService.getAllEmployees(query);
        setEmployees(data);
        setTotal(total);
        toast.success("Employés chargés avec succès !");
      } catch (error: any) {
        toast.error(
          `Erreur lors du chargement des employés : ${
            error.message || "Une erreur est survenue."
          }`
        );
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [enterpriseId, skip, take, roleFilter, subsidiaryFilter]);

  // Create employee
  const createEmployee = async (employeeData: CreateEmployee) => {
    const createData: CreateEmployee = {
      email: employeeData.email,
      fullName: employeeData.fullName,
      password: "Default123",
      firstName: employeeData.firstName || undefined,
      lastName: employeeData.lastName || undefined,
      phone: employeeData.phone,
      alternativePhone: employeeData.alternativePhone || undefined,
      enterpriseId,
      subsidiaryId: employeeData.subsidiaryId || undefined,
      managerId: employeeData.managerId || undefined,
      roleIds: employeeData.roleIds || [],
      addresses: employeeData.addresses || undefined,
    };

    if (
      !createData.email ||
      !createData.password ||
      !createData.fullName ||
      !createData.phone ||
      !createData.roleIds.length
    ) {
      throw new Error(
        "Veuillez remplir tous les champs obligatoires (email, mot de passe, nom complet, téléphone, rôles)."
      );
    }

    const newEmployee = await EmployeeService.createEmployee(createData);
    setEmployees((prev) => [newEmployee, ...prev]);
    setTotal((prev) => prev + 1);
    toast.success("Employé ajouté avec succès !");
    return newEmployee;
  };

  // Delete employee
  const deleteEmployee = async (id: string) => {
    await EmployeeService.deleteEmployee(id);
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    setTotal((prev) => prev - 1);
    toast.success("Employé supprimé avec succès !");
  };

  // Toggle employee status
  const toggleEmployeeStatus = async (id: string, currentStatus: string) => {
    const enabled = currentStatus !== "ENABLED";
    const updatedEmployee = await EmployeeService.updateEmployeeStatus(
      id,
      enabled
    );
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? updatedEmployee : emp))
    );
    toast.success(`Employé ${enabled ? "activé" : "désactivé"} avec succès !`);
    return updatedEmployee;
  };

  // Import employees from CSV
  const importEmployees = (importedEmployees: Employee[]) => {
    setEmployees((prev) => [...importedEmployees, ...prev]);
    setTotal((prev) => prev + importedEmployees.length);
    toast.success(
      `${importedEmployees.length} employé(s) importé(s) avec succès !`
    );
  };

  // Apply client-side status filter
  const filteredEmployees = employees.filter((employee) => {
    return statusFilter === "all" || employee.status === statusFilter;
  });

  return {
    employees: filteredEmployees,
    total,
    loading,
    createEmployee,
    deleteEmployee,
    toggleEmployeeStatus,
    importEmployees,
  };
};
