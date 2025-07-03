import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shareds/components/ui/card';
import { Button } from '@/shareds/components/ui/button';
import { Input } from '@/shareds/components/ui/input';
import { Label } from '@/shareds/components/ui/label';
import { MapPin, FilePlus } from 'lucide-react';
import { toast } from 'sonner';
import { Employee, UserAddressDto} from '@/features/employees/types/employee';
import { AddressInput } from '@/shareds/components/addressComponent/AddressInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shareds/components/ui/select';
import { AddressDto, AddressType } from '@/shareds/types/addresse';

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
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editAddress, setEditAddress] = useState<AddressDto | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editType, setEditType] = useState<AddressType>(AddressType.CUSTOM);
  const [editIsDefault, setEditIsDefault] = useState(false);

  useEffect(() => {
    if (newAddress && newAddressLabel.trim() && newAddress.formattedAddress) {
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
      toast.success('Adresse enregistrée automatiquement');
      // Clear only the address input, keep the form visible
      setNewAddress({
        street: '',
        formattedAddress: '',
        addressType: AddressType.CUSTOM,
        placeId: '',
      });
      setNewAddressLabel('');
      setNewAddressType(AddressType.CUSTOM);
    }
  }, [newAddress, newAddressLabel, newAddressType, editedEmployee, employee.addresses, setEditedEmployee]);

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

  const handleEdit = (idx: number, addr: UserAddressDto) => {
    setEditIndex(idx);
    setEditAddress(addr.address);
    setEditLabel(addr.label || '');
    setEditType(addr.address.addressType as AddressType);
    setEditIsDefault(!!addr.isDefault);
  };

  const handleEditSave = () => {
    if (!editAddress || !editLabel.trim() || !editAddress.formattedAddress) return;
    let updatedAddresses = [...(editedEmployee.addresses || employee.addresses || [])];
    // Si isDefault, retirer le flag des autres adresses du même type
    if (editIsDefault) {
      updatedAddresses = updatedAddresses.map((a, i) =>
        i !== editIndex && a.address.addressType === editType
          ? { ...a, isDefault: false }
          : a
      );
    }
    updatedAddresses[editIndex!] = {
      address: { ...editAddress, addressType: editType },
      label: editLabel,
      isDefault: editIsDefault,
    };
    setEditedEmployee({ ...editedEmployee, addresses: updatedAddresses });
    setEditIndex(null);
    setEditAddress(null);
    setEditLabel('');
    setEditType(AddressType.CUSTOM);
    setEditIsDefault(false);
    toast.success('Adresse modifiée');
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setShowAddressForm(!showAddressForm);
              if (showAddressForm) {
                setNewAddress(null);
                setNewAddressLabel('');
                setNewAddressType(AddressType.CUSTOM);
              } else {
                setNewAddress({
                  street: '',
                  formattedAddress: '',
                  addressType: AddressType.CUSTOM,
                  placeId: '',
                });
              }
            }}
          >
            <FilePlus className="h-4 w-4 mr-1" />
            {showAddressForm ? 'Masquer le formulaire' : 'Nouvelle adresse'}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing && showAddressForm && (
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
            {addresses.map((address: UserAddressDto, idx) => (
              <div
                key={address.address.placeId || address.address.street}
                className="p-4 border rounded-lg"
              >
                {isEditing && editIndex === idx ? (
                  <Card className="mb-4 border-dashed">
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-2">
                        <Label>Libellé de l'adresse</Label>
                        <Input
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          placeholder="Ex: Domicile, Bureau, Autre, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Type d'adresse</Label>
                        <Select value={editType} onValueChange={(value) => setEditType(value as AddressType)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type d'adresse" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={AddressType.HOME}>🏠 {getAddressTypeLabel(AddressType.HOME)}</SelectItem>
                            <SelectItem value={AddressType.OFFICE}>🏢 {getAddressTypeLabel(AddressType.OFFICE)}</SelectItem>
                            <SelectItem value={AddressType.CUSTOM}>📍 {getAddressTypeLabel(AddressType.CUSTOM)}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Adresse</Label>
                        <AddressInput
                          label="Adresse"
                          value={editAddress as any}
                          onChange={(address) => address && setEditAddress(address as AddressDto)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editIsDefault}
                          onChange={(e) => setEditIsDefault(e.target.checked)}
                          id={`default-checkbox-${idx}`}
                        />
                        <Label htmlFor={`default-checkbox-${idx}`}>Définir comme adresse par défaut</Label>
                      </div>
                      <div className="flex space-x-2 mt-2">
                        <Button size="sm" variant="outline" onClick={() => setEditIndex(null)}>Annuler</Button>
                        <Button size="sm" className="bg-etaxi-yellow" onClick={handleEditSave}>Enregistrer</Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
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
                        {address.isDefault && (
                          <span className="inline-block px-2 py-0.5 bg-etaxi-yellow text-black text-xs rounded mt-2">
                            Par défaut
                          </span>
                        )}
                      </div>
                    </div>
                    {isEditing && (
                      <div className="flex flex-col space-y-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(idx, address)}>Modifier</Button>
                        <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700" onClick={() => handleRemoveAddress(address.address.placeId || address.address.street)}>Supprimer</Button>
                      </div>
                    )}
                  </div>
                )}
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