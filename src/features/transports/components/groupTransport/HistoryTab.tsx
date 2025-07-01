import React from 'react';
import { Card, CardContent } from '@/shareds/components/ui/card';
import { TableWithPagination } from '@/shareds/components/ui/table-with-pagination';
import { Button } from '@/shareds/components/ui/button';
import { History, Car, User, MapPin, Clock, Star, Eye } from 'lucide-react';
import { TransportHistory } from '@/features/transports/types/demande';
import { Badge } from '@/shareds/components/ui/badge';

interface HistoryTabProps {
  history: TransportHistory[];
  skip: number;
  take: number;
  total: number;
  setSkip: (skip: number) => void;
  setTake: (take: number) => void;
  setSelectedHistory: (history: TransportHistory | null) => void;
  setHistoryDetailsOpen: (open: boolean) => void;
  canDelete?: boolean;
}

export function HistoryTab({
  history,
  skip,
  take,
  total,
  setSkip,
  setTake,
  setSelectedHistory,
  setHistoryDetailsOpen,
  canDelete = false,
}: HistoryTabProps) {
  const getStatusBadge = (status: TransportHistory['status']) => {
    const variants = {
      completed: { variant: 'secondary' as const, label: 'Terminée', color: 'bg-green-100 text-green-800' },
      cancelled: { variant: 'destructive' as const, label: 'Annulée', color: 'bg-red-100 text-red-800' },
    };

    const { label, color } = variants[status];
    return <Badge className={color}>{label}</Badge>;
  };

  const historyColumns = [
    {
      header: 'Référence',
      accessor: 'reference' as string,
      render: (item: TransportHistory) => (
        <div>
          <div className="font-medium text-etaxi-yellow">{item.reference}</div>
          <div className="text-sm text-muted-foreground">
            <Badge variant="secondary" className="text-xs">Groupe</Badge>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Demandeur',
      accessor: 'requestedBy' as string,
      render: (item: TransportHistory) => (
        <div>
          <div className="font-medium">{item.requestedBy}</div>
          <div className="text-sm text-muted-foreground">
            {item.passengerCount} passagers • {item.taxiCount} taxi{item.taxiCount > 1 ? 's' : ''}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Trajet',
      accessor: 'departureLocation' as string,
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
      sortable: true,
    },
    {
      header: 'Date',
      accessor: 'scheduledDate' as string,
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
      header: 'Courses',
      accessor: 'taxiCount' as string,
      render: (item: TransportHistory) => (
        <div className="text-sm">
          <div className="font-medium">{item.courses.length} course{item.courses.length > 1 ? 's' : ''}</div>
          <div className="text-xs text-muted-foreground">
            {item.taxiCount} taxi{item.taxiCount > 1 ? 's' : ''}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Coût total',
      accessor: 'totalCost' as string,
      render: (item: TransportHistory) => (
        <div className="text-sm font-medium">
          {item.totalCost > 0 ? `${item.totalCost.toFixed(2)}€` : '-'}
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Statut',
      accessor: 'status' as string,
      render: (item: TransportHistory) => getStatusBadge(item.status),
      filterable: true,
    },
  ];

  const historyActions = (item: TransportHistory) => (
    <Button
      size="sm"
      variant="ghost"
      onClick={(e) => {
        e.stopPropagation();
        setSelectedHistory(item);
        setHistoryDetailsOpen(true);
      }}
      title="Voir les détails"
    >
      <Eye className="h-4 w-4" />
    </Button>
  );

  const historyFilterOptions = [
    { label: 'Toutes', value: 'all', field: 'status' as keyof TransportHistory },
    { label: 'Terminées', value: 'completed', field: 'status' as keyof TransportHistory },
    { label: 'Annulées', value: 'cancelled', field: 'status' as keyof TransportHistory },
  ];

  return (
    <div className="space-y-4">
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
                <p className="text-2xl font-bold">{history.reduce((sum, h) => sum + h.taxiCount, 0)}</p>
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
                <p className="text-2xl font-bold">{history.reduce((sum, h) => sum + h.passengerCount, 0)}</p>
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
                <p className="text-2xl font-bold">{history.reduce((sum, h) => sum + h.totalCost, 0).toFixed(2)}€</p>
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
        total={total}
        skip={skip}
        take={take}
        onPageChange={(newSkip, newTake) => {
          setSkip(newSkip);
          setTake(newTake);
        }}
        searchPlaceholder="Rechercher par référence, demandeur..."
        onRowClick={(item) => {
          setSelectedHistory(item);
          setHistoryDetailsOpen(true);
        }}
      />
    </div>
  );
}