import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddressInput } from '../shared/AddressInput';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Clock, FilePlus, FileMinus, MessageSquare, ChevronDown, Building2, Search, Filter, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

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

interface Claim {
  id: string;
  type: 'complaint' | 'suggestion' | 'technical';
  subject: string;
  description: string;
  status: 'pending' | 'resolved' | 'closed';
  createdAt: string;
  response?: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'employee' | 'manager' | 'admin';
  isManager: boolean;
  status: 'active' | 'inactive';
  subsidiary: string;
  addresses: Address[];
  defaultAddressId?: string;
}

export function EmployeeDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<Employee>({
    id: id || '1',
    name: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    phone: '+33 6 12 34 56 78',
    role: 'employee',
    isManager: false,
    status: 'active',
    subsidiary: 'TechCorp Paris',
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
        label: 'Travail',
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

  const [transportHistory] = useState<Transport[]>([
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

  const [claimsHistory] = useState<Claim[]>([
    {
      id: 'claim1',
      type: 'complaint',
      subject: 'Retard du chauffeur',
      description: 'Le chauffeur est arrivé 30 minutes en retard pour ma course du matin',
      status: 'resolved',
      createdAt: '2024-01-15 10:30',
      response: 'Nous nous excusons pour ce retard. Le chauffeur a été sensibilisé et des mesures ont été prises.'
    },
    {
      id: 'claim2',
      type: 'suggestion',
      subject: 'Amélioration de l\'application',
      description: 'Il serait bien d\'avoir une notification quand le taxi arrive',
      status: 'pending',
      createdAt: '2024-01-10 14:20'
    },
    {
      id: 'claim3',
      type: 'technical',
      subject: 'Problème de géolocalisation',
      description: 'La position du taxi n\'est pas précise sur la carte',
      status: 'pending',
      createdAt: '2024-01-05 09:45'
    },
    {
      id: 'claim4',
      type: 'complaint',
      subject: 'Chauffeur impoli',
      description: 'Le chauffeur a été très désagréable pendant tout le trajet',
      status: 'resolved',
      createdAt: '2023-12-20 16:30',
      response: 'Nous avons pris note de votre plainte et avons discuté avec le chauffeur concerné. Nous vous présentons nos excuses pour cette expérience désagréable.'
    },
    {
      id: 'claim5',
      type: 'suggestion',
      subject: 'Option de pourboire',
      description: 'Il serait pratique d\'avoir une option pour laisser un pourboire dans l\'application',
      status: 'closed',
      createdAt: '2023-12-15 11:20',
      response: 'Merci pour votre suggestion. Nous travaillons actuellement sur cette fonctionnalité qui sera disponible dans une prochaine mise à jour.'
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState<Employee>({...employee});
  const [newAddress, setNewAddress] = useState<Address | null>(null);
  const [newAddressLabel, setNewAddressLabel] = useState('');
  
  // Claims pagination and filtering
  const [currentClaimsPage, setCurrentClaimsPage] = useState(1);
  const [claimsPerPage] = useState(3);
  const [claimsSearchTerm, setClaimsSearchTerm] = useState('');
  const [claimsTypeFilter, setClaimsTypeFilter] = useState<string>('all');
  const [claimsStatusFilter, setClaimsStatusFilter] = useState<string>('all');

  const subsidiaries = [
    { id: '1', name: 'TechCorp Paris' },
    { id: '2', name: 'TechCorp Lyon' },
    { id: '3', name: 'TechCorp Marseille' }
  ];

  const handleSave = () => {
    setEmployee(editedEmployee);
    setIsEditing(false);
    toast.success('Informations de l\'employé mises à jour');
  };

  const handleAddAddress = () => {
    if (!newAddress || !newAddressLabel.trim()) {
      toast.error('Veuillez remplir le libellé et l\'adresse');
      return;
    }
    
    const addressWithLabel = {
      ...newAddress,
      id: `new-${Date.now()}`,
      label: newAddressLabel
    };
    
    const updatedAddresses = [...editedEmployee.addresses, addressWithLabel];
    setEditedEmployee({
      ...editedEmployee,
      addresses: updatedAddresses
    });
    setNewAddress(null);
    setNewAddressLabel('');
    toast.success('Adresse ajoutée avec succès');
  };

  const handleRemoveAddress = (addressId: string) => {
    const updatedAddresses = editedEmployee.addresses.filter(addr => addr.id !== addressId);
    
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

  const handleViewTransportRequest = (requestId: string) => {
    navigate(`/transport/${requestId}`);
  };

  const getClaimTypeColor = (type: string) => {
    switch (type) {
      case 'complaint': return 'bg-red-100 text-red-800';
      case 'suggestion': return 'bg-blue-100 text-blue-800';
      case 'technical': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClaimStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'manager': return 'Manager';
      case 'employee': return 'Employé';
      default: return role;
    }
  };

  // Filter claims
  const filteredClaims = claimsHistory.filter(claim => {
    const matchesSearch = claim.subject.toLowerCase().includes(claimsSearchTerm.toLowerCase()) || 
                         claim.description.toLowerCase().includes(claimsSearchTerm.toLowerCase());
    const matchesType = claimsTypeFilter === 'all' || claim.type === claimsTypeFilter;
    const matchesStatus = claimsStatusFilter === 'all' || claim.status === claimsStatusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Paginate claims
  const indexOfLastClaim = currentClaimsPage * claimsPerPage;
  const indexOfFirstClaim = indexOfLastClaim - claimsPerPage;
  const currentClaims = filteredClaims.slice(indexOfFirstClaim, indexOfLastClaim);
  const totalClaimsPages = Math.ceil(filteredClaims.length / claimsPerPage);

  return (
    <div className="space-y-6 max-w-6xl">
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
          <TabsTrigger value="history">Historique transport</TabsTrigger>
          <TabsTrigger value="claims">Réclamations</TabsTrigger>
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

                <div className="space-y-2">
                  <Label>Rôle</Label>
                  {isEditing ? (
                    <Select
                      value={editedEmployee.role}
                      onValueChange={(value: 'employee' | 'manager' | 'admin') => 
                        setEditedEmployee({...editedEmployee, role: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employé</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-2 border rounded">
                      <Badge className="bg-blue-100 text-blue-800">
                        {getRoleText(employee.role)}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Manager</Label>
                    <div className="text-sm text-muted-foreground">
                      Cet employé a-t-il des responsabilités managériales ?
                    </div>
                  </div>
                  <Switch
                    checked={editedEmployee.isManager}
                    onCheckedChange={(checked) => 
                      setEditedEmployee({...editedEmployee, isManager: checked})
                    }
                  />
                </div>
              )}

              {!isEditing && employee.isManager && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Badge className="bg-blue-100 text-blue-800">
                    Responsabilités managériales
                  </Badge>
                </div>
              )}

              <div className="space-y-2">
                <Label>Filiale</Label>
                {isEditing ? (
                  <Select
                    value={editedEmployee.subsidiary}
                    onValueChange={(value) => 
                      setEditedEmployee({...editedEmployee, subsidiary: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subsidiaries.map((subsidiary) => (
                        <SelectItem key={subsidiary.id} value={subsidiary.name}>
                          {subsidiary.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center space-x-2 p-2 border rounded">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{employee.subsidiary}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Adresses par défaut</CardTitle>
            </CardHeader>
            <CardContent>
              {employee.addresses.length > 0 ? (
                <div className="space-y-3">
                  {employee.addresses.slice(0, 2).map((address) => (
                    <div key={address.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-etaxi-yellow mr-2 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="inline-block px-2 py-0.5 bg-etaxi-yellow/20 text-xs rounded">
                              {address.label}
                            </span>
                            {employee.defaultAddressId === address.id && (
                              <Badge className="bg-etaxi-yellow text-black text-xs">Par défaut</Badge>
                            )}
                          </div>
                          <p className="font-medium">{address.street}</p>
                          <p className="text-sm text-muted-foreground">
                            {address.postalCode} {address.city}, {address.country}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
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
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Adresses enregistrées ({(isEditing ? editedEmployee.addresses : employee.addresses).length})</span>
              </CardTitle>
              {isEditing && (
                <div>
                  {newAddress ? (
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setNewAddress(null);
                          setNewAddressLabel('');
                        }}
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
                          value={newAddressLabel}
                          onChange={(e) => setNewAddressLabel(e.target.value)}
                          placeholder="Ex: Domicile, Travail, etc."
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
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Historique de transport ({transportHistory.length})</span>
              </CardTitle>
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
                      <TableHead>Actions</TableHead>
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
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewTransportRequest(transport.requestId)}
                            title="Voir les détails de la demande"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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

        <TabsContent value="claims" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Historique des réclamations ({claimsHistory.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher dans les réclamations..."
                    value={claimsSearchTerm}
                    onChange={(e) => setClaimsSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={claimsTypeFilter} onValueChange={setClaimsTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="complaint">Plaintes</SelectItem>
                      <SelectItem value="suggestion">Suggestions</SelectItem>
                      <SelectItem value="technical">Techniques</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={claimsStatusFilter} onValueChange={setClaimsStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="resolved">Résolu</SelectItem>
                      <SelectItem value="closed">Fermé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Claims List */}
              {filteredClaims.length > 0 ? (
                <div className="space-y-4">
                  {currentClaims.map((claim) => (
                    <Collapsible key={claim.id} className="border rounded-lg">
                      <CollapsibleTrigger className="w-full text-left p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge className={getClaimTypeColor(claim.type)}>
                                {claim.type === 'complaint' ? 'Plainte' : 
                                 claim.type === 'suggestion' ? 'Suggestion' : 'Technique'}
                              </Badge>
                              <Badge className={getClaimStatusColor(claim.status)}>
                                {claim.status === 'pending' ? 'En attente' :
                                 claim.status === 'resolved' ? 'Résolu' : 'Fermé'}
                              </Badge>
                            </div>
                            <h4 className="font-medium">{claim.subject}</h4>
                            <p className="text-sm text-muted-foreground truncate max-w-md">
                              {claim.description.substring(0, 100)}
                              {claim.description.length > 100 ? '...' : ''}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              {new Date(claim.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-4 pt-0 border-t">
                          <div className="mb-3">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Description complète:</p>
                            <p className="text-sm">{claim.description}</p>
                          </div>
                          
                          {claim.response && (
                            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                              <p className="text-sm font-medium text-green-800 mb-1">Réponse:</p>
                              <p className="text-sm text-green-700">{claim.response}</p>
                            </div>
                          )}
                          
                          <div className="mt-3 text-xs text-muted-foreground">
                            Créé le {new Date(claim.createdAt).toLocaleString('fr-FR')}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>Aucune réclamation trouvée</p>
                </div>
              )}

              {/* Pagination */}
              {filteredClaims.length > 0 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentClaimsPage(prev => Math.max(prev - 1, 1))}
                        className={currentClaimsPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalClaimsPages }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={currentClaimsPage === i + 1}
                          onClick={() => setCurrentClaimsPage(i + 1)}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentClaimsPage(prev => Math.min(prev + 1, totalClaimsPages))}
                        className={currentClaimsPage === totalClaimsPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}