import React, { useState } from 'react';
import { Button } from '@/shareds/components/ui/button';
import { Plus, Upload, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AddEmployeeForm } from '@/features/employees/components/AddEmployeeForm';
import { AddEmployeeFromCSV } from '@/features/employees/components/AddEmployeeFromCSV';
import { EmployeeStats } from '@/features/employees/components/listPage/EmployeeStats';
import { EmployeeFilters } from '@/features/employees/components/listPage/EmployeeFilters';
import { EmployeeTable } from '@/features/employees/components/listPage/EmployeeTable';
import { EmployeeDialogs } from '@/features/employees/components/listPage/EmployeeDialogs';
import { useEmployees } from '@/shareds/hooks/useEmployees';
import { useAuth } from '@/shareds/contexts/AuthContext';
import { CreateEmployee, Employee } from '@/features/employees/types/employee';
import { useRolesAndSubsidiaries } from '@/shareds/hooks/useRolesAndSubsidiaries';
import { hasPermission } from '@/shareds/lib/utils';

export function EmployeesPage() {
  const { user } = useAuth();
  const enterpriseId = user?.enterpriseId;

  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [subsidiaryFilter, setSubsidiaryFilter] = useState<string>('all');
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState<string>('all'); // Renamed to avoid conflict
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const { employees, total, loading, createEmployee, deleteEmployee, toggleEmployeeStatus, importEmployees, setStatusFilter } = useEmployees({
    enterpriseId,
    roleFilter,
    subsidiaryFilter,
    statusFilter: employeeStatusFilter, // Use renamed state
    skip,
    take,
  });

  const { roles, subsidiaries, loading: loadingRolesSubs } = useRolesAndSubsidiaries(enterpriseId);

  const canCreate = user && hasPermission(user, 'users:create');
  const canUpdate = user && hasPermission(user, 'users:update');
  const canRead = user && hasPermission(user, 'users:read');
  const canEnable = user && hasPermission(user, 'users:enable');
  const canAssignRoles = user && hasPermission(user, 'users:assign_roles');

  const handleEmployeeAdded = async (employeeData: CreateEmployee) => {
    try {
      await createEmployee(employeeData);
      setAddEmployeeOpen(false);
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de Collaborateur:', error);
    }
  };

  const handleDelete = async () => {
    if (selectedEmployee) {
      await deleteEmployee(selectedEmployee.id);
      setDeleteDialogOpen(false);
      setSelectedEmployee(null);
    }
  };

  const handleToggleStatus = async () => {
    if (selectedEmployee) {
      await toggleEmployeeStatus(selectedEmployee.id, selectedEmployee.status);
      setStatusDialogOpen(false);
      setSelectedEmployee(null);
    }
  };

  const clearFilters = () => {
    setRoleFilter('all');
    setSubsidiaryFilter('all');
    setEmployeeStatusFilter('all'); // Use renamed setter
    setSkip(0);
  };

  const handlePageChange = (newSkip: number, newTake: number) => {
    setSkip(newSkip);
    setTake(newTake);
  };

  const handleFilterChange = (filters: Record<string, string>) => {
    setEmployeeStatusFilter(filters.status || 'all'); // Use renamed setter
    setSkip(0);
  };

  const handleEmployeesImported = async (employees: CreateEmployee[]) => {
    await importEmployees(employees);
    setEmployeeStatusFilter('all'); // Reset status filter to show all employees
    setCsvImportOpen(false);
  };

  if (!enterpriseId) {
    return (
      <div className="p-4 text-center">
        <p>Vous devez être associé à une organisation pour gérer les Collaborateurs.</p>
      </div>
    );
  }

  if (!canRead) {
    return (
      <div className="p-8 text-center text-red-600 font-bold text-xl">Accès refusé : vous n'avez pas la permission de voir les collaborateurs.</div>
    );
  }

  return (
    <div className="space-y-6">
      {loading && <div>Chargement...</div>}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">Gestion des Collaborateurs</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:gap-2 w-full md:w-auto">
          {canCreate && (
            <Button
              variant="outline"
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 w-full md:w-auto"
              onClick={() => setCsvImportOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Importer CSV
            </Button>
          )}
          {canCreate && (
            <Button
              className="bg-etaxi-yellow hover:bg-yellow-500 text-black w-full md:w-auto"
              onClick={() => setAddEmployeeOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un Collaborateur
            </Button>
          )}
        </div>
      </div>

      <EmployeeStats employees={employees} total={total} />

      <EmployeeFilters
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        subsidiaryFilter={subsidiaryFilter}
        setSubsidiaryFilter={setSubsidiaryFilter}
        statusFilter={employeeStatusFilter} // Use renamed state
        setStatusFilter={setEmployeeStatusFilter} // Use renamed setter
        clearFilters={clearFilters}
        hasActiveFilters={roleFilter !== 'all' || subsidiaryFilter !== 'all' || employeeStatusFilter !== 'all'}
        roles={roles}
        subsidiaries={subsidiaries}
        loading={loadingRolesSubs}
      />

      <EmployeeTable
        employees={employees}
        total={total}
        skip={skip}
        take={take}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
        onDelete={canUpdate ? (employee) => {
          setSelectedEmployee(employee);
          setDeleteDialogOpen(true);
        } : undefined}
        onToggleStatus={canEnable ? (employee) => {
          setSelectedEmployee(employee);
          setStatusDialogOpen(true);
        } : undefined}
        canUpdate={canUpdate}
        canEnable={canEnable}
        canAssignRoles={canAssignRoles}
      />

      <AddEmployeeForm
        open={addEmployeeOpen}
        onOpenChange={setAddEmployeeOpen}
        onEmployeeAdded={handleEmployeeAdded}
        canCreate={canCreate}
        roles={roles}
        subsidiaries={subsidiaries}
        loading={loadingRolesSubs}
      />

      <AddEmployeeFromCSV
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
        onEmployeesImported={handleEmployeesImported}
        canCreate={canCreate}
        roles={roles}
        subsidiaries={subsidiaries}
        loading={loadingRolesSubs}
      />

      <EmployeeDialogs
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        statusDialogOpen={statusDialogOpen}
        setStatusDialogOpen={setStatusDialogOpen}
        selectedEmployee={selectedEmployee}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}