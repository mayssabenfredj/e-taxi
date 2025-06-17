import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddressInput } from '@/components/shared/AddressInput';
import { UserPlus } from 'lucide-react';
import { Address, AddressType } from '@/types/addresse';
import { roleService } from '@/services/role.service';
import SubsidiaryService from '@/services/subsidiarie.service';
import { CreateEmployee, UserAddressDto } from '@/types/employee';
import { EntityStatus } from '@/types/subsidiary';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AddEmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeAdded: (employee: CreateEmployee) => void;
}

export function AddEmployeeForm({ open, onOpenChange, onEmployeeAdded }: AddEmployeeFormProps) {
  const [selectedHomeAddress, setSelectedHomeAddress] = useState<Address | null>(null);
  const [selectedWorkAddress, setSelectedWorkAddress] = useState<Address | null>(null);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [subsidiaries, setSubsidiaries] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const { user } = useAuth();

  const form = useForm<CreateEmployee>({
    defaultValues: {
      email: '',
      fullName: '',
      firstName: '',
      lastName: '',
      phone: '',
      alternativePhone: '',
      roleIds: [],
      subsidiaryId: '',
      addresses: [],
    },
  });

  const { setValue, watch } = form;
  const selectedRoleIds = watch('roleIds');

  const savedAddresses: Address[] = [
    {
      id: 'saved1',
      label: 'Siège social',
      street: '123 Avenue des Champs-Élysées',
      postalCode: '75008',
      city: { id: 'city1', name: 'Paris', postalCode: '75008', regionId: 'region1' },
      country: { id: 'country1', name: 'France', code: 'FR' },
      addressType: AddressType.OFFICE,
      isVerified: true,
      isExact: true,
      manuallyEntered: false,
    },
    {
      id: 'saved2',
      label: 'Bureau Lyon',
      street: '45 Rue de la République',
      postalCode: '69002',
      city: { id: 'city2', name: 'Lyon', postalCode: '69002', regionId: 'region2' },
      country: { id: 'country1', name: 'France', code: 'FR' },
      addressType: AddressType.OFFICE,
      isVerified: true,
      isExact: true,
      manuallyEntered: false,
    },
  ];

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const roleData = await roleService.getAllRoles();
        const allowedRoles = ['ADMIN_FILIAL', 'EMPLOYEE_ENTREPRISE', 'EMPLOYEE_ENTREPRISE_TRUSTED'];
        const filteredRoles = roleData
          .filter((role: any) => allowedRoles.includes(role.name))
          .map((role: any) => ({ id: role.id, name: role.name }));
        setRoles(filteredRoles);

        const defaultRole = filteredRoles.find(
          (role) => role.name === (isManager ? 'ADMIN_FILIAL' : 'EMPLOYEE_ENTREPRISE')
        );
        if (defaultRole) {
          setValue('roleIds', [defaultRole.id]);
        }

        const subsidiaryData = await SubsidiaryService.getAllSubsidiaries({
          include: true,
          status: EntityStatus.ACTIVE,
          enterpriseId: user?.enterpriseId,
        });
        setSubsidiaries(subsidiaryData.data.map((sub: any) => ({ id: sub.id, name: sub.name })));
      } catch (error) {
        toast.error('Erreur lors du chargement des rôles ou filiales');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user?.enterpriseId, setValue, isManager]);

  useEffect(() => {
    if (selectedRoleIds.length > 0) {
      const selectedRole = roles.find((role) => role.id === selectedRoleIds[0]);
      setIsManager(selectedRole?.name === 'ADMIN_FILIAL');
    }
  }, [selectedRoleIds, roles]);

  useEffect(() => {
    const defaultRole = roles.find(
      (role) => role.name === (isManager ? 'ADMIN_FILIAL' : 'EMPLOYEE_ENTREPRISE')
    );
    if (defaultRole && !selectedRoleIds.includes(defaultRole.id)) {
      setValue('roleIds', [defaultRole.id]);
    }
  }, [isManager, roles, setValue, selectedRoleIds]);

  const onSubmit = (data: CreateEmployee) => {
    const addresses: UserAddressDto[] = [];
    if (selectedHomeAddress) {
      addresses.push({
        address: {
          street: selectedHomeAddress.street || '',
          buildingNumber: selectedHomeAddress.buildingNumber || undefined,
          complement: selectedHomeAddress.complement || undefined,
          postalCode: selectedHomeAddress.postalCode || '',
          cityId: selectedHomeAddress.cityId || selectedHomeAddress.city?.id || null,
          regionId: selectedHomeAddress.regionId || selectedHomeAddress.region?.id || null,
          countryId: selectedHomeAddress.countryId || selectedHomeAddress.country?.id || null,
          latitude: selectedHomeAddress.latitude || undefined,
          longitude: selectedHomeAddress.longitude || undefined,
          placeId: selectedHomeAddress.placeId || undefined,
          formattedAddress: selectedHomeAddress.formattedAddress || undefined,
          isVerified: selectedHomeAddress.isVerified || false,
          isExact: selectedHomeAddress.isExact || false,
          manuallyEntered: selectedHomeAddress.manuallyEntered || true,
          addressType: AddressType.HOME,
          notes: selectedHomeAddress.notes || undefined,
        },
        label: AddressType.HOME,
        isDefault: true,
      });
    }
    if (selectedWorkAddress) {
      addresses.push({
        address: {
          street: selectedWorkAddress.street || '',
          buildingNumber: selectedWorkAddress.buildingNumber || undefined,
          complement: selectedWorkAddress.complement || undefined,
          postalCode: selectedWorkAddress.postalCode || '',
          cityId: selectedWorkAddress.cityId || selectedWorkAddress.city?.id || null,
          regionId: selectedWorkAddress.regionId || selectedWorkAddress.region?.id || null,
          countryId: selectedWorkAddress.countryId || selectedWorkAddress.country?.id || null,
          latitude: selectedWorkAddress.latitude || undefined,
          longitude: selectedWorkAddress.longitude || undefined,
          placeId: selectedWorkAddress.placeId || undefined,
          formattedAddress: selectedWorkAddress.formattedAddress || undefined,
          isVerified: selectedWorkAddress.isVerified || false,
          isExact: selectedWorkAddress.isExact || false,
          manuallyEntered: selectedWorkAddress.manuallyEntered || true,
          addressType: AddressType.OFFICE,
          notes: selectedWorkAddress.notes || undefined,
        },
        label: AddressType.OFFICE,
        isDefault: false,
      });
    }

    const employeeData: CreateEmployee = {
      ...data,
      fullName: `${data.firstName} ${data.lastName}`,
      addresses,
    };

    onEmployeeAdded(employeeData);
    form.reset();
    setSelectedHomeAddress(null);
    setSelectedWorkAddress(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto my-4">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-etaxi-yellow" />
            <span>Ajouter un nouvel employé</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    rules={{ required: 'Le prénom est requis' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom *</FormLabel>
                        <FormControl>
                          <Input placeholder="Jean" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    rules={{ required: 'Le nom est requis' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom *</FormLabel>
                        <FormControl>
                          <Input placeholder="Dupont" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  rules={{
                    required: "L'email est requis",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email invalide',
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jean.dupont@techcorp.fr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    rules={{ required: 'Le téléphone est requis' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone *</FormLabel>
                        <FormControl>
                          <Input placeholder="+33 6 12 34 56 78" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="alternativePhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone alternatif</FormLabel>
                        <FormControl>
                          <Input placeholder="+33 1 23 45 67 89" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Adresses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AddressInput
                  label="Adresse domicile"
                  value={selectedHomeAddress}
                  onChange={setSelectedHomeAddress}
                  savedAddresses={savedAddresses}
                  showMapPicker={true}
                />
                <AddressInput
                  label="Adresse travail"
                  value={selectedWorkAddress}
                  onChange={setSelectedWorkAddress}
                  savedAddresses={savedAddresses}
                  showMapPicker={true}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rôle et permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Manager</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Cet employé a-t-il des responsabilités managériales ?
                    </div>
                  </div>
                  <Switch
                    checked={isManager}
                    onCheckedChange={setIsManager}
                    disabled={loading}
                  />
                </FormItem>

                <FormField
                  control={form.control}
                  name="roleIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rôle</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange([value])}
                        value={field.value[0] || ''}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un rôle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subsidiaryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Filiale</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une filiale" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subsidiaries.map((subsidiary) => (
                            <SelectItem key={subsidiary.id} value={subsidiary.id}>
                              {subsidiary.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-etaxi-yellow hover:bg-yellow-500 text-black" disabled={loading}>
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter l'employé
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}