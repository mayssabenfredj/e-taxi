import React from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/shareds/components/ui/command';
import { Check, MapPin } from 'lucide-react';
import { cn } from '@/shareds/lib/utils';
import { Address, AddressType, City, Region, Country } from '@/shareds/types/addresse';

interface SavedAddressSelectorProps {
  savedAddresses: Address[];
  selectedAddress?: Address | null;
  onSelect: (address: Address) => void;
}

export function SavedAddressSelector({
  savedAddresses,
  selectedAddress,
  onSelect,
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
              value={address.label || address.formattedAddress || address.id} // Fallback to id if label/formattedAddress is null
              onSelect={() => onSelect(address)}
              className="cursor-pointer"
            >
              <Check
                className={cn(
                  'mr-2 h-4 w-4',
                  selectedAddress?.id === address.id ? 'opacity-100' : 'opacity-0'
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{address.label || address.formattedAddress || 'Adresse sans nom'}</div>
                <div className="text-sm text-muted-foreground truncate">
                  {address.street || 'N/A'}, {address.city?.name || 'Ville inconnue'}
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </Command>
  );
}