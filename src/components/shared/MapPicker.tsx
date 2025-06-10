import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Search, Target, Navigation } from 'lucide-react';
import { toast } from 'sonner';

interface Coordinates {
  lat: number;
  lng: number;
}

interface Address {
  address: string;
  coordinates: Coordinates;
  placeId?: string;
}

interface MapPickerProps {
  onLocationSelect: (location: Address) => void;
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

  // Map simulation
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
    const simulatedAddress = generateSimulatedAddress(newLat, newLng);
    setAddress(simulatedAddress);
    
    onLocationSelect({
      address: simulatedAddress,
      coordinates: newCoords,
      placeId: `place_${Date.now()}`
    });
  };

  const generateSimulatedAddress = (lat: number, lng: number) => {
    // Générer une adresse simulée basée sur les coordonnées
    const streetNumbers = ['123', '45', '67', '89', '12', '34'];
    const streetNames = ['Rue de la Paix', 'Avenue des Champs-Élysées', 'Boulevard Saint-Germain', 
                        'Rue de Rivoli', 'Avenue Montaigne', 'Rue du Faubourg Saint-Honoré'];
    const cities = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille', 'Strasbourg'];
    const postalCodes = ['75001', '75008', '75016', '69001', '13001', '33000'];
    
    // Utiliser les coordonnées pour sélectionner des éléments de manière déterministe
    const streetIndex = Math.abs(Math.floor(lng * 10)) % streetNames.length;
    const numberIndex = Math.abs(Math.floor(lat * 10)) % streetNumbers.length;
    const cityIndex = Math.abs(Math.floor((lat + lng) * 10)) % cities.length;
    
    return `${streetNumbers[numberIndex]} ${streetNames[streetIndex]}, ${postalCodes[cityIndex]} ${cities[cityIndex]}, France`;
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    // Simulation de recherche d'adresse
    const simulatedLat = 48.8566 + (Math.random() - 0.5) * 0.1;
    const simulatedLng = 2.3522 + (Math.random() - 0.5) * 0.1;
    
    setCoordinates({ lat: simulatedLat, lng: simulatedLng });
    setManualLat(simulatedLat.toFixed(6));
    setManualLng(simulatedLng.toFixed(6));
    setAddress(searchQuery);
    
    onLocationSelect({
      address: searchQuery,
      coordinates: { lat: simulatedLat, lng: simulatedLng },
      placeId: `search_${Date.now()}`
    });
    
    toast.success('Adresse trouvée!');
  };

  const handleManualAddressSubmit = () => {
    if (!manualAddress.street || !manualAddress.city || !manualAddress.postalCode) {
      toast.error('Veuillez remplir au moins la rue, la ville et le code postal');
      return;
    }
    
    // Simulation de coordonnées pour l'adresse manuelle
    const simulatedLat = 48.8566 + (Math.random() - 0.5) * 0.1;
    const simulatedLng = 2.3522 + (Math.random() - 0.5) * 0.1;
    
    const formattedAddress = `${manualAddress.buildingNumber} ${manualAddress.street}, ${manualAddress.postalCode} ${manualAddress.city}, ${manualAddress.country}`;
    
    setCoordinates({ lat: simulatedLat, lng: simulatedLng });
    setManualLat(simulatedLat.toFixed(6));
    setManualLng(simulatedLng.toFixed(6));
    setAddress(formattedAddress);
    
    onLocationSelect({
      address: formattedAddress,
      coordinates: { lat: simulatedLat, lng: simulatedLng },
      placeId: `manual_${Date.now()}`
    });
    
    toast.success('Adresse manuelle ajoutée');
  };

  const handleManualCoordinates = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Coordonnées invalides');
      return;
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error('Coordonnées hors limites');
      return;
    }
    
    const newCoords = { lat, lng };
    setCoordinates(newCoords);
    
    const simulatedAddress = generateSimulatedAddress(lat, lng);
    setAddress(simulatedAddress);
    
    onLocationSelect({
      address: simulatedAddress,
      coordinates: newCoords,
      placeId: `coords_${Date.now()}`
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
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setCoordinates({ lat, lng });
        setManualLat(lat.toFixed(6));
        setManualLng(lng.toFixed(6));
        
        const simulatedAddress = generateSimulatedAddress(lat, lng);
        setAddress(simulatedAddress);
        
        onLocationSelect({
          address: simulatedAddress,
          coordinates: { lat, lng },
          placeId: `geolocation_${Date.now()}`
        });
        
        toast.success('Position actuelle obtenue!');
      },
      (error) => {
        toast.error('Impossible d\'obtenir la position');
      }
    );
  };

  return (
    <div className={`space-y-4 mx-auto max-w-3xl ${className}`}>
      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="map">Carte</TabsTrigger>
          <TabsTrigger value="search">Recherche</TabsTrigger>
          <TabsTrigger value="manual">Adresse</TabsTrigger>
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
            onClick={handleMapClick}
            className="w-full h-64 md:h-96 bg-gradient-to-br from-green-100 to-blue-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-crosshair relative overflow-hidden"
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
        
        <TabsContent value="manual" className="space-y-3">
          <div className="space-y-2">
            <Label>Adresse complète</Label>
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
          </div>
          
          <Button 
            onClick={handleManualAddressSubmit}
            className="w-full bg-etaxi-yellow hover:bg-yellow-500 text-black text-sm"
            size="sm"
          >
            Utiliser cette adresse
          </Button>
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

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={getCurrentLocation} variant="outline" className="flex-1">
              <Target className="mr-2 h-4 w-4" />
              Ma position actuelle
            </Button>
            
            <Button onClick={handleManualCoordinates} variant="outline" className="flex-1">
              <Navigation className="mr-2 h-4 w-4" />
              Utiliser ces coordonnées
            </Button>
          </div>
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