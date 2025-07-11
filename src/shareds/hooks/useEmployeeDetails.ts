import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Employee } from "@/features/employees/types/employee";
import employeeService from "@/features/employees/services/employee.service";

interface UseEmployeeDetailsProps {
  id: string;
  enterpriseId?: string;
}

export const useEmployeeDetails = ({
  id,
  enterpriseId,
}: UseEmployeeDetailsProps) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!enterpriseId || !id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const employeeData = await employeeService.getEmployeeById(id);
        console.log("employee detail *******", employeeData);
        setEmployee(employeeData);
      } catch (error: any) {
        toast.error(
          `Erreur lors du chargement de Collaborateur : ${
            error.message || "Une erreur est survenue."
          }`
        );
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id, enterpriseId]);

  const updateEmployee = async (updatedData: Partial<Employee>) => {
    try {
      const updatedEmployee = await employeeService.updateEmployee(
        id,
        updatedData
      );
      setEmployee(updatedEmployee);
      toast.success("Collaborateur mis à jour avec succès !");
      return updatedEmployee;
    } catch (error: any) {
      toast.error(
        `Erreur lors de la mise à jour de Collaborateur : ${
          error.message || "Une erreur est survenue."
        }`
      );
      throw error;
    }
  };

  return { employee, loading, updateEmployee };
};
