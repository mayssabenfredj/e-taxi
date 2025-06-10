import React, { useState } from 'react';
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
import { Building2, Plus, Edit, Trash2, MapPin, Phone, Mail, Globe, Users, User } from 'lucide-react';
import { toast } from 'sonner';
import { TableWithPagination } from '@/components/ui/table-with-pagination';

interface Address {
  id: string;
  label: string;
  street: string;
  buildingNumber?: string;
  complement?: string;
  postalCode: string;
  city: string;
  region?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  formattedAddress?: string;
  isVerified?: boolean;
  isExact?: boolean;
  manuallyEntered?: boolean;
  addressType?: string;
  notes?: string;
}

interface Subsidiary {
  id: string;
  name: string;
  address: Address;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  managerIds: string[]; // Changed to array for multiple managers
  managerNames: string[]; // Changed to array for multiple managers
  status: 'active' | 'inactive';
  employeesCount: number;
  createdAt: string;
}

export function SubsidiariesPage() {
  const { t } = useLanguage();
  
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([
    {
      id: '1',
      name: 'Filiale Paris Nord',
      address: {
        id: 'addr1',
        label: 'Siège Paris Nord',
        street: '123 Avenue de la République',
        buildingNumber: '123',
        city: 'Paris',
        postalCode: '75011',
        country: 'France'
      },
      phone: '+33 1 42 42 42 42',
      email: 'paris-nord@techcorp.fr',
      website: 'www.techcorp-paris.fr',
      description: 'Filiale spécialisée dans le développement',
      managerIds: ['1', '2'],
      managerNames: ['Marie Martin', 'Pierre Durand'],
      status: 'active',
      employeesCount: 45,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Filiale Lyon',
      address: {
        id: 'addr2',
        label: 'Bureau Lyon',
        street: '67 Rue de la Part-Dieu',
        city: 'Lyon',
        postalCode: '69003',
        country: 'France'
      },
      phone: '+33 4 78 78 78 78',
      email: 'lyon@techcorp.fr',
      managerIds: ['3'],
      managerNames: ['Sophie Laurent'],
      status: 'active',
      employeesCount: 28,
      createdAt: '2024-02-10'
    }
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubsidiary, setEditingSubsidiary] = useState<Subsidiary | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    selectedManagerIds: [] as string[],
    address: null as Address | null
  });

  // Mock managers data
  const managers = [
    { id: '1', name: 'Marie Martin' },
    { id: '2', name: 'Pierre Durand' },
    { id: '3', name: 'Sophie Laurent' },
    { id: '4', name: 'Jean Dupont' },
    { id: '5', name: 'Claire Rousseau' },
    { id: '6', name: 'Thomas Dubois' }
  ];

  const handleSubmit = () => {
    if (!formData.name || !formData.address) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const selectedManagers = managers.filter(m => formData.selectedManagerIds.includes(m.id));

    const subsidiaryData: Subsidiary = {
      id: editingSubsidiary?.id || `sub-${Date.now()}`,
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      website: formData.website,
      description: formData.description,
      managerIds: formData.selectedManagerIds,
      managerNames: selectedManagers.map(m => m.name),
      status: 'active',
      employeesCount: editingSubsidiary?.employeesCount || 0,
      createdAt: editingSubsidiary?.createdAt || new Date().toISOString().split('T')[0]
    };

    if (editingSubsidiary) {
      setSubsidiaries(prev => prev.map(s => s.id === editingSubsidiary.id ? subsidiaryData : s));
      toast.success('Filiale modifiée avec succès!');
    } else {
      setSubsidiaries(prev => [...prev, subsidiaryData]);
      toast.success('Filiale créée avec succès!');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      website: '',
      description: '',
      selectedManagerIds: [],
      address: null
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
      address: subsidiary.address
    });
    setIsCreateOpen(true);
  };

  const handleDelete = (id: string) => {
    setSubsidiaries(prev => prev.filter(s => s.id !== id));
    toast.success('Filiale supprimée avec succès!');
  };

  const handleManagerToggle = (managerId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedManagerIds: prev.selectedManagerIds.includes(managerId)
        ? prev.selectedManagerIds.filter(id => id !== managerId)
        : [...prev.selectedManagerIds, managerId]
    }));
  };

  const savedAddresses: Address[] = [
    {
      id: 'saved1',
      label: 'Siège social',
      street: '101 Avenue des Champs-Élysées',
      city: 'Paris',
      postalCode: '75008',
      country: 'France'
    }
  ];

  const columns = [
    {
      header: 'Nom',
      accessor: 'name',
      sortable: true,
      render: (item) => (
        <div className="text-left">
          <div className="font-medium text-sm">{item.name}</div>
          {item.description && (
            <div className="text-xs text-muted-foreground">{item.description}</div>
          )}
        </div>
      )
    },
    {
      header: 'Managers',
      accessor: 'managerNames',
      sortable: true,
      render: (item) => (
        <div className="text-left">
          {item.managerNames && item.managerNames.length > 0 ? (
            <div className="space-y-1">
              {item.managerNames.map((name, index) => (
                <div key={index} className="flex items-center text-sm">
                  <User className="mr-1 h-3 w-3 text-muted-foreground" />
                  <span>{name}</span>
                </div>
              ))}
              <Badge variant="outline" className="text-xs">
                {item.managerNames.length} manager{item.managerNames.length > 1 ? 's' : ''}
              </Badge>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Non assigné</span>
          )}
        </div>
      )
    },
    {
      header: 'Adresse',
      accessor: 'address',
      sortable: false,
      render: (item) => (
        <div className="flex items-center text-left">
          <MapPin className="mr-1 h-4 w-4" />
          <div>
            <div className="text-sm">{item.address.street}</div>
            <div className="text-xs text-muted-foreground">
              {item.address.postalCode} {item.address.city}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Contact',
      accessor: 'contact',
      sortable: false,
      render: (item) => (
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
      )
    },
    {
      header: 'Employés',
      accessor: 'employeesCount',
      sortable: true,
      render: (item) => (
        <div className="flex items-center text-left">
          <Users className="mr-1 h-4 w-4" />
          {item.employeesCount}
        </div>
      )
    },
    {
      header: 'Statut',
      accessor: 'status',
      sortable: true,
      filterable: true,
      render: (item) => (
        <Badge
          className={
            item.status === 'active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
          }
        >
          {item.status === 'active' ? 'Actif' : 'Inactif'}
        </Badge>
      )
    }
  ];

  const filterOptions = [
    { label: 'Tous', value: 'all', field: 'status' },
    { label: 'Actif', value: 'active', field: 'status' },
    { label: 'Inactif', value: 'inactive', field: 'status' }
  ];

  const actions = (item) => (
    <div className="flex space-x-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleEdit(item)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600"
        onClick={() => handleDelete(item.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Card className="w-full sm:w-48 bg-card border-border">
            <CardContent className="p-3 flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-etaxi-yellow" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Filiales</p>
                <p className="text-lg font-bold">{subsidiaries.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full sm:w-48 bg-card border-border">
            <CardContent className="p-3 flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Employés</p>
                <p className="text-lg font-bold">
                  {subsidiaries.reduce((sum, s) => sum + s.employeesCount, 0)}
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
                  {subsidiaries.reduce((sum, s) => sum + (s.managerIds?.length || 0), 0)}
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
                  {new Set(subsidiaries.map(s => s.address.city)).size}
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
                label="Adresse *"
                value={formData.address}
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
                      {formData.selectedManagerIds.length} manager{formData.selectedManagerIds.length > 1 ? 's' : ''} sélectionné{formData.selectedManagerIds.length > 1 ? 's' : ''}
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
          filterOptions={filterOptions}
        />
      </div>
    </div>
  );
}