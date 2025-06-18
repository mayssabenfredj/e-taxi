import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, FilePlus, FileMinus } from 'lucide-react';
import { toast } from 'sonner';
import { Employee, UserAddressDto, AddressDto } from '@/types/employee';
import { AddressInput } from '@/components/shared/AddressInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddressType } from '@/types/addresse';

interface EmployeeAddressesTabProps {
  employee: Employee;
  editedEmployee: Partial<Employee>;
  setEditedEmployee: React.Dispatch<React.SetStateAction<Partial<Employee>>>;
  isEditing: boolean;
}

const EmployeeAddressesTab: React.FC<EmployeeAddressesTabProps> = ({
  employee,
  editedEmployee,
  setEditedEmployee,
  isEditing,
}) => {
  const [newAddress, setNewAddress] = useState<AddressDto | null>(null);
  const [newAddressLabel, setNewAddressLabel] = useState('');
  const [newAddressType, setNewAddressType] = useState<AddressType>(AddressType.CUSTOM);

  const handleAddAddress = () => {
    if (!newAddress || !newAddressLabel.trim()) {
      toast.error('Veuillez remplir le libellé et l\'adresse');
      return;
    }

    const addressWithLabel: UserAddressDto = {
      address: {
        ...newAddress,
        addressType: newAddressType,
      },
      isDefault: false,
      label: newAddressLabel,
    };

    const updatedAddresses = [...(editedEmployee.addresses || employee.addresses || []), addressWithLabel];
    setEditedEmployee({
      ...editedEmployee,
      addresses: updatedAddresses,
    });
    setNewAddress(null);
    setNewAddressLabel('');
    setNewAddressType(AddressType.CUSTOM);
    toast.success('Adresse ajoutée avec succès');
  };

  const handleRemoveAddress = (addressId: string) => {
    const updatedAddresses = (editedEmployee.addresses || employee.addresses || []).filter(
      (addr) => addr.address.placeId !== addressId && addr.address.street !== addressId
    );
    setEditedEmployee({
      ...editedEmployee,
      addresses: updatedAddresses,
    });
    toast.success('Adresse supprimée');
  };

  const addresses = isEditing ? editedEmployee.addresses : employee.addresses;

  const getAddressTypeLabel = (type: AddressType | string) => {
    switch (type) {
      case AddressType.HOME:
        return 'Domicile';
      case AddressType.OFFICE:
        return 'Bureau';
      case AddressType.CUSTOM:
        return 'Personnalisé';
      default:
        return 'Personnalisé';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>Adresses enregistrées ({addresses?.length || 0})</span>
        </CardTitle>
        {isEditing && (
          <div>
            {newAddress ? (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setNewAddress(null);
                    setNewAddressLabel('');
                    setNewAddressType(AddressType.CUSTOM);
                  }}
                >
                  <FileMinus className="h-4 w-4 mr-1" />
                  Annuler
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddAddress}
                  className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
                >
                  <FilePlus className="h-4 w-4 mr-1" />
                  Enregistrer
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setNewAddress({
                    street: '',
                    formattedAddress: '',
                    addressType: AddressType.CUSTOM,
                    placeId: '',
                  })
                }
              >
                <FilePlus className="h-4 w-4 mr-1" />
                Nouvelle adresse
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {newAddress && (
          <Card className="mb-4 border-dashed">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Libellé de l'adresse</Label>
                  <Input
                    value={newAddressLabel}
                    onChange={(e) => setNewAddressLabel(e.target.value)}
                    placeholder="Ex: Domicile, Bureau, Autre, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type d'adresse</Label>
                  <Select value={newAddressType} onValueChange={(value) => setNewAddressType(value as AddressType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type d'adresse" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AddressType.HOME}>
                        🏠 {getAddressTypeLabel(AddressType.HOME)}
                      </SelectItem>
                      <SelectItem value={AddressType.OFFICE}>
                        🏢 {getAddressTypeLabel(AddressType.OFFICE)}
                      </SelectItem>
                      <SelectItem value={AddressType.CUSTOM}>
                        📍 {getAddressTypeLabel(AddressType.CUSTOM)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <AddressInput
                  label="Adresse"
                  value={newAddress as any}
                  onChange={(address) => address && setNewAddress(address as AddressDto)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {addresses?.length > 0 ? (
          <div className="space-y-4">
            {addresses.map((address: UserAddressDto) => (
              <div
                key={address.address.placeId || address.address.street}
                className="p-4 border rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-etaxi-yellow mr-2 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {address.label && (
                          <span className="inline-block px-2 py-0.5 bg-etaxi-yellow/20 text-xs rounded">
                            {address.label}
                          </span>
                        )}
                        {address.address.addressType && (
                          <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                            {getAddressTypeLabel(address.address.addressType as AddressType)}
                          </span>
                        )}
                      </div>
                      <p className="font-medium">{address.address.street}</p>
                      <p className="text-sm text-muted-foreground">
                        {address.address.formattedAddress}
                      </p>
                      {address.address.latitude && address.address.longitude && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Coordonnées: {address.address.latitude.toFixed(6)},{' '}
                          {address.address.longitude.toFixed(6)}
                        </p>
                      )}
                    </div>
                  </div>

                  {isEditing && (address.address.addressType === 'CUSTOM' || address.address.addressType === AddressType.CUSTOM) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 hover:text-red-700"
                      onClick={() =>
                        handleRemoveAddress(address.address.placeId || address.address.street)
                      }
                    >
                      Supprimer
                    </Button>
                  ) : (
                    address.isDefault && (
                      <span className="inline-block px-2 py-0.5 bg-etaxi-yellow text-black text-xs rounded">
                        Par défaut
                      </span>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            <MapPin className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>Aucune adresse enregistrée</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeAddressesTab;