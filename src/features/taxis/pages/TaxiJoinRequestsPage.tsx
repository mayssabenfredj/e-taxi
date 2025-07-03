import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shareds/components/ui/card';
import { Badge } from '@/shareds/components/ui/badge';
import { Button } from '@/shareds/components/ui/button';
import { UserPlus, Car, User, Clock, Check, X } from 'lucide-react';

export function TaxiJoinRequestsPage() {
  // Mock data - in real app would come from API
  const joinRequests = [
    {
      id: '1',
      licensePlate: 'XY-999-ZZ',
      make: 'Peugeot',
      model: '508',
      driverName: 'Pierre Martin',
      driverPhone: '+33 6 11 22 33 44',
      submittedAt: '2024-01-15T10:30:00Z',
      status: 'pending'
    },
    {
      id: '2',
      licensePlate: 'UV-888-WW',
      make: 'Citroën',
      model: 'C4',
      driverName: 'Sophie Leroy',
      driverPhone: '+33 6 55 66 77 88',
      submittedAt: '2024-01-14T14:20:00Z',
      status: 'pending'
    }
  ];

  const handleApprove = (requestId: string) => {
    console.log('Approving request:', requestId);
  };

  const handleReject = (requestId: string) => {
    console.log('Rejecting request:', requestId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <UserPlus className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Demandes d'Adhésion</h3>
        <Badge variant="secondary">{joinRequests.length}</Badge>
      </div>

      {joinRequests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucune demande d'adhésion en attente</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {joinRequests.map(request => (
            <Card key={request.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Car className="h-5 w-5 text-etaxi-yellow" />
                    <span>{request.licensePlate}</span>
                    <Badge variant="outline">En attente</Badge>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(request.submittedAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Informations du véhicule</h4>
                    <p className="text-sm text-muted-foreground">
                      {request.make} {request.model}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Plaque: {request.licensePlate}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Informations du chauffeur</h4>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{request.driverName}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {request.driverPhone}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <Button 
                    onClick={() => handleApprove(request.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approuver
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleReject(request.id)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Rejeter
                  </Button>
                  <Button variant="outline">
                    Voir détails
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
