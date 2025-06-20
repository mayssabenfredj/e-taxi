import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Users, History, Navigation } from 'lucide-react';
import { Header } from '@/components/transport/groupTransport/Header';
import { RequestsTab } from '@/components/transport/groupTransport/RequestsTab';
import { HistoryTab } from '@/components/transport/groupTransport/HistoryTab';
import { DuplicateDialog } from '@/components/transport/groupTransport/DuplicateDialog';
import { HistoryDetailsDialog } from '@/components/transport/groupTransport/HistoryDetailsDialog';
import { GroupTransportDispatchTab } from '@/components/transport/groupTransport/GroupTransportDispatchTab';
import { TransportRequestResponse, TransportHistory, DuplicateSchedule, GetTransportRequestsQueryDto, TransportStatus } from '@/types/demande';
import { demandeService } from '@/services/demande.service';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useRolesAndSubsidiaries, Subsidiary } from '@/hooks/useRolesAndSubsidiaries'; // Adjust import path as needed

export function GroupTransportPage() {
  const { user } = useAuth(); // Get user from AuthContext
  const { subsidiaries, loading: subsidiariesLoading, error: subsidiariesError } = useRolesAndSubsidiaries(user?.enterpriseId); // Fetch subsidiaries
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
  const [requestsTake, setRequestsTake] = useState(10);
  const [historySkip, setHistorySkip] = useState(0);
  const [historyTake, setHistoryTake] = useState(10);
  const [requestsTotal, setRequestsTotal] = useState(0);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<string | null>(null); // Track selected subsidiary for filtering
  const [selectedStatus, setSelectedStatus] = useState<TransportStatus | null>(null); // Track selected status for filtering
  const [loading, setLoading] = useState(false); // Add loading state

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
      console.log("fetching requests", response.data);
      const responsesFiltered: TransportRequestResponse[] = response.data.filter(req => req.employeeTransports.length !== 1); // Corrected declaration
      setRequests(responsesFiltered);
      console.log("fetching requests filtered", responsesFiltered);
      console.log("fetching requests filtered length", responsesFiltered.length);
      setRequestsTotal(response.pagination.total);
    } catch (error) {
      toast.error('Échec du chargement des demandes de transport');
      console.error('Fetch requests error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const query: GetTransportRequestsQueryDto = {
        page: Math.floor(historySkip / historyTake) + 1,
        limit: historyTake,
        status: 'COMPLETED' as any, // Adjust according to API
      };

      if (user) {
        const userRoles = user.roles.map((r) => r.role.name);
        if (userRoles.includes('ADMIN_ENTREPRISE') && user.enterpriseId) {
          query.enterpriseId = user.enterpriseId;
          if (selectedSubsidiary) {
            query.subsidiaryId = selectedSubsidiary; // Filter by selected subsidiary
          }
        } else if (userRoles.includes('ADMIN_FILIALE') && user.enterpriseId && user.subsidiaryId) {
          query.enterpriseId = user.enterpriseId;
          query.subsidiaryId = user.subsidiaryId;
          if (selectedStatus) {
            query.status = selectedStatus; // Filter by selected status
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
          taxiCount: req.employeeTransports.length, // Adjust according to actual data
          courses: [], // Placeholder; adjust according to API response
          totalCost: 0, // Placeholder; adjust according to API response
          note: req.note || '',
        }))
      );
      setHistoryTotal(response.pagination.total);
    } catch (error) {
      toast.error('Échec du chargement de l\'historique des transports');
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

  // Function to handle subsidiary filter change
  const handleSubsidiaryFilterChange = (subsidiaryId: string | null) => {
    setSelectedSubsidiary(subsidiaryId);
    setRequestsSkip(0); // Reset pagination when filter changes
  };

  // Function to handle status filter change
  const handleStatusFilterChange = (status: TransportStatus | null) => {
    setSelectedStatus(status);
    setRequestsSkip(0); // Reset pagination when filter changes
  };

  // Define filter options for subsidiaries
  const subsidiaryFilterOptions = [
    { label: 'Toutes les filiales', value: null },
    ...subsidiaries.map((sub) => ({
      label: sub.name,
      value: sub.id,
    })),
  ];

  // Define filter options for status
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
          <TabsTrigger value="dispatch" className="flex items-center space-x-2">
            <Navigation className="h-4 w-4" />
            <span>Dispatch</span>
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
            setTake={setRequestsTake}
            setSelectedRequest={setSelectedRequest}
            setDuplicateDialogOpen={setDuplicateDialogOpen}
            filterOptions={user?.roles.some((r) => r.role.name === 'ADMIN_ENTREPRISE') ? subsidiaryFilterOptions : statusFilterOptions}
            onFilterChange={user?.roles.some((r) => r.role.name === 'ADMIN_ENTREPRISE') ? handleSubsidiaryFilterChange : handleStatusFilterChange}
            isLoading={subsidiariesLoading || loading} // Include general loading state
          />
        </TabsContent>
        <TabsContent value="dispatch">
          <GroupTransportDispatchTab />
        </TabsContent>
        <TabsContent value="history">
          <HistoryTab
            history={history}
            skip={historySkip}
            take={historyTake}
            total={historyTotal}
            setSkip={setHistorySkip}
            setTake={setHistoryTake}
            setSelectedHistory={setSelectedHistory}
            setHistoryDetailsOpen={setHistoryDetailsOpen}
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
        onDuplicateSuccess={() => fetchRequests(true)} // Pass fetchRequests with resetPagination
      />
      <HistoryDetailsDialog
        open={historyDetailsOpen}
        setOpen={setHistoryDetailsOpen}
        selectedHistory={selectedHistory}
      />
    </div>
  );
}