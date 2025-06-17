import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { TableWithPagination } from '@/components/ui/table-with-pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Eye, Trash, UserCheck, UserX, Upload, Filter, Users, Building2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AddEmployeeForm } from '@/components/employee/AddEmployeeForm';
import { AddEmployeeFromCSV } from '@/components/employee/AddEmployeeFromCSV';
import { toast } from 'sonner';
import EmployeeService from '@/services/employee.service';
import { Employee, GetEmployeesPagination, CreateEmployee } from '@/types/employee';
import { useAuth } from '@/contexts/AuthContext';

export function EmployeesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [subsidiaryFilter, setSubsidiaryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(10);
  const [loading, setLoading] = useState(true);

  // Dialog state management
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const enterpriseId = user?.enterpriseId;

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
          subsidiaryId: subsidiaryFilter !== 'all' ? subsidiaryFilter : undefined,
          roleName: roleFilter !== 'all' ? roleFilter : undefined,
          skip,
          take,
          includeAllData: true,
        };
        const { data, total } = await EmployeeService.getAllEmployees(query);
        setEmployees(data);
        setTotal(total);
        toast.success('Employés chargés avec succès!');
      } catch (error: any) {
        toast.error(`Erreur lors du chargement des employés: ${error.message || 'Une erreur est survenue.'}`);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [enterpriseId, skip, take, roleFilter, subsidiaryFilter, statusFilter]);

  const handleEmployeeAdded = async (employeeData: any) => {
    try {
      const createData: CreateEmployee = {
        email: employeeData.email,
        password: employeeData.password,
        fullName: employeeData.fullName,
        firstName: employeeData.firstName || undefined,
        lastName: employeeData.lastName || undefined,
        phone: employeeData.phone,
        alternativePhone: employeeData.alternativePhone || undefined,
        enterpriseId: enterpriseId,
        subsidiaryId: employeeData.subsidiaryId || undefined,
        managerId: employeeData.managerId || undefined,
        roleIds: employeeData.roleIds || [],
        address: employeeData.address || undefined,
      };

      // Validate required fields
      if (!createData.email || !createData.password || !createData.fullName || !createData.phone || !createData.roleIds.length) {
        throw new Error('Veuillez remplir tous les champs obligatoires (email, mot de passe, nom complet, téléphone, rôles).');
      }

      const newEmployee = await EmployeeService.createEmployee(createData);
      setEmployees((prev) => [newEmployee, ...prev]);
      setTotal((prev) => prev + 1);
      toast.success('Employé ajouté avec succès!');
      setAddEmployeeOpen(false);
    } catch (error: any) {
      toast.error(`Erreur lors de l'ajout de l'employé: ${error.message || 'Une erreur est survenue.'}`);
    }
  };

  const handleDeleteEmployee = async () => {
    if (selectedEmployee) {
      try {
        await EmployeeService.deleteEmployee(selectedEmployee.id);
        setEmployees((prev) => prev.filter((emp) => emp.id !== selectedEmployee.id));
        setTotal((prev) => prev - 1);
        toast.success('Employé supprimé avec succès!');
        setDeleteDialogOpen(false);
        setSelectedEmployee(null);
      } catch (error: any) {
        toast.error(`Erreur lors de la suppression de l'employé: ${error.message || 'Une erreur est survenue.'}`);
      }
    }
  };

  const handleToggleEmployeeStatus = async () => {
    if (selectedEmployee) {
      try {
        const enabled = selectedEmployee.status !== 'ENABLED';
        const updatedEmployee = await EmployeeService.updateEmployeeStatus(selectedEmployee.id, enabled);
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === selectedEmployee.id ? updatedEmployee : emp
          )
        );
        toast.success(`Employé ${enabled ? 'activé' : 'désactivé'} avec succès!`);
        setStatusDialogOpen(false);
        setSelectedEmployee(null);
      } catch (error: any) {
        toast.error(`Erreur lors du changement de statut: ${error.message || 'Une erreur est survenue.'}`);
      }
    }
  };

  const openDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteDialogOpen(true);
  };

  const openStatusDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setStatusDialogOpen(true);
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'ENABLED':
        return 'Actif';
      case 'DISABLED':
        return 'Inactif';
      default:
        return 'Inconnu';
    }
  };

  const getRoleText = (roles?: Employee['roles']) => {
    if (!roles || roles.length === 0) return 'Aucun rôle';
    return roles.map((role) => role.name).join(', ');
  };

  // Get unique values for filters
  const subsidiaries = Array.from(new Set(employees.map((emp) => emp.subsidiaryId).filter(Boolean)));
  const roles = Array.from(
    new Set(employees.flatMap((emp) => emp.roles?.map((role) => role.name) || []).filter(Boolean))
  );
  const statuses = Array.from(new Set(employees.map((emp) => emp.status).filter(Boolean)));

  // Apply client-side filters for status (since API doesn't support status filter directly)
  const filteredEmployees = employees.filter((employee) => {
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    return matchesStatus;
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ENABLED':
        return 'bg-green-100 text-green-800';
      case 'DISABLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getRoleColor = (roles?: Employee['roles']) => {
    if (!roles || roles.length === 0) return 'bg-gray-100 text-gray-800';
    const primaryRole = roles[0]?.name.toLowerCase();
    switch (primaryRole) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      header: 'Employé',
      accessor: 'fullName' as keyof Employee,
      render: (employee: Employee) => (
        <div>
          <div className="font-medium">{employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`}</div>
          <div className="text-sm text-muted-foreground">{employee.email}</div>
        </div>
      ),
    },
    {
      header: 'Téléphone',
      accessor: 'phone' as keyof Employee,
      render: (employee: Employee) => employee.phone || 'N/A',
    },
    {
      header: 'Rôle',
      accessor: 'roles' as keyof Employee,
      render: (employee: Employee) => (
        <div className="space-y-1">
          <Badge className={getRoleColor(employee.roles)}>
            {getRoleText(employee.roles)}
          </Badge>
        </div>
      ),
    },
    {
      header: 'Filiale',
      accessor: 'subsidiaryId' as keyof Employee,
      render: (employee: Employee) => (
        <Badge variant="outline">{employee.subsidiaryId || 'Aucune'}</Badge>
      ),
    },
    {
      header: 'Statut',
      accessor: 'status' as keyof Employee,
      render: (employee: Employee) => (
        <Badge className={getStatusColor(employee.status)}>
          {getStatusText(employee.status)}
        </Badge>
      ),
    },
    {
      header: 'Créé le',
      accessor: 'createdAt' as keyof Employee,
      render: (employee: Employee) => new Date(employee.createdAt).toLocaleDateString('fr-FR'),
    },
  ];

  const filterOptions = [
    { label: 'Tous', value: 'all', field: 'status' as keyof Employee },
    { label: 'Actif', value: 'ENABLED', field: 'status' as keyof Employee },
    { label: 'Inactif', value: 'DISABLED', field: 'status' as keyof Employee },
  ];

  const getActions = (employee: Employee) => (
    <div className="flex items-center space-x-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/employees/${employee.id}`);
        }}
        title="Voir les détails"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          openStatusDialog(employee);
        }}
        title={employee.status === 'ENABLED' ? 'Désactiver' : 'Activer'}
        className={employee.status === 'ENABLED' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
      >
        {employee.status === 'ENABLED' ? (
          <UserX className="h-4 w-4" />
        ) : (
          <UserCheck className="h-4 w-4" />
        )}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="text-red-600 hover:text-red-700"
        onClick={(e) => {
          e.stopPropagation();
          openDeleteDialog(employee);
        }}
        title="Supprimer"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );

  const clearFilters = () => {
    setRoleFilter('all');
    setSubsidiaryFilter('all');
    setStatusFilter('all');
    setSkip(0);
  };

  const hasActiveFilters = roleFilter !== 'all' || subsidiaryFilter !== 'all' || statusFilter !== 'all';

  const handlePageChange = (newSkip: number, newTake: number) => {
    setSkip(newSkip);
    setTake(newTake);
  };

  const handleFilterChange = (filters: Record<string, string>) => {
    if (filters.status) {
      setStatusFilter(filters.status);
    } else {
      setStatusFilter('all');
    }
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total employés</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">Actifs</p>
                <p className="text-2xl font-bold text-green-600">
                  {employees.filter((emp) => emp.status === 'ENABLED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Managers</p>
                <p className="text-2xl font-bold text-purple-600">
                  {employees.filter((emp) => emp.roles?.some((role) => role.name.toLowerCase() === 'manager')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Filiales</p>
                <p className="text-2xl font-bold text-orange-600">{subsidiaries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtres</span>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Effacer les filtres
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rôle</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les rôles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Filiale</label>
              <Select value={subsidiaryFilter} onValueChange={setSubsidiaryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les filiales" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les filiales</SelectItem>
                  {subsidiaries.map((subsidiary) => (
                    <SelectItem key={subsidiary} value={subsidiary}>
                      {subsidiary}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getStatusText(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <TableWithPagination
        data={filteredEmployees}
        columns={columns}
        searchPlaceholder="Rechercher un employé..."
        itemsPerPage={take}
        filterOptions={filterOptions}
        total={total}
        skip={skip}
        take={take}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
        onRowClick={(employee) => navigate(`/employees/${employee.id}`)}
        actions={getActions}
        emptyMessage="Aucun employé trouvé"
      />

      <AddEmployeeForm
        open={addEmployeeOpen}
        onOpenChange={setAddEmployeeOpen}
        onEmployeeAdded={handleEmployeeAdded}
      />

      <AddEmployeeFromCSV
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
        onEmployeesImported={(importedEmployees) => {
          setEmployees((prev) => [...importedEmployees, ...prev]);
          setTotal((prev) => prev + importedEmployees.length);
          toast.success(`${importedEmployees.length} employé(s) importé(s) avec succès`);
        }}
      />

      {/* Status Toggle Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedEmployee?.status === 'ENABLED' ? 'Désactiver' : 'Activer'} l'employé
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir {selectedEmployee?.status === 'ENABLED' ? 'désactiver' : 'activer'} l'employé{' '}
              <strong>{selectedEmployee?.fullName || `${selectedEmployee?.firstName || ''} ${selectedEmployee?.lastName || ''}`}</strong> ?{' '}
              {selectedEmployee?.status === 'ENABLED' && ' Cet employé ne pourra plus accéder au système.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleEmployeeStatus}
              className={selectedEmployee?.status === 'ENABLED' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {selectedEmployee?.status === 'ENABLED' ? 'Désactiver' : 'Activer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'employé</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'employé{' '}
              <strong>{selectedEmployee?.fullName || `${selectedEmployee?.firstName || ''} ${selectedEmployee?.lastName || ''}`}</strong> ? Cette action est irréversible et supprimera toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEmployee}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}