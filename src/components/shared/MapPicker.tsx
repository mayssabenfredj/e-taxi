import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Search, Target } from 'lucide-react';
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

interface AutocompletePrediction {
  place_id: string;
  description: string;
}

export function MapPicker({ onLocationSelect, initialLocation, className }: MapPickerProps) {
  const [coordinates, setCoordinates] = useState<Coordinates>(
    initialLocation || { lat: 36.8065, lng: 10.1815 } // Tunis by default
  );
  const [address, setAddress] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    coordinates: Coordinates;
    placeId?: string;
  } | null>(null);
  const [manualCoords, setManualCoords] = useState({ lat: '', lng: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompletePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    if (scriptLoaded || window.google?.maps) {
      initializeMap();
      return;
    }

    const loadGoogleMaps = async () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBlMBSsjVaMcxb7yT78o8AOh8IbqvRm340&libraries=places,marker,geocoder&loading=async`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        const checkGoogleMapsLoaded = setInterval(() => {
          if (window.google?.maps?.Map) {
            clearInterval(checkGoogleMapsLoaded);
            setScriptLoaded(true);
            initializeMap();
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkGoogleMapsLoaded);
          if (!window.google?.maps?.Map) {
            toast.error('Timeout lors du chargement de Google Maps');
          }
        }, 10000);
      };

      script.onerror = () => {
        toast.error('Échec du chargement de l’API Google Maps. Vérifiez votre clé API.');
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();

    return () => {
      if (map) {
        google.maps.event.clearInstanceListeners(map);
      }
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [scriptLoaded]);

  // Initialize map
  const initializeMap = useCallback(() => {
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

    const markerInstance = new google.maps.Marker({
      position: coordinates,
      map: mapInstance,
      draggable: true,
    });

    // Initialize autocomplete for fallback
    if (autocompleteRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(autocompleteRef.current, {
        fields: ['formatted_address', 'geometry', 'place_id', 'address_components'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry?.location) return;

        const newCoords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        setCoordinates(newCoords);
        setManualCoords({ lat: newCoords.lat.toString(), lng: newCoords.lng.toString() });
        mapInstance.setCenter(newCoords);
        markerInstance.setPosition(newCoords);
        setAddress(place.formatted_address || '');
        setSearchQuery(place.formatted_address || '');
        setSuggestions([]);

        setSelectedLocation({
          address: place.formatted_address || '',
          coordinates: newCoords,
          placeId: place.place_id,
        });
      });
    }

    // Marker dragend event
    markerInstance.addListener('dragend', () => {
      const position = markerInstance.getPosition();
      if (!position) return;
      const newCoords = {
        lat: position.lat(),
        lng: position.lng(),
      };
      setCoordinates(newCoords);
      setManualCoords({ lat: newCoords.lat.toString(), lng: newCoords.lng.toString() });
      reverseGeocode(newCoords);
    });

    // Map click event
    mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      const newCoords = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };

      setCoordinates(newCoords);
      setManualCoords({ lat: newCoords.lat.toString(), lng: newCoords.lng.toString() });
      markerInstance.setPosition(newCoords);
      reverseGeocode(newCoords);
    });

    setMap(mapInstance);
    setMarker(markerInstance);
  }, [coordinates]);

  // Fetch autocomplete suggestions
  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);

    try {
      if (!window.google) {
        await loadGoogleMapsScript();
      }

      const service = new google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        { input: query },
        (predictions, status) => {
          setIsSearching(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions.slice(0, 5));
          } else {
            setSuggestions([]);
          }
        }
      );
    } catch (error) {
      setIsSearching(false);
      toast.error('Erreur lors de la recherche d’adresses');
    }
  };

  // Select a suggestion
  const handleSuggestionSelect = async (prediction: AutocompletePrediction) => {
    try {
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      service.getDetails(
        { placeId: prediction.place_id, fields: ['formatted_address', 'geometry', 'place_id'] },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry?.location) {
            const newCoords = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };

            setCoordinates(newCoords);
            setManualCoords({ lat: newCoords.lat.toString(), lng: newCoords.lng.toString() });
            if (map) {
              map.setCenter(newCoords);
            }
            if (marker) {
              marker.setPosition(newCoords);
            }
            setAddress(place.formatted_address || '');
            setSearchQuery(place.formatted_address || '');
            setSuggestions([]);

            setSelectedLocation({
              address: place.formatted_address || '',
              coordinates: newCoords,
              placeId: place.place_id,
            });
          } else {
            toast.error('Impossible de récupérer les détails de l’adresse');
          }
        }
      );
    } catch (error) {
      toast.error('Erreur lors de la sélection de l’adresse');
    }
  };

  const loadGoogleMapsScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBlMBSsjVaMcxb7yT78o8AOh8IbqvRm340&libraries=places,marker,geocoder`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Échec du chargement de Google Maps'));
      document.head.appendChild(script);
    });
  };

  // Reverse geocode coordinates
  const reverseGeocode = async (coords: Coordinates) => {
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location: coords });

      if (response.results[0]) {
        const formattedAddress = response.results[0].formatted_address;
        setAddress(formattedAddress);
        setSearchQuery(formattedAddress);

        setSelectedLocation({
          address: formattedAddress,
          coordinates: coords,
          placeId: response.results[0].place_id,
        });
      }
    } catch (error) {
      toast.error('Erreur lors de la récupération de l’adresse');
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Géolocalisation non supportée');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setCoordinates(newCoords);
        setManualCoords({ lat: newCoords.lat.toString(), lng: newCoords.lng.toString() });
        if (map) {
          map.setCenter(newCoords);
          map.setZoom(15);
        }
        if (marker) {
          marker.setPosition(newCoords);
        }
        reverseGeocode(newCoords);
        toast.success('Position actuelle obtenue !');
      },
      (error) => {
        toast.error('Impossible d’obtenir la position');
      }
    );
  };

  // Handle manual coordinate input
  const handleManualCoordsChange = (type: 'lat' | 'lng', value: string) => {
    setManualCoords((prev) => ({ ...prev, [type]: value }));

    const lat = type === 'lat' ? parseFloat(value) : coordinates.lat;
    const lng = type === 'lng' ? parseFloat(value) : coordinates.lng;

    if (isNaN(lat) || isNaN(lng)) return;

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error('Coordonnées hors limites');
      return;
    }

    const newCoords = { lat, lng };
    setCoordinates(newCoords);
    if (map) {
      map.setCenter(newCoords);
    }
    if (marker) {
      marker.setPosition(newCoords);
    }
    reverseGeocode(newCoords);
  };

  // Handle location confirmation
  const handleConfirmLocation = () => {
    if (!selectedLocation) {
      toast.error('Aucune adresse sélectionnée');
      return;
    }
    onLocationSelect(selectedLocation);
    toast.success('Adresse confirmée');
  };

  return (
    <div className={`space-y-2 ${className}`}>
  <div className="space-y-2 p-2">
    <div className="space-y-1">
      <Label className="text-xs">Rechercher une adresse</Label>
      <div className="relative flex space-x-1">
        <Input
          ref={autocompleteRef}
          placeholder="Entrez une adresse..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            fetchSuggestions(e.target.value);
          }}
          className="flex-1 text-xs h-8"
        />
      </div>
      {isSearching && (
        <div className="text-center py-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-etaxi-yellow mx-auto"></div>
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-y-auto bg-white border border-gray-200 rounded-md">
          {suggestions.map((prediction) => (
            <div
              key={prediction.place_id}
              onClick={() => handleSuggestionSelect(prediction)}
              className="p-2 hover:bg-muted rounded cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <MapPin className="h-3 w-3 text-etaxi-yellow flex-shrink-0" />
                <span className="text-xs truncate">{prediction.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="space-y-1">
      <Label className="text-xs">Coordonnées</Label>
      <div className="grid grid-cols-2 gap-1">
        <Input
          type="number"
          step="any"
          placeholder="Latitude"
          value={manualCoords.lat}
          onChange={(e) => handleManualCoordsChange('lat', e.target.value)}
          className="text-xs h-8"
        />
        <Input
          type="number"
          step="any"
          placeholder="Longitude"
          value={manualCoords.lng}
          onChange={(e) => handleManualCoordsChange('lng', e.target.value)}
          className="text-xs h-8"
        />
      </div>
    </div>

    <div className="space-y-1">
      <Label className="text-xs">Cliquez sur la carte pour sélectionner</Label>
      <div
        ref={mapRef}
        className="w-full h-[150px] rounded-lg overflow-hidden border border-gray-200"
      />
    </div>

    <Button
      onClick={getCurrentLocation}
      variant="outline"
      className="w-full text-xs h-8"
    >
      <Target className="mr-1 h-3 w-3" />
      Utiliser ma position
    </Button>

    {address && (
      <div className="p-2 bg-muted rounded-lg">
        <Label className="text-xs font-medium">Adresse sélectionnée :</Label>
        <p className="text-xs text-muted-foreground mt-1 truncate">{address}</p>
        <p className="text-xs text-muted-foreground">
          {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
        </p>
      </div>
    )}

    <Button
      onClick={handleConfirmLocation}
      className="w-full bg-etaxi-yellow hover:bg-yellow-500 text-black text-xs h-8"
      disabled={!selectedLocation}
    >
      Confirmer l’adresse
    </Button>
  </div>
</div>
  );
}