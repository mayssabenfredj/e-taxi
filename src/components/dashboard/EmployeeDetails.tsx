
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddressInput } from '../shared/AddressInput';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Clock, FilePlus, FileMinus } from 'lucide-react';
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

interface Transport {
  id: string;
  date: string;
  time: string;
  status: string;
  departureAddress: Address;
  arrivalAddress: Address;
  requestId: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  addresses: Address[];
  defaultAddressId?: string;
}

export function EmployeeDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Charger les données de l'employé (simulation)
  const [employee, setEmployee] = useState<Employee>({
    id: id || '1',
    name: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    phone: '+33 6 12 34 56 78',
    status: 'active',
    addresses: [
      {
        id: 'addr1',
        label: 'Domicile',
        street: '15 Rue du Louvre',
        city: 'Paris',
        postalCode: '75001',
        country: 'France',
        latitude: 48.8624,
        longitude: 2.3388
      },
      {
        id: 'addr2',
        label: 'Bureau',
        street: '101 Avenue des Champs-Élysées',
        city: 'Paris',
        postalCode: '75008',
        country: 'France',
        latitude: 48.8698,
        longitude: 2.3075
      }
    ],
    defaultAddressId: 'addr1'
  });

  // Historique des transports
  const [transportHistory, setTransportHistory] = useState<Transport[]>([
    {
      id: 'tr1',
      date: '2025-05-28',
      time: '09:15',
      status: 'Complété',
      departureAddress: employee.addresses[0],
      arrivalAddress: employee.addresses[1],
      requestId: 'req123'
    },
    {
      id: 'tr2',
      date: '2025-05-29',
      time: '18:30',
      status: 'Complété',
      departureAddress: employee.addresses[1],
      arrivalAddress: employee.addresses[0],
      requestId: 'req124'
    },
    {
      id: 'tr3',
      date: '2025-05-30',
      time: '09:00',
      status: 'Planifié',
      departureAddress: employee.addresses[0],
      arrivalAddress: employee.addresses[1],
      requestId: 'req125'
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState<Employee>({...employee});
  const [newAddress, setNewAddress] = useState<Address | null>(null);

  const handleSave = () => {
    setEmployee(editedEmployee);
    setIsEditing(false);
    toast.success('Informations de l\'employé mises à jour');
  };

  const handleAddAddress = () => {
    if (!newAddress) return;
    
    const updatedAddresses = [...editedEmployee.addresses, newAddress];
    setEditedEmployee({
      ...editedEmployee,
      addresses: updatedAddresses
    });
    setNewAddress(null);
    toast.success('Adresse ajoutée avec succès');
  };

  const handleRemoveAddress = (addressId: string) => {
    const updatedAddresses = editedEmployee.addresses.filter(addr => addr.id !== addressId);
    
    // Si c'était l'adresse par défaut, réinitialiser
    let updatedDefaultAddressId = editedEmployee.defaultAddressId;
    if (editedEmployee.defaultAddressId === addressId) {
      updatedDefaultAddressId = updatedAddresses.length > 0 ? updatedAddresses[0].id : undefined;
    }
    
    setEditedEmployee({
      ...editedEmployee,
      addresses: updatedAddresses,
      defaultAddressId: updatedDefaultAddressId
    });
    
    toast.success('Adresse supprimée');
  };

  const setDefaultAddress = (addressId: string) => {
    setEditedEmployee({
      ...editedEmployee,
      defaultAddressId: addressId
    });
    toast.success('Adresse par défaut mise à jour');
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* En-tête */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/employees')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        
        <h2 className="text-2xl font-bold">{employee.name}</h2>
        
        <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
          {employee.status === 'active' ? 'Actif' : 'Inactif'}
        </Badge>
        
        {!isEditing ? (
          <Button 
            className="ml-auto bg-etaxi-yellow hover:bg-yellow-500 text-black"
            onClick={() => setIsEditing(true)}
          >
            Modifier
          </Button>
        ) : (
          <div className="ml-auto space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
            <Button 
              className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
              onClick={handleSave}
            >
              Enregistrer
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="addresses">Adresses</TabsTrigger>
          <TabsTrigger value="history">Historique de transport</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom complet</Label>
                  <Input
                    value={isEditing ? editedEmployee.name : employee.name}
                    onChange={(e) => setEditedEmployee({...editedEmployee, name: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={isEditing ? editedEmployee.email : employee.email}
                      onChange={(e) => setEditedEmployee({...editedEmployee, email: e.target.value})}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={isEditing ? editedEmployee.phone : employee.phone}
                      onChange={(e) => setEditedEmployee({...editedEmployee, phone: e.target.value})}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Adresse par défaut</CardTitle>
            </CardHeader>
            <CardContent>
              {employee.defaultAddressId ? (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-etaxi-yellow mr-2 mt-0.5" />
                    <div>
                      {employee.addresses.find(addr => addr.id === employee.defaultAddressId)?.label && (
                        <span className="inline-block px-2 py-0.5 bg-etaxi-yellow/20 text-xs rounded mr-2">
                          {employee.addresses.find(addr => addr.id === employee.defaultAddressId)?.label}
                        </span>
                      )}
                      <p className="font-medium">
                        {employee.addresses.find(addr => addr.id === employee.defaultAddressId)?.street}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {employee.addresses.find(addr => addr.id === employee.defaultAddressId)?.postalCode}{' '}
                        {employee.addresses.find(addr => addr.id === employee.defaultAddressId)?.city},{' '}
                        {employee.addresses.find(addr => addr.id === employee.defaultAddressId)?.country}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Aucune adresse par défaut définie</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="addresses" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Adresses enregistrées</CardTitle>
              {isEditing && (
                <div>
                  {newAddress ? (
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setNewAddress(null)}
                      >
                        <FileMinus className="h-4 w-4 mr-1" />
                        Annuler
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleAddAddress}
                        className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
                      >
                        <FilePlus className="h-4 w-4 mr-1" />
                        Enregistrer
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => setNewAddress({ 
                        id: `new-${Date.now()}`,
                        label: '',
                        street: '',
                        city: '',
                        postalCode: '',
                        country: 'France'
                      })}
                    >
                      <FilePlus className="h-4 w-4 mr-1" />
                      Nouvelle adresse
                    </Button>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {newAddress && (
                <Card className="mb-4 border-dashed">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Libellé de l'adresse</Label>
                        <Input
                          value={newAddress.label}
                          onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                          placeholder="Ex: Domicile, Bureau, etc."
                        />
                      </div>
                      
                      <AddressInput
                        label="Adresse"
                        value={newAddress}
                        onChange={(address) => address && setNewAddress(address)}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {(isEditing ? editedEmployee.addresses : employee.addresses).length > 0 ? (
                <div className="space-y-4">
                  {(isEditing ? editedEmployee.addresses : employee.addresses).map((address) => (
                    <div key={address.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-etaxi-yellow mr-2 mt-0.5" />
                          <div>
                            {address.label && (
                              <span className="inline-block px-2 py-0.5 bg-etaxi-yellow/20 text-xs rounded mb-1">
                                {address.label}
                              </span>
                            )}
                            <p className="font-medium">{address.street}</p>
                            <p className="text-sm text-muted-foreground">
                              {address.postalCode} {address.city}, {address.country}
                            </p>
                            {address.latitude && address.longitude && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Coordonnées: {address.latitude.toFixed(6)}, {address.longitude.toFixed(6)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {isEditing ? (
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant={(isEditing ? editedEmployee.defaultAddressId : employee.defaultAddressId) === address.id 
                                ? 'default' 
                                : 'outline'}
                              className={(isEditing ? editedEmployee.defaultAddressId : employee.defaultAddressId) === address.id 
                                ? 'bg-etaxi-yellow hover:bg-yellow-500 text-black' 
                                : ''}
                              onClick={() => setDefaultAddress(address.id)}
                            >
                              Par défaut
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleRemoveAddress(address.id)}
                            >
                              Supprimer
                            </Button>
                          </div>
                        ) : (
                          (employee.defaultAddressId === address.id) && (
                            <Badge className="bg-etaxi-yellow text-black">Par défaut</Badge>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <MapPin className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>Aucune adresse enregistrée</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique de transport</CardTitle>
            </CardHeader>
            <CardContent>
              {transportHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Heure</TableHead>
                      <TableHead>Départ</TableHead>
                      <TableHead>Arrivée</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>ID Demande</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transportHistory.map((transport) => (
                      <TableRow key={transport.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                            {transport.date}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-500" />
                            {transport.time}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium">{transport.departureAddress.label}</span>
                            <p className="text-xs text-muted-foreground">{transport.departureAddress.street}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium">{transport.arrivalAddress.label}</span>
                            <p className="text-xs text-muted-foreground">{transport.arrivalAddress.street}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            transport.status === 'Complété' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }>
                            {transport.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono">{transport.requestId}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>Aucun historique de transport</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
