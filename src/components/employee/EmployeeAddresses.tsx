import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, FilePlus, FileMinus } from 'lucide-react';
import { AddressInput } from '../../../components/shared/AddressInput';
import { Employee, UserAddressDto } from './types';

interface EmployeeAddressesProps {
  employee: Employee;
  editedEmployee: Employee;
  setEditedEmployee: React.Dispatch<React.SetStateAction<Employee>>;
  isEditing: boolean;
  newAddress: UserAddressDto | null;
  setNewAddress: React.Dispatch<React.SetStateAction<UserAddressDto | null>>;
  newAddressLabel: string;
  setNewAddressLabel: React.Dispatch<React.SetStateAction<string>>;
  handleAddAddress: () => void;
  handleRemoveAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
}

export function EmployeeAddresses({
  employee,
  editedEmployee,
  setEditedEmployee,
  isEditing,
  newAddress,
  setNewAddress,
  newAddressLabel,
  setNewAddressLabel,
  handleAddAddress,
  handleRemoveAddress,
  setDefaultAddress,
}: EmployeeAddressesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>
            Adresses enregistrées (
            {(isEditing ? editedEmployee.addresses : employee.addresses).length})
          </span>
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
                    address: {
                      id: `new-${Date.now()}`,
                      street: '',
                      city: '',
                      postalCode: '',
                      country: 'France',
                      label: '',
                    },
                    label: '',
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
                    placeholder="Ex: Domicile, Travail, etc."
                  />
                </div>

                <AddressInput
                  label="Adresse"
                  value={newAddress.address}
                  onChange={(address) =>
                    address &&
                    setNewAddress({ ...newAddress, address: { ...address } })
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}

        {(isEditing ? editedEmployee.addresses : employee.addresses).length > 0 ? (
          <div className="space-y-4">
            {(isEditing ? editedEmployee.addresses : employee.addresses).map(
              (address) => (
                <div
                  key={address.address.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-etaxi-yellow mr-2 mt-0.5" />
                      <div>
                        {address.label && (
                          <span className="inline-block px-2 py-0.5 bg-etaxi-yellow/20 text-xs rounded mb-1">
                            {address.label}
                          </span>
                        )}
                        <p className="font-medium">{address.address.street}</p>
                        <p className="text-sm text-muted-foreground">
                          {address.address.postalCode} {address.address.city},{' '}
                          {address.address.country}
                        </p>
                        {address.address.latitude && address.address.longitude && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Coordonnées:{' '}
                            {address.address.latitude.toFixed(6)},{' '}
                            {address.address.longitude.toFixed(6)}
                          </p>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant={
                            (isEditing
                              ? editedEmployee.defaultAddressId
                              : employee.defaultAddressId) === address.address.id
                              ? 'default'
                              : 'outline'
                          }
                          className={
                            (isEditing
                              ? editedEmployee.defaultAddressId
                              : employee.defaultAddressId) === address.address.id
                              ? 'bg-etaxi-yellow hover:bg-yellow-500 text-black'
                              : ''
                          }
                          onClick={() => setDefaultAddress(address.address.id!)}
                        >
                          Par défaut
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveAddress(address.address.id!)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    ) : (
                      employee.defaultAddressId === address.address.id && (
                        <Badge className="bg-etaxi-yellow text-black">
                          Par défaut
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )
            )}
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
}