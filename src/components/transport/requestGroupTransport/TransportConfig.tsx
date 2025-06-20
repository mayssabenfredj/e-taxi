import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Home, Briefcase, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { RecurringDateTime, SelectedPassenger } from '@/types/demande';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TransportConfigProps {
  transportType: 'public' | 'private';
  setTransportType: (type: 'public' | 'private') => void;
  scheduledDate: Date;
  setScheduledDate: (date: Date) => void;
  scheduledTime: string;
  setScheduledTime: (time: string) => void;
  isRecurring: boolean;
  setIsRecurring: (recurring: boolean) => void;
  recurringDates: RecurringDateTime[];
  handleRecurringDateChange: (dates: Date[] | undefined) => void;
  updateRecurringTime: (index: number, time: string) => void;
  isHomeToWorkTrip: boolean;
  handleToggleTripDirection: () => void;
  note: string;
  setNote: (note: string) => void;
  selectedPassengers: SelectedPassenger[];
  updatePassengerAddress: (passengerId: string, field: 'departureAddressId' | 'arrivalAddressId', value: string) => void;
  showEmployeeList: boolean;
  setShowEmployeeList: (show: boolean) => void;
  handleShowConfirmation: () => void;
}

export function TransportConfig({
  transportType,
  setTransportType,
  scheduledDate,
  setScheduledDate,
  scheduledTime,
  setScheduledTime,
  isRecurring,
  setIsRecurring,
  recurringDates,
  handleRecurringDateChange,
  updateRecurringTime,
  isHomeToWorkTrip,
  handleToggleTripDirection,
  note,
  setNote,
  selectedPassengers,
  updatePassengerAddress,
  showEmployeeList,
  setShowEmployeeList,
  handleShowConfirmation,
}: TransportConfigProps) {
  return (
    <Card className={showEmployeeList ? 'lg:col-span-2' : 'lg:col-span-3'}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Configuration du transport</CardTitle>
          {!showEmployeeList && (
            <Button variant="outline" size="sm" onClick={() => setShowEmployeeList(true)}>
              Afficher la liste des employés
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-sm">Date</Label>
            <Input
              type="date"
              value={scheduledDate.toISOString().split('T')[0]}
              onChange={(e) => setScheduledDate(new Date(e.target.value))}
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm">{isHomeToWorkTrip ? "Heure d'arrivée" : "Heure de départ"}</Label>
            <Input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm">Type</Label>
            <Select value={transportType} onValueChange={setTransportType}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Privé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox id="recurring" checked={isRecurring} onCheckedChange={(checked) => setIsRecurring(checked === true)} />
            <Label htmlFor="recurring" className="text-sm">Récurrent</Label>
          </div>
        </div>
        <div className="flex items-center justify-between space-x-4 p-3 border rounded-md">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Direction du trajet</Label>
            <div className="text-sm text-muted-foreground">
              {isHomeToWorkTrip ? 'Domicile → Travail (heure d\'arrivée)' : 'Travail → Domicile (heure de départ)'}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Home className={`h-4 w-4 ${isHomeToWorkTrip ? 'text-etaxi-yellow' : 'text-muted-foreground'}`} />
            <Switch checked={!isHomeToWorkTrip} onCheckedChange={handleToggleTripDirection} />
            <Briefcase className={`h-4 w-4 ${!isHomeToWorkTrip ? 'text-etaxi-yellow' : 'text-muted-foreground'}`} />
          </div>
        </div>
        {isRecurring && (
          <div className="space-y-3 p-3 border rounded">
            <Label className="text-sm font-medium">Dates de récurrence</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Calendar
                mode="multiple"
                selected={recurringDates.map((rd) => rd.date)}
                onSelect={handleRecurringDateChange}
                className="rounded-md border text-sm"
                disabled={(date) => date < new Date()}
              />
              {recurringDates.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Heures par date</Label>
                  <ScrollArea className="h-32">
                    {recurringDates.map((rd, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <span className="text-xs w-20">{format(rd.date, 'dd/MM', { locale: fr })}</span>
                        <Input
                          type="time"
                          value={rd.time}
                          onChange={(e) => updateRecurringTime(index, e.target.value)}
                          className="text-xs h-8"
                        />
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>
        )}
        {selectedPassengers.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Passagers ({selectedPassengers.length})</Label>
            <div className="border rounded">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Passager</TableHead>
                    <TableHead className="text-xs">Contact</TableHead>
                    <TableHead className="text-xs">Départ</TableHead>
                    <TableHead className="text-xs">Arrivée</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedPassengers.map((passenger) => {
                    const employeeAddresses = passenger.addresses?.map((addr) => ({
                      id: addr.address.id || 'none', // Use the address UUID, fallback to 'none'
                      formattedAddress: addr.address.formattedAddress || 'Adresse non spécifiée',
                    })) || [];
                    const addressOptions = employeeAddresses.length > 0 ? employeeAddresses : [{ id: 'none', formattedAddress: 'Aucune adresse disponible' }];

                    return (
                      <TableRow key={passenger.id}>
                        <TableCell className="p-2">
                          <div className="text-xs">
                            <div className="font-medium">{passenger.fullName}</div>
                            <div className="text-muted-foreground">{passenger.subsidiaryName || 'Non spécifié'}</div>
                          </div>
                        </TableCell>
                        <TableCell className="p-2">
                          <div className="text-xs space-y-1">
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{passenger.phone}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-24">{passenger.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="p-2">
                          <Select
                            value={passenger.departureAddressId}
                            onValueChange={(value) => updatePassengerAddress(passenger.id, 'departureAddressId', value)}
                          >
                            <SelectTrigger className="text-xs h-8">
                              <SelectValue placeholder="Sélectionner une adresse" />
                            </SelectTrigger>
                            <SelectContent>
                              {addressOptions.map((address) => (
                                <SelectItem key={address.id} value={address.id} className="text-xs">
                                  {address.formattedAddress}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="p-2">
                          <Select
                            value={passenger.arrivalAddressId}
                            onValueChange={(value) => updatePassengerAddress(passenger.id, 'arrivalAddressId', value)}
                          >
                            <SelectTrigger className="text-xs h-8">
                              <SelectValue placeholder="Sélectionner une adresse" />
                            </SelectTrigger>
                            <SelectContent>
                              {addressOptions.map((address) => (
                                <SelectItem key={address.id} value={address.id} className="text-xs">
                                  {address.formattedAddress}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        <div className="space-y-1">
          <Label className="text-sm">Note</Label>
          <Textarea
            placeholder="Ajouter une note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="text-sm h-16"
          />
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleShowConfirmation}
            className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
            disabled={selectedPassengers.length === 0}
          >
            Continuer vers la confirmation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}