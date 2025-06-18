import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useEmployeeDetails } from '@/hooks/useEmployeeDetails';
import { Employee, Transport, Claim } from '@/types/employee';
import EmployeeInfoTab from '@/components/employee/detailPage/EmployeeInfoTab';
import EmployeeClaimsTab from '@/components/employee/detailPage/EmployeeClaimsTab';
import EmployeeHistoryTab from '@/components/employee/detailPage/EmployeeTransportHistory';
import EmployeeAddressesTab from '@/components/employee/detailPage/EmployeeAddressesTab';

export function EmployeeDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const enterpriseId = '674d7f9a-065f-4c4a-8a21-867336eb4ec4'; // À remplacer par une valeur dynamique

  const { employee, loading, updateEmployee } = useEmployeeDetails({ id: id!, enterpriseId });

  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState<Partial<Employee>>({});

  // Données temporaires pour l'historique des transports et réclamations (à remplacer par des appels API)
  const [transportHistory] = useState<Transport[]>([
    {
      id: 'tr1',
      date: '2025-05-28',
      time: '09:15',
      status: 'Complété',
      departureAddress: {
        street: '15 Rue du Louvre',
        cityId: 'paris',
        countryId: 'france',
        formattedAddress: '15 Rue du Louvre, 75001 Paris, France',
      },
      arrivalAddress: {
        street: '101 Avenue des Champs-Élysées',
        cityId: 'paris',
        countryId: 'france',
        formattedAddress: '101 Avenue des Champs-Élysées, 75008 Paris, France',
      },
      requestId: 'req123',
    },
  ]);

  const [claimsHistory] = useState<Claim[]>([
    {
      id: 'claim1',
      type: 'complaint',
      subject: 'Retard du chauffeur',
      description: 'Le chauffeur est arrivé 30 minutes en retard pour ma course du matin',
      status: 'resolved',
      createdAt: '2024-01-15T10:30:00Z',
      response: 'Nous nous excusons pour ce retard. Le chauffeur a été sensibilisé.',
    },
  ]);

  const handleSave = async () => {
    try {
      await updateEmployee(editedEmployee);
      setIsEditing(false);
      toast.success('Employé mis à jour avec succès');
    } catch (error) {
      // Erreur gérée par le hook via toast
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedEmployee({});
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!employee) {
    return <div>Employé non trouvé</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/employees')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <h2 className="text-2xl font-bold">{employee.fullName}</h2>
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            employee.status === 'ENABLED'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {employee.status === 'ENABLED' ? 'Actif' : 'Inactif'}
        </span>
        {!isEditing ? (
          <Button
            className="ml-auto bg-etaxi-yellow hover:bg-yellow-500 text-black"
            onClick={() => {
              setIsEditing(true);
              setEditedEmployee({
                firstName: employee.firstName,
                lastName: employee.lastName,
                phone: employee.phone,
                subsidiaryId: employee.subsidiaryId,
                roleIds: employee.roleIds,
                addresses: employee.addresses,
              });
            }}
          >
            Modifier
          </Button>
        ) : (
          <div className="ml-auto space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button
              className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
              onClick={handleSave}
            >
              Enregistrer
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="addresses">Adresses</TabsTrigger>
          <TabsTrigger value="history">Historique transport</TabsTrigger>
          <TabsTrigger value="claims">Réclamations</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4 mt-4">
          <EmployeeInfoTab
            employee={employee}
            editedEmployee={editedEmployee}
            setEditedEmployee={setEditedEmployee}
            isEditing={isEditing}
          />
        </TabsContent>

        <TabsContent value="addresses" className="space-y-4 mt-4">
          <EmployeeAddressesTab
            employee={employee}
            editedEmployee={editedEmployee}
            setEditedEmployee={setEditedEmployee}
            isEditing={isEditing}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <EmployeeHistoryTab
            transportHistory={transportHistory}
            onViewRequest={(requestId) => navigate(`/transport/${requestId}`)}
          />
        </TabsContent>

        <TabsContent value="claims" className="mt-4">
          <EmployeeClaimsTab claimsHistory={claimsHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
}