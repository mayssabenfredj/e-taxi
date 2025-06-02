import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { TableWithPagination } from '@/components/ui/table-with-pagination';
import { Plus, Eye, Edit, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AddEmployeeForm } from '@/components/dashboard/AddEmployeeForm';
import { toast } from 'sonner';


interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  subsidiary: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastActive: string;
}

export function EmployeesPage() {
  const navigate = useNavigate();
    const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);

   const handleEmployeeAdded = (employeeData: any) => {
    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: employeeData.fullName,
      email: employeeData.email,
      phone: employeeData.phone,
      position: 'Nouveau poste',
      department: 'À définir',
      subsidiary: 'TechCorp Paris',
      status: 'pending',
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
      status: 'active',
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
      status: 'active',
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
      status: 'pending',
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
  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    toast.success('Employé supprimé avec succès');
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

  // Define filter options for subsidiary, status, and date
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
    // Note: Date filtering is more complex, so we'll handle it differently or skip for now
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
    },
    {
      header: 'Actions',
      accessor: 'actions' as keyof Employee,
      render: (employee: Employee) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/employees/${employee.id}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700"
                onClick={(e) => e.stopPropagation()}
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
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button className="bg-etaxi-yellow hover:bg-yellow-500 text-black">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter From CSV
        </Button>
        <Button className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
                  onClick={() => setAddEmployeeOpen(true)}
>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un employé
        </Button>
      </div>

     
          <TableWithPagination
            data={employees}
            columns={columns}
            searchPlaceholder="Rechercher un employé..."
            filterOptions={filterOptions}
            itemsPerPage={10}
            onRowClick={(employee) => navigate(`/employees/${employee.id}`)}
            emptyMessage="Aucun employé trouvé"
      />
      
       <AddEmployeeForm
        open={addEmployeeOpen}
        onOpenChange={setAddEmployeeOpen}
        onEmployeeAdded={handleEmployeeAdded}
      />
       
    </div>
  );
}