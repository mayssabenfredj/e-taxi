import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';
import { useRolesAndSubsidiaries } from '@/hooks/useRolesAndSubsidiaries';
import { useAuth } from '@/contexts/AuthContext';
import { UserStatus } from '@/types/employee';

interface EmployeeFiltersProps {
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  subsidiaryFilter: string;
  setSubsidiaryFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  roles: { id: string; name: string }[];
  subsidiaries: { id: string; name: string }[];
  loading: boolean;
}

export const EmployeeFilters: React.FC<EmployeeFiltersProps> = ({
  roleFilter,
  setRoleFilter,
  subsidiaryFilter,
  setSubsidiaryFilter,
  statusFilter,
  setStatusFilter,
  clearFilters,
  hasActiveFilters,
  roles,
  subsidiaries,
  loading,
}) => {
  const { user } = useAuth();
  const statuses = Object.values(UserStatus); // Get all enum values: ['ENABLED', 'DISABLED']

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          
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
            <Select value={roleFilter} onValueChange={setRoleFilter} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les rôles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Filiale</label>
            <Select value={subsidiaryFilter} onValueChange={setSubsidiaryFilter} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les Sous Organisation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les Sous Organisation</SelectItem>
                {subsidiaries.map((subsidiary) => (
                  <SelectItem key={subsidiary.id} value={subsidiary.id}>
                    {subsidiary.name}
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
                    {status}
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