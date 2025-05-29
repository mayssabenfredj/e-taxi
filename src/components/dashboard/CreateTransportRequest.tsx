
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import { useLanguage } from '@/contexts/LanguageContext';
import { AddressInput } from '../shared/AddressInput';
import { Calendar, ArrowLeft, Plus, Users, Clock, Upload, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Steps, Step } from '@/components/shared/Steps';

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

interface Passenger {
  id: string;
  name: string;
  phone: string;
  email?: string;
  departureAddress: Address | null;
  arrivalAddress: Address | null;
}

export function CreateTransportRequest() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  
  const [requestData, setRequestData] = useState({
    date: '',
    time: '',
    type: 'private' as 'private' | 'public',
    note: '',
    passengers: [] as Passenger[],
  });
  
  const [newPassenger, setNewPassenger] = useState<Passenger>({
    id: '',
    name: '',
    phone: '',
    email: '',
    departureAddress: null,
    arrivalAddress: null,
  });
  
  const savedAddresses = [
    {
      id: 'company-addr',
      label: 'Siège social',
      street: '10 Avenue des Champs-Élysées',
      city: 'Paris',
      postalCode: '75008',
      country: 'France',
    },
    {
      id: 'branch-addr',
      label: 'Agence Opéra',
      street: '2 Rue de la Paix',
      city: 'Paris',
      postalCode: '75002',
      country: 'France',
    },
  ];
  
  const employees = [
    {
      id: 'emp1',
      name: 'Jean Dupont',
      phone: '+33 6 12 34 56 78',
      email: 'jean.dupont@email.com',
      addresses: [
        {
          id: 'addr1',
          label: 'Domicile',
          street: '15 Rue du Louvre',
          city: 'Paris',
          postalCode: '75001',
          country: 'France',
        }
      ]
    },
    {
      id: 'emp2',
      name: 'Marie Martin',
      phone: '+33 6 98 76 54 32',
      email: 'marie.martin@email.com',
      addresses: [
        {
          id: 'addr2',
          label: 'Domicile',
          street: '25 Rue de Rivoli',
          city: 'Paris',
          postalCode: '75004',
          country: 'France',
        }
      ]
    }
  ];
  
  const handleAddPassenger = () => {
    if (!newPassenger.name || !newPassenger.phone || !newPassenger.departureAddress || !newPassenger.arrivalAddress) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    const passenger: Passenger = {
      ...newPassenger,
      id: `passenger-${Date.now()}`,
    };
    
    setRequestData(prev => ({
      ...prev,
      passengers: [...prev.passengers, passenger],
    }));
    
    setNewPassenger({
      id: '',
      name: '',
      phone: '',
      email: '',
      departureAddress: null,
      arrivalAddress: null,
    });
    
    toast.success('Passager ajouté avec succès');
  };
  
  const handleRemovePassenger = (id: string) => {
    setRequestData(prev => ({
      ...prev,
      passengers: prev.passengers.filter(p => p.id !== id),
    }));
    toast.success('Passager retiré');
  };
  
  const handleSelectEmployee = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      setNewPassenger({
        id: employee.id,
        name: employee.name,
        phone: employee.phone,
        email: employee.email,
        departureAddress: employee.addresses[0] || null,
        arrivalAddress: null,
      });
    }
  };
  
  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulation d'importation CSV
      toast.success('Les passagers ont été importés depuis le fichier CSV');
      
      // Ajout de passagers fictifs
      const newPassengers: Passenger[] = [
        {
          id: `csv-1`,
          name: 'Pierre Martin',
          phone: '+33 7 12 34 56 78',
          email: 'pierre.martin@email.com',
          departureAddress: savedAddresses[0],
          arrivalAddress: savedAddresses[1],
        },
        {
          id: `csv-2`,
          name: 'Sophie Dubois',
          phone: '+33 7 98 76 54 32',
          email: 'sophie.dubois@email.com',
          departureAddress: savedAddresses[0],
          arrivalAddress: savedAddresses[1],
        }
      ];
      
      setRequestData(prev => ({
        ...prev,
        passengers: [...prev.passengers, ...newPassengers],
      }));
    }
  };
  
  const handleCreateRequest = () => {
    if (!requestData.date || !requestData.time || requestData.passengers.length === 0) {
      toast.error('Veuillez remplir tous les champs obligatoires et ajouter au moins un passager');
      return;
    }
    
    // Ici vous feriez l'appel API pour créer la demande
    toast.success('Demande de transport créée avec succès!');
    navigate('/transport');
  };
  
  const steps = [
    { name: 'Informations générales' },
    { name: 'Ajout des passagers' },
    { name: 'Révision et confirmation' }
  ];
  
  const nextStep = () => {
    if (currentStep === 0 && (!requestData.date || !requestData.time)) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/transport')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        
        <h2 className="text-2xl font-bold">Nouvelle demande de transport</h2>
      </div>
      
      <Steps currentStep={currentStep} steps={steps} />
      
      {currentStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('departureDate')}</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={requestData.date}
                    onChange={(e) => setRequestData(prev => ({
                      ...prev,
                      date: e.target.value
                    }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t('departureTime')}</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="time"
                    value={requestData.time}
                    onChange={(e) => setRequestData(prev => ({
                      ...prev,
                      time: e.target.value
                    }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>{t('type')}</Label>
              <Select
                value={requestData.type}
                onValueChange={(value: 'private' | 'public') =>
                  setRequestData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">{t('private')}</SelectItem>
                  <SelectItem value="public">{t('public')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>{t('note')}</Label>
              <Textarea
                value={requestData.note}
                onChange={(e) => setRequestData(prev => ({
                  ...prev,
                  note: e.target.value
                }))}
                placeholder="Note facultative..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={nextStep}
                className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
              >
                Continuer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {currentStep === 1 && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Ajouter des passagers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Options d'ajout de passagers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gray-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Sélectionner un employé</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select onValueChange={handleSelectEmployee}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un employé..." />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name} - {emp.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Importer des passagers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          id="csv-upload"
                          accept=".csv,.xlsx"
                          onChange={handleCSVUpload}
                          className="hidden"
                        />
                        <Label htmlFor="csv-upload" className="w-full">
                          <Button variant="outline" className="w-full cursor-pointer" asChild>
                            <span>
                              <Upload className="mr-2 h-4 w-4" />
                              Importer CSV/Excel
                            </span>
                          </Button>
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Formulaire d'ajout de passager */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Informations du passager</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Nom complet</Label>
                        <Input
                          value={newPassenger.name}
                          onChange={(e) => setNewPassenger({...newPassenger, name: e.target.value})}
                          placeholder="Nom du passager"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Téléphone</Label>
                        <Input
                          value={newPassenger.phone}
                          onChange={(e) => setNewPassenger({...newPassenger, phone: e.target.value})}
                          placeholder="Numéro de téléphone"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          value={newPassenger.email}
                          onChange={(e) => setNewPassenger({...newPassenger, email: e.target.value})}
                          placeholder="Adresse email"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AddressInput
                        label="Adresse de départ"
                        value={newPassenger.departureAddress}
                        onChange={(address) => setNewPassenger({...newPassenger, departureAddress: address})}
                        savedAddresses={[...savedAddresses, ...(employees.flatMap(emp => emp.addresses))]}
                      />
                      
                      <AddressInput
                        label="Adresse d'arrivée"
                        value={newPassenger.arrivalAddress}
                        onChange={(address) => setNewPassenger({...newPassenger, arrivalAddress: address})}
                        savedAddresses={[...savedAddresses, ...(employees.flatMap(emp => emp.addresses))]}
                      />
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
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
          
          {/* Liste des passagers ajoutés */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Passagers ({requestData.passengers.length})</CardTitle>
              <Badge variant={requestData.passengers.length > 0 ? 'default' : 'outline'}>
                {requestData.passengers.length} passager{requestData.passengers.length !== 1 ? 's' : ''}
              </Badge>
            </CardHeader>
            <CardContent>
              {requestData.passengers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Passager</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Départ</TableHead>
                      <TableHead>Arrivée</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requestData.passengers.map((passenger) => (
                      <TableRow key={passenger.id}>
                        <TableCell className="font-medium">
                          {passenger.name}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div>{passenger.phone}</div>
                            {passenger.email && <div className="text-muted-foreground">{passenger.email}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {passenger.departureAddress && (
                            <div className="text-sm">
                              {passenger.departureAddress.label && (
                                <div className="font-medium">{passenger.departureAddress.label}</div>
                              )}
                              <div className="text-muted-foreground">{passenger.departureAddress.street}</div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {passenger.arrivalAddress && (
                            <div className="text-sm">
                              {passenger.arrivalAddress.label && (
                                <div className="font-medium">{passenger.arrivalAddress.label}</div>
                              )}
                              <div className="text-muted-foreground">{passenger.arrivalAddress.street}</div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePassenger(passenger.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>Aucun passager ajouté</p>
                  <p className="text-sm">Utilisez le formulaire ci-dessus pour ajouter des passagers</p>
                </div>
              )}
              
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={prevStep}>
                  Retour
                </Button>
                <Button
                  onClick={nextStep}
                  className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
                  disabled={requestData.passengers.length === 0}
                >
                  Continuer
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Révision et confirmation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Récapitulatif */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Informations générales</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="font-medium">Date de départ:</dt>
                      <dd>{requestData.date}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Heure de départ:</dt>
                      <dd>{requestData.time}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Type de transport:</dt>
                      <dd>
                        <Badge variant="outline">
                          {requestData.type === 'private' ? t('private') : t('public')}
                        </Badge>
                      </dd>
                    </div>
                    {requestData.note && (
                      <div>
                        <dt className="font-medium">Note:</dt>
                        <dd className="text-sm mt-1">{requestData.note}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>Passagers</span>
                    <Badge>
                      {requestData.passengers.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-48 overflow-y-auto">
                  {requestData.passengers.map((passenger, idx) => (
                    <div key={passenger.id} className={`py-2 ${idx > 0 ? 'border-t' : ''}`}>
                      <div className="font-medium">{passenger.name}</div>
                      <div className="text-sm text-muted-foreground">
                        <div>{passenger.phone}</div>
                        {passenger.email && <div>{passenger.email}</div>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            {/* Tableau détaillé des passagers */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Détail des trajets</CardTitle>
              </CardHeader>
              <CardContent>
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
                    {requestData.passengers.map((passenger, idx) => (
                      <TableRow key={passenger.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <div className="font-medium">{passenger.name}</div>
                          <div className="text-sm text-muted-foreground">{passenger.phone}</div>
                        </TableCell>
                        <TableCell>
                          {passenger.departureAddress && (
                            <div className="text-sm">
                              {passenger.departureAddress.label && (
                                <div className="font-medium">{passenger.departureAddress.label}</div>
                              )}
                              <div className="text-muted-foreground">{passenger.departureAddress.street}</div>
                              <div className="text-xs text-muted-foreground">
                                {passenger.departureAddress.postalCode} {passenger.departureAddress.city}
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {passenger.arrivalAddress && (
                            <div className="text-sm">
                              {passenger.arrivalAddress.label && (
                                <div className="font-medium">{passenger.arrivalAddress.label}</div>
                              )}
                              <div className="text-muted-foreground">{passenger.arrivalAddress.street}</div>
                              <div className="text-xs text-muted-foreground">
                                {passenger.arrivalAddress.postalCode} {passenger.arrivalAddress.city}
                              </div>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Retour
              </Button>
              <Button
                onClick={handleCreateRequest}
                className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Créer la demande
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
