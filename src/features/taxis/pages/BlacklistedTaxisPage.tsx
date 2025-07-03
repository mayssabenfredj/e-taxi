import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shareds/components/ui/card';
import { Badge } from '@/shareds/components/ui/badge';
import { Button } from '@/shareds/components/ui/button';
import { UserX, Car, User } from 'lucide-react';

export function BlacklistedTaxisPage() {
  // Mock data - in real app would come from API
  const blacklistedTaxis: any[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <UserX className="h-5 w-5 text-red-500" />
        <h3 className="text-lg font-semibold">Taxis Blacklistés</h3>
        <Badge variant="destructive">{blacklistedTaxis.length}</Badge>
      </div>

      {blacklistedTaxis.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun taxi blacklisté</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blacklistedTaxis.map(taxi => (
            <Card key={taxi.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-etaxi-yellow" />
                    <span>{taxi.licensePlate}</span>
                  </div>
                  <UserX className="h-4 w-4 text-red-500" />
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
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    Retirer de la blacklist
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