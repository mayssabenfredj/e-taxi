import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, Users, MapPin, Clock, Navigation, ArrowLeft, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

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
  assignedPassengers: Passenger[];
  status: 'available' | 'assigned' | 'dispatched';
  isCollapsed: boolean;
}

export function GroupTransportDispatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [draggedPassenger, setDraggedPassenger] = useState<Passenger | null>(null);
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mock data for the group transport request
  const transportRequest = {
    id: id || '1',
    reference: 'TR-2024-001',
    type: 'group',
    status: 'approved',
    scheduledDate: '2024-01-15 09:00',
    enterprise: 'TechCorp SARL',
    requestedBy: 'Marie Dubois',
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
    ] as Passenger[]
  };

  // Calculate number of virtual taxis needed
  const taxiCount = Math.ceil(transportRequest.passengers.length / 4);
  
  const [virtualTaxis, setVirtualTaxis] = useState<VirtualTaxi[]>(
    Array.from({ length: taxiCount }, (_, index) => ({
      id: `taxi-${index + 1}`,
      name: `Taxi #${index + 1}`,
      capacity: 4,
      assignedPassengers: [],
      status: 'available' as const,
      isCollapsed: false
    }))
  );

  // Group passengers by departure address
  const passengersByDeparture = transportRequest.passengers.reduce((groups, passenger) => {
    const departure = passenger.departureAddress;
    if (!groups[departure]) {
      groups[departure] = [];
    }
    groups[departure].push(passenger);
    return groups;
  }, {} as Record<string, Passenger[]>);

  // Get unassigned passengers
  const assignedPassengerIds = virtualTaxis.flatMap(taxi => taxi.assignedPassengers.map(p => p.id));
  const unassignedPassengersByDeparture = Object.entries(passengersByDeparture).reduce((groups, [departure, passengers]) => {
    const unassigned = passengers.filter(p => !assignedPassengerIds.includes(p.id));
    if (unassigned.length > 0) {
      groups[departure] = unassigned;
    }
    return groups;
  }, {} as Record<string, Passenger[]>);

  // Mobile-friendly assignment function
  const assignPassengerToTaxi = (passenger: Passenger, taxiId: string) => {
    const taxi = virtualTaxis.find(t => t.id === taxiId);
    if (!taxi) return;

    if (taxi.assignedPassengers.length >= taxi.capacity) {
      toast.error(`Taxi complet (${taxi.capacity}/${taxi.capacity} passagers)`);
      return;
    }

    setVirtualTaxis(prevTaxis => {
      const newTaxis = prevTaxis.map(t => 
        t.id === taxiId 
          ? { 
              ...t, 
              assignedPassengers: [...t.assignedPassengers, passenger],
              status: 'assigned' as const,
              isCollapsed: t.assignedPassengers.length + 1 >= t.capacity
            }
          : t
      );
      
      // Sort taxis: full ones at bottom, empty ones at top
      return newTaxis.sort((a, b) => {
        const aIsFull = a.assignedPassengers.length >= a.capacity;
        const bIsFull = b.assignedPassengers.length >= b.capacity;
        
        if (aIsFull && !bIsFull) return 1;
        if (!aIsFull && bIsFull) return -1;
        return 0;
      });
    });

    setHasDraftChanges(true);
    toast.success(`${passenger.name} assigné au ${taxi.name}`);
  };

  // Desktop drag and drop handlers
  const handleDragStart = (passenger: Passenger) => {
    if (!isMobile) {
      setDraggedPassenger(passenger);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isMobile) {
      e.preventDefault();
    }
  };

  const handleDrop = (e: React.DragEvent, taxiId: string) => {
    if (!isMobile && draggedPassenger) {
      e.preventDefault();
      assignPassengerToTaxi(draggedPassenger, taxiId);
      setDraggedPassenger(null);
    }
  };

  const removePassengerFromTaxi = (taxiId: string, passengerId: string) => {
    setVirtualTaxis(prevTaxis => {
      const newTaxis = prevTaxis.map(taxi => {
        if (taxi.id === taxiId) {
          const newPassengers = taxi.assignedPassengers.filter(p => p.id !== passengerId);
          return {
            ...taxi,
            assignedPassengers: newPassengers,
            status: newPassengers.length === 0 ? 'available' as const : 'assigned' as const,
            isCollapsed: false
          };
        }
        return taxi;
      });
      
      // Sort taxis: full ones at bottom, empty ones at top
      return newTaxis.sort((a, b) => {
        const aIsFull = a.assignedPassengers.length >= a.capacity;
        const bIsFull = b.assignedPassengers.length >= b.capacity;
        
        if (aIsFull && !bIsFull) return 1;
        if (!aIsFull && bIsFull) return -1;
        return 0;
      });
    });
    
    setHasDraftChanges(true);
  };

  const addVirtualTaxi = () => {
    const newTaxiNumber = virtualTaxis.length + 1;
    const newTaxi: VirtualTaxi = {
      id: `taxi-${newTaxiNumber}`,
      name: `Taxi #${newTaxiNumber}`,
      capacity: 4,
      assignedPassengers: [],
      status: 'available',
      isCollapsed: false
    };
    
    setVirtualTaxis(prev => [newTaxi, ...prev]);
    toast.success(`Taxi virtuel #${newTaxiNumber} ajouté`);
  };

  const removeVirtualTaxi = (taxiId: string) => {
    const taxi = virtualTaxis.find(t => t.id === taxiId);
    if (taxi && taxi.assignedPassengers.length > 0) {
      toast.error('Impossible de supprimer un taxi avec des passagers assignés');
      return;
    }
    
    setVirtualTaxis(prev => prev.filter(t => t.id !== taxiId));
    toast.success('Taxi virtuel supprimé');
  };

  const toggleTaxiCollapse = (taxiId: string) => {
    setVirtualTaxis(prev => 
      prev.map(taxi => 
        taxi.id === taxiId 
          ? { ...taxi, isCollapsed: !taxi.isCollapsed }
          : taxi
      )
    );
  };

  const createCourse = () => {
    const assignedTaxis = virtualTaxis.filter(taxi => taxi.assignedPassengers.length > 0);
    
    if (assignedTaxis.length === 0) {
      toast.error('Aucun taxi à dispatcher');
      return;
    }

    // Check if all passengers are assigned
    const totalAssignedPassengers = assignedTaxis.reduce((sum, taxi) => sum + taxi.assignedPassengers.length, 0);
    const allPassengersAssigned = totalAssignedPassengers === transportRequest.passengers.length;

    if (allPassengersAssigned) {
      setVirtualTaxis(prevTaxis => 
        prevTaxis.map(taxi => 
          taxi.assignedPassengers.length > 0 
            ? { ...taxi, status: 'dispatched' as const }
            : taxi
        )
      );
      
      setHasDraftChanges(false);
      toast.success(`Course créée avec ${assignedTaxis.length} taxi(s)`);
      navigate('/transport/history');
    } else {
      toast.error('Tous les passagers doivent être assignés avant de créer la course');
    }
  };

  const saveDraft = () => {
    // Save current state as draft
    const draftData = {
      transportRequestId: transportRequest.id,
      virtualTaxis: virtualTaxis.filter(taxi => taxi.assignedPassengers.length > 0),
      savedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`dispatch-draft-${transportRequest.id}`, JSON.stringify(draftData));
    setHasDraftChanges(false);
    toast.success('Brouillon sauvegardé');
  };

  const allPassengersAssigned = Object.keys(unassignedPassengersByDeparture).length === 0;

  return (
    <div className="space-y-4 max-w-7xl">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/transport`)}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Retour</span>
          </Button>
          
          <h2 className="text-lg sm:text-xl font-bold truncate">
            <span className="hidden sm:inline">Dispatch Groupe - </span>{transportRequest.reference}
          </h2>
        </div>

        {hasDraftChanges && (
          <Button
            variant="outline"
            onClick={saveDraft}
            size="sm"
            className="w-full sm:w-auto"
          >
            Sauvegarder brouillon
          </Button>
        )}
      </div>

      {/* Request Summary - Responsive */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{new Date(transportRequest.scheduledDate).toLocaleString('fr-FR')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{transportRequest.passengers.length} passagers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Car className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{virtualTaxis.length} taxi(s)</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="font-medium truncate">{transportRequest.enterprise}</div>
              <div className="text-muted-foreground text-xs truncate">Par: {transportRequest.requestedBy}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Passengers by departure - Mobile optimized */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Users className="h-5 w-5" />
              <span>Passagers par point de départ</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(unassignedPassengersByDeparture).map(([departure, passengers]) => (
              <div key={departure} className="space-y-2">
                <div className="flex items-center space-x-2 p-2 bg-muted rounded text-sm">
                  <MapPin className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="font-medium flex-1 truncate">{departure}</span>
                  <Badge variant="secondary">{passengers.length}</Badge>
                </div>
                
                <div className="space-y-1 ml-2 sm:ml-6">
                  {passengers.map((passenger) => (
                    <div
                      key={passenger.id}
                      draggable={!isMobile}
                      onDragStart={() => handleDragStart(passenger)}
                      className={`p-2 border rounded transition-colors text-sm bg-card ${
                        isMobile ? 'active:bg-muted/50' : 'cursor-move hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{passenger.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{passenger.phone}</div>
                        </div>
                        {isMobile && (
                          <div className="flex space-x-1 ml-2">
                            {virtualTaxis.filter(t => t.assignedPassengers.length < t.capacity).map((taxi) => (
                              <Button
                                key={taxi.id}
                                size="sm"
                                variant="outline"
                                onClick={() => assignPassengerToTaxi(passenger, taxi.id)}
                                className="text-xs h-6 px-2"
                              >
                                {taxi.name.replace('Taxi #', 'T')}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <MapPin className="h-3 w-3 text-red-500 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">
                          → {passenger.arrivalAddress}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {Object.keys(unassignedPassengersByDeparture).length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Tous les passagers ont été assignés
              </div>
            )}
          </CardContent>
        </Card>

        {/* Virtual Taxis - Mobile optimized */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Car className="h-5 w-5" />
              <span>Taxis virtuels</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {virtualTaxis.map((taxi) => (
              <div
                key={taxi.id}
                onDragOver={!isMobile ? handleDragOver : undefined}
                onDrop={!isMobile ? (e) => handleDrop(e, taxi.id) : undefined}
                className={`border rounded transition-all ${
                  taxi.status === 'available' ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20' :
                  taxi.status === 'assigned' ? 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20' :
                  'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20'
                }`}
              >
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{taxi.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={
                          taxi.status === 'available' ? 'secondary' :
                          taxi.status === 'assigned' ? 'default' : 'outline'
                        }
                        className="text-xs"
                      >
                        {taxi.status === 'available' ? 'Disponible' :
                         taxi.status === 'assigned' ? 'Assigné' : 'En route'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {taxi.assignedPassengers.length}/{taxi.capacity}
                      </span>
                      {taxi.assignedPassengers.length > 0 && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleTaxiCollapse(taxi.id)}
                            className="h-6 w-6 p-0"
                          >
                            {taxi.isCollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeVirtualTaxi(taxi.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            disabled={taxi.assignedPassengers.length > 0}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {taxi.assignedPassengers.length > 0 && !taxi.isCollapsed && (
                    <div className="space-y-1 mb-2">
                      {taxi.assignedPassengers.map((passenger) => (
                        <div key={passenger.id} className="bg-background rounded border p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium truncate">{passenger.name}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 h-5 w-5 p-0"
                              onClick={() => removePassengerFromTaxi(taxi.id, passenger.id)}
                            >
                              ✕
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-green-500 flex-shrink-0" />
                              <span className="truncate">{passenger.departureAddress}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-red-500 flex-shrink-0" />
                              <span className="truncate">{passenger.arrivalAddress}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {taxi.assignedPassengers.length === 0 && (
                    <div className="text-center py-3 text-muted-foreground border-2 border-dashed rounded text-xs">
                      {isMobile ? 'Taxi disponible' : 'Glissez des passagers ici'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Buttons - Mobile optimized */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-2 z-50">
        <Button
          onClick={addVirtualTaxi}
          className="rounded-full w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
          title="Ajouter un taxi virtuel"
        >
          <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
        
        <Button
          onClick={createCourse}
          disabled={!allPassengersAssigned}
          className="rounded-full w-12 h-12 sm:w-14 sm:h-14 bg-etaxi-yellow hover:bg-yellow-500 text-black shadow-lg"
          title="Créer une course"
        >
          <Navigation className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>
    </div>
  );
}