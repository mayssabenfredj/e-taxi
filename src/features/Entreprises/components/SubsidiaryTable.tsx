import React from 'react';
import { Button } from '@/shareds/components/ui/button';
import { Badge } from '@/shareds/components/ui/badge';
import { TableWithPagination } from '@/shareds/components/ui/table-with-pagination';
import { Edit, Trash } from 'lucide-react';
import { Subsidiary, EntityStatus } from '@/types/subsidiary';
import { useNavigate } from 'react-router-dom';

interface SubsidiaryTableProps {
  subsidiaries: Subsidiary[];
  total: number;
  skip: number;
  take: number;
  onPageChange: (newSkip: number, newTake: number) => void;
  onFilterChange: (filters: Record<string, string>) => void;
  onEdit?: (subsidiary: Subsidiary) => void;
  onUpdateStatus?: (subsidiary: Subsidiary, newStatus: EntityStatus) => void;
  canUpdate?: boolean;
}

export const SubsidiaryTable: React.FC<SubsidiaryTableProps> = ({
  subsidiaries,
  total,
  skip,
  take,
  onPageChange,
  onFilterChange,
  onEdit,
  onUpdateStatus,
  canUpdate = false,
}) => {
  const navigate = useNavigate();

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Actif';
      case 'INACTIVE':
        return 'Inactif';
      default:
        return 'Inconnu';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const columns = [
    {
      header: 'Nom',
      accessor: 'name' as keyof Subsidiary,
      render: (subsidiary: Subsidiary) => (
        <div className="font-medium">{subsidiary.name}</div>
      ),
    },
    {
      header: 'Adresse',
      accessor: 'address' as keyof Subsidiary,
      render: (subsidiary: Subsidiary) => (
        <div>{subsidiary.address?.formattedAddress || 'N/A'}</div>
      ),
    },
    {
      header: 'Téléphone',
      accessor: 'phone' as keyof Subsidiary,
      render: (subsidiary: Subsidiary) => subsidiary.phone || 'N/A',
    },
    {
      header: 'Email',
      accessor: 'email' as keyof Subsidiary,
      render: (subsidiary: Subsidiary) => subsidiary.email || 'N/A',
    },
    {
      header: 'Admins',
      accessor: 'managerNames' as keyof Subsidiary,
      render: (subsidiary: Subsidiary) => (
        <div>
          {subsidiary.managerNames?.length > 0
            ? subsidiary.managerNames.join(', ')
            : 'Non assigné'}
        </div>
      ),
    },
    {
      header: 'Statut',
      accessor: 'status' as keyof Subsidiary,
      render: (subsidiary: Subsidiary) => (
        <Badge className={getStatusColor(subsidiary.status)}>
          {getStatusText(subsidiary.status)}
        </Badge>
      ),
    },
    {
      header: 'Créé le',
      accessor: 'createdAt' as keyof Subsidiary,
      render: (subsidiary: Subsidiary) => new Date(subsidiary.createdAt).toLocaleDateString('fr-FR'),
    },
  ];

  const filterOptions = [
    { label: 'Tous', value: 'all', field: 'status' as keyof Subsidiary },
    { label: 'Actif', value: 'ACTIVE', field: 'status' as keyof Subsidiary },
    { label: 'Inactif', value: 'INACTIVE', field: 'status' as keyof Subsidiary },
  ];

  const getActions = (subsidiary: Subsidiary) => (
    <div className="flex items-center space-x-2">
      {canUpdate && onEdit && (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(subsidiary);
          }}
          title="Modifier"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {canUpdate && onUpdateStatus && (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            const newStatus = subsidiary.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            onUpdateStatus(subsidiary, newStatus as EntityStatus);
          }}
          title={subsidiary.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}
          className={subsidiary.status === 'ACTIVE' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
        >
          {subsidiary.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}
        </Button>
      )}
    </div>
  );

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[700px] md:min-w-0">
        <TableWithPagination
          data={subsidiaries}
          columns={columns}
          searchPlaceholder="Rechercher une filiale..."
          take={take}
          filterOptions={filterOptions}
          total={total}
          skip={skip}
          onPageChange={onPageChange}
          onFilterChange={onFilterChange}
          actions={getActions}
        />
      </div>
    </div>
  );
};