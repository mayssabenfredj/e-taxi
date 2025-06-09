import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
import { MapPicker } from './MapPicker';

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
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
  const [textualAddress, setTextualAddress] = useState('');

  const handleSelectSaved = (address: Address) => {
    onChange(address);
    setOpen(false);
  };

  const handleTextualAddress = () => {
    if (textualAddress.trim()) {
      const newAddress: Address = {
        id: `textual-${Date.now()}`,
        label: 'Adresse saisie',
        street: textualAddress,
        city: '',
        postalCode: '',
        country: 'France'
      };
      onChange(newAddress);
      setTextualAddress('');
    }
  };

  const handleMapSelection = (location: {
    address: string;
    coordinates: { lat: number; lng: number };
    placeId?: string;
  }) => {
    const newAddress: Address = {
      id: `map-${Date.now()}`,
      label: location.address,
      street: location.address,
      city: '',
      postalCode: '',
      country: 'France',
      latitude: location.coordinates.lat,
      longitude: location.coordinates.lng
    };
    onChange(newAddress);
    setMapOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      <div className="flex space-x-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="flex-1 justify-between"
            >
              {value ? (
                <span className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  {value.label}
                </span>
              ) : (
                "Sélectionner une adresse..."
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Rechercher une adresse..." />
              <CommandEmpty>Aucune adresse trouvée.</CommandEmpty>
              {savedAddresses.length > 0 && (
                <CommandGroup heading="Adresses enregistrées">
                  {savedAddresses.map((address) => (
                    <CommandItem
                      key={address.id}
                      value={address.label}
                      onSelect={() => handleSelectSaved(address)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value?.id === address.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div>
                        <div className="font-medium">{address.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {address.street}, {address.city}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </Command>
          </PopoverContent>
        </Popover>

        {showMapPicker && (
          <Dialog open={mapOpen} onOpenChange={setMapOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Map className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] my-8">
              <DialogHeader>
                <DialogTitle>Sélectionner sur la carte</DialogTitle>
              </DialogHeader>
              <MapPicker onLocationSelect={handleMapSelection} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Single Textual Address Input */}
      <div className="flex space-x-2">
        <Input
          placeholder="Ou saisissez une adresse..."
          value={textualAddress}
          onChange={(e) => setTextualAddress(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleTextualAddress();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleTextualAddress}
          disabled={!textualAddress.trim()}
        >
          Ajouter
        </Button>
      </div>
    </div>
  );
}