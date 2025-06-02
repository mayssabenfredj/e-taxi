import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Phone, Mail, Users, Globe, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface Company {
  id: string;
  name: string;
  legalName: string;
  siret: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  description?: string;
  subsidiaries: Subsidiary[];
}

interface Subsidiary {
  id: string;
  name: string;
  address: string;
  city: string;
  employeeCount: number;
}

export function CompanyPage() {
  const [isEditing, setIsEditing] = useState(false);
  
  const [company, setCompany] = useState<Company>({
    id: '1',
    name: 'TechCorp SARL',
    legalName: 'TechCorp Solutions SARL',
    siret: '12345678901234',
    address: '123 Avenue des Champs-Élysées',
    city: 'Paris',
    postalCode: '75008',
    country: 'France',
    phone: '+33 1 42 86 87 88',
    email: 'contact@techcorp.fr',
    website: 'https://www.techcorp.fr',
    description: 'Entreprise spécialisée dans les solutions technologiques innovantes.',
    subsidiaries: [
      {
        id: '1',
        name: 'TechCorp Paris',
        address: '123 Avenue des Champs-Élysées, 75008 Paris',
        city: 'Paris',
        employeeCount: 150
      },
      {
        id: '2',
        name: 'TechCorp Lyon',
        address: '45 Rue de la République, 69002 Lyon',
        city: 'Lyon',
        employeeCount: 75
      },
      {
        id: '3',
        name: 'TechCorp Marseille',
        address: '78 La Canebière, 13001 Marseille',
        city: 'Marseille',
        employeeCount: 50
      }
    ]
  });

  const [editedCompany, setEditedCompany] = useState<Company>(company);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedCompany(company);
  };

  const handleSave = () => {
    setCompany(editedCompany);
    setIsEditing(false);
    toast.success('Informations de l\'entreprise mises à jour');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedCompany(company);
  };

  const handleInputChange = (field: keyof Company, value: string) => {
    setEditedCompany(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
            <div className='text-left'>
              <Label htmlFor="name">Nom commercial</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editedCompany.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              ) : (
                <p className="font-medium text-left">{company.name}</p>
              )}
            </div>

            <div className='text-left'>
              <Label htmlFor="legalName">Raison sociale</Label>
              {isEditing ? (
                <Input
                  id="legalName"
                  value={editedCompany.legalName}
                  onChange={(e) => handleInputChange('legalName', e.target.value)}
                />
              ) : (
                <p className="font-medium text-left">{company.legalName}</p>
              )}
            </div>
          </div>

          <div className='text-left'>
            <Label htmlFor="siret">SIRET</Label>
            {isEditing ? (
              <Input
                id="siret"
                value={editedCompany.siret}
                onChange={(e) => handleInputChange('siret', e.target.value)}
              />
            ) : (
              <p className="font-medium text-left">{company.siret}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 text-left">
              <Label htmlFor="address">Adresse</Label>
              {isEditing ? (
                <Input
                  id="address"
                  value={editedCompany.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              ) : (
                <p className="font-medium text-left">{company.address}</p>
              )}
            </div>

            <div className='text-left'>
              <Label htmlFor="postalCode">Code postal</Label>
              {isEditing ? (
                <Input
                  id="postalCode"
                  value={editedCompany.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                />
              ) : (
                <p className="font-medium text-left">{company.postalCode}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className='text-left'>
              <Label htmlFor="city">Ville</Label>
              {isEditing ? (
                <Input
                  id="city"
                  value={editedCompany.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              ) : (
                <p className="font-medium text-left">{company.city}</p>
              )}
            </div>

            <div className='text-left'>
              <Label htmlFor="country">Pays</Label>
              {isEditing ? (
                <Input
                  id="country"
                  value={editedCompany.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                />
              ) : (
                <p className="font-medium text-left">{company.country}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className='text-left'>
              <Label htmlFor="phone">Téléphone</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={editedCompany.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              ) : (
                <div className="flex items-center space-x-2 text-left">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{company.phone}</span>
                </div>
              )}
            </div>

            <div className='text-left'>
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={editedCompany.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              ) : (
                <div className="flex items-center space-x-2 text-left">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{company.email}</span>
                </div>
              )}
            </div>
          </div>

          <div className='text-left'>
            <Label htmlFor="website">Site web</Label>
            {isEditing ? (
              <Input
                id="website"
                value={editedCompany.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
              />
            ) : (
              company.website && (
                <div className="flex items-center space-x-2 text-left">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {company.website}
                  </a>
                </div>
              )
            )}
          </div>

          <div className='text-left'>
            <Label htmlFor="description">Description</Label>
            {isEditing ? (
              <Textarea
                id="description"
                value={editedCompany.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            ) : (
              <p className="text-muted-foreground text-left">{company.description}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filiales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-left">
            <Building2 className="h-5 w-5" />
            <span>Filiales ({company.subsidiaries.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {company.subsidiaries.map((subsidiary) => (
              <div key={subsidiary.id} className="p-3 border rounded-lg">
                <div className="font-medium text-sm text-left">{subsidiary.name}</div>
                <div className="flex items-start space-x-1 mt-1 text-left">
                  <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">{subsidiary.address}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="secondary" className="text-xs text-left">
                    <Users className="h-3 w-3 mr-1" />
                    {subsidiary.employeeCount} employés
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);
}
