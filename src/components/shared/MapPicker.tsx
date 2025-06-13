import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Search, Target, Navigation } from 'lucide-react';
import { toast } from 'sonner';

interface Coordinates {
  lat: number;
  lng: number;
}

interface MapPickerProps {
  onLocationSelect: (location: {
    address: string;
    coordinates: Coordinates;
    placeId?: string;
  }) => void;
  initialLocation?: Coordinates;
  className?: string;
}

export function MapPicker({ onLocationSelect, initialLocation, className }: MapPickerProps) {
  const [coordinates, setCoordinates] = useState<Coordinates>(
    initialLocation || { lat: 48.8566, lng: 2.3522 } // Paris by default
  );
  const [address, setAddress] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (scriptLoaded || window.google?.maps) {
      initializeMap();
      return;
    }

    const loadGoogleMaps = async () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBlMBSsjVaMcxb7yT78o8AOh8IbqvRm340&libraries=places,marker&loading=async`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // Attendre que l'API soit complètement chargée
        const checkGoogleMapsLoaded = setInterval(() => {
          if (window.google?.maps?.Map) {
            clearInterval(checkGoogleMapsLoaded);
            setScriptLoaded(true);
            initializeMap();
          }
        }, 100);

        // Timeout de sécurité après 10 secondes
        setTimeout(() => {
          clearInterval(checkGoogleMapsLoaded);
          if (!window.google?.maps?.Map) {
            toast.error('Timeout lors du chargement de Google Maps');
          }
        }, 10000);
      };

      script.onerror = () => {
        toast.error('Failed to load Google Maps API. Please check your API key.');
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();

    return () => {
      if (map) {
        google.maps.event.clearInstanceListeners(map);
      }
      if (marker) {
        marker.map = null;
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.google?.maps?.Map) {
      console.error('Google Maps API not loaded or map container not found');
      return;
    }

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: coordinates,
      zoom: 15,
      mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    const markerInstance = new google.maps.marker.AdvancedMarkerElement({
      position: coordinates,
      map: mapInstance,
      gmpDraggable: true,
    });

    if (autocompleteRef.current) {
      const autocompleteInstance = document.createElement('gmp-place-autocomplete');
      autocompleteRef.current.appendChild(autocompleteInstance);

      autocompleteInstance.addEventListener('gmp-place-changed', () => {
        const place = (autocompleteInstance as any).place;
        if (!place?.geometry?.location) return;

        const newCoords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        setCoordinates(newCoords);
        mapInstance.setCenter(newCoords);
        markerInstance.position = newCoords;
        setAddress(place.formatted_address || '');

        onLocationSelect({
          address: place.formatted_address || '',
          coordinates: newCoords,
          placeId: place.place_id,
        });
      });
    }

    markerInstance.addListener('dragend', () => {
      const position = markerInstance.position;
      if (!position) return;

      const newCoords = {
        lat: typeof position.lat === 'function' ? position.lat() : position.lat,
        lng: typeof position.lng === 'function' ? position.lng() : position.lng,
      };

      setCoordinates(newCoords);
      reverseGeocode(newCoords);
    });

    mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      const newCoords = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };

      setCoordinates(newCoords);
      markerInstance.position = newCoords;
      reverseGeocode(newCoords);
    });

    setMap(mapInstance);
    setMarker(markerInstance);
  };

  const reverseGeocode = async (coords: Coordinates) => {
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location: coords });

      if (response.results[0]) {
        const formattedAddress = response.results[0].formatted_address;
        setAddress(formattedAddress);

        onLocationSelect({
          address: formattedAddress,
          coordinates: coords,
          placeId: response.results[0].place_id,
        });
      }
    } catch (error) {
      toast.error('Error getting address');
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setCoordinates(newCoords);
        if (map) {
          map.setCenter(newCoords);
          map.setZoom(15);
        }
        if (marker) {
          marker.position = newCoords;
        }
        reverseGeocode(newCoords);
        toast.success('Current location obtained!');
      },
      (error) => {
        toast.error('Unable to get location');
      }
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Tabs defaultValue="carte" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="carte">Map</TabsTrigger>
          <TabsTrigger value="adresse">Address</TabsTrigger>
        </TabsList>

        <TabsContent value="carte" className="space-y-4">
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4 p-2">
              <div className="space-y-2">
                <Label>Search address</Label>
                <div className="flex space-x-2">
                  <div ref={autocompleteRef} className="flex-1" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Click on the map to select</Label>
                <div
                  ref={mapRef}
                  className="w-full h-[400px] rounded-lg overflow-hidden"
                />
              </div>

              <Button onClick={getCurrentLocation} variant="outline" className="w-full">
                <Target className="mr-2 h-4 w-4" />
                Use my location
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="adresse" className="space-y-4">
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4 p-2">
              <div className="space-y-2">
                <Label>Adresse complète</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="N° bâtiment" className="text-sm" />
                  <Input placeholder="Rue *" className="text-sm" />
                </div>
                <Input placeholder="Complément d'adresse" className="text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Code postal *" className="text-sm" />
                  <Input placeholder="Ville *" className="text-sm" />
                </div>
                <Button
                  className="w-full bg-etaxi-yellow hover:bg-yellow-500 text-black text-sm mt-2"
                  size="sm"
                >
                  Utiliser cette adresse
                </Button>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {address && (
        <div className="p-3 bg-muted rounded-lg">
          <Label className="text-sm font-medium">Selected address:</Label>
          <p className="text-sm text-muted-foreground mt-1">{address}</p>
          <p className="text-xs text-muted-foreground">
            {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}