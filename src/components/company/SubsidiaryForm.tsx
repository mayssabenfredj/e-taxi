import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddressInput } from '@/components/shared/AddressInput';
import { Address, AddressType } from '@/types/addresse';
import { FormData, Manager, Subsidiary } from '@/types/subsidiary';
import { SelectMultiple } from '@/components/ui/select-multiple';
import EmployeeService from '@/services/employee.service';
import { toast } from 'sonner';

interface SubsidiaryFormProps {
  editingSubsidiary: Subsidiary | null;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  managers: Manager[];
  savedAddresses: Address[];
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

const SubsidiaryForm: React.FC<SubsidiaryFormProps> = ({
  editingSubsidiary,
  formData,
  setFormData,
  savedAddresses,
  onSubmit,
  onCancel,
}) => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);

  // Fetch managers with role ADMIN_FILIAL, include=false, status=ENABLED
  useEffect(() => {
    const fetchManagers = async () => {
      setLoadingManagers(true);
      try {
        const query = {
          roleName: 'ADMIN_FILIAL',
          include: false,
        };
        const { data } = await EmployeeService.getAllEmployees(query);
        console.log('Fetched managers:', data);
        const mappedManagers: Manager[] = data.map((employee) => ({
          id: employee.id,
          name: employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Sans nom',
        }));
        setManagers(mappedManagers);
      } catch (error) {
        toast.error('Erreur lors du chargement des managers');
        console.error(error);
      } finally {
        setLoadingManagers(false);
      }
    };
    fetchManagers();
  }, []);

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto my-4 mx-4">
      <DialogHeader>
        <DialogTitle className="text-left">
          {editingSubsidiary ? 'Modifier la Filiale' : 'Nouvelle Filiale'}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 p-1">
        <div>
          <Label>Nom *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nom de la filiale"
            className="h-9 text-sm bg-background border-border"
          />
        </div>

        <AddressInput
          label="Adresse"
          value={formData.address as Address}
          onChange={(address) => setFormData({ ...formData, address })}
          savedAddresses={savedAddresses}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Téléphone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1234567890"
              className="h-9 text-sm bg-background border-border"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@filiale.com"
              className="h-9 text-sm bg-background border-border"
            />
          </div>
        </div>

        <div>
          <Label>Managers (sélection multiple)</Label>
          <SelectMultiple
            options={managers.map((manager) => ({
              value: manager.id,
              label: manager.name,
            }))}
            value={formData.selectedManagerIds}
            onChange={(values) => setFormData({ ...formData, selectedManagerIds: values })}
            placeholder={loadingManagers ? 'Chargement...' : 'Sélectionner les managers'}
            className="mt-2"
          />
          {formData.selectedManagerIds.length > 0 && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                {formData.selectedManagerIds.length} manager
                {formData.selectedManagerIds.length > 1 ? 's' : ''} sélectionné
                {formData.selectedManagerIds.length > 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </div>

        <div>
          <Label>Site web</Label>
          <Input
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="www.filiale.com"
            className="h-9 text-sm bg-background border-border"
          />
        </div>

        <div>
          <Label>Description</Label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description"
            className="h-9 text-sm bg-background border-border"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel} className="h-9 text-sm">
            Annuler
          </Button>
          <Button
            onClick={onSubmit}
            className="bg-etaxi-yellow hover:bg-yellow-500 text-black h-9 text-sm"
          >
            {editingSubsidiary ? 'Modifier' : 'Créer'}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default SubsidiaryForm;