import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableWithPagination } from '@/components/ui/table-with-pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { History, Eye, MapPin, Clock, User, Car, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TransportHistory {
  id: string;
  reference: string;
  type: 'individual' | 'group';
  requestedBy: string;
  passengerCount: number;
  departureLocation: string;
  arrivalLocation: string;
  scheduledDate: string;
  completedDate: string;
  status: 'completed' | 'cancelled';
  driver?: {
    name: string;
    rating: number;
    vehicle: string;
  };
  cost: number;
  duration: string;
  distance: string;
  note?: string;
}

export function TransportHistoryPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedHistory, setSelectedHistory] = useState<TransportHistory | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [history] = useState<TransportHistory[]>([
    {
      id: '1',
      reference: 'TR-2024-001',
      type: 'individual',
      requestedBy: 'Jean Dupont',
      passengerCount: 1,
      departureLocation: 'Domicile - 15 Rue du Louvre, 75001 Paris',
      arrivalLocation: 'Aéroport Charles de Gaulle, 95700 Roissy',
      scheduledDate: '2024-01-15 09:00',
      completedDate: '2024-01-15 10:45',
      status: 'completed',
      driver: {
        name: 'Ahmed Hassan',
        rating: 4.8,
        vehicle: 'Toyota Prius - AB-123-CD'
      },
      cost: 65.50,
      duration: '1h 45min',
      distance: '45 km',
      note: 'Transport vers aéroport pour voyage d\'affaires'
    },
    {
      id: '2',
      reference: 'TR-2024-002',
      type: 'group',
      requestedBy: 'Marie Martin',
      passengerCount: 5,
      departureLocation: 'Siège social - 15 Rue du Louvre, 75001 Paris',
      arrivalLocation: 'Centre de conférences - 101 Avenue des Champs-Élysées, 75008 Paris',
      scheduledDate: '2024-01-14 08:30',
      completedDate: '2024-01-14 09:15',
      status: 'completed',
      driver: {
        name: 'Marie Dubois',
        rating: 4.9,
        vehicle: 'Mercedes Vito - EF-456-GH'
      },
      cost: 45.00,
      duration: '45min',
      distance: '12 km',
      note: 'Transport équipe pour réunion client'
    },
    {
      id: '3',
      reference: 'TR-2024-003',
      type: 'individual',
      requestedBy: 'Pierre Durand',
      passengerCount: 1,
      departureLocation: 'Gare du Nord, 75010 Paris',
      arrivalLocation: 'Bureau client - 25 Rue de la République, 75011 Paris',
      scheduledDate: '2024-01-13 14:00',
      completedDate: '2024-01-13 14:30',
      status: 'completed',
      driver: {
        name: 'Jean Moreau',
        rating: 4.6,
        vehicle: 'Volkswagen e-Golf - IJ-789-KL'
      },
      cost: 25.00,
      duration: '30min',
      distance: '8 km'
    },
    {
      id: '4',
      reference: 'TR-2024-004',
      type: 'individual',
      requestedBy: 'Sophie Laurent',
      passengerCount: 1,
      departureLocation: 'Hôtel Marriott, 75008 Paris',
      arrivalLocation: 'Gare de Lyon, 75012 Paris',
      scheduledDate: '2024-01-12 16:00',
      completedDate: '',
      status: 'cancelled',
      cost: 0,
      duration: '',
      distance: '',
      note: 'Annulé par le client'
    }
  ]);

  const handleViewDetails = (historyItem: TransportHistory) => {
    setSelectedHistory(historyItem);
    setDetailsOpen(true);
  };

  const getStatusBadge = (status: TransportHistory['status']) => {
    const variants = {
      completed: { variant: 'default' as const, label: 'Terminée', color: 'bg-green-100 text-green-800' },
      cancelled: { variant: 'destructive' as const, label: 'Annulée', color: 'bg-red-100 text-red-800' }
    };
    
    const { label, color } = variants[status];
    return <Badge className={color}>{label}</Badge>;
  };

  const columns = [
    {
      header: 'Référence',
      accessor: 'reference' as keyof TransportHistory,
      render: (item: TransportHistory) => (
        <div>
          <div className="font-medium text-etaxi-yellow">{item.reference}</div>
          <div className="text-sm text-muted-foreground">
            <Badge variant={item.type === 'individual' ? 'outline' : 'secondary'} className="text-xs">
              {item.type === 'individual' ? 'Individuel' : 'Groupe'}
            </Badge>
          </div>
        </div>
      )
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
      )
    },
    {
      header: 'Trajet',
      accessor: 'departureLocation' as keyof TransportHistory,
      render: (item: TransportHistory) => (
        <div className="text-sm max-w-xs">
          <div className="flex items-center space-x-1 mb-1">
            <MapPin className="h-3 w-3 text-green-500" />
            <span className="truncate">{item.departureLocation.split(' - ')[0]}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3 text-red-500" />
            <span className="truncate">{item.arrivalLocation.split(' - ')[0]}</span>
          </div>
        </div>
      )
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
      )
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
      )
    },
    {
      header: 'Coût',
      accessor: 'cost' as keyof TransportHistory,
      render: (item: TransportHistory) => (
        <div className="text-sm font-medium">
          {item.cost > 0 ? `${item.cost.toFixed(2)}€` : '-'}
        </div>
      )
    },
    {
      header: 'Statut',
      accessor: 'status' as keyof TransportHistory,
      render: (item: TransportHistory) => getStatusBadge(item.status)
    }
  ];

  const actions = (item: TransportHistory) => (
    <Button
      size="sm"
      variant="ghost"
      onClick={(e) => {
        e.stopPropagation();
        handleViewDetails(item);
      }}
      title="Voir les détails"
    >
      <Eye className="h-4 w-4" />
    </Button>
  );

  const filterOptions = [
    { label: 'Toutes', value: 'all', field: 'status' as keyof TransportHistory },
    { label: 'Terminées', value: 'completed', field: 'status' as keyof TransportHistory },
    { label: 'Annulées', value: 'cancelled', field: 'status' as keyof TransportHistory },
    { label: 'Individuelles', value: 'individual', field: 'type' as keyof TransportHistory },
    { label: 'Groupes', value: 'group', field: 'type' as keyof TransportHistory }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <History className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">Historique des transports</h2>
        </div>
      </div>

      {/* Statistics */}
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
        columns={columns}
        actions={actions}
        filterOptions={filterOptions}
        itemsPerPage={10}
        onRowClick={handleViewDetails}
        emptyMessage="Aucun historique de transport trouvé"
        searchPlaceholder="Rechercher par référence, demandeur..."
      />

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la course {selectedHistory?.reference}</DialogTitle>
          </DialogHeader>
          
          {selectedHistory && (
            <div className="space-y-6">
              {/* Status and Type */}
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedHistory.status)}
                <Badge variant={selectedHistory.type === 'individual' ? 'outline' : 'secondary'}>
                  {selectedHistory.type === 'individual' ? 'Transport individuel' : 'Transport de groupe'}
                </Badge>
              </div>

              {/* Basic Info */}
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

              {/* Route */}
              <div>
                <p className="text-sm font-medium mb-2">Trajet</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{selectedHistory.departureLocation}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span className="text-sm">{selectedHistory.arrivalLocation}</span>
                  </div>
                </div>
              </div>

              {/* Driver Info */}
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
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{selectedHistory.driver.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Trip Details */}
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

              {/* Note */}
              {selectedHistory.note && (
                <div>
                  <p className="text-sm font-medium mb-2">Note</p>
                  <p className="text-sm bg-muted/50 p-3 rounded">{selectedHistory.note}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}