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
import validator from 'validator';

interface SubsidiaryFormProps {
  editingSubsidiary: Subsidiary | null;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  managers: Manager[];
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

const SubsidiaryForm: React.FC<SubsidiaryFormProps> = ({
  editingSubsidiary,
  formData,
  setFormData,
  managers,
  onSubmit,
  onCancel,
}) => {
  const [loadingManagers, setLoadingManagers] = useState(false);

  // Validate phone number: must start with +216 and be 12 characters long
  const validatePhone = (phone: string): boolean => {
    return phone.startsWith('+216') && phone.length === 12 && validator.isMobilePhone(phone, 'any');
  };

  // Handle form submission with validation
  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Le nom de la filiale est requis');
      return;
    }
    if (!formData.email) {
      toast.error("L'email est requis");
      return;
    }
    if (!validator.isEmail(formData.email)) {
      toast.error('Veuillez entrer un email valide');
      return;
    }
    if (!formData.phone) {
      toast.error('Le numéro de téléphone est requis');
      return;
    }
    if (!validatePhone(formData.phone)) {
      toast.error('Le numéro de téléphone doit commencer par +216 et contenir exactement 12 chiffres (ex: +21658063156)');
      return;
    }
    if (!formData.address) {
      toast.error("L'adresse est requise");
      return;
    }

    await onSubmit();
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto my-4 mx-4">
      <DialogHeader>
        <DialogTitle className="text-left">
          {editingSubsidiary ? 'Modifier la Filiale' : 'Nouvelle Filiale'}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 p-1">
        <div>
          <Label>
            Nom <span className="text-red-500">*</span>
          </Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nom de la filiale"
            className="h-9 text-sm bg-background border-border"
            required
          />
        </div>

        <div>
          <Label>
          </Label>
          <AddressInput
            label="Adresse"
            value={formData.address as Address}
            onChange={(address) => setFormData({ ...formData, address: address as Address })}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>
              Téléphone <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+21658063156"
              className="h-9 text-sm bg-background border-border"
              required
            />
          </div>
          <div>
            <Label>
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@filiale.com"
              className="h-9 text-sm bg-background border-border"
              required
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
            onClick={handleSubmit}
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