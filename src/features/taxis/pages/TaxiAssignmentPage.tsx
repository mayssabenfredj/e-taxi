
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shareds/components/ui/card';
import { Button } from '@/shareds/components/ui/button';
import { Badge } from '@/shareds/components/ui/badge';
import { TableWithPagination } from '@/shareds/components/ui/table-with-pagination';
import { RadioGroup, RadioGroupItem } from '@/shareds/components/ui/radio-group';
import { Label } from '@/shareds/components/ui/label';
import { Separator } from '@/shareds/components/ui/separator';
import { Car, Users, Clock, MapPin, Navigation, CheckCircle } from 'lucide-react';

interface TaxiOption {
  id: string;
  name: string;
  type: 'preferred' | 'available';
  capacity: number;
  currentLocation: string;
  estimatedArrival: string;
  rating: number;
  isPreferred: boolean;
}

interface TransportRequest {
  id: string;
  reference: string;
  passengersCount: number;
  scheduledDate: string;
  note?: string;
}

export function TaxiAssignmentPage() {
  const [selectedOption, setSelectedOption] = useState<'preferred' | 'dispatch'>('preferred');
  const [selectedTaxi, setSelectedTaxi] = useState<string>('');
  
  const mockRequest: TransportRequest = {
    id: '1',
    reference: 'TR-2024-001',
    passengersCount: 3,
    scheduledDate: '2024-01-15 09:00',
    note: 'Transport pour réunion client importante'
  };

  const [availableTaxis] = useState<TaxiOption[]>([
    {
      id: '1',
      name: 'Taxi VIP 001',
      type: 'preferred',
      capacity: 4,
      currentLocation: 'Zone Industrielle',
      estimatedArrival: '15 min',
      rating: 4.8,
      isPreferred: true
    },
    {
      id: '2',
      name: 'Taxi Confort 023',
      type: 'preferred',
      capacity: 4,
      currentLocation: 'Centre Ville',
      estimatedArrival: '8 min',
      rating: 4.6,
      isPreferred: true
    },
    {
      id: '3',
      name: 'Taxi Standard 045',
      type: 'available',
      capacity: 4,
      currentLocation: 'Banlieue Nord',
      estimatedArrival: '25 min',
      rating: 4.2,
      isPreferred: false
    },
    {
      id: '4',
      name: 'Taxi Plus 067',
      type: 'available',
      capacity: 6,
      currentLocation: 'Aéroport',
      estimatedArrival: '35 min',
      rating: 4.5,
      isPreferred: false
    }
  ]);

  const handleAssignTaxi = () => {
    if (selectedOption === 'preferred' && selectedTaxi) {
      console.log('Assigning preferred taxi:', selectedTaxi);
    } else if (selectedOption === 'dispatch') {
      console.log('Dispatching to available taxi queue');
    }
  };

  const preferredTaxis = availableTaxis.filter(taxi => taxi.isPreferred);
  const availableTaxisOnly = availableTaxis.filter(taxi => !taxi.isPreferred);

  const taxiColumns = [
    {
      header: 'Taxi',
      accessor: 'name' as keyof TaxiOption,
      render: (item: TaxiOption) => (
        <div className="flex items-center space-x-2">
          <Car className="h-4 w-4 text-etaxi-yellow" />
          <span className="font-medium">{item.name}</span>
        </div>
      )
    },
    {
      header: 'Capacité',
      accessor: 'capacity' as keyof TaxiOption,
      render: (item: TaxiOption) => (
        <div className="flex items-center space-x-1">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span>{item.capacity} places</span>
        </div>
      )
    },
    {
      header: 'Position',
      accessor: 'currentLocation' as keyof TaxiOption,
      render: (item: TaxiOption) => (
        <div className="flex items-center space-x-1">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span>{item.currentLocation}</span>
        </div>
      )
    },
    {
      header: 'Arrivée estimée',
      accessor: 'estimatedArrival' as keyof TaxiOption,
      render: (item: TaxiOption) => (
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span>{item.estimatedArrival}</span>
        </div>
      )
    },
    {
      header: 'Note',
      accessor: 'rating' as keyof TaxiOption,
      render: (item: TaxiOption) => (
        <Badge variant="outline">⭐ {item.rating}</Badge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Navigation className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">Assignment de Taxi</h2>
        </div>
      </div>

      {/* Request Details */}
      <Card>
        <CardHeader>
          <CardTitle>Détails de la demande</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Référence</p>
              <p className="font-medium">{mockRequest.reference}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Passagers</p>
              <p className="font-medium">{mockRequest.passengersCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date programmée</p>
              <p className="font-medium">{new Date(mockRequest.scheduledDate).toLocaleString('fr-FR')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Statut</p>
              <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
            </div>
          </div>
          {mockRequest.note && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Note</p>
              <p className="text-sm bg-muted/50 p-2 rounded">{mockRequest.note}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Options */}
      <Card>
        <CardHeader>
          <CardTitle>Options d'assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedOption} onValueChange={(value: 'preferred' | 'dispatch') => setSelectedOption(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="preferred" id="preferred" />
              <Label htmlFor="preferred" className="font-medium">Sélectionner un taxi préféré</Label>
            </div>
            <p className="text-sm text-muted-foreground ml-6">Choisir parmi les taxis préférés de votre filiale</p>
            
            <div className="flex items-center space-x-2 mt-4">
              <RadioGroupItem value="dispatch" id="dispatch" />
              <Label htmlFor="dispatch" className="font-medium">Dispatcher automatiquement</Label>
            </div>
            <p className="text-sm text-muted-foreground ml-6">Placer la demande en file d'attente pour le prochain taxi disponible</p>
          </RadioGroup>
        </CardContent>
      </Card>

      {selectedOption === 'preferred' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Car className="h-5 w-5" />
              <span>Taxis Préférés ({preferredTaxis.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedTaxi} onValueChange={setSelectedTaxi}>
              <div className="space-y-4">
                {preferredTaxis.map((taxi) => (
                  <div key={taxi.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value={taxi.id} id={taxi.id} />
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor={taxi.id} className="font-medium">{taxi.name}</Label>
                        <p className="text-xs text-muted-foreground">Taxi préféré</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{taxi.capacity} places</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{taxi.currentLocation}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-green-500" />
                          <span className="text-sm text-green-600">{taxi.estimatedArrival}</span>
                        </div>
                        <Badge variant="outline">⭐ {taxi.rating}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {selectedOption === 'dispatch' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Navigation className="h-5 w-5" />
              <span>File d'attente de dispatching</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Navigation className="h-12 w-12 text-etaxi-yellow mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Dispatching automatique</h3>
              <p className="text-muted-foreground mb-4">
                Votre demande sera placée en file d'attente et assignée au prochain taxi disponible.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm"><strong>Temps d'attente estimé:</strong> 10-20 minutes</p>
                <p className="text-sm"><strong>Taxis disponibles:</strong> {availableTaxisOnly.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Taxis List */}
      <TableWithPagination
        data={availableTaxisOnly}
        columns={taxiColumns}
        title={`Taxis Disponibles (${availableTaxisOnly.length})`}
        searchPlaceholder="Rechercher un taxi..."
      />

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4">
        <Button variant="outline">Annuler</Button>
        <Button 
          className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
          onClick={handleAssignTaxi}
          disabled={selectedOption === 'preferred' && !selectedTaxi}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          {selectedOption === 'preferred' ? 'Assigner le taxi' : 'Dispatcher la demande'}
        </Button>
      </div>
    </div>
  );
}
