import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shareds/components/ui/tabs';
import { Users, History, Navigation } from 'lucide-react';
import { Header } from '@/features/transports/components/groupTransport/Header';
import { RequestsTab } from '@/features/transports/components/groupTransport/RequestsTab';
import { HistoryTab } from '@/features/transports/components/groupTransport/HistoryTab';
import { DuplicateDialog } from '@/features/transports/components/groupTransport/DuplicateDialog';
import { HistoryDetailsDialog } from '@/features/transports/components/groupTransport/HistoryDetailsDialog';
import { TransportRequestResponse, TransportHistory, DuplicateSchedule, GetTransportRequestsQueryDto, TransportStatus } from '@/features/transports/types/demande';
import { demandeService } from '@/features/transports/services/demande.service';
import { toast } from 'sonner';
import { useAuth } from '@/shareds/contexts/AuthContext';
import { useRolesAndSubsidiaries, Subsidiary } from '@/shareds/hooks/useRolesAndSubsidiaries';
import { hasPermission } from '@/shareds/lib/utils';

export function GroupTransportPage() {
  const { user } = useAuth();
  if (!hasPermission(user, 'transports:read')) {
    return <div className="text-center text-red-500 py-12">Accès refusé : vous n'avez pas la permission de voir les transports.</div>;
  }
  const { subsidiaries, loading: subsidiariesLoading, error: subsidiariesError } = useRolesAndSubsidiaries(user?.enterpriseId);
  const [activeTab, setActiveTab] = useState<'requests' | 'history' | 'dispatch'>('requests');
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TransportRequestResponse | null>(null);
  const [duplicateSchedules, setDuplicateSchedules] = useState<DuplicateSchedule[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [historyDetailsOpen, setHistoryDetailsOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<TransportHistory | null>(null);
  const [requests, setRequests] = useState<TransportRequestResponse[]>([]);
  const [history, setHistory] = useState<TransportHistory[]>([]);
  const [requestsSkip, setRequestsSkip] = useState(0);
  const [requestsTake] = useState(10);
  const [historySkip, setHistorySkip] = useState(0);
  const [historyTake] = useState(10);
  const [requestsTotal, setRequestsTotal] = useState(0);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<TransportStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const canCreate = hasPermission(user, 'transports:create');
  const canUpdate = hasPermission(user, 'transports:update');
  const canDelete = hasPermission(user, 'transports:delete');
  const canApprove = hasPermission(user, 'transports:approve');
  const canAssign = hasPermission(user, 'transports:assign');

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
          }
        } else if (userRoles.includes('ADMIN_FILIALE') && user.enterpriseId && user.subsidiaryId) {
          query.enterpriseId = user.enterpriseId;
          query.subsidiaryId = user.subsidiaryId;
          if (selectedStatus) {
            query.status = selectedStatus;
          }
        }
      }

      const response = await demandeService.getTransportRequests(query);
      const responsesFiltered: TransportRequestResponse[] = response.data.filter(req => req.employeeTransports.length !== 1);
      setRequests(responsesFiltered);
      setRequestsTotal(response.pagination.total);
    } catch (error) {
      toast.error('Échec du chargement des demandes de transport');
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
          }
        } else if (userRoles.includes('ADMIN_FILIALE') && user.enterpriseId && user.subsidiaryId) {
          query.enterpriseId = user.enterpriseId;
          query.subsidiaryId = user.subsidiaryId;
          if (selectedStatus) {
            query.status = selectedStatus;
          }
        }
      }

      const response = await demandeService.getTransportRequests(query);
      setHistory(
        response.data.map((req) => ({
          id: req.id,
          requestId: req.id,
          reference: req.reference || `TR-${req.id}`,
          type: 'group',
          requestedBy: req.requestedBy?.fullName || 'Inconnu',
          passengerCount: req.employeeTransports.length,
          departureLocation: req.employeeTransports[0]?.departure?.formattedAddress || 'Non spécifié',
          arrivalLocation: req.employeeTransports[0]?.arrival?.formattedAddress || 'Non spécifié',
          scheduledDate: req.scheduledDate || new Date().toISOString(),
          completedDate: req.updatedAt || new Date().toISOString(),
          status: (req.status === 'COMPLETED' ? 'completed' : 'cancelled') as TransportHistory['status'],
          taxiCount: req.employeeTransports.length,
          courses: [],
          totalCost: 0,
          note: req.note || '',
        }))
      );
      setHistoryTotal(response.pagination.total);
    } catch (error) {
      toast.error('Échec du chargement de l\'historique des transports');
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

  const handleSubsidiaryFilterChange = (subsidiaryId: string | null) => {
    setSelectedSubsidiary(subsidiaryId);
    setRequestsSkip(0);
    setHistorySkip(0);
    if (activeTab === 'requests') {
      fetchRequests(true); // Explicitly trigger fetch
    } else if (activeTab === 'history') {
      fetchHistory(true); // Explicitly trigger fetch
    }
  };

  const handleStatusFilterChange = (status: TransportStatus | null) => {
    setSelectedStatus(status);
    setRequestsSkip(0);
    setHistorySkip(0);
    if (activeTab === 'requests') {
      fetchRequests(true); // Explicitly trigger fetch
    } else if (activeTab === 'history') {
      fetchHistory(true); // Explicitly trigger fetch
    }
  };

  const subsidiaryFilterOptions = [
    { label: 'Toutes les sous organisation', value: null },
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

  return (
    <div className="space-y-6">
      <Header />
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'requests' | 'history' | 'dispatch')}>
        <TabsList>
          <TabsTrigger value="requests" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Demandes ({requestsTotal})</span>
          </TabsTrigger>
         
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Historique ({historyTotal})</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="requests">
          <RequestsTab
            requests={requests}
            skip={requestsSkip}
            take={requestsTake}
            total={requestsTotal}
            setSkip={setRequestsSkip}
            setTake={() => {}} // Placeholder, as setTake is not used
            setSelectedRequest={setSelectedRequest}
            setDuplicateDialogOpen={setDuplicateDialogOpen}
            filterOptions={user?.roles.some((r) => r.role.name === 'ADMIN_ENTREPRISE') ? subsidiaryFilterOptions : statusFilterOptions}
            onFilterChange={user?.roles.some((r) => r.role.name === 'ADMIN_ENTREPRISE') ? handleSubsidiaryFilterChange : handleStatusFilterChange}
            isLoading={subsidiariesLoading || loading}
            fetchRequests={fetchRequests}
            canCreate={canCreate}
            canUpdate={canUpdate}
            canDelete={canDelete}
            canApprove={canApprove}
            canAssign={canAssign}
          />
        </TabsContent>
       
        <TabsContent value="history">
          <HistoryTab
            history={history}
            skip={historySkip}
            take={historyTake}
            total={historyTotal}
            setSkip={setHistorySkip}
            setTake={() => {}} // Placeholder, as setTake is not used
            setSelectedHistory={setSelectedHistory}
            setHistoryDetailsOpen={setHistoryDetailsOpen}
            canDelete={canDelete}
          />
        </TabsContent>
      </Tabs>
      <DuplicateDialog
        open={duplicateDialogOpen}
        setOpen={setDuplicateDialogOpen}
        selectedRequest={selectedRequest}
        setSelectedRequest={setSelectedRequest}
        duplicateSchedules={duplicateSchedules}
        setDuplicateSchedules={setDuplicateSchedules}
        selectedDates={selectedDates}
        setSelectedDates={setSelectedDates}
        onDuplicateSuccess={() => fetchRequests(true)}
      />
      <HistoryDetailsDialog
        open={historyDetailsOpen}
        setOpen={setHistoryDetailsOpen}
        selectedHistory={selectedHistory}
      />
    </div>
  );
}