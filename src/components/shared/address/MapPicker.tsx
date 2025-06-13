import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Search, Target, Navigation } from 'lucide-react';
import { toast } from 'sonner';

interface Coordinates {
  lat: number;
  lng: number;
}

interface Address {
  id: string;
  label: string;
  street: string;
  buildingNumber?: string;
  city: string;
  postalCode: string;
  region?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  formattedAddress?: string;
  isVerified?: boolean;
  manuallyEntered?: boolean;
}

interface MapPickerProps {
  onLocationSelect: (address: Address) => void;
  initialLocation?: Coordinates;
  className?: string;
}

export function MapPicker({ onLocationSelect, initialLocation, className }: MapPickerProps) {
  const [coordinates, setCoordinates] = useState<Coordinates>(
    initialLocation || { lat: 48.8566, lng: 2.3522 } // Paris par défaut
  );
  const [address, setAddress] = useState('');
  const [manualLat, setManualLat] = useState(coordinates.lat.toString());
  const [manualLng, setManualLng] = useState(coordinates.lng.toString());
  const [searchQuery, setSearchQuery] = useState('');
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null as any);

  useEffect(() => {
    loadGoogleMapsAndInitialize();

    // Cleanup function to properly dispose of Google Maps resources
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        // Clear all listeners
        google.maps.event?.clearInstanceListeners(mapInstanceRef.current);
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const loadGoogleMapsAndInitialize = async () => {
    try {
      if (!window.google) {
        await loadGoogleMapsScript();
      }
      initializeMap();
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      toast.error('Erreur lors du chargement de la carte');
    }
  };

  const loadGoogleMapsScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps'));
      document.head.appendChild(script);
    });
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: coordinates,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    const marker = new google.maps.Marker({
      position: coordinates,
      map: mapInstance,
      draggable: true,
    });

    mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        marker.setPosition({ lat, lng });
        setCoordinates({ lat, lng });
        setManualLat(lat.toString());
        setManualLng(lng.toString());
        reverseGeocode(lat, lng);
      }
    });

    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      if (position) {
        const lat = position.lat();
        const lng = position.lng();
        setCoordinates({ lat, lng });
        setManualLat(lat.toString());
        setManualLng(lng.toString());
        reverseGeocode(lat, lng);
      }
    });

    mapInstanceRef.current = mapInstance;
    markerRef.current = marker;
    setIsMapLoaded(true);
  };

  const parseGoogleAddress = (result: any): Address => {
    const components = result.address_components || [];
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
      id: `map-${Date.now()}`,
      label: result.formatted_address || `${street}, ${city}`,
      street: buildingNumber ? `${buildingNumber} ${street}` : street,
      buildingNumber,
      city: city || 'Ville inconnue',
      postalCode: postalCode || '',
      region,
      country: country || 'France',
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      placeId: result.place_id,
      formattedAddress: result.formatted_address,
      isVerified: true,
      manuallyEntered: false
    };
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!window.google) return;

    const geocoder = new google.maps.Geocoder();
    try {
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results[0]) {
        const result = response.results[0];
        const addressText = result.formatted_address;
        setAddress(addressText);
        
        const parsedAddress = parseGoogleAddress(result);
        onLocationSelect(parsedAddress);
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      // Fallback address
      const fallbackAddress: Address = {
        id: `coords-${Date.now()}`,
        label: `Position: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        street: `Coordonnées: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        city: 'Position GPS',
        postalCode: '',
        country: 'France',
        latitude: lat,
        longitude: lng,
        formattedAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        isVerified: false,
        manuallyEntered: true
      };
      setAddress(fallbackAddress.formattedAddress || '');
      onLocationSelect(fallbackAddress);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !window.google) return;
    
    const service = new google.maps.places.PlacesService(mapInstanceRef.current!);
    
    const request = {
      query: searchQuery,
      fields: ['place_id', 'formatted_address', 'geometry', 'address_components'],
    };

    service.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
        const result = results[0];
        const location = result.geometry?.location;
        if (location) {
          const lat = location.lat();
          const lng = location.lng();
          
          setCoordinates({ lat, lng });
          setManualLat(lat.toString());
          setManualLng(lng.toString());
          setAddress(result.formatted_address || '');
          
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setCenter({ lat, lng });
            markerRef.current.setPosition({ lat, lng });
          }
          
          const parsedAddress = parseGoogleAddress(result);
          onLocationSelect(parsedAddress);
          
          toast.success('Adresse trouvée!');
        }
      } else {
        toast.error('Adresse non trouvée');
      }
    });
  };

  const handleManualCoordinates = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Coordonnées invalides');
      return;
    }
    
    setCoordinates({ lat, lng });
    
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setCenter({ lat, lng });
      markerRef.current.setPosition({ lat, lng });
    }
    
    reverseGeocode(lat, lng);
    toast.success('Coordonnées mises à jour!');
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
        
        setCoordinates({ lat, lng });
        setManualLat(lat.toString());
        setManualLng(lng.toString());
        
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setCenter({ lat, lng });
          markerRef.current.setPosition({ lat, lng });
        }
        
        reverseGeocode(lat, lng);
        toast.success('Position actuelle obtenue!');
      },
      (error) => {
        toast.error('Impossible d\'obtenir la position');
      }
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="map">Carte</TabsTrigger>
          <TabsTrigger value="search">Recherche</TabsTrigger>
          <TabsTrigger value="coords">Coordonnées</TabsTrigger>
        </TabsList>
        
        <TabsContent value="map" className="space-y-4">
          <div className="flex justify-center space-x-2">
            <Button onClick={getCurrentLocation} variant="outline" size="sm">
              <Target className="mr-2 h-4 w-4" />
              Ma position
            </Button>
          </div>
          
          <div 
            ref={mapRef} 
            className="w-full h-96 rounded-lg border bg-muted flex items-center justify-center"
          >
            {!isMapLoaded && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-etaxi-yellow mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="search" className="space-y-4">
          <div className="space-y-2">
            <Label>Rechercher une adresse</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Entrez une adresse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="coords" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input
                type="number"
                step="any"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                placeholder="48.8566"
              />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input
                type="number"
                step="any"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                placeholder="2.3522"
              />
            </div>
          </div>

          <Button onClick={handleManualCoordinates} variant="outline" className="w-full">
            <Navigation className="mr-2 h-4 w-4" />
            Utiliser les coordonnées manuelles
          </Button>
        </TabsContent>
      </Tabs>

      {/* Adresse sélectionnée */}
      {address && (
        <div className="p-3 bg-muted rounded-lg">
          <Label className="text-sm font-medium">Adresse sélectionnée:</Label>
          <p className="text-sm text-muted-foreground mt-1">{address}</p>
          <p className="text-xs text-muted-foreground">
            {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}