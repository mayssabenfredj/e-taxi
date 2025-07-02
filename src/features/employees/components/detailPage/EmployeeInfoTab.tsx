import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shareds/components/ui/card';
import { Input } from '@/shareds/components/ui/input';
import { Label } from '@/shareds/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shareds/components/ui/select';
import { Switch } from '@/shareds/components/ui/switch';
import { Mail, Phone, Building2 } from 'lucide-react';
import { Employee } from '@/features/employees/types/employee';
import { useRolesAndSubsidiaries } from '@/shareds/hooks/useRolesAndSubsidiaries';
import { useAuth } from '@/shareds/contexts/AuthContext';

interface EmployeeInfoTabProps {
  employee: Employee;
  editedEmployee: Partial<Employee>;
  setEditedEmployee: React.Dispatch<React.SetStateAction<Partial<Employee>>>;
  isEditing: boolean;
}

const EmployeeInfoTab: React.FC<EmployeeInfoTabProps> = ({
  employee,
  editedEmployee,
  setEditedEmployee,
  isEditing,
}) => {
  const { user } = useAuth();
  const { roles, subsidiaries, loading } = useRolesAndSubsidiaries(user?.enterpriseId);
  const isManager = employee.roles?.includes('ADMIN_FILIAL');

  // Set roleIds when entering edit mode
  useEffect(() => {
    if (isEditing && !editedEmployee.roleIds?.length && employee.roles?.length) {
      const roleId = roles.find((role) => role.name === employee.roles?.[0])?.id;
      if (roleId) {
        setEditedEmployee((prev) => ({ ...prev, roleIds: [roleId] }));
      }
    }
  }, [isEditing, employee.roles, roles, editedEmployee.roleIds, setEditedEmployee]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations personnelles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Prénom</Label>
            <Input
              value={isEditing ? editedEmployee.firstName || '' : employee.firstName || ''}
              onChange={(e) => setEditedEmployee((prev) => ({ ...prev, firstName: e.target.value }))}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label>Nom</Label>
            <Input
              value={isEditing ? editedEmployee.lastName || '' : employee.lastName || ''}
              onChange={(e) => setEditedEmployee((prev) => ({ ...prev, lastName: e.target.value }))}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input value={employee.email} disabled className="pl-10" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Téléphone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                value={isEditing ? editedEmployee.phone || '' : employee.phone || ''}
                onChange={(e) => setEditedEmployee((prev) => ({ ...prev, phone: e.target.value }))}
                disabled={!isEditing}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rôles</Label>
            {isEditing ? (
              <Select
                value={editedEmployee.roleIds?.[0] || ''}
                onValueChange={(value) => setEditedEmployee((prev) => ({ ...prev, roleIds: [value] }))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-2 border rounded">
                {employee.roles?.map((role) => (
                  <span
                    key={role}
                    className="inline-block px-2 py-0.5 mr-1 bg-blue-100 text-blue-800 text-xs rounded"
                  >
                    {role}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Filiale</Label>
            {isEditing ? (
              <Select
                value={editedEmployee.subsidiaryId || ''}
                onValueChange={(value) => setEditedEmployee((prev) => ({ ...prev, subsidiaryId: value }))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une filiale" />
                </SelectTrigger>
                <SelectContent>
                  {subsidiaries.map((subsidiary) => (
                    <SelectItem key={subsidiary.id} value={subsidiary.id}>
                      {subsidiary.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center space-x-2 p-2 border rounded">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{employee.subsidiary?.name || 'Non défini'}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Manager</Label>
            <div className="text-sm text-muted-foreground">
              Ce collaborateur a-t-il des responsabilités managériales ?
            </div>
          </div>
          <Switch checked={isManager} disabled />
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeInfoTab;