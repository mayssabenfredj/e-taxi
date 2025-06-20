import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
  Car,
  X,
  AlertTriangle,
  Home,
  Briefcase
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
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Mock data
  const [request, setRequest] = useState<TransportRequest>({
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
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'dispatched': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      case 'in_progress': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
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
      navigate(`/transport/${id}/group-dispatch`);
    } else {
      navigate(`/transport/${id}/dispatch`);
    }
  };

  const handleApprove = () => {
    setRequest(prev => ({...prev, status: 'approved'}));
    toast.success('Demande approuvée avec succès');
  };

  const handleCancel = () => {
    setRequest(prev => ({...prev, status: 'cancelled'}));
    toast.success('Demande annulée');
    setShowCancelDialog(false);
  };

  // Vérifier si la demande peut être annulée (30 minutes avant le départ)
  const canCancel = () => {
    if (request.status === 'cancelled' || request.status === 'completed') {
      return false;
    }
    
    const scheduledTime = new Date(request.scheduledDate).getTime();
    const currentTime = new Date().getTime();
    const thirtyMinutesInMs = 30 * 60 * 1000;
    
    return currentTime < (scheduledTime - thirtyMinutesInMs);
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
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/transport/individual')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Retour</span>
          </Button>
          
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Car className="h-5 w-5 text-etaxi-yellow flex-shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold truncate">
              <span className="hidden sm:inline">Détails - </span>{request.reference}
            </h2>
            <Badge className={getStatusColor(request.status)}>
              {getStatusLabel(request.status)}
            </Badge>
          </div>
        </div>

        {/* Action Buttons - Responsive */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {(request.status === 'pending' || request.status === 'approved') && (
            <Button variant="outline\" size="sm\" onClick={handleEdit} className="flex-1 sm:flex-none">
              <Edit className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline">Modifier</span>
            </Button>
          )}
          
          {request.status === 'pending' && (
            <Button 
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
              onClick={handleApprove}
            >
              <span className="hidden sm:inline">Approuver</span>
              <span className="sm:hidden">✓</span>
            </Button>
          )}
          
          {(request.status === 'approved' || request.status === 'pending') && (
            <Button
              size="sm"
              className="bg-etaxi-yellow hover:bg-yellow-500 text-black flex-1 sm:flex-none"
              onClick={handleDispatch}
            >
              <Navigation className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline">Dispatcher</span>
            </Button>
          )}
          
          {canCancel() && (
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex-1 sm:flex-none">
                  <X className="mr-1 h-3 w-3" />
                  <span className="hidden sm:inline">Annuler</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="mx-4">
                <AlertDialogHeader>
                  <AlertDialogTitle>Annuler la demande</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir annuler cette demande de transport ? 
                    Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Retour</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
                    Confirmer l'annulation
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Content - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Request Information - Compact */}
        <Card className="bg-card border-border">
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

        {/* Passengers - Optimized for mobile */}
        <Card className="lg:col-span-3 bg-card border-border">
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
                      <MapPin className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="font-medium flex-1 truncate">{departure}</span>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">{passengers.length}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 ml-2 sm:ml-6">
                      {passengers.map((passenger) => (
                        <div key={passenger.id} className="border rounded p-2 text-xs bg-card">
                          <div className="font-medium mb-1 truncate">{passenger.name}</div>
                          
                          <div className="space-y-1 text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{passenger.phone}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{passenger.email}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 pt-2 border-t">
                            <div className="flex items-center space-x-1 text-red-600 mb-1">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="font-medium text-xs">Vers:</span>
                            </div>
                            <p className="text-xs bg-red-50 dark:bg-red-950/20 p-1 rounded border border-red-200 dark:border-red-800 truncate">
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