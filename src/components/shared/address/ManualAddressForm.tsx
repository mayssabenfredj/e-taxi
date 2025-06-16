import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { addressService } from '@/services/address.service';
import { Address, AddressType, City, Region, Country } from '@/types/addresse';

interface ManualAddressFormProps {
  onSubmit: (address: Address) => void;
}

export function ManualAddressForm({ onSubmit }: ManualAddressFormProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    label: '',
    street: '',
    buildingNumber: '',
    complement: '',
    postalCode: '',
    countryId: '',
    regionId: '',
    cityId: '',
  });

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const data = await addressService.getCountries();
        setCountries(data);
      } catch (error) {
        toast.error('Erreur lors du chargement des pays');
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, []);

  // Fetch regions when country changes
  useEffect(() => {
    if (!formData.countryId) {
      setRegions([]);
      setCities([]);
      setFormData((prev) => ({ ...prev, regionId: '', cityId: '' }));
      return;
    }

    const fetchRegions = async () => {
      try {
        setLoading(true);
        const data = await addressService.getRegions();
        const filteredRegions = data.filter((region) => region.countryId === formData.countryId);
        setRegions(filteredRegions);
      } catch (error) {
        toast.error('Erreur lors du chargement des régions');
      } finally {
        setLoading(false);
      }
    };
    fetchRegions();
  }, [formData.countryId]);

  // Fetch cities when region changes
  useEffect(() => {
    if (!formData.regionId) {
      setCities([]);
      setFormData((prev) => ({ ...prev, cityId: '' }));
      return;
    }

    const fetchCities = async () => {
      try {
        setLoading(true);
        const data = await addressService.getCities();
        const filteredCities = data.filter((city) => city.regionId === formData.regionId);
        setCities(filteredCities);
      } catch (error) {
        toast.error('Erreur lors du chargement des villes');
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, [formData.regionId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.street || !formData.postalCode || !formData.cityId) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const selectedCity = cities.find((city) => city.id === formData.cityId);
    const selectedRegion = regions.find((region) => region.id === formData.regionId);
    const selectedCountry = countries.find((country) => country.id === formData.countryId);

    const address: Address = {
      id: `manual-${Date.now()}`,
      label: formData.label || null,
      street: formData.street,
      buildingNumber: formData.buildingNumber || null,
      complement: formData.complement || null,
      postalCode: formData.postalCode,
      cityId: formData.cityId,
      regionId: formData.regionId || null,
      countryId: formData.countryId,
      latitude: null,
      longitude: null,
      placeId: null,
      formattedAddress: [
        formData.street,
        formData.buildingNumber,
        formData.complement,
        formData.postalCode,
        selectedCity?.name,
        selectedCountry?.name,
      ]
        .filter(Boolean)
        .join(', '),
      isVerified: false,
      isExact: false,
      manuallyEntered: true,
      addressType: AddressType.CUSTOM,
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      city: selectedCity || null,
      region: selectedRegion || null,
      country: selectedCountry || null,
    };

    onSubmit(address);
    toast.success('Adresse enregistrée');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Label</Label>
        <Input
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          placeholder="Nom de l'adresse"
        />
      </div>

      <div>
        <Label>Rue *</Label>
        <Input
          value={formData.street}
          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
          placeholder="Nom de la rue"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>N° bâtiment</Label>
          <Input
            value={formData.buildingNumber}
            onChange={(e) => setFormData({ ...formData, buildingNumber: e.target.value })}
            placeholder="N°"
          />
        </div>
        <div>
          <Label>Complément</Label>
          <Input
            value={formData.complement}
            onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
            placeholder="Apt, étage, etc."
          />
        </div>
      </div>

      <div>
        <Label>Code postal *</Label>
        <Input
          value={formData.postalCode}
          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
          placeholder="Code postal"
          required
        />
      </div>

      <div>
        <Label>Pays *</Label>
        <Select
          value={formData.countryId}
          onValueChange={(value) => setFormData({ ...formData, countryId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un pays" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.id} value={country.id}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Région</Label>
        <Select
          value={formData.regionId}
          onValueChange={(value) => setFormData({ ...formData, regionId: value })}
          disabled={!formData.countryId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une région" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region.id} value={region.id}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Ville *</Label>
        <Select
          value={formData.cityId}
          onValueChange={(value) => setFormData({ ...formData, cityId: value })}
          disabled={!formData.regionId}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une ville" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full bg-etaxi-yellow hover:bg-yellow-500 text-black">
        Utiliser cette adresse
      </Button>
    </form>
  );
}