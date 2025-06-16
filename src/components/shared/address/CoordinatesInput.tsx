import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';
import { toast } from 'sonner';
import { Address, AddressType, City, Region, Country } from '@/types/addresse';

interface CoordinatesInputProps {
  onSubmit: (address: Address) => void;
}

export function CoordinatesInput({ onSubmit }: CoordinatesInputProps) {
  const [coordinates, setCoordinates] = useState({
    latitude: '',
    longitude: '',
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

    const address: Address = {
      id: `coords-${Date.now()}`,
      label: `Coordonnées: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      street: null, // No specific street from coordinates
      buildingNumber: null,
      complement: null,
      postalCode: null, // No postal code from coordinates
      cityId: null, // No city ID available
      regionId: null,
      countryId: null, // No country ID available
      latitude: lat,
      longitude: lng,
      placeId: null,
      formattedAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      isVerified: false,
      isExact: true, // Coordinates are exact
      manuallyEntered: true,
      addressType: AddressType.CUSTOM,
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      city: null, // No City object available
      region: null,
      country: null, // No Country object available
    };

    onSubmit(address);
    setCoordinates({ latitude: '', longitude: '' });
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

        setCoordinates({
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
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          step="any"
          placeholder="Latitude"
          value={coordinates.latitude}
          onChange={(e) => setCoordinates({ ...coordinates, latitude: e.target.value })}
          className="text-sm"
        />
        <Input
          type="number"
          step="any"
          placeholder="Longitude"
          value={coordinates.longitude}
          onChange={(e) => setCoordinates({ ...coordinates, longitude: e.target.value })}
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
        onClick={handleSubmit}
        className="w-full bg-etaxi-yellow hover:bg-yellow-500 text-black text-sm"
        size="sm"
        disabled={!coordinates.latitude || !coordinates.longitude}
      >
        Utiliser ces coordonnées
      </Button>
    </div>
  );
}