import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Upload } from 'lucide-react';
import { Employee } from '@/types/demande';
import { AddEmployeeFromCSV } from '@/components/employee/AddEmployeeFromCSV';

interface EmployeeSelectionProps {
  employees: Employee[];
  selectedEmployees: string[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  subsidiaryFilter: string;
  setSubsidiaryFilter: (filter: string) => void;
  subsidiaries: { id: string; name: string }[];
  handleEmployeeSelect: (employeeId: string) => void;
  setCsvImportOpen: (open: boolean) => void;
  csvImportOpen: boolean;
  handleEmployeesImported: (importedEmployees: Employee[]) => void;
  setShowEmployeeList: (show: boolean) => void;
}

export function EmployeeSelection({
  employees,
  selectedEmployees,
  searchTerm,
  setSearchTerm,
  subsidiaryFilter,
  setSubsidiaryFilter,
  subsidiaries,
  handleEmployeeSelect,
  setCsvImportOpen,
  csvImportOpen,
  handleEmployeesImported,
  setShowEmployeeList,
}: EmployeeSelectionProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Sélection des employés</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCsvImportOpen(true)}
            className="text-xs h-7"
          >
            <Upload className="h-3 w-3 mr-1" />
            Importer CSV
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm"
            />
          </div>
          <Select value={subsidiaryFilter} onValueChange={setSubsidiaryFilter}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Filtrer par filiale" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les filiales</SelectItem>
              {subsidiaries.map((subsidiary) => (
                <SelectItem key={subsidiary.id} value={subsidiary.id}>
                  {subsidiary.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className={`p-2 border rounded cursor-pointer text-sm ${
                  selectedEmployees.includes(employee.id)
                    ? 'bg-etaxi-yellow/20 border-etaxi-yellow'
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleEmployeeSelect(employee.id)}
              >
                <div className="font-medium">{employee.fullName}</div>
                <div className="text-xs text-muted-foreground">
                  {employee.subsidiaryName || 'Non spécifié'}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        {selectedEmployees.length > 0 && (
          <div className="text-sm">
            <Badge variant="secondary">{selectedEmployees.length} sélectionné(s)</Badge>
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => setShowEmployeeList(false)}
            >
              Masquer la liste
            </Button>
          </div>
        )}
        <AddEmployeeFromCSV
          open={csvImportOpen}
          onOpenChange={setCsvImportOpen}
          onEmployeesImported={handleEmployeesImported}
        />
      </CardContent>
    </Card>
  );
}