import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/shareds/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/shareds/contexts/LanguageContext';
import { useAuth } from '@/shareds/contexts/AuthContext';
import { Steps } from '@/shareds/components/Steps';
import { EmployeeSelection } from '@/features/transports/components/requestGroupTransport/EmployeeSelection';
import { TransportConfig } from '@/features/transports/components/requestGroupTransport/TransportConfig';
import { useEmployees } from '@/shareds/hooks/useEmployees';
import { useRolesAndSubsidiaries } from '@/shareds/hooks/useRolesAndSubsidiaries';
import { demandeService } from '@/features/transports/services/demande.service';
import { CreateTransportRequestDto, TransportType, SelectedPassenger, RecurringDateTime, RouteEstimation, DraftData, TransportDirection, GroupRoute } from '@/features/transports/types/demande';
import { ConfirmationView } from '@/features/transports/components/requestGroupTransport/ConfirmationView';
import { CreateEmployee } from '@/features/employees/types/employee';
import { startOfDay } from 'date-fns';
import { hasPermission } from '@/shareds/lib/utils';
import { AddressDto } from '@/shareds/types/addresse';
import { ADMIN_FILIALE_ROLE } from '@/shareds/lib/const';

// Fonction pour générer un UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export function CreateGroupTransportRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();
  const enterpriseId = user?.enterpriseId;

  if (!hasPermission(user, 'transports:create')) {
    return <div className="text-center text-red-500 py-12">Accès refusé : vous n'avez pas la permission de créer des transports.</div>;
  }

  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedPassengers, setSelectedPassengers] = useState<SelectedPassenger[]>([]);
  const [transportType, setTransportType] = useState<'public' | 'private'>('private');
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDates, setRecurringDates] = useState<RecurringDateTime[]>([]);
  const [note, setNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmployeeList, setShowEmployeeList] = useState(true);
  const [isHomeToWorkTrip, setIsHomeToWorkTrip] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [subsidiaryFilter, setSubsidiaryFilter] = useState<string>('all');
  const [routeEstimations, setRouteEstimations] = useState<RouteEstimation[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [groupRoute, setGroupRoute] = useState<GroupRoute | null>(null);
  const [draftId, setDraftId] = useState<string>(generateUUID());

  // Fetch employees using useEmployees hook
  const { employees, total, loading, importEmployees } = useEmployees({
    enterpriseId,
    roleFilter: 'all',
    subsidiaryFilter,
    statusFilter: 'ENABLED',
    skip: 0,
    take: 100,
  });

  // Fetch subsidiaries using useRolesAndSubsidiaries hook
  const { subsidiaries, loading: rolesLoading } = useRolesAndSubsidiaries(enterpriseId);

  // Map employees to include subsidiaryName
  const mappedEmployees = employees.map((emp) => ({
    ...emp,
    subsidiaryName: emp.subsidiary?.name || subsidiaries.find((sub) => sub.id === emp.subsidiaryId)?.name || 'Non spécifié',
  }));

  // Filter employees by search term
  const filteredEmployees = mappedEmployees.filter(
    (employee) =>
      searchTerm === '' ||
      employee.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.subsidiaryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Récupérer la liste des brouillons depuis localStorage
  const getDrafts = (): DraftData[] => {
    const savedDrafts = localStorage.getItem('groupTransportDrafts');
    return savedDrafts ? JSON.parse(savedDrafts) : [];
  };

  // Sauvegarder ou mettre à jour un brouillon dans la liste
  const saveDraftData = () => {
    const draftData: DraftData = {
      draftId,
      selectedEmployees,
      selectedPassengers,
      transportType,
      scheduledDate: scheduledDate.toISOString(),
      scheduledTime,
      isRecurring,
      recurringDates,
      note,
      isHomeToWorkTrip,
      lastModified: new Date().toISOString(),
    };

    const drafts = getDrafts();
    const existingDraftIndex = drafts.findIndex((d) => d.draftId === draftId);
    if (existingDraftIndex !== -1) {
      drafts[existingDraftIndex] = draftData;
    } else {
      drafts.push(draftData);
    }

    localStorage.setItem('groupTransportDrafts', JSON.stringify(drafts));
  };

  // Créer un nouveau brouillon avec un nouvel ID
  const saveNewDraft = () => {
    saveDraftData();
    toast.success('Brouillon sauvegardé');
    navigate('/transport/drafts');
  };

  // Réinitialiser le formulaire pour un nouveau brouillon
  const resetForm = () => {
    setSelectedEmployees([]);
    setSelectedPassengers([]);
    setTransportType('private');
    setScheduledDate(new Date());
    setScheduledTime('09:00');
    setIsRecurring(false);
    setRecurringDates([]);
    setNote('');
    setSearchTerm('');
    setShowEmployeeList(true);
    setIsHomeToWorkTrip(false);
    setCsvImportOpen(false);
    setSubsidiaryFilter('all');
    setRouteEstimations([]);
    setTotalPrice(0);
    setShowConfirmation(false);
    setGroupRoute(null);
    setDraftId(generateUUID()); // Générer un nouvel ID pour le prochain brouillon
    toast.success('Formulaire réinitialisé pour un nouveau brouillon');
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (selectedEmployees.length > 0 || note.trim()) {
        saveDraftData();
      }
    }, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [selectedEmployees, selectedPassengers, transportType, scheduledDate, scheduledTime, isRecurring, recurringDates, note, isHomeToWorkTrip, draftId]);

  // Save draft when leaving the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (selectedEmployees.length > 0 || note.trim()) {
        saveDraftData();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [selectedEmployees, selectedPassengers, transportType, scheduledDate, scheduledTime, isRecurring, recurringDates, note, isHomeToWorkTrip, draftId]);

  // Load draft data
  useEffect(() => {
    if (location.state?.editData) {
      const editData = location.state.editData;
      // Prefill form fields from editData
      setDraftId(editData.id || generateUUID());
      setSelectedEmployees(editData.employeeTransports?.map((et: any) => et.employeeId) || []);
      setSelectedPassengers(editData.employeeTransports?.map((et: any) => ({
        ...et.employee,
        departureAddressId: et.departure?.id || 'none',
        arrivalAddressId: et.arrival?.id || 'none',
        isHomeToWork: editData.Direction === 'HOMETOOFFICE',
        note: et.note || '',
      })) || []);
      setTransportType(editData.transportType === 'public' ? 'public' : 'private');
      setScheduledDate(editData.scheduledDate ? new Date(editData.scheduledDate) : new Date());
      setScheduledTime(editData.scheduledDate ? new Date(editData.scheduledDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '09:00');
      setIsRecurring(editData.type === 'RECURRING');
      setRecurringDates([]); // You can enhance this if recurring info is available
      setNote(editData.note || '');
      setIsHomeToWorkTrip(editData.Direction === 'HOMETOOFFICE');
      setShowEmployeeList(true);
      setCsvImportOpen(false);
      setSubsidiaryFilter('all');
      setRouteEstimations([]);
      setTotalPrice(0);
      setShowConfirmation(false);
      setGroupRoute(null);
    } else if (location.state?.draftId || location.state?.draftData) {
      const draftData = location.state.draftData as DraftData;
      if (draftData && draftData.draftId) {
        setDraftId(draftData.draftId);
        setSelectedEmployees(draftData.selectedEmployees || []);
        setSelectedPassengers(draftData.selectedPassengers || []);
        setTransportType(draftData.transportType || 'private');
        setScheduledDate(draftData.scheduledDate ? new Date(draftData.scheduledDate) : new Date());
        setScheduledTime(draftData.scheduledTime || '09:00');
        setIsRecurring(draftData.isRecurring || false);
        setRecurringDates(
          draftData.recurringDates?.map((rd) => ({
            date: new Date(rd.date),
            time: rd.time,
          })) || []
        );
        setNote(draftData.note || '');
        setIsHomeToWorkTrip(draftData.isHomeToWorkTrip !== undefined ? draftData.isHomeToWorkTrip : false);
      }
    } else {
      const drafts = getDrafts();
      if (drafts.length > 0) {
        const latestDraft = drafts[drafts.length - 1]; // Charger le dernier brouillon par défaut
        setDraftId(latestDraft.draftId);
        setSelectedEmployees(latestDraft.selectedEmployees || []);
        setSelectedPassengers(latestDraft.selectedPassengers || []);
        setTransportType(latestDraft.transportType || 'private');
        setScheduledDate(latestDraft.scheduledDate ? new Date(latestDraft.scheduledDate) : new Date());
        setScheduledTime(latestDraft.scheduledTime || '09:00');
        setIsRecurring(latestDraft.isRecurring || false);
        setRecurringDates(
          latestDraft.recurringDates?.map((rd) => ({
            date: new Date(rd.date),
            time: rd.time,
          })) || []
        );
        setNote(latestDraft.note || '');
        setIsHomeToWorkTrip(latestDraft.isHomeToWorkTrip !== undefined ? latestDraft.isHomeToWorkTrip : false);
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (selectedEmployees.length > 0 || note.trim()) {
      saveDraftData();
    }
  }, [
    selectedEmployees,
    selectedPassengers,
    transportType,
    scheduledDate,
    scheduledTime,
    isRecurring,
    recurringDates,
    note,
    isHomeToWorkTrip,
    draftId,
  ]);

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = mappedEmployees.find((emp) => emp.id === employeeId);
    if (!employee) return;

    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees((prev) => prev.filter((id) => id !== employeeId));
      setSelectedPassengers((prev) => prev.filter((p) => p.id !== employeeId));
    } else {
      setSelectedEmployees((prev) => [...prev, employeeId]);
      const homeAddress = employee.addresses?.find((addr) => addr.address.addressType === 'HOME');
      const workAddress = employee.addresses?.find((addr) => addr.address.addressType === 'OFFICE');
      const departureAddressId = isHomeToWorkTrip
        ? homeAddress?.address.id || 'none'
        : workAddress?.address.id || 'none';
      const arrivalAddressId = isHomeToWorkTrip
        ? workAddress?.address.id || 'none'
        : homeAddress?.address.id || 'none';
      setSelectedPassengers((prev) => [
        ...prev,
        {
          ...employee,
          departureAddressId,
          arrivalAddressId,
          isHomeToWork: isHomeToWorkTrip,
          note: '',
        },
      ]);
    }
    saveDraftData();
  };

  const updatePassengerAddress = (passengerId: string, field: 'departureAddressId' | 'arrivalAddressId' | 'customAddresses', value: string | AddressDto | any[]) => {
    setSelectedPassengers((prev) =>
      prev.map((passenger) => (passenger.id === passengerId ? { ...passenger, [field]: value } : passenger))
    );
    saveDraftData();
  };

  const handleRecurringDateChange = (dates: Date[] | undefined) => {
    if (dates) {
      const newRecurringDates = dates.map((date) => ({
        date: startOfDay(date),
        time: scheduledTime,
      }));
      setRecurringDates(newRecurringDates);
    } else {
      setRecurringDates([]);
    }
    saveDraftData();
  };

  const updateRecurringTime = (index: number, time: string) => {
    setRecurringDates((prev) => prev.map((item, i) => (i === index ? { ...item, time } : item)));
    saveDraftData();
  };

  const handleSaveDraft = () => {
    saveNewDraft();
  };

  const handleSubmit = async () => {
    if (selectedEmployees.length === 0) {
      toast.error('Veuillez sélectionner au moins un Collaborateur');
      return;
    }
    if (selectedPassengers.some((p) => p.departureAddressId === 'none' || p.arrivalAddressId === 'none')) {
      toast.error('Veuillez sélectionner des adresses valides pour tous les passagers');
      return;
    }

    try {
      const combineDateTime = (date: Date, time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        const combined = new Date(date);
        combined.setHours(hours, minutes, 0, 0);
        return combined.toISOString();
      };

      const requestData = {
        type: isRecurring ? TransportType.RECURRING : TransportType.SCHEDULED,
        note,
        scheduledDate: combineDateTime(scheduledDate, scheduledTime),
        requestedById: user?.id || 'current-user-id',
        enterpriseId,
        Direction: isHomeToWorkTrip ? TransportDirection.HOMETOOFFICE : TransportDirection.OFFICETOHOME,
        subsidiaryId: user?.roles?.some((r: any) => r.role?.name === ADMIN_FILIALE_ROLE) ? user?.subsidiaryId : undefined,
        employeeTransports: selectedPassengers.map((passenger) => {
          let departureId: string | undefined = undefined;
          let arrivalId: string | undefined = undefined;
          let departureAddress: any = undefined;
          let arrivalAddress: any = undefined;
          if (passenger.departureAddressId && typeof passenger.departureAddressId === 'string') {
            departureId = passenger.departureAddressId;
          } else if (passenger.departureAddressId && typeof passenger.departureAddressId === 'object') {
            departureAddress = passenger.departureAddressId;
          }
          if (passenger.arrivalAddressId && typeof passenger.arrivalAddressId === 'string') {
            arrivalId = passenger.arrivalAddressId;
          } else if (passenger.arrivalAddressId && typeof passenger.arrivalAddressId === 'object') {
            arrivalAddress = passenger.arrivalAddressId;
          }
          return {
            employeeId: passenger.id,
            note: passenger.note || undefined,
            startTime: combineDateTime(scheduledDate, scheduledTime),
            departureId: departureId || undefined,
            arrivalId: arrivalId || undefined,
            departureAddress: departureAddress || undefined,
            arrivalAddress: arrivalAddress || undefined,
          };
        }),
      };

      if (location.state?.editData) {
        // EDIT MODE: update existing request
        const id = location.state.editData.id;
        await demandeService.updateTransportRequest(id, requestData);
        toast.success('Demande de transport de groupe modifiée avec succès');
        navigate('/transport/group');
      } else if (isRecurring) {
        // CREATE MODE: recurring
        const requests = recurringDates.map((rd) => ({
          ...requestData,
          scheduledDate: combineDateTime(rd.date, rd.time),
          employeeTransports: requestData.employeeTransports.map((et) => ({
            ...et,
            startTime: combineDateTime(rd.date, rd.time),
          })),
        }));
        await Promise.all(requests.map(demandeService.createTransportRequest));
        toast.success('Demandes de transport de groupe créées avec succès');
        navigate('/transport/group');
      } else {
        // CREATE MODE: single
        await demandeService.createTransportRequest(requestData);
        toast.success('Demande de transport de groupe créée avec succès');
        if (requestData.employeeTransports.length === 1) {
          navigate('/transport/individual');
        } else {
          navigate('/transport/group');
        }
      }

      // Supprimer le brouillon soumis
      const drafts = getDrafts();
      const updatedDrafts = drafts.filter((d) => d.draftId !== draftId);
      localStorage.setItem('groupTransportDrafts', JSON.stringify(updatedDrafts));
      setDraftId(generateUUID()); // Générer un nouvel ID pour le prochain brouillon
    } catch (error) {
      toast.error('Erreur lors de la création ou modification de la demande de transport');
    }
  };

  const handleToggleTripDirection = () => {
    setIsHomeToWorkTrip((prev) => !prev);
    setSelectedPassengers((prev) =>
      prev.map((passenger) => {
        const employee = mappedEmployees.find((emp) => emp.id === passenger.id);
        if (!employee) return passenger;
        const homeAddress = employee.addresses?.find((addr) => addr.address.addressType === 'HOME');
        const workAddress = employee.addresses?.find((addr) => addr.address.addressType === 'OFFICE');
        const departureAddressId = !isHomeToWorkTrip
          ? homeAddress?.address.id || 'none'
          : workAddress?.address.id || 'none';
        const arrivalAddressId = !isHomeToWorkTrip
          ? workAddress?.address.id || 'none'
          : homeAddress?.address.id || 'none';
        return {
          ...passenger,
          departureAddressId,
          arrivalAddressId,
          isHomeToWork: !isHomeToWorkTrip,
        };
      })
    );
    saveDraftData();
  };

  // Handler to import employees from CSV (convert CreateEmployee[] to Employee[] for EmployeeSelection)
  const handleEmployeesImported = (employees: any[]) => {
    // Map CreateEmployee to Employee (minimal fields for selection)
    const mapped = employees.map((emp) => ({
      id: emp.id || emp.email, // fallback to email if no id
      fullName: emp.firstName && emp.lastName ? `${emp.firstName} ${emp.lastName}` : emp.fullName || '',
      subsidiaryName: emp.subsidiaryName || emp.subsidiary || '',
      addresses: emp.addresses || [],
      // add other fields as needed
    }));
    // Set as selectable employees (if you want to add to the list)
    // setEmployees(mapped); // Uncomment if you want to add to the list
    // For now, just log or handle as needed
    // You may want to merge with existing employees
  };

  const handleShowConfirmation = () => {
    if (selectedPassengers.length === 0) {
      toast.error('Veuillez sélectionner au moins un passager');
      return;
    }
    if (selectedPassengers.some((p) => p.departureAddressId === 'none' || p.arrivalAddressId === 'none')) {
      toast.error('Veuillez sélectionner des adresses valides pour tous les passagers');
      return;
    }
    setShowConfirmation(true);
  };

  // Handler to remove a passenger from the list
  const handleRemovePassenger = (passengerId: string) => {
    setSelectedPassengers((prev) => prev.filter((p) => p.id !== passengerId));
    setSelectedEmployees((prev) => prev.filter((id) => id !== passengerId));
    saveDraftData();
  };

  const steps = [{ name: 'Configuration' }, { name: 'Confirmation' }];

  if (!enterpriseId) {
    return <div>Erreur : ID de l'organisation non disponible</div>;
  }

  return (
    <div className="space-y-4 max-w-7xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h2 className="text-2xl font-bold"></h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder en brouillon
          </Button>
          <Button variant="outline" onClick={resetForm}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Réinitialiser
          </Button>
        </div>
      </div>
      <Steps currentStep={showConfirmation ? 1 : 0} steps={steps} />
      {showConfirmation ? (
        <ConfirmationView
          transportType={transportType}
          scheduledDate={scheduledDate}
          scheduledTime={scheduledTime}
          isRecurring={isRecurring}
          recurringDates={recurringDates}
          note={note}
          isHomeToWorkTrip={isHomeToWorkTrip}
          selectedPassengers={selectedPassengers}
          routeEstimations={routeEstimations}
          totalPrice={totalPrice}
          groupRoute={groupRoute}
          setShowConfirmation={setShowConfirmation}
          handleSubmit={handleSubmit}
          subsidiaries={subsidiaries}
          isEditMode={Boolean(location.state?.editData)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {showEmployeeList && (
            <EmployeeSelection
              employees={filteredEmployees}
              selectedEmployees={selectedEmployees}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              subsidiaryFilter={subsidiaryFilter}
              setSubsidiaryFilter={setSubsidiaryFilter}
              subsidiaries={subsidiaries}
              handleEmployeeSelect={handleEmployeeSelect}
              setCsvImportOpen={setCsvImportOpen}
              csvImportOpen={csvImportOpen}
              handleEmployeesImported={handleEmployeesImported}
              setShowEmployeeList={setShowEmployeeList}
            />
          )}
          <TransportConfig
            transportType={transportType}
            setTransportType={setTransportType}
            scheduledDate={scheduledDate}
            setScheduledDate={setScheduledDate}
            scheduledTime={scheduledTime}
            setScheduledTime={setScheduledTime}
            isRecurring={isRecurring}
            setIsRecurring={setIsRecurring}
            recurringDates={recurringDates}
            handleRecurringDateChange={handleRecurringDateChange}
            updateRecurringTime={updateRecurringTime}
            isHomeToWorkTrip={isHomeToWorkTrip}
            handleToggleTripDirection={handleToggleTripDirection}
            note={note}
            setNote={setNote}
            selectedPassengers={selectedPassengers}
            updatePassengerAddress={updatePassengerAddress}
            showEmployeeList={showEmployeeList}
            setShowEmployeeList={setShowEmployeeList}
            handleShowConfirmation={handleShowConfirmation}
            subsidiaries={subsidiaries}
            onRemovePassenger={handleRemovePassenger}
          />
        </div>
      )}
    </div>
  );
}
