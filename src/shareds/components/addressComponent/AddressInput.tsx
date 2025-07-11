import React, { useState, useEffect } from 'react';
import { Button } from '@/shareds/components/ui/button';
import { Label } from '@/shareds/components/ui/label';

import { Address, AddressType, City, Region, Country, AddressDto } from '@/shareds/types/addresse';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shareds/components/ui/tabs';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shareds/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shareds/components/ui/dialog';
import { Check, ChevronsUpDown, MapPin, Map } from 'lucide-react';
import { cn } from '@/shareds/lib/utils';
import { SavedAddressSelector } from './address/SavedAddressSelector';
import { CoordinatesInput } from './address/CoordinatesInput';
import { MapPicker } from './MapPicker';
import { ManualAddressForm } from './address/ManualAddressForm';

interface AddressInputProps {
  label: string;
  value?: Address | AddressDto | null;
  onChange: (address: Address | AddressDto | null) => void;
  savedAddresses?: Address[];
  required?: boolean;
  showMapPicker?: boolean;
  showSavedAddresses?: boolean; // New prop
}

export function AddressInput({
  label,
  value,
  onChange,
  savedAddresses = [],
  required = false,
  showMapPicker = true,
  showSavedAddresses = false, // Default to false
}: AddressInputProps) {
  const [open, setOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(showSavedAddresses ? 'saved' : 'manual');
  const [selectedAddress, setSelectedAddress] = useState<Address | AddressDto | null>(value || null);

  // Synchronise l'adresse sélectionnée avec la prop value
  useEffect(() => {
    if (value && value !== selectedAddress) {
      setSelectedAddress(value);
    }
  }, [value]);

  // Callback général pour toute sélection d'adresse
  const handleAddressSelect = (address: Address | AddressDto) => {
    setSelectedAddress(address);
    onChange(address);
    setOpen(false);
  };

  // Pour la Map
  const handleMapSelect = (mapData: { address: string; coordinates: { lat: number; lng: number }; placeId?: string; postalCode?: string; city?: string; region?: string }) => {
    const address: Address = {
      id: `map-${Date.now()}`,
      label: mapData.address,
      street: mapData.address.split(',')[0]?.trim() || '',
      postalCode: mapData.postalCode || '',
      cityId: null,
      regionId: null,
      countryId: null, // Tunisie par défaut
      latitude: mapData.coordinates.lat,
      longitude: mapData.coordinates.lng,
      placeId: mapData.placeId || null,
      formattedAddress: mapData.address,
      isVerified: false,
      isExact: false,
      manuallyEntered: true,
      addressType: AddressType.CUSTOM,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      city: null,
      region: null,
      country: null,
    };
    console.log("adress Selectedd : ", address);
    handleAddressSelect(address);
    setMapOpen(false);
  };

  return (
    <div className="space-y-2 w-full max-w-full">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className="flex flex-col sm:flex-row gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="flex-1 justify-between min-h-[40px] text-left text-sm"
            >
              {selectedAddress ? (
                <div className="flex items-center truncate">
                  <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{selectedAddress.label || selectedAddress.formattedAddress || 'Aucune adresse'}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Sélectionner une adresse...</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 max-w-lg" align="start">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className={`grid w-full ${showSavedAddresses ? 'grid-cols-4' : 'grid-cols-3'} text-xs`}>
                {showSavedAddresses && (
                  <TabsTrigger value="saved" className="text-xs">Sauvées</TabsTrigger>
                )}
                <TabsTrigger value="manual" className="text-xs">Manuelle</TabsTrigger>
                <TabsTrigger value="coords" className="text-xs">GPS</TabsTrigger>
              </TabsList>

              {showSavedAddresses && (
                <TabsContent value="saved" className="p-2">
                  <SavedAddressSelector
                    savedAddresses={savedAddresses}
                    selectedAddress={selectedAddress && 'id' in selectedAddress ? selectedAddress as Address : undefined}
                    onSelect={handleAddressSelect}
                  />
                </TabsContent>
              )}

              <TabsContent value="manual" className="p-2">
                <ManualAddressForm onSubmit={handleAddressSelect} initialAddress={selectedAddress} />
              </TabsContent>

              <TabsContent value="coords" className="p-2">
                <CoordinatesInput onSubmit={handleAddressSelect} initialAddress={selectedAddress} />
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>

        {showMapPicker && (
          <Dialog open={mapOpen} onOpenChange={setMapOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="flex-shrink-0">
                <Map className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] my-4">
              <DialogHeader>
                <DialogTitle>Sélectionner sur la carte</DialogTitle>
              </DialogHeader>
              <MapPicker onLocationSelect={handleMapSelect} initialAddress={selectedAddress} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}