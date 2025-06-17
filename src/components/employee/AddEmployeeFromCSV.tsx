import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileText, CheckCircle, AlertCircle, Download, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CSVEmployee {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'employee' | 'manager' | 'admin';
  subsidiary: string;
  isValid: boolean;
  errors: string[];
}

interface AddEmployeeFromCSVProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeesImported: (employees: any[]) => void;
}

export function AddEmployeeFromCSV({ open, onOpenChange, onEmployeesImported }: AddEmployeeFromCSVProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedEmployees, setParsedEmployees] = useState<CSVEmployee[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const downloadTemplate = () => {
    const csvContent = `firstName,lastName,email,phone,role,subsidiary
Jean,Dupont,jean.dupont@example.com,+33612345678,employee,TechCorp Paris
Marie,Martin,marie.martin@example.com,+33698765432,manager,TechCorp Lyon
Pierre,Durand,pierre.durand@example.com,+33711223344,employee,TechCorp Marseille`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_employes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Modèle CSV téléchargé');
  };

  const validateEmployee = (employee: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!employee.firstName?.trim()) errors.push('Prénom manquant');
    if (!employee.lastName?.trim()) errors.push('Nom manquant');
    if (!employee.email?.trim()) errors.push('Email manquant');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) errors.push('Email invalide');
    if (!employee.phone?.trim()) errors.push('Téléphone manquant');
    if (!['employee', 'manager', 'admin'].includes(employee.role)) errors.push('Rôle invalide');
    if (!employee.subsidiary?.trim()) errors.push('Filiale manquante');

    return { isValid: errors.length === 0, errors };
  };

  const parseCSV = (csvText: string): CSVEmployee[] => {
    try {
      const lines = csvText.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        toast.error('Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données');
        return [];
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const employees: CSVEmployee[] = [];

      // Vérifier que les colonnes requises sont présentes
      const requiredColumns = ['firstName', 'lastName', 'email', 'phone', 'role', 'subsidiary'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        toast.error(`Colonnes manquantes: ${missingColumns.join(', ')}`);
        return [];
      }

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const employee: any = {};

        headers.forEach((header, index) => {
          employee[header] = values[index] || '';
        });

        const validation = validateEmployee(employee);
        employees.push({
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          phone: employee.phone,
          role: employee.role,
          subsidiary: employee.subsidiary,
          isValid: validation.isValid,
          errors: validation.errors
        });
      }

      return employees;
    } catch (error) {
      console.error('Erreur lors du parsing CSV:', error);
      toast.error('Erreur lors de l\'analyse du fichier CSV');
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
    if (!file.name.endsWith('.csv')) {
      toast.error('Veuillez sélectionner un fichier CSV');
      return;
    }

    setCsvFile(file);
    setIsProcessing(true);

    try {
      const text = await file.text();
      const employees = parseCSV(text);
      
      if (employees.length > 0) {
        setParsedEmployees(employees);
        setShowPreview(true);
        
        const validCount = employees.filter(emp => emp.isValid).length;
        const invalidCount = employees.length - validCount;
        
        if (invalidCount > 0) {
          toast.warning(`${validCount} employé(s) valide(s), ${invalidCount} avec des erreurs`);
        } else {
          toast.success(`${validCount} employé(s) prêt(s) à être importé(s)`);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la lecture du fichier:', error);
      toast.error('Erreur lors de la lecture du fichier CSV');
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
      toast.error('Aucun employé valide à importer');
      return;
    }

    const formattedEmployees = validEmployees.map(emp => ({
      id: Date.now().toString() + Math.random(),
      name: `${emp.firstName} ${emp.lastName}`,
      email: emp.email,
      phone: emp.phone,
      position: 'À définir',
      department: 'À définir',
      subsidiary: emp.subsidiary,
      role: emp.role,
      status: 'pending',
      isManager: emp.role === 'manager',
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString()
    }));

    onEmployeesImported(formattedEmployees);
    
    // Reset state
    resetState();
    onOpenChange(false);
    
    toast.success(`${validEmployees.length} employé(s) importé(s) avec succès`);
  };

  const resetState = () => {
    setCsvFile(null);
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto my-4">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-etaxi-yellow" />
            <span>Importer des employés depuis un fichier CSV</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!showPreview ? (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Télécharger le fichier CSV</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Drag and Drop Zone */}
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
                      {isDragOver ? 'Déposez votre fichier CSV ici' : 'Glissez votre fichier CSV ici'}
                    </p>
                    <p className="text-sm text-muted-foreground">ou cliquez pour sélectionner</p>
                  </div>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="mt-4 cursor-pointer"
                    disabled={isProcessing}
                  />
                  {isProcessing && (
                    <div className="mt-4 flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-etaxi-yellow"></div>
                      <span className="text-sm">Traitement en cours...</span>
                    </div>
                  )}
                </div>

                {/* Format Information */}
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">Format requis :</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    Le fichier CSV doit contenir les colonnes suivantes :
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-blue-800 dark:text-blue-200"><strong>firstName</strong> - Prénom</div>
                    <div className="text-blue-800 dark:text-blue-200"><strong>lastName</strong> - Nom</div>
                    <div className="text-blue-800 dark:text-blue-200"><strong>email</strong> - Adresse email</div>
                    <div className="text-blue-800 dark:text-blue-200"><strong>phone</strong> - Numéro de téléphone</div>
                    <div className="text-blue-800 dark:text-blue-200"><strong>role</strong> - employee/manager/admin</div>
                    <div className="text-blue-800 dark:text-blue-200"><strong>subsidiary</strong> - Nom de la filiale</div>
                  </div>
                </div>

                {/* Download Template Button */}
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger le modèle CSV
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Preview Header */}
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

              {/* Preview Table */}
              <div className="border rounded-lg max-h-96 overflow-y-auto bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead>Statut</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Filiale</TableHead>
                      <TableHead>Erreurs</TableHead>
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
                        <TableCell>
                          {employee.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell>{employee.firstName} {employee.lastName}</TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{employee.phone}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{employee.role}</Badge>
                        </TableCell>
                        <TableCell>{employee.subsidiary}</TableCell>
                        <TableCell>
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

          {/* Action Buttons */}
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
                    setCsvFile(null);
                    setParsedEmployees([]);
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Choisir un autre fichier
                </Button>
                <Button
                  onClick={handleImport}
                  className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
                  disabled={validEmployeesCount === 0}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Importer {validEmployeesCount} employé(s)
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}