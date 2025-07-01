import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shareds/components/ui/card';
import { Button } from '@/shareds/components/ui/button';
import { Badge } from '@/shareds/components/ui/badge';
import { TableWithPagination } from '@/shareds/components/ui/table-with-pagination';
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
import { ArrowLeft, Edit, Plus, MoreHorizontal, PowerOff, Power, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import SubsidiaryService from '@/features/Entreprises/services/subsidiarie.service';
import { Enterprise as ApiEnterprise, EntityStatus } from '../types/entreprise';
import { Subsidiary, Manager, FormData } from '../types/subsidiary';
import { CreateEnterpriseForm } from './CreateEntrpriseForm';
import { SubsidiaryTable } from '@/features/Entreprises/components/SubsidiaryTable';
import SubsidiaryForm from '@/features/Entreprises/components/SubsidiaryForm';
import { Dialog, DialogTrigger, DialogContent } from '@/shareds/components/ui/dialog';
import { entrepriseService } from '../services/entreprise.service';
import employeeService from '@/features/employees/services/employee.service';
import { hasPermission } from '@/shareds/lib/utils';
import { useAuth } from '@/shareds/contexts/AuthContext';

function LogoDetail({ logoUrl, alt }: { logoUrl?: string | null; alt: string }) {
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
    return <img src={imgSrc} alt={alt} className="w-24 h-24 object-cover mb-2" />;
  }
  return <Building2 className="w-24 h-24 text-muted-foreground mb-2" />;
}

export function EnterpriseDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const [enterprise, setEnterprise] = useState<ApiEnterprise | null>(null);
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [subsidiaryModalOpen, setSubsidiaryModalOpen] = useState(false);
  const [editingSubsidiary, setEditingSubsidiary] = useState<Subsidiary | null>(null);
  const [subsidiarySkip, setSubsidiarySkip] = useState(0);
  const [subsidiaryTake, setSubsidiaryTake] = useState(10);
  const [subsidiaryTotal, setSubsidiaryTotal] = useState(0);
  const [subsidiaryFilters, setSubsidiaryFilters] = useState<Record<string, string>>({});
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [subsidiaryFormData, setSubsidiaryFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    selectedManagerIds: [],
    address: null,
    enterpriseId: id || '',
  });
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; subsidiary: Subsidiary | null; newStatus: EntityStatus | null }>({ open: false, subsidiary: null, newStatus: null });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Récupérer l'entreprise
      const res = await entrepriseService.findOne(id!);
      setEnterprise(res.data);
      // SUPPRIMÉ : récupération des filiales ici
    } catch (e: any) {
      setError("Erreur lors du chargement des données de l'organisation");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchSubsidiaries = useCallback(async () => {
    try {
      const subRes = await SubsidiaryService.getAllSubsidiaries({
        enterpriseId: id,
        skip: subsidiarySkip,
        take: subsidiaryTake,
      });
      console.log("dubbbRess", subRes);
      const mappedData: Subsidiary[] = subRes.data.map((sub) => ({
        id: sub.id,
        name: sub.name,
        address: sub.address || null,
        phone: sub.phone,
        email: sub.email,
        website: sub.website,
        description: sub.description,
        status: sub.status || EntityStatus.ACTIVE,
        createdAt: sub.createdAt || null,
        updatedAt: sub.updatedAt,
        deletedAt: sub.deletedAt,
        enterpriseId: sub.enterpriseId,
        employeeCount: sub.employeeCount || 0,
        employeesCount: sub.employeesCount || 0,
        admins: sub.admins || [],
        adminIds: sub.admins?.map((admin: { id: string }) => admin.id) || [],
        managerIds: sub.admins?.map((admin: { id: string }) => admin.id) || [],
        managerNames: sub.admins?.map(
          (admin) =>
            admin.fullName ||
            `${admin.firstName || ''} ${admin.lastName || ''}`.trim() ||
            'Sans nom'
        ) || [],
      }));
      console.log("*****", mappedData);
      setSubsidiaries(mappedData);
      setSubsidiaryTotal(subRes.total);
      console.log("subsidiaries :", subsidiaries);
    } catch (e) {
      toast.error('Erreur lors du chargement des filiales');
    }
  }, [id, subsidiarySkip, subsidiaryTake, subsidiaryFilters]);

  const fetchManagers = useCallback(async () => {
    if (!id) return;
    setLoadingManagers(true);
    try {
      const query = {
        enterpriseId: id,
        roleName: 'ADMIN_FILIAL',
        includeAllData: false,
        status: 'ENABLED',
      };
      const { data } = await employeeService.getAllEmployees(query);
      const mappedManagers: Manager[] = data.map((employee: any) => ({
        id: employee.id,
        name: employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Sans nom',
      }));
      setManagers(mappedManagers);
    } catch (error) {
      toast.error('Erreur lors du chargement des managers');
    } finally {
      setLoadingManagers(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchData();
  }, [id, fetchData]);
  useEffect(() => {
    if (id) fetchSubsidiaries();
  }, [id, fetchSubsidiaries]);
  useEffect(() => {
    if (subsidiaryModalOpen) {
      fetchManagers();
    }
  }, [subsidiaryModalOpen, fetchManagers]);


  // Callbacks pour SubsidiaryTable
  const handleEditSubsidiary = (subsidiary: Subsidiary) => {
    setEditingSubsidiary(subsidiary);
    setSubsidiaryFormData({
      name: subsidiary.name,
      phone: subsidiary.phone || '',
      email: subsidiary.email || '',
      website: subsidiary.website || '',
      description: subsidiary.description || '',
      selectedManagerIds: subsidiary.managerIds || [],
      address: subsidiary.address || null,
      enterpriseId: subsidiary.enterpriseId || id || '',
    });
    setSubsidiaryModalOpen(true);
  };
  const handleAddSubsidiary = () => {
    setEditingSubsidiary(null);
    setSubsidiaryFormData({
      name: '',
      phone: '',
      email: '',
      website: '',
      description: '',
      selectedManagerIds: [],
      address: null,
      enterpriseId: id || '',
    });
    setSubsidiaryModalOpen(true);
  };
  const handleUpdateSubsidiaryStatus = (subsidiary: Subsidiary, newStatus: EntityStatus) => {
    setConfirmDialog({ open: true, subsidiary, newStatus });
  };
  const confirmStatusChange = async () => {
    if (!confirmDialog.subsidiary || !confirmDialog.newStatus) return;
    try {
      await SubsidiaryService.updateSubsidiaryStatus(confirmDialog.subsidiary.id, confirmDialog.newStatus);
      toast.success(`Statut de la filiale mis à jour à "${confirmDialog.newStatus}" avec succès!`);
      await fetchSubsidiaries();
    } catch (err: any) {
      toast.error(`Erreur lors du changement de statut: ${err.message || 'Une erreur est survenue.'}`);
    } finally {
      setConfirmDialog({ open: false, subsidiary: null, newStatus: null });
    }
  };
  const handleSubsidiaryPageChange = (newSkip: number, newTake: number) => {
    setSubsidiarySkip(newSkip);
    setSubsidiaryTake(newTake);
  };
  const handleSubsidiaryFilterChange = (filters: Record<string, string>) => {
    setSubsidiaryFilters(filters);
    setSubsidiarySkip(0);
  };
  // Callback pour soumission du formulaire (ajout/modif)
  const handleSubsidiaryFormSubmit = async () => {
    try {
      if (editingSubsidiary) {
        // Update
        await SubsidiaryService.updateSubsidiary(editingSubsidiary.id, {
          name: subsidiaryFormData.name,
          phone: subsidiaryFormData.phone || undefined,
          email: subsidiaryFormData.email || undefined,
          website: subsidiaryFormData.website || undefined,
          description: subsidiaryFormData.description || undefined,
          adminIds: subsidiaryFormData.selectedManagerIds,
          address: subsidiaryFormData.address || undefined,
          status: EntityStatus.ACTIVE,
        });
        toast.success('Filiale modifiée avec succès!');
      } else {
        // Create
        await SubsidiaryService.createSubsidiary({
          name: subsidiaryFormData.name,
          enterpriseId: subsidiaryFormData.enterpriseId,
          phone: subsidiaryFormData.phone || undefined,
          email: subsidiaryFormData.email || undefined,
          website: subsidiaryFormData.website || undefined,
          description: subsidiaryFormData.description || undefined,
          adminIds: subsidiaryFormData.selectedManagerIds.length ? subsidiaryFormData.selectedManagerIds : undefined,
          address: subsidiaryFormData.address || undefined,
          status: EntityStatus.ACTIVE,
        });
        toast.success('Filiale créée avec succès!');
      }
      setSubsidiaryModalOpen(false);
      await fetchSubsidiaries();
    } catch (err: any) {
      toast.error(`Erreur: ${err.message || 'Une erreur est survenue.'}`);
    }
  };

  const canCreate = user && hasPermission(user, 'subsidiaries:create');
  const canUpdate = user && hasPermission(user, 'subsidiaries:update');

  if (!authLoading && !hasPermission(user, 'enterprises:read')) {
    return <div className="p-8 text-center text-red-600 font-bold text-xl">Accès refusé : vous n'avez pas la permission de voir cette page.</div>;
  }

  if (editMode) {
    return (
      <div className="max-w-4xl mx-auto">
        <CreateEnterpriseForm
          mode="update"
          id={enterprise.id}
          initialData={{
            titre: enterprise.name,
            email: enterprise.email || '',
            phone: enterprise.phone || '',
            mobile: enterprise.mobile || '',
            secteurActivite: enterprise.industry || '',
            matriculeFiscal: enterprise.taxId || '',
            status: enterprise.status,
            website: enterprise.website || '',
            address: enterprise.address || undefined,
            description: (enterprise as any).description || '',
          }}
          logoUrlPreview={logoUrl || undefined}
        />
        <Button variant="outline" className="mt-4" onClick={() => setEditMode(false)}>Annuler</Button>
      </div>
    );
  }

  if (loading) {
    return <div>Chargement...</div>;
  }
  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }
  if (!enterprise) {
    return <div className="text-red-500 text-center mt-10">Organisation introuvable</div>;
  }

  return (
    <div className="space-y-6">
      {/* Barre horizontale en haut */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white rounded-lg shadow px-6 py-4 mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/companys')} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <LogoDetail logoUrl={enterprise.logoUrl} alt={enterprise.name} />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{enterprise.name}</h1>
            <Badge variant={enterprise.status === EntityStatus.ACTIVE ? 'default' : 'secondary'} className="ml-1">
              {enterprise.status === EntityStatus.ACTIVE ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
        <Button onClick={() => setEditMode(true)} className="bg-etaxi-yellow hover:bg-etaxi-yellow/90 text-black">
          Modifier
        </Button>
      </div>

      {/* Grille des détails entreprise */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de l'organisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
           <div>
              <label className="text-xs font-medium text-muted-foreground">Nom affiché</label>
              <div className="text-sm">{enterprise.name}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nom légal</label>
              <div className="text-sm">{enterprise.legalName || '-'}</div>
            </div>
            
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <div className="text-sm">{enterprise.email}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Téléphone</label>
              <div className="text-sm">{enterprise.phone}</div>
            </div>
            {enterprise.mobile && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Mobile</label>
                <div className="text-sm">{enterprise.mobile}</div>
              </div>
            )}
            {enterprise.website && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Site web</label>
                <div className="text-sm"><a href={enterprise.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{enterprise.website}</a></div>
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Secteur d'activité</label>
              <div className="text-sm">{enterprise.industry || '-'}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Numéro fiscal</label>
              <div className="text-sm">{enterprise.taxId || '-'}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Adresse</label>
              <div className="text-sm">{enterprise.address?.formattedAddress || '-'}</div>
            </div>
            {'description' in enterprise && enterprise.description && (
              <div className="md:col-span-2 lg:col-span-4">
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <div className="text-sm">{String(enterprise.description)}</div>
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Date de création</label>
              <div className="text-sm">{new Date(enterprise.createdAt).toLocaleDateString('fr-FR')}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Date de mise à jour</label>
              <div className="text-sm">{new Date(enterprise.updatedAt).toLocaleDateString('fr-FR')}</div>
            </div>
            {enterprise.deletedAt && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Date de suppression</label>
                <div className="text-sm">{new Date(enterprise.deletedAt).toLocaleDateString('fr-FR')}</div>
              </div>
            )}
           
          </div>
          {/* Bloc admin */}
          {enterprise.admin && (
            <div className="mt-6 p-4 rounded-lg bg-gray-50 border flex flex-col gap-2">
              <div className="font-semibold flex items-center gap-2">
                <span>Administrateur</span>
                <Badge variant="default">Admin</Badge>
              </div>
              <div className="text-start"><span className="text-xs text-muted-foreground">Nom complet : </span>{enterprise.admin.fullName || '-'}</div>
              <div className="text-start"><span className="text-xs text-muted-foreground">Email : </span>{enterprise.admin.email}</div>
              <div className="text-start"><span className="text-xs text-muted-foreground">Téléphone : </span>{enterprise.admin.phone}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistiques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total des filiales</span>
            <span className="text-2xl font-bold">{subsidiaries.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Filiales actives</span>
            <span className="text-2xl font-bold text-green-600">
              {subsidiaries.filter(s => s.status === EntityStatus.ACTIVE).length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Filiales inactives</span>
            <span className="text-2xl font-bold text-red-600">
              {subsidiaries.filter(s => s.status === EntityStatus.INACTIVE).length}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Filiales associées</CardTitle>
              <CardDescription>
                Gérez les filiales de cette organisation
              </CardDescription>
            </div>
            <Button 
              onClick={canCreate ? handleAddSubsidiary : undefined}
              className={`bg-etaxi-yellow hover:bg-etaxi-yellow/90 text-black ${!canCreate ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!canCreate}
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une filiale
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <SubsidiaryTable
            subsidiaries={subsidiaries}
            total={subsidiaryTotal}
            skip={subsidiarySkip}
            take={subsidiaryTake}
            onPageChange={handleSubsidiaryPageChange}
            onFilterChange={handleSubsidiaryFilterChange}
            onEdit={canUpdate ? handleEditSubsidiary : undefined}
            onUpdateStatus={canUpdate ? (subsidiary, newStatus) => handleUpdateSubsidiaryStatus(subsidiary, newStatus) : undefined}
            canUpdate={canUpdate}
          />
        </CardContent>
      </Card>
      {/* Modal pour ajout/modif filiale */}
      <Dialog open={subsidiaryModalOpen} onOpenChange={setSubsidiaryModalOpen}>
        <DialogContent>
          <SubsidiaryForm
            editingSubsidiary={editingSubsidiary}
            formData={subsidiaryFormData}
            setFormData={setSubsidiaryFormData}
            managers={managers}
            onSubmit={handleSubsidiaryFormSubmit}
            onCancel={() => setSubsidiaryModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
      {/* Dialog de confirmation pour activation/désactivation filiale */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.newStatus === EntityStatus.ACTIVE
                ? `Confirmer l'activation de "${confirmDialog.subsidiary?.name}"`
                : `Confirmer la désactivation de "${confirmDialog.subsidiary?.name}"`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir continuer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel onClick={() => setConfirmDialog({ open: false, subsidiary: null, newStatus: null })}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
