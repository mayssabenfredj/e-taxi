import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shareds/components/ui/card';
import { Button } from '@/shareds/components/ui/button';
import { Input } from '@/shareds/components/ui/input';
import { Badge } from '@/shareds/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shareds/components/ui/select';
import { TableWithPagination } from '@/shareds/components/ui/table-with-pagination';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/shareds/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shareds/components/ui/dialog';
import { Shield, Search, Filter, Plus, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { RoleForm } from '../components/role/AddRoleForm';
import { roleService } from '../services/role.service';
import { Role } from '../types/role';
import { hasPermission } from '@/shareds/lib/utils';
import { useAuth } from '@/shareds/contexts/AuthContext';

export function RoleManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFormOpen, setRoleFormOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isNewRole, setIsNewRole] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [roles, setRoles] = useState<Role[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(10);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const canRead = user && hasPermission(user, 'roles:read');
  const canCreate = user && hasPermission(user, 'roles:create');
  const canUpdate = user && hasPermission(user, 'roles:update');
  const canDelete = user && hasPermission(user, 'roles:delete');
  const canAssignPermissions = user && hasPermission(user, 'roles:assign_permissions');

  // Charger les rôles depuis l'API
  useEffect(() => {
    setLoading(true);
    roleService.getAllRoles()
      .then((data) => {
        setRoles(data);
        setTotal(data.length); // Si l'API ne fournit pas le total, on prend la longueur
      })
      .catch(() => toast.error('Erreur lors du chargement des rôles'))
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      default: return status;
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role && (role as any).employeeCount > 0) {
      toast.error('Impossible de supprimer un rôle assigné à des employés');
      return;
    }
    try {
      await roleService.delete(roleId);
      setRoles(prev => prev.filter(role => role.id !== roleId));
      setTotal(prev => prev - 1);
      toast.success('Rôle supprimé avec succès');
    } catch {
      toast.error('Erreur lors de la suppression du rôle');
    }
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setIsNewRole(true);
    setRoleFormOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsNewRole(false);
    setRoleFormOpen(true);
  };

  const handleSaveRole = async (roleData: any) => {
    if (isNewRole) {
      try {
        const newRole = await roleService.create(roleData);
        setRoles(prev => [...prev, newRole]);
        setTotal(prev => prev + 1);
        toast.success('Rôle créé avec succès');
      } catch {
        toast.error('Erreur lors de la création du rôle');
      }
    } else {
      try {
        if (!selectedRole) return;
        const updatedRole = await roleService.update(selectedRole.id, roleData);
        setRoles(prev => prev.map(role => role.id === selectedRole.id ? updatedRole : role));
        toast.success('Rôle modifié avec succès');
      } catch {
        toast.error('Erreur lors de la modification du rôle');
      }
    }
    setRoleFormOpen(false);
  };

  // Filtrage et pagination côté client (à adapter si l'API supporte la pagination)
  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });
  // Tri par date
  const sortedRoles = filteredRoles.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });
  const paginatedRoles = sortedRoles.slice(skip, skip + take);

  const columns = [
    {
      header: 'Rôle',
      accessor: 'name',
      render: (role: Role) => (
        <div>
          <div className="font-medium">{role.name}</div>
          <div className="text-sm text-muted-foreground">{role.description}</div>
        </div>
      )
    },
    {
      header: 'Permissions',
      accessor: 'permissions',
      render: (role: Role) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {(role.permissions || []).slice(0, 2).map(perm => (
            <Badge key={perm.id} variant="outline" className="text-xs">
              {perm.action.split(':')[1] || perm.action}
            </Badge>
          ))}
          {(role.permissions && role.permissions.length > 2) && (
            <Badge variant="outline" className="text-xs">
              +{role.permissions.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    {
      header: 'Créé le',
      accessor: 'createdAt',
      render: (role: Role) => new Date(role.createdAt).toLocaleDateString('fr-FR')
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (role: Role) => (
        <div className="flex items-center space-x-2">
          {canRead && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleEditRole(role);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer le rôle</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer le rôle <strong>{role.name}</strong> ?
                    {(role as any).employeeCount > 0 && (
                      <span className="text-red-600 block mt-2">
                        Ce rôle est assigné à {(role as any).employeeCount} employé(s). La suppression est impossible.
                      </span>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteRole(role.id)}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={(role as any).employeeCount > 0}
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
        </div>
      )
    }
  ];

  const handlePageChange = (newSkip: number, newTake: number) => {
    setSkip(newSkip);
    setTake(newTake);
  };

  if (!canRead) {
    return <div className="p-8 text-center text-red-600 font-bold text-xl">Accès refusé : vous n'avez pas la permission de voir les rôles.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">Gestion des rôles ({filteredRoles.length})</h2>
        </div>
        <Button 
          className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
          onClick={handleCreateRole}
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un rôle
        </Button>
      </div>

      {/* UI de recherche et tri */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un rôle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Select value={sortOrder} onValueChange={v => setSortOrder(v as 'asc' | 'desc')}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Trier par date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Plus récent d'abord</SelectItem>
                  <SelectItem value="asc">Plus ancien d'abord</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table des rôles */}
      <Card>
        <CardContent className="p-0">
          <TableWithPagination
            data={paginatedRoles}
            columns={columns}
            total={filteredRoles.length}
            skip={skip}
            take={take}
            onPageChange={handlePageChange}
            emptyMessage="Aucun rôle trouvé"
            isShowingSearchPagination={false}
          />
        </CardContent>
      </Card>

      {/* Affichage du formulaire dans une popup/dialog */}
       <Dialog open={roleFormOpen} onOpenChange={setRoleFormOpen}>
      <DialogContent className="max-w-4xl p-2">
        <RoleForm
          selectedRole={selectedRole}
          onClose={() => setRoleFormOpen(false)}
          onSave={handleSaveRole}
          isNewRole={isNewRole}
        />
      </DialogContent>
    </Dialog>
    </div>
  );
}
