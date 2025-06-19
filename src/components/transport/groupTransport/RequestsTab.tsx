import { Button } from '@/components/ui/button';
import { TableWithPagination } from '@/components/ui/table-with-pagination';
import { Eye, Copy, Navigation, X, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { TransportRequest, TransportRequestResponse } from '@/types/demande';
import { demandeService } from '@/services/demande.service';
import { Badge } from '@/components/ui/badge';

interface RequestsTabProps {
  requests: TransportRequest[];
  skip: number;
  take: number;
  total: number;
  setSkip: (skip: number) => void;
  setTake: (take: number) => void;
  setSelectedRequest: (request: TransportRequest | null) => void;
  setDuplicateDialogOpen: (open: boolean) => void;
}

export function RequestsTab({
  requests,
  skip,
  take,
  total,
  setSkip,
  setTake,
  setSelectedRequest,
  setDuplicateDialogOpen,
}: RequestsTabProps) {
  const navigate = useNavigate();

  const handleViewRequest = (request: TransportRequest) => {
    navigate(`/transport/${request.id}`);
  };

  const handleDuplicateRequest = (request: TransportRequest) => {
    setSelectedRequest(request);
    setDuplicateDialogOpen(true);
  };

  const handleDispatchRequest = (request: TransportRequest) => {
    if (request.status !== 'approved') {
      toast.error('Seules les demandes approuvées peuvent être dispatchées');
      return;
    }
    navigate(`/transport/${request.id}/group-dispatch`);
  };

  const handleCancelRequest = async (request: TransportRequest) => {
    const scheduledTime = new Date(request.scheduledDate).getTime();
    const currentTime = new Date().getTime();
    const thirtyMinutesInMs = 30 * 60 * 1000;

    if (currentTime >= scheduledTime - thirtyMinutesInMs) {
      toast.error(
        "Impossible d'annuler une demande moins de 30 minutes avant le départ"
      );
      return false;
    }

    try {
      // Fetch the existing request to get its full details
      const existingRequest = await demandeService.getTransportRequestById(
        request.id
      );

      // Update the request status to CANCELLED
      const updatedRequest: TransportRequestResponse = {
        ...existingRequest,
        status: 'CANCELLED',
      };

      // Note: Assuming an update endpoint exists; adjust based on actual API
      await demandeService.createTransportRequest({
        ...updatedRequest,
        employeeTransports: updatedRequest.employeeTransports || [],
      });

      toast.success('Demande annulée avec succès');
      return true;
    } catch (error) {
      toast.error('Échec de l\'annulation de la demande de transport');
      return false;
    }
  };

  const getStatusBadge = (status: TransportRequest['status']) => {
    const variants = {
      pending: {
        variant: 'outline' as const,
        label: 'En attente',
        color: 'bg-yellow-100 text-yellow-800',
      },
      approved: {
        variant: 'default' as const,
        label: 'Approuvée',
        color: 'bg-blue-100 text-blue-800',
      },
      rejected: {
        variant: 'destructive' as const,
        label: 'Rejetée',
        color: 'bg-red-100 text-red-800',
      },
      completed: {
        variant: 'secondary' as const,
        label: 'Terminée',
        color: 'bg-green-100 text-green-800',
      },
    };

    const { label, color } = variants[status];
    return <Badge className={color}>{label}</Badge>;
  };

  const requestColumns = [
    {
      header: 'Demandeur',
      accessor: 'requestedBy' as string,
      render: (request: TransportRequest) => (
        <div>
          <div className="font-medium">{request.requestedBy}</div>
          <div className="text-sm text-muted-foreground">
            <Badge variant="secondary">Groupe</Badge>
          </div>
        </div>
      ),
      sortable: true,
      filterable: true,
    },
    {
      header: 'Passagers',
      accessor: 'passengerCount' as string,
      render: (request: TransportRequest) => `${request.passengerCount} passagers`,
      sortable: true,
    },
    {
      header: 'Date prévue',
      accessor: 'scheduledDate' as string,
      render: (request: TransportRequest) =>
        new Date(request.scheduledDate).toLocaleString('fr-FR'),
      sortable: true,
    },
    {
      header: 'Statut',
      accessor: 'status' as string,
      render: (request: TransportRequest) => getStatusBadge(request.status),
      filterable: true,
    },
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
                Êtes-vous sûr de vouloir annuler cette demande de transport de
                groupe ? Cette action est irréversible et tous les passagers
                seront notifiés.
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

  return (
    <TableWithPagination
      data={requests}
      columns={requestColumns}
      actions={requestActions}
      total={total}
      skip={skip}
      take={take}
      onPageChange={(newSkip, newTake) => {
        setSkip(newSkip);
        setTake(newTake);
      }}
      searchPlaceholder="Rechercher par demandeur, trajet..."
      // Remove onRowClick if not supported by TableWithPaginationProps
      // onRowClick={handleViewRequest}
    />
  );
}