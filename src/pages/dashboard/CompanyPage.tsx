import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Phone, Mail, Globe, Edit, Save, X, MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Enterprise  } from '@/types/entreprise';
import { useAuth } from '@/contexts/AuthContext';
import { Address, City, Country, } from '@/types/addresse';

export function CompanyPage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [company, setCompany] = useState<Enterprise | null>(null);
  const [editedCompany, setEditedCompany] = useState<Enterprise | null>(null);

  useEffect(() => {
    if (user?.enterprise) {
      setCompany(user.enterprise);
      setEditedCompany(user.enterprise);
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedCompany(company);
  };

  const handleSave = () => {
    if (editedCompany) {
      setCompany(editedCompany);
      setIsEditing(false);
      toast.success("Informations de l'entreprise mises à jour");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedCompany(company);
  };

  const handleInputChange = (
    field: keyof Enterprise | keyof Address | 'cityName' | 'countryName',
    value: string,
    isAddressField: boolean = false
  ) => {
    setEditedCompany((prev) => {
      if (!prev) return prev;

      if (isAddressField) {
        const currentAddress = prev.address || {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (field === 'cityName') {
          return {
            ...prev,
            address: {
              ...currentAddress,
              city: {
                ...currentAddress.city,
                id: currentAddress.city?.id || crypto.randomUUID(),
                name: value,
              } as City,
            },
          };
        }

        if (field === 'countryName') {
          return {
            ...prev,
            address: {
              ...currentAddress,
              country: {
                ...currentAddress.country,
                id: currentAddress.country?.id || crypto.randomUUID(),
                name: value,
              } as Country,
            },
          };
        }

        return {
          ...prev,
          address: {
            ...currentAddress,
            [field]: value,
            updatedAt: new Date().toISOString(),
          },
        };
      }

      return { ...prev, [field]: value };
    });
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
          <Button onClick={handleEdit} className="bg-etaxi-yellow hover:bg-yellow-500 text-black">
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
        {/* Informations générales */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-left">
              <Building2 className="h-5 w-5" />
              <span>Informations générales</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-left">
                <Label htmlFor="name">Nom commercial</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editedCompany?.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
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
                    value={editedCompany?.legalName || ''}
                    onChange={(e) => handleInputChange('legalName', e.target.value)}
                  />
                ) : (
                  <p className="font-medium text-left">{company.legalName || 'N/A'}</p>
                )}
              </div>
            </div>

            <div className="text-left">
              <Label htmlFor="taxId">Numéro fiscal</Label>
              {isEditing ? (
                <Input
                  id="taxId"
                  value={editedCompany?.taxId || ''}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
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
                  <p className="font-medium text-left">
                    {company.address?.formattedAddress || 'N/A'}
                  </p>
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
                <Label htmlFor="city">Ville</Label>
                {isEditing ? (
                  <Input
                    id="city"
                    value={editedCompany?.address?.city?.name || ''}
                    onChange={(e) => handleInputChange('cityName', e.target.value, true)}
                  />
                ) : (
                  <p className="font-medium text-left">{company.address?.city?.name || 'N/A'}</p>
                )}
              </div>

              <div className="text-left">
                <Label htmlFor="country">Pays</Label>
                {isEditing ? (
                  <Input
                    id="country"
                    value={editedCompany?.address?.country?.name || ''}
                    onChange={(e) => handleInputChange('countryName', e.target.value, true)}
                  />
                ) : (
                  <p className="font-medium text-left">{company.address?.country?.name || 'N/A'}</p>
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
          </CardContent>
        </Card>

        {/* Filiales */}
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