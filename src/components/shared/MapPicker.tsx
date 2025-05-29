
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
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

export function MapPicker({ onLocationSelect, initialLocation, className }: MapPickerProps) {
  const [coordinates, setCoordinates] = useState<Coordinates>(
    initialLocation || { lat: 48.8566, lng: 2.3522 } // Paris par défaut
  );
  const [address, setAddress] = useState('');
  const [manualLat, setManualLat] = useState(coordinates.lat.toString());
  const [manualLng, setManualLng] = useState(coordinates.lng.toString());
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);

  // Simulation d'une carte interactive
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Simulation de coordonnées basées sur la position du clic
    const newLat = coordinates.lat + (0.01 * ((rect.height / 2 - y) / rect.height));
    const newLng = coordinates.lng + (0.01 * ((x - rect.width / 2) / rect.width));
    
    const newCoords = { lat: newLat, lng: newLng };
    setCoordinates(newCoords);
    setManualLat(newLat.toFixed(6));
    setManualLng(newLng.toFixed(6));
    
    // Simulation d'une adresse
    const simulatedAddress = `${Math.floor(Math.random() * 999)} Rue de la Paix, Paris, France`;
    setAddress(simulatedAddress);
    
    onLocationSelect({
      address: simulatedAddress,
      coordinates: newCoords,
      placeId: `place_${Date.now()}`
    });
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    // Simulation de recherche d'adresse
    const simulatedCoords = {
      lat: 48.8566 + (Math.random() - 0.5) * 0.1,
      lng: 2.3522 + (Math.random() - 0.5) * 0.1
    };
    
    setCoordinates(simulatedCoords);
    setManualLat(simulatedCoords.lat.toFixed(6));
    setManualLng(simulatedCoords.lng.toFixed(6));
    setAddress(searchQuery);
    
    onLocationSelect({
      address: searchQuery,
      coordinates: simulatedCoords,
      placeId: `search_${Date.now()}`
    });
    
    toast.success('Adresse trouvée!');
  };

  const handleManualCoordinates = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Coordonnées invalides');
      return;
    }
    
    const newCoords = { lat, lng };
    setCoordinates(newCoords);
    
    const simulatedAddress = `Coordonnées: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    setAddress(simulatedAddress);
    
    onLocationSelect({
      address: simulatedAddress,
      coordinates: newCoords
    });
    
    toast.success('Coordonnées mises à jour!');
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
          lng: position.coords.longitude
        };
        
        setCoordinates(newCoords);
        setManualLat(newCoords.lat.toFixed(6));
        setManualLng(newCoords.lng.toFixed(6));
        
        const simulatedAddress = 'Ma position actuelle';
        setAddress(simulatedAddress);
        
        onLocationSelect({
          address: simulatedAddress,
          coordinates: newCoords
        });
        
        toast.success('Position actuelle obtenue!');
      },
      (error) => {
        toast.error('Impossible d\'obtenir la position');
      }
    );
  };

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        {/* Recherche d'adresse */}
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
            <Button onClick={getCurrentLocation} variant="outline">
              <Target className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Carte simulée */}
        <div className="space-y-2">
          <Label>Cliquez sur la carte pour sélectionner</Label>
          <div
            ref={mapRef}
            onClick={handleMapClick}
            className="w-full h-64 bg-gradient-to-br from-green-100 to-blue-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-crosshair relative overflow-hidden"
          >
            {/* Simulation d'une carte */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-4 w-8 h-8 bg-blue-500 rounded-full"></div>
              <div className="absolute top-12 right-8 w-6 h-6 bg-green-500 rounded-full"></div>
              <div className="absolute bottom-8 left-8 w-4 h-4 bg-red-500 rounded-full"></div>
              <div className="absolute bottom-4 right-4 w-10 h-10 bg-yellow-500 rounded-full"></div>
            </div>
            
            {/* Marqueur de position */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <MapPin className="h-8 w-8 text-red-500 drop-shadow-lg" />
            </div>
            
            <div className="text-center text-gray-600">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Carte interactive</p>
              <p className="text-sm">Cliquez pour sélectionner une position</p>
            </div>
          </div>
        </div>

        {/* Coordonnées manuelles */}
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
          Utiliser les coordonnées manuelles
        </Button>

        {/* Adresse sélectionnée */}
        {address && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium">Adresse sélectionnée:</Label>
            <p className="text-sm text-gray-700">{address}</p>
            <p className="text-xs text-gray-500">
              {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
