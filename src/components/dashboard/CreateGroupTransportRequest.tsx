import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { ArrowLeft, Save, User, Clock, Calendar as CalendarIcon, Search, MapPin, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Employee {
  id: string;
  name: string;
  department: string;
  subsidiary: string;
  email: string;
  phone: string;
}

interface SelectedPassenger extends Employee {
  departureAddress: string;
  arrivalAddress: string;
}

interface RecurringDateTime {
  date: Date;
  time: string;
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

  const employees: Employee[] = [
    {
      id: '1',
      name: 'Jean Dupont',
      department: 'Marketing',
      subsidiary: 'Paris',
      email: 'jean.dupont@example.com',
      phone: '+33 6 12 34 56 78',
    },
    {
      id: '2',
      name: 'Marie Martin',
      department: 'Ventes',
      subsidiary: 'Lyon',
      email: 'marie.martin@example.com',
      phone: '+33 6 98 76 54 32',
    },
    {
      id: '3',
      name: 'Pierre Durand',
      department: 'IT',
      subsidiary: 'Paris',
      email: 'pierre.durand@example.com',
      phone: '+33 6 55 55 55 55',
    },
    {
      id: '4',
      name: 'Sophie Leclerc',
      department: 'RH',
      subsidiary: 'Marseille',
      email: 'sophie.leclerc@example.com',
      phone: '+33 6 11 22 33 44',
    },
    {
      id: '5',
      name: 'Luc Bernard',
      department: 'Finance',
      subsidiary: 'Paris',
      email: 'luc.bernard@example.com',
      phone: '+33 6 77 88 99 00',
    },
    {
      id: '6',
      name: 'Isabelle Garcia',
      department: 'Marketing',
      subsidiary: 'Lyon',
      email: 'isabelle.garcia@example.com',
      phone: '+33 6 44 33 22 11',
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
  }, [selectedEmployees, selectedPassengers, transportType, scheduledDate, scheduledTime, isRecurring, recurringDates, note]);

  // Save draft when leaving the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (selectedEmployees.length > 0 || note.trim()) {
        saveDraftData();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [selectedEmployees, note]);

  // Load draft data if available
  useEffect(() => {
    if (location.state?.draftId || location.state?.draftData) {
      const draftData = location.state.draftData;
      if (draftData) {
        setNote(draftData.note || '');
        if (draftData.scheduledDate) {
          setScheduledDate(new Date(draftData.scheduledDate));
        }
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
          toast.info('Brouillon automatiquement restauré');
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
    }
  }, [location.state]);

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.subsidiary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
      setSelectedPassengers(prev => prev.filter(p => p.id !== employeeId));
    } else {
      setSelectedEmployees(prev => [...prev, employeeId]);
      setSelectedPassengers(prev => [...prev, {
        ...employee,
        departureAddress: 'Siège social - 15 Rue du Louvre, 75001 Paris',
        arrivalAddress: 'Aéroport Charles de Gaulle, 95700 Roissy'
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

  const handleSubmit = () => {
    if (selectedEmployees.length === 0) {
      toast.error('Veuillez sélectionner au moins un employé');
      return;
    }

    localStorage.removeItem('groupTransportDraft');
    toast.success('Demande de transport de groupe créée avec succès');
    navigate('/transport');
  };

  return (
    <div className="space-y-4 max-w-7xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/transport')}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Employee Selection */}
        {showEmployeeList && (
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Sélection des employés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-sm"
                />
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
                <Label className="text-sm">Heure</Label>
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
                onClick={handleSubmit}
                className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
                disabled={selectedEmployees.length === 0}
              >
                Confirmer la demande
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
