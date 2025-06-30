import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shareds/components/ui/card';
import { Button } from '@/shareds/components/ui/button';
import { Input } from '@/shareds/components/ui/input';
import { Badge } from '@/shareds/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shareds/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/shareds/components/ui/alert-dialog';
import { UserCog, Search, Filter, Eye, Edit, Building2, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import employeeService from '@/features/employees/services/employee.service';
import { useRolesAndSubsidiaries } from '@/shareds/hooks/useRolesAndSubsidiaries';
import { Employee, UserStatus } from '@/features/employees/types/employee';

export function GlobalEmployeesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [enterpriseFilter, setEnterpriseFilter] = useState<string>('all');
  const [subsidiaryFilter, setSubsidiaryFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Charger dynamiquement les rôles et filiales/entreprises
  const { roles, subsidiaries, loading: loadingRoles, error: errorRoles } = useRolesAndSubsidiaries(enterpriseFilter !== 'all' ? enterpriseFilter : undefined);

  // Charger les entreprises pour le filtre principal (on prend toutes les entreprises des filiales)
  const [allEnterprises, setAllEnterprises] = useState<string[]>([]);
  useEffect(() => {
    // Extraire toutes les entreprises uniques depuis les filiales
    setAllEnterprises(Array.from(new Set(subsidiaries.map(sub => sub.name))));
  }, [subsidiaries]);

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
      status: statusFilter !== 'all' ? (statusFilter === 'active' ? true : false) : undefined,
      includeAllData: true,
    };
    employeeService.getAllEmployees(query)
      .then(res => {
        setEmployees(res.data);
            console.log("employeeess", res);

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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrateur': return 'bg-red-100 text-red-800';
      case 'Manager': return 'bg-blue-100 text-blue-800';
      case 'Développeur': return 'bg-purple-100 text-purple-800';
      case 'Employé': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      await employeeService.deleteEmployee(employeeId);
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      setTotal(prev => prev - 1);
      toast.success('Employé supprimé avec succès');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  };

  // Pagination helpers
  const totalPages = Math.ceil(total / itemsPerPage);
  const currentPage = Math.floor(skip / itemsPerPage) + 1;

  const handlePageChange = (page: number) => {
    setSkip((page - 1) * itemsPerPage);
  };

  const EmployeeCard = ({ employee }: { employee: Employee }) => (
    <div 
      className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors bg-white"
      onClick={() => navigate(`/dashboard/employees/${employee.id}`)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-medium text-sm truncate">{employee.fullName || employee.email}</h3>
            <Badge className={`${getStatusColor(employee.status as string)} text-xs px-2 py-1`}>
              {getStatusText(employee.status as string)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-1 truncate">{employee.email}</p>
          <p className="text-xs text-muted-foreground mb-2">{employee.phone}</p>
          <div className="space-y-1 text-xs">
            <div className="truncate">
              <span className="font-medium">Filiale:</span> {employee.subsidiary?.name || '-'}
            </div>
            <div className="flex items-center justify-between">
              <Badge className={`${getRoleColor(employee.roles?.[0] || '')} text-xs px-2 py-1`}>
                {employee.roles?.[0] || '-'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {employee.lastLoginAt ? new Date(employee.lastLoginAt).toLocaleDateString('fr-FR') : ''}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dashboard/employees/${employee.id}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              // Edit employee logic
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer l'employé</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer l'employé <strong>{employee.fullName || employee.email}</strong> ? 
                  Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteEmployee(employee.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <UserCog className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">Gestion globale des employés ({total})</h2>
        </div>
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
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="ENABLED">Actif</SelectItem>
                <SelectItem value="DISABLED">Inactif</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
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
              <SelectTrigger>
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
              <SelectTrigger>
                <SelectValue placeholder="Entreprise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les entreprises</SelectItem>
                {subsidiaries.map(sub => (
                  <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={subsidiaryFilter} onValueChange={setSubsidiaryFilter}>
              <SelectTrigger>
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

      {/* Employees Display */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucun employé trouvé avec les filtres actuels</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {employees.map(employee => (
                  <EmployeeCard key={employee.id} employee={employee} />
                ))}
              </div>
              {/* Pagination */}
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-muted-foreground">
                  Affichage {skip + 1}-{Math.min(skip + itemsPerPage, total)} sur {total} employés
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNumber)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}