import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Building2, Shield } from 'lucide-react';
import { Employee } from '@/types/employee';

interface EmployeeStatsProps {
  employees: Employee[];
  total: number;
}

export const EmployeeStats: React.FC<EmployeeStatsProps> = ({ employees, total }) => {
  const subsidiaries = Array.from(new Set(employees.map((emp) => emp.subsidiaryId).filter(Boolean)));
  const activeEmployees = employees.filter((emp) => emp.status === 'ENABLED').length;
  const managers = employees.filter((emp) => emp.roles?.some((role) => role.toLowerCase() === 'manager')).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total employés</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 bg-green-500 rounded-full" />
            <div>
              <p className="text-sm text-muted-foreground">Actifs</p>
              <p className="text-2xl font-bold text-green-600">{activeEmployees}</p>
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
              <p className="text-2xl font-bold text-purple-600">{managers}</p>
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
              <p className="text-2xl font-bold text-orange-600">{subsidiaries.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};