import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableWithPagination } from '@/components/ui/table-with-pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Car, Plus, Eye, Copy, Navigation, Calendar as CalendarIcon, X, AlertTriangle, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface TransportRequest {
  id: string;
  type: 'individual' | 'group';
  requestedBy: string;
  passengerCount: number;
  departureLocation: string;
  arrivalLocation: string;
  scheduledDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  note?: string;
}

export function TransportPage() {
  const navigate = useNavigate();
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TransportRequest | null>(null);
  const [duplicateDate, setDuplicateDate] = useState<Date>(new Date());
  const [duplicateTime, setDuplicateTime] = useState('09:00');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState<TransportRequest | null>(null);
  
  const [requests, setRequests] = useState<TransportRequest[]>([
    {
      id: '1',
      type: 'individual',
      requestedBy: 'Jean Dupont',
      passengerCount: 1,
      departureLocation: 'Domicile',
      arrivalLocation: 'Aéroport CDG',
      scheduledDate: '2024-01-20 09:00',
      status: 'pending'
    },
    {
      id: '2',
      type: 'group',
      requestedBy: 'Marie Martin',
      passengerCount: 5,
      departureLocation: 'Siège social',
      arrivalLocation: 'Centre de conférences',
      scheduledDate: '2024-01-22 08:30',
      status: 'approved'
    },
    {
      id: '3',
      type: 'individual',
      requestedBy: 'Pierre Durand',
      passengerCount: 1,
      departureLocation: 'Gare du Nord',
      arrivalLocation: 'Bureau client',
      scheduledDate: '2024-01-25 14:00',
      status: 'completed'
    }
  ]);

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

  const handleCancelRequest = (request: TransportRequest) => {
    // Vérifier si la demande peut être annulée (30 minutes avant le départ)
    const scheduledTime = new Date(request.scheduledDate).getTime();
    const currentTime = new Date().getTime();
    const thirtyMinutesInMs = 30 * 60 * 1000;
    
    if (currentTime >= (scheduledTime - thirtyMinutesInMs)) {
      toast.error('Impossible d\'annuler une demande moins de 30 minutes avant le départ');
      return;
    }
    
    setRequestToCancel(request);
    setCancelDialogOpen(true);
  };

  const confirmCancelRequest = () => {
    if (requestToCancel) {
      setRequests(prev => 
        prev.map(req => 
          req.id === requestToCancel.id 
            ? { ...req, status: 'rejected' as const } 
            : req
        )
      );
      toast.success('Demande annulée avec succès');
      setCancelDialogOpen(false);
      setRequestToCancel(null);
    }
  };

  const confirmDuplicate = () => {
    if (selectedRequest) {
      const duplicatedRequest = {
        ...selectedRequest,
        id: `${selectedRequest.id}-copy-${Date.now()}`,
        scheduledDate: `${duplicateDate.toISOString().split('T')[0]} ${duplicateTime}`,
        status: 'pending' as const
      };
      
      if (selectedRequest.type === 'individual') {
        navigate('/transport/create', { state: { duplicateData: duplicatedRequest } });
      } else {
        navigate('/transport/create-group', { state: { duplicateData: duplicatedRequest } });
      }
      
      toast.success('Demande dupliquée avec succès');
      setDuplicateDialogOpen(false);
    }
  };

  const getStatusBadge = (status: TransportRequest['status']) => {
    const variants = {
      pending: { variant: 'outline' as const, label: 'En attente' },
      approved: { variant: 'default' as const, label: 'Approuvée' },
      rejected: { variant: 'destructive' as const, label: 'Rejetée' },
      completed: { variant: 'secondary' as const, label: 'Terminée' }
    };
    
    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const columns = [
    {
      header: 'Demandeur',
      accessor: 'requestedBy' as keyof TransportRequest,
      render: (request: TransportRequest) => (
        <div>
          <div className="font-medium">{request.requestedBy}</div>
          <div className="text-sm text-muted-foreground">
            <Badge variant={request.type === 'individual' ? 'outline' : 'secondary'}>
              {request.type === 'individual' ? 'Individuel' : 'Groupe'}
            </Badge>
          </div>
        </div>
      )
    },
    {
      header: 'Passagers',
      accessor: 'passengerCount' as keyof TransportRequest,
      render: (request: TransportRequest) => `${request.passengerCount} passager${request.passengerCount > 1 ? 's' : ''}`
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

  const actions = (request: TransportRequest) => (
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
      {request.status === 'approved' && request.type === 'group' && (
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
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            handleCancelRequest(request);
          }}
          title="Annuler"
          className="text-red-500 hover:text-red-700"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Car className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">Demandes de transport</h2>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => navigate('/transport/drafts')}
          >
            Brouillons
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/transport/history')}
          >
            <History className="mr-2 h-4 w-4" />
            Historique
          </Button>
          <Button 
            onClick={() => navigate('/transport/create')}
            className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
          >
            <Plus className="mr-2 h-4 w-4" />
            Demande individuelle
          </Button>
          <Button 
            onClick={() => navigate('/transport/create-group')}
            className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
          >
            <Plus className="mr-2 h-4 w-4" />
            Demande de groupe
          </Button>
        </div>
      </div>

      <TableWithPagination
        data={requests}
        columns={columns}
        actions={actions}
        itemsPerPage={10}
        onRowClick={handleViewRequest}
        emptyMessage="Aucune demande de transport trouvée"
      />

      {/* Dialog pour dupliquer une demande */}
      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dupliquer la demande</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Sélectionner une nouvelle date</Label>
              <Calendar
                mode="single"
                selected={duplicateDate}
                onSelect={(date) => date && setDuplicateDate(date)}
                className="rounded-md border"
              />
            </div>
            
            <div>
              <Label htmlFor="duplicate-time">Heure</Label>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="duplicate-time"
                  type="time"
                  value={duplicateTime}
                  onChange={(e) => setDuplicateTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDuplicateDialogOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={confirmDuplicate}
                className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
              >
                Dupliquer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour annuler une demande */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Annuler la demande</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler cette demande de transport ? 
              Cette action est irréversible.
              {requestToCancel?.type === 'group' && ' Tous les passagers seront notifiés.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancelRequest}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmer l'annulation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}