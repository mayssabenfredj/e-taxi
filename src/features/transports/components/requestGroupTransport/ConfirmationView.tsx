import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shareds/components/ui/card';
import { Button } from '@/shareds/components/ui/button';
import { Badge } from '@/shareds/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shareds/components/ui/table';
import { Route, Euro, AlertCircle, CheckCircle, MapPin } from 'lucide-react';
import { SelectedPassenger, RouteEstimation, RecurringDateTime, GroupRoute } from '@/features/transports/types/demande';

interface ConfirmationViewProps {
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
  subsidiaries: any[];
  isEditMode?: boolean;
}

export function ConfirmationView({
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
  subsidiaries,
  isEditMode = false,
}: ConfirmationViewProps) {
  const getFormattedAddress = (passenger: SelectedPassenger, addressId: string | any) => {
    // Si c'est un objet (adresse personnalisée)
    if (addressId && typeof addressId === 'object') {
      return addressId.label || addressId.formattedAddress || 'Adresse personnalisée';
    }
    // Chercher d'abord dans les adresses personnelles
    const address = passenger.addresses?.find((addr) => addr.address.id === addressId);
    if (address) {
      return address.address.formattedAddress || 'Adresse non spécifiée';
    }
    // Si non trouvée, chercher dans toutes les filiales
    if (subsidiaries && Array.isArray(subsidiaries)) {
      const subsidiary = subsidiaries.find((sub) => sub.address && sub.address.id === addressId);
      if (subsidiary && subsidiary.address) {
        return subsidiary.address.formattedAddress || subsidiary.address.street || `Adresse de la filiale : ${subsidiary.name}`;
      }
    }
    return 'Adresse non spécifiée';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirmation de la demande</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-end mb-4">
          <Button onClick={handleSubmit} className="bg-etaxi-yellow hover:bg-yellow-500 text-black">
            <CheckCircle className="mr-2 h-4 w-4" />
            {isEditMode ? 'Confirmer la modification' : 'Confirmer la demande'}
          </Button>
        </div>
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
                  {note && (
                    <div>
                      <dt className="font-medium">Note:</dt>
                      <dd className="text-sm mt-1">{note}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
            {isRecurring && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Récurrence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 font-medium">{recurringDates.length} date(s) programmée(s)</div>
                  <ul className="text-sm space-y-1">
                    {recurringDates.map((rd, idx) => (
                      <li key={idx}>
                        {rd.date instanceof Date
                          ? rd.date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                          : rd.date}
                        {rd.time && (
                          <span> à {rd.time}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center space-x-2">
                <Route className="h-4 w-4 text-etaxi-yellow" />
                <span>Détail des trajets </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h4 className="font-medium mb-2">Passagers</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Passager</TableHead>
                    <TableHead>Départ</TableHead>
                    <TableHead>Arrivée</TableHead>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
        </>
      </CardContent>
    </Card>
  );
}