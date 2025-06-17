import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddressInput } from '@/components/shared/AddressInput';
import { Address, AddressType } from '@/types/addresse';
import { FormData, Manager, Subsidiary } from '@/types/subsidiary';

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
  managers,
  savedAddresses,
  onSubmit,
  onCancel,
}) => {
  const handleManagerToggle = (managerId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedManagerIds: prev.selectedManagerIds.includes(managerId)
        ? prev.selectedManagerIds.filter((id) => id !== managerId)
        : [...prev.selectedManagerIds, managerId],
    }));
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto border rounded p-3">
            {managers.map((manager) => (
              <div key={manager.id} className="flex items-center space-x-2">
                <Checkbox
                  id={manager.id}
                  checked={formData.selectedManagerIds.includes(manager.id)}
                  onCheckedChange={() => handleManagerToggle(manager.id)}
                />
                <Label htmlFor={manager.id} className="text-sm cursor-pointer">
                  {manager.name}
                </Label>
              </div>
            ))}
          </div>
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