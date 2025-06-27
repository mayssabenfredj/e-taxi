import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shareds/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/shareds/components/ui/card';
import { MapPin, Clock, Star, User, Car } from 'lucide-react';
import { TransportHistory } from '@/features/transports/types/demande';
import { Badge } from '@/shareds/components/ui/badge';

interface HistoryDetailsDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedHistory: TransportHistory | null;
}

export function HistoryDetailsDialog({ open, setOpen, selectedHistory }: HistoryDetailsDialogProps) {
  const getStatusBadge = (status: TransportHistory['status']) => {
    const variants = {
      completed: { variant: 'secondary' as const, label: 'Terminée', color: 'bg-green-100 text-green-800' },
      cancelled: { variant: 'destructive' as const, label: 'Annulée', color: 'bg-red-100 text-red-800' },
    };

    const { label, color } = variants[status];
    return <Badge className={color}>{label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails de la course {selectedHistory?.reference}</DialogTitle>
        </DialogHeader>
        {selectedHistory && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              {getStatusBadge(selectedHistory.status)}
              <Badge variant="secondary">Transport de groupe</Badge>
            </div>
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
            <div>
              <p className="text-sm font-medium mb-2">Courses ({selectedHistory.courses.length})</p>
              <div className="space-y-4">
                {selectedHistory.courses.map((course, index) => (
                  <Card key={index} className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Car className="h-4 w-4 text-etaxi-yellow" />
                          <span>{course.taxiNumber}</span>
                        </div>
                        <Badge variant="outline">{course.passengers.length} passagers</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{course.driver.name}</p>
                          <p className="text-xs text-muted-foreground">{course.driver.vehicle}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{course.driver.rating}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-1">Passagers:</p>
                        <div className="grid grid-cols-2 gap-1">
                          {course.passengers.map((passenger, idx) => (
                            <div key={idx} className="text-xs flex items-center space-x-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span>{passenger}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="font-medium">Durée</p>
                          <p>{course.duration}</p>
                        </div>
                        <div>
                          <p className="font-medium">Distance</p>
                          <p>{course.distance}</p>
                        </div>
                        <div>
                          <p className="font-medium">Coût</p>
                          <p className="font-bold text-etaxi-yellow">{course.cost.toFixed(2)}€</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="bg-etaxi-yellow/10 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="font-medium">Coût total</p>
                <p className="text-xl font-bold text-etaxi-yellow">{selectedHistory.totalCost.toFixed(2)}€</p>
              </div>
            </div>
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
  );
}