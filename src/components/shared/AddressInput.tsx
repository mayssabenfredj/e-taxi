
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
import { Check, ChevronsUpDown, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

interface AddressInputProps {
  label: string;
  value?: Address | null;
  onChange: (address: Address | null) => void;
  savedAddresses?: Address[];
  required?: boolean;
}

export function AddressInput({ 
  label, 
  value, 
  onChange, 
  savedAddresses = [], 
  required = false 
}: AddressInputProps) {
  const [open, setOpen] = useState(false);
  const [customAddress, setCustomAddress] = useState('');

  const handleSelectSaved = (address: Address) => {
    onChange(address);
    setOpen(false);
  };

  const handleCustomAddress = () => {
    if (customAddress.trim()) {
      const newAddress: Address = {
        id: `custom-${Date.now()}`,
        label: customAddress,
        street: customAddress,
        city: '',
        postalCode: '',
        country: 'France'
      };
      onChange(newAddress);
      setCustomAddress('');
    }
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
      </div>

      <div className="flex space-x-2">
        <Input
          placeholder="Ou saisissez une nouvelle adresse..."
          value={customAddress}
          onChange={(e) => setCustomAddress(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleCustomAddress();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleCustomAddress}
          disabled={!customAddress.trim()}
        >
          Ajouter
        </Button>
      </div>
    </div>
  );
}
