import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

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
  formattedAddress?: string;
  isVerified?: boolean;
  manuallyEntered?: boolean;
}

interface ManualAddressFormProps {
  onSubmit: (address: Address) => void;
}

export function ManualAddressForm({ onSubmit }: ManualAddressFormProps) {
  const [addressLabel, setAddressLabel] = useState('');
  const [manualAddress, setManualAddress] = useState({
    street: '',
    buildingNumber: '',
    complement: '',
    postalCode: '',
    city: '',
    region: '',
    country: 'France'
  });

  const handleSubmit = () => {
    if (!manualAddress.street || !manualAddress.city || !manualAddress.postalCode) {
      toast.error('Veuillez remplir au moins la rue, la ville et le code postal');
      return;
    }

    const address: Address = {
      id: `manual-${Date.now()}`,
      label: addressLabel || `${manualAddress.street}, ${manualAddress.city}`,
      street: manualAddress.buildingNumber ? 
        `${manualAddress.buildingNumber} ${manualAddress.street}` : 
        manualAddress.street,
      buildingNumber: manualAddress.buildingNumber,
      complement: manualAddress.complement,
      city: manualAddress.city,
      postalCode: manualAddress.postalCode,
      region: manualAddress.region,
      country: manualAddress.country,
      formattedAddress: `${manualAddress.street}, ${manualAddress.postalCode} ${manualAddress.city}, ${manualAddress.country}`,
      isVerified: false,
      manuallyEntered: true
    };

    onSubmit(address);
    
    // Reset form
    setAddressLabel('');
    setManualAddress({
      street: '',
      buildingNumber: '',
      complement: '',
      postalCode: '',
      city: '',
      region: '',
      country: 'France'
    });
    
    toast.success('Adresse manuelle ajoutée');
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Libellé de l'adresse</Label>
        <Input
          value={addressLabel}
          onChange={(e) => setAddressLabel(e.target.value)}
          placeholder="Ex: Domicile, Travail, etc."
        />
      </div>
      
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
      
      <Button 
        onClick={handleSubmit}
        className="w-full bg-etaxi-yellow hover:bg-yellow-500 text-black text-sm"
        size="sm"
      >
        Ajouter l'adresse
      </Button>
    </div>
  );
}