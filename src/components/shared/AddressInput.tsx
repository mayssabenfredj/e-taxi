import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Check, ChevronsUpDown, MapPin, Map, Search, Target, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Address {
  id: string;
  label: string;
  street: string;
  buildingNumber?: string;
  complement?: string;
  postalCode: string;
  city: string;
  region?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  formattedAddress?: string;
  isVerified?: boolean;
  isExact?: boolean;
  manuallyEntered?: boolean;
  addressType?: string;
  notes?: string;
}

interface AddressInputProps {
  label: string;
  value?: Address | null;
  onChange: (address: Address | null) => void;
  savedAddresses?: Address[];
  required?: boolean;
  showMapPicker?: boolean;
}

interface GooglePlacesResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export function AddressInput({ 
  label, 
  value, 
  onChange, 
  savedAddresses = [], 
  required = false,
  showMapPicker = true
}: AddressInputProps) {
  const [open, setOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('saved');
  
  // Manual address form
  const [manualAddress, setManualAddress] = useState({
    street: '',
    buildingNumber: '',
    complement: '',
    postalCode: '',
    city: '',
    region: '',
    country: 'France'
  });
  
  // Coordinates input
  const [coordinates, setCoordinates] = useState({
    latitude: '',
    longitude: ''
  });
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GooglePlacesResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Google Maps
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  
  // Initialize Google Maps
  useEffect(() => {
    if (mapOpen && mapRef.current && !map) {
      initializeMap();
    }
  }, [mapOpen]);

  const initializeMap = () => {
    if (!window.google) {
      loadGoogleMapsScript();
      return;
    }

    const mapInstance = new google.maps.Map(mapRef.current!, {
      center: { lat: 48.8566, lng: 2.3522 }, // Paris
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    const markerInstance = new google.maps.Marker({
      position: { lat: 48.8566, lng: 2.3522 },
      map: mapInstance,
      draggable: true,
    });

    mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        markerInstance.setPosition({ lat, lng });
        reverseGeocode(lat, lng);
      }
    });

    markerInstance.addListener('dragend', () => {
      const position = markerInstance.getPosition();
      if (position) {
        reverseGeocode(position.lat(), position.lng());
      }
    });

    setMap(mapInstance);
    setMarker(markerInstance);
  };

  const loadGoogleMapsScript = () => {
    if (window.google) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    document.head.appendChild(script);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!window.google) return;

    const geocoder = new google.maps.Geocoder();
    try {
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results[0]) {
        const result = response.results[0];
        const address = parseGoogleAddress(result);
        onChange({
          ...address,
          latitude: lat,
          longitude: lng,
          placeId: result.place_id,
          formattedAddress: result.formatted_address,
          isVerified: true,
          manuallyEntered: false
        });
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  };

  const parseGoogleAddress = (result: any): Address => {
    const components = result.address_components;
    let street = '';
    let buildingNumber = '';
    let city = '';
    let postalCode = '';
    let region = '';
    let country = '';

    components.forEach((component: any) => {
      const types = component.types;
      if (types.includes('street_number')) {
        buildingNumber = component.long_name;
      } else if (types.includes('route')) {
        street = component.long_name;
      } else if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('postal_code')) {
        postalCode = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        region = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      }
    });

    return {
      id: `google-${Date.now()}`,
      label: result.formatted_address,
      street: buildingNumber ? `${buildingNumber} ${street}` : street,
      buildingNumber,
      city,
      postalCode,
      region,
      country,
      formattedAddress: result.formatted_address,
      isVerified: true,
      manuallyEntered: false
    };
  };

  const searchPlaces = async (query: string) => {
    if (!query.trim() || !window.google) return;

    setIsSearching(true);
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    
    const request = {
      query,
      fields: ['place_id', 'formatted_address', 'geometry', 'address_components'],
    };

    service.textSearch(request, (results, status) => {
      setIsSearching(false);
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        setSearchResults(results.slice(0, 5));
      } else {
        setSearchResults([]);
      }
    });
  };

  const handleSearchSelect = (result: GooglePlacesResult) => {
    const address = parseGoogleAddress(result);
    onChange({
      ...address,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      placeId: result.place_id,
      formattedAddress: result.formatted_address,
      isVerified: true,
      manuallyEntered: false
    });
    setSearchQuery('');
    setSearchResults([]);
    setOpen(false);
  };

  const handleManualSubmit = () => {
    if (!manualAddress.street || !manualAddress.city || !manualAddress.postalCode) {
      toast.error('Veuillez remplir au moins la rue, la ville et le code postal');
      return;
    }

    const address: Address = {
      id: `manual-${Date.now()}`,
      label: `${manualAddress.street}, ${manualAddress.city}`,
      street: manualAddress.buildingNumber ? 
        `${manualAddress.buildingNumber} ${manualAddress.street}` : 
        manualAddress.street,
      buildingNumber: manualAddress.buildingNumber,
      complement: manualAddress.complement,
      city: manualAddress.city,
      postalCode: manualAddress.postalCode,
      region: manualAddress.region,
      country: manualAddress.country,
      formattedAddress: `${manualAddress.street}, ${manualAddress.postalCode} ${manualAddress.city}, ${manualAddress.country}`,
      isVerified: false,
      manuallyEntered: true
    };

    onChange(address);
    setManualAddress({
      street: '',
      buildingNumber: '',
      complement: '',
      postalCode: '',
      city: '',
      region: '',
      country: 'France'
    });
    setOpen(false);
    toast.success('Adresse manuelle ajoutée');
  };

  const handleCoordinatesSubmit = () => {
    const lat = parseFloat(coordinates.latitude);
    const lng = parseFloat(coordinates.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Coordonnées invalides');
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error('Coordonnées hors limites');
      return;
    }

    const address: Address = {
      id: `coords-${Date.now()}`,
      label: `Coordonnées: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      street: `Position: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      city: 'Position GPS',
      postalCode: '',
      country: 'France',
      latitude: lat,
      longitude: lng,
      formattedAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      isVerified: false,
      manuallyEntered: true
    };

    onChange(address);
    setCoordinates({ latitude: '', longitude: '' });
    setOpen(false);
    toast.success('Position GPS ajoutée');
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Géolocalisation non supportée');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (map && marker) {
          map.setCenter({ lat, lng });
          marker.setPosition({ lat, lng });
          reverseGeocode(lat, lng);
        }
        
        toast.success('Position actuelle obtenue!');
      },
      (error) => {
        toast.error('Impossible d\'obtenir la position');
      }
    );
  };

  const handleSavedSelect = (address: Address) => {
    onChange(address);
    setOpen(false);
  };

  return (
    <div className="space-y-2 w-full">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="flex-1 justify-between min-h-[40px] text-left"
            >
              {value ? (
                <div className="flex items-center truncate">
                  <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{value.label || value.formattedAddress}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Sélectionner une adresse...</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 max-w-lg" align="start">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 text-xs">
                <TabsTrigger value="saved" className="text-xs">Sauvées</TabsTrigger>
                <TabsTrigger value="search" className="text-xs">Recherche</TabsTrigger>
                <TabsTrigger value="manual" className="text-xs">Manuelle</TabsTrigger>
                <TabsTrigger value="coords" className="text-xs">GPS</TabsTrigger>
              </TabsList>
              
              <TabsContent value="saved" className="p-2">
                <Command>
                  <CommandInput placeholder="Rechercher dans les adresses sauvées..." />
                  <CommandEmpty>Aucune adresse sauvée trouvée.</CommandEmpty>
                  {savedAddresses.length > 0 && (
                    <CommandGroup>
                      {savedAddresses.map((address) => (
                        <CommandItem
                          key={address.id}
                          value={address.label}
                          onSelect={() => handleSavedSelect(address)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value?.id === address.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{address.label}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {address.street}, {address.city}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </Command>
              </TabsContent>
              
              <TabsContent value="search" className="p-2 space-y-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Rechercher une adresse..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchPlaces(searchQuery)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => searchPlaces(searchQuery)}
                    disabled={isSearching}
                    size="sm"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                
                {isSearching && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-etaxi-yellow mx-auto"></div>
                  </div>
                )}
                
                {searchResults.length > 0 && (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {searchResults.map((result) => (
                      <div
                        key={result.place_id}
                        onClick={() => handleSearchSelect(result)}
                        className="p-2 hover:bg-muted rounded cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-etaxi-yellow flex-shrink-0" />
                          <span className="text-sm truncate">{result.formatted_address}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="manual" className="p-2 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="N° bâtiment"
                    value={manualAddress.buildingNumber}
                    onChange={(e) => setManualAddress({...manualAddress, buildingNumber: e.target.value})}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Rue *"
                    value={manualAddress.street}
                    onChange={(e) => setManualAddress({...manualAddress, street: e.target.value})}
                    className="text-sm"
                  />
                </div>
                
                <Input
                  placeholder="Complément d'adresse"
                  value={manualAddress.complement}
                  onChange={(e) => setManualAddress({...manualAddress, complement: e.target.value})}
                  className="text-sm"
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Code postal *"
                    value={manualAddress.postalCode}
                    onChange={(e) => setManualAddress({...manualAddress, postalCode: e.target.value})}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Ville *"
                    value={manualAddress.city}
                    onChange={(e) => setManualAddress({...manualAddress, city: e.target.value})}
                    className="text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Région"
                    value={manualAddress.region}
                    onChange={(e) => setManualAddress({...manualAddress, region: e.target.value})}
                    className="text-sm"
                  />
                  <Select 
                    value={manualAddress.country} 
                    onValueChange={(value) => setManualAddress({...manualAddress, country: value})}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="France">France</SelectItem>
                      <SelectItem value="Belgique">Belgique</SelectItem>
                      <SelectItem value="Suisse">Suisse</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleManualSubmit}
                  className="w-full bg-etaxi-yellow hover:bg-yellow-500 text-black text-sm"
                  size="sm"
                >
                  Ajouter l'adresse
                </Button>
              </TabsContent>
              
              <TabsContent value="coords" className="p-2 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={coordinates.latitude}
                    onChange={(e) => setCoordinates({...coordinates, latitude: e.target.value})}
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={coordinates.longitude}
                    onChange={(e) => setCoordinates({...coordinates, longitude: e.target.value})}
                    className="text-sm"
                  />
                </div>
                
                <Button 
                  onClick={getCurrentLocation}
                  variant="outline" 
                  className="w-full text-sm"
                  size="sm"
                >
                  <Target className="mr-2 h-4 w-4" />
                  Ma position actuelle
                </Button>
                
                <Button 
                  onClick={handleCoordinatesSubmit}
                  className="w-full bg-etaxi-yellow hover:bg-yellow-500 text-black text-sm"
                  size="sm"
                  disabled={!coordinates.latitude || !coordinates.longitude}
                >
                  Utiliser ces coordonnées
                </Button>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>

        {showMapPicker && (
          <Dialog open={mapOpen} onOpenChange={setMapOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="flex-shrink-0">
                <Map className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] my-4">
              <DialogHeader>
                <DialogTitle>Sélectionner sur la carte</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-center space-x-2">
                  <Button onClick={getCurrentLocation} variant="outline" size="sm">
                    <Target className="mr-2 h-4 w-4" />
                    Ma position
                  </Button>
                </div>
                <div 
                  ref={mapRef} 
                  className="w-full h-96 rounded-lg border"
                  style={{ minHeight: '400px' }}
                />
                {value && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">Adresse sélectionnée:</div>
                    <div className="text-sm text-muted-foreground">
                      {value.formattedAddress || value.label}
                    </div>
                    {value.latitude && value.longitude && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}