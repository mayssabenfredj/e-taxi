import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import SubsidiaryService from '@/services/subsidiarie.service';
import { Subsidiary, CreateSubsidiary, UpdateSubsidiary, EntityStatus, FormData, Manager } from '@/types/subsidiary';
import { Address, AddressType } from '@/types/addresse';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import SubsidiaryForm from '@/components/company/SubsidiaryForm';
import SubsidiaryStats from '@/components/company/SubsidiaryStats';
import SubsidiaryTable from '@/components/company/SubsidiaryTable';

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

  const managers: Manager[] = [
    { id: '1', name: 'Marie Martin' },
    { id: '2', name: 'Pierre Durand' },
    { id: '3', name: 'Sophie Laurent' },
    { id: '4', name: 'Jean Dupont' },
    { id: '5', name: 'Claire Rousseau' },
    { id: '6', name: 'Thomas Dubois' },
  ];

  const savedAddresses: Address[] = [
    {
      id: 'saved1',
      label: 'Siège social',
      street: '101 Avenue des Champs-Élysées',
      postalCode: '75008',
      city: { id: 'city1', name: 'Paris', postalCode: '75008', regionId: 'region1' },
      country: { id: 'country1', name: 'France', code: 'FR' },
      addressType: AddressType.OFFICE,
      isVerified: true,
      isExact: true,
      manuallyEntered: false,
    },
  ];

  // Fetch subsidiaries with pagination and filters
  useEffect(() => {
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
            ? managers.filter((m) => sub.admins.some((admin: { id: string }) => admin.id === m.id)).map((m) => m.name)
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

      let newSubsidiary: Subsidiary;

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
        const updated = await SubsidiaryService.updateSubsidiary(editingSubsidiary.id, updateData);
        newSubsidiary = {
          id: updated.id,
          name: updated.name,
          address: updated.address || null,
          phone: updated.phone,
          email: updated.email,
          website: updated.website,
          description: updated.description,
          status: updated.status || EntityStatus.ACTIVE,
          createdAt: editingSubsidiary.createdAt,
          updatedAt: updated.updatedAt || new Date().toISOString(),
          deletedAt: updated.deletedAt,
          enterpriseId: updated.enterpriseId,
          employeeCount: updated.employeeCount || 0,
          employeesCount: updated.employeesCount || 0,
          admins: updated.admins || [],
          adminIds: updated.admins?.map((admin: { id: string }) => admin.id) || [],
          managerIds: updated.admins?.map((admin: { id: string }) => admin.id) || [],
          managerNames: updated.admins
            ? managers.filter((m) => updated.admins.some((admin: { id: string }) => admin.id === m.id)).map((m) => m.name)
            : [],
        };
        setSubsidiaries((prev) =>
          prev.map((s) => (s.id === updated.id ? newSubsidiary : s))
        );
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
        const created = await SubsidiaryService.createSubsidiary(createData);
        newSubsidiary = {
          id: created.id,
          name: created.name,
          address: created.address || null,
          phone: created.phone,
          email: created.email,
          website: created.website,
          description: created.description,
          status: created.status || EntityStatus.ACTIVE,
          createdAt: created.createdAt || new Date().toISOString().split('T')[0],
          updatedAt: created.updatedAt,
          deletedAt: created.deletedAt,
          enterpriseId: created.enterpriseId,
          employeeCount: created.employeeCount || 0,
          employeesCount: created.employeesCount || 0,
          admins: created.admins || [],
          adminIds: created.admins?.map((admin: { id: string }) => admin.id) || [],
          managerIds: created.admins?.map((admin: { id: string }) => admin.id) || [],
          managerNames: created.admins
            ? managers.filter((m) => created.admins.some((admin: { id: string }) => admin.id === m.id)).map((m) => m.name)
            : [],
        };
        setSubsidiaries((prev) => [newSubsidiary, ...prev]);
        setTotal((prev) => prev + 1);
        toast.success('Filiale créée avec succès!');
      }
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
      const updated = await SubsidiaryService.updateSubsidiaryStatus(subsidiary.id, newStatus);
      const updatedSubsidiary: Subsidiary = {
        ...subsidiary,
        status: updated.status || newStatus,
        updatedAt: updated.updatedAt || new Date().toISOString(),
        admins: updated.admins || subsidiary.admins || [],
        adminIds: updated.admins?.map((admin: { id: string }) => admin.id) || subsidiary.adminIds || [],
        managerIds: updated.admins?.map((admin: { id: string }) => admin.id) || subsidiary.managerIds || [],
        managerNames: updated.admins
          ? managers.filter((m) => updated.admins.some((admin: { id: string }) => admin.id === m.id)).map((m) => m.name)
          : subsidiary.managerNames || [],
      };
      setSubsidiaries((prev) =>
        prev.map((s) => (s.id === updated.id ? updatedSubsidiary : s))
      );
      toast.success(`Statut de la filiale mis à jour à "${newStatus}" avec succès!`);
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
            managers={managers}
            savedAddresses={savedAddresses}
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