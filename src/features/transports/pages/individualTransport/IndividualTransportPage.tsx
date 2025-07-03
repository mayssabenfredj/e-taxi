import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shareds/components/ui/tabs';
import { Car, History } from 'lucide-react';
import { Header } from '@/features/transports/components/groupTransport/Header';
import { RequestsTab } from '@/features/transports/components/groupTransport/RequestsTab';
import { HistoryTab } from '@/features/transports/components/groupTransport/HistoryTab';
import { DuplicateDialog } from '@/features/transports/components/groupTransport/DuplicateDialog';
import { HistoryDetailsDialog } from '@/features/transports/components/groupTransport/HistoryDetailsDialog';
import { TransportRequestResponse, TransportHistory, DuplicateSchedule, GetTransportRequestsQueryDto, TransportStatus } from '@/features/transports/types/demande';
import { demandeService } from '@/features/transports/services/demande.service';
import { toast } from 'sonner';
import { useAuth } from '@/shareds/contexts/AuthContext';
import { useRolesAndSubsidiaries } from '@/shareds/hooks/useRolesAndSubsidiaries';
import { hasPermission } from '@/shareds/lib/utils';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shareds/components/ui/select';

export function IndividualTransportPage() {
  const { user } = useAuth();
  if (!hasPermission(user, 'transports:read')) {
    return <div className="text-center text-red-500 py-12">Accès refusé : vous n'avez pas la permission de voir les transports.</div>;
  }
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
  const [requestsSkip, setRequestsSkip] = useState(0);
  const [requestsTake, setRequestsTake] = useState(10);
  const [historySkip, setHistorySkip] = useState(0);
  const [historyTake] = useState(10);
  const [requestsTotal, setRequestsTotal] = useState(0);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<TransportStatus | null>(null);
  const [search, setSearch] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const canCreate = hasPermission(user, 'transports:create');
  const canUpdate = hasPermission(user, 'transports:update');
  const canDelete = hasPermission(user, 'transports:delete');
  const canApprove = hasPermission(user, 'transports:approve');
  const canAssign = hasPermission(user, 'transports:assign');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchValueRef = useRef<string>('');

  const fetchRequests = useCallback(async (resetPagination: boolean = false, customParams?: {
    status?: TransportStatus | null;
    subsidiaryId?: string | null;
    search?: string;
  }) => {
    setLoading(true);
    try {
      if (resetPagination) {
        setRequestsSkip(0);
      }
      const query: GetTransportRequestsQueryDto = {
        page: Math.floor(requestsSkip / requestsTake) + 1,
        limit: requestsTake,
        mode:'individual',
      };

      if (user) {
        const userRoles = user.roles.map((r) => r.role.name);
        if (userRoles.includes('ADMIN_ENTREPRISE') && user.enterpriseId) {
          query.enterpriseId = user.enterpriseId;
          if (customParams?.subsidiaryId || selectedSubsidiary) {
            query.subsidiaryId = customParams?.subsidiaryId || selectedSubsidiary;
          }
        } else if (userRoles.includes('ADMIN_FILIALE') && user.enterpriseId && user.subsidiaryId) {
          query.enterpriseId = user.enterpriseId;
          query.subsidiaryId = user.subsidiaryId;
        }
      }

      if (customParams?.status !== undefined) {
        query.status = customParams.status;
      } else if (selectedStatus) {
        query.status = selectedStatus;
      }
      
      if (customParams?.search !== undefined) {
        query.search = customParams.search;
      } else if (searchValueRef.current) {
        query.search = searchValueRef.current;
      }

      const response = await demandeService.getTransportRequests(query);
      setRequests(response.data);
      setRequestsTotal(response.pagination.total);
    } catch (error) {
      toast.error('Échec du chargement des demandes de transport');
    } finally {
      setLoading(false);
    }
  }, [requestsSkip, requestsTake, user]);

  const fetchHistory = useCallback(async (resetPagination: boolean = false) => {
    setLoading(true);
    try {
      if (resetPagination) {
        setHistorySkip(0);
      }
      setHistory([]);
      setHistoryTotal(0);
    } catch (error) {
      toast.error('Échec du chargement de l\'historique des transports');
    } finally {
      setLoading(false);
    }
  }, [historySkip, historyTake]);

  useEffect(() => {
    if (subsidiariesError) {
      toast.error(subsidiariesError);
    }
    if (activeTab === 'requests') {
      fetchRequests();
    } else if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, subsidiariesError]);

  useEffect(() => {
    if (!search) {
      return;
    }
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    const timeout = setTimeout(() => {
      searchValueRef.current = search;
      setRequestsSkip(0);
      setHistorySkip(0);
      if (activeTab === 'requests') {
        fetchRequests(true, { search });
      } else if (activeTab === 'history') {
        fetchHistory(true);
      }
    }, 200);
    
    searchTimeoutRef.current = timeout;
    return () => clearTimeout(timeout);
  }, [search, activeTab]);

  const handleSubsidiaryFilterChange = (subsidiaryId: string | null) => {
    setSelectedSubsidiary(subsidiaryId);
    setRequestsSkip(0);
    setHistorySkip(0);
    if (activeTab === 'requests') {
      fetchRequests(true, { subsidiaryId });
    } else if (activeTab === 'history') {
      fetchHistory(true);
    }
  };

  const handleStatusFilterChange = (status: TransportStatus | null) => {
    setSelectedStatus(status);
    setRequestsSkip(0);
    setHistorySkip(0);
    if (activeTab === 'requests') {
      fetchRequests(true, { status });
    } else if (activeTab === 'history') {
      fetchHistory(true);
    }
  };

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
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
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'requests' | 'history')}>
        <TabsList>
          <TabsTrigger value="requests" className="flex items-center space-x-2">
            <Car className="h-4 w-4" />
            <span>Demandes ({requests.length})</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Historique ({historyTotal})</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="requests">
          <div className="mb-4 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Rechercher par demandeur, trajet..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-9 text-sm border rounded px-2"
              disabled={loading}
            />
            {user?.roles.some((r) => r.role.name === 'ADMIN_ENTREPRISE') && (
              <Select
                value={selectedSubsidiary || 'all'}
                onValueChange={(value) => handleSubsidiaryFilterChange(value === 'all' ? null : value)}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filtrer par filiale" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les filiales</SelectItem>
                  {subsidiaries.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select
              value={selectedStatus || 'all'}
              onValueChange={(value) => handleStatusFilterChange(value === 'all' ? null : value as TransportStatus)}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value={TransportStatus.PENDING}>En attente</SelectItem>
                <SelectItem value={TransportStatus.APPROVED}>Approuvée</SelectItem>
                <SelectItem value={TransportStatus.REJECTED}>Rejetée</SelectItem>
                <SelectItem value={TransportStatus.COMPLETED}>Terminée</SelectItem>
                <SelectItem value={TransportStatus.CANCELLED}>Annulée</SelectItem>
                <SelectItem value={TransportStatus.DISPATCHED}>Dispatchée</SelectItem>
                <SelectItem value={TransportStatus.ASSIGNED}>Assignée</SelectItem>
                <SelectItem value={TransportStatus.IN_PROGRESS}>En cours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <RequestsTab
            requests={requests}
            skip={requestsSkip}
            take={requestsTake}
            total={requestsTotal}
            setSkip={setRequestsSkip}
            setTake={setRequestsTake}
            setSelectedRequest={setSelectedRequest}
            setDuplicateDialogOpen={setDuplicateDialogOpen}
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