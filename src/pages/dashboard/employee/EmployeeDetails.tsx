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
import { AddressInput } from '../../../components/shared/AddressInput';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Clock, FilePlus, FileMinus, MessageSquare, ChevronDown, Building2, Search, Filter, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useEmployeeDetails } from '@/hooks/useEmployeeDetails';
import { Employee, Transport, Claim, UserAddressDto, AddressDto } from '@/types/employee';

export function EmployeeDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const enterpriseId = '674d7f9a-065f-4c4a-8a21-867336eb4ec4'; // À remplacer par une valeur dynamique si nécessaire

  const { employee, loading, updateEmployee } = useEmployeeDetails({ id: id!, enterpriseId });

  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState<Partial<Employee>>({});
  const [newAddress, setNewAddress] = useState<AddressDto | null>(null);
  const [newAddressLabel, setNewAddressLabel] = useState('');

  // Données temporaires pour l'historique des transports et réclamations (à remplacer par des appels API réels)
  const [transportHistory] = useState<Transport[]>([
    {
      id: 'tr1',
      date: '2025-05-28',
      time: '09:15',
      status: 'Complété',
      departureAddress: {
        street: '15 Rue du Louvre',
        cityId: 'paris',
        countryId: 'france',
        formattedAddress: '15 Rue du Louvre, 75001 Paris, France',
      },
      arrivalAddress: {
        street: '101 Avenue des Champs-Élysées',
        cityId: 'paris',
        countryId: 'france',
        formattedAddress: '101 Avenue des Champs-Élysées, 75008 Paris, France',
      },
      requestId: 'req123',
    },
    // Autres exemples similaires...
  ]);

  const [claimsHistory] = useState<Claim[]>([
    {
      id: 'claim1',
      type: 'complaint',
      subject: 'Retard du chauffeur',
      description: 'Le chauffeur est arrivé 30 minutes en retard pour ma course du matin',
      status: 'resolved',
      createdAt: '2024-01-15T10:30:00Z',
      response: 'Nous nous excusons pour ce retard. Le chauffeur a été sensibilisé.',
    },
    // Autres exemples similaires...
  ]);

  // Claims pagination et filtrage
  const [currentClaimsPage, setCurrentClaimsPage] = useState(1);
  const [claimsPerPage] = useState(3);
  const [claimsSearchTerm, setClaimsSearchTerm] = useState('');
  const [claimsTypeFilter, setClaimsTypeFilter] = useState<string>('all');
  const [claimsStatusFilter, setClaimsStatusFilter] = useState<string>('all');

  const subsidiaries = [
    { id: 'b375234c-3be2-4497-af21-5a5b09a2187d', name: 'lo9ma' },
    // Ajouter d'autres filiales si nécessaire
  ];

  const handleSave = async () => {
    try {
      await updateEmployee(editedEmployee);
      setIsEditing(false);
    } catch (error) {
      // L'erreur est déjà gérée par le hook via toast
    }
  };

  const handleAddAddress = () => {
    if (!newAddress || !newAddressLabel.trim()) {
      toast.error('Veuillez remplir le libellé et l\'adresse');
      return;
    }

    const addressWithLabel: UserAddressDto = {
      address: {
        ...newAddress,
        addressType: 'CUSTOM',
      },
      isDefault: false,
      label: newAddressLabel,
    };

    const updatedAddresses = [...(editedEmployee.addresses || employee.addresses || []), addressWithLabel];
    setEditedEmployee({
      ...editedEmployee,
      addresses: updatedAddresses,
    });
    setNewAddress(null);
    setNewAddressLabel('');
    toast.success('Adresse ajoutée avec succès');
  };

  const handleRemoveAddress = (addressId: string) => {
    const updatedAddresses = (editedEmployee.addresses || employee.addresses || []).filter(
      (addr) => addr.address.placeId !== addressId && addr.address.street !== addressId
    );
    setEditedEmployee({
      ...editedEmployee,
      addresses: updatedAddresses,
    });
    toast.success('Adresse supprimée');
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
      case 'ADMIN_FILIAL': return 'Administrateur de filiale';
      case 'MANAGER': return 'Manager';
      case 'EMPLOYEE': return 'Employé';
      default: return role;
    }
  };

  const isManager = employee?.roles?.includes('ADMIN_FILIAL');

  // Filtrer les réclamations
  const filteredClaims = claimsHistory.filter(claim => {
    const matchesSearch = claim.subject.toLowerCase().includes(claimsSearchTerm.toLowerCase()) || 
                         claim.description.toLowerCase().includes(claimsSearchTerm.toLowerCase());
    const matchesType = claimsTypeFilter === 'all' || claim.type === claimsTypeFilter;
    const matchesStatus = claimsStatusFilter === 'all' || claim.status === claimsStatusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Paginer les réclamations
  const indexOfLastClaim = currentClaimsPage * claimsPerPage;
  const indexOfFirstClaim = indexOfLastClaim - claimsPerPage;
  const currentClaims = filteredClaims.slice(indexOfFirstClaim, indexOfLastClaim);
  const totalClaimsPages = Math.ceil(filteredClaims.length / claimsPerPage);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!employee) {
    return <div>Employé non trouvé</div>;
  }

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
        
        <h2 className="text-2xl font-bold">{employee.fullName}</h2>
        
        <Badge variant={employee.status === 'ENABLED' ? 'default' : 'secondary'}>
          {employee.status === 'ENABLED' ? 'Actif' : 'Inactif'}
        </Badge>
        
        {!isEditing ? (
          <Button 
            className="ml-auto bg-etaxi-yellow hover:bg-yellow-500 text-black"
            onClick={() => {
              setIsEditing(true);
              setEditedEmployee({
                firstName: employee.firstName,
                lastName: employee.lastName,
                phone: employee.phone,
                subsidiaryId: employee.subsidiaryId,
                roleIds: employee.roleIds,
                addresses: employee.addresses,
              });
            }}
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
                  <Label>Prénom</Label>
                  <Input
                    value={isEditing ? editedEmployee.firstName || '' : employee.firstName || ''}
                    onChange={(e) => setEditedEmployee({...editedEmployee, firstName: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input
                    value={isEditing ? editedEmployee.lastName || '' : employee.lastName || ''}
                    onChange={(e) => setEditedEmployee({...editedEmployee, lastName: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={employee.email}
                      disabled
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={isEditing ? editedEmployee.phone || '' : employee.phone || ''}
                      onChange={(e) => setEditedEmployee({...editedEmployee, phone: e.target.value})}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Rôles</Label>
                  {isEditing ? (
                    <Select
                      value={editedEmployee.roleIds?.[0] || ''}
                      onValueChange={(value) => setEditedEmployee({...editedEmployee, roleIds: [value]})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN_FILIAL">Administrateur de filiale</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="EMPLOYEE">Employé</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-2 border rounded">
                      {employee.roles?.map((role) => (
                        <Badge key={role} className="bg-blue-100 text-blue-800 mr-1">
                          {getRoleText(role)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Filiale</Label>
                  {isEditing ? (
                    <Select
                      value={editedEmployee.subsidiaryId || ''}
                      onValueChange={(value) => setEditedEmployee({...editedEmployee, subsidiaryId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {subsidiaries.map((subsidiary) => (
                          <SelectItem key={subsidiary.id} value={subsidiary.id}>
                            {subsidiary.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center space-x-2 p-2 border rounded">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{employee.subsidiary?.name || 'Non défini'}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Manager</Label>
                  <div className="text-sm text-muted-foreground">
                    Cet employé a-t-il des responsabilités managériales ?
                  </div>
                </div>
                <Switch
                  checked={isManager}
                  disabled
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="addresses" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Adresses enregistrées ({(isEditing ? editedEmployee.addresses : employee.addresses)?.length || 0})</span>
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
                        street: '',
                        formattedAddress: '',
                        addressType: 'CUSTOM',
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
                          placeholder="Ex: Custom, Autre, etc."
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
              
              {(isEditing ? editedEmployee.addresses : employee.addresses)?.length > 0 ? (
                <div className="space-y-4">
                  {(isEditing ? editedEmployee.addresses : employee.addresses)?.map((address: UserAddressDto) => (
                    <div key={address.address.placeId || address.address.street} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-etaxi-yellow mr-2 mt-0.5" />
                          <div>
                            {address.label && (
                              <span className="inline-block px-2 py-0.5 bg-etaxi-yellow/20 text-xs rounded mb-1">
                                {address.label}
                              </span>
                            )}
                            <p className="font-medium">{address.address.street}</p>
                            <p className="text-sm text-muted-foreground">
                              {address.address.formattedAddress}
                            </p>
                            {address.address.latitude && address.address.longitude && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Coordonnées: {address.address.latitude.toFixed(6)}, {address.address.longitude.toFixed(6)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {isEditing && address.address.addressType === 'CUSTOM' ? (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveAddress(address.address.placeId || address.address.street)}
                          >
                            Supprimer
                          </Button>
                        ) : (
                          address.isDefault && (
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
                            <p className="text-xs text-muted-foreground">{transport.departureAddress.formattedAddress}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="text-xs text-muted-foreground">{transport.arrivalAddress.formattedAddress}</p>
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