import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shareds/components/ui/card';
import { Button } from '@/shareds/components/ui/button';
import { Input } from '@/shareds/components/ui/input';
import { Label } from '@/shareds/components/ui/label';
import { Badge } from '@/shareds/components/ui/badge';
import { Building2, Phone, Mail, Globe, Edit, Save, X, MapPin, Users, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/shareds/contexts/AuthContext';
import { AddressType, City, Country, Region, Address, AddressDto } from '@/shareds/types/addresse';
import { addressService } from '@/shareds/services/address.service';
import { AddressInput } from '@/shareds/components/addressComponent/AddressInput';
import { entrepriseService } from '../../services/entreprise.service';
import { Enterprise ,EntityStatus, UpdateEnterpriseDto } from '../../types/entreprise';
import { hasPermission } from '@/shareds/lib/utils';

export function CompanyPage() {
  const { user, refreshUser } = useAuth();
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

  const canUpdate = user && hasPermission(user, 'enterprises:update');

  if (user && !hasPermission(user, 'enterprises:read')) {
    return <div className="p-8 text-center text-red-600 font-bold text-xl">Accès refusé : vous n'avez pas la permission de voir cette page.</div>;
  }

  // Helper pour convertir Address en AddressDto
  function toAddressDto(address: Address): AddressDto {
    const { id, createdAt, updatedAt, deletedAt, city, region, country, ...rest } = address;
    return { ...rest };
  }

  // Initialize company and editedCompany
  useEffect(() => {
    if (user?.enterprise) {
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
        address: user.enterprise.address ? toAddressDto(user.enterprise.address) : undefined,
      });
    }
  }, [user]);

  // Fetch logo image when company.logoUrl changes
  useEffect(() => {
    let mounted = true;
    const fetchLogo = async () => {
      if (company?.logoUrl) {
        try {
          const imageUrl = await entrepriseService.getLogoImage(company.logoUrl);
          if (mounted) {
            setLogoUrl(imageUrl);
          }
        } catch (error) {
          if (mounted) {
            setLogoUrl(null);
          }
        }
      } else {
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
      setLogoPreview(previewUrl);
      return () => {
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
    value: string | EntityStatus | AddressType | number | boolean | undefined | File | AddressDto,
    isAddressField: boolean = false
  ) => {
    setEditedCompany((prev) => {
      if (!prev) return prev;

      if (isAddressField) {
        if (field === 'address' && value && typeof value === 'object') {
          return {
            ...prev,
            address: value as AddressDto,
          };
        }
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
      setLogoFile(file);
    }
  };

  const handleSave = async () => {
    if (!editedCompany || !company) return;

    // Convert Address to AddressDto for backend
    let addressDto = undefined;
    if (editedCompany.address) {
      if ('id' in editedCompany.address) {
        addressDto = toAddressDto(editedCompany.address as Address);
      } else {
        addressDto = editedCompany.address;
      }
    }

    const cleanedDto: UpdateEnterpriseDto = Object.entries(editedCompany).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== '' && !(typeof value === 'object' && Object.keys(value).length === 0 && key !== 'address')) {
          if (key === 'address') {
            if (addressDto) {
              acc.address = addressDto;
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
      const response = await entrepriseService.update(company.id, cleanedDto, logoFile);
      if (response.status === 200) {
        // Refresh user data after update
        await refreshUser();
        setIsEditing(false);
        setLogoFile(null);
        setLogoPreview(null);
        toast.success("Informations de l'Organisation mises à jour");
      } else {
        throw new Error('Update request was not successful');
      }
    } catch (error) {
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
            address: company.address ? toAddressDto(company.address) : undefined,
          }
        : null
    );
  };

  useEffect(() => {
    if (isEditing && countries.length === 0) {
      const fetchAddressData = async () => {
        try {
          setIsLoading(true);
          const countriesData = await addressService.getCountries();
          const regionsData = await addressService.getRegions();
          const citiesData = await addressService.getCities();
          setCountries(countriesData);
          setRegions(regionsData);
          setCities(citiesData);
        } catch (error) {
          toast.error('Failed to load address data');
        } finally {
          setIsLoading(false);
        }
      };
      fetchAddressData();
    }
  }, [isEditing]);

  if (!company) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold text-left">Gestion d'Organisation</h2>
        </div>
        <p className="text-muted-foreground text-center">Aucune information d'Organisation disponible.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold text-left">Gestion d'Organisation</h2>
        </div>

        {canUpdate && (!isEditing ? (
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
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-left">
             {isEditing && logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Preview Logo"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Company Logo"
                  className="w-10 h-10 rounded-full object-cover"
                  onError={() => setLogoUrl(null)}
                />
              ) : (
                <Building2 className="h-5 w-5" />
              )}
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

            <div className="text-left">
              <Label>Adresse</Label>
              {isEditing ? (
                <AddressInput
                  label="Adresse de l'Organisation"
                  value={editedCompany?.address || null}
                  onChange={(address) => {
                    if (address && 'id' in address) {
                      // C'est un Address complet, on convertit proprement
                      const dto = toAddressDto(address as Address);
                      // Forcer le typage de addressType si besoin
                      if (dto.addressType && typeof dto.addressType === 'string') {
                        // @ts-ignore
                        dto.addressType = dto.addressType as AddressType;
                      }
                      handleInputChange('address', dto, true);
                    } else if (address) {
                      // C'est déjà un AddressDto
                      handleInputChange('address', address as AddressDto, true);
                    } else {
                      handleInputChange('address', undefined, true);
                    }
                  }}
                  required={true}
                  showMapPicker={true}
                  showSavedAddresses={false}
                />
              ) : (
                <p className="font-medium text-left">{company.address?.formattedAddress || 'N/A'}</p>
              )}
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
              <span>Sous Organisation ({company.subsidiaries.length || 0})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {company.subsidiaries && company.subsidiaries.length > 0 ? (
              <div className="space-y-3">
                {company.subsidiaries.map((subsidiary) => (
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
                        {subsidiary.employeeCount || 0} Collaborateurs
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

