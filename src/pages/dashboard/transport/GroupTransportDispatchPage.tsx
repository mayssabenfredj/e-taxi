import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Car, Users, MapPin, Clock, Navigation, ArrowLeft, Plus, ChevronDown, X } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
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
  isUserAdded: boolean; // Pour distinguer les taxis ajoutés par l'utilisateur
}

export function GroupTransportDispatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [draggedPassenger, setDraggedPassenger] = useState<Passenger | null>(null);
  const [hasDraftData, setHasDraftData] = useState(false);

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

  // Group passengers by governorate (using city as proxy)
  const passengersByGovernorate = transportRequest.passengers.reduce((groups, passenger) => {
    // Extract city from address (simplified logic)
    const governorate = passenger.departureAddress.includes('Paris') ? 'Paris' :
                       passenger.departureAddress.includes('Lyon') ? 'Lyon' :
                       passenger.departureAddress.includes('Marseille') ? 'Marseille' :
                       passenger.departureAddress.includes('Défense') ? 'Hauts-de-Seine' :
                       'Autres';
    
    if (!groups[governorate]) {
      groups[governorate] = [];
    }
    groups[governorate].push(passenger);
    return groups;
  }, {} as Record<string, Passenger[]>);

  // Calculate number of virtual taxis needed based on passengers
  const taxiCount = Math.ceil(transportRequest.passengers.length / 4);
  
  const [virtualTaxis, setVirtualTaxis] = useState<VirtualTaxi[]>(
    Array.from({ length: taxiCount }, (_, index) => ({
      id: `taxi-${index + 1}`,
      name: `Taxi #${index + 1}`,
      capacity: 4,
      assignedPassengers: [],
      status: 'available' as const,
      isCollapsed: false,
      isUserAdded: false
    }))
  );

  // Auto-collapse full taxis and sort taxis (empty ones first)
  useEffect(() => {
    setVirtualTaxis(prevTaxis => {
      const updatedTaxis = prevTaxis.map(taxi => ({
        ...taxi,
        isCollapsed: taxi.assignedPassengers.length === taxi.capacity
      }));

      // Sort: empty taxis first, then partially filled, then full
      return updatedTaxis.sort((a, b) => {
        const aPassengerCount = a.assignedPassengers.length;
        const bPassengerCount = b.assignedPassengers.length;
        
        if (aPassengerCount === 0 && bPassengerCount > 0) return -1;
        if (bPassengerCount === 0 && aPassengerCount > 0) return 1;
        if (aPassengerCount === a.capacity && bPassengerCount < b.capacity) return 1;
        if (bPassengerCount === b.capacity && aPassengerCount < a.capacity) return -1;
        
        return 0;
      });
    });
  }, [virtualTaxis.map(t => t.assignedPassengers.length).join(',')]);

  // Check if there's any dispatch data to save as draft
  useEffect(() => {
    const hasAssignedPassengers = virtualTaxis.some(taxi => taxi.assignedPassengers.length > 0);
    setHasDraftData(hasAssignedPassengers);
  }, [virtualTaxis]);

  // Get unassigned passengers
  const assignedPassengerIds = virtualTaxis.flatMap(taxi => taxi.assignedPassengers.map(p => p.id));
  const unassignedPassengersByGovernorate = Object.entries(passengersByGovernorate).reduce((groups, [governorate, passengers]) => {
    const unassigned = passengers.filter(p => !assignedPassengerIds.includes(p.id));
    if (unassigned.length > 0) {
      groups[governorate] = unassigned;
    }
    return groups;
  }, {} as Record<string, Passenger[]>);

  const handleDragStart = (passenger: Passenger) => {
    setDraggedPassenger(passenger);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, taxiId: string) => {
    e.preventDefault();
    
    if (!draggedPassenger) return;

    const taxi = virtualTaxis.find(t => t.id === taxiId);
    if (!taxi) return;

    if (taxi.assignedPassengers.length >= taxi.capacity) {
      toast.error(`Taxi complet (${taxi.capacity}/${taxi.capacity} passagers)`);
      return;
    }

    setVirtualTaxis(prevTaxis => 
      prevTaxis.map(t => 
        t.id === taxiId 
          ? { 
              ...t, 
              assignedPassengers: [...t.assignedPassengers, draggedPassenger],
              status: 'assigned' as const
            }
          : t
      )
    );

    toast.success(`${draggedPassenger.name} assigné au ${taxi.name}`);
    setDraggedPassenger(null);
  };

  const removePassengerFromTaxi = (taxiId: string, passengerId: string) => {
    setVirtualTaxis(prevTaxis => 
      prevTaxis.map(taxi => {
        if (taxi.id === taxiId) {
          const newPassengers = taxi.assignedPassengers.filter(p => p.id !== passengerId);
          return {
            ...taxi,
            assignedPassengers: newPassengers,
            status: newPassengers.length === 0 ? 'available' as const : 'assigned' as const
          };
        }
        return taxi;
      })
    );
  };

  const toggleTaxiCollapse = (taxiId: string) => {
    setVirtualTaxis(prevTaxis => 
      prevTaxis.map(taxi => 
        taxi.id ===  taxiId 
          ? { ...taxi, isCollapsed: !taxi.isCollapsed }
          : taxi
      )
    );
  };

  const addNewTaxi = () => {
    const newTaxiId = `taxi-${Date.now()}`;
    const newTaxi: VirtualTaxi = {
      id: newTaxiId,
      name: `Taxi #${virtualTaxis.length + 1}`,
      capacity: 4,
      assignedPassengers: [],
      status: 'available',
      isCollapsed: false,
      isUserAdded: true
    };
    
    setVirtualTaxis(prev => [...prev, newTaxi]);
    toast.success('Nouveau taxi ajouté');
  };

  const removeTaxi = (taxiId: string) => {
    const taxi = virtualTaxis.find(t => t.id === taxiId);
    
    if (!taxi) return;
    
    if (taxi.assignedPassengers.length > 0) {
      toast.error('Impossible de supprimer un taxi avec des passagers assignés');
      return;
    }
    
    setVirtualTaxis(prev => prev.filter(t => t.id !== taxiId));
    toast.success('Taxi supprimé');
  };

  const dispatchAll = () => {
    const assignedTaxis = virtualTaxis.filter(taxi => taxi.assignedPassengers.length > 0);
    
    if (assignedTaxis.length === 0) {
      toast.error('Aucun passager assigné');
      return;
    }

    // Vérifier si tous les passagers sont assignés
    const allPassengersAssigned = transportRequest.passengers.every(passenger => 
      assignedPassengerIds.includes(passenger.id)
    );

    if (!allPassengersAssigned) {
      // Sauvegarder comme brouillon
      const draftData = {
        requestId: transportRequest.id,
        taxis: virtualTaxis,
        lastModified: new Date().toISOString()
      };
      
      localStorage.setItem(`groupDispatchDraft-${transportRequest.id}`, JSON.stringify(draftData));
      toast.info('Certains passagers ne sont pas assignés. Sauvegardé comme brouillon.');
      navigate('/transport/drafts');
      return;
    }

    // Tous les passagers sont assignés, créer la course
    toast.success('Course créée avec succès');
    navigate('/transport');
  };

  const saveDraft = () => {
    const draftData = {
      requestId: transportRequest.id,
      taxis: virtualTaxis,
      lastModified: new Date().toISOString()
    };
    
    localStorage.setItem(`groupDispatchDraft-${transportRequest.id}`, JSON.stringify(draftData));
    toast.success('Brouillon sauvegardé');
    navigate('/transport/drafts');
  };

  return (
    <div className="space-y-4 max-w-7xl relative pb-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/transport`)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          
          <h2 className="text-xl font-bold">Dispatch Groupe - {transportRequest.reference}</h2>
        </div>
      </div>

      {/* Request Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(transportRequest.scheduledDate).toLocaleString('fr-FR')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{transportRequest.passengers.length} passagers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span>{taxiCount} taxi(s) nécessaire(s)</span>
            </div>
            <div>
              <div className="font-medium">{transportRequest.enterprise}</div>
              <div className="text-muted-foreground">Par: {transportRequest.requestedBy}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Passengers by governorate */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Users className="h-5 w-5" />
              <span>Passagers par gouvernorat</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(unassignedPassengersByGovernorate).map(([governorate, passengers]) => (
              <div key={governorate} className="space-y-2">
                <div className="flex items-center space-x-2 p-2 bg-muted rounded text-sm">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span className="font-medium flex-1">{governorate}</span>
                  <Badge variant="secondary">{passengers.length}</Badge>
                </div>
                
                <div className="space-y-1 ml-6">
                  {passengers.map((passenger) => (
                    <div
                      key={passenger.id}
                      draggable
                      onDragStart={() => handleDragStart(passenger)}
                      className="p-2 border rounded cursor-move hover:bg-muted/50 transition-colors text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{passenger.name}</div>
                          <div className="text-xs text-muted-foreground">{passenger.phone}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <MapPin className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-muted-foreground truncate">
                          → {passenger.arrivalAddress}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {Object.keys(unassignedPassengersByGovernorate).length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Tous les passagers ont été assignés
              </div>
            )}
          </CardContent>
        </Card>

        {/* Virtual Taxis */}
        <div className="space-y-3 relative">
          {virtualTaxis.map((taxi) => (
            <Collapsible
              key={taxi.id}
              open={!taxi.isCollapsed}
              onOpenChange={() => toggleTaxiCollapse(taxi.id)}
              className={`border rounded transition-all ${
                taxi.status === 'available' ? 'border-green-200 bg-green-50/50' :
                taxi.status === 'assigned' ? 'border-yellow-200 bg-yellow-50/50' :
                'border-blue-200 bg-blue-50/50'
              }`}
            >
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-3 cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{taxi.name}</span>
                    {taxi.isUserAdded && (
                      <Badge variant="outline" className="text-xs">Ajouté</Badge>
                    )}
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
                    <span className={`text-xs ${
                      taxi.assignedPassengers.length === taxi.capacity ? 'text-red-600 font-bold' : 'text-muted-foreground'
                    }`}>
                      {taxi.assignedPassengers.length}/{taxi.capacity}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${taxi.isCollapsed ? '' : 'rotate-180'}`} />
                    
                    {/* Delete button for user-added taxis or empty taxis */}
                    {(taxi.isUserAdded || taxi.assignedPassengers.length === 0) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTaxi(taxi.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div 
                  className="p-3 pt-0"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, taxi.id)}
                >
                  {taxi.assignedPassengers.length > 0 ? (
                    <div className="space-y-1 mb-2">
                      {taxi.assignedPassengers.map((passenger) => (
                        <div key={passenger.id} className="bg-background rounded border p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">{passenger.name}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 h-5 w-5 p-0"
                              onClick={() => removePassengerFromTaxi(taxi.id, passenger.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-green-500" />
                              <span className="truncate">{passenger.departureAddress}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-red-500" />
                              <span className="truncate">{passenger.arrivalAddress}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-3 text-muted-foreground border-2 border-dashed rounded text-xs">
                      Glissez des passagers ici
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
          
          {virtualTaxis.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun taxi disponible. Cliquez sur "Ajouter un taxi" pour commencer.
            </div>
          )}
        </div>
      </div>

      {/* Floating action buttons */}
      <div className="fixed bottom-6 right-6 flex space-x-3">
        <Button
          onClick={addNewTaxi}
          variant="outline"
          className="bg-white shadow-lg border-etaxi-yellow text-etaxi-yellow hover:bg-etaxi-yellow hover:text-black"
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un taxi
        </Button>
        
        {hasDraftData && (
          <Button
            variant="outline"
            onClick={saveDraft}
            className="bg-white shadow-lg"
          >
            Sauvegarder brouillon
          </Button>
        )}
        
        <Button
          onClick={dispatchAll}
          className="bg-etaxi-yellow hover:bg-yellow-500 text-black shadow-lg"
          disabled={!hasDraftData}
        >
          <Navigation className="mr-2 h-4 w-4" />
          Créer une course
        </Button>
      </div>
    </div>
  );
}