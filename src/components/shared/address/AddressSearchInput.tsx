import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';
import { toast } from 'sonner';

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

interface AddressSearchInputProps {
  onSelect: (address: Address) => void;
}

export function AddressSearchInput({ onSelect }: AddressSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GooglePlacesResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const parseGoogleAddress = (result: GooglePlacesResult): Address => {
    const components = result.address_components;
    let street = '';
    let buildingNumber = '';
    let city = '';
    let postalCode = '';
    let region = '';
    let country = '';

    components.forEach((component) => {
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
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      placeId: result.place_id,
      formattedAddress: result.formatted_address,
      isVerified: true,
      manuallyEntered: false
    };
  };

  const searchPlaces = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    
    try {
      if (!window.google) {
        // Load Google Maps script if not already loaded
        await loadGoogleMapsScript();
      }

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
          toast.error('Aucun résultat trouvé');
        }
      });
    } catch (error) {
      setIsSearching(false);
      toast.error('Erreur lors de la recherche');
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

  const handleSearchSelect = (result: GooglePlacesResult) => {
    const address = parseGoogleAddress(result);
    onSelect(address);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="space-y-2">
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
    </div>
  );
}