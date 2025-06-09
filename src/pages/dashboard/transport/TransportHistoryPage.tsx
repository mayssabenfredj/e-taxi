import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableWithPagination } from '@/components/ui/table-with-pagination';
import { Calendar, Clock, Car, Users, MapPin, Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TransportRide {
  id: string;
  reference: string;
  type: 'individual' | 'group';
  requestId: string;
  requestReference: string;
  date: string;
  departureTime: string;
  arrivalTime?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  passengerCount: number;
  departureLocation: string;
  arrivalLocation: string;
  driverName?: string;
  vehicleInfo?: string;
  cost?: number;
}

export function TransportHistoryPage() {
  const navigate = useNavigate();
  
  const [rides] = useState<TransportRide[]>([
    {
      id: '1',
      reference: 'RIDE-2024-001',
      type: 'individual',
      requestId: '101',
      requestReference: 'TR-2024-101',
      date: '2024-01-15',
      departureTime: '09:00',
      arrivalTime: '09:45',
      status: 'completed',
      passengerCount: 1,
      departureLocation: 'Domicile - 15 Rue du Louvre, 75001 Paris',
      arrivalLocation: 'Aéroport Charles de Gaulle, 95700 Roissy',
      driverName: 'Ahmed Hassan',
      vehicleInfo: 'Toyota Prius - AB-123-CD',
      cost: 45.50
    },
    {
      id: '2',
      reference: 'RIDE-2024-002',
      type: 'group',
      requestId: '102',
      requestReference: 'TR-2024-102',
      date: '2024-01-16',
      departureTime: '14:30',
      arrivalTime: '15:15',
      status: 'completed',
      passengerCount: 4,
      departureLocation: 'Siège social - 101 Avenue des Champs-Élysées, 75008 Paris',
      arrivalLocation: 'Centre de conférences, 75016 Paris',
      driverName: 'Marie Dubois',
      vehicleInfo: 'Renault Trafic - EF-456-GH',
      cost: 65.75
    },
    {
      id: '3',
      reference: 'RIDE-2024-003',
      type: 'individual',
      requestId: '103',
      requestReference: 'TR-2024-103',
      date: '2024-01-20',
      departureTime: '08:30',
      status: 'scheduled',
      passengerCount: 1,
      departureLocation: 'Hôtel Marriott, 75008 Paris',
      arrivalLocation: 'Gare de Lyon, 75012 Paris'
    },
    {
      id: '4',
      reference: 'RIDE-2024-004',
      type: 'group',
      requestId: '104',
      requestReference: 'TR-2024-104',
      date: '2024-01-18',
      departureTime: '10:00',
      status: 'in_progress',
      passengerCount: 3,
      departureLocation: 'Bureau Lyon - 67 Rue de la Part-Dieu, 69003 Lyon',
      arrivalLocation: 'Aéroport Saint-Exupéry, 69125 Lyon',
      driverName: 'Jean Moreau',
      vehicleInfo: 'Volkswagen Passat - IJ-789-KL'
    },
    {
      id: '5',
      reference: 'RIDE-2024-005',
      type: 'individual',
      requestId: '105',
      requestReference: 'TR-2024-105',
      date: '2024-01-17',
      departureTime: '16:00',
      status: 'cancelled',
      passengerCount: 1,
      departureLocation: 'Opéra, 75009 Paris',
      arrivalLocation: 'La Défense, 92800 Puteaux'
    }
  ]);

  const handleViewRide = (ride: TransportRide) => {
    // Naviguer vers les détails de la course
    console.log('View ride:', ride);
    // navigate(`/transport/history/${ride.id}`);
    toast.info('Fonctionnalité en développement');
  };

  const getStatusBadge = (status: TransportRide['status']) => {
    const variants = {
      scheduled: { variant: 'outline' as const, label: 'Programmée' },
      in_progress: { variant: 'default' as const, label: 'En cours' },
      completed: { variant: 'secondary' as const, label: 'Terminée' },
      cancelled: { variant: 'destructive' as const, label: 'Annulée' }
    };
    
    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const columns = [
    {
      header: 'Référence',
      accessor: 'reference' as keyof TransportRide,
      render: (ride: TransportRide) => (
        <div>
          <div className="font-medium text-etaxi-yellow">{ride.reference}</div>
          <div className="text-xs text-muted-foreground">
            Demande: {ride.requestReference}
          </div>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'type' as keyof TransportRide,
      render: (ride: TransportRide) => (
        <Badge variant={ride.type === 'individual' ? 'outline' : 'secondary'}>
          {ride.type === 'individual' ? 'Individuel' : 'Groupe'}
        </Badge>
      )
    },
    {
      header: 'Date',
      accessor: 'date' as keyof TransportRide,
      render: (ride: TransportRide) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span>{new Date(ride.date).toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{ride.departureTime}</span>
            {ride.arrivalTime && (
              <span className="text-xs text-muted-foreground">
                → {ride.arrivalTime}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Trajet',
      accessor: 'departureLocation' as keyof TransportRide,
      render: (ride: TransportRide) => (
        <div className="text-sm">
          <div className="flex items-start space-x-1">
            <MapPin className="h-3 w-3 text-green-500 mt-1" />
            <span className="truncate max-w-[200px]">{ride.departureLocation}</span>
          </div>
          <div className="flex items-start space-x-1">
            <MapPin className="h-3 w-3 text-red-500 mt-1" />
            <span className="truncate max-w-[200px]">{ride.arrivalLocation}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Passagers',
      accessor: 'passengerCount' as keyof TransportRide,
      render: (ride: TransportRide) => (
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{ride.passengerCount}</span>
        </div>
      )
    },
    {
      header: 'Statut',
      accessor: 'status' as keyof TransportRide,
      render: (ride: TransportRide) => getStatusBadge(ride.status)
    }
  ];

  const actions = (ride: TransportRide) => (
    <div className="flex items-center space-x-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          handleViewRide(ride);
        }}
        title="Voir les détails"
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );

  const filterOptions = [
    { label: 'Programmée', value: 'scheduled', field: 'status' as keyof TransportRide },
    { label: 'En cours', value: 'in_progress', field: 'status' as keyof TransportRide },
    { label: 'Terminée', value: 'completed', field: 'status' as keyof TransportRide },
    { label: 'Annulée', value: 'cancelled', field: 'status' as keyof TransportRide },
    { label: 'Individuel', value: 'individual', field: 'type' as keyof TransportRide },
    { label: 'Groupe', value: 'group', field: 'type' as keyof TransportRide }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">Historique des courses</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{rides.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Programmées</p>
                <p className="text-2xl font-bold">
                  {rides.filter(r => r.status === 'scheduled').length}
                </p>
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
                  {rides.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Passagers transportés</p>
                <p className="text-2xl font-bold">
                  {rides
                    .filter(r => r.status === 'completed')
                    .reduce((sum, ride) => sum + ride.passengerCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <TableWithPagination
        data={rides}
        columns={columns}
        actions={actions}
        filterOptions={filterOptions}
        title="Liste des courses"
        searchPlaceholder="Rechercher par référence, chauffeur, adresse..."
        onRowClick={handleViewRide}
      />
    </div>
  );
}