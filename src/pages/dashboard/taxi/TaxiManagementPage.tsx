
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Car, MapPin, User, Clock, Navigation, Plus, Search, Filter } from 'lucide-react';

interface Taxi {
  id: string;
  licensePlate: string;
  driver: {
    name: string;
    phone: string;
    rating: number;
  };
  status: 'available' | 'busy' | 'offline' | 'maintenance';
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  capacity: number;
  currentPassengers: number;
  lastUpdate: string;
  totalRides: number;
  make: string;
  model: string;
}

export function TaxiManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [taxis] = useState<Taxi[]>([
    {
      id: '1',
      licensePlate: 'AB-123-CD',
      driver: {
        name: 'Ahmed Hassan',
        phone: '+33 6 12 34 56 78',
        rating: 4.8
      },
      status: 'available',
      location: {
        address: 'Place de la République, 75011 Paris',
        coordinates: { lat: 48.8676, lng: 2.3635 }
      },
      capacity: 4,
      currentPassengers: 0,
      lastUpdate: '10:30',
      totalRides: 1247,
      make: 'Toyota',
      model: 'Prius'
    },
    {
      id: '2',
      licensePlate: 'EF-456-GH',
      driver: {
        name: 'Marie Dubois',
        phone: '+33 6 98 76 54 32',
        rating: 4.9
      },
      status: 'busy',
      location: {
        address: 'Gare du Nord, 75010 Paris',
        coordinates: { lat: 48.8800, lng: 2.3550 }
      },
      capacity: 4,
      currentPassengers: 2,
      lastUpdate: '10:28',
      totalRides: 892,
      make: 'Renault',
      model: 'Zoe'
    },
    {
      id: '3',
      licensePlate: 'IJ-789-KL',
      driver: {
        name: 'Jean Moreau',
        phone: '+33 7 11 22 33 44',
        rating: 4.6
      },
      status: 'offline',
      location: {
        address: 'Châtelet, 75001 Paris',
        coordinates: { lat: 48.8583, lng: 2.3470 }
      },
      capacity: 4,
      currentPassengers: 0,
      lastUpdate: '09:45',
      totalRides: 2156,
      make: 'Volkswagen',
      model: 'e-Golf'
    },
    {
      id: '4',
      licensePlate: 'MN-012-OP',
      driver: {
        name: 'Fatima El Mansouri',
        phone: '+33 6 55 44 33 22',
        rating: 4.7
      },
      status: 'maintenance',
      location: {
        address: 'Garage Centrale, 75020 Paris',
        coordinates: { lat: 48.8566, lng: 2.4070 }
      },
      capacity: 4,
      currentPassengers: 0,
      lastUpdate: '08:00',
      totalRides: 743,
      make: 'Tesla',
      model: 'Model 3'
    }
  ]);

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

  const filteredTaxis = taxis.filter(taxi => {
    const matchesSearch = taxi.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         taxi.driver.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || taxi.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    available: taxis.filter(t => t.status === 'available').length,
    busy: taxis.filter(t => t.status === 'busy').length,
    offline: taxis.filter(t => t.status === 'offline').length,
    maintenance: taxis.filter(t => t.status === 'maintenance').length
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Car className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">Gestion des Taxis</h2>
        </div>
        <Button className="bg-etaxi-yellow hover:bg-yellow-500 text-black">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un taxi
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">Disponibles</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">Occupés</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.busy}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-gray-500 rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">Hors ligne</p>
                <p className="text-2xl font-bold text-gray-600">{statusCounts.offline}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.maintenance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="animate-slide-up">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par plaque ou chauffeur..."
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
        </CardContent>
      </Card>

      {/* Taxis Table */}
      <Card className="animate-slide-up">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Véhicule</TableHead>
                <TableHead>Chauffeur</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Passagers</TableHead>
                <TableHead>Dernière MAJ</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTaxis.map((taxi) => (
                <TableRow key={taxi.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{taxi.licensePlate}</div>
                      <div className="text-sm text-muted-foreground">
                        {taxi.make} {taxi.model}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{taxi.driver.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ⭐ {taxi.driver.rating} • {taxi.totalRides} courses
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(taxi.status)}>
                      {getStatusText(taxi.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 max-w-[200px]">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate">{taxi.location.address}</span>
                    </div>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{taxi.lastUpdate}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Navigation className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
