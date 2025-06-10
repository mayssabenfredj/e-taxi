import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { TableWithPagination } from '@/components/ui/table-with-pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Eye, Edit, Trash, UserCheck, UserX, Upload, Filter, Users, Building2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AddEmployeeForm } from '@/components/dashboard/AddEmployeeForm';
import { AddEmployeeFromCSV } from '@/components/dashboard/AddEmployeeFromCSV';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  subsidiary: string;
  role: 'employee' | 'manager' | 'admin';
  status: 'active' | 'inactive' | 'pending';
  isManager: boolean;
  createdAt: string;
  lastActive: string;
}

export function EmployeesPage() {
  const navigate = useNavigate();
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [subsidiaryFilter, setSubsidiaryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleEmployeeAdded = (employeeData: any) => {
    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: employeeData.fullName,
      email: employeeData.email,
      phone: employeeData.phone,
      position: 'Nouveau poste',
      department: 'À définir',
      subsidiary: 'TechCorp Paris',
      role: employeeData.role || 'employee',
      status: 'pending',
      isManager: employeeData.isManager || false,
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString()
    };
    setEmployees(prev => [...prev, newEmployee]);
  };

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'Jean Dupont',
      email: 'jean.dupont@techcorp.fr',
      phone: '+33 6 12 34 56 78',
      position: 'Développeur Senior',
      department: 'Informatique',
      subsidiary: 'TechCorp Paris',
      role: 'employee',
      status: 'active',
      isManager: false,
      createdAt: '2024-01-15',
      lastActive: '2024-01-18 10:30'
    },
    {
      id: '2',
      name: 'Marie Martin',
      email: 'marie.martin@techcorp.fr',
      phone: '+33 6 98 76 54 32',
      position: 'Chef de projet',
      department: 'Marketing',
      subsidiary: 'TechCorp Lyon',
      role: 'manager',
      status: 'active',
      isManager: true,
      createdAt: '2024-01-10',
      lastActive: '2024-01-18 09:15'
    },
    {
      id: '3',
      name: 'Pierre Durand',
      email: 'pierre.durand@techcorp.fr',
      phone: '+33 7 11 22 33 44',
      position: 'Analyste',
      department: 'Finance',
      subsidiary: 'TechCorp Paris',
      role: 'employee',
      status: 'inactive',
      isManager: false,
      createdAt: '2024-01-17',
      lastActive: '2024-01-17 16:45'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'employee':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    toast.success('Employé supprimé avec succès');
  };

  const handleToggleEmployeeStatus = (employeeId: string) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === employeeId 
          ? { 
              ...emp, 
              status: emp.status === 'active' ? 'inactive' : 'active' 
            }
          : emp
      )
    );
    
    const employee = employees.find(emp => emp.id === employeeId);
    const newStatus = employee?.status === 'active' ? 'désactivé' : 'activé';
    toast.success(`Employé ${newStatus} avec succès`);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'inactive':
        return 'Inactif';
      case 'pending':
        return 'En attente';
      default:
        return status;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'manager':
        return 'Manager';
      case 'employee':
        return 'Employé';
      default:
        return role;
    }
  };

  // Get unique values for filters
  const subsidiaries = Array.from(new Set(employees.map(emp => emp.subsidiary)));
  const roles = Array.from(new Set(employees.map(emp => emp.role)));
  const statuses = Array.from(new Set(employees.map(emp => emp.status)));

  // Apply filters
  const filteredEmployees = employees.filter(employee => {
    const matchesRole = roleFilter === 'all' || employee.role === roleFilter;
    const matchesSubsidiary = subsidiaryFilter === 'all' || employee.subsidiary === subsidiaryFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    
    return matchesRole && matchesSubsidiary && matchesStatus;
  });

  const columns = [
    {
      header: 'Employé',
      accessor: 'name' as keyof Employee,
      render: (employee: Employee) => (
        <div>
          <div className="font-medium">{employee.name}</div>
          <div className="text-sm text-muted-foreground">{employee.email}</div>
        </div>
      ),
    },
    {
      header: 'Poste',
      accessor: 'position' as keyof Employee,
    },
    {
      header: 'Département',
      accessor: 'department' as keyof Employee,
    },
    {
      header: 'Rôle',
      accessor: 'role' as keyof Employee,
      render: (employee: Employee) => (
        <div className="space-y-1">
          <Badge className={getRoleColor(employee.role)}>
            {getRoleText(employee.role)}
          </Badge>
          {employee.isManager && (
            <Badge variant="outline" className="text-xs">
              Manager
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Filiale',
      accessor: 'subsidiary' as keyof Employee,
      render: (employee: Employee) => (
        <Badge variant="outline">{employee.subsidiary}</Badge>
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
    }
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
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => e.stopPropagation()}
            title={employee.status === 'active' ? 'Désactiver' : 'Activer'}
            className={employee.status === 'active' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
          >
            {employee.status === 'active' ? (
              <UserX className="h-4 w-4" />
            ) : (
              <UserCheck className="h-4 w-4" />
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {employee.status === 'active' ? 'Désactiver' : 'Activer'} l'employé
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir {employee.status === 'active' ? 'désactiver' : 'activer'} l'employé <strong>{employee.name}</strong> ?
              {employee.status === 'active' && ' Cet employé ne pourra plus accéder au système.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleToggleEmployeeStatus(employee.id)}
              className={employee.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {employee.status === 'active' ? 'Désactiver' : 'Activer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700"
            onClick={(e) => e.stopPropagation()}
            title="Supprimer"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'employé</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'employé <strong>{employee.name}</strong> ? 
              Cette action est irréversible et supprimera toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteEmployee(employee.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  const clearFilters = () => {
    setRoleFilter('all');
    setSubsidiaryFilter('all');
    setStatusFilter('all');
  };

  const hasActiveFilters = roleFilter !== 'all' || subsidiaryFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="space-y-6">
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
                <p className="text-2xl font-bold">{employees.length}</p>
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
                  {employees.filter(emp => emp.status === 'active').length}
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
                  {employees.filter(emp => emp.isManager).length}
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
                <p className="text-2xl font-bold text-orange-600">
                  {subsidiaries.length}
                </p>
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
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>
                      {getRoleText(role)}
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
                  {subsidiaries.map(subsidiary => (
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
                  {statuses.map(status => (
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
        itemsPerPage={10}
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
        onEmployeesImported={(employees) => {
          setEmployees(prev => [...prev, ...employees]);
          toast.success(`${employees.length} employé(s) importé(s) avec succès`);
        }}
      />
    </div>
  );
}