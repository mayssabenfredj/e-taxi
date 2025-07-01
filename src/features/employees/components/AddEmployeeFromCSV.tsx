import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shareds/components/ui/card';
import { Button } from '@/shareds/components/ui/button';
import { Input } from '@/shareds/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shareds/components/ui/dialog';
import { Badge } from '@/shareds/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shareds/components/ui/table';
import { Upload, FileText, CheckCircle, AlertCircle, Download, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shareds/lib/utils';
import { useAuth } from '@/shareds/contexts/AuthContext';
import { useRolesAndSubsidiaries } from '@/shareds/hooks/useRolesAndSubsidiaries';
import { CreateEmployee, UserAddressDto } from '@/features/employees/types/employee';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { AddressType } from '@/shareds/types/addresse';

interface ExcelEmployee {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  subsidiary: string;
  homeAddress: string;
  workAddress: string;
  isValid: boolean;
  errors: string[];
}

interface AddEmployeeFromCSVProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeesImported: (employees: CreateEmployee[]) => void;
  canCreate?: boolean;
}

export function AddEmployeeFromCSV({ open, onOpenChange, onEmployeesImported, canCreate = true }: AddEmployeeFromCSVProps) {
  const { user } = useAuth();
  const { roles, subsidiaries, loading } = useRolesAndSubsidiaries(user?.enterpriseId);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [parsedEmployees, setParsedEmployees] = useState<ExcelEmployee[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const downloadTemplate = () => {
    const exampleRole = roles.find((role) => role.name === 'EMPLOYEE_ENTREPRISE')?.name || 'EMPLOYEE_ENTREPRISE';
    const exampleAdminRole = roles.find((role) => role.name === 'ADMIN_FILIAL')?.name || 'ADMIN_FILIAL';
    const exampleSubsidiary = subsidiaries[0]?.name || 'TechCorp Paris';
    const data = [
      {
        firstName: 'iheb',
        lastName: 'bf',
        email: 'iheb.bf@example.tn',
        phone: '+216123451254',
        role: exampleRole,
        subsidiary: exampleSubsidiary,
        homeAddress: '123 Rue Exemple, 75001 Paris',
        workAddress: '456 Boulevard Travail, 75002 Paris'
      },
       {
        firstName: 'habib',
        lastName: 'bf',
        email: 'habib@example.tn',
        phone: '+216123456789',
        role: exampleRole,
        subsidiary: exampleSubsidiary,
        homeAddress: '123 Rue Paris,  Tuis',
        workAddress: 'Avenue habib bourguiba,  Tunis'
      },
     
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Collaborateurs');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'template_employes.xlsx');
    
    toast.success('Modèle Excel téléchargé');
  };

  const validateEmployee = (employee: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!employee.firstName?.toString().trim()) errors.push('Prénom manquant');
    if (!employee.lastName?.toString().trim()) errors.push('Nom manquant');
    if (!employee.email?.toString().trim()) errors.push('Email manquant');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email.toString())) errors.push('Email invalide');
    if (!employee.phone?.toString().trim()) errors.push('Téléphone manquant');

    const role = roles.find((r) => r.name === employee.role?.toString());
    if (!role) errors.push('Rôle inexistant');
    
    const subsidiary = subsidiaries.find((s) => s.name === employee.subsidiary?.toString());
    if (!subsidiary) errors.push('Filiale inexistante');

    if (!employee.homeAddress?.toString().trim()) errors.push('Adresse domicile manquante');
    if (!employee.workAddress?.toString().trim()) errors.push('Adresse travail manquante');

    return { isValid: errors.length === 0, errors };
  };

  const parseExcel = async (file: File): Promise<ExcelEmployee[]> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (json.length === 0) {
        toast.error('Le fichier Excel doit contenir au moins une ligne de données');
        return [];
      }

      const headers = Object.keys(json[0]);
      const requiredColumns = ['firstName', 'lastName', 'email', 'phone', 'role', 'subsidiary', 'homeAddress', 'workAddress'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        toast.error(`Colonnes manquantes: ${missingColumns.join(', ')}`);
        return [];
      }

      const employees: ExcelEmployee[] = json.map((employee: any) => {
        const validation = validateEmployee(employee);
        return {
          firstName: employee.firstName?.toString() || '',
          lastName: employee.lastName?.toString() || '',
          email: employee.email?.toString() || '',
          phone: employee.phone?.toString() || '',
          role: employee.role?.toString() || '',
          subsidiary: employee.subsidiary?.toString() || '',
          homeAddress: employee.homeAddress?.toString() || '',
          workAddress: employee.workAddress?.toString() || '',
          isValid: validation.isValid,
          errors: validation.errors
        };
      });

      return employees;
    } catch (error) {
      toast.error('Erreur lors de l\'analyse du fichier Excel');
      return [];
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = async (file: File) => {
    if (!file.name.endsWith('.xlsx')) {
      toast.error('Veuillez sélectionner un fichier Excel (.xlsx)');
      return;
    }

    setExcelFile(file);
    setIsProcessing(true);

    try {
      const employees = await parseExcel(file);
      
      if (employees.length > 0) {
        setParsedEmployees(employees);
        setShowPreview(true);
        
        const validCount = employees.filter(emp => emp.isValid).length;
        const invalidCount = employees.length - validCount;
        
        if (invalidCount > 0) {
          toast.warning(`${validCount} Collaborateur${validCount > 1 ? 's' : ''} valide(s), ${invalidCount} avec${invalidCount > 1 ? ' des erreurs' : ' une erreur'}`);
        } else {
          toast.success(`${validCount} Collaborateur${validCount > 1 ? 's' : ''} prêt${validCount > 1 ? 's' : ''} à être importé${validCount > 1 ? 's' : ''}`);
        }
      }
    } catch (error) {
      toast.error('Erreur lors de la lecture du fichier Excel');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleImport = () => {
    const validEmployees = parsedEmployees.filter(emp => emp.isValid);
    
    if (validEmployees.length === 0) {
      toast.error('Aucun Collaborateur valide à importer');
      return;
    }

    const formattedEmployees: CreateEmployee[] = validEmployees.map(emp => {
      const role = roles.find(r => r.name === emp.role);
      const subsidiary = subsidiaries.find(s => s.name === emp.subsidiary);
      
      const addresses: UserAddressDto[] = [];
      if (emp.homeAddress) {
        addresses.push({
          address: {
            street: emp.homeAddress.split(',')[0]?.trim() || '',
            postalCode: emp.homeAddress.split(',')[1]?.trim() || '',
            addressType: AddressType.HOME,
            formattedAddress :emp.homeAddress,
            manuallyEntered: true,
            isVerified: false,
            isExact: false
          },
          label: AddressType.HOME,
          isDefault: true
        });
      }
      if (emp.workAddress) {
        addresses.push({
          address: {
            street: emp.workAddress.split(',')[0]?.trim() || '',
            postalCode: emp.workAddress.split(',')[1]?.trim() || '',
            formattedAddress :emp.workAddress,
            addressType: AddressType.OFFICE,
            manuallyEntered: true,
            isVerified: false,
            isExact: false
          },
          label: AddressType.OFFICE,
          isDefault: true
        });
      }

      return {
        email: emp.email,
        password: 'Default123',
        fullName: `${emp.firstName} ${emp.lastName}`,
        firstName: emp.firstName,
        lastName: emp.lastName,
        phone: emp.phone,
        enterpriseId: user?.enterpriseId,
        subsidiaryId: subsidiary?.id,
        roleIds: role ? [role.id] : [],
        addresses
      };
    });

    // Log the formatted employees array

    onEmployeesImported(formattedEmployees);
    
    resetState();
    onOpenChange(false);
    
  };

  const resetState = () => {
    setExcelFile(null);
    setParsedEmployees([]);
    setShowPreview(false);
    setIsProcessing(false);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const validEmployeesCount = parsedEmployees.filter(emp => emp.isValid).length;
  const invalidEmployeesCount = parsedEmployees.length - validEmployeesCount;

  const columns = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'role',
    'subsidiary',
    'homeAddress',
    'workAddress'
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto my-4">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-etaxi-yellow" />
            <span>Importer des Collaborateurs depuis un fichier Excel</span>
          </DialogTitle>
        </DialogHeader>

        {!canCreate ? (
          <div className="text-center text-red-600 font-bold py-8">Accès refusé : vous n'avez pas la permission d'importer des collaborateurs.</div>
        ) : (
        <div className="space-y-6">
          {!showPreview ? (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Télécharger le fichier Excel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    isDragOver 
                      ? "border-etaxi-yellow bg-etaxi-yellow/10" 
                      : "border-border bg-muted/20 hover:bg-muted/30"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">
                      {isDragOver ? 'Déposez votre fichier Excel ici' : 'Glissez votre fichier Excel ici'}
                    </p>
                    <p className="text-sm text-muted-foreground">ou cliquez pour sélectionner</p>
                  </div>
                  <Input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileUpload}
                    className="mt-4 cursor-pointer"
                    disabled={isProcessing || loading}
                  />
                  {isProcessing && (
                    <div className="mt-4 flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-etaxi-yellow"></div>
                      <span className="text-sm">Traitement en cours...</span>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">Format requis :</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    Le fichier Excel doit contenir les colonnes suivantes :
                  </p>
                  <Table className="table-auto min-w-full">
                    <TableHeader>
                      <TableRow>
                        {columns.map((col) => (
                          <TableHead key={col} className="text-left break-words">{col}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                  </Table>
                  <div className="mt-3 text-sm text-blue-700 dark:text-blue-300">
                    <p><strong>Rôles valides :</strong> {roles.map(r => r.name).join(', ') || 'Aucun rôle disponible'}</p>
                    <p><strong>Sous Organisation valides :</strong> {subsidiaries.map(s => s.name).join(', ') || 'Aucune filiale disponible'}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="w-full"
                  disabled={loading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger le modèle Excel
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Aperçu des données</h3>
                <div className="flex space-x-2">
                  <Badge variant="default" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    {validEmployeesCount} valide(s)
                  </Badge>
                  {invalidEmployeesCount > 0 && (
                    <Badge variant="destructive" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {invalidEmployeesCount} erreur(s)
                    </Badge>
                  )}
                </div>
              </div>

              <div className="border rounded-lg overflow-x-hidden bg-card">
                <Table className="table-auto min-w-full">
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-left break-words">Statut</TableHead>
                      <TableHead className="text-left break-words">Nom</TableHead>
                      <TableHead className="text-left break-words">Email</TableHead>
                      <TableHead className="text-left break-words">Téléphone</TableHead>
                      <TableHead className="text-left break-words">Rôle</TableHead>
                      <TableHead className="text-left break-words">Filiale</TableHead>
                      <TableHead className="text-left break-words">Adresse domicile</TableHead>
                      <TableHead className="text-left break-words">Adresse travail</TableHead>
                      <TableHead className="text-left break-words">Erreurs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedEmployees.map((employee, index) => (
                      <TableRow 
                        key={index} 
                        className={cn(
                          "border-border",
                          !employee.isValid && "bg-red-50 dark:bg-red-950/20"
                        )}
                      >
                        <TableCell className="break-words">
                          {employee.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell className="break-words">{employee.firstName} {employee.lastName}</TableCell>
                        <TableCell className="break-words">{employee.email}</TableCell>
                        <TableCell className="break-words">{employee.phone}</TableCell>
                        <TableCell className="break-words">
                          <Badge variant="outline">{employee.role}</Badge>
                        </TableCell>
                        <TableCell className="break-words">{employee.subsidiary}</TableCell>
                        <TableCell className="break-words">{employee.homeAddress}</TableCell>
                        <TableCell className="break-words">{employee.workAddress}</TableCell>
                        <TableCell className="break-words">
                          {employee.errors.length > 0 && (
                            <div className="text-xs text-red-600 dark:text-red-400">
                              {employee.errors.join(', ')}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            
            {showPreview && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPreview(false);
                    setExcelFile(null);
                    setParsedEmployees([]);
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Choisir un autre fichier
                </Button>
                <Button
                  onClick={handleImport}
                  className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
                  disabled={validEmployeesCount === 0 || loading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Importer {validEmployeesCount} Collaborateur(s)
                </Button>
              </>
            )}
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
