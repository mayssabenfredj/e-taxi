import React, { useState } from 'react';
import { Input } from '@/shareds/components/ui/input';
import { Button } from '@/shareds/components/ui/button';
import { Search, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Address, AddressType } from '@/shareds/types/addresse';

interface GooglePlacesResult {
  place_id?: string; // Made optional to match PlaceResult
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
    let postalCode = '';

    components.forEach((component) => {
      const types = component.types;
      if (types.includes('street_number')) {
        buildingNumber = component.long_name;
      } else if (types.includes('route')) {
        street = component.long_name;
      } else if (types.includes('postal_code')) {
        postalCode = component.long_name;
      }
    });

    return {
      id: `google-${Date.now()}`,
      label: result.formatted_address,
      street: buildingNumber ? `${buildingNumber} ${street}`.trim() : street || null,
      buildingNumber: buildingNumber || null,
      complement: null,
      postalCode: postalCode || null,
      cityId: null,
      regionId: null,
      countryId: null,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      placeId: result.place_id || null,
      formattedAddress: result.formatted_address,
      isVerified: true,
      isExact: false,
      manuallyEntered: false,
      addressType: AddressType.CUSTOM,
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      city: null,
      region: null,
      country: null,
    };
  };

  const searchPlaces = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      if (!window.google) {
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
          setSearchResults(results.slice(0, 5).map(result => ({
            place_id: result.place_id,
            formatted_address: result.formatted_address,
            geometry: {
              location: {
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng()
              }
            },
            address_components: result.address_components
          })));
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
      script.onerror = () => reject(new Error('Échec du chargement de Google Maps'));
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
          className="flex-1 text-xs h-8"
        />
        <Button
          onClick={() => searchPlaces(searchQuery)}
          disabled={isSearching}
          size="sm"
          className="h-8"
        >
          <Search className="h-3 w-3" />
        </Button>
      </div>

      {isSearching && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-etaxi-yellow mx-auto"></div>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-y-auto bg-white border border-gray-200 rounded-md">
          {searchResults.map((result) => (
            <div
              key={result.place_id || result.formatted_address} // Fallback key
              onClick={() => handleSearchSelect(result)}
              className="p-2 hover:bg-muted rounded cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <MapPin className="h-3 w-3 text-etaxi-yellow flex-shrink-0" />
                <span className="text-xs truncate">{result.formatted_address}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}