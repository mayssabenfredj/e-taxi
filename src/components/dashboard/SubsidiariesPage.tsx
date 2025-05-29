
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddressInput } from '@/components/shared/AddressInput';
import { useLanguage } from '@/contexts/LanguageContext';
import { Building2, Plus, Edit, Trash2, MapPin, Phone, Mail, Globe, Users } from 'lucide-react';
import { toast } from 'sonner';

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
    address: null as Address | null
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.address) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const subsidiaryData: Subsidiary = {
      id: editingSubsidiary?.id || `sub-${Date.now()}`,
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      website: formData.website,
      description: formData.description,
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

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">Gestion des Filiales</h2>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-etaxi-yellow hover:bg-yellow-500 text-black">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Filiale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSubsidiary ? 'Modifier la Filiale' : 'Créer une Nouvelle Filiale'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Nom de la filiale *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nom de la filiale"
                />
              </div>

              <AddressInput
                label="Adresse *"
                value={formData.address}
                onChange={(address) => setFormData({...formData, address})}
                savedAddresses={savedAddresses}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Téléphone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+33 X XX XX XX XX"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="contact@filiale.com"
                  />
                </div>
              </div>

              <div>
                <Label>Site web</Label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  placeholder="www.filiale.com"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description de la filiale"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} className="bg-etaxi-yellow hover:bg-yellow-500 text-black">
                  {editingSubsidiary ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-etaxi-yellow" />
              <div>
                <p className="text-sm text-muted-foreground">Total Filiales</p>
                <p className="text-2xl font-bold">{subsidiaries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Employés</p>
                <p className="text-2xl font-bold">
                  {subsidiaries.reduce((sum, s) => sum + s.employeesCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800">
                <div>
                  <p className="text-sm text-muted-foreground">Actives</p>
                  <p className="text-2xl font-bold">
                    {subsidiaries.filter(s => s.status === 'active').length}
                  </p>
                </div>
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Villes</p>
                <p className="text-2xl font-bold">
                  {new Set(subsidiaries.map(s => s.address.city)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subsidiaries Table */}
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle>Liste des Filiales</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Employés</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subsidiaries.map((subsidiary) => (
                <TableRow key={subsidiary.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{subsidiary.name}</div>
                      {subsidiary.description && (
                        <div className="text-sm text-muted-foreground">
                          {subsidiary.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      <div>
                        <div className="text-sm">{subsidiary.address.street}</div>
                        <div className="text-xs text-muted-foreground">
                          {subsidiary.address.postalCode} {subsidiary.address.city}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {subsidiary.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="mr-1 h-3 w-3" />
                          {subsidiary.phone}
                        </div>
                      )}
                      {subsidiary.email && (
                        <div className="flex items-center text-sm">
                          <Mail className="mr-1 h-3 w-3" />
                          {subsidiary.email}
                        </div>
                      )}
                      {subsidiary.website && (
                        <div className="flex items-center text-sm">
                          <Globe className="mr-1 h-3 w-3" />
                          {subsidiary.website}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      {subsidiary.employeesCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        subsidiary.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {subsidiary.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(subsidiary)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDelete(subsidiary.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
