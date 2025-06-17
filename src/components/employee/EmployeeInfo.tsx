import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, Building2 } from 'lucide-react';
import { Employee } from '@/types/employee';
import { Subsidiary } from '@/types/subsidiary';

interface EmployeeInfoProps {
  employee: Employee;
  editedEmployee: Employee;
  setEditedEmployee: React.Dispatch<React.SetStateAction<Employee>>;
  isEditing: boolean;
  subsidiaries: Subsidiary[];
}

export function EmployeeInfo({
  employee,
  editedEmployee,
  setEditedEmployee,
  isEditing,
  subsidiaries,
}: EmployeeInfoProps) {
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom complet</Label>
              <Input
                value={isEditing ? editedEmployee.name : employee.name}
                onChange={(e) =>
                  setEditedEmployee({ ...editedEmployee, name: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  value={isEditing ? editedEmployee.email : employee.email}
                  onChange={(e) =>
                    setEditedEmployee({ ...editedEmployee, email: e.target.value })
                  }
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  value={isEditing ? editedEmployee.phone : employee.phone}
                  onChange={(e) =>
                    setEditedEmployee({ ...editedEmployee, phone: e.target.value })
                  }
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rôle</Label>
              {isEditing ? (
                <Select
                  value={editedEmployee.role}
                  onValueChange={(value: 'employee' | 'manager' | 'admin') =>
                    setEditedEmployee({ ...editedEmployee, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employé</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 border rounded">
                  <Badge className="bg-blue-100 text-blue-800">
                    {getRoleText(employee.role)}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Manager</Label>
                <div className="text-sm text-muted-foreground">
                  Cet employé a-t-il des responsabilités managériales ?
                </div>
              </div>
              <Switch
                checked={editedEmployee.isManager}
                onCheckedChange={(checked) =>
                  setEditedEmployee({ ...editedEmployee, isManager: checked })
                }
              />
            </div>
          )}

          {!isEditing && employee.isManager && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <Badge className="bg-blue-100 text-blue-800">
                Responsabilités managériales
              </Badge>
            </div>
          )}

          <div className="space-y-2">
            <Label>Filiale</Label>
            {isEditing ? (
              <Select
                value={editedEmployee.subsidiary}
                onValueChange={(value) =>
                  setEditedEmployee({ ...editedEmployee, subsidiary: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subsidiaries.map((subsidiary) => (
                    <SelectItem key={subsidiary.id} value={subsidiary.name}>
                      {subsidiary.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center space-x-2 p-2 border rounded">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{employee.subsidiary}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Adresses par défaut</CardTitle>
        </CardHeader>
        <CardContent>
          {employee.addresses.length > 0 ? (
            <div className="space-y-3">
              {employee.addresses.slice(0, 2).map((address) => (
                <div key={address.address.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="inline-block px-2 py-0.5 bg-etaxi-yellow/20 text-xs rounded">
                          {address.label}
                        </span>
                        {employee.defaultAddressId === address.address.id && (
                          <Badge className="bg-etaxi-yellow text-black text-xs">
                            Par défaut
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium">{address.address.street}</p>
                      <p className="text-sm text-muted-foreground">
                        {address.address.postalCode} {address.address.city},{' '}
                        {address.address.country}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Aucune adresse par défaut définie</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}