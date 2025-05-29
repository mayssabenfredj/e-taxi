
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Car, 
  Calendar, 
  Users, 
  MapPin, 
  Building, 
  Edit, 
  Navigation,
  Phone,
  Mail,
  Clock,
  FileText
} from 'lucide-react';

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
  passengersCount: number;
  note?: string;
  createdAt: string;
  passengers: Array<{
    id: string;
    name: string;
    phone: string;
    email: string;
    departureAddress: string;
    arrivalAddress: string;
  }>;
}

interface TransportRequestDetailsProps {
  request: TransportRequest;
  onEdit: () => void;
  onDispatch: () => void;
  onClose: () => void;
}

export function TransportRequestDetails({ request, onEdit, onDispatch, onClose }: TransportRequestDetailsProps) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{request.reference}</h2>
          <p className="text-muted-foreground">Détails de la demande de transport</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          {(request.status === 'pending' || request.status === 'approved') && (
            <>
              <Button variant="outline" onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
              <Button 
                className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
                onClick={onDispatch}
              >
                <Navigation className="mr-2 h-4 w-4" />
                Dispatcher
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Informations générales</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Statut</span>
              <Badge className={getStatusColor(request.status)}>
                {getStatusLabel(request.status)}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Type</span>
              <Badge variant={request.requestType === 'private' ? 'default' : 'secondary'}>
                {request.requestType === 'private' ? 'Privé' : 'Public'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Priorité</span>
              <Badge variant={request.type === 'immediate' ? 'destructive' : 'outline'}>
                {request.type === 'immediate' ? 'Immédiat' : 'Programmé'}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Date programmée:</strong> {new Date(request.scheduledDate).toLocaleString('fr-FR')}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Créé le:</strong> {new Date(request.createdAt).toLocaleString('fr-FR')}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Nombre de passagers:</strong> {request.passengersCount}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Demandeur:</strong> {request.requestedBy}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Entreprise:</strong> {request.enterprise}
                </span>
              </div>

              {request.subsidiary && (
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Filiale:</strong> {request.subsidiary}
                  </span>
                </div>
              )}
            </div>

            {request.note && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Note:</p>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                    {request.note}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Liste des passagers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Passagers ({request.passengers?.length || 0})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {request.passengers?.map((passenger, index) => (
                <div key={passenger.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{passenger.name}</h4>
                    <span className="text-xs text-muted-foreground">Passager {index + 1}</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{passenger.phone}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span>{passenger.email}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-green-700">Départ</p>
                        <p className="text-sm">{passenger.departureAddress}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-3 w-3 text-red-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-red-700">Arrivée</p>
                        <p className="text-sm">{passenger.arrivalAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-center text-muted-foreground py-4">
                  Aucun passager assigné
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
