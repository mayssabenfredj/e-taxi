
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Car, Users, MapPin, Clock, Navigation, User, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface TransportRequest {
  id: string;
  reference: string;
  type: 'private' | 'public';
  scheduledDate: string;
  status: 'pending' | 'assigned' | 'dispatched';
  requestedBy: string;
  enterprise: string;
  subsidiary?: string;
  passengers: Passenger[];
  note?: string;
}

interface Passenger {
  id: string;
  name: string;
  phone: string;
  email: string;
  departureAddress: string;
  arrivalAddress: string;
}

interface VirtualTaxi {
  id: string;
  name: string;
  capacity: number;
  assignedRequests: TransportRequest[];
  status: 'available' | 'assigned' | 'dispatched';
}

export function DispatchPage() {
  const [transportRequests] = useState<TransportRequest[]>([
    {
      id: '1',
      reference: 'TR-2024-001',
      type: 'public',
      scheduledDate: '2024-01-15 09:00',
      status: 'pending',
      requestedBy: 'Marie Dubois',
      enterprise: 'TechCorp SARL',
      subsidiary: 'TechCorp Paris',
      passengers: [
        {
          id: '1',
          name: 'Jean Dupont',
          phone: '+33 6 12 34 56 78',
          email: 'jean.dupont@techcorp.fr',
          departureAddress: '15 Rue du Louvre, 75001 Paris',
          arrivalAddress: '101 Avenue des Champs-Élysées, 75008 Paris'
        },
        {
          id: '2',
          name: 'Marie Martin',
          phone: '+33 6 98 76 54 32',
          email: 'marie.martin@techcorp.fr',
          departureAddress: '25 Rue de Rivoli, 75004 Paris',
          arrivalAddress: '101 Avenue des Champs-Élysées, 75008 Paris'
        }
      ],
      note: 'Transport pour réunion client importante'
    },
    {
      id: '2',
      reference: 'TR-2024-002',
      type: 'private',
      scheduledDate: '2024-01-15 09:30',
      status: 'pending',
      requestedBy: 'Pierre Durand',
      enterprise: 'InnovSoft',
      passengers: [
        {
          id: '3',
          name: 'Pierre Durand',
          phone: '+33 7 12 34 56 78',
          email: 'pierre.durand@innovsoft.fr',
          departureAddress: '5 Avenue Montaigne, 75008 Paris',
          arrivalAddress: '50 Rue de la Paix, 75002 Paris'
        }
      ],
      note: 'Rendez-vous médical urgent'
    },
    {
      id: '3',
      reference: 'TR-2024-003',
      type: 'public',
      scheduledDate: '2024-01-15 09:45',
      status: 'pending',
      requestedBy: 'Sophie Lefebvre',
      enterprise: 'GlobalTech',
      passengers: [
        {
          id: '4',
          name: 'Sophie Lefebvre',
          phone: '+33 6 45 67 89 01',
          email: 'sophie.lefebvre@globaltech.fr',
          departureAddress: '30 Rue Saint-Honoré, 75001 Paris',
          arrivalAddress: '101 Avenue des Champs-Élysées, 75008 Paris'
        },
        {
          id: '5',
          name: 'Marc Rousseau',
          phone: '+33 6 11 22 33 44',
          email: 'marc.rousseau@globaltech.fr',
          departureAddress: '12 Boulevard Saint-Germain, 75005 Paris',
          arrivalAddress: '101 Avenue des Champs-Élysées, 75008 Paris'
        }
      ]
    }
  ]);

  const [virtualTaxis, setVirtualTaxis] = useState<VirtualTaxi[]>([
    {
      id: '1',
      name: 'Taxi Virtuel #1',
      capacity: 4,
      assignedRequests: [],
      status: 'available'
    },
    {
      id: '2',
      name: 'Taxi Virtuel #2',
      capacity: 4,
      assignedRequests: [],
      status: 'available'
    },
    {
      id: '3',
      name: 'Taxi Virtuel #3',
      capacity: 4,
      assignedRequests: [],
      status: 'available'
    }
  ]);

  const [draggedRequest, setDraggedRequest] = useState<TransportRequest | null>(null);

  const handleDragStart = (request: TransportRequest) => {
    setDraggedRequest(request);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, taxiId: string) => {
    e.preventDefault();
    
    if (!draggedRequest) return;

    const taxi = virtualTaxis.find(t => t.id === taxiId);
    if (!taxi) return;

    // Logic for private vs public requests
    if (draggedRequest.type === 'private') {
      // Private requests need dedicated taxi
      if (taxi.assignedRequests.length > 0) {
        toast.error('Les demandes privées nécessitent un taxi dédié');
        return;
      }
    } else {
      // Public requests can share taxi
      if (taxi.assignedRequests.some(req => req.type === 'private')) {
        toast.error('Ce taxi est déjà assigné à une demande privée');
        return;
      }
      
      // Check if there's enough capacity for all passengers
      const currentPassengers = taxi.assignedRequests.reduce((total, req) => total + req.passengers.length, 0);
      const newPassengers = draggedRequest.passengers.length;
      
      if (currentPassengers + newPassengers > taxi.capacity) {
        toast.error(`Capacité insuffisante (${currentPassengers + newPassengers}/${taxi.capacity} passagers)`);
        return;
      }

      // For public requests, also check enterprise compatibility
      const existingEnterprises = taxi.assignedRequests.map(req => req.enterprise);
      if (existingEnterprises.length > 0 && !existingEnterprises.includes(draggedRequest.enterprise)) {
        // This is allowed for public requests from different enterprises
        toast.info('Ajout de passagers d\'une autre Organisation (transport public)');
      }
    }

    // Assign the request to the taxi
    setVirtualTaxis(prevTaxis => 
      prevTaxis.map(t => 
        t.id === taxiId 
          ? { 
              ...t, 
              assignedRequests: [...t.assignedRequests, draggedRequest],
              status: 'assigned' as const
            }
          : t
      )
    );

    toast.success(`Demande ${draggedRequest.reference} assignée au ${taxi.name}`);
    setDraggedRequest(null);
  };

  const removeRequestFromTaxi = (taxiId: string, requestId: string) => {
    setVirtualTaxis(prevTaxis => 
      prevTaxis.map(taxi => {
        if (taxi.id === taxiId) {
          const newRequests = taxi.assignedRequests.filter(req => req.id !== requestId);
          return {
            ...taxi,
            assignedRequests: newRequests,
            status: newRequests.length === 0 ? 'available' as const : 'assigned' as const
          };
        }
        return taxi;
      })
    );
  };

  const dispatchTaxi = (taxiId: string) => {
    setVirtualTaxis(prevTaxis => 
      prevTaxis.map(taxi => 
        taxi.id === taxiId 
          ? { ...taxi, status: 'dispatched' as const }
          : taxi
      )
    );
    
    const taxi = virtualTaxis.find(t => t.id === taxiId);
    const totalPassengers = taxi?.assignedRequests.reduce((total, req) => total + req.passengers.length, 0) || 0;
    toast.success(`${taxi?.name} dispatché avec ${totalPassengers} passager(s)`);
  };

  const unassignedRequests = transportRequests.filter(req => 
    !virtualTaxis.some(taxi => taxi.assignedRequests.some(assigned => assigned.id === req.id))
  );

  const getRequestPassengerCount = (request: TransportRequest) => request.passengers.length;
  const getTaxiPassengerCount = (taxi: VirtualTaxi) => 
    taxi.assignedRequests.reduce((total, req) => total + req.passengers.length, 0);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Navigation className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">Interface de Dispatching</h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <MapPin className="mr-2 h-4 w-4" />
            Vue carte
          </Button>
          <Button className="bg-etaxi-yellow hover:bg-yellow-500 text-black">
            Dispatcher tout
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Demandes en attente</p>
                <p className="text-2xl font-bold">{unassignedRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Taxis disponibles</p>
                <p className="text-2xl font-bold">
                  {virtualTaxis.filter(t => t.status === 'available').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Navigation className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Assignés</p>
                <p className="text-2xl font-bold">
                  {virtualTaxis.filter(t => t.status === 'assigned').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">En route</p>
                <p className="text-2xl font-bold">
                  {virtualTaxis.filter(t => t.status === 'dispatched').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Demandes en attente */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Demandes de transport en attente ({unassignedRequests.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unassignedRequests.map((request) => (
              <div
                key={request.id}
                draggable
                onDragStart={() => handleDragStart(request)}
                className="p-4 border rounded-lg cursor-move hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{request.reference}</div>
                      <div className="text-sm text-muted-foreground">{request.enterprise}</div>
                      {request.subsidiary && (
                        <div className="text-xs text-muted-foreground">{request.subsidiary}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={request.type === 'private' ? 'default' : 'secondary'}>
                      {request.type === 'private' ? 'Privé' : 'Public'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {getRequestPassengerCount(request)} passager(s)
                    </span>
                  </div>
                </div>

                <div className="text-sm space-y-2">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-blue-500" />
                    <span>{new Date(request.scheduledDate).toLocaleString('fr-FR')}</span>
                  </div>
                  
                  <div className="space-y-1">
                    {request.passengers.map((passenger, idx) => (
                      <div key={idx} className="bg-muted/50 p-2 rounded text-xs">
                        <div className="font-medium">{passenger.name}</div>
                        <div className="flex items-center space-x-1 mt-1">
                          <MapPin className="h-3 w-3 text-green-500" />
                          <span className="truncate">{passenger.departureAddress}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-red-500" />
                          <span className="truncate">{passenger.arrivalAddress}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {request.note && (
                    <div className="text-xs text-muted-foreground italic">
                      Note: {request.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {unassignedRequests.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Toutes les demandes ont été assignées
              </div>
            )}
          </CardContent>
        </Card>

        {/* Taxis virtuels */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Car className="h-5 w-5" />
              <span>Taxis virtuels ({virtualTaxis.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {virtualTaxis.map((taxi) => (
              <div
                key={taxi.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, taxi.id)}
                className={`p-4 border rounded-lg transition-all ${
                  taxi.status === 'available' ? 'border-green-200 bg-green-50/50' :
                  taxi.status === 'assigned' ? 'border-yellow-200 bg-yellow-50/50' :
                  'border-blue-200 bg-blue-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Car className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{taxi.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Capacité: {taxi.capacity} passagers
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={
                        taxi.status === 'available' ? 'secondary' :
                        taxi.status === 'assigned' ? 'default' : 'outline'
                      }
                    >
                      {taxi.status === 'available' ? 'Disponible' :
                       taxi.status === 'assigned' ? 'Assigné' : 'En route'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {getTaxiPassengerCount(taxi)}/{taxi.capacity}
                    </span>
                  </div>
                </div>

                {taxi.assignedRequests.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {taxi.assignedRequests.map((request) => (
                      <div key={request.id} className="bg-background rounded border p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{request.reference}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant={request.type === 'private' ? 'default' : 'secondary'} className="text-xs">
                              {request.type === 'private' ? 'P' : 'Pub'}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                              onClick={() => removeRequestFromTaxi(taxi.id, request.id)}
                            >
                              ✕
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>{request.enterprise}</div>
                          <div>{getRequestPassengerCount(request)} passager(s)</div>
                          <div>{new Date(request.scheduledDate).toLocaleString('fr-FR')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {taxi.assignedRequests.length > 0 && taxi.status !== 'dispatched' && (
                  <Button
                    size="sm"
                    className="w-full bg-etaxi-yellow hover:bg-yellow-500 text-black"
                    onClick={() => dispatchTaxi(taxi.id)}
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    Dispatcher ce taxi
                  </Button>
                )}

                {taxi.assignedRequests.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground border-2 border-dashed rounded">
                    Glissez des demandes ici
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
