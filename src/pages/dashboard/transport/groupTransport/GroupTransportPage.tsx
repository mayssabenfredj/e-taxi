import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Users, History, Navigation } from 'lucide-react';
import { Header } from '@/components/transport/groupTransport/Header';
import { RequestsTab } from '@/components/transport/groupTransport/RequestsTab';
import { HistoryTab } from '@/components/transport/groupTransport/HistoryTab';
import { DuplicateDialog } from '@/components/transport/groupTransport/DuplicateDialog';
import { HistoryDetailsDialog } from '@/components/transport/groupTransport/HistoryDetailsDialog';
import { GroupTransportDispatchTab } from '@/components/transport/groupTransport/GroupTransportDispatchTab';
import { TransportRequestResponse, TransportHistory, DuplicateSchedule, GetTransportRequestsQueryDto } from '@/types/demande';
import { demandeService } from '@/services/demande.service';
import { toast } from 'sonner';

export function GroupTransportPage() {
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

  const fetchRequests = async (resetPagination: boolean = false) => {
    try {
      if (resetPagination) {
        setRequestsSkip(0); // Reset to first page
      }
      const query: GetTransportRequestsQueryDto = {
        page: Math.floor(requestsSkip / requestsTake) + 1,
        limit: requestsTake,
      };
      const response = await demandeService.getTransportRequests(query);
      console.log("fetching requests ", response.data);
      const responsesFiltred = response.data.filter(req => req.employeeTransports.length !== 1)
      setRequests(responsesFiltred);
      console.log("fetching requests ", requests.length);
      setRequestsTotal(response.pagination.total);
    } catch (error) {
      toast.error('Échec du chargement des demandes de transport');
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await demandeService.getTransportRequests({
        page: Math.floor(historySkip / historyTake) + 1,
        limit: historyTake,
        status: 'COMPLETED' as any, // Ajuster selon l'API
      });
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
          taxiCount: req.employeeTransports.length, // Ajuster selon les données réelles
          courses: [], // Placeholder; ajuster selon la réponse de l'API
          totalCost: 0, // Placeholder; ajuster selon la réponse de l'API
          note: req.note || '',
        }))
      );
      setHistoryTotal(response.pagination.total);
    } catch (error) {
      toast.error('Échec du chargement de l\'historique des transports');
    }
  };

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests();
    } else if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, requestsSkip, requestsTake, historySkip, historyTake]);

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