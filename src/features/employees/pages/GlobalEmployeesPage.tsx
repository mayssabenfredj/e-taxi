import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shareds/components/ui/card';
import { Button } from '@/shareds/components/ui/button';
import { Input } from '@/shareds/components/ui/input';
import { Badge } from '@/shareds/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shareds/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/shareds/components/ui/alert-dialog';
import { UserCog, Search, Filter, Eye, Edit, Check, Ban, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import employeeService from '@/features/employees/services/employee.service';
import { Employee, UserStatus } from '@/features/employees/types/employee';
import { TableWithPagination } from '@/shareds/components/ui/table-with-pagination';
import { roleService } from '@/features/employees/services/role.service';
import { entrepriseService } from '@/features/Entreprises/services/entreprise.service';
import SubsidiaryService from '@/features/Entreprises/services/subsidiarie.service';
import { Role } from '@/features/employees/types/role';
import { Enterprise } from '@/features/Entreprises/types/entreprise';
import { Subsidiary } from '@/features/Entreprises/types/subsidiary';

export function GlobalEmployeesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [enterpriseFilter, setEnterpriseFilter] = useState<string>('all');
  const [subsidiaryFilter, setSubsidiaryFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [skip, setSkip] = useState(0);
    const [take, setTake] = useState(100);

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Nouveaux états pour les filtres dynamiques
  const [roles, setRoles] = useState<Role[]>([]);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [employeeToToggle, setEmployeeToToggle] = useState<Employee | null>(null);
  const [toggleAction, setToggleAction] = useState<'enable' | 'disable'>('enable');

  // Charger les rôles
  useEffect(() => {
    roleService.getAllRoles()
      .then((data) => setRoles(data))
      .catch(() => toast.error('Erreur lors du chargement des rôles'));
  }, []);

  // Charger les entreprises
  useEffect(() => {
          const params: any = { skip, take };
    entrepriseService.findAll(params)
      .then((res) => setEnterprises(res.data || []))
      .catch(() => toast.error('Erreur lors du chargement des entreprises'));
  }, []);

  // Charger les filiales selon l'entreprise sélectionnée
  useEffect(() => {
    if (enterpriseFilter === 'all') {
      setSubsidiaries([]);
      return;
    }
    SubsidiaryService.getAllSubsidiaries({ enterpriseId: enterpriseFilter, include: true })
      .then((res) => setSubsidiaries(res.data || []))
      .catch(() => toast.error('Erreur lors du chargement des filiales'));
  }, [enterpriseFilter]);

  // Charger les employés depuis l'API/service
  useEffect(() => {
    setLoading(true);
    setError(null);
    const query: any = {
      skip,
      take: itemsPerPage,
      enterpriseId: enterpriseFilter !== 'all' ? enterpriseFilter : undefined,
      subsidiaryId: subsidiaryFilter !== 'all' ? subsidiaryFilter : undefined,
      roleName: roleFilter !== 'all' ? roleFilter : undefined,
      searchTerm: searchTerm || undefined,
      includeAllData: true,
    };
    employeeService.getAllEmployees(query)
      .then(res => {
        setEmployees(res.data);
        setTotal(res.total);
      })
      .catch(err => {
        setError(err.message || 'Erreur lors du chargement des employés');
        toast.error(err.message || 'Erreur lors du chargement des employés');
      })
      .finally(() => setLoading(false));
  }, [skip, itemsPerPage, enterpriseFilter, subsidiaryFilter, roleFilter, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ENABLED': return 'bg-green-100 text-green-800';
      case 'DISABLED': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ENABLED': return 'Actif';
      case 'DISABLED': return 'Inactif';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

 

  // Fonction pour activer/désactiver un employé avec confirmation
  const handleRequestToggleStatus = (employee: Employee) => {
    setEmployeeToToggle(employee);
    setToggleAction(employee.status === 'ENABLED' ? 'disable' : 'enable');
    setConfirmDialogOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!employeeToToggle) return;
    try {
      await employeeService.updateEmployeeStatus(employeeToToggle.id, employeeToToggle.status !== 'ENABLED');
      setEmployees(prev => prev.map(emp =>
        emp.id === employeeToToggle.id ? { ...emp, status: emp.status === 'ENABLED' ? 'DISABLED' as UserStatus : 'ENABLED' as UserStatus } : emp
      ));
      toast.success(`Employé ${employeeToToggle.status === 'ENABLED' ? 'désactivé' : 'activé'} avec succès`);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du changement de statut');
    } finally {
      setConfirmDialogOpen(false);
      setEmployeeToToggle(null);
    }
  };

  // Ajout d'un bouton pour reset les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setEnterpriseFilter('all');
    setSubsidiaryFilter('all');
    setRoleFilter('all');
    setStatusFilter('all');
    setSkip(0);
  };

  // Colonnes pour TableWithPagination
  const columns = [
    {
      header: 'Nom',
      accessor: 'fullName',
      render: (employee: Employee) => (
        <span>{employee.fullName || employee.email}</span>
      ),
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (employee: Employee) => <span>{employee.email}</span>,
    },
    {
      header: 'Téléphone',
      accessor: 'phone',
      render: (employee: Employee) => <span>{employee.phone || '-'}</span>,
    },
    {
      header: 'Entreprise',
      accessor: 'entreprise',
      render: (employee: Employee) => <span>{employee['enterprise']?.name || employee['entreprise']?.name || '-'}</span>,
    },
    {
      header: 'Filiale',
      accessor: 'subsidiary',
      render: (employee: Employee) => <span>{employee.subsidiary?.name || '-'}</span>,
    },
    {
      header: 'Rôle',
      accessor: 'roles',
      render: (employee: Employee) => <span>{employee.roles?.[0] || '-'}</span>,
    },
    {
      header: 'Statut',
      accessor: 'status',
      render: (employee: Employee) => (
        <Badge className={`${getStatusColor(employee.status as string)} text-xs px-2 py-1`}>
          {getStatusText(employee.status as string)}
        </Badge>
      ),
    },
    {
      header: 'Dernière connexion',
      accessor: 'lastLoginAt',
      render: (employee: Employee) => (
        <span>{employee.lastLoginAt ? new Date(employee.lastLoginAt).toLocaleDateString('fr-FR') : '-'}</span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (employee: Employee) => (
        <div className="flex flex-wrap items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 p-0"
            title="Voir"
            onClick={() => navigate(`/employees/${employee.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {employee.status === 'ENABLED' ? (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              title="Désactiver"
              onClick={() => handleRequestToggleStatus(employee)}
            >
              <Ban className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
              title="Activer"
              onClick={() => handleRequestToggleStatus(employee)}
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <UserCog className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">Gestion globale des employés ({total})</h2>
        </div>
        <Button
          variant="outline"
          className="bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
          onClick={resetFilters}
        >
          Réinitialiser les filtres
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="ENABLED">Actif</SelectItem>
                <SelectItem value="DISABLED">Inactif</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role.name} value={role.name}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setSkip(0);
            }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 par page</SelectItem>
                <SelectItem value="12">12 par page</SelectItem>
                <SelectItem value="24">24 par page</SelectItem>
                <SelectItem value="48">48 par page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={enterpriseFilter} onValueChange={setEnterpriseFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Entreprise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les entreprises</SelectItem>
                {enterprises.map(ent => (
                  <SelectItem key={ent.id} value={ent.id}>{ent.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={subsidiaryFilter} onValueChange={setSubsidiaryFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filiale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les filiales</SelectItem>
                {subsidiaries.map(sub => (
                  <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table des employés */}
      <Card>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[900px]">
              <TableWithPagination
                data={employees}
                columns={columns}
                total={total}
                skip={skip}
                take={itemsPerPage}
                onPageChange={(newSkip, newTake) => {
                  setSkip(newSkip);
                  setItemsPerPage(newTake);
                }}
                emptyMessage="Aucun employé trouvé avec les filtres actuels"
                isShowingSearchPagination={false}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmation pour activation/désactivation */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleAction === 'disable' ? 'Désactiver' : 'Activer'} l'employé
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir {toggleAction === 'disable' ? 'désactiver' : 'activer'} l'employé <strong>{employeeToToggle?.fullName || employeeToToggle?.email}</strong> ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmToggleStatus} className={toggleAction === 'disable' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}>
              {toggleAction === 'disable' ? 'Désactiver' : 'Activer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}