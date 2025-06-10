import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableWithPagination } from '@/components/ui/table-with-pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Car, Plus, Eye, Copy, Navigation, Calendar as CalendarIcon, X, AlertTriangle, History, Star, MapPin, Clock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface TransportRequest {
  id: string;
  requestedBy: string;
  passengerCount: number;
  departureLocation: string;
  arrivalLocation: string;
  scheduledDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  note?: string;
}

interface TransportHistory {
  id: string;
  requestId: string;
  reference: string;
  type: 'individual';
  requestedBy: string;
  passengerCount: number;
  departureLocation: string;
  arrivalLocation: string;
  scheduledDate: string;
  completedDate: string;
  status: 'completed' | 'cancelled';
  driver?: {
    name: string;
    rating: number;
    vehicle: string;
  };
  cost: number;
  duration: string;
  distance: string;
  note?: string;
}

interface DuplicateSchedule {
  date: Date;
  time: string;
}

export function IndividualTransportPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'requests' | 'history'>('requests');
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TransportRequest | null>(null);
  const [duplicateSchedules, setDuplicateSchedules] = useState<DuplicateSchedule[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [historyDetailsOpen, setHistoryDetailsOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<TransportHistory | null>(null);
  
  const [requests, setRequests] = useState<TransportRequest[]>([
    {
      id: '1',
      requestedBy: 'Jean Dupont',
      passengerCount: 1,
      departureLocation: 'Domicile',
      arrivalLocation: 'Aéroport CDG',
      scheduledDate: '2024-01-20 09:00',
      status: 'pending'
    },
    {
      id: '2',
      requestedBy: 'Pierre Durand',
      passengerCount: 1,
      departureLocation: 'Gare du Nord',
      arrivalLocation: 'Bureau client',
      scheduledDate: '2024-01-25 14:00',
      status: 'completed'
    },
    {
      id: '3',
      requestedBy: 'Sophie Martin',
      passengerCount: 1,
      departureLocation: 'Hôtel',
      arrivalLocation: 'Centre de conférences',
      scheduledDate: '2024-01-28 08:30',
      status: 'approved'
    }
  ]);

  const [history] = useState<TransportHistory[]>([
    {
      id: '1',
      requestId: '2',
      reference: 'TR-2024-001',
      type: 'individual',
      requestedBy: 'Pierre Durand',
      passengerCount: 1,
      departureLocation: 'Gare du Nord, 75010 Paris',
      arrivalLocation: 'Bureau client - 25 Rue de la République, 75011 Paris',
      scheduledDate: '2024-01-25 14:00',
      completedDate: '2024-01-25 14:30',
      status: 'completed',
      driver: {
        name: 'Jean Moreau',
        rating: 4.6,
        vehicle: 'Volkswagen e-Golf - IJ-789-KL'
      },
      cost: 25.00,
      duration: '30min',
      distance: '8 km'
    },
    {
      id: '2',
      requestId: '4',
      reference: 'TR-2024-002',
      type: 'individual',
      requestedBy: 'Marie Laurent',
      passengerCount: 1,
      departureLocation: 'Hôtel Marriott, 75008 Paris',
      arrivalLocation: 'Gare de Lyon, 75012 Paris',
      scheduledDate: '2024-01-12 16:00',
      completedDate: '',
      status: 'cancelled',
      cost: 0,
      duration: '',
      distance: '',
      note: 'Annulé par le client'
    }
  ]);

  const handleViewRequest = (request: TransportRequest) => {
    navigate(`/transport/${request.id}`);
  };

  const handleViewHistoryDetails = (historyItem: TransportHistory) => {
    setSelectedHistory(historyItem);
    setHistoryDetailsOpen(true);
  };

  const handleDuplicateRequest = (request: TransportRequest) => {
    setSelectedRequest(request);
    setDuplicateDialogOpen(true);
    setSelectedDates([]);
    setDuplicateSchedules([]);
  };

  const handleCancelRequest = (request: TransportRequest) => {
    const scheduledTime = new Date(request.scheduledDate).getTime();
    const currentTime = new Date().getTime();
    const thirtyMinutesInMs = 30 * 60 * 1000;
    
    if (currentTime >= (scheduledTime - thirtyMinutesInMs)) {
      toast.error('Impossible d\'annuler une demande moins de 30 minutes avant le départ');
      return false;
    }
    
    setRequests(prev => 
      prev.map(req => 
        req.id === request.id 
          ? { ...req, status: 'rejected' as const } 
          : req
      )
    );
    toast.success('Demande annulée avec succès');
    return true;
  };

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (dates) {
      setSelectedDates(dates);
      const newSchedules = dates.map(date => {
        const existing = duplicateSchedules.find(s => 
          s.date.toDateString() === date.toDateString()
        );
        return existing || { date, time: '09:00' };
      });
      setDuplicateSchedules(newSchedules);
    }
  };

  const updateScheduleTime = (date: Date, time: string) => {
    setDuplicateSchedules(prev => 
      prev.map(schedule => 
        schedule.date.toDateString() === date.toDateString()
          ? { ...schedule, time }
          : schedule
      )
    );
  };

  const removeSchedule = (date: Date) => {
    setDuplicateSchedules(prev => 
      prev.filter(schedule => schedule.date.toDateString() !== date.toDateString())
    );
    setSelectedDates(prev => 
      prev.filter(d => d.toDateString() !== date.toDateString())
    );
  };

  const confirmDuplicate = () => {
    if (selectedRequest && duplicateSchedules.length > 0) {
      duplicateSchedules.forEach((schedule, index) => {
        const duplicatedRequest = {
          ...selectedRequest,
          id: `${selectedRequest.id}-copy-${Date.now()}-${index}`,
          scheduledDate: `${schedule.date.toISOString().split('T')[0]} ${schedule.time}`,
          status: 'pending' as const
        };
        
        console.log('Duplicating request:', duplicatedRequest);
      });
      
      toast.success(`${duplicateSchedules.length} demande(s) dupliquée(s) avec succès`);
      setDuplicateDialogOpen(false);
      setSelectedRequest(null);
      setDuplicateSchedules([]);
      setSelectedDates([]);
    }
  };

  const getStatusBadge = (status: TransportRequest['status'] | TransportHistory['status']) => {
    const variants = {
      pending: { variant: 'outline' as const, label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      approved: { variant: 'default' as const, label: 'Approuvée', color: 'bg-blue-100 text-blue-800' },
      rejected: { variant: 'destructive' as const, label: 'Rejetée', color: 'bg-red-100 text-red-800' },
      completed: { variant: 'secondary' as const, label: 'Terminée', color: 'bg-green-100 text-green-800' },
      cancelled: { variant: 'destructive' as const, label: 'Annulée', color: 'bg-red-100 text-red-800' }
    };
    
    const { label, color } = variants[status];
    return <Badge className={color}>{label}</Badge>;
  };

  const requestColumns = [
    {
      header: 'Demandeur',
      accessor: 'requestedBy' as keyof TransportRequest,
      render: (request: TransportRequest) => (
        <div>
          <div className="font-medium">{request.requestedBy}</div>
          <div className="text-sm text-muted-foreground">
            <Badge variant="outline">Individuel</Badge>
          </div>
        </div>
      )
    },
    {
      header: 'Passagers',
      accessor: 'passengerCount' as keyof TransportRequest,
      render: (request: TransportRequest) => `${request.passengerCount} passager`
    },
    {
      header: 'Trajet',
      accessor: 'departureLocation' as keyof TransportRequest,
      render: (request: TransportRequest) => (
        <div className="text-sm">
          <div>De: {request.departureLocation}</div>
          <div>Vers: {request.arrivalLocation}</div>
        </div>
      )
    },
    {
      header: 'Date prévue',
      accessor: 'scheduledDate' as keyof TransportRequest,
      render: (request: TransportRequest) => new Date(request.scheduledDate).toLocaleString('fr-FR')
    },
    {
      header: 'Statut',
      accessor: 'status' as keyof TransportRequest,
      render: (request: TransportRequest) => getStatusBadge(request.status)
    }
  ];

  const historyColumns = [
    {
      header: 'Référence',
      accessor: 'reference' as keyof TransportHistory,
      render: (item: TransportHistory) => (
        <div>
          <div className="font-medium text-etaxi-yellow">{item.reference}</div>
          <div className="text-sm text-muted-foreground">
            <Badge variant="outline" className="text-xs">Individuel</Badge>
          </div>
        </div>
      )
    },
    {
      header: 'Demandeur',
      accessor: 'requestedBy' as keyof TransportHistory,
      render: (item: TransportHistory) => (
        <div>
          <div className="font-medium">{item.requestedBy}</div>
          <div className="text-sm text-muted-foreground">
            {item.passengerCount} passager{item.passengerCount > 1 ? 's' : ''}
          </div>
        </div>
      )
    },
    {
      header: 'Trajet',
      accessor: 'departureLocation' as keyof TransportHistory,
      render: (item: TransportHistory) => (
        <div className="text-sm max-w-xs">
          <div className="flex items-center space-x-1 mb-1">
            <MapPin className="h-3 w-3 text-green-500" />
            <span className="truncate">{item.departureLocation.split(' - ')[0]}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3 text-red-500" />
            <span className="truncate">{item.arrivalLocation.split(' - ')[0]}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Date',
      accessor: 'scheduledDate' as keyof TransportHistory,
      render: (item: TransportHistory) => (
        <div className="text-sm">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{new Date(item.scheduledDate).toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(item.scheduledDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      )
    },
    {
      header: 'Chauffeur',
      accessor: 'driver' as keyof TransportHistory,
      render: (item: TransportHistory) => (
        item.driver ? (
          <div className="text-sm">
            <div className="font-medium">{item.driver.name}</div>
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs">{item.driver.rating}</span>
            </div>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      )
    },
    {
      header: 'Coût',
      accessor: 'cost' as keyof TransportHistory,
      render: (item: TransportHistory) => (
        <div className="text-sm font-medium">
          {item.cost > 0 ? `${item.cost.toFixed(2)}€` : '-'}
        </div>
      )
    },
    {
      header: 'Statut',
      accessor: 'status' as keyof TransportHistory,
      render: (item: TransportHistory) => getStatusBadge(item.status)
    }
  ];

  const requestActions = (request: TransportRequest) => (
    <div className="flex items-center space-x-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          handleViewRequest(request);
        }}
        title="Voir les détails"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          handleDuplicateRequest(request);
        }}
        title="Dupliquer"
      >
        <Copy className="h-4 w-4" />
      </Button>
      {(request.status === 'pending' || request.status === 'approved') && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => e.stopPropagation()}
              title="Annuler"
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>Annuler la demande</span>
              </AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir annuler cette demande de transport ? 
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Retour</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => handleCancelRequest(request)}
                className="bg-red-600 hover:bg-red-700"
              >
                Confirmer l'annulation
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );

  const historyActions = (item: TransportHistory) => (
    <Button
      size="sm"
      variant="ghost"
      onClick={(e) => {
        e.stopPropagation();
        handleViewHistoryDetails(item);
      }}
      title="Voir les détails"
    >
      <Eye className="h-4 w-4" />
    </Button>
  );

  const historyFilterOptions = [
    { label: 'Toutes', value: 'all', field: 'status' as keyof TransportHistory },
    { label: 'Terminées', value: 'completed', field: 'status' as keyof TransportHistory },
    { label: 'Annulées', value: 'cancelled', field: 'status' as keyof TransportHistory }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Car className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">Transport individuel</h2>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => navigate('/transport/drafts')}
          >
            Brouillons
          </Button>
          <Button 
            onClick={() => navigate('/transport/create')}
            className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle demande
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'requests' | 'history')}>
        <TabsList>
          <TabsTrigger value="requests" className="flex items-center space-x-2">
            <Car className="h-4 w-4" />
            <span>Demandes ({requests.length})</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Historique ({history.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <TableWithPagination
            data={requests}
            columns={requestColumns}
            actions={requestActions}
            itemsPerPage={10}
            onRowClick={handleViewRequest}
            emptyMessage="Aucune demande de transport individuelle trouvée"
            searchPlaceholder="Rechercher par demandeur, trajet..."
          />
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-4">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <History className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total courses</p>
                      <p className="text-2xl font-bold">{history.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Car className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Terminées</p>
                      <p className="text-2xl font-bold">
                        {history.filter(h => h.status === 'completed').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Passagers</p>
                      <p className="text-2xl font-bold">
                        {history.reduce((sum, h) => sum + h.passengerCount, 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-5 w-5 bg-etaxi-yellow rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-black">€</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Coût total</p>
                      <p className="text-2xl font-bold">
                        {history.reduce((sum, h) => sum + h.cost, 0).toFixed(2)}€
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <TableWithPagination
              data={history}
              columns={historyColumns}
              actions={historyActions}
              filterOptions={historyFilterOptions}
              itemsPerPage={10}
              onRowClick={handleViewHistoryDetails}
              emptyMessage="Aucun historique de transport trouvé"
              searchPlaceholder="Rechercher par référence, demandeur..."
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog pour dupliquer une demande */}
      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Dupliquer la demande - Sélection multiple</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label className="text-base font-medium mb-4 block">Sélectionner les dates</Label>
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={handleDateSelect}
                className="rounded-md border"
              />
            </div>
            
            <div>
              <Label className="text-base font-medium mb-4 block">
                Horaires pour chaque date ({duplicateSchedules.length})
              </Label>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {duplicateSchedules.map((schedule, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {schedule.date.toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                    <Input
                      type="time"
                      value={schedule.time}
                      onChange={(e) => updateScheduleTime(schedule.date, e.target.value)}
                      className="w-32"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeSchedule(schedule.date)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {duplicateSchedules.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Sélectionnez des dates dans le calendrier
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setDuplicateDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={confirmDuplicate}
              className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
              disabled={duplicateSchedules.length === 0}
            >
              Dupliquer ({duplicateSchedules.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour les détails de l'historique */}
      <Dialog open={historyDetailsOpen} onOpenChange={setHistoryDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la course {selectedHistory?.reference}</DialogTitle>
          </DialogHeader>
          
          {selectedHistory && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedHistory.status)}
                <Badge variant="outline">Transport individuel</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Demandeur</p>
                  <p>{selectedHistory.requestedBy}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Passagers</p>
                  <p>{selectedHistory.passengerCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date programmée</p>
                  <p>{new Date(selectedHistory.scheduledDate).toLocaleString('fr-FR')}</p>
                </div>
                {selectedHistory.completedDate && (
                  <div>
                    <p className="text-sm font-medium">Date de fin</p>
                    <p>{new Date(selectedHistory.completedDate).toLocaleString('fr-FR')}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Trajet</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{selectedHistory.departureLocation}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span className="text-sm">{selectedHistory.arrivalLocation}</span>
                  </div>
                </div>
              </div>

              {selectedHistory.driver && (
                <div>
                  <p className="text-sm font-medium mb-2">Chauffeur</p>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{selectedHistory.driver.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedHistory.driver.vehicle}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{selectedHistory.driver.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedHistory.status === 'completed' && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Durée</p>
                    <p>{selectedHistory.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Distance</p>
                    <p>{selectedHistory.distance}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Coût</p>
                    <p className="font-bold text-etaxi-yellow">{selectedHistory.cost.toFixed(2)}€</p>
                  </div>
                </div>
              )}

              {selectedHistory.note && (
                <div>
                  <p className="text-sm font-medium mb-2">Note</p>
                  <p className="text-sm bg-muted/50 p-3 rounded">{selectedHistory.note}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}