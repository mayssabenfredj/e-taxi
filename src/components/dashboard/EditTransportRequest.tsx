import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddressInput } from '../shared/AddressInput';
import { ArrowLeft, Save, User, Clock, Calendar, MapPin, Phone, Mail, Home, Briefcase, Plus, UserPlus, X } from 'lucide-react';
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

interface Passenger {
  id: string;
  name: string;
  phone: string;
  email: string;
  departureAddress: string;
  arrivalAddress: string;
  homeAddress?: string;
  workAddress?: string;
  isHomeToWork?: boolean;
}

interface TransportRequest {
  id: string;
  reference: string;
  type: 'immediate' | 'scheduled';
  requestType: 'private' | 'public';
  status: 'pending' | 'approved' | 'dispatched' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  scheduledTime: string;
  requestedBy: string;
  enterprise: string;
  subsidiary?: string;
  passengers: Passenger[];
  note?: string;
  createdAt: string;
  isHomeToWorkTrip?: boolean;
}

export function EditTransportRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [request, setRequest] = useState<TransportRequest | null>(null);
  const [isHomeToWorkTrip, setIsHomeToWorkTrip] = useState(true);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [note, setNote] = useState('');
  const [transportType, setTransportType] = useState<'private' | 'public'>('public');
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [showAddPassengerForm, setShowAddPassengerForm] = useState(false);
  const [newPassenger, setNewPassenger] = useState<Partial<Passenger>>({
    name: '',
    phone: '',
    email: '',
    departureAddress: '',
    arrivalAddress: ''
  });

  // Simuler le chargement des données
  useEffect(() => {
    const loadRequest = () => {
      // Données fictives pour la démonstration
      const mockRequest: TransportRequest = {
        id: id || '1',
        reference: 'TR-2024-001',
        type: 'scheduled',
        requestType: 'public',
        status: 'pending',
        scheduledDate: '2024-01-15',
        scheduledTime: '09:00',
        requestedBy: 'Marie Dubois',
        enterprise: 'TechCorp SARL',
        subsidiary: 'TechCorp Paris',
        passengers: [
          {
            id: '1',
            name: 'Jean Dupont',
            phone: '+33 6 12 34 56 78',
            email: 'jean.dupont@techcorp.fr',
            departureAddress: 'Siège social - 15 Rue du Louvre, 75001 Paris',
            arrivalAddress: 'Aéroport Charles de Gaulle, 95700 Roissy',
            homeAddress: '15 Rue du Louvre, 75001 Paris',
            workAddress: 'Siège social - 15 Rue du Louvre, 75001 Paris',
            isHomeToWork: true
          },
          {
            id: '2',
            name: 'Marie Martin',
            phone: '+33 6 98 76 54 32',
            email: 'marie.martin@techcorp.fr',
            departureAddress: 'Siège social - 15 Rue du Louvre, 75001 Paris',
            arrivalAddress: 'Aéroport Charles de Gaulle, 95700 Roissy',
            homeAddress: '25 Rue de Rivoli, 75004 Paris',
            workAddress: 'Siège social - 15 Rue du Louvre, 75001 Paris',
            isHomeToWork: true
          }
        ],
        note: 'Transport pour réunion client importante',
        createdAt: '2024-01-10 14:30',
        isHomeToWorkTrip: true
      };

      setRequest(mockRequest);
      setScheduledDate(mockRequest.scheduledDate);
      setScheduledTime(mockRequest.scheduledTime);
      setNote(mockRequest.note || '');
      setTransportType(mockRequest.requestType);
      setPassengers(mockRequest.passengers);
      setIsHomeToWorkTrip(mockRequest.isHomeToWorkTrip || true);
      setIsLoading(false);
    };

    // Simuler un délai de chargement
    setTimeout(loadRequest, 500);
  }, [id]);

  const handleSave = () => {
    if (!scheduledDate || !scheduledTime || passengers.length === 0) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Mise à jour de la demande
    if (request) {
      const updatedRequest = {
        ...request,
        scheduledDate,
        scheduledTime,
        requestType: transportType,
        note,
        passengers,
        isHomeToWorkTrip
      };

      // Ici, vous feriez l'appel API pour mettre à jour la demande
      console.log('Demande mise à jour:', updatedRequest);
      toast.success('Demande mise à jour avec succès');
      navigate(`/transport/${id}`);
    }
  };

  const handleCancel = () => {
    navigate(`/transport/${id}`);
  };

  const updatePassengerAddress = (passengerId: string, field: 'departureAddress' | 'arrivalAddress', value: string) => {
    setPassengers(prev => 
      prev.map(passenger => 
        passenger.id === passengerId 
          ? { ...passenger, [field]: value }
          : passenger
      )
    );
  };

  const handleToggleTripDirection = () => {
    setIsHomeToWorkTrip(!isHomeToWorkTrip);
    
    // Mettre à jour les adresses de tous les passagers
    setPassengers(prev => 
      prev.map(passenger => {
        // Inverser les adresses de départ et d'arrivée en fonction des adresses domicile/travail
        const departureAddress = !isHomeToWorkTrip ? passenger.homeAddress || passenger.departureAddress : passenger.workAddress || passenger.departureAddress;
        const arrivalAddress = !isHomeToWorkTrip ? passenger.workAddress || passenger.arrivalAddress : passenger.homeAddress || passenger.arrivalAddress;
        
        return {
          ...passenger,
          departureAddress,
          arrivalAddress,
          isHomeToWork: !isHomeToWorkTrip
        };
      })
    );
  };

  const handleAddPassenger = () => {
    if (!newPassenger.name || !newPassenger.phone) {
      toast.error('Veuillez remplir au moins le nom et le téléphone');
      return;
    }

    const passenger: Passenger = {
      id: `new-${Date.now()}`,
      name: newPassenger.name || '',
      phone: newPassenger.phone || '',
      email: newPassenger.email || '',
      departureAddress: newPassenger.departureAddress || '',
      arrivalAddress: newPassenger.arrivalAddress || '',
      isHomeToWork: isHomeToWorkTrip
    };

    setPassengers(prev => [...prev, passenger]);
    setNewPassenger({
      name: '',
      phone: '',
      email: '',
      departureAddress: '',
      arrivalAddress: ''
    });
    setShowAddPassengerForm(false);
    toast.success('Passager ajouté avec succès');
  };

  const handleRemovePassenger = (passengerId: string) => {
    setPassengers(prev => prev.filter(p => p.id !== passengerId));
    toast.success('Passager supprimé');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-etaxi-yellow"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center p-8">
        <p>Demande non trouvée</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/transport')}
          className="mt-4"
        >
          Retour aux demandes
        </Button>
      </div>
    );
  }

  const commonAddresses = [
    'Aéroport Charles de Gaulle, 95700 Roissy',
    'Gare de Lyon, 75012 Paris',
    'La Défense, 92800 Puteaux',
    'Opéra, 75009 Paris',
    'Châtelet-Les Halles, 75001 Paris',
    'Siège social - 15 Rue du Louvre, 75001 Paris',
    'Centre de conférences - 101 Avenue des Champs-Élysées, 75008 Paris'
  ];

  return (
    <div className="space-y-4 max-w-7xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/transport/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          
          <h2 className="text-xl font-bold">Modifier la demande - {request.reference}</h2>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
          >
            <Save className="mr-2 h-4 w-4" />
            Enregistrer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Informations générales */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>{isHomeToWorkTrip ? "Heure d'arrivée" : "Heure de départ"}</Label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Type de transport</Label>
              <Select
                value={transportType}
                onValueChange={(value: 'private' | 'public') => setTransportType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Privé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Direction de trajet */}
            <div className="flex items-center justify-between space-x-4 p-3 border rounded-md">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Direction du trajet</Label>
                <div className="text-sm text-muted-foreground">
                  {isHomeToWorkTrip 
                    ? "Domicile → Travail (heure d'arrivée)" 
                    : "Travail → Domicile (heure de départ)"}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Home className={`h-4 w-4 ${isHomeToWorkTrip ? 'text-etaxi-yellow' : 'text-muted-foreground'}`} />
                <Switch 
                  checked={!isHomeToWorkTrip}
                  onCheckedChange={handleToggleTripDirection}
                />
                <Briefcase className={`h-4 w-4 ${!isHomeToWorkTrip ? 'text-etaxi-yellow' : 'text-muted-foreground'}`} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ajouter une note..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Passagers */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Passagers ({passengers.length})</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAddPassengerForm(!showAddPassengerForm)}
              className="text-xs"
            >
              {showAddPassengerForm ? 'Annuler' : <><UserPlus className="h-3 w-3 mr-1" /> Ajouter</>}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {showAddPassengerForm && (
              <Card className="border-dashed mb-4">
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Nom complet</Label>
                      <Input
                        value={newPassenger.name}
                        onChange={(e) => setNewPassenger({...newPassenger, name: e.target.value})}
                        placeholder="Nom du passager"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Téléphone</Label>
                      <Input
                        value={newPassenger.phone}
                        onChange={(e) => setNewPassenger({...newPassenger, phone: e.target.value})}
                        placeholder="Numéro de téléphone"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        value={newPassenger.email}
                        onChange={(e) => setNewPassenger({...newPassenger, email: e.target.value})}
                        placeholder="Adresse email"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Adresse de départ</Label>
                      <Select
                        value={newPassenger.departureAddress}
                        onValueChange={(value) => setNewPassenger({...newPassenger, departureAddress: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une adresse" />
                        </SelectTrigger>
                        <SelectContent>
                          {commonAddresses.map((address) => (
                            <SelectItem key={address} value={address}>
                              {address}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Adresse d'arrivée</Label>
                      <Select
                        value={newPassenger.arrivalAddress}
                        onValueChange={(value) => setNewPassenger({...newPassenger, arrivalAddress: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une adresse" />
                        </SelectTrigger>
                        <SelectContent>
                          {commonAddresses.map((address) => (
                            <SelectItem key={address} value={address}>
                              {address}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddPassenger}
                      className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter le passager
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Passager</TableHead>
                  <TableHead>Départ</TableHead>
                  <TableHead>Arrivée</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {passengers.map((passenger) => (
                  <TableRow key={passenger.id}>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{passenger.name}</div>
                        <div className="text-xs text-muted-foreground">{passenger.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={passenger.departureAddress}
                        onValueChange={(value) => updatePassengerAddress(passenger.id, 'departureAddress', value)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {passenger.isHomeToWork && passenger.homeAddress && (
                            <SelectItem value={passenger.homeAddress}>
                              <div className="flex items-center">
                                <Home className="h-3 w-3 mr-1 text-etaxi-yellow" />
                                {passenger.homeAddress}
                              </div>
                            </SelectItem>
                          )}
                          {!passenger.isHomeToWork && passenger.workAddress && (
                            <SelectItem value={passenger.workAddress}>
                              <div className="flex items-center">
                                <Briefcase className="h-3 w-3 mr-1 text-etaxi-yellow" />
                                {passenger.workAddress}
                              </div>
                            </SelectItem>
                          )}
                          {commonAddresses.map((address) => (
                            <SelectItem key={address} value={address}>
                              {address}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={passenger.arrivalAddress}
                        onValueChange={(value) => updatePassengerAddress(passenger.id, 'arrivalAddress', value)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {!passenger.isHomeToWork && passenger.homeAddress && (
                            <SelectItem value={passenger.homeAddress}>
                              <div className="flex items-center">
                                <Home className="h-3 w-3 mr-1 text-etaxi-yellow" />
                                {passenger.homeAddress}
                              </div>
                            </SelectItem>
                          )}
                          {passenger.isHomeToWork && passenger.workAddress && (
                            <SelectItem value={passenger.workAddress}>
                              <div className="flex items-center">
                                <Briefcase className="h-3 w-3 mr-1 text-etaxi-yellow" />
                                {passenger.workAddress}
                              </div>
                            </SelectItem>
                          )}
                          {commonAddresses.map((address) => (
                            <SelectItem key={address} value={address}>
                              {address}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePassenger(passenger.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}