import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Check, ChevronsUpDown, MapPin, Map } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SavedAddressSelector } from './address/SavedAddressSelector';
import { AddressSearchInput } from './address/AddressSearchInput';
import { ManualAddressForm } from './address/ManualAddressForm';
import { CoordinatesInput } from './address/CoordinatesInput';
import { MapPicker } from './address/MapPicker';

interface Address {
  id: string;
  label: string;
  street: string;
  buildingNumber?: string;
  complement?: string;
  postalCode: string;
  city: string;
  region?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  formattedAddress?: string;
  isVerified?: boolean;
  isExact?: boolean;
  manuallyEntered?: boolean;
  addressType?: string;
  notes?: string;
}

interface AddressInputProps {
  label: string;
  value?: Address | null;
  onChange: (address: Address | null) => void;
  savedAddresses?: Address[];
  required?: boolean;
  showMapPicker?: boolean;
}

export function AddressInput({ 
  label, 
  value, 
  onChange, 
  savedAddresses = [], 
  required = false,
  showMapPicker = true
}: AddressInputProps) {
  const [open, setOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('saved');

  const handleAddressSelect = (address: Address) => {
    onChange(address);
    setOpen(false);
    toast.success('Adresse sélectionnée');
  };

  const handleMapSelect = (address: Address) => {
    onChange(address);
    setMapOpen(false);
    toast.success('Adresse sélectionnée depuis la carte');
  };

  return (
    <div className="space-y-2 w-full">
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
              className="flex-1 justify-between min-h-[40px] text-left"
            >
              {value ? (
                <div className="flex items-center truncate">
                  <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{value.label || value.formattedAddress}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Sélectionner une adresse...</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 max-w-lg" align="start">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 text-xs">
                <TabsTrigger value="saved" className="text-xs">Sauvées</TabsTrigger>
                <TabsTrigger value="search" className="text-xs">Recherche</TabsTrigger>
                <TabsTrigger value="manual" className="text-xs">Manuelle</TabsTrigger>
                <TabsTrigger value="coords" className="text-xs">GPS</TabsTrigger>
              </TabsList>
              
              <TabsContent value="saved" className="p-2">
                <SavedAddressSelector
                  savedAddresses={savedAddresses}
                  selectedAddress={value}
                  onSelect={handleAddressSelect}
                />
              </TabsContent>
              
              <TabsContent value="search" className="p-2">
                <AddressSearchInput onSelect={handleAddressSelect} />
              </TabsContent>
              
              <TabsContent value="manual" className="p-2">
                <ManualAddressForm onSubmit={handleAddressSelect} />
              </TabsContent>
              
              <TabsContent value="coords" className="p-2">
                <CoordinatesInput onSubmit={handleAddressSelect} />
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
              <MapPicker onLocationSelect={handleMapSelect} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}