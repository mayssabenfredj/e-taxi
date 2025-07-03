import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shareds/components/ui/card';
import { Button } from '@/shareds/components/ui/button';
import { Badge } from '@/shareds/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shareds/components/ui/tabs';
import { Car, User, MapPin, Star, MessageSquare, AlertTriangle, Edit, ArrowLeft } from 'lucide-react';

export function TaxiDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);

  // Mock data - in real app would come from API
  const taxi = {
    id: '1',
    licensePlate: 'AB-123-CD',
    make: 'Toyota',
    model: 'Prius',
    year: 2023,
    capacity: 4,
    active: true,
    status: 'available',
    driver: {
      id: '1',
      name: 'Ahmed Hassan',
      phone: '+33 6 12 34 56 78',
      rating: 4.8,
      totalRides: 1247,
      licenseNumber: 'DL123456',
      licenseExpiry: '2025-12-31'
    },
    location: {
      address: 'Place de la République, 75011 Paris',
      coordinates: { lat: 48.8676, lng: 2.3635 }
    },
    currentPassengers: 0,
    lastUpdate: '10:30',
    totalRides: 1247,
    lastMaintenance: '2024-01-10',
    nextMaintenance: '2024-04-10'
  };

  const reviews = [
    {
      id: '1',
      customerName: 'Marie L.',
      rating: 5,
      comment: 'Excellent service, chauffeur très professionnel',
      date: '2024-01-20'
    },
    {
      id: '2',
      customerName: 'Jean D.',
      rating: 4,
      comment: 'Ponctuel et véhicule propre',
      date: '2024-01-18'
    }
  ];

  const complaints = [
    {
      id: '1',
      type: 'Comportement chauffeur',
      description: 'Conduite trop rapide signalée',
      status: 'En cours',
      date: '2024-01-15'
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard/taxis')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center space-x-2">
            <Car className="h-6 w-6 text-etaxi-yellow" />
            <h2 className="text-2xl font-bold">{taxi.licensePlate}</h2>
            <Badge className={taxi.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {taxi.active ? 'Actif' : 'Inactif'}
            </Badge>
          </div>
        </div>
        <Button onClick={() => setEditMode(!editMode)}>
          <Edit className="h-4 w-4 mr-2" />
          {editMode ? 'Annuler' : 'Modifier'}
        </Button>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="driver">Chauffeur</TabsTrigger>
          <TabsTrigger value="complaints">Réclamations</TabsTrigger>
          <TabsTrigger value="reviews">Avis</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Car className="h-5 w-5 text-etaxi-yellow" />
                  <span>Informations du véhicule</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Plaque</label>
                    <p className="font-medium">{taxi.licensePlate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Marque</label>
                    <p className="font-medium">{taxi.make}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Modèle</label>
                    <p className="font-medium">{taxi.model}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Année</label>
                    <p className="font-medium">{taxi.year}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Capacité</label>
                    <p className="font-medium">{taxi.capacity} passagers</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Courses totales</label>
                    <p className="font-medium">{taxi.totalRides}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance */}
            <Card>
              <CardHeader>
                <CardTitle>Maintenance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dernière maintenance</label>
                  <p className="font-medium">{new Date(taxi.lastMaintenance).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Prochaine maintenance</label>
                  <p className="font-medium">{new Date(taxi.nextMaintenance).toLocaleDateString('fr-FR')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="driver" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-etaxi-yellow" />
                <span>Informations du chauffeur</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nom</label>
                  <p className="font-medium">{taxi.driver.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                  <p className="font-medium">{taxi.driver.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Note moyenne</label>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{taxi.driver.rating}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Courses effectuées</label>
                  <p className="font-medium">{taxi.driver.totalRides}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Numéro de permis</label>
                  <p className="font-medium">{taxi.driver.licenseNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Expiration permis</label>
                  <p className="font-medium">{new Date(taxi.driver.licenseExpiry).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaints" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Réclamations</h3>
            <Badge variant="secondary">{complaints.length}</Badge>
          </div>
          
          {complaints.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune réclamation</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {complaints.map(complaint => (
                <Card key={complaint.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>{complaint.type}</span>
                      <Badge variant="outline">{complaint.status}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{complaint.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Signalé le {new Date(complaint.date).toLocaleDateString('fr-FR')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Avis clients</h3>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="font-medium">{taxi.driver.rating}</span>
              <Badge variant="secondary">{reviews.length} avis</Badge>
            </div>
          </div>

          <div className="space-y-4">
            {reviews.map(review => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{review.customerName}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
