import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { TableWithPagination } from '@/components/ui/table-with-pagination';
import { Plus, Eye, Edit, Trash, UserCheck, UserX, Upload } from 'lucide-react';
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

  const subsidiaries = Array.from(new Set(employees.map(emp => emp.subsidiary)));
  const filterOptions = [
    ...subsidiaries.map(subsidiary => ({
      label: subsidiary,
      value: subsidiary,
      field: 'subsidiary' as keyof Employee,
    })),
    { label: 'Actif', value: 'active', field: 'status' as keyof Employee },
    { label: 'Inactif', value: 'inactive', field: 'status' as keyof Employee },
    { label: 'En attente', value: 'pending', field: 'status' as keyof Employee },
    { label: 'Manager', value: 'manager', field: 'role' as keyof Employee },
    { label: 'Employé', value: 'employee', field: 'role' as keyof Employee },
    { label: 'Administrateur', value: 'admin', field: 'role' as keyof Employee },
  ];

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
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteEmployee(employee.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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

      <TableWithPagination
        data={employees}
        columns={columns}
        searchPlaceholder="Rechercher un employé..."
        filterOptions={filterOptions}
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