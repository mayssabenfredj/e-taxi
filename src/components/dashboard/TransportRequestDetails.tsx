import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  Edit, 
  Navigation, 
  Users, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  Clock,
  FileText,
  Car
} from 'lucide-react';
import { toast } from 'sonner';

interface Passenger {
  id: string;
  name: string;
  phone: string;
  email: string;
  departureAddress: string;
  arrivalAddress: string;
}

interface TransportRequest {
  id: string;
  reference: string;
  type: 'immediate' | 'scheduled';
  requestType: 'private' | 'public';
  status: 'pending' | 'approved' | 'dispatched' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  requestedBy: string;
  enterprise: string;
  subsidiary?: string;
  passengers: Passenger[];
  note?: string;
  createdAt: string;
}

export function TransportRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data
  const [request] = useState<TransportRequest>({
    id: '1',
    reference: 'TR-2024-001',
    type: 'scheduled',
    requestType: 'public',
    status: 'pending',
    scheduledDate: '2024-01-15 09:00',
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
        arrivalAddress: 'Aéroport Charles de Gaulle, 95700 Roissy'
      },
      {
        id: '2',
        name: 'Marie Martin',
        phone: '+33 6 98 76 54 32',
        email: 'marie.martin@techcorp.fr',
        departureAddress: 'Siège social - 15 Rue du Louvre, 75001 Paris',
        arrivalAddress: 'Aéroport Charles de Gaulle, 95700 Roissy'
      },
      {
        id: '3',
        name: 'Pierre Durand',
        phone: '+33 7 11 22 33 44',
        email: 'pierre.durand@techcorp.fr',
        departureAddress: 'La Défense, 92800 Puteaux',
        arrivalAddress: 'Gare de Lyon, 75012 Paris'
      },
      {
        id: '4',
        name: 'Sophie Lefebvre',
        phone: '+33 6 45 67 89 01',
        email: 'sophie.lefebvre@techcorp.fr',
        departureAddress: 'La Défense, 92800 Puteaux',
        arrivalAddress: 'Gare de Lyon, 75012 Paris'
      },
      {
        id: '5',
        name: 'Marc Rousseau',
        phone: '+33 6 11 22 33 44',
        email: 'marc.rousseau@techcorp.fr',
        departureAddress: 'Opéra, 75009 Paris',
        arrivalAddress: 'Centre de conférences - 101 Avenue des Champs-Élysées, 75008 Paris'
      }
    ],
    note: 'Transport pour réunion client importante',
    createdAt: '2024-01-10 14:30'
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'dispatched': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'dispatched': return 'Dispatché';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const handleEdit = () => {
    navigate(`/transport/${id}/edit`);
  };

  const handleDispatch = () => {
    if (request.passengers.length > 1) {
      navigate(`/transport/${id}/groupe-dispatch`);
    } else {
      navigate(`/transport/${id}/dispatch`);
    }
  };

  const handleApprove = () => {
    toast.success('Demande approuvée avec succès');
  };

  const handleCancel = () => {
    toast.success('Demande annulée');
  };

  // Group passengers by departure address for better visualization
  const passengersByDeparture = request.passengers.reduce((groups, passenger) => {
    const departure = passenger.departureAddress;
    if (!groups[departure]) {
      groups[departure] = [];
    }
    groups[departure].push(passenger);
    return groups;
  }, {} as Record<string, Passenger[]>);

  return (
    <div className="space-y-4 max-w-7xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/transport')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          
          <div className="flex items-center space-x-2">
            <Car className="h-5 w-5 text-etaxi-yellow" />
            <h2 className="text-xl font-bold">Détails - {request.reference}</h2>
            <Badge className={getStatusColor(request.status)}>
              {getStatusLabel(request.status)}
            </Badge>
          </div>
        </div>

        {/*<div className="flex items-center space-x-2">
          {(request.status === 'pending' || request.status === 'approved') && (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="mr-1 h-3 w-3" />
              Modifier
            </Button>
          )}
          
          {request.status === 'pending' && (
            <Button 
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleApprove}
            >
              Approuver
            </Button>
          )}
          
          {(request.status === 'approved' || request.status === 'pending') && (
            <Button
              size="sm"
              className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
              onClick={handleDispatch}
            >
              <Navigation className="mr-1 h-3 w-3" />
              Dispatcher
            </Button>
          )}
          
          {(request.status === 'pending' || request.status === 'approved') && (
            <Button variant="destructive" size="sm" onClick={handleCancel}>
              Annuler
            </Button>
          )}
        </div>*/}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Request Information - Compact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <FileText className="h-4 w-4" />
              <span>Informations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <div className="flex space-x-1 mt-1">
                <Badge variant={request.requestType === 'private' ? 'default' : 'secondary'} className="text-xs">
                  {request.requestType === 'private' ? 'Privé' : 'Public'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {request.type === 'immediate' ? 'Immédiat' : 'Programmé'}
                </Badge>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <div className="flex items-center space-x-1 mt-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs">{new Date(request.scheduledDate).toLocaleString('fr-FR')}</span>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground">Demandeur</p>
              <p className="text-xs font-medium">{request.requestedBy}</p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground">Entreprise</p>
              <div>
                <p className="text-xs font-medium">{request.enterprise}</p>
                {request.subsidiary && (
                  <p className="text-xs text-muted-foreground">{request.subsidiary}</p>
                )}
              </div>
            </div>
            
            {request.note && (
              <div>
                <p className="text-xs text-muted-foreground">Note</p>
                <p className="text-xs bg-muted/50 p-2 rounded mt-1">{request.note}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Passengers - Optimized for space */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">Passagers ({request.passengers.length})</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {Object.entries(passengersByDeparture).map(([departure, passengers]) => (
                  <div key={departure} className="space-y-2">
                    <div className="flex items-center space-x-2 p-2 bg-muted rounded text-sm">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <span className="font-medium flex-1">{departure}</span>
                      <Badge variant="secondary" className="text-xs">{passengers.length}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 ml-6">
                      {passengers.map((passenger) => (
                        <div key={passenger.id} className="border rounded p-2 text-xs">
                          <div className="font-medium mb-1">{passenger.name}</div>
                          
                          <div className="space-y-1 text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{passenger.phone}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{passenger.email}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 pt-2 border-t">
                            <div className="flex items-center space-x-1 text-red-600 mb-1">
                              <MapPin className="h-3 w-3" />
                              <span className="font-medium">Vers:</span>
                            </div>
                            <p className="text-xs bg-red-50 p-1 rounded border border-red-200 truncate">
                              {passenger.arrivalAddress}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
