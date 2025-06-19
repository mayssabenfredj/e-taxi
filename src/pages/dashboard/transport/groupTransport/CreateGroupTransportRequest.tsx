import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Steps } from '@/components/shared/Steps';
import { EmployeeSelection } from '@/components/transport/requestGroupTransport/EmployeeSelection';
import { TransportConfig } from '@/components/transport/requestGroupTransport/TransportConfig';
import { useEmployees } from '@/hooks/useEmployees';
import { useRolesAndSubsidiaries } from '@/hooks/useRolesAndSubsidiaries';
import { demandeService } from '@/services/demande.service';
import { CreateTransportRequestDto, TransportType, SelectedPassenger, RecurringDateTime, RouteEstimation, DraftData, TransportDirection, GroupRoute } from '@/types/demande';
import { ConfirmationView } from '@/components/transport/requestGroupTransport/ConfirmationView';
import { Loader } from '@googlemaps/js-api-loader'; // Google Maps API loader
import { Employee } from '@/types/employee';

export function CreateGroupTransportRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();
  const enterpriseId = user?.enterpriseId;

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
  const [groupRoute, setGroupRoute] = useState<GroupRoute | null>(null);

  // Google Maps API Loader
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places'],
    });

    loader
      .load()
      .then(() => {
        setGoogleMapsLoaded(true);
      })
      .catch((error) => {
        console.error('Error loading Google Maps:', error);
        toast.error('Erreur lors du chargement de Google Maps');
      });

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Fetch employees using useEmployees hook
  const { employees, total, loading } = useEmployees({
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

  // Auto-save draft functionality
  const saveDraftData = () => {
    const draftData: DraftData = {
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
  }, [selectedEmployees, selectedPassengers, transportType, scheduledDate, scheduledTime, isRecurring, recurringDates, note, isHomeToWorkTrip]);

  // Load draft data
  useEffect(() => {
    if (location.state?.draftId || location.state?.draftData) {
      const draftData = location.state.draftData as DraftData;
      if (draftData) {
        setSelectedEmployees(draftData.selectedEmployees || []);
        setSelectedPassengers(draftData.selectedPassengers || []);
        setTransportType(draftData.transportType || 'public');
        setScheduledDate(draftData.scheduledDate ? new Date(draftData.scheduledDate) : new Date());
        setScheduledTime(draftData.scheduledTime || '09:00');
        setIsRecurring(draftData.isRecurring || false);
        setRecurringDates(draftData.recurringDates || []);
        setNote(draftData.note || '');
        setIsHomeToWorkTrip(draftData.isHomeToWorkTrip !== undefined ? draftData.isHomeToWorkTrip : true);
        toast.info('Brouillon chargé');
      }
    } else {
      const savedDraft = localStorage.getItem('groupTransportDraft');
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft) as DraftData;
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
  };

  const updatePassengerAddress = (passengerId: string, field: 'departureAddressId' | 'arrivalAddressId', value: string) => {
    setSelectedPassengers((prev) =>
      prev.map((passenger) => (passenger.id === passengerId ? { ...passenger, [field]: value } : passenger))
    );
  };

  const handleRecurringDateChange = (dates: Date[] | undefined) => {
    if (dates) {
      const newRecurringDates = dates.map((date) => ({
        date,
        time: scheduledTime,
      }));
      setRecurringDates(newRecurringDates);
    } else {
      setRecurringDates([]);
    }
  };

  const updateRecurringTime = (index: number, time: string) => {
    setRecurringDates((prev) => prev.map((item, i) => (i === index ? { ...item, time } : item)));
  };

  const handleSaveDraft = () => {
    saveDraftData();
    toast.success('Brouillon sauvegardé');
    navigate('/transport/drafts');
  };

const calculateRoutes = async () => {
  if (!googleMapsLoaded || !window.google) {
    toast.error('Google Maps non chargé');
    return;
  }

  setIsCalculating(true);

  try {
    const directionsService = new window.google.maps.DirectionsService();

    // Estimations individuelles
    const estimations: RouteEstimation[] = await Promise.all(
      selectedPassengers.map(async (passenger) => {
        const departureAddress = passenger.addresses?.find(
          (addr) => addr.address.id === passenger.departureAddressId
        )?.address.formattedAddress;
        const arrivalAddress = passenger.addresses?.find(
          (addr) => addr.address.id === passenger.arrivalAddressId
        )?.address.formattedAddress;

        if (!departureAddress || !arrivalAddress) {
          return {
            distance: '-',
            duration: '-',
            price: 0,
          };
        }

        const individualRequest: google.maps.DirectionsRequest = {
          origin: departureAddress,
          destination: arrivalAddress,
          travelMode: google.maps.TravelMode.DRIVING,
        };

        const individualDirectionsResponse = await directionsService.route(individualRequest);
        const route = individualDirectionsResponse.routes[0];
        const leg = route.legs[0];
        const distanceKm = (leg.distance?.value || 0) / 1000;
        const durationSeconds = leg.duration?.value || 0;
        const durationMinutes = Math.round(durationSeconds / 60);

        const basePrice = 0.9;
        const pricePerKm = 0.6;
        const pricePerMinute = 0.15;
        const price = basePrice + distanceKm * pricePerKm + durationMinutes * pricePerMinute;

        return {
          distance: `${distanceKm.toFixed(1)} km`,
          duration: `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}min`,
          price: parseFloat(price.toFixed(2)),
          departureAddress,
          arrivalAddress,
        };
      })
    );

    setRouteEstimations(estimations);

    // Calcul du trajet groupé
    const addresses = selectedPassengers
      .map((passenger) => {
        const addressId = isHomeToWorkTrip ? passenger.departureAddressId : passenger.arrivalAddressId;
        return passenger.addresses?.find((addr) => addr.address.id === addressId)?.address.formattedAddress;
      })
      .filter((address): address is string => !!address);

    const workAddress = selectedPassengers[0]?.addresses?.find(
      (addr) => addr.address.addressType === 'OFFICE'
    )?.address.formattedAddress;

    if (!workAddress || addresses.length === 0) {
      throw new Error('Adresses non valides');
    }

    const waypoints = isHomeToWorkTrip
      ? addresses.slice(1).map((address) => ({ location: address, stopover: true }))
      : addresses.slice(0, -1).map((address) => ({ location: address, stopover: true }));

    const origin = isHomeToWorkTrip ? addresses[0] : workAddress;
    const destination = isHomeToWorkTrip ? workAddress : addresses[addresses.length - 1];

    const request: google.maps.DirectionsRequest = {
      origin,
      destination,
      waypoints,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    const directionsResponse = await directionsService.route(request);
    const groupRouteResponse = directionsResponse.routes[0];
    const totalDistanceKm = groupRouteResponse.legs.reduce((acc, leg) => acc + (leg.distance?.value || 0), 0) / 1000;
    const totalDurationSeconds = groupRouteResponse.legs.reduce((acc, leg) => acc + (leg.duration?.value || 0), 0);
    const totalDurationMinutes = Math.round(totalDurationSeconds / 60);

    const basePrice = 0.9;
    const pricePerKm = 0.6;
    const pricePerMinute = 0.15;
    const groupPrice = basePrice + totalDistanceKm * pricePerKm + totalDurationMinutes * pricePerMinute;

    // Construire la liste des points dans l'ordre
    const points: string[] = [origin];
    if (waypoints.length > 0) {
      const optimizedOrder = directionsResponse.routes[0].waypoint_order;
      const orderedWaypoints = optimizedOrder.map((index) => waypoints[index].location);
      points.push(...orderedWaypoints);
    }
    points.push(destination);

    setGroupRoute({
      totalDistance: `${totalDistanceKm.toFixed(1)} km`,
      totalDuration: `${Math.floor(totalDurationMinutes / 60)}h ${totalDurationMinutes % 60}min`,
      points,
      origin,
      destination,
    });

    setTotalPrice(parseFloat(groupPrice.toFixed(2)));
    setIsCalculating(false);
  } catch (error: any) {
    console.error('Error calculating routes:', error);
    toast.error(`Erreur de calcul d'itinéraire: ${error.message || error.status || 'inconnue'}`);
    setRouteEstimations(
      selectedPassengers.map(() => ({
        distance: '-',
        duration: '-',
        price: 0,
      }))
    );
    setGroupRoute(null);
    setTotalPrice(0);
    setIsCalculating(false);
  }
};



  const handleSubmit = async () => {
    if (selectedEmployees.length === 0) {
      toast.error('Veuillez sélectionner au moins un employé');
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

      const requestData: CreateTransportRequestDto = {
        type: isRecurring ? TransportType.RECURRING : TransportType.SCHEDULED,
        note,
        scheduledDate: combineDateTime(scheduledDate, scheduledTime),
        requestedById: user?.id || 'current-user-id',
        enterpriseId,
        direction: isHomeToWorkTrip ? TransportDirection.HOMETOOFFICE : TransportDirection.OFFICETOHOME,
        employeeTransports: selectedPassengers.map((passenger) => ({
          employeeId: passenger.id,
          note: passenger.note || undefined,
          startTime: combineDateTime(scheduledDate, scheduledTime),
          departureId: passenger.departureAddressId,
          arrivalId: passenger.arrivalAddressId,
        })),
      };

      if (isRecurring) {
        const requests = recurringDates.map((rd) => ({
          ...requestData,
          scheduledDate: combineDateTime(rd.date, rd.time),
          employeeTransports: requestData.employeeTransports.map((et) => ({
            ...et,
            startTime: rd.time,
          })),
        }));
        await Promise.all(requests.map(demandeService.createTransportRequest));
      } else {
        await demandeService.createTransportRequest(requestData);
      }

      localStorage.removeItem('groupTransportDraft');
      toast.success('Demande de transport de groupe créée avec succès');
      navigate('/transport/group');
    } catch (error) {
      toast.error('Erreur lors de la création de la demande de transport');
      console.error(error);
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
  };

  const handleEmployeesImported = (importedEmployees: Employee[]) => {
    const newPassengers = importedEmployees.map((emp) => {
      const homeAddress = emp.addresses?.find((addr) => addr.address.addressType === 'HOME');
      const workAddress = emp.addresses?.find((addr) => addr.address.addressType === 'OFFICE');
      const departureAddressId = isHomeToWorkTrip
        ? homeAddress?.address.id || 'none'
        : workAddress?.address.id || 'none';
      const arrivalAddressId = isHomeToWorkTrip
        ? workAddress?.address.id || 'none'
        : homeAddress?.address.id || 'none';
      return {
        ...emp,
        subsidiaryName: emp.subsidiary?.name || subsidiaries.find((sub) => sub.id === emp.subsidiaryId)?.name || 'Non spécifié',
        departureAddressId,
        arrivalAddressId,
        isHomeToWork: isHomeToWorkTrip,
        note: '',
      };
    });
    setSelectedEmployees((prev) => [...prev, ...newPassengers.map((p) => p.id)]);
    setSelectedPassengers((prev) => [...prev, ...newPassengers]);
    toast.success(`${newPassengers.length} employé(s) ajouté(s) à la demande`);
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
    calculateRoutes();
  };

  const steps = [{ name: 'Configuration' }, { name: 'Confirmation' }];

  if (!enterpriseId) {
    return <div>Erreur : ID de l'entreprise non disponible</div>;
  }

  return (
    <div className="space-y-4 max-w-7xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/transport/group')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h2 className="text-2xl font-bold">Nouvelle demande de transport de groupe</h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder en brouillon
          </Button>
        </div>
      </div>
      <Steps currentStep={showConfirmation ? 1 : 0} steps={steps} />
      {showConfirmation ? (
       <ConfirmationView
  isCalculating={isCalculating}
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
          />
        </div>
      )}
    </div>
  );
}