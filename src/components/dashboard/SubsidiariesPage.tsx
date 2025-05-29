
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Building,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  Share2
} from 'lucide-react';
import { AddressInput } from '@/components/shared/AddressInput';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

// Type pour les filiales d'après le schéma Prisma
interface Subsidiary {
  id: string;
  name: string;
  address?: {
    id: string;
    label?: string;
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  } | null;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ARCHIVED';
}

export function SubsidiariesPage() {
  const { t } = useLanguage();
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([
    {
      id: '1',
      name: 'Filiale Paris',
      phone: '+33 1 23 45 67 89',
      email: 'paris@etaxi.com',
      website: 'paris.etaxi.com',
      status: 'ACTIVE',
      description: 'Filiale principale à Paris',
      address: {
        id: 'addr1',
        label: '15 Rue de la Paix',
        street: '15 Rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
        country: 'France'
      }
    },
    {
      id: '2',
      name: 'Filiale Lyon',
      phone: '+33 4 56 78 90 12',
      email: 'lyon@etaxi.com',
      website: 'lyon.etaxi.com',
      status: 'ACTIVE',
      description: 'Filiale à Lyon',
      address: {
        id: 'addr2',
        label: '10 Place Bellecour',
        street: '10 Place Bellecour',
        city: 'Lyon',
        postalCode: '69002',
        country: 'France'
      }
    },
    {
      id: '3',
      name: 'Filiale Marseille',
      phone: '+33 4 91 23 45 67',
      email: 'marseille@etaxi.com',
      status: 'PENDING',
      description: 'Filiale en cours de création à Marseille'
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSubsidiary, setCurrentSubsidiary] = useState<Subsidiary | null>(null);
  const [newSubsidiary, setNewSubsidiary] = useState<Partial<Subsidiary>>({
    name: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    status: 'ACTIVE',
    address: null
  });

  const handleAdd = () => {
    if (!newSubsidiary.name) {
      toast.error('Le nom est obligatoire');
      return;
    }

    const subsidiary: Subsidiary = {
      id: `new-${Date.now()}`,
      name: newSubsidiary.name || '',
      phone: newSubsidiary.phone,
      email: newSubsidiary.email,
      website: newSubsidiary.website,
      description: newSubsidiary.description,
      address: newSubsidiary.address || null,
      status: newSubsidiary.status as 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ARCHIVED'
    };

    setSubsidiaries([...subsidiaries, subsidiary]);
    setNewSubsidiary({
      name: '',
      phone: '',
      email: '',
      website: '',
      description: '',
      status: 'ACTIVE',
      address: null
    });
    setIsAddDialogOpen(false);
    toast.success('Filiale ajoutée avec succès!');
  };

  const handleEdit = (subsidiary: Subsidiary) => {
    setCurrentSubsidiary(subsidiary);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!currentSubsidiary) return;

    setSubsidiaries(prev => 
      prev.map(sub => sub.id === currentSubsidiary.id ? currentSubsidiary : sub)
    );
    setIsEditDialogOpen(false);
    toast.success('Filiale mise à jour!');
  };

  const handleDelete = (id: string) => {
    setSubsidiaries(prev => prev.filter(sub => sub.id !== id));
    toast.success('Filiale supprimée!');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'INACTIVE':
        return <Badge variant="outline" className="text-gray-500">Inactive</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-400">En attente</Badge>;
      case 'ARCHIVED':
        return <Badge variant="destructive">Archivée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderSubsidiaryForm = (subsidiary: Partial<Subsidiary>, setSubsidiary: React.Dispatch<React.SetStateAction<any>>) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Nom de la filiale</Label>
        <Input
          value={subsidiary.name || ''}
          onChange={(e) => setSubsidiary({...subsidiary, name: e.target.value})}
          placeholder="Nom de la filiale"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Téléphone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              value={subsidiary.phone || ''}
              onChange={(e) => setSubsidiary({...subsidiary, phone: e.target.value})}
              placeholder="Téléphone"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              value={subsidiary.email || ''}
              onChange={(e) => setSubsidiary({...subsidiary, email: e.target.value})}
              placeholder="Email"
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Site web</Label>
        <div className="relative">
          <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            value={subsidiary.website || ''}
            onChange={(e) => setSubsidiary({...subsidiary, website: e.target.value})}
            placeholder="Site web"
            className="pl-10"
          />
        </div>
      </div>

      <AddressInput
        label="Adresse"
        value={subsidiary.address}
        onChange={(address) => setSubsidiary({...subsidiary, address})}
      />

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={subsidiary.description || ''}
          onChange={(e) => setSubsidiary({...subsidiary, description: e.target.value})}
          placeholder="Description de la filiale"
          rows={3}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">Gestion des Filiales</h2>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-etaxi-yellow hover:bg-yellow-500 text-black">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une filiale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle filiale</DialogTitle>
            </DialogHeader>
            {renderSubsidiaryForm(newSubsidiary, setNewSubsidiary)}
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAdd} className="bg-etaxi-yellow hover:bg-yellow-500 text-black">
                Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-etaxi-yellow" />
              <div>
                <p className="text-sm text-muted-foreground">Total Filiales</p>
                <p className="text-2xl font-bold">{subsidiaries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Badge className="h-5 bg-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Actives</p>
                <p className="text-2xl font-bold">
                  {subsidiaries.filter(s => s.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Badge className="h-5 bg-yellow-400" />
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">
                  {subsidiaries.filter(s => s.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Badge className="h-5 bg-gray-400" />
              <div>
                <p className="text-sm text-muted-foreground">Inactives/Archivées</p>
                <p className="text-2xl font-bold">
                  {subsidiaries.filter(s => s.status === 'INACTIVE' || s.status === 'ARCHIVED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des filiales */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des filiales</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subsidiaries.map((subsidiary) => (
                <TableRow key={subsidiary.id}>
                  <TableCell className="font-medium">
                    {subsidiary.name}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1 text-gray-400" />
                        <span className="text-sm">{subsidiary.email || '—'}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1 text-gray-400" />
                        <span className="text-sm">{subsidiary.phone || '—'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {subsidiary.address ? (
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">
                          {subsidiary.address.street}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {subsidiary.address.postalCode} {subsidiary.address.city}, {subsidiary.address.country}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Non définie</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(subsidiary.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(subsidiary)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:text-red-700"
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

      {/* Dialog de modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier la filiale</DialogTitle>
          </DialogHeader>
          {currentSubsidiary && renderSubsidiaryForm(
            currentSubsidiary,
            setCurrentSubsidiary as React.Dispatch<React.SetStateAction<any>>
          )}
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdate} className="bg-etaxi-yellow hover:bg-yellow-500 text-black">
              Mettre à jour
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
