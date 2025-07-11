import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/shareds/contexts/LanguageContext';
import { useAuth } from '@/shareds/contexts/AuthContext';
import { toast } from 'sonner';
import SubsidiaryService from '@/features/Entreprises/services/subsidiarie.service';
import { Subsidiary, CreateSubsidiary, UpdateSubsidiary, EntityStatus, FormData, Manager } from '../../types/subsidiary';
import { Address, AddressType } from '@/shareds/types/addresse';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shareds/components/ui/dialog';
import { Button } from '@/shareds/components/ui/button';
import { Plus } from 'lucide-react';
import SubsidiaryForm from '@/features/Entreprises/components/SubsidiaryForm';
import SubsidiaryStats from '@/features/Entreprises/components/SubsidiaryStats';
import { SubsidiaryTable } from '@/features/Entreprises/components/SubsidiaryTable';
import employeeService from '@/features/employees/services/employee.service';
import { hasPermission } from '@/shareds/lib/utils';

export function SubsidariesPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubsidiary, setEditingSubsidiary] = useState<Subsidiary | null>(null);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(10);
  const [total, setTotal] = useState(0);
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<EntityStatus | 'all'>('all');
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    subsidiary: Subsidiary | null;
    newStatus: EntityStatus | null;
  }>({ open: false, subsidiary: null, newStatus: null });

  const enterpriseId = user?.enterpriseId;

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    selectedManagerIds: [],
    address: null,
    enterpriseId: enterpriseId || '',
  });

  // Fetch managers with role ADMIN_FILIAL
  useEffect(() => {
    const fetchManagers = async () => {
      if (!enterpriseId) return;
      setLoadingManagers(true);
      try {
        const query = {
          enterpriseId,
          roleName: 'ADMIN_FILIAL',
          includeAllData: false,
          status: 'ENABLED',
        };
        const { data } = await employeeService.getAllEmployees(query);
        const mappedManagers: Manager[] = data.map((employee) => ({
          id: employee.id,
          name: employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Sans nom',
        }));
        setManagers(mappedManagers);
      } catch (error) {
        toast.error('Erreur lors du chargement des managers');
      } finally {
        setLoadingManagers(false);
      }
    };
    fetchManagers();
  }, [enterpriseId]);

  // Fetch subsidiaries
  const fetchSubsidiaries = async () => {
    if (!enterpriseId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const query = {
        enterpriseId,
        name: nameFilter || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        skip,
        take,
      };
      const { data, total } = await SubsidiaryService.getAllSubsidiaries(query);
      const mappedData: Subsidiary[] = data.map((sub) => ({
        id: sub.id,
        name: sub.name,
        address: sub.address || null,
        phone: sub.phone,
        email: sub.email,
        website: sub.website,
        description: sub.description,
        status: sub.status || EntityStatus.ACTIVE,
        createdAt: sub.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: sub.updatedAt,
        deletedAt: sub.deletedAt,
        enterpriseId: sub.enterpriseId,
        employeeCount: sub.employeeCount || 0,
        employeesCount: sub.employeesCount || 0,
        admins: sub.admins || [],
        adminIds: sub.admins?.map((admin: { id: string }) => admin.id) || [],
        managerIds: sub.admins?.map((admin: { id: string }) => admin.id) || [],
        managerNames: sub.admins?.map((admin: { firstName?: string; lastName?: string; fullName?: string }) =>
          admin.fullName || `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || 'Sans nom'
        ) || [],
      }));
      setSubsidiaries(mappedData);
      
      setTotal(total);
    } catch (err: any) {
      toast.error(`Erreur lors du chargement des sous organisations: ${err.message || 'Une erreur est survenue.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Call fetchSubsidiaries when dependencies change
  useEffect(() => {
    fetchSubsidiaries();
  }, [enterpriseId, skip, take, nameFilter, statusFilter, managers]);

  const handlePageChange = (newSkip: number, newTake: number) => {
    setSkip(newSkip);
    setTake(newTake);
  };

  const handleFilterChange = (filters: { [key: string]: string }) => {
    if (filters.status) {
      setStatusFilter(filters.status as EntityStatus | 'all');
    } else {
      setStatusFilter('all');
    }
    if (filters.name) {
      setNameFilter(filters.name);
    } else {
      setNameFilter('');
    }
    setSkip(0);
  };

  const handleSubmit = async () => {
    try {
      const addressData: Omit<Address, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'city' | 'region' | 'country'> = {
        label: formData.address?.label || '',
        street: formData.address?.street || '',
        buildingNumber: formData.address?.buildingNumber || undefined,
        complement: formData.address?.complement || undefined,
        postalCode: formData.address?.postalCode || '',
        cityId: formData.address?.cityId || null,
        regionId: formData.address?.regionId || null,
        countryId: formData.address?.countryId || null,
        latitude: formData.address?.latitude || undefined,
        longitude: formData.address?.longitude || undefined,
        placeId: formData.address?.placeId || undefined,
        formattedAddress: formData.address?.formattedAddress || undefined,
        isVerified: formData.address?.isVerified || false,
        isExact: formData.address?.isExact || false,
        manuallyEntered: formData.address?.manuallyEntered || true,
        addressType: formData.address?.addressType || AddressType.OFFICE,
        notes: formData.address?.notes || undefined,
      };

      if (editingSubsidiary) {
        const updateData: UpdateSubsidiary = {
          name: formData.name,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          website: formData.website || undefined,
          description: formData.description || undefined,
          adminIds: formData.selectedManagerIds,
          address: addressData,
          status: EntityStatus.ACTIVE,
        };
        await SubsidiaryService.updateSubsidiary(editingSubsidiary.id, updateData);
        toast.success('Filiale modifiée avec succès!');
      } else {
        const createData: CreateSubsidiary = {
          name: formData.name,
          enterpriseId,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          website: formData.website || undefined,
          description: formData.description || undefined,
          adminIds: formData.selectedManagerIds.length ? formData.selectedManagerIds : undefined,
          address: addressData,
          status: EntityStatus.ACTIVE,
        };
        await SubsidiaryService.createSubsidiary(createData);
        toast.success('Filiale créée avec succès!');
      }
      resetForm();
      await fetchSubsidiaries();
    } catch (err: any) {
      toast.error(`Erreur: ${err.message || 'Une erreur est survenue.'}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      website: '',
      description: '',
      selectedManagerIds: [],
      address: null,
      enterpriseId: enterpriseId || '',
    });
    setEditingSubsidiary(null);
    setIsCreateOpen(false);
  };

  const handleEdit = (subsidiary: Subsidiary) => {
    setEditingSubsidiary(subsidiary);
    setFormData({
      name: subsidiary.name,
      phone: subsidiary.phone || '',
      email: subsidiary.email || '',
      website: subsidiary.website || '',
      description: subsidiary.description || '',
      selectedManagerIds: subsidiary.managerIds || [],
      address: subsidiary.address || null,
      enterpriseId: enterpriseId || '',
    });
    setIsCreateOpen(true);
  };

  const handleUpdateStatus = (subsidiary: Subsidiary, newStatus: EntityStatus) => {
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

  const canCreate = user && hasPermission(user, 'subsidiaries:create');
  const canUpdate = user && hasPermission(user, 'subsidiaries:update');

  if (user && !hasPermission(user, 'subsidiaries:read')) {
    return <div className="p-8 text-center text-red-600 font-bold text-xl">Accès refusé : vous n'avez pas la permission de voir cette page.</div>;
  }

  if (!enterpriseId) {
    return (
      <div className="p-4 text-center">
        <p>Vous devez être associé à une organisation pour gérer les sous organisations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-6xl">
      {loading && <div>Chargement...</div>}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <SubsidiaryStats total={total} subsidiaries={subsidiaries} />
        {canCreate && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-etaxi-yellow hover:bg-yellow-500 text-black h-8 text-sm w-full sm:w-auto">
                <Plus className="mr-1 h-3 w-3" />
                Nouvelle Filiale
              </Button>
            </DialogTrigger>
            <DialogContent>
              <SubsidiaryForm
                editingSubsidiary={editingSubsidiary}
                formData={formData}
                setFormData={setFormData}
                managers={managers}
                onSubmit={handleSubmit}
                onCancel={resetForm}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
      <SubsidiaryTable
        subsidiaries={subsidiaries}
        total={total}
        skip={skip}
        take={take}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
        onEdit={canUpdate ? handleEdit : undefined}
        onUpdateStatus={canUpdate ? handleUpdateStatus : undefined}
        canUpdate={canUpdate}
      />
      <Dialog open={confirmDialog.open} onOpenChange={() => setConfirmDialog({ open: false, subsidiary: null, newStatus: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.newStatus === EntityStatus.ACTIVE
                ? `Confirmer l'activation de "${confirmDialog.subsidiary?.name}"`
                : `Confirmer la désactivation de "${confirmDialog.subsidiary?.name}"`}
            </DialogTitle>
          </DialogHeader>
          <p className="mt-2">Êtes-vous sûr de vouloir continuer ?</p>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, subsidiary: null, newStatus: null })}
            >
              Annuler
            </Button>
            <Button onClick={confirmStatusChange}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}