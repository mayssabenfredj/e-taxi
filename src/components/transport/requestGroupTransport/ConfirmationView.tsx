import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Route, Euro, AlertCircle, CheckCircle, MapPin } from 'lucide-react';
import { SelectedPassenger, RouteEstimation, RecurringDateTime, GroupRoute } from '@/types/demande';

interface ConfirmationViewProps {
  isCalculating: boolean;
  transportType: 'public' | 'private';
  scheduledDate: Date;
  scheduledTime: string;
  isRecurring: boolean;
  recurringDates: RecurringDateTime[];
  note: string;
  isHomeToWorkTrip: boolean;
  selectedPassengers: SelectedPassenger[];
  routeEstimations: RouteEstimation[];
  totalPrice: number;
  groupRoute: GroupRoute | null;
  setShowConfirmation: (show: boolean) => void;
  handleSubmit: () => void;
}

export function ConfirmationView({
  isCalculating,
  transportType,
  scheduledDate,
  scheduledTime,
  isRecurring,
  recurringDates,
  note,
  isHomeToWorkTrip,
  selectedPassengers,
  routeEstimations,
  totalPrice,
  groupRoute,
  setShowConfirmation,
  handleSubmit,
}: ConfirmationViewProps) {
  const getFormattedAddress = (passenger: SelectedPassenger, addressId: string) => {
    const address = passenger.addresses?.find((addr) => addr.address.id === addressId);
    return address?.address.formattedAddress || 'Adresse non spécifiée';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirmation de la demande</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isCalculating ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-etaxi-yellow mb-4"></div>
            <p className="text-lg font-medium">Calcul des itinéraires en cours...</p>
            <p className="text-sm text-muted-foreground">Veuillez patienter pendant que nous estimons les trajets</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Informations générales</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="font-medium">Date:</dt>
                      <dd>{scheduledDate.toLocaleDateString('fr-FR')}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Heure:</dt>
                      <dd>{scheduledTime}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Type de transport:</dt>
                      <dd>
                        <Badge variant="outline">{transportType === 'private' ? 'Privé' : 'Public'}</Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Direction:</dt>
                      <dd>
                        <Badge variant="outline">{isHomeToWorkTrip ? 'Domicile → Travail' : 'Travail → Domicile'}</Badge>
                      </dd>
                    </div>
                    {isRecurring && (
                      <div>
                        <dt className="font-medium">Récurrence:</dt>
                        <dd className="text-sm mt-1">{recurringDates.length} date(s) programmée(s)</dd>
                      </div>
                    )}
                    {note && (
                      <div>
                        <dt className="font-medium">Note:</dt>
                        <dd className="text-sm mt-1">{note}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>Passagers</span>
                    <Badge>{selectedPassengers.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-48 overflow-y-auto">
                  {selectedPassengers.map((passenger, idx) => (
                    <div key={passenger.id} className={`py-2 ${idx > 0 ? 'border-t' : ''}`}>
                      <div className="font-medium">{passenger.fullName}</div>
                      <div className="text-sm text-muted-foreground">
                        <div>{passenger.subsidiaryName || 'Non spécifié'}</div>
                        <div>{passenger.phone}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center space-x-2">
                  <Route className="h-4 w-4 text-etaxi-yellow" />
                  <span>Détail des trajets et estimation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 flex items-start space-x-3 mb-4">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-300">Estimation des trajets</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                      Les prix et durées affichés sont des estimations et peuvent varier en fonction des conditions de circulation.
                    </p>
                  </div>
                </div>
                <h4 className="font-medium mb-2">Estimations individuelles</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Passager</TableHead>
                      <TableHead>Départ</TableHead>
                      <TableHead>Arrivée</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Durée</TableHead>
                      <TableHead>Prix</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPassengers.map((passenger, idx) => (
                      <TableRow key={passenger.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <div className="font-medium">{passenger.fullName}</div>
                          <div className="text-xs text-muted-foreground">{passenger.phone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-green-500" />
                              <span className="truncate max-w-[150px]">
                                {getFormattedAddress(passenger, passenger.departureAddressId)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-red-500" />
                              <span className="truncate max-w-[150px]">
                                {getFormattedAddress(passenger, passenger.arrivalAddressId)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{routeEstimations[idx]?.distance || '-'}</TableCell>
                        <TableCell>{routeEstimations[idx]?.duration || '-'}</TableCell>
                        <TableCell>
                          <span className="font-medium text-etaxi-yellow">
                            {routeEstimations[idx]?.price.toFixed(2) || '0.00'} TND
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={6} className="text-right font-bold">
                        Total individuel
                      </TableCell>
                      <TableCell className="font-bold text-etaxi-yellow">
                        {routeEstimations.reduce((sum, est) => sum + est.price, 0).toFixed(2)} TND
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <h4 className="font-medium mt-4 mb-2">Trajet groupé</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  {groupRoute ? (
                    <>
                      <p className="text-sm font-medium">
                        Point de départ :{' '}
                        <span className="text-etaxi-yellow">{groupRoute.origin}</span>
                      </p>
                      {groupRoute.points.length > 2 && (
                        <div className="text-sm mt-2">
                          Points intermédiaires :
                          <ul className="list-disc pl-5">
                            {groupRoute.points.slice(1, -1).map((point, idx) => (
                              <li key={idx}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="text-sm mt-2">
                        Point d'arrivée :{' '}
                        <span className="text-etaxi-yellow">{groupRoute.destination}</span>
                      </p>
                      <p className="text-sm mt-2">
                        Itinéraire : {groupRoute.points.join(' → ')}
                      </p>
                      <p className="text-sm mt-2">
                        Distance totale : {groupRoute.totalDistance}
                      </p>
                      <p className="text-sm mt-2">
                        Durée estimée : {groupRoute.totalDuration}
                      </p>
                      <p className="text-sm mt-2 font-bold text-etaxi-yellow">
                        Prix total estimé : {totalPrice.toFixed(2)} TND
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-red-500">Impossible de calculer le trajet groupé</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center space-x-2">
                  <Euro className="h-4 w-4 text-etaxi-yellow" />
                  <span>Estimation financière</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-etaxi-yellow/10 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Euro className="h-5 w-5 text-etaxi-yellow" />
                        <span className="font-medium">Prix total groupé estimé:</span>
                      </div>
                      <span className="text-xl font-bold text-etaxi-yellow">{totalPrice.toFixed(2)} TND</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      <p>Basé sur {selectedPassengers.length} passager(s) et un trajet optimisé</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Cette estimation est basée sur les tarifs actuels et peut varier en fonction des conditions de circulation.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center space-x-2">
                  <Euro className="h-4 w-4 text-etaxi-yellow" />
                  <span>Conditions et politique d'annulation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Conditions et politique d'annulation</h4>
                <ul className="text-sm space-y-1 list-disc pl-5">
                  <li>Annulation gratuite jusqu'à 30 minutes avant le départ</li>
                  <li>Les prix affichés sont des estimations et peuvent varier</li>
                  <li>Le paiement sera effectué selon les modalités de votre contrat</li>
                  <li>En confirmant, vous acceptez les conditions générales de service</li>
                </ul>
              </CardContent>
            </Card>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowConfirmation(false)}>Retour</Button>
              <Button onClick={handleSubmit} className="bg-etaxi-yellow hover:bg-yellow-500 text-black">
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirmer la demande
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}