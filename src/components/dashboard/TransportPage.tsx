
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableWithPagination } from '@/components/ui/table-with-pagination';
import { 
  Plus, 
  Car, 
  Calendar, 
  Users, 
  Clock,
  Edit,
  Eye,
  Navigation,
  Download,
  Filter
} from 'lucide-react';

interface TransportRequest {
  id: string;
  reference: string;
  type: 'immediate' | 'scheduled';
  requestType: 'private' | 'public';
  status: 'pending' | 'approved' | 'dispatched' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  requestedBy: string;
  enterprise: string;
  subsidiary?: string;
  passengersCount: number;
  note?: string;
  createdAt: string;
}

export function TransportPage() {
  const navigate = useNavigate();
  
  const [transportRequests] = useState<TransportRequest[]>([
    {
      id: '1',
      reference: 'TR-2024-001',
      type: 'scheduled',
      requestType: 'public',
      status: 'pending',
      scheduledDate: '2024-01-15 09:00',
      requestedBy: 'Marie Dubois',
      enterprise: 'TechCorp SARL',
      subsidiary: 'TechCorp Paris',
      passengersCount: 2,
      note: 'Transport pour réunion client importante',
      createdAt: '2024-01-10 14:30'
    },
    {
      id: '2',
      reference: 'TR-2024-002',
      type: 'immediate',
      requestType: 'private',
      status: 'approved',
      scheduledDate: '2024-01-15 09:30',
      requestedBy: 'Pierre Durand',
      enterprise: 'InnovSoft',
      passengersCount: 1,
      note: 'Rendez-vous médical urgent',
      createdAt: '2024-01-10 15:45'
    },
    {
      id: '3',
      reference: 'TR-2024-003',
      type: 'scheduled',
      requestType: 'public',
      status: 'dispatched',
      scheduledDate: '2024-01-15 09:45',
      requestedBy: 'Sophie Lefebvre',
      enterprise: 'GlobalTech',
      passengersCount: 3,
      createdAt: '2024-01-10 16:20'
    },
    {
      id: '4',
      reference: 'TR-2024-004',
      type: 'scheduled',
      requestType: 'public',
      status: 'completed',
      scheduledDate: '2024-01-14 08:00',
      requestedBy: 'Marc Rousseau',
      enterprise: 'DataCorp',
      subsidiary: 'DataCorp Lyon',
      passengersCount: 4,
      createdAt: '2024-01-09 10:15'
    },
    {
      id: '5',
      reference: 'TR-2024-005',
      type: 'immediate',
      requestType: 'private',
      status: 'in_progress',
      scheduledDate: '2024-01-15 10:00',
      requestedBy: 'Anna Martin',
      enterprise: 'TechCorp SARL',
      passengersCount: 1,
      note: 'Course vers aéroport',
      createdAt: '2024-01-15 09:30'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'dispatched': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'dispatched': return 'Dispatché';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const columns = [
    {
      header: 'Référence',
      accessor: 'reference' as keyof TransportRequest,
      sortable: true,
      render: (item: TransportRequest) => (
        <div className="font-medium text-etaxi-yellow">{item.reference}</div>
      )
    },
    {
      header: 'Type',
      accessor: 'requestType' as keyof TransportRequest,
      render: (item: TransportRequest) => (
        <Badge variant={item.requestType === 'private' ? 'default' : 'secondary'}>
          {item.requestType === 'private' ? 'Privé' : 'Public'}
        </Badge>
      )
    },
    {
      header: 'Statut',
      accessor: 'status' as keyof TransportRequest,
      filterable: true,
      render: (item: TransportRequest) => (
        <Badge className={getStatusColor(item.status)}>
          {getStatusLabel(item.status)}
        </Badge>
      )
    },
    {
      header: 'Date programmée',
      accessor: 'scheduledDate' as keyof TransportRequest,
      sortable: true,
      render: (item: TransportRequest) => (
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(item.scheduledDate).toLocaleString('fr-FR')}</span>
        </div>
      )
    },
    {
      header: 'Demandeur',
      accessor: 'requestedBy' as keyof TransportRequest,
      sortable: true
    },
    {
      header: 'Entreprise',
      accessor: 'enterprise' as keyof TransportRequest,
      sortable: true,
      render: (item: TransportRequest) => (
        <div>
          <div className="font-medium">{item.enterprise}</div>
          {item.subsidiary && (
            <div className="text-xs text-muted-foreground">{item.subsidiary}</div>
          )}
        </div>
      )
    },
    {
      header: 'Passagers',
      accessor: 'passengersCount' as keyof TransportRequest,
      render: (item: TransportRequest) => (
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{item.passengersCount}</span>
        </div>
      )
    }
  ];

  const filterOptions = [
    { label: 'En attente', value: 'pending', field: 'status' as keyof TransportRequest },
    { label: 'Approuvé', value: 'approved', field: 'status' as keyof TransportRequest },
    { label: 'Dispatché', value: 'dispatched', field: 'status' as keyof TransportRequest },
    { label: 'En cours', value: 'in_progress', field: 'status' as keyof TransportRequest },
    { label: 'Terminé', value: 'completed', field: 'status' as keyof TransportRequest },
    { label: 'Annulé', value: 'cancelled', field: 'status' as keyof TransportRequest },
  ];

  const handleRowClick = (request: TransportRequest) => {
    // Navigate to request details
    console.log('View request details:', request.id);
  };

  const getActions = (request: TransportRequest) => (
    <div className="flex items-center space-x-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => console.log('View details:', request.id)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      
      {(request.status === 'pending' || request.status === 'approved') && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => console.log('Edit request:', request.id)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      
      {(request.status === 'approved' || request.status === 'pending') && (
        <Button
          size="sm"
          variant="ghost"
          className="text-etaxi-yellow hover:text-yellow-600"
          onClick={() => navigate('/dispatch')}
        >
          <Navigation className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  const stats = [
    {
      title: 'Total Demandes',
      value: transportRequests.length,
      icon: Car,
      color: 'text-blue-500'
    },
    {
      title: 'En Attente',
      value: transportRequests.filter(r => r.status === 'pending').length,
      icon: Clock,
      color: 'text-yellow-500'
    },
    {
      title: 'En Cours',
      value: transportRequests.filter(r => r.status === 'in_progress').length,
      icon: Navigation,
      color: 'text-purple-500'
    },
    {
      title: 'Terminées',
      value: transportRequests.filter(r => r.status === 'completed').length,
      icon: Users,
      color: 'text-green-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Car className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">Gestion des Demandes de Transport</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate('/dispatch')}>
            <Navigation className="mr-2 h-4 w-4" />
            Interface Dispatching
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button 
            className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
            onClick={() => navigate('/transport/create')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle demande
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transport Requests Table */}
      <TableWithPagination
        data={transportRequests}
        columns={columns}
        title="Liste des Demandes de Transport"
        searchPlaceholder="Rechercher par référence, demandeur, entreprise..."
        onRowClick={handleRowClick}
        actions={getActions}
        filterOptions={filterOptions}
      />
    </div>
  );
}
