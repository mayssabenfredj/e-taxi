import React, { useState } from 'react';
import { Card, CardContent } from '@/shareds/components/ui/card';
import { Button } from '@/shareds/components/ui/button';
import { Badge } from '@/shareds/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shareds/components/ui/select';
import { TableWithPagination } from '@/shareds/components/ui/table-with-pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shareds/components/ui/dialog';
import { Car, MapPin, User, Clock, Plus, Search, Filter, Edit, Eye, Star, UserX, Power, PowerOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/shareds/components/ui/input';
import { TaxiDetailForm } from '../components/TaxiDetailForm';

interface Taxi {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year?: number;
  capacity: number;
  active: boolean;
  status: 'available' | 'busy' | 'offline' | 'maintenance';
  driver?: {
    name: string;
    phone: string;
    rating: number;
  };
  location?: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  currentPassengers: number;
  lastUpdate: string;
  totalRides: number;
  preferred: boolean;
  blacklisted: boolean;
}

export function TaxiListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const [taxis, setTaxis] = useState<Taxi[]>([
    {
      id: '1',
      licensePlate: 'AB-123-CD',
      make: 'Toyota',
      model: 'Prius',
      year: 2023,
      capacity: 4,
      active: true,
      status: 'available',
      driver: {
        name: 'Ahmed Hassan',
        phone: '+33 6 12 34 56 78',
        rating: 4.8
      },
      location: {
        address: 'Place de la République, 75011 Paris',
        coordinates: { lat: 48.8676, lng: 2.3635 }
      },
      currentPassengers: 0,
      lastUpdate: '10:30',
      totalRides: 1247,
      preferred: false,
      blacklisted: false
    },
    {
      id: '2',
      licensePlate: 'EF-456-GH',
      make: 'Renault',
      model: 'Zoe',
      year: 2022,
      capacity: 4,
      active: true,
      status: 'busy',
      driver: {
        name: 'Marie Dubois',
        phone: '+33 6 98 76 54 32',
        rating: 4.9
      },
      location: {
        address: 'Gare du Nord, 75010 Paris',
        coordinates: { lat: 48.8800, lng: 2.3550 }
      },
      currentPassengers: 2,
      lastUpdate: '10:28',
      totalRides: 892,
      preferred: true,
      blacklisted: false
    }
  ]);

  // Pagination state
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(10);

  // Pour la démo locale, on pagine sur filteredTaxis
  const paginatedTaxis = taxis.filter(taxi => {
    const matchesSearch = taxi.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         taxi.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${taxi.make} ${taxi.model}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || taxi.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).slice(skip, skip + take);
  const total = taxis.filter(taxi => {
    const matchesSearch = taxi.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         taxi.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${taxi.make} ${taxi.model}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || taxi.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-blue-100 text-blue-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'busy': return 'Occupé';
      case 'offline': return 'Hors ligne';
      case 'maintenance': return 'Maintenance';
      default: return status;
    }
  };

  const togglePreferred = (taxiId: string) => {
    setTaxis(prev => prev.map(taxi => 
      taxi.id === taxiId 
        ? { ...taxi, preferred: !taxi.preferred, blacklisted: false }
        : taxi
    ));
  };

  const toggleBlacklisted = (taxiId: string) => {
    setTaxis(prev => prev.map(taxi => 
      taxi.id === taxiId 
        ? { ...taxi, blacklisted: !taxi.blacklisted, preferred: false }
        : taxi
    ));
  };

  const toggleActive = (taxiId: string) => {
    setTaxis(prev => prev.map(taxi => 
      taxi.id === taxiId 
        ? { ...taxi, active: !taxi.active }
        : taxi
    ));
  };

  const handleSaveTaxi = (taxiData: any) => {
    console.log('Saving taxi:', taxiData);
    setShowAddForm(false);
  };

  const columns = [
    {
      header: 'Véhicule',
      accessor: 'licensePlate',
      render: (taxi: Taxi) => (
        <div>
          <div className="font-medium">{taxi.licensePlate}</div>
          <div className="text-sm text-muted-foreground">
            {taxi.make} {taxi.model} {taxi.year && `(${taxi.year})`}
          </div>
        </div>
      ),
      sortable: true
    },
    {
      header: 'Chauffeur',
      accessor: 'driver.name',
      render: (taxi: Taxi) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{taxi.driver?.name || 'Non assigné'}</div>
            {taxi.driver && (
              <div className="text-sm text-muted-foreground">
                ⭐ {taxi.driver.rating} • {taxi.totalRides} courses
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Statut',
      accessor: 'status',
      render: (taxi: Taxi) => (
        <div className="flex flex-col space-y-1">
          <Badge className={getStatusColor(taxi.status)}>
            {getStatusText(taxi.status)}
          </Badge>
          {!taxi.active && (
            <Badge variant="secondary" className="text-xs">
              Inactif
            </Badge>
          )}
        </div>
      ),
      sortable: true
    },
    {
      header: 'Localisation',
      accessor: 'location.address',
      render: (taxi: Taxi) => (
        taxi.location ? (
          <div className="flex items-center space-x-1 max-w-[200px]">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm truncate">{taxi.location.address}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Non localisé</span>
        )
      )
    },
    {
      header: 'Passagers',
      accessor: 'currentPassengers',
      render: (taxi: Taxi) => (
        <div className="flex items-center space-x-1">
          <div className={`flex space-x-1 ${taxi.currentPassengers === taxi.capacity ? 'text-red-600' : 'text-muted-foreground'}`}>
            {Array.from({ length: taxi.capacity }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < taxi.currentPassengers 
                    ? 'bg-current' 
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm ml-2">
            {taxi.currentPassengers}/{taxi.capacity}
          </span>
        </div>
      )
    },
    {
      header: 'Dernière MAJ',
      accessor: 'lastUpdate',
      render: (taxi: Taxi) => (
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{taxi.lastUpdate}</span>
        </div>
      )
    }
  ];

  const actions = (taxi: Taxi) => (
    <div className="flex space-x-1">
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => navigate(`/taxis/${taxi.id}`)}
        title="Voir détails"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => togglePreferred(taxi.id)}
        title={taxi.preferred ? "Retirer des préférés" : "Ajouter aux préférés"}
        className={taxi.preferred ? "text-yellow-600" : ""}
      >
        <Star className={`h-4 w-4 ${taxi.preferred ? 'fill-current' : ''}`} />
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => toggleBlacklisted(taxi.id)}
        title={taxi.blacklisted ? "Retirer de la blacklist" : "Ajouter à la blacklist"}
        className={taxi.blacklisted ? "text-red-600" : ""}
      >
        <UserX className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => toggleActive(taxi.id)}
        title={taxi.active ? "Désactiver" : "Activer"}
        className={taxi.active ? "text-green-600" : "text-gray-600"}
      >
        {taxi.active ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher par plaque, chauffeur ou modèle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="available">Disponible</SelectItem>
              <SelectItem value="busy">Occupé</SelectItem>
              <SelectItem value="offline">Hors ligne</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un taxi
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{taxis.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">Actifs</p>
                <p className="text-2xl font-bold text-green-600">
                  {taxis.filter(t => t.active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">Préférés</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {taxis.filter(t => t.preferred).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">Blacklistés</p>
                <p className="text-2xl font-bold text-red-600">
                  {taxis.filter(t => t.blacklisted).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <TableWithPagination
        data={paginatedTaxis}
        columns={columns}
        searchPlaceholder="Rechercher des taxis..."
        onRowClick={(taxi) => navigate(`/taxis/${taxi.id}`)}
        actions={actions}
        emptyMessage="Aucun taxi trouvé"
        total={total}
        skip={skip}
        take={take}
        onPageChange={(newSkip, newTake) => {
          setSkip(newSkip);
          setTake(newTake);
        }}
      />

      {/* Add Taxi Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau taxi</DialogTitle>
          </DialogHeader>
          <TaxiDetailForm
            onSave={handleSaveTaxi}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}