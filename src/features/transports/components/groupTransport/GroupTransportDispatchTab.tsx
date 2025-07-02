import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shareds/components/ui/card';
import { Button } from '@/shareds/components/ui/button';
import { Badge } from '@/shareds/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shareds/components/ui/avatar';
import { Car, Users, MapPin, Clock, Navigation, User, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { demandeService } from '@/features/transports/services/demande.service';
import { TransportRequestResponse } from '@/features/transports/types/demande';

interface GroupTransportRequest {
  id: string;
  reference: string;
  type: 'group';
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
  assignedRequests: GroupTransportRequest[];
  status: 'available' | 'assigned' | 'dispatched';
}

export function GroupTransportDispatchTab() {
  const [transportRequests, setTransportRequests] = useState<GroupTransportRequest[]>([]);
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

  const [draggedRequest, setDraggedRequest] = useState<GroupTransportRequest | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch group transport requests
  useEffect(() => {
    const fetchGroupRequests = async () => {
      try {
        const response = await demandeService.getTransportRequests({
          page: 1,
          limit: 50,
        });
        
        // Filter for group requests (more than 1 passenger)
        const groupRequests = response.data
          .filter(req => req.employeeTransports.length > 1)
          .map(req => ({
            id: req.id,
            reference: req.reference || `TR-${req.id}`,
            type: 'group' as const,
            scheduledDate: req.scheduledDate || new Date().toISOString(),
            status: req.status === 'APPROVED' ? 'pending' as const : 
                   req.status === 'ASSIGNED' ? 'assigned' as const : 'dispatched' as const,
            requestedBy: req.requestedBy?.fullName || 'Inconnu',
            enterprise: req.requestedBy?.enterprise?.name || 'Entreprise inconnue',
            subsidiary: req.requestedBy?.subsidiary?.name,
            passengers: req.employeeTransports.map(et => ({
              id: et.employee?.id || et.id,
              name: et.employee?.fullName || 'Passager inconnu',
              phone: et.employee?.phone || '',
              email: et.employee?.email || '',
              departureAddress: et.departure?.formattedAddress || 'Adresse de départ inconnue',
              arrivalAddress: et.arrival?.formattedAddress || 'Adresse d\'arrivée inconnue'
            })),
            note: req.note
          }));
        
        setTransportRequests(groupRequests);
      } catch (error) {
        toast.error('Échec du chargement des demandes de transport de groupe');
      }
    };

    fetchGroupRequests();
  }, []);

  const handleDragStart = (request: GroupTransportRequest) => {
    if (!isMobile) {
      setDraggedRequest(request);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isMobile) {
      e.preventDefault();
    }
  };

  const handleDrop = (e: React.DragEvent, taxiId: string) => {
    if (isMobile || !draggedRequest) return;
    
    e.preventDefault();

    const taxi = virtualTaxis.find(t => t.id === taxiId);
    if (!taxi) return;

    // Check if there's enough capacity for all passengers
    const currentPassengers = taxi.assignedRequests.reduce((total, req) => total + req.passengers.length, 0);
    const newPassengers = draggedRequest.passengers.length;
    
    if (currentPassengers + newPassengers > taxi.capacity) {
      toast.error(`Capacité insuffisante (${currentPassengers + newPassengers}/${taxi.capacity} passagers)`);
      return;
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

  // Mobile assignment function
  const assignRequestToTaxi = (request: GroupTransportRequest, taxiId: string) => {
    if (!isMobile) return;

    const taxi = virtualTaxis.find(t => t.id === taxiId);
    if (!taxi) return;

    // Check if there's enough capacity for all passengers
    const currentPassengers = taxi.assignedRequests.reduce((total, req) => total + req.passengers.length, 0);
    const newPassengers = request.passengers.length;
    
    if (currentPassengers + newPassengers > taxi.capacity) {
      toast.error(`Capacité insuffisante (${currentPassengers + newPassengers}/${taxi.capacity} passagers)`);
      return;
    }

    // Assign the request to the taxi
    setVirtualTaxis(prevTaxis => 
      prevTaxis.map(t => 
        t.id === taxiId 
          ? { 
              ...t, 
              assignedRequests: [...t.assignedRequests, request],
              status: 'assigned' as const
            }
          : t
      )
    );

    toast.success(`Demande ${request.reference} assignée au ${taxi.name}`);
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

  const getRequestPassengerCount = (request: GroupTransportRequest) => request.passengers.length;
  const getTaxiPassengerCount = (taxi: VirtualTaxi) => 
    taxi.assignedRequests.reduce((total, req) => total + req.passengers.length, 0);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Navigation className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">Interface de Dispatching - Transport de Groupe</h2>
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
              <span>Demandes de transport de groupe en attente ({unassignedRequests.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unassignedRequests.map((request) => (
              <div
                key={request.id}
                draggable={!isMobile}
                onDragStart={() => handleDragStart(request)}
                className="p-4 border rounded-lg transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {!isMobile && <GripVertical className="h-4 w-4 text-muted-foreground" />}
                    <div>
                      <div className="font-medium">{request.reference}</div>
                      <div className="text-sm text-muted-foreground">{request.enterprise}</div>
                      {request.subsidiary && (
                        <div className="text-xs text-muted-foreground">{request.subsidiary}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      Groupe
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
                    {request.passengers.slice(0, 3).map((passenger, idx) => (
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
                    {request.passengers.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{request.passengers.length - 3} autres passagers
                      </div>
                    )}
                  </div>
                  
                  {request.note && (
                    <div className="text-xs text-muted-foreground italic">
                      Note: {request.note}
                    </div>
                  )}

                  {/* Mobile T1 T2 buttons */}
                  {isMobile && (
                    <div className="flex space-x-2 mt-3">
                      {virtualTaxis.filter(t => t.status !== 'dispatched').map((taxi) => (
                        <Button
                          key={taxi.id}
                          size="sm"
                          variant="outline"
                          onClick={() => assignRequestToTaxi(request, taxi.id)}
                          className="text-xs"
                          disabled={getTaxiPassengerCount(taxi) + getRequestPassengerCount(request) > taxi.capacity}
                        >
                          {taxi.name.replace('Taxi Virtuel #', 'T')}
                        </Button>
                      ))}
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
                onDragOver={!isMobile ? handleDragOver : undefined}
                onDrop={!isMobile ? (e) => handleDrop(e, taxi.id) : undefined}
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
                            <Badge variant="secondary" className="text-xs">
                              Groupe
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
                    {isMobile ? 'Taxi disponible' : 'Glissez des demandes ici'}
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