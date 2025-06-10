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
import { Users, Plus, Eye, Copy, Navigation, Calendar as CalendarIcon, X, AlertTriangle, History, Star, MapPin, Clock, User, Car } from 'lucide-react';
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
  type: 'group';
  requestedBy: string;
  passengerCount: number;
  departureLocation: string;
  arrivalLocation: string;
  scheduledDate: string;
  completedDate: string;
  status: 'completed' | 'cancelled';
  taxiCount: number;
  courses: {
    id: string;
    taxiNumber: string;
    driver: {
      name: string;
      rating: number;
      vehicle: string;
    };
    passengers: string[];
    cost: number;
    duration: string;
    distance: string;
  }[];
  totalCost: number;
  note?: string;
}

interface DuplicateSchedule {
  date: Date;
  time: string;
}

export function GroupTransportPage() {
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
      id: '2',
      requestedBy: 'Marie Martin',
      passengerCount: 5,
      departureLocation: 'Siège social',
      arrivalLocation: 'Centre de conférences',
      scheduledDate: '2024-01-22 08:30',
      status: 'approved'
    },
    {
      id: '4',
      requestedBy: 'Thomas Dubois',
      passengerCount: 8,
      departureLocation: 'Hôtel Marriott',
      arrivalLocation: 'Aéroport CDG',
      scheduledDate: '2024-01-26 06:00',
      status: 'pending'
    },
    {
      id: '5',
      requestedBy: 'Claire Rousseau',
      passengerCount: 3,
      departureLocation: 'Bureau Lyon',
      arrivalLocation: 'Gare Part-Dieu',
      scheduledDate: '2024-01-30 17:30',
      status: 'completed'
    }
  ]);

  const [history] = useState<TransportHistory[]>([
    {
      id: '1',
      requestId: '5',
      reference: 'TR-2024-003',
      type: 'group',
      requestedBy: 'Claire Rousseau',
      passengerCount: 3,
      departureLocation: 'Bureau Lyon',
      arrivalLocation: 'Gare Part-Dieu',
      scheduledDate: '2024-01-30 17:30',
      completedDate: '2024-01-30 18:15',
      status: 'completed',
      taxiCount: 1,
      courses: [
        {
          id: 'course-1',
          taxiNumber: 'Taxi #1',
          driver: {
            name: 'Ahmed Hassan',
            rating: 4.8,
            vehicle: 'Toyota Prius - AB-123-CD'
          },
          passengers: ['Claire Rousseau', 'Marc Dubois', 'Sophie Laurent'],
          cost: 35.00,
          duration: '45min',
          distance: '15 km'
        }
      ],
      totalCost: 35.00,
      note: 'Transport équipe pour formation'
    },
    {
      id: '2',
      requestId: '6',
      reference: 'TR-2024-004',
      type: 'group',
      requestedBy: 'Pierre Martin',
      passengerCount: 8,
      departureLocation: 'Siège social',
      arrivalLocation: 'Centre de conférences',
      scheduledDate: '2024-01-28 08:30',
      completedDate: '2024-01-28 09:30',
      status: 'completed',
      taxiCount: 2,
      courses: [
        {
          id: 'course-2',
          taxiNumber: 'Taxi #1',
          driver: {
            name: 'Marie Dubois',
            rating: 4.9,
            vehicle: 'Mercedes Vito - EF-456-GH'
          },
          passengers: ['Pierre Martin', 'Jean Dupont', 'Marie Laurent', 'Sophie Durand'],
          cost: 45.00,
          duration: '1h',
          distance: '20 km'
        },
        {
          id: 'course-3',
          taxiNumber: 'Taxi #2',
          driver: {
            name: 'Jean Moreau',
            rating: 4.6,
            vehicle: 'Volkswagen e-Golf - IJ-789-KL'
          },
          passengers: ['Thomas Rousseau', 'Claire Martin', 'Luc Bernard', 'Isabelle Garcia'],
          cost: 45.00,
          duration: '1h',
          distance: '20 km'
        }
      ],
      totalCost: 90.00,
      note: 'Transport équipe pour réunion client importante'
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

  const handleDispatchRequest = (request: TransportRequest) => {
    if (request.status !== 'approved') {
      toast.error('Seules les demandes approuvées peuvent être dispatchées');
      return;
    }
    navigate(`/transport/${request.id}/group-dispatch`);
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
        
        console.log('Duplicating group request:', duplicatedRequest);
      });
      
      toast.success(`${duplicateSchedules.length} demande(s) de groupe dupliquée(s) avec succès`);
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
            <Badge variant="secondary">Groupe</Badge>
          </div>
        </div>
      )
    },
    {
      header: 'Passagers',
      accessor: 'passengerCount' as keyof TransportRequest,
      render: (request: TransportRequest) => `${request.passengerCount} passagers`
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
            <Badge variant="secondary" className="text-xs">Groupe</Badge>
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
            {item.passengerCount} passagers • {item.taxiCount} taxi{item.taxiCount > 1 ? 's' : ''}
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
            <span className="truncate">{item.departureLocation}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3 text-red-500" />
            <span className="truncate">{item.arrivalLocation}</span>
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
      header: 'Courses',
      accessor: 'taxiCount' as keyof TransportHistory,
      render: (item: TransportHistory) => (
        <div className="text-sm">
          <div className="font-medium">{item.courses.length} course{item.courses.length > 1 ? 's' : ''}</div>
          <div className="text-xs text-muted-foreground">
            {item.taxiCount} taxi{item.taxiCount > 1 ? 's' : ''}
          </div>
        </div>
      )
    },
    {
      header: 'Coût total',
      accessor: 'totalCost' as keyof TransportHistory,
      render: (item: TransportHistory) => (
        <div className="text-sm font-medium">
          {item.totalCost > 0 ? `${item.totalCost.toFixed(2)}€` : '-'}
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
      {request.status === 'approved' && (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            handleDispatchRequest(request);
          }}
          title="Dispatcher"
          className="text-etaxi-yellow hover:text-yellow-600"
        >
          <Navigation className="h-4 w-4" />
        </Button>
      )}
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
                Êtes-vous sûr de vouloir annuler cette demande de transport de groupe ? 
                Cette action est irréversible et tous les passagers seront notifiés.
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
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-etaxi-yellow flex-shrink-0" />
          <h2 className="text-xl sm:text-2xl font-bold truncate">
            <span className="hidden sm:inline">Demandes de transport de groupe</span>
            <span className="sm:hidden">Transport de groupe</span>
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <Button 
            variant="outline"
            onClick={() => navigate('/transport/drafts')}
            className="w-full sm:w-auto"
          >
            Brouillons
          </Button>
          <Button 
            onClick={() => navigate('/transport/create-group')}
            className="bg-etaxi-yellow hover:bg-yellow-500 text-black w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nouvelle demande de groupe</span>
            <span className="sm:hidden">Nouvelle demande</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'requests' | 'history')}>
        <TabsList>
          <TabsTrigger value="requests" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
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
            emptyMessage="Aucune demande de transport de groupe trouvée"
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
                      <p className="text-sm text-muted-foreground">Taxis utilisés</p>
                      <p className="text-2xl font-bold">
                        {history.reduce((sum, h) => sum + h.taxiCount, 0)}
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
                        {history.reduce((sum, h) => sum + h.totalCost, 0).toFixed(2)}€
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto my-4 mx-4">
          <DialogHeader>
            <DialogTitle>Dupliquer la demande de groupe - Sélection multiple</DialogTitle>
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
                    <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
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
                      className="w-32 flex-shrink-0"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeSchedule(schedule.date)}
                      className="text-red-500 hover:text-red-700 flex-shrink-0"
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
          
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
            <Button variant="outline" onClick={() => setDuplicateDialogOpen(false)} className="w-full sm:w-auto">
              Annuler
            </Button>
            <Button 
              onClick={confirmDuplicate}
              className="bg-etaxi-yellow hover:bg-yellow-500 text-black w-full sm:w-auto"
              disabled={duplicateSchedules.length === 0}
            >
              Dupliquer ({duplicateSchedules.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour les détails de l'historique */}
      <Dialog open={historyDetailsOpen} onOpenChange={setHistoryDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la course {selectedHistory?.reference}</DialogTitle>
          </DialogHeader>
          
          {selectedHistory && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedHistory.status)}
                <Badge variant="secondary">Transport de groupe</Badge>
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

              {/* Courses */}
              <div>
                <p className="text-sm font-medium mb-2">Courses ({selectedHistory.courses.length})</p>
                <div className="space-y-4">
                  {selectedHistory.courses.map((course, index) => (
                    <Card key={index} className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4 text-etaxi-yellow" />
                            <span>{course.taxiNumber}</span>
                          </div>
                          <Badge variant="outline">{course.passengers.length} passagers</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{course.driver.name}</p>
                            <p className="text-xs text-muted-foreground">{course.driver.vehicle}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{course.driver.rating}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium mb-1">Passagers:</p>
                          <div className="grid grid-cols-2 gap-1">
                            {course.passengers.map((passenger, idx) => (
                              <div key={idx} className="text-xs flex items-center space-x-1">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span>{passenger}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="font-medium">Durée</p>
                            <p>{course.duration}</p>
                          </div>
                          <div>
                            <p className="font-medium">Distance</p>
                            <p>{course.distance}</p>
                          </div>
                          <div>
                            <p className="font-medium">Coût</p>
                            <p className="font-bold text-etaxi-yellow">{course.cost.toFixed(2)}€</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Total Cost */}
              <div className="bg-etaxi-yellow/10 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Coût total</p>
                  <p className="text-xl font-bold text-etaxi-yellow">{selectedHistory.totalCost.toFixed(2)}€</p>
                </div>
              </div>

              {/* Note */}
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