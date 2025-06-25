import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, Target } from 'lucide-react';
import { toast } from 'sonner';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Input } from '../ui/input';

interface Coordinates {
  lat: number;
  lng: number;
}

interface MapPickerProps {
  onLocationSelect: (location: {
    address: string;
    coordinates: Coordinates;
    placeId?: string;
    postalCode?: string;
    city?: string;
    region?: string;
  }) => void;
  initialLocation?: Coordinates;
  className?: string;
  initialAddress?: any;
}

interface AutocompletePrediction {
  place_id: string;
  description: string;
}

export function MapPicker({ onLocationSelect, initialLocation, className, initialAddress }: MapPickerProps) {
  const { isGoogleMapsLoaded } = useGoogleMaps();
  const [coordinates, setCoordinates] = useState<Coordinates>(
    initialLocation || { lat: 36.8065, lng: 10.1815 } // Centre par défaut : Tunis, Tunisie
  );
  const [address, setAddress] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    coordinates: Coordinates;
    placeId?: string;
    postalCode?: string;
    city?: string;
    region?: string;
  } | null>(null);
  const [manualCoords, setManualCoords] = useState({ lat: '', lng: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompletePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);

  useEffect(() => {
    if (!isGoogleMapsLoaded) {
      toast.error('API Google Maps non chargée');
      return;
    }
    initializeMap();
  }, [isGoogleMapsLoaded]);

  useEffect(() => {
    if (initialAddress) {
      if (initialAddress.latitude && initialAddress.longitude) {
        setCoordinates({ lat: initialAddress.latitude, lng: initialAddress.longitude });
        setManualCoords({ lat: initialAddress.latitude.toString(), lng: initialAddress.longitude.toString() });
      }
      if (initialAddress.formattedAddress) {
        setAddress(initialAddress.formattedAddress);
        setSearchQuery(initialAddress.formattedAddress);
      }
      setSelectedLocation({
        address: initialAddress.formattedAddress || initialAddress.label || '',
        coordinates: {
          lat: initialAddress.latitude || 36.8065,
          lng: initialAddress.longitude || 10.1815,
        },
        placeId: initialAddress.placeId,
      });
    }
  }, [initialAddress]);

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

    const markerInstance = new google.maps.marker.AdvancedMarkerElement({
      position: coordinates,
      map: mapInstance,
      gmpDraggable: true,
    });

    markerInstance.addListener('dragend', (event) => {
      const position = markerInstance.position;
      if (!position) return;

      let lat: number, lng: number;

      if (typeof (position as google.maps.LatLng).lat === 'function') {
        lat = (position as google.maps.LatLng).lat();
        lng = (position as google.maps.LatLng).lng();
      } else {
        lat = (position as google.maps.LatLngLiteral).lat;
        lng = (position as google.maps.LatLngLiteral).lng;
      }

      const newCoords = { lat, lng };
      setCoordinates(newCoords);
      setManualCoords({ lat: lat.toString(), lng: lng.toString() });
      reverseGeocode(newCoords);
    });

    mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      const newCoords = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };

      setCoordinates(newCoords);
      setManualCoords({ lat: newCoords.lat.toString(), lng: newCoords.lng.toString() });
      markerInstance.position = new google.maps.LatLng(newCoords.lat, newCoords.lng);
      reverseGeocode(newCoords);
    });

    setMap(mapInstance);
    setMarker(markerInstance);
  }, [coordinates, isGoogleMapsLoaded]);

  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);

    try {
      if (!isGoogleMapsLoaded) {
        toast.error('API Google Maps non chargée');
        return;
      }

      const service = new google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        { input: query, componentRestrictions: { country: 'TN' } },
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
      toast.error("Erreur lors de la recherche d'adresses");
    }
  };

  const parseAddressComponents = (components: any[]): { postalCode?: string; city?: string; region?: string } => {
    let postalCode = '';
    let city = '';
    let region = '';
    components.forEach((component) => {
      if (component.types.includes('postal_code')) {
        postalCode = component.long_name;
      } else if (component.types.includes('locality')) {
        city = component.long_name;
      } else if (component.types.includes('administrative_area_level_1')) {
        region = component.long_name;
      }
    });
    return { postalCode, city, region };
  };

  const handleSuggestionSelect = async (prediction: AutocompletePrediction) => {
    try {
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      service.getDetails(
        { placeId: prediction.place_id, fields: ['formatted_address', 'geometry', 'place_id', 'address_component', 'address_components'] },
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
              marker.position = new google.maps.LatLng(newCoords.lat, newCoords.lng);
            }
            setAddress(place.formatted_address || '');
            setSearchQuery(place.formatted_address || '');
            setSuggestions([]);
            const { postalCode, city, region } = parseAddressComponents(place.address_components || []);
            setSelectedLocation({
              address: place.formatted_address || '',
              coordinates: newCoords,
              placeId: place.place_id,
              postalCode,
              city,
              region,
            });
          } else {
            toast.error("Impossible de récupérer les détails de l'adresse");
          }
        }
      );
    } catch (error) {
      toast.error("Erreur lors de la sélection de l'adresse");
    }
  };

  const reverseGeocode = async (coords: Coordinates) => {
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({
        location: coords,
        region: 'TN', // Restreindre le géocodage à la Tunisie
      });
      if (response.results[0]) {
        const formattedAddress = response.results[0].formatted_address;
        setAddress(formattedAddress);
        setSearchQuery(formattedAddress);
        const { postalCode, city, region } = parseAddressComponents(response.results[0].address_components || []);
        setSelectedLocation({
          address: formattedAddress,
          coordinates: coords,
          placeId: response.results[0].place_id,
          postalCode,
          city,
          region,
        });
      }
    } catch (error) {
      toast.error("Erreur lors de la récupération de l'adresse");
    }
  };

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
          marker.position = new google.maps.LatLng(newCoords.lat, newCoords.lng);
        }
        reverseGeocode(newCoords);
        toast.success('Position actuelle obtenue !');
      },
      (error) => {
        toast.error("Impossible d'obtenir la position");
      }
    );
  };

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
      marker.position = new google.maps.LatLng(newCoords.lat, newCoords.lng);
    }
    reverseGeocode(newCoords);
  };

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
        <Label className="text-xs">Rechercher une adresse</Label>
        <div className="relative flex space-x-1">
          <Input
            ref={autocompleteRef}
            placeholder="Entrez une adresse en Tunisie..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              fetchSuggestions(e.target.value);
            }}
            className="flex-1 text-xs h-8"
            disabled={!isGoogleMapsLoaded}
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
              disabled={!isGoogleMapsLoaded}
            />
            <Input
              type="number"
              step="any"
              placeholder="Longitude"
              value={manualCoords.lng}
              onChange={(e) => handleManualCoordsChange('lng', e.target.value)}
              className="text-xs h-8"
              disabled={!isGoogleMapsLoaded}
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
          disabled={!isGoogleMapsLoaded}
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
          disabled={!selectedLocation || !isGoogleMapsLoaded}
        >
          Confirmer l'adresse
        </Button>
      </div>
    </div>
  );
}