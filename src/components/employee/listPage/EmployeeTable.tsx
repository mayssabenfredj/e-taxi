import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableWithPagination } from '@/components/ui/table-with-pagination';
import { Eye, UserCheck, UserX, Trash } from 'lucide-react';
import { Employee } from '@/types/employee';
import { useNavigate } from 'react-router-dom';

interface EmployeeTableProps {
  employees: Employee[];
  total: number;
  skip: number;
  take: number;
  onPageChange: (newSkip: number, newTake: number) => void;
  onFilterChange: (filters: Record<string, string>) => void;
  onDelete: (employee: Employee) => void;
  onToggleStatus: (employee: Employee) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  total,
  skip,
  take,
  onPageChange,
  onFilterChange,
  onDelete,
  onToggleStatus,
}) => {
  const navigate = useNavigate();

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

  const getRoleText = (roles?: string[]) => {
    if (!roles || roles.length === 0) return 'Aucun rôle';
    return roles.join(', ');
  };

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

  const getRoleColor = (roles?: string[]) => {
    if (!roles || roles.length === 0) return 'bg-gray-100 text-gray-800';
    const primaryRole = roles[0]?.toLowerCase();
    switch (primaryRole) {
      case 'admin_entreprise':
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
        <Badge variant="outline">{employee?.subsidiary?.name || 'Aucune'}</Badge>
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
          onToggleStatus(employee);
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
          onDelete(employee);
        }}
        title="Supprimer"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <TableWithPagination
      data={employees}
      columns={columns}
      searchPlaceholder="Rechercher un employé..."
      take={take}
      filterOptions={filterOptions}
      total={total}
      skip={skip}
      onPageChange={onPageChange}
      onFilterChange={onFilterChange}
      onRowAction={(employee) => navigate(`/employees/${employee.id}`)}
      actions={getActions}
      emptyMessage="Aucun employé trouvé"
    />
  );
};