import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shareds/components/ui/card';
import { Input } from '@/shareds/components/ui/input';
import { Label } from '@/shareds/components/ui/label';
import { Button } from '@/shareds/components/ui/button';
import { Textarea } from '@/shareds/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shareds/components/ui/select';
import { Calendar } from '@/shareds/components/ui/calendar';
import { Checkbox } from '@/shareds/components/ui/checkbox';
import { Switch } from '@/shareds/components/ui/switch';
import { ScrollArea } from '@/shareds/components/ui/scroll-area';
import { Home, Briefcase, Phone, Mail, Building2 } from 'lucide-react';
import { format, addHours, isToday, startOfDay, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { RecurringDateTime, SelectedPassenger } from '@/features/transports/types/demande';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shareds/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shareds/components/ui/dialog';
import { AddressInput } from '@/shareds/components/addressComponent/AddressInput';

interface TransportConfigProps {
  transportType: string;
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
  updatePassengerAddress: (passengerId: string, field: 'departureAddressId' | 'arrivalAddressId' | 'customAddresses', value: string | any[]) => void;
  showEmployeeList: boolean;
  setShowEmployeeList: (show: boolean) => void;
  handleShowConfirmation: () => void;
  subsidiaries: any[];
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
  subsidiaries,
}: TransportConfigProps) {
  // Set default transport type to 'private' if not set
  useEffect(() => {
    if (!transportType) {
      setTransportType('private');
    }
  }, [transportType, setTransportType]);

  // Get next full hour (e.g., 11:45 PM -> 12:00 AM)
  const getNextHour = () => {
    const now = new Date();
    const nextHour = setMinutes(setHours(now, now.getHours() + 1), 0);
    const formattedTime = format(nextHour, 'HH:mm');
    return formattedTime;
  };

  // Set default time to next hour if not set
  useEffect(() => {
    if (!scheduledTime || scheduledTime === '09:00') {
      setScheduledTime(getNextHour());
    }
  }, [scheduledTime, setScheduledTime]);

  // Format current date as YYYY-MM-DD for min attribute
  const today = format(new Date(), 'yyyy-MM-dd');

  // Get minimum time for a given date (next hour for today, 00:00 for future dates)
  const getMinTime = (date: Date) => {
    if (isToday(date)) {
      return getNextHour();
    }
    return '00:00';
  };

  const [customAddressDialog, setCustomAddressDialog] = useState<{ open: boolean; passengerId: string; field: 'departureAddressId' | 'arrivalAddressId' } | null>(null);

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
              min={today}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm">{isHomeToWorkTrip ? "Heure d'arrivée" : "Heure de départ"}</Label>
            <Input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="text-sm"
              min={getMinTime(scheduledDate)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm">Type</Label>
            <Select value={transportType} onValueChange={setTransportType}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
               <SelectItem  value="private">Privé</SelectItem>
                <SelectItem value="public">Public</SelectItem>
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
              <div className="flex flex-col">
                <Calendar
                  mode="multiple"
                  selected={recurringDates.map((rd) => new Date(rd.date))}
                  onSelect={handleRecurringDateChange}
                  className="rounded-md border text-sm"
                  disabled={(date) => date < new Date()}
                />
              </div>
              {recurringDates.length > 0 && (
                <div className="flex flex-col">
                  <Label className="text-sm">Heures par date</Label>
                  <ScrollArea className="h-full max-h-[290px] mt-2">
                    {recurringDates.map((rd, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <span className="text-xs w-20">{format(rd.date, 'dd/MM', { locale: fr })}</span>
                        <Input
                          type="time"
                          value={rd.time}
                          onChange={(e) => updateRecurringTime(index, e.target.value)}
                          className="text-xs h-8"
                          min={isToday(rd.date) ? getNextHour() : '00:00'}
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
                      id: addr.address.id || addr.address.street || 'none',
                      formattedAddress: addr.address.formattedAddress || addr.address.street || 'Adresse non spécifiée',
                      type : addr.address.addressType,
                    })) || [];

                    // Ajout de toutes les adresses de toutes les filiales
                    let subsidiariesAddressOptions = [];
                    if (subsidiaries && Array.isArray(subsidiaries)) {
                      subsidiariesAddressOptions = subsidiaries
                        .filter(sub => sub.address && sub.address.id)
                        .map(sub => {
                          const alreadyPresent = employeeAddresses.some(addr => addr.id === sub.address.id);
                          if (!alreadyPresent) {
                            return {
                              id: sub.address.id,
                              formattedAddress: `HQ: ${sub.name} – ${sub.address.formattedAddress || sub.address.street || 'Non spécifiée'}`,
                              type: 'SUBSIDIARY',
                            };
                          }
                          return null;
                        })
                        .filter(Boolean);
                    }
                    const customAddresses = passenger.customAddresses || [];
                    const customAddressOptions = customAddresses.map((address: any) => ({
                      id: address.label || address.formattedAddress || 'custom',
                      formattedAddress: address.label || address.formattedAddress || 'Adresse personnalisée',
                      type: 'CUSTOM',
                      addressObj: address,
                    }));
                    const addressOptions = [
                      ...employeeAddresses,
                      ...subsidiariesAddressOptions,
                      ...customAddressOptions,
                    ];
                    if (addressOptions.length === 0) {
                      addressOptions.push({ id: 'none', formattedAddress: 'Aucune adresse disponible' });
                    }

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
                          <div>
                            <Select
                              value={typeof passenger.departureAddressId === 'string' ? passenger.departureAddressId : (passenger.departureAddressId && typeof passenger.departureAddressId === 'object' && 'label' in passenger.departureAddressId ? (passenger.departureAddressId as any).label : 'custom')}
                              onValueChange={(value) => {
                                if (value === 'custom') {
                                  setCustomAddressDialog({ open: true, passengerId: passenger.id, field: 'departureAddressId' });
                                } else {
                                  // Si l'adresse sélectionnée est une adresse personnalisée, retrouver l'objet
                                  const custom = customAddressOptions.find(opt => opt.id === value);
                                  if (custom) {
                                    updatePassengerAddress(passenger.id, 'departureAddressId', custom.addressObj);
                                  } else {
                                    updatePassengerAddress(passenger.id, 'departureAddressId', value);
                                  }
                                }
                              }}
                            >
                              <SelectTrigger className="text-xs h-8">
                                <SelectValue placeholder="Sélectionner une adresse" />
                              </SelectTrigger>
                              <SelectContent>
                                {addressOptions.map((address) => (
                                  <SelectItem key={address.id} value={address.id} className="text-xs">
                                    <span className="flex items-center">
                                      {address.type === 'HOME' && <Home className="h-3 w-3 mr-1 text-etaxi-yellow" />}
                                      {address.type === 'OFFICE' && <Briefcase className="h-3 w-3 mr-1 text-blue-500" />}
                                      {address.type === 'SUBSIDIARY' && <Building2 className="h-3 w-3 mr-1 text-green-600" />}
                                      {address.type === 'CUSTOM' && <span className="h-3 w-3 mr-1 text-purple-600">🏠</span>}
                                      {address.formattedAddress}
                                    </span>
                                  </SelectItem>
                                ))}
                                <SelectItem value="custom" className="text-xs text-blue-600">+ Adresse personnalisée...</SelectItem>
                              </SelectContent>
                            </Select>
                            {/* Dialog pour adresse personnalisée */}
                            {customAddressDialog?.open && customAddressDialog.passengerId === passenger.id && customAddressDialog.field === 'departureAddressId' && (
                              <Dialog open={true} onOpenChange={(open) => {
                                if (!open) setCustomAddressDialog(null);
                              }}>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Nouvelle adresse de départ</DialogTitle>
                                  </DialogHeader>
                                  <AddressInput
                                    label="Adresse personnalisée"
                                    value={null}
                                    onChange={(address) => {
                                      // Ajout à customAddresses du passager
                                      const updatedCustomAddresses = [...(passenger.customAddresses || []), address];
                                      updatePassengerAddress(passenger.id, 'customAddresses', updatedCustomAddresses);
                                      updatePassengerAddress(passenger.id, 'departureAddressId', address);
                                      setCustomAddressDialog(null);
                                    }}
                                    showSavedAddresses={false}
                                  />
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="p-2">
                          <div>
                            <Select
                              value={typeof passenger.arrivalAddressId === 'string' ? passenger.arrivalAddressId : (passenger.arrivalAddressId && typeof passenger.arrivalAddressId === 'object' && 'label' in passenger.arrivalAddressId ? (passenger.arrivalAddressId as any).label : 'custom')}
                              onValueChange={(value) => {
                                if (value === 'custom') {
                                  setCustomAddressDialog({ open: true, passengerId: passenger.id, field: 'arrivalAddressId' });
                                } else {
                                  // Si l'adresse sélectionnée est une adresse personnalisée, retrouver l'objet
                                  const custom = customAddressOptions.find(opt => opt.id === value);
                                  if (custom) {
                                    updatePassengerAddress(passenger.id, 'arrivalAddressId', custom.addressObj);
                                  } else {
                                    updatePassengerAddress(passenger.id, 'arrivalAddressId', value);
                                  }
                                }
                              }}
                            >
                              <SelectTrigger className="text-xs h-8">
                                <SelectValue placeholder="Sélectionner une adresse" />
                              </SelectTrigger>
                              <SelectContent>
                                {addressOptions.map((address) => (
                                  <SelectItem key={address.id} value={address.id} className="text-xs">
                                    <span className="flex items-center">
                                      {address.type === 'HOME' && <Home className="h-3 w-3 mr-1 text-etaxi-yellow" />}
                                      {address.type === 'OFFICE' && <Briefcase className="h-3 w-3 mr-1 text-blue-500" />}
                                      {address.type === 'SUBSIDIARY' && <Building2 className="h-3 w-3 mr-1 text-green-600" />}
                                      {address.type === 'CUSTOM' && <span className="h-3 w-3 mr-1 text-purple-600">🏠</span>}
                                      {address.formattedAddress}
                                    </span>
                                  </SelectItem>
                                ))}
                                <SelectItem value="custom" className="text-xs text-blue-600">+ Adresse personnalisée...</SelectItem>
                              </SelectContent>
                            </Select>
                            {/* Dialog pour adresse personnalisée arrivée */}
                            {customAddressDialog?.open && customAddressDialog.passengerId === passenger.id && customAddressDialog.field === 'arrivalAddressId' && (
                              <Dialog open={true} onOpenChange={(open) => {
                                if (!open) setCustomAddressDialog(null);
                              }}>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Nouvelle adresse d'arrivée</DialogTitle>
                                  </DialogHeader>
                                  <AddressInput
                                    label="Adresse personnalisée"
                                    value={null}
                                    onChange={(address) => {
                                      // Ajout à customAddresses du passager
                                      const updatedCustomAddresses = [...(passenger.customAddresses || []), address];
                                      updatePassengerAddress(passenger.id, 'customAddresses', updatedCustomAddresses);
                                      updatePassengerAddress(passenger.id, 'arrivalAddressId', address);
                                      setCustomAddressDialog(null);
                                    }}
                                    showSavedAddresses={false}
                                  />
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
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