import React from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Check, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

interface SavedAddressSelectorProps {
  savedAddresses: Address[];
  selectedAddress?: Address | null;
  onSelect: (address: Address) => void;
}

export function SavedAddressSelector({ 
  savedAddresses, 
  selectedAddress, 
  onSelect 
}: SavedAddressSelectorProps) {
  return (
    <Command>
      <CommandInput placeholder="Rechercher dans les adresses sauvées..." />
      <CommandEmpty>Aucune adresse sauvée trouvée.</CommandEmpty>
      {savedAddresses.length > 0 && (
        <CommandGroup>
          {savedAddresses.map((address) => (
            <CommandItem
              key={address.id}
              value={address.label}
              onSelect={() => onSelect(address)}
              className="cursor-pointer"
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  selectedAddress?.id === address.id ? "opacity-100" : "opacity-0"
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{address.label}</div>
                <div className="text-sm text-muted-foreground truncate">
                  {address.street}, {address.city}
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </Command>
  );
}