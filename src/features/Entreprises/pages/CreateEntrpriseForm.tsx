import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shareds/components/ui/card';
import { Button } from '@/shareds/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shareds/components/ui/form';
import { Input } from '@/shareds/components/ui/input';
import { Textarea } from '@/shareds/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shareds/components/ui/select';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { EntityStatus, CreateEnterpriseDto, UpdateEnterpriseDto } from '../types/entreprise';
import { AddressInput } from '@/shareds/components/addressComponent/AddressInput';
import { entrepriseService } from '../services/entreprise.service';
import { hasPermission } from '@/shareds/lib/utils';
import { useAuth } from '@/shareds/contexts/AuthContext';

const enterpriseSchema = z.object({
  titre: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(5, 'Numéro de téléphone invalide'),
  mobile: z.string().optional(),
  secteurActivite: z.string().optional(),
  matriculeFiscal: z.string().optional(),
  status: z.nativeEnum(EntityStatus).optional(),
  website: z.string().url('URL invalide').optional().or(z.literal('')).optional(),
  address: z.any().optional(),
  description: z.string().optional(),
  logo: z.any().optional(),
});

type EnterpriseFormData = z.infer<typeof enterpriseSchema>;

type EnterpriseFormProps = {
  mode: 'create' | 'update';
  initialData?: Partial<EnterpriseFormData>;
  id?: string;
  logoUrlPreview?: string;
};

export function CreateEnterpriseForm(props: EnterpriseFormProps = { mode: 'create' }) {
  const { mode, initialData, id: idProp, logoUrlPreview } = props;
  const params = useParams();
  const id = idProp || params.id;
  const navigate = useNavigate();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formDataLoaded, setFormDataLoaded] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(logoUrlPreview || null);
  const { user, isLoading: authLoading } = useAuth();

  const permission = mode === 'create' ? 'enterprises:create' : 'enterprises:update';
  if (!authLoading && !hasPermission(user, permission)) {
    return <div className="p-8 text-center text-red-600 font-bold text-xl">Accès refusé : vous n'avez pas la permission de {mode === 'create' ? 'créer' : 'modifier'} une organisation.</div>;
  }

  const form = useForm<EnterpriseFormData>({
    resolver: zodResolver(enterpriseSchema),
    defaultValues: initialData || {
      titre: '',
      email: '',
      phone: '',
      mobile: '',
      secteurActivite: '',
      matriculeFiscal: '',
      status: EntityStatus.ACTIVE,
      website: '',
      address: undefined,
      description: '',
      logo: undefined,
    },
  });

  // Charger les données de l'entreprise en mode update
  useEffect(() => {
    if (mode === 'update' && id && !formDataLoaded) {
      (async () => {
        setLoading(true);
        try {
          const res = await entrepriseService.findOne(id);
          const ent = res.data;
          form.reset({
            titre: ent.name,
            email: ent.email || '',
            phone: ent.phone || '',
            mobile: ent.mobile || '',
            secteurActivite: ent.industry || '',
            matriculeFiscal: ent.taxId || '',
            status: ent.status,
            website: ent.website || '',
            address: ent.address || undefined,
            description: (ent as any).description || '',
            logo: undefined,
          });
          if (ent.logoUrl) {
            const logoImg = await entrepriseService.getLogoImage(ent.logoUrl);
            setLogoUrl(logoImg);
          }
          setFormDataLoaded(true);
        } catch (e) {
          toast.error('Erreur lors du chargement de l\'organisation');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [mode, id, form, formDataLoaded]);

  useEffect(() => {
    if (logoFile) {
      const previewUrl = URL.createObjectURL(logoFile);
      setLogoPreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    } else {
      setLogoPreview(null);
    }
  }, [logoFile]);

  const onSubmit = async (data: EnterpriseFormData) => {
    setLoading(true);
    try {
      if (mode === 'create') {
        const dto: CreateEnterpriseDto = {
          titre: data.titre,
          email: data.email,
          phone: data.phone,
          mobile: data.mobile,
          secteurActivite: data.secteurActivite,
          matriculeFiscal: data.matriculeFiscal,
          status: data.status,
          address: data.address,
        };
        const res = await entrepriseService.createEnterprise(dto, logoFile || undefined);
        if (res.success) {
          toast.success('Organisation créée avec succès');
          navigate('/companys');
        } else {
          toast.error(res.error || 'Erreur lors de la création');
        }
      } else if (mode === 'update' && id) {
        const dto: UpdateEnterpriseDto = {
          titre: data.titre,
          email: data.email,
          phone: data.phone,
          mobile: data.mobile,
          secteurActivite: data.secteurActivite,
          matriculeFiscal: data.matriculeFiscal,
          status: data.status,
          website: data.website,
          address: data.address,
        };
        const res = await entrepriseService.update(id, dto, logoFile || undefined);
        if (res.status === 200) {
          toast.success('Organisation mise à jour');
          navigate('/companys');
        } else {
          toast.error('Erreur lors de la mise à jour');
        }
      }
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Le fichier dépasse 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image');
        return;
      }
      setLogoFile(file);
      form.setValue('logo', file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/companys')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{mode === 'create' ? 'Nouvelle Organisation' : 'Modifier l\'Organisation'}</h1>
          <p className="text-muted-foreground">
            {mode === 'create' ? 'Créez une nouvelle Organisation dans le système' : 'Modifiez les informations de l\'Organisation'}
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations de l'Organisation</CardTitle>
          <CardDescription>
            {mode === 'create' ? 'Remplissez les informations de base de l\'Organisation' : 'Modifiez les informations de l\'Organisation'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-start">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Logo + 3 champs sur la même ligne */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="flex flex-col items-center">
  <label className="block text-sm font-medium mb-1">Logo</label>
  <div className="w-20 h-20 flex items-center justify-center overflow-hidden mb-2">
    {logoPreview ? (
      <img src={logoPreview} alt="Logo preview" className="object-cover w-full h-full" />
    ) : logoUrl ? (
      <img src={logoUrl} alt="Logo" className="object-cover w-full h-full" />
    ) : (
      <span className="text-xs text-muted-foreground">Aucun logo</span>
    )}
  </div>
  <label htmlFor="logo-upload" className="cursor-pointer">
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-full flex items-center justify-center"
      asChild
    >
      <span>
        <Upload className="h-4 w-4 mr-1" /> Logo
      </span>
    </Button>
    <input
      id="logo-upload"
      type="file"
      accept="image/*"
      onChange={handleLogoChange}
      className="hidden"
    />
  </label>
</div>
                <FormField
                  control={form.control}
                  name="titre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de l'organisation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@organisation.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone *</FormLabel>
                      <FormControl>
                        <Input placeholder="Téléphone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Ligne suivante : mobile, secteur, matricule, statut */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile</FormLabel>
                      <FormControl>
                        <Input placeholder="Mobile" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="secteurActivite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secteur d'activité</FormLabel>
                      <FormControl>
                        <Input placeholder="Secteur d'activité" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="matriculeFiscal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro fiscal</FormLabel>
                      <FormControl>
                        <Input placeholder="Numéro fiscal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || EntityStatus.ACTIVE}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={EntityStatus.ACTIVE}>Active</SelectItem>
                          <SelectItem value={EntityStatus.INACTIVE}>Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Ligne suivante : site web, description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site web</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.site.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Description de l'organisation (optionnel)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Adresse */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <AddressInput label="Adresse de l'organisation" value={field.value} onChange={field.onChange} required={true} showMapPicker={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" className="bg-etaxi-yellow hover:bg-etaxi-yellow/90 text-black" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {mode === 'create' ? 'Créer l\'organisation' : 'Enregistrer'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/companys')}
                  disabled={loading}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
