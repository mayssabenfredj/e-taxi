import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Phone, Mail, Globe, Edit, Save, X, MapPin, Users, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { AddressDto, Enterprise, EntityStatus, UpdateEnterpriseDto } from '@/types/entreprise';
import { useAuth } from '@/contexts/AuthContext';
import { AddressType, City, Country, Region } from '@/types/addresse';
import { entrepriseService } from '@/services/entreprise.service';
import { addressService } from '@/services/address.service';

export function CompanyPage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [company, setCompany] = useState<Enterprise | null>(null);
  const [editedCompany, setEditedCompany] = useState<UpdateEnterpriseDto | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch countries, regions, and cities on mount
  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        setIsLoading(true);
        const countriesData = await addressService.getCountries();
        const regionsData = await addressService.getRegions();
        const citiesData = await addressService.getCities();
        console.log('Countries Data:', countriesData.length);
        setCountries(countriesData);
        setRegions(regionsData);
        setCities(citiesData);
      } catch (error) {
        console.error('Error fetching address data:', error);
        toast.error('Failed to load address data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAddressData();
  }, []);

  // Initialize company and editedCompany
  useEffect(() => {
    if (user?.enterprise) {
      console.log('Enterprise data:', user.enterprise);
      setCompany(user.enterprise);
      setEditedCompany({
        titre: user.enterprise.name,
        mobile: user.enterprise.mobile || undefined,
        phone: user.enterprise.phone || undefined,
        email: user.enterprise.email || undefined,
        secteurActivite: user.enterprise.industry || undefined,
        matriculeFiscal: user.enterprise.taxId || undefined,
        status: user.enterprise.status || undefined,
        logoUrl: user.enterprise.logoUrl || undefined,
        address: user.enterprise.address
          ? {
              label: user.enterprise.address.label || undefined,
              street: user.enterprise.address.street || undefined,
              buildingNumber: user.enterprise.address.buildingNumber || undefined,
              complement: user.enterprise.address.complement || undefined,
              postalCode: user.enterprise.address.postalCode || undefined,
              cityId: user.enterprise.address.cityId || undefined,
              regionId: user.enterprise.address.regionId || undefined,
              countryId: user.enterprise.address.countryId || undefined,
              latitude: user.enterprise.address.latitude || undefined,
              longitude: user.enterprise.address.longitude || undefined,
              placeId: user.enterprise.address.placeId || undefined,
              formattedAddress: user.enterprise.address.formattedAddress || undefined,
              isVerified: user.enterprise.address.isVerified || undefined,
              isExact: user.enterprise.address.isExact || undefined,
              manuallyEntered: user.enterprise.address.manuallyEntered || undefined,
              addressType: user.enterprise.address.addressType || undefined,
              notes: user.enterprise.address.notes || undefined,
            }
          : undefined,
      });
    }
  }, [user]);

  // Fetch logo image when company.logoUrl changes
  useEffect(() => {
    let mounted = true;
    const fetchLogo = async () => {
      if (company?.logoUrl) {
        console.log('Fetching logo for:', company.logoUrl);
        try {
          const imageUrl = await entrepriseService.getLogoImage(company.logoUrl);
          if (mounted) {
            console.log('Set logoUrl:', imageUrl.substring(0, 50) + '...');
            setLogoUrl(imageUrl);
          }
        } catch (error) {
          console.error('Failed to fetch logo:', error);
          if (mounted) {
            setLogoUrl(null);
            toast.error('Failed to load company logo');
          }
        }
      } else {
        console.log('No logoUrl provided');
        if (mounted) {
          setLogoUrl(null);
        }
      }
    };
    fetchLogo();
    return () => {
      mounted = false;
    };
  }, [company?.logoUrl]);

  // Update logo preview when a new file is selected
  useEffect(() => {
    if (logoFile) {
      const previewUrl = URL.createObjectURL(logoFile);
      console.log('Set logo preview:', previewUrl);
      setLogoPreview(previewUrl);
      return () => {
        console.log('Revoking preview URL:', previewUrl);
        URL.revokeObjectURL(previewUrl);
      };
    } else {
      setLogoPreview(null);
    }
  }, [logoFile]);

  // Filter regions based on selected country
  const filteredRegions = (countryId?: string) =>
    countryId ? regions.filter((region) => region.countryId === countryId) : [];

  // Filter cities based on selected region
  const filteredCities = (regionId?: string) =>
    regionId ? cities.filter((city) => city.regionId === regionId) : [];

  const handleInputChange = (
    field: keyof UpdateEnterpriseDto | keyof AddressDto,
    value: string | EntityStatus | AddressType | number | boolean | undefined | File,
    isAddressField: boolean = false
  ) => {
    setEditedCompany((prev) => {
      if (!prev) return prev;

      if (isAddressField) {
        const currentAddress = prev.address || {};
        if (field === 'countryId') {
          return {
            ...prev,
            address: {
              ...currentAddress,
              countryId: value as string,
              regionId: undefined,
              cityId: undefined,
            },
          };
        } else if (field === 'regionId') {
          return {
            ...prev,
            address: {
              ...currentAddress,
              regionId: value as string,
              cityId: undefined,
            },
          };
        }
        return {
          ...prev,
          address: {
            ...currentAddress,
            [field]: value,
          },
        };
      }

      return { ...prev, [field]: value };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      console.log('Selected file:', file.name);
      setLogoFile(file);
    }
  };

  const handleSave = async () => {
    if (!editedCompany || !company) return;

    const cleanedDto: UpdateEnterpriseDto = Object.entries(editedCompany).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== '' && !(typeof value === 'object' && Object.keys(value).length === 0 && key !== 'address')) {
          if (key === 'address') {
            const cleanedAddress = Object.entries(value).reduce(
              (addrAcc, [addrKey, addrValue]) => {
                if (addrValue !== undefined && addrValue !== '') {
                  (addrAcc as Record<keyof AddressDto, any>)[addrKey as keyof AddressDto] = addrValue;
                }
                return addrAcc;
              },
              {} as AddressDto
            );
            if (Object.keys(cleanedAddress).length > 0) {
              acc.address = cleanedAddress;
            }
          } else {
            acc[key as keyof UpdateEnterpriseDto] = value;
          }
        }
        return acc;
      },
      {} as UpdateEnterpriseDto
    );

    try {
      console.log('Saving with DTO:', cleanedDto);
      console.log('Saving with file:', logoFile ? logoFile.name : 'No file');
      const response = await entrepriseService.update(company.id, cleanedDto, logoFile);
      console.log('Update response:', response.data);
      if (response.status === 200) {
        setCompany({
          ...company,
          name: cleanedDto.titre || company.name,
          mobile: cleanedDto.mobile || company.mobile,
          phone: cleanedDto.phone || company.phone,
          email: cleanedDto.email || company.email,
          industry: cleanedDto.secteurActivite || company.industry,
          taxId: cleanedDto.matriculeFiscal || company.taxId,
          status: cleanedDto.status || company.status,
          logoUrl: response.data.logoUrl || company.logoUrl,
          address: cleanedDto.address
            ? {
                ...company.address,
                ...cleanedDto.address,
                city: cleanedDto.address.cityId
                  ? cities.find((c) => c.id === cleanedDto.address.cityId) || company.address?.city
                  : company.address?.city,
                region: cleanedDto.address.regionId
                  ? regions.find((r) => r.id === cleanedDto.address.regionId) || company.address?.region
                  : company.address?.region,
                country: cleanedDto.address.countryId
                  ? countries.find((c) => c.id === cleanedDto.address.countryId) || company.address?.country
                  : company.address?.country,
              }
            : company.address,
        });
        setIsEditing(false);
        setLogoFile(null);
        setLogoPreview(null);
        toast.success("Informations de l'entreprise mises à jour");
      } else {
        throw new Error('Update request was not successful');
      }
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update enterprise');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLogoFile(null);
    setLogoPreview(null);
    setEditedCompany(
      company
        ? {
            titre: company.name,
            mobile: company.mobile || undefined,
            phone: company.phone || undefined,
            email: company.email || undefined,
            secteurActivite: company.industry || undefined,
            matriculeFiscal: company.taxId || undefined,
            status: company.status || undefined,
            logoUrl: company.logoUrl || undefined,
            address: company.address
              ? {
                  label: company.address.label || undefined,
                  street: company.address.street || undefined,
                  buildingNumber: company.address.buildingNumber || undefined,
                  complement: company.address.complement || undefined,
                  postalCode: company.address.postalCode || undefined,
                  cityId: company.address.cityId || undefined,
                  regionId: company.address.regionId || undefined,
                  countryId: company.address.countryId || undefined,
                  latitude: company.address.latitude || undefined,
                  longitude: company.address.longitude || undefined,
                  placeId: company.address.placeId || undefined,
                  formattedAddress: company.address.formattedAddress || undefined,
                  isVerified: company.address.isVerified || undefined,
                  isExact: company.address.isExact || undefined,
                  manuallyEntered: company.address.manuallyEntered || undefined,
                  addressType: company.address.addressType || undefined,
                  notes: company.address.notes || undefined,
                }
              : undefined,
          }
        : null
    );
  };

  if (!company) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold text-left">Gestion de l'Entreprise</h2>
        </div>
        <p className="text-muted-foreground text-center">Aucune information d'entreprise disponible.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold text-left">Gestion de l'Entreprise</h2>
        </div>

        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="bg-etaxi-yellow hover:bg-yellow-500 text-black">
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            <Button onClick={handleSave} className="bg-etaxi-yellow hover:bg-yellow-500 text-black">
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-left">
             {logoUrl ? (
              <img
                  src={logoUrl}
                  alt="Company Logo"
                  className="w-10 h-10 rounded-full  object-cover"
                  onError={(e) => {
                    console.error('Image load error:', e);
                    setLogoUrl(null);
                  }}
              />):(
                <Building2 className="h-5 w-5" />
              )
}
              <span>Informations générales</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
            

            {isEditing && (
              <>
                <input
                  type="file"
                  id="logo-image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Label htmlFor="logo-image">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Changer le logo
                    </span>
                  </Button>
                </Label>
              </>
              )}
              </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-left">
                <Label htmlFor="name">Nom commercial</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editedCompany?.titre || ''}
                    onChange={(e) => handleInputChange('titre', e.target.value)}
                  />
                ) : (
                  <p className="font-medium text-left">{company.name}</p>
                )}
              </div>

              <div className="text-left">
                <Label htmlFor="legalName">Raison sociale</Label>
                {isEditing ? (
                  <Input
                    id="legalName"
                    value={editedCompany?.secteurActivite || ''}
                    onChange={(e) => handleInputChange('secteurActivite', e.target.value)}
                  />
                ) : (
                  <p className="font-medium text-left">{company.industry || 'N/A'}</p>
                )}
              </div>
            </div>

            <div className="text-left">
              <Label htmlFor="taxId">Numéro fiscal</Label>
              {isEditing ? (
                <Input
                  id="taxId"
                  value={editedCompany?.matriculeFiscal || ''}
                  onChange={(e) => handleInputChange('matriculeFiscal', e.target.value)}
                />
              ) : (
                <p className="font-medium text-left">{company.taxId || 'N/A'}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 text-left">
                <Label htmlFor="formattedAddress">Adresse</Label>
                {isEditing ? (
                  <Input
                    id="formattedAddress"
                    value={editedCompany?.address?.formattedAddress || ''}
                    onChange={(e) => handleInputChange('formattedAddress', e.target.value, true)}
                  />
                ) : (
                  <p className="font-medium text-left">{company.address?.formattedAddress || 'N/A'}</p>
                )}
              </div>

              <div className="text-left">
                <Label htmlFor="postalCode">Code postal</Label>
                {isEditing ? (
                  <Input
                    id="postalCode"
                    value={editedCompany?.address?.postalCode || ''}
                    onChange={(e) => handleInputChange('postalCode', e.target.value, true)}
                  />
                ) : (
                  <p className="font-medium text-left">{company.address?.postalCode || 'N/A'}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-left">
                <Label htmlFor="countryId">Pays</Label>
                {isEditing ? (
                  isLoading ? (
                    <p>Loading countries...</p>
                  ) : countries.length === 0 ? (
                    <p className="text-red-500">No countries available</p>
                  ) : (
                    <select
                      id="countryId"
                      value={editedCompany?.address?.countryId || ''}
                      onChange={(e) => handleInputChange('countryId', e.target.value, true)}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="">Sélectionner un pays</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  )
                ) : (
                  <p className="font-medium text-left">{company.address?.country?.name || 'N/A'}</p>
                )}
              </div>

              <div className="text-left">
                <Label htmlFor="regionId">Région</Label>
                {isEditing ? (
                  <select
                    id="regionId"
                    value={editedCompany?.address?.regionId || ''}
                    onChange={(e) => handleInputChange('regionId', e.target.value, true)}
                    className="w-full border rounded-md p-2"
                    disabled={!editedCompany?.address?.countryId}
                  >
                    <option value="">Sélectionner une région</option>
                    {filteredRegions(editedCompany?.address?.countryId).map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="font-medium text-left">{company.address?.region?.name || 'N/A'}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-left">
                <Label htmlFor="cityId">Ville</Label>
                {isEditing ? (
                  <select
                    id="cityId"
                    value={editedCompany?.address?.cityId || ''}
                    onChange={(e) => handleInputChange('cityId', e.target.value, true)}
                    className="w-full border rounded-md p-2"
                    disabled={!editedCompany?.address?.regionId}
                  >
                    <option value="">Sélectionner une ville</option>
                    {filteredCities(editedCompany?.address?.regionId).map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="font-medium text-left">{company.address?.city?.name || 'N/A'}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-left">
                <Label htmlFor="phone">Téléphone</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={editedCompany?.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-left">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{company.phone || 'N/A'}</span>
                  </div>
                )}
              </div>

              <div className="text-left">
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={editedCompany?.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-left">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{company.email || 'N/A'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 
            <div className="text-left">
              <Label htmlFor="website">Site</Label>
              {isEditing ? (
                <Input
                  id="website"
                  value={editedCompany?.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
              ) : (
                company.website ? (
                  <div className="flex items-center space-x-2 text-left">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-700 hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                ) : (
                  <p className="font-medium text-left">N/A</p>
                )
              )}
            </div>
            */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-left">
              <Building2 className="h-5 w-5" />
              <span>Filiales ({user?.subsidiary?.length || 0})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user?.subsidiary && user.subsidiary.length > 0 ? (
              <div className="space-y-3">
                {user.subsidiary.map((subsidiary) => (
                  <div key={subsidiary.id} className="p-3 border rounded-lg">
                    <div className="font-medium text-sm text-left">{subsidiary.name}</div>
                    <div className="flex items-start space-x-1 mt-1 text-left">
                      <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">
                        {subsidiary.address?.formattedAddress || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="secondary" className="text-xs text-left">
                        <Users className="h-3 w-3 mr-1" />
                        {subsidiary.employeeCount || 0} employés
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center text-left">No Filiale For Now</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

