import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableWithPagination } from '@/components/ui/table-with-pagination';
import { Subsidiary, EntityStatus } from '@/types/subsidiary';
import { User, MapPin, Phone, Mail, Globe, Users, Edit, Settings2 } from 'lucide-react';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SubsidiaryTableProps {
  subsidiaries: Subsidiary[];
  total: number;
  skip: number;
  take: number;
  onPageChange: (newSkip: number, newTake: number) => void;
  onFilterChange: (filters: { [key: string]: string }) => void;
  onEdit: (subsidiary: Subsidiary) => void;
  onUpdateStatus: (subsidiary: Subsidiary, newStatus: EntityStatus) => Promise<void>;
}

const SubsidiaryTable: React.FC<SubsidiaryTableProps> = ({
  subsidiaries,
  total,
  skip,
  take,
  onPageChange,
  onFilterChange,
  onEdit,
  onUpdateStatus,
}) => {
  const columns = [
    {
      header: 'Nom',
      accessor: 'name',
      sortable: true,
      render: (item: Subsidiary) => (
        <div className="text-left">
          <div className="font-medium text-sm">{item.name}</div>
          {item.description && (
            <div className="text-xs text-muted-foreground">{item.description}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Managers',
      accessor: 'managerNames',
      sortable: true,
      render: (item: Subsidiary) => (
        <div className="text-left">
          {item.managerNames && item.managerNames.length > 0 ? (
            <div className="space-y-1">
              {item.managerNames.map((name, index) => (
                <div key={index} className="flex items-center text-sm">
                  <User className="mr-1 h-3 w-3 text-muted-foreground" />
                  <span>{name}</span>
                </div>
              ))}
              <Badge variant="outline" className="text-xs">
                {item.managerNames.length} manager{item.managerNames.length > 1 ? 's' : ''}
              </Badge>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Non assigné</span>
          )}
        </div>
      ),
    },
    {
      header: 'Adresse',
      accessor: 'address',
      sortable: false,
      render: (item: Subsidiary) => (
        <div className="flex items-center text-left">
          <MapPin className="mr-1 h-4 w-4" />
          <div>
            <div className="text-sm">{item.address?.street || 'N/A'}</div>
            <div className="text-xs text-muted-foreground">
              {item.address?.postalCode} {typeof item.address?.city === 'object' ? item.address?.city?.name : item.address?.city || 'N/A'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: 'contact',
      sortable: false,
      render: (item: Subsidiary) => (
        <div className="space-y-1 text-left">
          {item.phone && (
            <div className="flex items-center text-sm">
              <Phone className="mr-1 h-3 w-3" />
              {item.phone}
            </div>
          )}
          {item.email && (
            <div className="flex items-center text-sm">
              <Mail className="mr-1 h-3 w-3" />
              {item.email}
            </div>
          )}
          {item.website && (
            <div className="flex items-center text-sm">
              <Globe className="mr-1 h-3 w-3" />
              {item.website}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Employés',
      accessor: 'employeesCount',
      sortable: true,
      render: (item: Subsidiary) => (
        <div className="flex items-center text-left">
          <Users className="mr-1 h-4 w-4" />
          {item.employeesCount || item.employeeCount || 0}
        </div>
      ),
    },
    {
      header: 'Statut',
      accessor: 'status',
      sortable: true,
      filterable: true,
      render: (item: Subsidiary) => (
        <Badge
          className={
            item.status === EntityStatus.ACTIVE
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
          }
        >
          {item.status === EntityStatus.ACTIVE ? 'Actif' : item.status === EntityStatus.INACTIVE ? 'Inactif' : item.status}
        </Badge>
      ),
    },
  ];

  const filterOptions = [
    { label: 'Tous', value: 'all', field: 'status' },
    { label: 'Actif', value: EntityStatus.ACTIVE, field: 'status' },
    { label: 'Inactif', value: EntityStatus.INACTIVE, field: 'status' },
    { label: 'En attente', value: EntityStatus.PENDING, field: 'status' },
    { label: 'Archivé', value: EntityStatus.ARCHIVED, field: 'status' },
  ];

  const actions = (item: Subsidiary) => (
    <div className="flex space-x-1">
      <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
        <Edit className="h-4 w-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-blue-600">
            <Settings2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modifier le statut de la filiale</AlertDialogTitle>
            <AlertDialogDescription>
              Sélectionnez le nouveau statut pour la filiale "{item.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Select
            onValueChange={(value: EntityStatus) => onUpdateStatus(item, value)}
            defaultValue={item.status}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EntityStatus.ACTIVE}>Actif</SelectItem>
              <SelectItem value={EntityStatus.INACTIVE}>Inactif</SelectItem>
              <SelectItem value={EntityStatus.PENDING}>En attente</SelectItem>
              <SelectItem value={EntityStatus.ARCHIVED}>Archivé</SelectItem>
            </SelectContent>
          </Select>
          <AlertDialogFooter>
            <AlertDialogCancel>Fermer</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  return (
    <div className="bg-card border-border rounded-lg">
      <TableWithPagination
        data={subsidiaries}
        columns={columns}
        searchPlaceholder="Rechercher une filiale..."
        actions={actions}
        filterOptions={filterOptions as { label: string; value: string; field: keyof Subsidiary }[]}
        total={total}
        skip={skip}
        take={take}
        onPageChange={onPageChange}
        onFilterChange={onFilterChange}
      />
    </div>
  );
};

export default SubsidiaryTable;