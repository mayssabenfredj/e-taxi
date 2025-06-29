import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import validator from 'validator';
import {  SignUpEntrepriseDto } from '@/types/entreprise';
import { entrepriseService } from '@/services/entreprise.service';

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<SignUpEntrepriseDto>>({
    titre: '',
    phone: '',
    email: '',
 
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.titre) {
      toast.error('Le nom de l’entreprise est requis');
      return;
    }
    if (!formData.email) {
      toast.error('L’email est requis');
      return;
    }
    if (!validator.isEmail(formData.email)) {
      toast.error('Veuillez entrer un email valide');
      return;
    }
    if (formData.phone && !validator.isMobilePhone(formData.phone, 'any')) {
      toast.error('Numéro de téléphone invalide');
      return;
    }
   

    setIsLoading(true);
    try {
      const enterpriseData: Partial<SignUpEntrepriseDto> = {
        titre: formData.titre,
        phone: formData.phone || undefined,
        email: formData.email,
      };
      const response = await entrepriseService.createEnterprise(enterpriseData as SignUpEntrepriseDto);
      if (response.success) {
        toast.success('Compte créé avec succès ! Vérifiez votre email.');
        navigate('/dashboard');
      } else {
        toast.error(response.error || 'Erreur lors de la création du compte');
      }
    } catch (error) {
      toast.error('Erreur lors de la création du compte');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold flex items-center justify-center space-x-2">
          <Building2 className="h-6 w-6 text-etaxi-yellow" />
          <span>Créer un compte</span>
        </CardTitle>
        <CardDescription>
          Rejoignez E-Taxi pour gérer vos transports d'entreprise
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 text-start">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titre" className="text-start">
                Nom de l’entreprise <span className="text-red-500">*</span>
              </Label>
              <Input
                id="titre"
                value={formData.titre}
                onChange={(e) => handleInputChange('titre', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-start">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-start">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>
         
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-etaxi-yellow hover:bg-yellow-500 text-black"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer le compte
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}