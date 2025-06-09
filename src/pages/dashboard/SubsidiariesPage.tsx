import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  city: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

interface Subsidiary {
  id: string;
  name: string;
  address: Address;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  managerId?: string;
  managerName?: string;
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
        city: 'Paris',
        postalCode: '75011',
        country: 'France'
      },
      phone: '+33 1 42 42 42 42',
      email: 'paris-nord@techcorp.fr',
      website: 'www.techcorp-paris.fr',
      description: 'Filiale spécialisée dans le développement',
      managerId: '1',
      managerName: 'Marie Martin',
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
      managerId: '2',
      managerName: 'Pierre Durand',
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
    managerId: '',
    address: null as Address | null
  });

  // Mock managers data
  const managers = [
    { id: '1', name: 'Marie Martin' },
    { id: '2', name: 'Pierre Durand' },
    { id: '3', name: 'Sophie Laurent' },
    { id: '4', name: 'Jean Dupont' }
  ];

  const handleSubmit = () => {
    if (!formData.name || !formData.address) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const selectedManager = managers.find(m => m.id === formData.managerId);

    const subsidiaryData: Subsidiary = {
      id: editingSubsidiary?.id || `sub-${Date.now()}`,
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      website: formData.website,
      description: formData.description,
      managerId: formData.managerId,
      managerName: selectedManager?.name,
      status: 'active',
      employeesCount: 0,
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
      managerId: '',
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
      managerId: subsidiary.managerId || '',
      address: subsidiary.address
    });
    setIsCreateOpen(true);
  };

  const handleDelete = (id: string) => {
    setSubsidiaries(prev => prev.filter(s => s.id !== id));
    toast.success('Filiale supprimée avec succès!');
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
      header: 'Manager',
      accessor: 'managerName',
      sortable: true,
      render: (item) => (
        <div className="flex items-center text-left">
          {item.managerName ? (
            <>
              <User className="mr-1 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{item.managerName}</span>
            </>
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
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
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
        onClick={() => {
          setEditingSubsidiary(item);
          setFormData({
            name: item.name,
            phone: item.phone || '',
            email: item.email || '',
            website: item.website || '',
            description: item.description || '',
            managerId: item.managerId || '',
            address: item.address
          });
          setIsCreateOpen(true);
        }}
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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-3">
          <Card className="w-48">
            <CardContent className="p-2 flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-etaxi-yellow" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Filiales</p>
                <p className="text-lg font-bold">{subsidiaries.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="w-48">
            <CardContent className="p-2 flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Employés</p>
                <p className="text-lg font-bold">
                  {subsidiaries.reduce((sum, s) => sum + s.employeesCount, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="w-48">
            <CardContent className="p-2 flex items-center space-x-2">
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
            <Button className="bg-etaxi-yellow hover:bg-yellow-500 text-black h-8 text-sm">
              <Plus className="mr-1 h-3 w-3" />
              Nouvelle Filiale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto my-4">
            <DialogHeader>
              <DialogTitle className="text-left">
                {editingSubsidiary ? 'Modifier la Filiale' : 'Nouvelle Filiale'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Nom *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom de la filiale"
                  className="h-8 text-sm"
                />
              </div>
              <AddressInput
                label="Adresse *"
                value={formData.address}
                onChange={(address) => setFormData({ ...formData, address })}
                savedAddresses={savedAddresses}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Téléphone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+33 X XX XX XX XX"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@filiale.com"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div>
                <Label>Manager</Label>
                <Select 
                  value={formData.managerId} 
                  onValueChange={(value) => setFormData({ ...formData, managerId: value })}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Sélectionner un manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Site web</Label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="www.filiale.com"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description"
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={resetForm} className="h-8 text-sm">
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-etaxi-yellow hover:bg-yellow-500 text-black h-8 text-sm"
                >
                  {editingSubsidiary ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <TableWithPagination
        data={subsidiaries}
        columns={columns}
        searchPlaceholder="Rechercher une filiale..."
        actions={actions}
        filterOptions={filterOptions}
      />
    </div>
  );
}