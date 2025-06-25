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
  initialAddress?: any;
}

export function ManualAddressForm({ onSubmit, initialAddress }: ManualAddressFormProps) {
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
        // Sélectionner Tunisie par défaut si aucun pays n'est sélectionné
        if (!formData.countryId && !initialAddress) {
          const tn = data.find(
            (c) => c.name.toLowerCase() === 'tunisie' || c.name.toLowerCase() === 'tunisia' || c.code === 'TN'
          );
          if (tn) {
            setFormData((prev) => ({ ...prev, countryId: tn.id }));
          }
        }
      } catch (error) {
        toast.error('Erreur lors du chargement des pays');
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, []); // Dépendance vide pour exécuter une seule fois au montage

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
        toast.error('Erreur lors du chargement des Gouvernorats');
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

  // Initialize form with initialAddress
  useEffect(() => {
    if (initialAddress) {
      setFormData({
        label: initialAddress.label || '',
        street: initialAddress.street || '',
        buildingNumber: initialAddress.buildingNumber || '',
        complement: initialAddress.complement || '',
        postalCode: initialAddress.postalCode || '',
        countryId: initialAddress.countryId || '',
        regionId: initialAddress.regionId || '',
        cityId: initialAddress.cityId || '',
      });
    }
  }, [initialAddress]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.street || !formData.postalCode || !formData.cityId || !formData.countryId) {
      toast.error('Veuillez remplir tous les champs obligatoires (Rue, Code postal, Pays, Ville)');
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

    console.log('Submitting address:', address); // Debugging
    onSubmit(address);
    toast.success('Adresse enregistrée');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-full p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label className="text-sm">Rue *</Label>
          <Input
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            placeholder="Nom de la rue"
            required
            className="text-sm h-10"
          />
        </div>
        <div>
          <Label className="text-sm">N° bâtiment</Label>
          <Input
            value={formData.buildingNumber}
            onChange={(e) => setFormData({ ...formData, buildingNumber: e.target.value })}
            placeholder="N°"
            className="text-sm h-10"
          />
        </div>
        <div>
          <Label className="text-sm">Complément</Label>
          <Input
            value={formData.complement}
            onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
            placeholder="Apt, étage, etc."
            className="text-sm h-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label className="text-sm">Pays *</Label>
          <Select
            value={formData.countryId}
            onValueChange={(value) => setFormData({ ...formData, countryId: value })}
            required
          >
            <SelectTrigger className="text-sm h-10">
              <SelectValue>
                {countries.find((country) => country.id === formData.countryId)?.name || 'Sélectionner un pays'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <div className="text-center py-2">Chargement...</div>
              ) : (
                countries.map((country) => (
                  <SelectItem key={country.id} value={country.id} className="text-sm">
                    {country.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm">Gouvernorat</Label>
          <Select
            value={formData.regionId}
            onValueChange={(value) => setFormData({ ...formData, regionId: value })}
            disabled={!formData.countryId || loading}
          >
            <SelectTrigger className="text-sm h-10">
              <SelectValue placeholder="Sélectionner une Gouvernorat" />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <div className="text-center py-2">Chargement...</div>
              ) : (
                regions.map((region) => (
                  <SelectItem key={region.id} value={region.id} className="text-sm">
                    {region.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm">Ville *</Label>
          <Select
            value={formData.cityId}
            onValueChange={(value) => setFormData({ ...formData, cityId: value })}
            disabled={!formData.regionId || loading}
            required
          >
            <SelectTrigger className="text-sm h-10">
              <SelectValue placeholder="Sélectionner une ville" />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <div className="text-center py-2">Chargement...</div>
              ) : (
                cities.map((city) => (
                  <SelectItem key={city.id} value={city.id} className="text-sm">
                    {city.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-sm">Code postal *</Label>
        <Input
          value={formData.postalCode}
          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
          placeholder="Code postal"
          required
          className="text-sm h-10"
        />
      </div>

      <div>
        <Label className="text-sm">Label</Label>
        <Input
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          placeholder="Nom de l'adresse"
          className="text-sm h-10"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-etaxi-yellow hover:bg-yellow-500 text-black text-sm h-10"
        disabled={loading}
      >
        {loading ? 'Chargement...' : 'Utiliser cette adresse'}
      </Button>
    </form>
  );
}