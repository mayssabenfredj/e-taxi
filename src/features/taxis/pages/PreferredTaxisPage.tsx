import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shareds/components/ui/card';
import { Badge } from '@/shareds/components/ui/badge';
import { Button } from '@/shareds/components/ui/button';
import { Star, Car, User } from 'lucide-react';

export function PreferredTaxisPage() {
  // Mock data - in real app would come from API
  const preferredTaxis = [
    {
      id: '2',
      licensePlate: 'EF-456-GH',
      make: 'Renault',
      model: 'Zoe',
      driver: { name: 'Marie Dubois', rating: 4.9 },
      status: 'busy',
      totalRides: 892
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Star className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">Taxis Préférés</h3>
        <Badge variant="secondary">{preferredTaxis.length}</Badge>
      </div>

      {preferredTaxis.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun taxi préféré pour le moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {preferredTaxis.map(taxi => (
            <Card key={taxi.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-etaxi-yellow" />
                    <span>{taxi.licensePlate}</span>
                  </div>
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {taxi.make} {taxi.model}
                  </p>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{taxi.driver.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ⭐ {taxi.driver.rating}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {taxi.totalRides} courses effectuées
                  </p>
                  <Button variant="outline" size="sm" className="w-full mt-3">
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