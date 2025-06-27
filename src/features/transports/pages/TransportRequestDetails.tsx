import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/shareds/components/ui/card';
import { Button } from '@/shareds/components/ui/button';
import { Badge } from '@/shareds/components/ui/badge';
import { ScrollArea } from '@/shareds/components/ui/scroll-area';
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
import {
  ArrowLeft,
  Edit,
  Navigation,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  Car,
  X,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { TransportRequestResponse, EmployeeTransportDto, TransportStatus, TransportType, TransportDirection } from '@/features/transports/types/demande';
import { demandeService } from '@/features/transports/services/demande.service';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AddressDto } from '@/shareds/types/addresse';

export function TransportRequestDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [request, setRequest] = useState<TransportRequestResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) {
        toast.error('ID de la demande non spécifié');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await demandeService.getTransportRequestById(id);
        setRequest(response);
      } catch (error: any) {
        toast.error(`Erreur lors du chargement de la demande : ${error.message || 'Erreur inconnue'}`);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  const getStatusColor = (status?: TransportStatus) => {
    switch (status) {
      case TransportStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case TransportStatus.APPROVED:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case TransportStatus.DISPATCHED:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      case TransportStatus.IN_PROGRESS:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
      case TransportStatus.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case TransportStatus.CANCELLED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case TransportStatus.REJECTED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case TransportStatus.ASSIGNED:
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const getStatusLabel = (status?: TransportStatus) => {
    switch (status) {
      case TransportStatus.PENDING:
        return 'En attente';
      case TransportStatus.APPROVED:
        return 'Approuvé';
      case TransportStatus.DISPATCHED:
        return 'Dispatché';
      case TransportStatus.IN_PROGRESS:
        return 'En cours';
      case TransportStatus.COMPLETED:
        return 'Terminé';
      case TransportStatus.CANCELLED:
        return 'Annulé';
      case TransportStatus.REJECTED:
        return 'Rejeté';
      case TransportStatus.ASSIGNED:
        return 'Assigné';
      default:
        return status || 'Inconnu';
    }
  };

  const getTypeLabel = (type?: TransportType) => {
    switch (type) {
      case TransportType.IMMEDIATE:
        return 'Immédiat';
      case TransportType.SCHEDULED:
        return 'Programmé';
      case TransportType.RECURRING:
        return 'Récurrent';
      default:
        return type || 'Inconnu';
    }
  };

  const getDirectionLabel = (direction?: TransportDirection) => {
    switch (direction) {
      case TransportDirection.HOMETOOFFICE:
        return 'Domicile → Travail';
      case TransportDirection.OFFICETOHOME:
        return 'Travail → Domicile';
      default:
        return direction || 'Non spécifié';
    }
  };

  const handleEdit = () => {
    if (id) navigate(`/transport/${id}/edit`);
  };

  const handleDispatch = () => {
    if (!request || !id) return;
    navigate(`/transport/${id}/group-dispatch`);
  };

  const handleApprove = async () => {
    if (!request || !id) return;
    try {
      const updatedRequest = await demandeService.updateTransportRequestStatus(id, TransportStatus.APPROVED);
      setRequest(updatedRequest);
      toast.success('Demande approuvée avec succès');
      setShowApproveDialog(false);
    } catch (error: any) {
      toast.error(`Erreur lors de l'approbation de la demande : ${error.message || 'Erreur inconnue'}`);
    }
  };

  const handleCancel = async () => {
    if (!request || !id) return;
    try {
      const updatedRequest = await demandeService.updateTransportRequestStatus(id, TransportStatus.CANCELLED);
      setRequest(updatedRequest);
      toast.success('Demande annulée avec succès');
      setShowCancelDialog(false);
    } catch (error: any) {
      toast.error(`Erreur lors de l'annulation de la demande : ${error.message || 'Erreur inconnue'}`);
    }
  };

  const canCancel = () => {
    if (!request || request.status === TransportStatus.CANCELLED || request.status === TransportStatus.COMPLETED) {
      return false;
    }
    const scheduledTime = new Date(request.scheduledDate || '').getTime();
    const currentTime = new Date().getTime();
    const thirtyMinutesInMs = 30 * 60 * 1000;
    return currentTime < scheduledTime - thirtyMinutesInMs;
  };

  const formatAddress = (address?: AddressDto) => {
    if (!address || !address.formattedAddress) return 'Non spécifié';
    return address.formattedAddress;
  };

  // Group passengers by departure address
  const passengersByDeparture =
    request?.employeeTransports.reduce((groups, transport) => {
      const departure = formatAddress(transport.departure);
      if (!groups[departure]) {
        groups[departure] = [];
      }
      groups[departure].push(transport);
      return groups;
    }, {} as Record<string, EmployeeTransportDto[]>) || {};

  if (loading) {
    return <div className="flex justify-center py-12">Chargement...</div>;
  }

  if (!request) {
    return <div className="flex justify-center py-12">Demande non trouvée</div>;
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(request?.employeeTransports.length === 1 ? '/transport/individual' : '/transport/group')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Retour</span>
          </Button>
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Car className="h-5 w-5 text-etaxi-yellow flex-shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold truncate">
              <span className="hidden sm:inline">Détails - </span>
              {request.reference || 'N/A'}
            </h2>
            <Badge className={getStatusColor(request.status)}>
              {getStatusLabel(request.status)}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {(request.status === TransportStatus.PENDING || request.status === TransportStatus.APPROVED) && (
            <Button variant="outline" size="sm" onClick={handleEdit} className="flex-1 sm:flex-none">
              <Edit className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline">Modifier</span>
            </Button>
          )}
          {request.status === TransportStatus.PENDING && (
            <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
                >
                  <Check className="mr-1 h-3 w-3 sm:hidden" />
                  <span className="hidden sm:inline">Approuver</span>
                  <span className="sm:hidden">✓</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="mx-4">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Approuver la demande</span>
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir approuver cette demande de transport ? Cette action confirmera la demande et permettra son dispatch.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Retour</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleApprove}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Confirmer l'approbation
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {(request.status === TransportStatus.APPROVED || request.status === TransportStatus.PENDING) && (
            <Button
              size="sm"
              className="bg-etaxi-yellow hover:bg-yellow-500 text-black flex-1 sm:flex-none"
              onClick={handleDispatch}
            >
              <Navigation className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline">Dispatcher</span>
            </Button>
          )}
          {canCancel() && (
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex-1 sm:flex-none">
                  <X className="mr-1 h-3 w-3" />
                  <span className="hidden sm:inline">Annuler</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="mx-4">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center space-x-2">
                    <X className="h-5 w-5 text-red-500" />
                    <span>Annuler la demande</span>
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir annuler cette demande de transport ? Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Retour</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Confirmer l'annulation
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <FileText className="h-4 w-4" />
              <span>Informations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <div className="flex space-x-1 mt-1">
                <Badge variant="outline" className="text-xs">
                  {getTypeLabel(request.type)}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Direction</p>
              <div className="flex space-x-1 mt-1">
                <Badge variant="outline" className="text-xs">
                  {getDirectionLabel(request.direction)}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <div className="flex items-center space-x-1 mt-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs">
                  {request.scheduledDate
                    ? format(new Date(request.scheduledDate), 'dd/MM/yyyy HH:mm', { locale: fr })
                    : 'Non spécifié'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Entreprise</p>
              <div>
                <p className="text-xs font-medium">{request.enterprise?.name || 'Non spécifié'}</p>
                {request.enterprise?.address?.formattedAddress && (
                  <p className="text-xs text-muted-foreground">
                    {request.enterprise.address.formattedAddress}
                  </p>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Demandé par</p>
              <div>
                <p className="text-xs font-medium">{request.requestedBy?.fullName || 'Non spécifié'}</p>
              </div>
            </div>
            {request.note && (
              <div>
                <p className="text-xs text-muted-foreground">Note</p>
                <p className="text-xs bg-muted/50 p-2 rounded mt-1">{request.note}</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">Passagers ({request.employeeTransports.length})</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {Object.entries(passengersByDeparture).map(([departure, transports]) => (
                  <div key={departure} className="space-y-2">
                    <div className="flex items-center space-x-2 p-2 bg-muted rounded text-sm">
                      <MapPin className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="font-medium flex-1 truncate">{departure}</span>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {transports.length}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 ml-2 sm:ml-6">
                      {transports.map((transport) => (
                        <div
                          key={transport.employeeId}
                          className="border rounded p-2 text-xs bg-card"
                        >
                          <div className="font-medium mb-1 truncate">
                            {transport.employee?.fullName || 'Non spécifié'}
                          </div>
                          <div className="space-y-1 text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">
                                {transport.employee?.phone || 'Non spécifié'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">
                                {transport.employee?.email || 'Non spécifié'}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t">
                            <div className="flex items-center space-x-1 text-red-600 mb-1">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="font-medium text-xs">Vers:</span>
                            </div>
                            <p className="text-xs bg-red-50 dark:bg-red-950/20 p-1 rounded border border-red-200 dark:border-red-800 truncate">
                              {formatAddress(transport.arrival)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}