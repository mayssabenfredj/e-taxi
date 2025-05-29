
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { AddressInput } from '../shared/AddressInput';
import { Users, Plus, Upload, Check, X, Mail, Phone, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: any;
  status: 'active' | 'pending';
}

export function EmployeesPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      phone: '+33 6 12 34 56 78',
      address: null,
      status: 'active'
    },
    {
      id: '2',
      name: 'Marie Martin',
      email: 'marie.martin@email.com',
      phone: '+33 6 98 76 54 32',
      address: null,
      status: 'pending'
    }
  ]);

  const [pendingRequests] = useState([
    {
      id: '3',
      name: 'Pierre Durand',
      email: 'pierre.durand@email.com',
      phone: '+33 6 11 22 33 44'
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    address: null
  });

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const employee: Employee = {
      id: Date.now().toString(),
      ...newEmployee,
      status: 'active'
    };

    setEmployees(prev => [...prev, employee]);
    setNewEmployee({ name: '', email: '', phone: '', address: null });
    setIsAddDialogOpen(false);
    toast.success('Employé ajouté avec succès!');
  };

  const handleAcceptRequest = (requestId: string) => {
    toast.success('Demande acceptée!');
  };

  const handleRejectRequest = (requestId: string) => {
    toast.success('Demande rejetée!');
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast.success('Fonctionnalité d\'import CSV à implémenter');
    }
  };
  
  const handleViewEmployee = (id: string) => {
    navigate(`/employees/${id}`);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">{t('employees')}</h2>
        </div>

        <div className="flex space-x-2">
          <input
            type="file"
            id="csv-upload"
            accept=".csv,.xlsx"
            onChange={handleCSVUpload}
            className="hidden"
          />
          <Label htmlFor="csv-upload">
            <Button variant="outline" className="cursor-pointer" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                {t('importCSV')}
              </span>
            </Button>
          </Label>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-etaxi-yellow hover:bg-yellow-500 text-black">
                <Plus className="mr-2 h-4 w-4" />
                {t('addEmployee')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t('addEmployee')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('employeeName')}</Label>
                  <Input
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('email')}</Label>
                  <Input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('phone')}</Label>
                  <Input
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))}
                  />
                </div>

                <AddressInput
                  label={t('address')}
                  value={newEmployee.address}
                  onChange={(address) => setNewEmployee(prev => ({
                    ...prev,
                    address
                  }))}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleAddEmployee}
                    className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Badge variant="secondary" className="mr-2">
                {pendingRequests.length}
              </Badge>
              {t('pendingRequests')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{request.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Mail className="mr-1 h-3 w-3" />
                        {request.email}
                      </span>
                      <span className="flex items-center">
                        <Phone className="mr-1 h-3 w-3" />
                        {request.phone}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcceptRequest(request.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="mr-1 h-4 w-4" />
                      {t('accept')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectRequest(request.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="mr-1 h-4 w-4" />
                      {t('reject')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employees Table */}
      <Card className="animate-slide-up">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    {employee.name}
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.phone}</TableCell>
                  <TableCell>
                    <Badge
                      variant={employee.status === 'active' ? 'default' : 'secondary'}
                    >
                      {employee.status === 'active' ? 'Actif' : 'En attente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewEmployee(employee.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
