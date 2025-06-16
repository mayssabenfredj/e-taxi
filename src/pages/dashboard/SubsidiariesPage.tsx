import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddressInput } from '@/components/shared/AddressInput';
import { useLanguage } from '@/contexts/LanguageContext';
import { Building2, Plus, Edit, Trash2, MapPin, Phone, Mail, Globe, Users, User, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { TableWithPagination } from '@/components/ui/table-with-pagination';
import SubsidiaryService from '@/services/subsidiarie.service';
import { Subsidiary, CreateSubsidiary, UpdateSubsidiary, EntityStatus } from '@/types/subsidiary';
import { Address, AddressType } from '@/types/addresse';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Manager {
  id: string;
  name: string;
}

export function SubsidariesPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubsidiary, setEditingSubsidiary] = useState<Subsidiary | null>(null);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(10); // Adjusted to a more reasonable default
  const [total, setTotal] = useState(0);
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<EntityStatus | 'all'>('all');

  const enterpriseId = user?.enterpriseId;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    selectedManagerIds: [] as string[],
    address: null as Address | null,
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
          adminIds: sub.adminIds || [],
          managerIds: sub.adminIds || [],
          managerNames: sub.adminIds
            ? managers.filter((m) => sub.adminIds!.includes(m.id)).map((m) => m.name)
            : [],
        }));
        setSubsidiaries(mappedData);
        setTotal(total);
        toast.success('Filiales chargées avec succès!');
      } catch (error: any) {
        toast.error(`Erreur lors du chargement des filiales: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchSubsidiaries();
  }, [enterpriseId, skip, take, nameFilter, statusFilter]); // Added nameFilter and statusFilter to dependencies

  const handlePageChange = (newSkip: number, newTake: number) => {
    setSkip(newSkip);
    setTake(newTake);
  };

  const handleFilterChange = (field: string, value: string) => {
    if (field === 'status') {
      setStatusFilter(value as EntityStatus | 'all');
      setSkip(0); // Reset to first page when filter changes
    } else if (field === 'name') {
      setNameFilter(value);
      setSkip(0); // Reset to first page when filter changes
    }
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
        const updated = await SubsidiaryService.updateSubsidiary(editingSubsidiary.id, updateData);
        setSubsidiaries((prev) =>
          prev.map((s) =>
            s.id === updated.id
              ? {
                  ...updated,
                  managerIds: updated.adminIds || [],
                  managerNames: updated.adminIds
                    ? managers.filter((m) => updated.adminIds!.includes(m.id)).map((m) => m.name)
                    : [],
                  employeeCount: updated.employeeCount || 0,
                  employeesCount: updated.employeesCount || 0,
                }
              : s
          )
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
        setSubsidiaries((prev) => [
          ...prev,
          {
            ...created,
            managerIds: created.adminIds || [],
            managerNames: created.adminIds
              ? managers.filter((m) => created.adminIds!.includes(m.id)).map((m) => m.name)
              : [],
            employeeCount: created.employeeCount || 0,
            employeesCount: created.employeesCount || 0,
          },
        ]);
        toast.success('Filiale créée avec succès!');
      }
      resetForm();
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
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
      setSubsidiaries((prev) =>
        prev.map((s) =>
          s.id === updated.id
            ? {
                ...s,
                status: updated.status,
              }
            : s
        )
      );
      toast.success(`Statut de la filiale mis à jour à "${newStatus}" avec succès!`);
    } catch (error: any) {
      toast.error(`Erreur lors du changement de statut: ${error.message}`);
    }
  };

  const handleManagerToggle = (managerId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedManagerIds: prev.selectedManagerIds.includes(managerId)
        ? prev.selectedManagerIds.filter((id) => id !== managerId)
        : [...prev.selectedManagerIds, managerId],
    }));
  };

  const savedAddresses: Address[] = [
    {
      id: 'saved1',
      label: 'Siège social',
      street: '101 Avenue des Champs-Élysées',
      postalCode: '75008',
      city: { id: 'city1', name: 'Paris', postalCode: '75008', regionId: 'region1' },
      country: { id: 'country1', name: 'France', code: 'FR' },
      addressType: AddressType.OFFICE,
      isVerified: false,
      isExact: false,
      manuallyEntered: false,
    },
  ];

  const columns = [
    {
      header: 'Nom',
      accessor: 'name',
      sortable: true,
      render: (item: Subsidiary) => (
        <div className="text-left">
          <div className="font-medium text-sm">{item.name}</div>
          {item.description && (
            <div className="text-xs text-muted-foreground">{item.description}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Managers',
      accessor: 'managerNames',
      sortable: true,
      render: (item: Subsidiary) => (
        <div className="text-left">
          {item.managerNames && item.managerNames.length > 0 ? (
            <div className="space-y-1">
              {item.managerNames.map((name, index) => (
                <div key={index} className="flex items-center text-sm">
                  <User className="mr-1 h-3 w-3 text-muted-foreground" />
                  <span>{name}</span>
                </div>
              ))}
              <Badge variant="outline"className="text-xs">
                {item.managerNames.length} manager{item.managerNames.length > 1 ? 's50' : ''}
              </Badge>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Non assigné</span>
          )}
        </div>
      ),
    },
    {
      header: 'Adresse',
      accessor: 'address',
      sortable: false,
      render: (item: Subsidiary) => (
        <div className="flex items-center text-left">
          <MapPin className="mr-1 h-4 w-4" />
          <div>
            <div className="text-sm">{item.address?.street || 'N/A'}</div>
            <div className="text-xs text-muted-foreground">
              {item.address?.postalCode} {typeof item.address?.city === 'object' ? item.address?.city?.name : (item.address?.city as string) || 'N/A'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: 'contact',
      sortable: false,
      render: (item: Subsidiary) => (
        <div className="space-y-1 text-left">
          {item.phone && (
            <div className="flex items-center text-sm">
              <Phone className="mr-1 h-3 w-3" />
              {item.phone}
            </div>
          )}
          {item.email && (
            <div className="flex items-center text-sm">
              <Mail className="mr-1 h-3 w-3" />
              {item.email}
            </div>
          )}
          {item.website && (
            <div className="flex items-center text-sm">
              <Globe className="mr-1 h-3 w-3" />
              {item.website}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Employés',
      accessor: 'employeesCount',
      sortable: true,
      render: (item: Subsidiary) => (
        <div className="flex items-center text-left">
          <Users className="mr-1 h-4 w-4" />
          {item.employeesCount || item.employeeCount || 0}
        </div>
      ),
    },
    {
      header: 'Statut',
      accessor: 'status',
      sortable: true,
      filterable: true,
      render: (item: Subsidiary) => (
        <Badge
          className={
            item.status === EntityStatus.ACTIVE
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
          }
        >
          {item.status === EntityStatus.ACTIVE ? 'Actif' : item.status === EntityStatus.INACTIVE ? 'Inactif' : item.status}
        </Badge>
      ),
    },
  ];

  const filterOptions = [
    { label: 'Tous', value: 'all', field: 'status' },
    { label: 'Actif', value: EntityStatus.ACTIVE, field: 'status' },
    { label: 'Inactif', value: EntityStatus.INACTIVE, field: 'status' },
    { label: 'En attente', value: EntityStatus.PENDING, field: 'status' },
    { label: 'Archivé', value: EntityStatus.ARCHIVED, field: 'status' },
  ];

  const actions = (item: Subsidiary) => (
    <div className="flex space-x-1">
      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
        <Edit className="h-4 w-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-blue-600">
            <Settings2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modifier le statut de la filiale</AlertDialogTitle>
            <AlertDialogDescription>
              Sélectionnez le nouveau statut pour la filiale "{item.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Select
            onValueChange={(value: EntityStatus) => handleUpdateStatus(item, value)}
            defaultValue={item.status}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EntityStatus.ACTIVE}>Actif</SelectItem>
              <SelectItem value={EntityStatus.INACTIVE}>Inactif</SelectItem>
              <SelectItem value={EntityStatus.PENDING}>En attente</SelectItem>
              <SelectItem value={EntityStatus.ARCHIVED}>Archivé</SelectItem>
            </SelectContent>
          </Select>
          <AlertDialogFooter>
            <AlertDialogCancel>Fermer</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

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
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Card className="w-full sm:w-48 bg-card border-border">
            <CardContent className="p-3 flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-etaxi-yellow" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Filiales</p>
                <p className="text-lg font-bold">{total}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full sm:w-48 bg-card border-border">
            <CardContent className="p-3 flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Employés</p>
                <p className="text-lg font-bold">
                  {subsidiaries.reduce((sum, s) => sum + (s.employeesCount || s.employeeCount || 0), 0)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full sm:w-48 bg-card border-border">
            <CardContent className="p-3 flex items-center space-x-2">
              <User className="h-4 w-4 text-purple-500" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Managers</p>
                <p className="text-lg font-bold">
                  {subsidiaries.reduce((sum, s) => sum + (s.managerIds?.length || s.adminIds?.length || 0), 0)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full sm:w-48 bg-card border-border">
            <CardContent className="p-3 flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-purple-500" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Villes</p>
                <p className="text-lg font-bold">
                  {new Set(subsidiaries.map((s) => s.address?.city?.name || s.address?.city || 'N/A')).size}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-etaxi-yellow hover:bg-yellow-500 text-black h-8 text-sm w-full sm:w-auto">
              <Plus className="mr-1 h-3 w-3" />
              Nouvelle Filiale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto my-4 mx-4">
            <DialogHeader>
              <DialogTitle className="text-left">
                {editingSubsidiary ? 'Modifier la Filiale' : 'Nouvelle Filiale'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-1">
              <div>
                <Label>Nom *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom de la filiale"
                  className="h-9 text-sm bg-background border-border"
                />
              </div>

              <AddressInput
                label="Adresse"
                value={formData.address as Address}
                onChange={(address) => setFormData({ ...formData, address })}
                savedAddresses={savedAddresses}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Téléphone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+33 X XX XX XX XX"
                    className="h-9 text-sm bg-background border-border"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@filiale.com"
                    className="h-9 text-sm bg-background border-border"
                  />
                </div>
              </div>

              <div>
                <Label>Managers (sélection multiple)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto border rounded p-3">
                  {managers.map((manager) => (
                    <div key={manager.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={manager.id}
                        checked={formData.selectedManagerIds.includes(manager.id)}
                        onCheckedChange={() => handleManagerToggle(manager.id)}
                      />
                      <Label htmlFor={manager.id} className="text-sm cursor-pointer">
                        {manager.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.selectedManagerIds.length > 0 && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {formData.selectedManagerIds.length} manager
                      {formData.selectedManagerIds.length > 1 ? 's' : ''} sélectionné
                      {formData.selectedManagerIds.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                )}
              </div>

              <div>
                <Label>Site web</Label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="www.filiale.com"
                  className="h-9 text-sm bg-background border-border"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description"
                  className="h-9 text-sm bg-background border-border"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                <Button variant="outline" onClick={resetForm} className="h-9 text-sm">
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-etaxi-yellow hover:bg-yellow-500 text-black h-9 text-sm"
                >
                  {editingSubsidiary ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border-border rounded-lg">
        <TableWithPagination
  data={subsidiaries}
  columns={columns}
  searchPlaceholder="Rechercher une filiale..."
  actions={actions}
  filterOptions={filterOptions as Array<{ label: string; value: string; field: keyof Subsidiary }>}
  total={total}
  skip={skip}
  take={take}
  onPageChange={handlePageChange}
  onFilterChange={(filters) => {
    Object.entries(filters).forEach(([field, value]) => handleFilterChange(field, value));
  }}
/>
      </div>
    </div>
  );
}