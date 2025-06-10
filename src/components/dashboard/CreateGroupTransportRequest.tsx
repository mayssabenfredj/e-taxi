import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Save, User, Clock, Calendar as CalendarIcon, Search, MapPin, Phone, Mail, Upload, Home, Briefcase, Route, Euro, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddEmployeeFromCSV } from './AddEmployeeFromCSV';
import { Steps } from '@/components/shared/Steps';

interface Employee {
  id: string;
  name: string;
  department: string;
  subsidiary: string;
  email: string;
  phone: string;
  homeAddress?: string;
  workAddress?: string;
}

interface SelectedPassenger extends Employee {
  departureAddress: string;
  arrivalAddress: string;
  isHomeToWork: boolean;
}

interface RecurringDateTime {
  date: Date;
  time: string;
}

interface RouteEstimation {
  distance: string;
  duration: string;
  price: number;
}

const commonAddresses = [
  'Aéroport Charles de Gaulle, 95700 Roissy',
  'Gare de Lyon, 75012 Paris',
  'La Défense, 92800 Puteaux',
  'Opéra, 75009 Paris',
  'Châtelet-Les Halles, 75001 Paris',
  'Siège social - 15 Rue du Louvre, 75001 Paris',
  'Centre de conférences - 101 Avenue des Champs-Élysées, 75008 Paris'
];

export function CreateGroupTransportRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedPassengers, setSelectedPassengers] = useState<SelectedPassenger[]>([]);
  const [transportType, setTransportType] = useState<'public' | 'private'>('public');
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDates, setRecurringDates] = useState<RecurringDateTime[]>([]);
  const [note, setNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmployeeList, setShowEmployeeList] = useState(true);
  const [isHomeToWorkTrip, setIsHomeToWorkTrip] = useState(true);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [subsidiaryFilter, setSubsidiaryFilter] = useState<string>('all');
  const [routeEstimations, setRouteEstimations] = useState<RouteEstimation[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const employees: Employee[] = [
    {
      id: '1',
      name: 'Jean Dupont',
      department: 'Marketing',
      subsidiary: 'Paris',
      email: 'jean.dupont@example.com',
      phone: '+33 6 12 34 56 78',
      homeAddress: '15 Rue du Louvre, 75001 Paris',
      workAddress: 'Siège social - 15 Rue du Louvre, 75001 Paris'
    },
    {
      id: '2',
      name: 'Marie Martin',
      department: 'Ventes',
      subsidiary: 'Lyon',
      email: 'marie.martin@example.com',
      phone: '+33 6 98 76 54 32',
      homeAddress: '25 Rue de Rivoli, 75004 Paris',
      workAddress: 'Siège social - 15 Rue du Louvre, 75001 Paris'
    },
    {
      id: '3',
      name: 'Pierre Durand',
      department: 'IT',
      subsidiary: 'Paris',
      email: 'pierre.durand@example.com',
      phone: '+33 6 55 55 55 55',
      homeAddress: '8 Avenue Montaigne, 75008 Paris',
      workAddress: 'La Défense, 92800 Puteaux'
    },
    {
      id: '4',
      name: 'Sophie Leclerc',
      department: 'RH',
      subsidiary: 'Marseille',
      email: 'sophie.leclerc@example.com',
      phone: '+33 6 11 22 33 44',
      homeAddress: '12 Boulevard Saint-Germain, 75005 Paris',
      workAddress: 'Opéra, 75009 Paris'
    },
    {
      id: '5',
      name: 'Luc Bernard',
      department: 'Finance',
      subsidiary: 'Paris',
      email: 'luc.bernard@example.com',
      phone: '+33 6 77 88 99 00',
      homeAddress: '30 Rue Saint-Honoré, 75001 Paris',
      workAddress: 'Siège social - 15 Rue du Louvre, 75001 Paris'
    },
    {
      id: '6',
      name: 'Isabelle Garcia',
      department: 'Marketing',
      subsidiary: 'Lyon',
      email: 'isabelle.garcia@example.com',
      phone: '+33 6 44 33 22 11',
      homeAddress: '5 Avenue Montaigne, 75008 Paris',
      workAddress: 'Centre de conférences - 101 Avenue des Champs-Élysées, 75008 Paris'
    },
  ];

  // Auto-save draft functionality
  const saveDraftData = () => {
    const draftData = {
      selectedEmployees,
      selectedPassengers,
      transportType,
      scheduledDate,
      scheduledTime,
      isRecurring,
      recurringDates,
      note,
      isHomeToWorkTrip,
      lastModified: new Date().toISOString()
    };
    
    localStorage.setItem('groupTransportDraft', JSON.stringify(draftData));
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (selectedEmployees.length > 0 || note.trim()) {
        saveDraftData();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [selectedEmployees, selectedPassengers, transportType, scheduledDate, scheduledTime, isRecurring, recurringDates, note, isHomeToWorkTrip]);

  // Save draft when leaving the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (selectedEmployees.length > 0 || note.trim()) {
        saveDraftData();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [selectedEmployees, note, isHomeToWorkTrip]);

  // Load draft data if available
  useEffect(() => {
    if (location.state?.draftId || location.state?.draftData) {
      const draftData = location.state.draftData;
      if (draftData) {
        setNote(draftData.note || '');
        if (draftData.scheduledDate) {
          setScheduledDate(new Date(draftData.scheduledDate));
        }
        setIsHomeToWorkTrip(draftData.isHomeToWorkTrip !== undefined ? draftData.isHomeToWorkTrip : true);
        toast.info('Brouillon chargé');
      }
    } else {
      const savedDraft = localStorage.getItem('groupTransportDraft');
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft);
          setSelectedEmployees(draftData.selectedEmployees || []);
          setSelectedPassengers(draftData.selectedPassengers || []);
          setTransportType(draftData.transportType || 'public');
          setScheduledDate(draftData.scheduledDate ? new Date(draftData.scheduledDate) : new Date());
          setScheduledTime(draftData.scheduledTime || '09:00');
          setIsRecurring(draftData.isRecurring || false);
          setRecurringDates(draftData.recurringDates || []);
          setNote(draftData.note || '');
          setIsHomeToWorkTrip(draftData.isHomeToWorkTrip !== undefined ? draftData.isHomeToWorkTrip : true);
          toast.info('Brouillon automatiquement restauré');
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
    }
  }, [location.state]);

  const subsidiaries = Array.from(new Set(employees.map(emp => emp.subsidiary)));

  const filteredEmployees = employees.filter(employee =>
    (searchTerm === '' || 
     employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
     employee.subsidiary.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (subsidiaryFilter === 'all' || employee.subsidiary === subsidiaryFilter)
  );

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
      setSelectedPassengers(prev => prev.filter(p => p.id !== employeeId));
    } else {
      setSelectedEmployees(prev => [...prev, employeeId]);
      
      // Déterminer les adresses de départ et d'arrivée en fonction du type de trajet
      const departureAddress = isHomeToWorkTrip 
        ? (employee.homeAddress || '') 
        : (employee.workAddress || '');
      const arrivalAddress = isHomeToWorkTrip 
        ? (employee.workAddress || '') 
        : (employee.homeAddress || '');
      
      setSelectedPassengers(prev => [...prev, {
        ...employee,
        departureAddress,
        arrivalAddress,
        isHomeToWork: isHomeToWorkTrip
      }]);
    }
  };

  const updatePassengerAddress = (passengerId: string, field: 'departureAddress' | 'arrivalAddress', value: string) => {
    setSelectedPassengers(prev => 
      prev.map(passenger => 
        passenger.id === passengerId 
          ? { ...passenger, [field]: value }
          : passenger
      )
    );
  };

  const handleRecurringDateChange = (dates: Date[] | undefined) => {
    if (dates) {
      const newRecurringDates = dates.map(date => ({
        date,
        time: scheduledTime
      }));
      setRecurringDates(newRecurringDates);
    } else {
      setRecurringDates([]);
    }
  };

  const updateRecurringTime = (index: number, time: string) => {
    setRecurringDates(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, time } : item
      )
    );
  };

  const handleSaveDraft = () => {
    saveDraftData();
    toast.success('Brouillon sauvegardé');
    navigate('/transport/drafts');
  };

  const calculateRoutes = () => {
    setIsCalculating(true);
    
    // Simulation de calcul d'itinéraire
    setTimeout(() => {
      const estimations = selectedPassengers.map(passenger => {
        // Génération de données fictives pour la démonstration
        const distance = Math.floor(Math.random() * 30) + 5; // 5-35 km
        const durationMinutes = Math.floor(distance * 2) + 10; // ~2 min/km + 10 min
        const basePrice = 2.5; // Prix de base
        const pricePerKm = 1.8; // Prix par km
        const price = basePrice + (distance * pricePerKm);
        
        return {
          distance: `${distance} km`,
          duration: `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}min`,
          price: parseFloat(price.toFixed(2))
        };
      });
      
      setRouteEstimations(estimations);
      setTotalPrice(parseFloat(estimations.reduce((sum, est) => sum + est.price, 0).toFixed(2)));
      setIsCalculating(false);
    }, 1500);
  };

  const handleSubmit = () => {
    if (selectedEmployees.length === 0) {
      toast.error('Veuillez sélectionner au moins un employé');
      return;
    }

    localStorage.removeItem('groupTransportDraft');
    toast.success('Demande de transport de groupe créée avec succès');
    navigate('/transport/group');
  };

  const handleToggleTripDirection = () => {
    setIsHomeToWorkTrip(!isHomeToWorkTrip);
    
    // Mettre à jour les adresses de tous les passagers sélectionnés
    setSelectedPassengers(prev => 
      prev.map(passenger => {
        // Inverser les adresses de départ et d'arrivée
        const employee = employees.find(emp => emp.id === passenger.id);
        if (!employee) return passenger;
        
        const departureAddress = !isHomeToWorkTrip 
          ? (employee.homeAddress || '') 
          : (employee.workAddress || '');
        const arrivalAddress = !isHomeToWorkTrip 
          ? (employee.workAddress || '') 
          : (employee.homeAddress || '');
        
        return {
          ...passenger,
          departureAddress,
          arrivalAddress,
          isHomeToWork: !isHomeToWorkTrip
        };
      })
    );
  };

  const handleEmployeesImported = (importedEmployees: any[]) => {
    // Convertir les employés importés en passagers
    const newPassengers = importedEmployees.map(emp => {
      const departureAddress = isHomeToWorkTrip 
        ? (emp.homeAddress || '') 
        : (emp.workAddress || '');
      const arrivalAddress = isHomeToWorkTrip 
        ? (emp.workAddress || '') 
        : (emp.homeAddress || '');
      
      return {
        id: emp.id,
        name: emp.name,
        department: emp.department || 'Non spécifié',
        subsidiary: emp.subsidiary || 'Non spécifié',
        email: emp.email,
        phone: emp.phone,
        homeAddress: emp.homeAddress,
        workAddress: emp.workAddress,
        departureAddress,
        arrivalAddress,
        isHomeToWork: isHomeToWorkTrip
      };
    });
    
    // Ajouter les nouveaux passagers
    setSelectedEmployees(prev => [...prev, ...newPassengers.map(p => p.id)]);
    setSelectedPassengers(prev => [...prev, ...newPassengers]);
    
    toast.success(`${newPassengers.length} employé(s) ajouté(s) à la demande`);
  };

  const handleShowConfirmation = () => {
    if (selectedPassengers.length === 0) {
      toast.error('Veuillez sélectionner au moins un passager');
      return;
    }
    
    // Calculer les itinéraires avant d'afficher la confirmation
    setIsCalculating(true);
    setShowConfirmation(true);
    calculateRoutes();
  };

  const steps = [
    { name: 'Configuration' },
    { name: 'Confirmation' }
  ];

  return (
    <div className="space-y-4 max-w-7xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/transport/group')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h2 className="text-2xl font-bold">Nouvelle demande de transport de groupe</h2>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
          >
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder en brouillon
          </Button>
        </div>
      </div>

      <Steps currentStep={showConfirmation ? 1 : 0} steps={steps} />

      {!showConfirmation ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Employee Selection */}
          {showEmployeeList && (
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Sélection des employés</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCsvImportOpen(true)}
                    className="text-xs h-7"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Importer CSV
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  
                  <Select value={subsidiaryFilter} onValueChange={setSubsidiaryFilter}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Filtrer par filiale" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les filiales</SelectItem>
                      {subsidiaries.map(subsidiary => (
                        <SelectItem key={subsidiary} value={subsidiary}>
                          {subsidiary}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {filteredEmployees.map(employee => (
                      <div
                        key={employee.id}
                        className={`p-2 border rounded cursor-pointer text-sm ${
                          selectedEmployees.includes(employee.id) 
                            ? 'bg-etaxi-yellow/20 border-etaxi-yellow' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => handleEmployeeSelect(employee.id)}
                      >
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-xs text-muted-foreground">{employee.department} - {employee.subsidiary}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {selectedEmployees.length > 0 && (
                  <div className="text-sm">
                    <Badge variant="secondary">{selectedEmployees.length} sélectionné(s)</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => setShowEmployeeList(false)}
                    >
                      Masquer la liste
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Configuration and Passengers */}
          <Card className={showEmployeeList ? "lg:col-span-2" : "lg:col-span-3"}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Configuration et passagers</CardTitle>
                {!showEmployeeList && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEmployeeList(true)}
                  >
                    Afficher la liste des employés
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Transport Configuration */}
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
                  <Label className="text-sm">
                    {isHomeToWorkTrip ? "Heure d'arrivée" : "Heure de départ"}
                  </Label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-sm">Type</Label>
                  <Select
                    value={transportType}
                    onValueChange={(value: 'public' | 'private') => setTransportType(value)}
                  >
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
                  <Checkbox 
                    id="recurring" 
                    checked={isRecurring} 
                    onCheckedChange={(checked) => setIsRecurring(checked === true)}
                  />
                  <Label htmlFor="recurring" className="text-sm">Récurrent</Label>
                </div>
              </div>

              {/* Direction de trajet */}
              <div className="flex items-center justify-between space-x-4 p-3 border rounded-md">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Direction du trajet</Label>
                  <div className="text-sm text-muted-foreground">
                    {isHomeToWorkTrip 
                      ? "Domicile → Travail (heure d'arrivée)" 
                      : "Travail → Domicile (heure de départ)"}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Home className={`h-4 w-4 ${isHomeToWorkTrip ? 'text-etaxi-yellow' : 'text-muted-foreground'}`} />
                  <Switch 
                    checked={!isHomeToWorkTrip}
                    onCheckedChange={() => handleToggleTripDirection()}
                  />
                  <Briefcase className={`h-4 w-4 ${!isHomeToWorkTrip ? 'text-etaxi-yellow' : 'text-muted-foreground'}`} />
                </div>
              </div>

              {/* Recurring Configuration */}
              {isRecurring && (
                <div className="space-y-3 p-3 border rounded">
                  <Label className="text-sm font-medium">Dates de récurrence</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Calendar
                      mode="multiple"
                      selected={recurringDates.map(rd => rd.date)}
                      onSelect={handleRecurringDateChange}
                      className="rounded-md border text-sm"
                    />
                    
                    {recurringDates.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm">Heures par date</Label>
                        <ScrollArea className="h-32">
                          {recurringDates.map((rd, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                              <span className="text-xs w-20">
                                {format(rd.date, 'dd/MM', { locale: fr })}
                              </span>
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

              {/* Passengers Table */}
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
                        {selectedPassengers.map((passenger) => (
                          <TableRow key={passenger.id}>
                            <TableCell className="p-2">
                              <div className="text-xs">
                                <div className="font-medium">{passenger.name}</div>
                                <div className="text-muted-foreground">{passenger.department}</div>
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
                                value={passenger.departureAddress}
                                onValueChange={(value) => updatePassengerAddress(passenger.id, 'departureAddress', value)}
                              >
                                <SelectTrigger className="text-xs h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {passenger.isHomeToWork && passenger.homeAddress && (
                                    <SelectItem value={passenger.homeAddress} className="text-xs">
                                      <div className="flex items-center">
                                        <Home className="h-3 w-3 mr-1 text-etaxi-yellow" />
                                        {passenger.homeAddress}
                                      </div>
                                    </SelectItem>
                                  )}
                                  {!passenger.isHomeToWork && passenger.workAddress && (
                                    <SelectItem value={passenger.workAddress} className="text-xs">
                                      <div className="flex items-center">
                                        <Briefcase className="h-3 w-3 mr-1 text-etaxi-yellow" />
                                        {passenger.workAddress}
                                      </div>
                                    </SelectItem>
                                  )}
                                  {commonAddresses.map((address) => (
                                    <SelectItem key={address} value={address} className="text-xs">
                                      {address}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="p-2">
                              <Select
                                value={passenger.arrivalAddress}
                                onValueChange={(value) => updatePassengerAddress(passenger.id, 'arrivalAddress', value)}
                              >
                                <SelectTrigger className="text-xs h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {!passenger.isHomeToWork && passenger.homeAddress && (
                                    <SelectItem value={passenger.homeAddress} className="text-xs">
                                      <div className="flex items-center">
                                        <Home className="h-3 w-3 mr-1 text-etaxi-yellow" />
                                        {passenger.homeAddress}
                                      </div>
                                    </SelectItem>
                                  )}
                                  {passenger.isHomeToWork && passenger.workAddress && (
                                    <SelectItem value={passenger.workAddress} className="text-xs">
                                      <div className="flex items-center">
                                        <Briefcase className="h-3 w-3 mr-1 text-etaxi-yellow" />
                                        {passenger.workAddress}
                                      </div>
                                    </SelectItem>
                                  )}
                                  {commonAddresses.map((address) => (
                                    <SelectItem key={address} value={address} className="text-xs">
                                      {address}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {selectedPassengers.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                  <User className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>Aucun passager sélectionné</p>
                  <p className="text-sm">Utilisez la liste des employés pour ajouter des passagers</p>
                </div>
              )}

              {/* Note */}
              <div className="space-y-1">
                <Label className="text-sm">Note</Label>
                <Textarea
                  placeholder="Ajouter une note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="text-sm h-16"
                />
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleShowConfirmation}
                  className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
                  disabled={selectedEmployees.length === 0}
                >
                  Continuer vers la confirmation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
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
                {/* Récapitulatif */}
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
                            <Badge variant="outline">
                              {transportType === 'private' ? 'Privé' : 'Public'}
                            </Badge>
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium">Direction:</dt>
                          <dd>
                            <Badge variant="outline">
                              {isHomeToWorkTrip ? 'Domicile → Travail' : 'Travail → Domicile'}
                            </Badge>
                          </dd>
                        </div>
                        {isRecurring && (
                          <div>
                            <dt className="font-medium">Récurrence:</dt>
                            <dd className="text-sm mt-1">
                              {recurringDates.length} date(s) programmée(s)
                            </dd>
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
                        <Badge>
                          {selectedPassengers.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-48 overflow-y-auto">
                      {selectedPassengers.map((passenger, idx) => (
                        <div key={passenger.id} className={`py-2 ${idx > 0 ? 'border-t' : ''}`}>
                          <div className="font-medium">{passenger.name}</div>
                          <div className="text-sm text-muted-foreground">
                            <div>{passenger.department} - {passenger.subsidiary}</div>
                            <div>{passenger.phone}</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
                
                {/* Tableau détaillé des trajets et estimation */}
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
                              <div className="font-medium">{passenger.name}</div>
                              <div className="text-xs text-muted-foreground">{passenger.phone}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3 text-green-500" />
                                  <span className="truncate max-w-[150px]">{passenger.departureAddress}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3 text-red-500" />
                                  <span className="truncate max-w-[150px]">{passenger.arrivalAddress}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {routeEstimations[idx]?.distance || '-'}
                            </TableCell>
                            <TableCell>
                              {routeEstimations[idx]?.duration || '-'}
                            </TableCell>
                            <TableCell>
                              <span className="font-medium text-etaxi-yellow">
                                {routeEstimations[idx]?.price.toFixed(2)}€
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={6} className="text-right font-bold">
                            Total
                          </TableCell>
                          <TableCell className="font-bold text-etaxi-yellow">
                            {totalPrice.toFixed(2)}€
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                
                {/* Estimation financière */}
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
                            <span className="font-medium">Prix total estimé:</span>
                          </div>
                          <span className="text-xl font-bold text-etaxi-yellow">{totalPrice.toFixed(2)}€</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          <p>Basé sur {selectedPassengers.length} passager(s) et les adresses fournies</p>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p>Cette estimation est basée sur les tarifs actuels et peut varier en fonction des conditions de circulation.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Conditions et politique d'annulation */}
                <Card className="bg-muted/30">
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
                  <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                    Retour
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirmer la demande
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <AddEmployeeFromCSV
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
        onEmployeesImported={handleEmployeesImported}
      />
    </div>
  );
}