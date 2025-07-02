import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/shareds/components/ui/card';
import { Button } from '@/shareds/components/ui/button';
import { Input } from '@/shareds/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shareds/components/ui/select';
import { Switch } from '@/shareds/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shareds/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shareds/components/ui/dialog';
import { AddressInput } from '@/shareds/components/addressComponent/AddressInput';
import { UserPlus } from 'lucide-react';
import { Address, AddressDto, AddressType } from '@/shareds/types/addresse';
import { CreateEmployee, UserAddressDto } from '@/features/employees/types/employee';
import { useAuth } from '@/shareds/contexts/AuthContext';
import { useRolesAndSubsidiaries } from '@/shareds/hooks/useRolesAndSubsidiaries';
import { toast } from 'sonner';
import { entrepriseService } from '@/features/Entreprises/services/entreprise.service';
import SubsidiaryService from '@/features/Entreprises/services/subsidiarie.service';

interface AddEmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeAdded: (employee: CreateEmployee) => void;
  canCreate?: boolean;
}

export function AddEmployeeForm({ open, onOpenChange, onEmployeeAdded, canCreate = true }: AddEmployeeFormProps) {
  const [selectedHomeAddress, setSelectedHomeAddress] = useState<Address | null>(null);
  const [selectedWorkAddress, setSelectedWorkAddress] = useState<Address | null>(null);
  const [isManager, setIsManager] = useState(false);
  const { user } = useAuth();
  const { roles, subsidiaries, loading } = useRolesAndSubsidiaries(user?.enterpriseId);
  const [enterprises, setEnterprises] = useState<any[]>([]);
  const [filteredSubsidiaries, setFilteredSubsidiaries] = useState<any[]>(subsidiaries);

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
  const selectedSubsidiaryId = watch('subsidiaryId');

  useEffect(() => {
    const defaultRole = roles.find(
      (role) => role.name === (isManager ? 'ADMIN_FILIAL' : 'EMPLOYEE_ENTREPRISE')
    );
    if (defaultRole && (!selectedRoleIds[0] || selectedRoleIds[0] !== defaultRole.id)) {
      setValue('roleIds', [defaultRole.id]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManager, roles]);

  useEffect(() => {
    if (selectedRoleIds.length > 0) {
      const selectedRole = roles.find((role) => role.id === selectedRoleIds[0]);
      if (selectedRole) {
        setIsManager(selectedRole.name === 'ADMIN_FILIAL');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoleIds, roles]);

  // Helper pour convertir AddressDto en Address minimal si besoin
  function toAddress(address: Address | AddressDto | null): Address | null {
    if (!address) return null;
    if ('id' in address && address.id) return address as Address;
    // Générer un id temporaire si manquant
    return { ...address, id: `temp-${Date.now()}` } as Address;
  }

  useEffect(() => {
    if (selectedSubsidiaryId) {
      const subsidiary = subsidiaries.find((s) => s.id === selectedSubsidiaryId);
      if (subsidiary && subsidiary.address) {
        setSelectedWorkAddress(toAddress(subsidiary.address));
      }
    }
  }, [selectedSubsidiaryId, subsidiaries]);

  useEffect(() => {
    // Si ADMIN, charger la liste des entreprises
    const fetchEnterprises = async () => {
      if (user?.roles?.some((r: any) => r.role?.name === 'ADMIN')) {
            const params: any = { skip : 0, take : 100 };
        const res = await entrepriseService.findAll(params);
        console.log("reeeessss ***" , res.data)
        setEnterprises(res.data || []);
      }
    };
    fetchEnterprises();
  }, [user]);

  // Filtrage dynamique des filiales si ADMIN
  useEffect(() => {
    if (user?.roles?.some((r: any) => r.role?.name === 'ADMIN')) {
      const entId = form.getValues('enterpriseId');
      if (entId && entId !== 'none') {
        SubsidiaryService.getAllSubsidiaries({ enterpriseId: entId, include: true })
          .then(res => setFilteredSubsidiaries(res.data || []));
      } else {
        setFilteredSubsidiaries([]);
      }
    } else {
      setFilteredSubsidiaries(subsidiaries);
    }
  }, [form.watch('enterpriseId'), subsidiaries, user]);

  const onSubmit = (data: CreateEmployee) => {
    const addresses: UserAddressDto[] = [];
    // Si ADMIN et entreprise 'none', on met undefined
    let enterpriseId = data.enterpriseId === 'none' ? undefined : data.enterpriseId;
    if (selectedHomeAddress) {
      addresses.push({
        address: {
          street: selectedHomeAddress.street || '',
          buildingNumber: selectedHomeAddress.buildingNumber || undefined,
          complement: selectedHomeAddress.complement || undefined,
          postalCode: selectedHomeAddress.postalCode || '',
          cityId: selectedHomeAddress.cityId || (selectedHomeAddress as Address).city?.id || null,
          regionId: selectedHomeAddress.regionId || (selectedHomeAddress as Address).region?.id || null,
          countryId: selectedHomeAddress.countryId || (selectedHomeAddress as Address).country?.id || null,
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
          cityId: selectedWorkAddress.cityId || (selectedWorkAddress as Address).city?.id || null,
          regionId: selectedWorkAddress.regionId || (selectedWorkAddress as Address).region?.id || null,
          countryId: selectedWorkAddress.countryId || (selectedWorkAddress as Address).country?.id || null,
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
      enterpriseId,
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
            <span>Ajouter un nouvel Collaborateur</span>
          </DialogTitle>
        </DialogHeader>
        {!canCreate ? (
          <div className="text-center text-red-600 font-bold py-8">Accès refusé : vous n'avez pas la permission d'ajouter un collaborateur.</div>
        ) : (
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
                <CardTitle className="text-lg">Rôle et permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Manager</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Ce Collaborateur a-t-il des responsabilités managériales ?
                    </div>
                  </div>
                  <Switch
                    checked={isManager}
                    onCheckedChange={(checked) => setIsManager(checked)}
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

                    {/* Si ADMIN, afficher le select entreprise */}
                {user?.roles?.some((r: any) => r.role?.name === 'ADMIN') && (
                  <FormField
                    control={form.control}
                    name="enterpriseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entreprise (optionnel)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une entreprise" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Aucune</SelectItem>
                            {enterprises.map((ent) => (
                              <SelectItem key={ent.id} value={ent.id}>{ent.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="subsidiaryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sous Organisation</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une filiale" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredSubsidiaries.map((subsidiary) => (
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Adresses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AddressInput
                  label="Adresse domicile"
                  value={selectedHomeAddress}
                  onChange={(addr) => setSelectedHomeAddress(toAddress(addr))}
                  showMapPicker={true}
                />
                <AddressInput
                  label="Adresse travail"
                  value={selectedWorkAddress}
                  onChange={(addr) => setSelectedWorkAddress(toAddress(addr))}
                  showMapPicker={true}
                />
              </CardContent>
            </Card>

            

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-etaxi-yellow hover:bg-yellow-500 text-black" disabled={loading}>
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter le collaborateur
              </Button>
            </div>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}