import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddressInput } from '@/components/shared/AddressInput';
import { UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';

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

interface EmployeeFormData {
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phone: string;
  alternativePhone?: string;
  language?: string;
  timezone?: string;
  homeAddress?: Address;
  workAddress?: Address;
  subsidiaryId?: string;
  role: 'employee' | 'manager' | 'admin';
  isManager: boolean;
}

interface AddEmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeAdded: (employee: EmployeeFormData) => void;
}

export function AddEmployeeForm({ open, onOpenChange, onEmployeeAdded }: AddEmployeeFormProps) {
  const [selectedHomeAddress, setSelectedHomeAddress] = useState<Address | null>(null);
  const [selectedWorkAddress, setSelectedWorkAddress] = useState<Address | null>(null);
  
  const form = useForm<EmployeeFormData>({
    defaultValues: {
      email: '',
      fullName: '',
      firstName: '',
      lastName: '',
      phone: '',
      alternativePhone: '',
      language: 'fr',
      timezone: 'Europe/Paris',
      role: 'employee',
      isManager: false
    }
  });

  const subsidiaries = [
    { id: '1', name: 'TechCorp Paris' },
    { id: '2', name: 'TechCorp Lyon' },
    { id: '3', name: 'TechCorp Marseille' }
  ];

  const savedAddresses: Address[] = [
    {
      id: '1',
      label: 'Siège social',
      street: '123 Avenue des Champs-Élysées',
      city: 'Paris',
      postalCode: '75008',
      country: 'France'
    },
    {
      id: '2',
      label: 'Bureau Lyon',
      street: '45 Rue de la République',
      city: 'Lyon',
      postalCode: '69002',
      country: 'France'
    }
  ];

  const onSubmit = (data: EmployeeFormData) => {
    const employeeData = {
      ...data,
      homeAddress: selectedHomeAddress || undefined,
      workAddress: selectedWorkAddress || undefined,
      fullName: `${data.firstName} ${data.lastName}`
    };

    console.log('Ajout employé:', employeeData);
    onEmployeeAdded(employeeData);
    toast.success('Employé ajouté avec succès!');
    form.reset();
    setSelectedHomeAddress(null);
    setSelectedWorkAddress(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-etaxi-yellow" />
            <span>Ajouter un nouvel employé</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informations personnelles */}
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
                    required: 'L\'email est requis',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email invalide'
                    }
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

            {/* Adresses */}
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

            {/* Rôle et permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rôle et permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rôle</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un rôle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="employee">Employé</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Administrateur</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isManager"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Manager</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Cet employé a-t-il des responsabilités managériales ?
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subsidiaryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Filiale</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            {/* Préférences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Préférences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Langue</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuseau horaire</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                            <SelectItem value="Europe/London">Europe/London</SelectItem>
                            <SelectItem value="America/New_York">America/New_York</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
              >
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