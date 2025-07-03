import React, { useState } from 'react';
import { Button } from '@/shareds/components/ui/button';
import { TableWithPagination } from '@/shareds/components/ui/table-with-pagination';
import { Eye, Copy, Navigation, X, AlertTriangle, Edit } from 'lucide-react';
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
} from '@/shareds/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { TransportRequestResponse, TransportStatus } from '@/features/transports/types/demande';
import { demandeService } from '@/features/transports/services/demande.service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shareds/components/ui/select';
import { Badge } from '@/shareds/components/ui/badge';

interface RequestsTabProps {
  requests: TransportRequestResponse[];
  skip: number;
  take: number;
  total: number;
  setSkip: (skip: number) => void;
  setTake: (take: number) => void;
  setSelectedRequest: (request: TransportRequestResponse | null) => void;
  setDuplicateDialogOpen: (open: boolean) => void;
  isLoading: boolean;
  fetchRequests: (resetPagination?: boolean) => Promise<void>;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canApprove?: boolean;
  canAssign?: boolean;
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
  isLoading,
  fetchRequests,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
  canApprove = false,
  canAssign = false,
}: RequestsTabProps) {
  const navigate = useNavigate();

  const handleViewRequest = (request: TransportRequestResponse) => {
    navigate(`/transport/${request.id}`);
  };

  const handleDuplicateRequest = (request: TransportRequestResponse) => {
    setSelectedRequest(request);
    setDuplicateDialogOpen(true);
  };

  const handleDispatchRequest = (request: TransportRequestResponse) => {
    navigate(`/transport/${request.id}/group-dispatch`);
  };

  const handleCancelRequest = async (request: TransportRequestResponse) => {
    if (!request.scheduledDate) {
      toast.error("La date prévue est manquante, impossible d'annuler");
      return false;
    }

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
      await demandeService.updateTransportRequestStatus(
        request.id,
        TransportStatus.CANCELLED
      );

      toast.success('Demande annulée avec succès');
      await fetchRequests(true);
      return true;
    } catch (error) {
      toast.error("Échec de l'annulation de la demande de transport");
      return false;
    }
  };

  const handleEditRequest = (request: TransportRequestResponse) => {
    navigate('/transport/create-transport', { state: { editData: request } });
  };

  const getStatusBadge = (status?: TransportStatus) => {
    const variants: Record<
      TransportStatus,
      { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; color: string }
    > = {
      [TransportStatus.PENDING]: {
        variant: 'outline',
        label: 'En attente',
        color: 'bg-yellow-100 text-yellow-800',
      },
      [TransportStatus.APPROVED]: {
        variant: 'default',
        label: 'Approuvée',
        color: 'bg-blue-100 text-blue-800',
      },
      [TransportStatus.DISPATCHED]: {
        variant: 'default',
        label: 'Dispatchée',
        color: 'bg-indigo-100 text-indigo-800',
      },
      [TransportStatus.ASSIGNED]: {
        variant: 'default',
        label: 'Assignée',
        color: 'bg-purple-100 text-purple-800',
      },
      [TransportStatus.IN_PROGRESS]: {
        variant: 'default',
        label: 'En cours',
        color: 'bg-orange-100 text-orange-800',
      },
      [TransportStatus.COMPLETED]: {
        variant: 'secondary',
        label: 'Terminée',
        color: 'bg-green-100 text-green-800',
      },
      [TransportStatus.CANCELLED]: {
        variant: 'destructive',
        label: 'Annulée',
        color: 'bg-gray-100 text-gray-800',
      },
      [TransportStatus.REJECTED]: {
        variant: 'destructive',
        label: 'Rejetée',
        color: 'bg-red-100 text-red-800',
      },
    };

    if (!status || !variants[status]) {
      return (
        <Badge variant="secondary" className="bg-gray-200 text-gray-800">
          Inconnu
        </Badge>
      );
    }

    const { variant, color, label } = variants[status];
    return (
      <Badge variant={variant} className={color}>
        {label}
      </Badge>
    );
  };

  const requestColumns = [
    {
      header: 'Demandeur',
      accessor: 'requestedBy' as string,
      render: (request: TransportRequestResponse) => (
        <div>
          <div className="font-medium">
            {request.requestedBy?.fullName || 'Inconnu'}
          </div>
          <div className="text-sm text-muted-foreground">
            <Badge variant="secondary">{request.employeeTransports.length === 1 ? 'Individual' : 'Groupe'}</Badge>
          </div>
        </div>
      ),
      sortable: true,
      filterable: true,
    },
    {
      header: 'Passagers',
      accessor: 'passengerCount' as string,
      render: (request: TransportRequestResponse) =>
        request.employeeTransports
          ? `${request.employeeTransports.length} passager${request.employeeTransports.length !== 1 ? 's' : ''}`
          : 'Aucun passager',
      sortable: true,
    },
    {
      header: 'Date prévue',
      accessor: 'scheduledDate' as string,
      render: (request: TransportRequestResponse) =>
        request.scheduledDate
          ? new Date(request.scheduledDate).toLocaleString('fr-FR')
          : 'Non définie',
      sortable: true,
    },
    {
      header: 'Statut',
      accessor: 'status' as string,
      render: (request: TransportRequestResponse) => getStatusBadge(request.status),
      filterable: true,
    },
  ];

  const requestActions = (request: TransportRequestResponse) => {
    const scheduledTime = request.scheduledDate ? new Date(request.scheduledDate).getTime() : null;
    const currentTime = new Date().getTime();
    const thirtyMinutesInMs = 30 * 60 * 1000;
    const canCancel =
      request.scheduledDate &&
      (request.status === TransportStatus.PENDING || request.status === TransportStatus.APPROVED) &&
      scheduledTime &&
      currentTime < scheduledTime - thirtyMinutesInMs &&
      canDelete;

    return (
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
        {canCreate && (
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
        )}
        {canAssign && (
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
        {canCancel && (
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
                  Cette action est irréversible et notifie tous les passagers.
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
        {canUpdate && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleEditRequest(request);
            }}
            title="Modifier"
            className="text-blue-500 hover:text-blue-700"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div>
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
        isFiltered={false}
        isShowingSearchPagination={false}
      />
    </div>
  );
}