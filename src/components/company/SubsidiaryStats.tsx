import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Users, User, MapPin } from 'lucide-react';
import { Subsidiary } from '@/types/subsidiary';

interface SubsidiaryStatsProps {
  total: number;
  subsidiaries: Subsidiary[];
}

const SubsidiaryStats: React.FC<SubsidiaryStatsProps> = ({ total, subsidiaries }) => (
  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
    <Card className="w-full sm:w-48 bg-card border-border">
      <CardContent className="p-3 flex items-center space-x-2">
        <Building2 className="h-4 w-4 text-etaxi-yellow" />
        <div className="text-left">
          <p className="text-xs text-muted-foreground">Sous Organisation</p>
          <p className="text-lg font-bold">{total}</p>
        </div>
      </CardContent>
    </Card>
    <Card className="w-full sm:w-48 bg-card border-border">
      <CardContent className="p-3 flex items-center space-x-2">
        <Users className="h-4 w-4 text-blue-500" />
        <div className="text-left">
          <p className="text-xs text-muted-foreground">Collaborateurs</p>
          <p className="text-lg font-bold">
            {subsidiaries.reduce((sum, s) => sum + (s.employeesCount || s.employeeCount || 0), 0)}
          </p>
        </div>
      </CardContent>
    </Card>
    <Card className="w-full sm:w-48 bg-card border-border">
      <CardContent className="p-3 flex items-center space-x-2">
        <User className="h-4 w-4 text-purple-500" />
        <div className="text-left">
          <p className="text-xs text-muted-foreground">Managers</p>
          <p className="text-lg font-bold">
            {subsidiaries.reduce((sum, s) => sum + (s.managerIds?.length || s.adminIds?.length || 0), 0)}
          </p>
        </div>
      </CardContent>
    </Card>
    <Card className="w-full sm:w-48 bg-card border-border">
      <CardContent className="p-3 flex items-center space-x-2">
        <MapPin className="h-4 w-4 text-purple-500" />
        <div className="text-left">
          <p className="text-xs text-muted-foreground">Villes</p>
          <p className="text-lg font-bold">
            {new Set(subsidiaries.map((s) => s.address?.city?.name || s.address?.city || 'N/A')).size}
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default SubsidiaryStats;