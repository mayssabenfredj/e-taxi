import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shareds/components/ui/card';
import { Button } from '@/shareds/components/ui/button';
import { Badge } from '@/shareds/components/ui/badge';
import { Car, Users, MapPin, Clock, Navigation, ArrowLeft, Plus, X, ChevronDown, ChevronUp, Home, Briefcase, Calendar, AlertTriangle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shareds/contexts/LanguageContext';
import { useGoogleMaps } from '@/shareds/contexts/GoogleMapsContext';
import { toast } from 'sonner';
import { demandeService } from '@/features/transports/services/demande.service';
import { TransportRequestResponse, EmployeeTransportDto } from '@/features/transports/types/demande';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shareds/components/ui/dialog';
import { Switch } from '@/shareds/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shareds/components/ui/table';
import { useAuth } from '@/shareds/contexts/AuthContext';
import { hasPermission } from '@/shareds/lib/utils';

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
  routeEstimation?: RouteEstimation;
}

interface RouteEstimation {
  distance: string;
  duration: string;
  points: string[];
}

export function GroupTransportDispatchPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isGoogleMapsLoaded } = useGoogleMaps();
  const { user } = useAuth();

  if (!hasPermission(user, 'transports:read')) {
    return <div className="text-center text-red-500 py-12">Accès refusé : vous n'avez pas la permission de voir les transports.</div>;
  }

  const [draggedPassenger, setDraggedPassenger] = useState<Passenger | null>(null);
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [transportRequest, setTransportRequest] = useState<TransportRequestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHomeToWork, setIsHomeToWork] = useState(true);
  const [showConfirmationModal, setShowConfirmationDialog] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const dragRef = useRef<HTMLDivElement | null>(null);

  // Calculer le nombre minimum de taxis nécessaires
  const passengers = transportRequest?.employeeTransports.map((emp: EmployeeTransportDto) => ({
    id: emp.employeeId,
    name: emp.employee?.fullName || 'Inconnu',
    phone: emp.employee?.phone || 'Non spécifié',
    email: emp.employee?.email || 'Non spécifié',
    departureAddress: emp.departure?.formattedAddress || 'Non spécifié',
    arrivalAddress: emp.arrival?.formattedAddress || 'Non spécifié',
  })) || [];

  // Initialiser les taxis virtuels selon le nombre de passagers
  const initialTaxiCount = passengers.length < 4 ? 1 : Math.ceil(passengers.length / 4);
  const [virtualTaxis, setVirtualTaxis] = useState<VirtualTaxi[]>(
    Array.from({ length: initialTaxiCount }, (_, index) => ({
      id: `taxi-${index + 1}`,
      name: `Taxi #${index + 1}`,
      capacity: 4,
      assignedPassengers: [],
      status: 'available' as const,
      isCollapsed: false,
    }))
  );

  // Détecter appareil mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Charger les données de la demande
  useEffect(() => {
    if (!id) {
      setError('ID de la demande non spécifié');
      setLoading(false);
      return;
    }

    const fetchTransportRequest = async () => {
      try {
        setLoading(true);
        const response = await demandeService.getTransportRequestById(id);
        setTransportRequest(response);
        setIsHomeToWork(response.direction === 'HOMETOOFFICE');
      } catch (err) {
        setError('Échec du chargement de la demande de transport');
        toast.error('Échec du chargement de la demande de transport');
      } finally {
        setLoading(false);
      }
    };

    fetchTransportRequest();
  }, [id]);

  // Charger le brouillon s'il existe
  useEffect(() => {
    const draft = localStorage.getItem(`groupDispatchDraft-${id}`);
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        if (parsedDraft.taxis) {
          setVirtualTaxis(parsedDraft.taxis);
          setHasDraftChanges(true);
        }
      } catch (error) {
        console.error('Error loading dispatch draft:', error);
      }
    }
  }, [id]);

  // Grouper les passagers par point de départ
  const passengersByDeparture = passengers.reduce((groups, passenger) => {
    const departure = passenger.departureAddress;
    if (!groups[departure]) {
      groups[departure] = [];
    }
    groups[departure].push(passenger);
    return groups;
  }, {} as Record<string, Passenger[]>);

  // Obtenir les passagers non assignés
  const assignedPassengerIds = virtualTaxis.flatMap(taxi => taxi.assignedPassengers.map(p => p.id));
  const unassignedPassengersByDeparture = Object.entries(passengersByDeparture).reduce((groups, [departure, passengers]) => {
    const unassigned = passengers.filter(p => !assignedPassengerIds.includes(p.id));
    if (unassigned.length > 0) {
      groups[departure] = unassigned;
    }
    return groups;
  }, {} as Record<string, Passenger[]>);

  // Fonction pour sauvegarder le brouillon
  const saveDraft = () => {
    const draftData = {
      transportRequestId: id,
      taxis: virtualTaxis.filter(taxi => taxi.assignedPassengers.length > 0 || taxi.status !== 'available'),
      passengerCount: passengers.length,
      lastModified: new Date().toISOString(),
      reference: transportRequest?.reference || `TR-${id}`,
    };
    localStorage.setItem(`groupDispatchDraft-${id}`, JSON.stringify(draftData));
    setHasDraftChanges(true);
    toast.success('Brouillon sauvegardé automatiquement');
  };

  // Calculer les estimations de trajet
  const calculateRoutes = async (taxi: VirtualTaxi): Promise<RouteEstimation | null> => {
    if (!isGoogleMapsLoaded || !window.google || !taxi.assignedPassengers.length) {
      return null;
    }

    try {
      const directionsService = new window.google.maps.DirectionsService();
      const addresses = taxi.assignedPassengers.map(p =>
        isHomeToWork ? p.departureAddress : p.arrivalAddress
      ).filter((address): address is string => !!address);

      const workAddress = taxi.assignedPassengers[0]?.arrivalAddress || taxi.assignedPassengers[0]?.departureAddress;
      if (!workAddress || addresses.length === 0) {
        throw new Error('Adresses non valides');
      }

      const waypoints = isHomeToWork
        ? addresses.slice(1).map(address => ({ location: address, stopover: true }))
        : addresses.slice(0, -1).map(address => ({ location: address, stopover: true }));
      const origin = isHomeToWork ? addresses[0] : workAddress;
      const destination = isHomeToWork ? workAddress : addresses[addresses.length - 1];

      const request: google.maps.DirectionsRequest = {
        origin,
        destination,
        waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
      };

      const directionsResponse = await directionsService.route(request);
      const groupRouteResponse = directionsResponse.routes[0];
      const totalDistanceKm = groupRouteResponse.legs.reduce((acc, leg) => acc + (leg.distance?.value || 0), 0) / 1000;
      const totalDurationSeconds = groupRouteResponse.legs.reduce((acc, leg) => acc + (leg.duration?.value || 0), 0);
      const totalDurationMinutes = Math.round(totalDurationSeconds / 60);

      const points: string[] = [origin];
      if (waypoints.length > 0) {
        const optimizedOrder = directionsResponse.routes[0].waypoint_order;
        const orderedWaypoints = optimizedOrder.map(index => waypoints[index].location);
        points.push(...orderedWaypoints);
      }
      points.push(destination);

      return {
        distance: `${totalDistanceKm.toFixed(1)} km`,
        duration: `${Math.floor(totalDurationMinutes / 60)}h ${totalDurationMinutes % 60}min`,
        points,
      };
    } catch (error) {
      console.error('Error calculating route:', error);
      toast.error('Erreur de calcul d\'itinéraire');
      return null;
    }
  };

  // Gestion du drag and drop pour desktop
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

  // Vérifier les adresses pour les avertissements
  const getTaxiWarning = (taxi: VirtualTaxi) => {
    if (taxi.assignedPassengers.length <= 1) return null;

    if (isHomeToWork) {
      const arrivalAddresses = taxi.assignedPassengers.map(p => p.arrivalAddress);
      const uniqueArrivals = new Set(arrivalAddresses);
      if (uniqueArrivals.size > 1) {
        return 'Attention : Plusieurs adresses d\'arrivée différentes dans ce taxi';
      }
    } else {
      const departureAddresses = taxi.assignedPassengers.map(p => p.departureAddress);
      const uniqueDepartures = new Set(departureAddresses);
      if (uniqueDepartures.size > 1) {
        return 'Attention : Plusieurs adresses de départ différentes dans ce taxi';
      }
    }
    return null;
  };

  // Assigner un passager à un taxi
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
              isCollapsed: t.assignedPassengers.length + 1 >= t.capacity,
            }
          : t
      );
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

  // Supprimer un passager d'un taxi
  const removePassengerFromTaxi = (taxiId: string, passengerId: string) => {
    setVirtualTaxis(prevTaxis => {
      const newTaxis = prevTaxis.map(taxi => {
        if (taxi.id === taxiId) {
          const newPassengers = taxi.assignedPassengers.filter(p => p.id !== passengerId);
          return {
            ...taxi,
            assignedPassengers: newPassengers,
            status: newPassengers.length === 0 ? 'available' as const : 'assigned' as const,
            isCollapsed: false,
            routeEstimation: undefined,
          };
        }
        return taxi;
      });
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

  // Ajouter un taxi virtuel
  const addVirtualTaxi = () => {
    const newTaxiNumber = virtualTaxis.length + 1;
    const newTaxi: VirtualTaxi = {
      id: `taxi-${newTaxiNumber}`,
      name: `Taxi #${newTaxiNumber}`,
      capacity: 4,
      assignedPassengers: [],
      status: 'available',
      isCollapsed: false,
    };
    setVirtualTaxis(prev => [newTaxi, ...prev]);
    toast.success(`Taxi virtuel #${newTaxiNumber} ajouté`);
    setHasDraftChanges(true);
  };

  // Supprimer un taxi virtuel
  const removeVirtualTaxi = (taxiId: string) => {
    const taxi = virtualTaxis.find(t => t.id === taxiId);
    if (taxi && taxi.assignedPassengers.length > 0) {
      toast.error('Impossible de supprimer un taxi avec des passagers assignés');
      return;
    }
    if (virtualTaxis.length <= initialTaxiCount) {
      toast.error(`Minimum ${initialTaxiCount} taxi(s) requis`);
      return;
    }
    setVirtualTaxis(prev => prev.filter(t => t.id !== taxiId));
    toast.success('Taxi virtuel supprimé');
    setHasDraftChanges(true);
  };

  // Basculer l'affichage d'un taxi
  const toggleTaxiCollapse = (taxiId: string) => {
    setVirtualTaxis(prev =>
      prev.map(taxi =>
        taxi.id === taxiId
          ? { ...taxi, isCollapsed: !taxi.isCollapsed }
          : taxi
      )
    );
    setHasDraftChanges(true);
  };

  // Afficher la confirmation avant création
  const handleCreateCourse = async () => {
    const assignedTaxis = virtualTaxis.filter(taxi => taxi.assignedPassengers.length > 0);
    if (assignedTaxis.length === 0) {
      toast.error('Aucun taxi à dispatcher');
      return;
    }

    const totalAssignedPassengers = assignedTaxis.reduce((sum, taxi) => sum + taxi.assignedPassengers.length, 0);
    if (totalAssignedPassengers !== passengers.length) {
      toast.error('Tous les passagers doivent être assignés');
      return;
    }

    setIsCalculating(true);
    const updatedTaxis = await Promise.all(
      assignedTaxis.map(async (taxi) => {
        const estimation = await calculateRoutes(taxi);
        return { ...taxi, routeEstimation: estimation };
      })
    );

    setVirtualTaxis(prev =>
      prev.map(taxi => {
        const updated = updatedTaxis.find(t => t.id === taxi.id);
        return updated || taxi;
      })
    );
    setIsCalculating(false);
    setShowConfirmationDialog(true);
  };

  // Créer la course après confirmation
  const confirmCreateCourse = async () => {
    try {
      const assignedTaxis = virtualTaxis.filter(taxi => taxi.assignedPassengers.length > 0);
      const updateData = {
        employeeTransports: assignedTaxis.flatMap(taxi =>
          taxi.assignedPassengers.map(passenger => ({
            id: passenger.id,
            virtualTaxiId: taxi.id,
          }))
        ),
        status: 'DISPATCHED',
        direction: isHomeToWork ? 'HOMETOOFFICE' : 'OFFICETOHOME',
      };

      await demandeService.updateTransportRequest(id!, updateData);
      setVirtualTaxis(prev =>
        prev.map(taxi =>
          taxi.assignedPassengers.length > 0
            ? { ...taxi, status: 'dispatched' as const }
            : taxi
        )
      );
      setHasDraftChanges(false);
      toast.success(`Course créée avec ${assignedTaxis.length} taxi(s)`);
      navigate('/transport/history');
    } catch (err) {
      toast.error('Échec de la création de la course');
    } finally {
      setShowConfirmationDialog(false);
    }
  };

  // Formatter la date et l'heure
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return { date: 'Non spécifié', time: '' };
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const allPassengersAssigned = Object.keys(unassignedPassengersByDeparture).length === 0;

  useEffect(() => {
    if (hasDraftChanges) {
      saveDraft();
    }
  }, [virtualTaxis]);

  if (loading) {
    return <div className="text-center py-6">Chargement...</div>;
  }

  if (error || !transportRequest) {
    return <div className="text-center py-6 text-red-500">{error || 'Aucune donnée disponible'}</div>;
  }

  const { date, time } = formatDateTime(transportRequest.scheduledDate);

  return (
    <div className="space-y-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="flex-shrink-0">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Retour</span>
          </Button>
          <h2 className="text-lg sm:text-xl font-bold truncate">
            <span className="hidden sm:inline">Dispatch Groupe - </span>{transportRequest.reference || `TR-${id}`}
          </h2>
        </div>
        {hasDraftChanges && (
          <Button variant="outline" onClick={saveDraft} size="sm" className="w-full sm:w-auto">
            Sauvegarder brouillon
          </Button>
        )}
      </div>

      {/* Request Summary */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{date}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs">{isHomeToWork ? `Départ: ${time}` : `Arrivée: ${time}`}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{passengers.length} passagers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Car className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{virtualTaxis.length} taxi(s)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Home className={`h-4 w-4 ${isHomeToWork ? 'text-etaxi-yellow' : 'text-muted-foreground'}`} />
              <Switch checked={!isHomeToWork} disabled />
              <Briefcase className={`h-4 w-4 ${!isHomeToWork ? 'text-etaxi-yellow' : 'text-muted-foreground'}`} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="font-medium truncate">{transportRequest.enterprise?.name || 'Non spécifié'}</div>
              <div className="text-muted-foreground text-xs truncate">
                Par: {transportRequest.requestedBy?.fullName || 'Inconnu'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Passengers by departure */}
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
                  {passengers.map(passenger => (
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
                            {virtualTaxis
                              .filter(t => t.assignedPassengers.length < t.capacity)
                              .map(taxi => (
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

        {/* Virtual Taxis */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Car className="h-5 w-5" />
              <span>Taxis virtuels</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {virtualTaxis.map(taxi => (
              <div
                key={taxi.id}
                onDragOver={!isMobile ? handleDragOver : undefined}
                onDrop={!isMobile ? e => handleDrop(e, taxi.id) : undefined}
                className={`border rounded transition-all ${
                  taxi.status === 'available'
                    ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20'
                    : taxi.status === 'assigned'
                    ? 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20'
                    : 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20'
                }`}
              >
                {getTaxiWarning(taxi) && (
                  <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm p-2 flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{getTaxiWarning(taxi)}</span>
                    <button
                      className="ml-auto p-1 rounded hover:bg-yellow-200 focus:outline-none cursor-pointer"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {/* implement close logic if needed */}}
                      title="Fermer l'alerte"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{taxi.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          taxi.status === 'available' ? 'secondary' : taxi.status === 'assigned' ? 'default' : 'outline'
                        }
                        className="text-xs"
                      >
                        {taxi.status === 'available' ? 'Disponible' : taxi.status === 'assigned' ? 'Assigné' : 'En route'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {taxi.assignedPassengers.length}/{taxi.capacity}
                      </span>
                      <>
                        {taxi.assignedPassengers.length > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleTaxiCollapse(taxi.id)}
                            className="h-6 w-6 p-0"
                          >
                            {taxi.isCollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeVirtualTaxi(taxi.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          disabled={virtualTaxis.length <= initialTaxiCount || taxi.assignedPassengers.length > 0}
                          title={virtualTaxis.length <= initialTaxiCount ? `Minimum ${initialTaxiCount} taxi(s) requis` : ''}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    </div>
                  </div>

                  {taxi.assignedPassengers.length > 0 && !taxi.isCollapsed && (
                    <div className="space-y-1 mb-2">
                      {taxi.assignedPassengers.map(passenger => (
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

      {/* Confirmation Dialog */}
      <Dialog  open={showConfirmationModal} onOpenChange={setShowConfirmationDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Confirmer la création de la course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Taxi</TableHead>
                  <TableHead>Passagers</TableHead>
                  <TableHead>Places disponibles</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Trajet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {virtualTaxis
                  .filter(taxi => taxi.assignedPassengers.length > 0)
                  .map(taxi => (
                    <TableRow key={taxi.id}>
                      <TableCell className="font-medium">{taxi.name}</TableCell>
                      <TableCell>{taxi.assignedPassengers.length}/{taxi.capacity}</TableCell>
                      <TableCell>{taxi.capacity - taxi.assignedPassengers.length}</TableCell>
                      <TableCell>{taxi.routeEstimation?.distance || 'Non disponible'}</TableCell>
                      <TableCell>{taxi.routeEstimation?.duration || 'Non disponible'}</TableCell>
                      <TableCell>
                        {taxi.routeEstimation ? (
                          <ul className="list-disc pl-4 text-sm">
                            {taxi.routeEstimation.points.map((point, index) => (
                              <li key={index} className="truncate">{point}</li>
                            ))}
                          </ul>
                        ) : (
                          'Non disponible'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmationDialog(false)}>
              Annuler
            </Button>
            <Button onClick={confirmCreateCourse} disabled={isCalculating}>
              {isCalculating ? 'Calcul en cours...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-2 z-50">
        <Button
          onClick={addVirtualTaxi}
          className="rounded-full w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
          title="Ajouter un taxi virtuel"
        >
          <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
        <Button
          onClick={handleCreateCourse}
          disabled={!allPassengersAssigned || isCalculating}
          className="rounded-full w-12 h-12 sm:w-14 sm:h-14 bg-etaxi-yellow hover:bg-yellow-500 text-black shadow-lg"
          title="Créer une course"
        >
          <Navigation className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>
    </div>
  );
}