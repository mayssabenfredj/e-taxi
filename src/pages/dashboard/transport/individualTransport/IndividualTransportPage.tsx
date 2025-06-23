import React, { useState, useEffect } from 'react';
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
import { TransportRequestResponse, TransportStatus, DuplicateSchedule, TransportHistory, CreateTransportRequestDto, GetTransportRequestsQueryDto } from '@/types/demande';
import { demandeService } from '@/services/demande.service';
import { useAuth } from '@/contexts/AuthContext';
import { useRolesAndSubsidiaries, Subsidiary } from '@/hooks/useRolesAndSubsidiaries';

export function IndividualTransportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subsidiaries, loading: subsidiariesLoading, error: subsidiariesError } = useRolesAndSubsidiaries(user?.enterpriseId);
  const [activeTab, setActiveTab] = useState<'requests' | 'history'>('requests');
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TransportRequestResponse | null>(null);
  const [duplicateSchedules, setDuplicateSchedules] = useState<DuplicateSchedule[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [historyDetailsOpen, setHistoryDetailsOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<TransportHistory | null>(null);
  const [requests, setRequests] = useState<TransportRequestResponse[]>([]);
  const [history, setHistory] = useState<TransportHistory[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [totalHistory, setTotalHistory] = useState(0);
  const [requestsSkip, setRequestsSkip] = useState(0);
  const [requestsTake] = useState(10);
  const [historySkip, setHistorySkip] = useState(0);
  const [historyTake] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<TransportStatus | null>(null);

  const fetchRequests = async (resetPagination: boolean = false) => {
    setLoading(true);
    try {
      if (resetPagination) {
        setRequestsSkip(0);
      }
      const query: GetTransportRequestsQueryDto = {
        page: Math.floor(requestsSkip / requestsTake) + 1,
        limit: requestsTake,
      };

      if (user) {
        const userRoles = user.roles.map((r) => r.role.name);
        if (userRoles.includes('ADMIN_ENTREPRISE') && user.enterpriseId) {
          query.enterpriseId = user.enterpriseId;
          if (selectedSubsidiary) {
            query.subsidiaryId = selectedSubsidiary;
            console.log('Filtering by subsidiary:', { enterpriseId: query.enterpriseId, subsidiaryId: query.subsidiaryId }); // Debug query
          }
        } else if (userRoles.includes('ADMIN_FILIALE') && user.enterpriseId && user.subsidiaryId) {
          query.enterpriseId = user.enterpriseId;
          query.subsidiaryId = user.subsidiaryId;
          if (selectedStatus) {
            query.status = selectedStatus;
            console.log('Filtering by status:', { enterpriseId: query.enterpriseId, subsidiaryId: query.subsidiaryId, status: query.status }); // Debug query
          }
        }
      }

      console.log('Sending request with query:', query); // Debug API call
      const response = await demandeService.getTransportRequests(query);
      console.log('API response:', response.data);
      const responsesFiltered: TransportRequestResponse[] = response.data.filter(req => req.employeeTransports.length === 1);
      setRequests(responsesFiltered);
      console.log('Filtered requests:', responsesFiltered);
      console.log('Filtered requests length:', responsesFiltered.length);
      setTotalRequests(response.pagination.total);
    } catch (error) {
      console.error('Fetch requests error:', error);
      toast.error('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (resetPagination: boolean = false) => {
    setLoading(true);
    try {
      if (resetPagination) {
        setHistorySkip(0);
      }
      const query: GetTransportRequestsQueryDto = {
        page: Math.floor(historySkip / historyTake) + 1,
        limit: historyTake,
      };

      if (user) {
        const userRoles = user.roles.map((r) => r.role.name);
        if (userRoles.includes('ADMIN_ENTREPRISE') && user.enterpriseId) {
          query.enterpriseId = user.enterpriseId;
          if (selectedSubsidiary) {
            query.subsidiaryId = selectedSubsidiary;
            console.log('History filtering by subsidiary:', { enterpriseId: query.enterpriseId, subsidiaryId: query.subsidiaryId }); // Debug query
          }
        } else if (userRoles.includes('ADMIN_FILIALE') && user.enterpriseId && user.subsidiaryId) {
          query.enterpriseId = user.enterpriseId;
          query.subsidiaryId = user.subsidiaryId;
          if (selectedStatus) {
            query.status = selectedStatus;
            console.log('History filtering by status:', { enterpriseId: query.enterpriseId, subsidiaryId: query.subsidiaryId, status: query.status }); // Debug query
          }
        }
      }

      console.log('Sending history request with query:', query); // Debug API call
      const response = await demandeService.getTransportRequests(query);
      console.log('History API response:', response.data);
      const historyData: TransportHistory[] = response.data
        .filter(req => req.employeeTransports.length === 1)
        .map(req => ({
          id: req.id,
          requestId: req.id,
          reference: req.reference || `TR-${req.id}`,
          type: 'individual',
          requestedBy: req.requestedBy?.fullName || 'Inconnu',
          passengerCount: req.passengerCount || 1,
          departureLocation: req.employeeTransports[0]?.departure?.formattedAddress || 'Non spécifié',
          arrivalLocation: req.employeeTransports[0]?.arrival?.formattedAddress || 'Non spécifié',
          scheduledDate: req.scheduledDate || new Date().toISOString(),
          completedDate: req.employeeTransports[0]?.actualArrival || req.updatedAt || new Date().toISOString(),
          status: (req.status === 'COMPLETED' ? 'completed' : 'cancelled') as 'completed' | 'cancelled',
          driver: req.employeeTransports[0]?.rideId ? {
            name: 'Unknown', // Update with actual driver data
            rating: 0,
            vehicle: 'Unknown',
          } : undefined,
          cost: req.cost || 0,
          duration: req.duration || '',
          distance: req.distance || '',
          note: req.note || '',
        }));
      setHistory(historyData);
      setTotalHistory(response.pagination.total);
    } catch (error) {
      console.error('Fetch history error:', error);
      toast.error('Erreur lors du chargement de l\'historique');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subsidiariesError) {
      toast.error(subsidiariesError);
    }
    if (activeTab === 'requests') {
      fetchRequests();
    } else if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, requestsSkip, requestsTake, historySkip, historyTake, selectedSubsidiary, selectedStatus, subsidiariesError]);

  const handleViewRequest = (request: TransportRequestResponse) => {
    navigate(`/transport/${request.id}`);
  };

  const handleViewHistoryDetails = (historyItem: TransportHistory) => {
    setSelectedHistory(historyItem);
    setHistoryDetailsOpen(true);
  };

  const handleDuplicateRequest = (request: TransportRequestResponse) => {
    setSelectedRequest(request);
    setDuplicateDialogOpen(true);
    setSelectedDates([]);
    setDuplicateSchedules([]);
  };

  const handleCancelRequest = async (request: TransportRequestResponse) => {
    if (!request.scheduledDate) {
      toast.error('La date prévue est manquante, impossible d\'annuler');
      return false;
    }

    const scheduledTime = new Date(request.scheduledDate).getTime();
    const currentTime = new Date().getTime();
    const thirtyMinutesInMs = 30 * 60 * 1000;

    if (currentTime >= scheduledTime - thirtyMinutesInMs) {
      toast.error('Impossible d\'annuler une demande moins de 30 minutes avant le départ');
      return false;
    }

    try {
      const existingRequest = await demandeService.getTransportRequestById(request.id);
      const updatedRequest: TransportRequestResponse = {
        ...existingRequest,
        status: TransportStatus.CANCELLED,
      };

      // TODO: Implement updateTransportRequest
      /*await demandeService.updateTransportRequest({
        id: updatedRequest.id,
        status: updatedRequest.status,
        employeeTransports: updatedRequest.employeeTransports || [],
      });*/

      setRequests(prev =>
        prev.map(req =>
          req.id === request.id
            ? { ...req, status: TransportStatus.CANCELLED }
            : req
        )
      );
      toast.success('Demande annulée avec succès');
      return true;
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error('Erreur lors de l\'annulation de la demande');
      return false;
    }
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

  const confirmDuplicate = async () => {
    if (selectedRequest && duplicateSchedules.length > 0) {
      const newRequests: CreateTransportRequestDto[] = duplicateSchedules.map((schedule, index) => ({
        ...selectedRequest,
        reference: `${selectedRequest.reference || 'TR'}-copy-${Date.now()}-${index}`,
        scheduledDate: `${schedule.date.toISOString().split('T')[0]} ${schedule.time}`,
        status: TransportStatus.PENDING,
        employeeTransports: selectedRequest.employeeTransports.map(et => ({
          ...et,
          startTime: `${schedule.date.toISOString().split('T')[0]} ${schedule.time}`,
        })),
      }));

      try {
        await demandeService.createMultipleTransportRequests(newRequests);
        toast.success(`${duplicateSchedules.length} demande(s) dupliquée(s) avec succès`);
        fetchRequests(true);
      } catch (error) {
        console.error('Error duplicating requests:', error);
        toast.error('Erreur lors de la duplication des demandes');
      } finally {
        setDuplicateDialogOpen(false);
        setSelectedRequest(null);
        setDuplicateSchedules([]);
        setSelectedDates([]);
      }
    }
  };

  const getStatusBadge = (status: TransportStatus | TransportHistory['status']) => {
    const variants = {
      [TransportStatus.PENDING]: { variant: 'outline' as const, label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      [TransportStatus.APPROVED]: { variant: 'default' as const, label: 'Approuvée', color: 'bg-blue-100 text-blue-800' },
      [TransportStatus.REJECTED]: { variant: 'destructive' as const, label: 'Rejetée', color: 'bg-red-100 text-red-800' },
      [TransportStatus.COMPLETED]: { variant: 'secondary' as const, label: 'Terminée', color: 'bg-green-100 text-green-800' },
      [TransportStatus.CANCELLED]: { variant: 'destructive' as const, label: 'Annulée', color: 'bg-gray-100 text-gray-800' },
      [TransportStatus.DISPATCHED]: { variant: 'default' as const, label: 'Dispatchée', color: 'bg-purple-100 text-purple-800' },
      [TransportStatus.ASSIGNED]: { variant: 'default' as const, label: 'Assignée', color: 'bg-indigo-100 text-indigo-800' },
      [TransportStatus.IN_PROGRESS]: { variant: 'default' as const, label: 'En cours', color: 'bg-teal-100 text-teal-800' },
      completed: { variant: 'secondary' as const, label: 'Terminée', color: 'bg-green-100 text-green-800' },
      cancelled: { variant: 'destructive' as const, label: 'Annulée', color: 'bg-gray-100 text-gray-800' },
    };

    const { variant, color, label } = variants[status] || { variant: 'outline' as const, label: String(status), color: 'bg-gray-100 text-gray-800' };
    return <Badge variant={variant} className={color}>{label}</Badge>;
  };

  const handleSubsidiaryFilterChange = (subsidiaryId: string | null) => {
    setSelectedSubsidiary(subsidiaryId);
    setRequestsSkip(0);
    setHistorySkip(0);
    if (activeTab === 'requests') {
      fetchRequests(true);
    } else if (activeTab === 'history') {
      fetchHistory(true);
    }
  };

  const handleStatusFilterChange = (status: TransportStatus | null) => {
    setSelectedStatus(status);
    setRequestsSkip(0);
    setHistorySkip(0);
    if (activeTab === 'requests') {
      fetchRequests(true);
    } else if (activeTab === 'history') {
      fetchHistory(true);
    }
  };

  const subsidiaryFilterOptions = [
    { label: 'Toutes les filiales', value: null },
    ...subsidiaries.map((sub) => ({
      label: sub.name,
      value: sub.id,
    })),
  ];

  const statusFilterOptions = [
    { label: 'Tous les statuts', value: null },
    { label: 'En attente', value: TransportStatus.PENDING },
    { label: 'Approuvée', value: TransportStatus.APPROVED },
    { label: 'Rejetée', value: TransportStatus.REJECTED },
    { label: 'Terminée', value: TransportStatus.COMPLETED },
    { label: 'Annulée', value: TransportStatus.CANCELLED },
    { label: 'Dispatchée', value: TransportStatus.DISPATCHED },
    { label: 'Assignée', value: TransportStatus.ASSIGNED },
    { label: 'En cours', value: TransportStatus.IN_PROGRESS },
  ];

  const requestColumns = [
    {
      header: 'Demandeur',
      accessor: 'requestedBy' as keyof TransportRequestResponse,
      render: (request: TransportRequestResponse) => (
        <div>
          <div className="font-medium">{request.requestedBy?.fullName || 'Inconnu'}</div>
          <div className="text-sm text-muted-foreground">
            <Badge variant="outline">Individuel</Badge>
          </div>
        </div>
      ),
      sortable: true,
      filterable: true,
    },
    {
      header: 'Passagers',
      accessor: 'passengerCount' as keyof TransportRequestResponse,
      render: (request: TransportRequestResponse) => `${request.passengerCount || 1} passager`,
      sortable: true,
    },
    {
      header: 'Date prévue',
      accessor: 'scheduledDate' as keyof TransportRequestResponse,
      render: (request: TransportRequestResponse) =>
        request.scheduledDate ? new Date(request.scheduledDate).toLocaleString('fr-FR') : 'Non définie',
      sortable: true,
    },
    {
      header: 'Statut',
      accessor: 'status' as keyof TransportRequestResponse,
      render: (request: TransportRequestResponse) => getStatusBadge(request.status!),
      filterable: true,
    },
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
      ),
      sortable: true,
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
      ),
      sortable: true,
      filterable: true,
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
      ),
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
      ),
      sortable: true,
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
      ),
    },
    {
      header: 'Coût',
      accessor: 'cost' as keyof TransportHistory,
      render: (item: TransportHistory) => (
        <div className="text-sm font-medium">
          {item.cost > 0 ? `${item.cost.toFixed(2)}€` : '-'}
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Statut',
      accessor: 'status' as keyof TransportHistory,
      render: (item: TransportHistory) => getStatusBadge(item.status),
      filterable: true,
    },
  ];

  const requestActions = (request: TransportRequestResponse) => (
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
      {(request.status === TransportStatus.PENDING || request.status === TransportStatus.APPROVED) && (
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
            onClick={() => navigate('/transport/create-individual')}
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
            <span>Demandes ({totalRequests})</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Historique ({totalHistory})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <TableWithPagination
            data={requests}
            columns={requestColumns}
            actions={requestActions}
            filterOptions={user?.roles.some((r) => r.role.name === 'ADMIN_ENTREPRISE') ? subsidiaryFilterOptions : statusFilterOptions}
            total={totalRequests}
            skip={requestsSkip}
            take={requestsTake}
            onPageChange={(newSkip) => setRequestsSkip(newSkip)}
            onFilterChange={user?.roles.some((r) => r.role.name === 'ADMIN_ENTREPRISE') ? handleSubsidiaryFilterChange : handleStatusFilterChange}
            onRowClick={handleViewRequest}
            searchPlaceholder="Rechercher par demandeur, trajet..."
            isLoading={subsidiariesLoading || loading}
          />
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <History className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total courses</p>
                      <p className="text-2xl font-bold">{totalHistory}</p>
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
              filterOptions={user?.roles.some((r) => r.role.name === 'ADMIN_ENTREPRISE') ? subsidiaryFilterOptions : statusFilterOptions}
              total={totalHistory}
              skip={historySkip}
              take={historyTake}
              onPageChange={(newSkip) => setHistorySkip(newSkip)}
              onFilterChange={user?.roles.some((r) => r.role.name === 'ADMIN_ENTREPRISE') ? handleSubsidiaryFilterChange : handleStatusFilterChange}
              onRowClick={handleViewHistoryDetails}
              searchPlaceholder="Rechercher par référence, demandeur..."
              isLoading={subsidiariesLoading || loading}
            />
          </div>
        </TabsContent>
      </Tabs>

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
                value={selectedDates}
                onValueChange={handleDateSelect}
                className="rounded-md border"
                disabled={(date) => date < new Date()}
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
                          day: 'numeric',
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
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{selectedHistory.departureLocation}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-red-600" />
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
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
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
                  <p className="text-sm bg-muted-foreground/10 p-3 rounded">{selectedHistory.note}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}