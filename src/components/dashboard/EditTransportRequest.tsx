import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddressInput } from '../shared/AddressInput';
import { ArrowLeft, Save, UserPlus, Clock, Calendar, Home, Briefcase, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { demandeService } from '@/services/demande.service';
import {
  TransportRequestResponse,
  EmployeeTransportDto,
  TransportType,
  TransportStatus,
  TransportDirection,
  Employee,
} from '@/types/demande';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEmployees } from '@/hooks/useEmployees';

interface Passenger {
  id: string;
  employeeId: string;
  fullName: string;
  phone: string;
  email: string;
  departureAddress: any;
  arrivalAddress: any;
  direction: TransportDirection;
  note?: string;
}

export function EditTransportRequest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [request, setRequest] = useState<TransportRequestResponse | null>(null);
  const [direction, setDirection] = useState<TransportDirection>(TransportDirection.HOMETOOFFICE);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<TransportType>(TransportType.SCHEDULED);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [showAddPassengerForm, setShowAddPassengerForm] = useState(false);
  const [newPassenger, setNewPassenger] = useState<Partial<Passenger>>({
    fullName: '',
    phone: '',
    email: '',
    departureAddress: { formattedAddress: '' } as any,
    arrivalAddress: { formattedAddress: '' } as any,
    direction: TransportDirection.HOMETOOFFICE,
  });

  // Utiliser le hook useEmployees pour charger les employés
  const { employees: availableEmployees, loading: employeesLoading } = useEmployees({
    enterpriseId: request?.enterprise.id, // Utiliser l'enterpriseId de la demande
    roleFilter: 'all',
    subsidiaryFilter: 'all',
    statusFilter: 'ENABLED', // Ne charger que les employés actifs
    skip: 0,
    take: 100, // Charger jusqu'à 100 employés (ajustez selon besoin)
  });

  // Charger la demande
  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) {
        toast.error('ID de la demande non spécifié');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const requestData = await demandeService.getTransportRequestById(id);
        setRequest(requestData);
        setDirection(requestData.direction || TransportDirection.HOMETOOFFICE);
        setScheduledDate(
          requestData.scheduledDate ? format(parseISO(requestData.scheduledDate), 'yyyy-MM-dd') : ''
        );
        setScheduledTime(
          requestData.scheduledDate ? format(parseISO(requestData.scheduledDate), 'HH:mm') : ''
        );
        setNote(requestData.note || '');
        setType(requestData.type || TransportType.SCHEDULED);
        setPassengers(
          requestData.employeeTransports.map((et: EmployeeTransportDto) => ({
            id: et.id,
            employeeId: et.employeeId,
            fullName: et.employee?.fullName || 'Non spécifié',
            phone: et.employee?.phone || '',
            email: et.employee?.email || '',
            departureAddress: et.departure || { formattedAddress: 'Non spécifié' },
            arrivalAddress: et.arrival || { formattedAddress: 'Non spécifié' },
            direction: requestData.direction || TransportDirection.HOMETOOFFICE,
            note: et.note || '',
          }))
        );
      } catch (error: any) {
        toast.error(`Erreur lors du chargement de la demande : ${error.message || 'Erreur inconnue'}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  const handleSave = async () => {
    if (!scheduledDate || !scheduledTime || passengers.length === 0) {
      toast.error('Veuillez remplir tous les champs obligatoires (date, heure, au moins un passager)');
      return;
    }

    if (!request || !id) return;

    try {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
      const updatedRequest: Partial<TransportRequestResponse> = {
        ...request,
        type,
        direction,
        scheduledDate: scheduledDateTime,
        note,
        employeeTransports: passengers.map((p) => ({
          id: p.id.startsWith('new-') ? undefined : p.id,
          employeeId: p.employeeId,
          departure: p.departureAddress,
          arrival: p.arrivalAddress,
          note: p.note,
          startTime: scheduledDateTime,
          status: TransportStatus.PENDING,
        })),
      };

     /* const response = await demandeService.updateTransportRequest(id, updatedRequest);*/
      toast.success('Demande mise à jour avec succès');
      navigate(`/transport/${id}`);
    } catch (error: any) {
      toast.error(`Erreur lors de la mise à jour de la demande : ${error.message || 'Erreur inconnue'}`);
    }
  };

  const handleCancel = () => {
    navigate(`/transport/${id}`);
  };

  const updatePassengerAddress = (
    passengerId: string,
    field: 'departureAddress' | 'arrivalAddress',
    value: any
  ) => {
    setPassengers((prev) =>
      prev.map((passenger) =>
        passenger.id === passengerId ? { ...passenger, [field]: value } : passenger
      )
    );
  };

  const handleToggleTripDirection = () => {
    const newDirection =
      direction === TransportDirection.HOMETOOFFICE
        ? TransportDirection.OFFICETOHOME
        : TransportDirection.HOMETOOFFICE;
    setDirection(newDirection);

    // Mettre à jour les adresses des passagers
    setPassengers((prev) =>
      prev.map((passenger) => {
        const employee = availableEmployees.find((emp) => emp.id === passenger.employeeId);
        const homeAddress = employee?.addresses?.find(
          (addr) => addr.address.addressType === 'HOME'
        )?.address || passenger.departureAddress;
        const workAddress = employee?.addresses?.find(
          (addr) => addr.address.addressType === 'OFFICE'
        )?.address || passenger.arrivalAddress;

        return {
          ...passenger,
          departureAddress: newDirection === TransportDirection.HOMETOOFFICE ? homeAddress : workAddress,
          arrivalAddress: newDirection === TransportDirection.HOMETOOFFICE ? workAddress : homeAddress,
          direction: newDirection,
        };
      })
    );
  };

  const handleSelectEmployee = (employeeId: string) => {
    const employee = availableEmployees.find((emp) => emp.id === employeeId);
    if (!employee) return;

    const homeAddress = employee.addresses?.find(
      (addr) => addr.address.addressType === 'HOME'
    )?.address;
    const workAddress = employee.addresses?.find(
      (addr) => addr.address.addressType === 'OFFICE'
    )?.address;

    const departureAddress =
      direction === TransportDirection.HOMETOOFFICE ? homeAddress : workAddress;
    const arrivalAddress =
      direction === TransportDirection.HOMETOOFFICE ? workAddress : homeAddress;

    setNewPassenger({
      employeeId,
      fullName: employee.fullName,
      phone: employee.phone,
      email: employee.email,
      departureAddress: departureAddress || { formattedAddress: '' },
      arrivalAddress: arrivalAddress || { formattedAddress: '' },
      direction,
    });
  };

  const handleAddPassenger = () => {
    if (!newPassenger.fullName || !newPassenger.phone || !newPassenger.employeeId) {
      toast.error('Veuillez remplir le nom, le téléphone et sélectionner un employé');
      return;
    }

    if (!newPassenger.departureAddress?.formattedAddress || !newPassenger.arrivalAddress?.formattedAddress) {
      toast.error('Veuillez spécifier les adresses de départ et d’arrivée');
      return;
    }

    const passenger: Passenger = {
      id: `new-${Date.now()}`,
      employeeId: newPassenger.employeeId!,
      fullName: newPassenger.fullName!,
      phone: newPassenger.phone!,
      email: newPassenger.email || '',
      departureAddress: newPassenger.departureAddress!,
      arrivalAddress: newPassenger.arrivalAddress!,
      direction: newPassenger.direction || TransportDirection.HOMETOOFFICE,
      note: newPassenger.note,
    };

    setPassengers((prev) => [...prev, passenger]);
    setNewPassenger({
      fullName: '',
      phone: '',
      email: '',
      departureAddress: { formattedAddress: '' } as any,
      arrivalAddress: { formattedAddress: '' } as any,
      direction: TransportDirection.HOMETOOFFICE,
    });
    setShowAddPassengerForm(false);
    toast.success('Passager ajouté avec succès');
  };

  const handleRemovePassenger = (passengerId: string) => {
    setPassengers((prev) => prev.filter((p) => p.id !== passengerId));
    toast.success('Passager supprimé');
  };

  if (isLoading || employeesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-etaxi-yellow"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center p-8">
        <p>Demande non trouvée</p>
        <Button variant="outline" onClick={() => navigate('/transport')} className="mt-4">
          Retour aux demandes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate(`/transport/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h2 className="text-xl font-bold">Modifier la demande - {request.reference}</h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
          >
            <Save className="mr-2 h-4 w-4" />
            Enregistrer
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Informations générales */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{direction === TransportDirection.HOMETOOFFICE ? "Heure d'arrivée" : "Heure de départ"}</Label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Type de transport</Label>
              <Select
                value={type}
                onValueChange={(value: TransportType) => setType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TransportType.SCHEDULED}>Programmé</SelectItem>
                  <SelectItem value={TransportType.IMMEDIATE}>Immédiat</SelectItem>
                  <SelectItem value={TransportType.RECURRING}>Récurrent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between space-x-4 p-3 border rounded-md">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Direction du trajet</Label>
                <div className="text-sm text-muted-foreground">
                  {direction === TransportDirection.HOMETOOFFICE
                    ? "Domicile → Travail (heure d'arrivée)"
                    : "Travail → Domicile (heure de départ)"}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Home
                  className={`h-4 w-4 ${
                    direction === TransportDirection.HOMETOOFFICE
                      ? 'text-etaxi-yellow'
                      : 'text-muted-foreground'
                  }`}
                />
                <Switch
                  checked={direction === TransportDirection.OFFICETOHOME}
                  onCheckedChange={handleToggleTripDirection}
                />
                <Briefcase
                  className={`h-4 w-4 ${
                    direction === TransportDirection.OFFICETOHOME
                      ? 'text-etaxi-yellow'
                      : 'text-muted-foreground'
                  }`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ajouter une note..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
        {/* Passagers */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Passagers ({passengers.length})</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddPassengerForm(!showAddPassengerForm)}
              className="text-xs"
            >
              {showAddPassengerForm ? (
                'Annuler'
              ) : (
                <>
                  <UserPlus className="h-3 w-3 mr-1" /> Ajouter
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {showAddPassengerForm && (
              <Card className="border-dashed mb-4">
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Sélectionner un employé</Label>
                      <Select onValueChange={handleSelectEmployee}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un employé..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableEmployees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.fullName} - {emp.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Nom complet</Label>
                        <Input
                          value={newPassenger.fullName}
                          onChange={(e) =>
                            setNewPassenger({ ...newPassenger, fullName: e.target.value })
                          }
                          placeholder="Nom du passager"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Téléphone</Label>
                        <Input
                          value={newPassenger.phone}
                          onChange={(e) =>
                            setNewPassenger({ ...newPassenger, phone: e.target.value })
                          }
                          placeholder="Numéro de téléphone"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          value={newPassenger.email}
                          onChange={(e) =>
                            setNewPassenger({ ...newPassenger, email: e.target.value })
                          }
                          placeholder="Adresse email"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Adresse de départ</Label>
                        <AddressInput
                          value={newPassenger.departureAddress?.formattedAddress || ''}
                          onChange={(address) =>
                            setNewPassenger({
                              ...newPassenger,
                              departureAddress: address as any,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Adresse d'arrivée</Label>
                        <AddressInput
                          value={newPassenger.arrivalAddress?.formattedAddress || ''}
                          onChange={(address) =>
                            setNewPassenger({
                              ...newPassenger,
                              arrivalAddress: address as any,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={handleAddPassenger}
                        className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter le passager
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Passager</TableHead>
                  <TableHead className="text-xs">Départ</TableHead>
                  <TableHead className="text-xs">Arrivée</TableHead>
                  <TableHead className="text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {passengers.map((passenger) => (
                  <TableRow key={passenger.id}>
                    <TableCell className="p-2">
                      <div className="text-xs">
                        <div className="font-medium">{passenger.fullName}</div>
                        <div className="text-muted-foreground">{passenger.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="p-2">
                      <AddressInput
                        value={passenger.departureAddress.formattedAddress}
                        onChange={(address) =>
                          updatePassengerAddress(passenger.id, 'departureAddress', address as any)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <AddressInput
                        value={passenger.arrivalAddress.formattedAddress}
                        onChange={(address) =>
                          updatePassengerAddress(passenger.id, 'arrivalAddress', address as any)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePassenger(passenger.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}