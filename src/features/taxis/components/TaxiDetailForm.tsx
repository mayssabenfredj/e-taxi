import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shareds/components/ui/card';
import { Button } from '@/shareds/components/ui/button';
import { Input } from '@/shareds/components/ui/input';
import { Label } from '@/shareds/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shareds/components/ui/select';
import { Badge } from '@/shareds/components/ui/badge';
import { Switch } from '@/shareds/components/ui/switch';
import { Calendar } from '@/shareds/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shareds/components/ui/popover';
import { CalendarIcon, Car, User, Star, UserX, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
  rating: number;
  totalRides: number;
  status: 'active' | 'inactive' | 'suspended';
}

interface TaxiFormData {
  id?: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number | null;
  capacity: number;
  active: boolean;
  status: 'available' | 'busy' | 'offline' | 'maintenance';
  lastMaintenance: Date | null;
  nextMaintenance: Date | null;
  driverId: string | null;
  preferredDrivers: string[];
  blacklistedDrivers: string[];
}

interface TaxiDetailFormProps {
  taxi?: TaxiFormData;
  onSave: (taxi: TaxiFormData) => void;
  onCancel: () => void;
}

export function TaxiDetailForm({ taxi, onSave, onCancel }: TaxiDetailFormProps) {
  const [formData, setFormData] = useState<TaxiFormData>({
    licensePlate: '',
    make: '',
    model: '',
    year: null,
    capacity: 4,
    active: true,
    status: 'available',
    lastMaintenance: null,
    nextMaintenance: null,
    driverId: null,
    preferredDrivers: [],
    blacklistedDrivers: [],
    ...taxi
  });

  // Mock drivers data - in real app, this would come from API
  const [availableDrivers] = useState<Driver[]>([
    {
      id: '1',
      name: 'Ahmed Hassan',
      licenseNumber: 'DL123456',
      licenseExpiry: '2025-12-31',
      rating: 4.8,
      totalRides: 1247,
      status: 'active'
    },
    {
      id: '2',
      name: 'Marie Dubois',
      licenseNumber: 'DL789012',
      licenseExpiry: '2026-06-15',
      rating: 4.9,
      totalRides: 892,
      status: 'active'
    },
    {
      id: '3',
      name: 'Jean Moreau',
      licenseNumber: 'DL345678',
      licenseExpiry: '2025-09-20',
      rating: 4.6,
      totalRides: 2156,
      status: 'active'
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addPreferredDriver = (driverId: string) => {
    if (driverId && !formData.preferredDrivers.includes(driverId) && !formData.blacklistedDrivers.includes(driverId)) {
      setFormData(prev => ({
        ...prev,
        preferredDrivers: [...prev.preferredDrivers, driverId]
      }));
    }
  };

  const removePreferredDriver = (driverId: string) => {
    setFormData(prev => ({
      ...prev,
      preferredDrivers: prev.preferredDrivers.filter(id => id !== driverId)
    }));
  };

  const addBlacklistedDriver = (driverId: string) => {
    if (driverId && !formData.blacklistedDrivers.includes(driverId) && !formData.preferredDrivers.includes(driverId)) {
      setFormData(prev => ({
        ...prev,
        blacklistedDrivers: [...prev.blacklistedDrivers, driverId]
      }));
    }
  };

  const removeBlacklistedDriver = (driverId: string) => {
    setFormData(prev => ({
      ...prev,
      blacklistedDrivers: prev.blacklistedDrivers.filter(id => id !== driverId)
    }));
  };

  const getDriverById = (id: string) => availableDrivers.find(d => d.id === id);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Car className="h-6 w-6 text-etaxi-yellow" />
          <span>{taxi ? 'Modifier le taxi' : 'Ajouter un taxi'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="licensePlate">Plaque d'immatriculation *</Label>
              <Input
                id="licensePlate"
                value={formData.licensePlate}
                onChange={(e) => setFormData(prev => ({ ...prev, licensePlate: e.target.value }))}
                placeholder="AB-123-CD"
                required
              />
            </div>
            <div>
              <Label htmlFor="make">Marque *</Label>
              <Input
                id="make"
                value={formData.make}
                onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                placeholder="Toyota"
                required
              />
            </div>
            <div>
              <Label htmlFor="model">Modèle *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                placeholder="Prius"
                required
              />
            </div>
            <div>
              <Label htmlFor="year">Année</Label>
              <Input
                id="year"
                type="number"
                value={formData.year || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value ? parseInt(e.target.value) : null }))}
                placeholder="2023"
              />
            </div>
            <div>
              <Label htmlFor="capacity">Capacité *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="8"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="busy">Occupé</SelectItem>
                  <SelectItem value="offline">Hors ligne</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actif/Inactif */}
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
            />
            <Label htmlFor="active">Taxi actif</Label>
          </div>

          {/* Chauffeur assigné */}
          <div>
            <Label htmlFor="driver">Chauffeur assigné</Label>
            <Select
              value={formData.driverId || 'none'}
              onValueChange={(value) => setFormData(prev => ({ ...prev, driverId: value === 'none' ? null : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un chauffeur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun chauffeur</SelectItem>
                {availableDrivers.filter(d => d.status === 'active').map(driver => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name} - ⭐ {driver.rating}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Maintenance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Dernière maintenance</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.lastMaintenance ? (
                      format(formData.lastMaintenance, 'PPP', { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.lastMaintenance}
                    onSelect={(date) => setFormData(prev => ({ ...prev, lastMaintenance: date || null }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Prochaine maintenance</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.nextMaintenance ? (
                      format(formData.nextMaintenance, 'PPP', { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.nextMaintenance}
                    onSelect={(date) => setFormData(prev => ({ ...prev, nextMaintenance: date || null }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Chauffeurs préférés */}
          <div>
            <Label>Chauffeurs préférés</Label>
            <div className="space-y-2">
              <Select onValueChange={addPreferredDriver}>
                <SelectTrigger>
                  <SelectValue placeholder="Ajouter un chauffeur préféré" />
                </SelectTrigger>
                <SelectContent>
                  {availableDrivers
                    .filter(d => !formData.preferredDrivers.includes(d.id) && !formData.blacklistedDrivers.includes(d.id))
                    .map(driver => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} - ⭐ {driver.rating}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2">
                {formData.preferredDrivers.map(driverId => {
                  const driver = getDriverById(driverId);
                  if (!driver) return null;
                  return (
                    <Badge key={driverId} variant="secondary" className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {driver.name}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => removePreferredDriver(driverId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chauffeurs blacklistés */}
          <div>
            <Label>Chauffeurs blacklistés</Label>
            <div className="space-y-2">
              <Select onValueChange={addBlacklistedDriver}>
                <SelectTrigger>
                  <SelectValue placeholder="Ajouter un chauffeur à la blacklist" />
                </SelectTrigger>
                <SelectContent>
                  {availableDrivers
                    .filter(d => !formData.blacklistedDrivers.includes(d.id) && !formData.preferredDrivers.includes(d.id))
                    .map(driver => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} - ⭐ {driver.rating}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2">
                {formData.blacklistedDrivers.map(driverId => {
                  const driver = getDriverById(driverId);
                  if (!driver) return null;
                  return (
                    <Badge key={driverId} variant="destructive" className="flex items-center gap-1">
                      <UserX className="h-3 w-3" />
                      {driver.name}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 text-white hover:text-red-100"
                        onClick={() => removeBlacklistedDriver(driverId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" className="bg-etaxi-yellow hover:bg-yellow-500 text-black">
              {taxi ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
