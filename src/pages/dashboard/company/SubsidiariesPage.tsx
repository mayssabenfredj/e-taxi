import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import SubsidiaryService from '@/services/subsidiarie.service';
import { Subsidiary, CreateSubsidiary, UpdateSubsidiary, EntityStatus, FormData, Admin,  } from '@/types/subsidiary';
import { Address, AddressType } from '@/types/addresse';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import SubsidiaryForm from '@/components/company/SubsidiaryForm';
import SubsidiaryStats from '@/components/company/SubsidiaryStats';
import { SubsidiaryTable } from '@/components/company/SubsidiaryTable';

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

  

  // Fetch subsidiaries with pagination and filters
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
        managerNames: sub.admins
          ? sub.admins.map((admin: Admin) => `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || 'Admin sans nom'
    )
          : [],
      }));
      setSubsidiaries(mappedData);
      setTotal(total);
      toast.success('Filiales chargées avec succès!');
    } catch (err: any) {
      toast.error(`Erreur lors du chargement des filiales: ${err.message || 'Une erreur est survenue.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Refetch function to update table data after changes
  const refetchData = async () => {
    await fetchSubsidiaries();
  };

  useEffect(() => {
    fetchSubsidiaries();
  }, [enterpriseId, skip, take, nameFilter, statusFilter]);

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
    if (!formData.name || !formData.address || !enterpriseId) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const addressData: Omit<Address, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'city' | 'region' | 'country'> = {
        label: formData.address.label || '',
        street: formData.address.street || '',
        buildingNumber: formData.address.buildingNumber || undefined,
        complement: formData.address.complement || undefined,
        postalCode: formData.address.postalCode || '',
        cityId: formData.address.cityId || null,
        regionId: formData.address.regionId || null,
        countryId: formData.address.countryId || null,
        latitude: formData.address.latitude || undefined,
        longitude: formData.address.longitude || undefined,
        placeId: formData.address.placeId || undefined,
        formattedAddress: formData.address.formattedAddress || undefined,
        isVerified: formData.address.isVerified || false,
        isExact: formData.address.isExact || false,
        manuallyEntered: formData.address.manuallyEntered || true,
        addressType: formData.address.addressType || AddressType.OFFICE,
        notes: formData.address.notes || undefined,
      };

      if (editingSubsidiary) {
        const updateData: UpdateSubsidiary = {
          name: formData.name,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          website: formData.website || undefined,
          description: formData.description || undefined,
          adminIds: formData.selectedManagerIds.length ? formData.selectedManagerIds : undefined,
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
      
      // Refetch data to update the table with the latest information
      await refetchData();
      resetForm();
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
      selectedManagerIds: subsidiary.adminIds || [],
      address: subsidiary.address || null,
      enterpriseId: enterpriseId || '',
    });
    setIsCreateOpen(true);
  };

  const handleUpdateStatus = async (subsidiary: Subsidiary, newStatus: EntityStatus) => {
    try {
      await SubsidiaryService.updateSubsidiaryStatus(subsidiary.id, newStatus);
      toast.success(`Statut de la filiale mis à jour à "${newStatus}" avec succès!`);
      
      // Refetch data to update the table with the latest information
      await refetchData();
    } catch (err: any) {
      toast.error(`Erreur lors du changement de statut: ${err.message || 'Une erreur est survenue.'}`);
    }
  };

  if (!enterpriseId) {
    return (
      <div className="p-4 text-center">
        <p>Vous devez être associé à une entreprise pour gérer les filiales.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-6xl">
      {loading && <div>Chargement...</div>}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <SubsidiaryStats total={total} subsidiaries={subsidiaries} />
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-etaxi-yellow hover:bg-yellow-500 text-black h-8 text-sm w-full sm:w-auto">
              <Plus className="mr-1 h-3 w-3" />
              Nouvelle Filiale
            </Button>
          </DialogTrigger>
          <SubsidiaryForm
            editingSubsidiary={editingSubsidiary}
            formData={formData}
            setFormData={setFormData}
            // Pass an empty array for managers if not needed, or fetch dynamically
            managers={[]}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
        </Dialog>
      </div>
      <SubsidiaryTable
        subsidiaries={subsidiaries}
        total={total}
        skip={skip}
        take={take}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
        onEdit={handleEdit}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}