import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';
import { Employee } from '@/types/employee';

interface EmployeeFiltersProps {
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  subsidiaryFilter: string;
  setSubsidiaryFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  employees: Employee[];
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

export const EmployeeFilters: React.FC<EmployeeFiltersProps> = ({
  roleFilter,
  setRoleFilter,
  subsidiaryFilter,
  setSubsidiaryFilter,
  statusFilter,
  setStatusFilter,
  employees,
  clearFilters,
  hasActiveFilters,
}) => {
  const subsidiaries = Array.from(new Set(employees.map((emp) => emp.subsidiaryId).filter(Boolean)));
  const roles = Array.from(new Set(employees.flatMap((emp) => emp.roles || []).filter(Boolean)));
  const statuses = Array.from(new Set(employees.map((emp) => emp.status).filter(Boolean)));

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

  return (
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
  );
};