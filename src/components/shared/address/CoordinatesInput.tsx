import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';
import { toast } from 'sonner';
import { Address, AddressType } from '@/types/addresse';

interface CoordinatesInputProps {
  onSubmit: (address: Address) => void;
}

export function CoordinatesInput({ onSubmit }: CoordinatesInputProps) {
  const [coordinates, setCoordinates] = useState({
    latitude: '',
    longitude: '',
    manualAddress: '',
  });

  const handleSubmit = () => {
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

    if (!coordinates.manualAddress.trim()) {
      toast.error('Adresse manuelle requise');
      return;
    }

    const address: Address = {
      id: `coords-${Date.now()}`,
      label: coordinates.manualAddress,
      street: coordinates.manualAddress,
      buildingNumber: null,
      complement: null,
      postalCode: null,
      cityId: null,
      regionId: null,
      countryId: null,
      latitude: lat,
      longitude: lng,
      placeId: null,
      formattedAddress: coordinates.manualAddress,
      isVerified: false,
      isExact: true,
      manuallyEntered: true,
      addressType: AddressType.CUSTOM,
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      city: null,
      region: null,
      country: null,
    };

    onSubmit(address);
    setCoordinates({ latitude: '', longitude: '', manualAddress: '' });
    toast.success('Position GPS et adresse ajoutées');
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

        setCoordinates({
          ...coordinates,
          latitude: lat.toString(),
          longitude: lng.toString(),
        });

        toast.success('Position actuelle obtenue !');
      },
      (error) => {
        toast.error('Impossible d’obtenir la position');
      }
    );
  };

  return (
    <div className="space-y-3">
      <Input
        type="text"
        placeholder="Adresse manuelle (ex: 123 Rue Principale, Paris)"
        value={coordinates.manualAddress}
        onChange={(e) => setCoordinates({ ...coordinates, manualAddress: e.target.value })}
        className="text-sm"
        required
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          step="any"
          placeholder="Latitude"
          value={coordinates.latitude}
          onChange={(e) => setCoordinates({ ...coordinates, latitude: e.target.value })}
          className="text-sm"
          required
        />
        <Input
          type="number"
          step="any"
          placeholder="Longitude"
          value={coordinates.longitude}
          onChange={(e) => setCoordinates({ ...coordinates, longitude: e.target.value })}
          className="text-sm"
          required
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
        onClick={handleSubmit}
        className="w-full bg-etaxi-yellow hover:bg-yellow-500 text-black text-sm"
        size="sm"
        disabled={!coordinates.latitude || !coordinates.longitude || !coordinates.manualAddress.trim()}
      >
        Utiliser ces coordonnées et adresse
      </Button>
    </div>
  );
}