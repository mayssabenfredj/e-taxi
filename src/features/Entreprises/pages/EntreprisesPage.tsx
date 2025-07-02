import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableWithPagination } from '@/shareds/components/ui/table-with-pagination';
import { Button } from '@/shareds/components/ui/button';
import { Badge } from '@/shareds/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shareds/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shareds/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shareds/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Eye, Edit, Power, PowerOff, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { EntityStatus, Enterprise as ApiEnterprise } from '../types/entreprise';
import { useAuth } from '@/shareds/contexts/AuthContext';
import { entrepriseService } from '../services/entreprise.service';
import { hasPermission } from '@/shareds/lib/utils';

function LogoCell({ logoUrl, alt }: { logoUrl?: string | null; alt: string }) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    if (logoUrl) {
      entrepriseService.getLogoImage(logoUrl)
        .then((url) => { if (mounted) setImgSrc(url); })
        .catch(() => { if (mounted) setImgSrc(null); });
    } else {
      setImgSrc(null);
    }
    return () => { mounted = false; };
  }, [logoUrl]);
  if (imgSrc) {
    return <img src={imgSrc} alt={alt} className="w-8 h-8 object-cover" style={{ minWidth: 32, minHeight: 32 }} />;
  }
  return <Building2 className="w-8 h-8 text-muted-foreground" />;
}

export function EnterprisesPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  if (!authLoading && !hasPermission(user, 'enterprises:read')) {
    return <div className="p-8 text-center text-red-600 font-bold text-xl">Accès refusé : vous n'avez pas la permission de voir cette page.</div>;
  }

  // Pagination states
  const [enterprises, setEnterprises] = useState<ApiEnterprise[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(10);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Vérification du rôle ADMIN
  const isAdmin = user?.roles?.some(r => (typeof r === 'string' ? r === 'ADMIN' : r.role?.name === 'ADMIN'));

  // Récupération des entreprises
  const fetchEnterprises = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { skip, take };
      if (filters.status) {
        params.status = filters.status === 'active' ? EntityStatus.ACTIVE : EntityStatus.INACTIVE;
      }
      const res = await entrepriseService.findAll(params);
      console.log("entrepriseeee", res);
      setEnterprises(res.data || []);
      setTotal(res.data?.total || 0);
    } catch (e) {
      toast.error('Erreur lors du chargement des Organisations');
    } finally {
      setLoading(false);
    }
  }, [skip, take, filters]);

  useEffect(() => {
    if (isAdmin) {
      fetchEnterprises();
    }
  }, [fetchEnterprises, isAdmin]);

  // Gestion du changement de page
  const handlePageChange = (newSkip: number, newTake: number) => {
    setSkip(newSkip);
    setTake(newTake);
  };

  // Gestion des filtres
  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setSkip(0); // reset page
  };

  // Gestion du changement de statut (mock UI only)
  const handleStatusToggle = async (enterprise: ApiEnterprise) => {
    try {
      const newStatus = enterprise.status === EntityStatus.ACTIVE ? EntityStatus.INACTIVE : EntityStatus.ACTIVE;
      await entrepriseService.update(enterprise.id, {
        titre: enterprise.name,
        email: enterprise.email || '',
        phone: enterprise.phone || '',
        mobile: enterprise.mobile || '',
        secteurActivite: enterprise.industry || '',
        matriculeFiscal: enterprise.taxId || '',
        status: newStatus,
        website: enterprise.website || '',
        address: enterprise.address || undefined,
      });
      toast.success(
        `Entreprise ${newStatus === EntityStatus.ACTIVE ? 'activée' : 'désactivée'} avec succès`
      );
      fetchEnterprises();
    } catch (e) {
      toast.error('Erreur lors du changement de statut');
    }
  };

  // Colonnes du tableau
  const columns = [
    {
      header: "Nom de l'Organisation",
      accessor: 'name' as keyof ApiEnterprise,
      sortable: true,
      render: (enterprise: ApiEnterprise) => (
        <div className="flex items-center gap-2">
          <LogoCell logoUrl={enterprise.logoUrl} alt={enterprise.name} />
          <span>{enterprise.name}</span>
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: 'email' as keyof ApiEnterprise,
      sortable: true,
    },
    {
      header: 'Téléphone',
      accessor: 'phone' as keyof ApiEnterprise,
    },
    {
      header: 'Statut',
      accessor: 'status' as keyof ApiEnterprise,
      render: (enterprise: ApiEnterprise) => (
        <Badge variant={enterprise.status === EntityStatus.ACTIVE ? 'default' : 'secondary'}>
          {enterprise.status === EntityStatus.ACTIVE ? 'Actif' : 'Inactif'}
        </Badge>
      ),
      filterable: true,
    },
    {
      header: 'Sous Organisation',
      accessor: 'subsidiaries' as keyof ApiEnterprise,
      render: (enterprise: ApiEnterprise) => (
        <span>{enterprise.subsidiaries?.length || 0} filiale{(enterprise.subsidiaries?.length || 0) > 1 ? 's' : ''}</span>
      ),
    },
    {
      header: 'Date de création',
      accessor: 'createdAt' as keyof ApiEnterprise,
      sortable: true,
      render: (enterprise: ApiEnterprise) => (
        new Date(enterprise.createdAt).toLocaleDateString('fr-FR')
      ),
    },
  ];

  const filterOptions = [
    { label: 'Actives', value: 'active', field: 'status' as keyof ApiEnterprise },
    { label: 'Inactives', value: 'inactive', field: 'status' as keyof ApiEnterprise },
  ];

  const canCreate = user && hasPermission(user, 'enterprises:create');
  const canUpdate = user && hasPermission(user, 'enterprises:update');

  const renderActions = (enterprise: ApiEnterprise) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={e => { e.stopPropagation(); navigate(`/companys/${enterprise.id}`); }}>
          <Eye className="mr-2 h-4 w-4" />
          Voir détails
        </DropdownMenuItem>
        {canUpdate && (
          <DropdownMenuItem onClick={e => { e.stopPropagation(); navigate(`/companys/create/${enterprise.id}`); }}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
        )}
        {canUpdate && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onClick={e => e.stopPropagation()} onSelect={e => e.preventDefault()}>
                {enterprise.status === EntityStatus.ACTIVE ? (
                  <>
                    <PowerOff className="mr-2 h-4 w-4" />
                    Désactiver
                  </>
                ) : (
                  <>
                    <Power className="mr-2 h-4 w-4" />
                    Activer
                  </>
                )}
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {enterprise.status === EntityStatus.ACTIVE ? 'Désactiver' : 'Activer'} l'entreprise
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir {enterprise.status === EntityStatus.ACTIVE ? 'désactiver' : 'activer'}
                  l'entreprise "{enterprise.name}" ?
                  {enterprise.status === EntityStatus.ACTIVE && " Cette action rendra l'Organisation inaccessible."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleStatusToggle(enterprise)}>
                  Confirmer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (authLoading) {
    return <div>Chargement...</div>;
  }

  if (!isAdmin) {
    return <div className="text-center text-red-500 font-bold mt-10">Accès refusé : réservé aux administrateurs.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Organisations</h1>
          <p className="text-muted-foreground">
            Gérez toutes les Organisations et leurs Sous Organisations
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => navigate('/companys/create')} className="bg-etaxi-yellow hover:bg-etaxi-yellow/90 text-black">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Organisation
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Organisations</CardTitle>
        </CardHeader>
        <CardContent>
          <TableWithPagination
            data={enterprises}
            columns={columns}
            searchPlaceholder="Rechercher par nom, email..."
            filterOptions={filterOptions}
            actions={renderActions}
            onRowClick={(enterprise) => navigate(`/companys/${enterprise.id}`)}
            total={total}
            skip={skip}
            take={take}
            onPageChange={handlePageChange}
            onFilterChange={handleFilterChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
