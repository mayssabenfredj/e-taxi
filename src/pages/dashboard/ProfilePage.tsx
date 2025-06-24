import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Phone, MapPin, Building, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { AddressInput } from '@/components/shared/AddressInput';
import EmployeeAddressesTab from '@/components/employee/detailPage/EmployeeAddressesTab';
import { Employee, UserAddressDto, UpdateEmployee } from '@/types/employee';
import EmployeeService from '@/services/employee.service';

export function ProfilePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    alternativePhone: '',
    profileImageUrl: '',
    language: 'fr',
    timezone: 'Europe/Paris',
  });
  const [addresses, setAddresses] = useState<UserAddressDto[]>([]);

  useEffect(() => {
    if (user?.id) {
      EmployeeService.getEmployeeById(user.id).then((emp) => {
        setEmployee(emp);
        setProfileData({
          fullName: emp.fullName || '',
          email: emp.email || '',
          phone: emp.phone || '',
          alternativePhone: emp.alternativePhone || '',
          profileImageUrl: (emp as any).profileImageUrl || '',
          language: (emp as any).language || 'fr',
          timezone: (emp as any).timezone || 'Europe/Paris',
        });
        setAddresses(emp.addresses || []);
      });
    }
  }, [user?.id]);

  const handleSave = async () => {
    try {
      if (!employee) return;
      await EmployeeService.updateEmployee(employee.id, {
        ...profileData,
        addresses,
      } as any); // addresses n'est pas dans UpdateEmployee, mais on force ici
      toast.success('Profil mis à jour avec succès!');
      setIsEditing(false);
      // Recharger l'employé pour avoir les données à jour
      const emp = await EmployeeService.getEmployeeById(employee.id);
      setEmployee(emp);
      setAddresses(emp.addresses || []);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulation d'upload d'image
      const imageUrl = URL.createObjectURL(file);
      setProfileData(prev => ({ ...prev, profileImageUrl: imageUrl }));
      toast.success('Photo de profil mise à jour!');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <User className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">{t('profile')}</h2>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
          className={!isEditing ? "bg-etaxi-yellow hover:bg-yellow-500 text-black" : ""}
        >
          {isEditing ? 'Annuler' : 'Modifier'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo de profil */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Photo de profil</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="relative">
              {profileData.profileImageUrl ? (
                <img
                  src={profileData.profileImageUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mx-auto object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full mx-auto bg-etaxi-yellow/20 flex items-center justify-center">
                  <User className="h-16 w-16 text-etaxi-yellow" />
                </div>
              )}
            </div>

            {isEditing && (
              <>
                <input
                  type="file"
                  id="profile-image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Label htmlFor="profile-image">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Changer la photo
                    </span>
                  </Button>
                </Label>
              </>
            )}
          </CardContent>
        </Card>

        {/* Informations personnelles */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom complet</Label>
                <Input
                  value={profileData.fullName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Téléphone principal</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Téléphone secondaire</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    value={profileData.alternativePhone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, alternativePhone: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Optionnel"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <Button 
                onClick={handleSave} 
                className="w-full bg-etaxi-yellow hover:bg-yellow-500 text-black mt-4"
              >
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les modifications
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Liste des adresses utilisateur */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Adresses enregistrées</CardTitle>
          </CardHeader>
          <CardContent>
            {employee && (
              <EmployeeAddressesTab
                employee={employee}
                editedEmployee={{ addresses }}
                setEditedEmployee={(e) => setAddresses((e as any).addresses || [])}
                isEditing={isEditing}
              />
            )}
          </CardContent>
        </Card>

        {/* Appartenance */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Appartenance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 p-3 bg-etaxi-yellow/10 rounded-md">
              <Building className="h-5 w-5 text-etaxi-yellow" />
              <div>
                <p className="font-medium">{user?.enterprise?.name}</p>
                <p className="text-sm text-muted-foreground">Entreprise principale</p>
              </div>
            </div>

            {/* Filiales - à développer */}
            <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground">
              Vous n'appartenez à aucune filiale pour le moment.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
