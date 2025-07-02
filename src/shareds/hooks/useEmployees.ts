import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Employee,
  GetEmployeesPagination,
  CreateEmployee,
  CreateMultipleUsersDto,
} from "@/features/employees/types/employee";
import employeeService from "@/features/employees/services/employee.service";

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [localStatusFilter, setLocalStatusFilter] = useState(statusFilter); // Define local statusFilter state

  // Sync localStatusFilter with the prop statusFilter
  useEffect(() => {
    setLocalStatusFilter(statusFilter);
  }, [statusFilter]);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const query: GetEmployeesPagination = {
          ...(enterpriseId ? { enterpriseId } : {}),
          subsidiaryId:
            subsidiaryFilter !== "all" ? subsidiaryFilter : undefined,
          roleName: roleFilter !== "all" ? roleFilter : undefined,
          skip,
          take,
          includeAllData: true,
        };
        const { data, total } = await employeeService.getAllEmployees(query);
        setEmployees(data);
        setTotal(total);
        toast.success("Collaborateurs chargés avec succès !");
      } catch (error: any) {
        toast.error(
          `Erreur lors du chargement des Collaborateurs : ${
            error.message || "Une erreur est survenue."
          }`
        );
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [enterpriseId, skip, take, roleFilter, subsidiaryFilter, refreshTrigger]);

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

    const newEmployee = await employeeService.createEmployee(createData);
    setEmployees((prev) => [newEmployee, ...prev]);
    setTotal((prev) => prev + 1);
    toast.success("Collaborateur ajouté avec succès !");
    setRefreshTrigger((prev) => prev + 1); // Trigger re-fetch
    return newEmployee;
  };

  // Delete employee
  const deleteEmployee = async (id: string) => {
    await employeeService.deleteEmployee(id);
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    setTotal((prev) => prev - 1);
    toast.success("Collaborateur supprimé avec succès !");
    setRefreshTrigger((prev) => prev + 1); // Trigger re-fetch
  };

  // Toggle employee status
  const toggleEmployeeStatus = async (id: string, currentStatus: string) => {
    const enabled = currentStatus !== "ENABLED";
    const updatedEmployee = await employeeService.updateEmployeeStatus(
      id,
      enabled
    );
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? updatedEmployee : emp))
    );
    toast.success(
      `Collaborateur ${enabled ? "activé" : "désactivé"} avec succès !`
    );
    setRefreshTrigger((prev) => prev + 1); // Trigger re-fetch
    return updatedEmployee;
  };

  // Import employees from Excel
  const importEmployees = async (importedEmployees: CreateEmployee[]) => {
    try {
      const payload: CreateMultipleUsersDto = {
        users: importedEmployees,
        continueOnError: true,
      };
      const result = await employeeService.createMultipleEmployees(payload);

      // Affichage du message détaillé
      if (result?.results) {
        if (result.results.totalSuccessful > 0) {
          toast.success(
            `Importation terminée : ${result.results.totalSuccessful} succès, ${result.results.totalFailed} échec(s)`
          );
          setLocalStatusFilter("all");
          setRefreshTrigger((prev) => prev + 1); // On refetch SEULEMENT si succès
        } else {
          toast.error(
            `Aucun utilisateur importé. ${result.results.totalFailed} échec(s) :\n` +
              result.results.failed
                .map((f: any) => `${f.email} : ${f.error}`)
                .join("\n")
          );
        }
      } else {
        toast.error("Erreur lors de l'importation.");
      }
    } catch (error: any) {
      toast.error(
        `Erreur lors de l'importation des Collaborateurs : ${
          error.message || "Une erreur est survenue."
        }`
      );
      throw error;
    }
  };

  // Apply client-side status filter
  const filteredEmployees = employees.filter((employee) => {
    return localStatusFilter === "all" || employee.status === localStatusFilter;
  });

  return {
    employees: filteredEmployees,
    total,
    loading,
    createEmployee,
    deleteEmployee,
    toggleEmployeeStatus,
    importEmployees,
    setStatusFilter: setLocalStatusFilter, // Expose the local setStatusFilter
  };
};
