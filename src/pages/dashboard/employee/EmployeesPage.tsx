import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AddEmployeeForm } from '@/components/employee/AddEmployeeForm';
import { AddEmployeeFromCSV } from '@/components/employee/AddEmployeeFromCSV';
import { EmployeeStats } from '@/components/employee/EmployeeStats';
import { EmployeeFilters } from '@/components/employee/EmployeeFilters';
import { EmployeeTable } from '@/components/employee/EmployeeTable';
import { EmployeeDialogs } from '@/components/employee/EmployeeDialogs';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/contexts/AuthContext';
import { CreateEmployee, Employee } from '@/types/employee';

export function EmployeesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const enterpriseId = user?.enterpriseId;

  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [subsidiaryFilter, setSubsidiaryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const { employees, total, loading, createEmployee, deleteEmployee, toggleEmployeeStatus, importEmployees } = useEmployees({
    enterpriseId,
    roleFilter,
    subsidiaryFilter,
    statusFilter,
    skip,
    take,
  });

  const handleEmployeeAdded = async (employeeData: CreateEmployee) => {
    try {
      await createEmployee(employeeData);
      setAddEmployeeOpen(false);
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de l\'employé:', error);
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
    setStatusFilter('all');
    setSkip(0);
  };

  const handlePageChange = (newSkip: number, newTake: number) => {
    setSkip(newSkip);
    setTake(newTake);
  };

  const handleFilterChange = (filters: Record<string, string>) => {
    setStatusFilter(filters.status || 'all');
    setSkip(0);
  };

  if (!enterpriseId) {
    return (
      <div className="p-4 text-center">
        <p>Vous devez être associé à une entreprise pour gérer les employés.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loading && <div>Chargement...</div>}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">Gestion des employés</h2>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
            onClick={() => setCsvImportOpen(true)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Importer CSV
          </Button>
          <Button
            className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
            onClick={() => setAddEmployeeOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un employé
          </Button>
        </div>
      </div>

      <EmployeeStats employees={employees} total={total} />

      <EmployeeFilters
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        subsidiaryFilter={subsidiaryFilter}
        setSubsidiaryFilter={setSubsidiaryFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        employees={employees}
        clearFilters={clearFilters}
        hasActiveFilters={roleFilter !== 'all' || subsidiaryFilter !== 'all' || statusFilter !== 'all'}
      />

      <EmployeeTable
        employees={employees}
        total={total}
        skip={skip}
        take={take}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
        onDelete={(employee) => {
          setSelectedEmployee(employee);
          setDeleteDialogOpen(true);
        }}
        onToggleStatus={(employee) => {
          setSelectedEmployee(employee);
          setStatusDialogOpen(true);
        }}
      />

      <AddEmployeeForm
        open={addEmployeeOpen}
        onOpenChange={setAddEmployeeOpen}
        onEmployeeAdded={handleEmployeeAdded}
      />

      <AddEmployeeFromCSV
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
        onEmployeesImported={importEmployees}
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