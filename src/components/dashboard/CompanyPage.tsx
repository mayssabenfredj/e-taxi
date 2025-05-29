
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { AddressInput } from '../shared/AddressInput';
import { Building2, Upload, Save } from 'lucide-react';
import { toast } from 'sonner';

interface CompanyInfo {
  name: string;
  address: any;
  phone: string;
  sector: string;
  logo: string;
  description: string;
}

export function CompanyPage() {
  const { t } = useLanguage();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'Ma Société',
    address: null,
    phone: '+33 1 23 45 67 89',
    sector: 'Services',
    logo: '',
    description: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Informations sauvegardées!');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCompanyInfo(prev => ({
          ...prev,
          logo: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center space-x-2">
        <Building2 className="h-6 w-6 text-etaxi-yellow" />
        <h2 className="text-2xl font-bold">{t('companyInfo')}</h2>
      </div>

      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>{t('logo')}</Label>
              <div className="flex items-center space-x-4">
                {companyInfo.logo ? (
                  <img
                    src={companyInfo.logo}
                    alt="Logo"
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-lg border flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Label htmlFor="logo">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        Télécharger
                      </span>
                    </Button>
                  </Label>
                </div>
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <Label>{t('companyName')}</Label>
              <Input
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label>{t('phone')}</Label>
              <Input
                value={companyInfo.phone}
                onChange={(e) => setCompanyInfo(prev => ({
                  ...prev,
                  phone: e.target.value
                }))}
              />
            </div>

            {/* Sector */}
            <div className="space-y-2">
              <Label>{t('sector')}</Label>
              <Input
                value={companyInfo.sector}
                onChange={(e) => setCompanyInfo(prev => ({
                  ...prev,
                  sector: e.target.value
                }))}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <AddressInput
              label={t('address')}
              value={companyInfo.address}
              onChange={(address) => setCompanyInfo(prev => ({
                ...prev,
                address
              }))}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={companyInfo.description}
              onChange={(e) => setCompanyInfo(prev => ({
                ...prev,
                description: e.target.value
              }))}
              placeholder="Description de votre entreprise..."
              rows={4}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
            >
              <Save className="mr-2 h-4 w-4" />
              {t('save')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
