
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { Car, Plus, Clock, Users, MapPin, Calendar, Trash2, Edit, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface TransportRequest {
  id: string;
  date: string;
  time: string;
  type: 'private' | 'public';
  status: 'pending' | 'confirmed' | 'inProgress' | 'completed' | 'cancelled';
  passengersCount: number;
  note?: string;
  createdAt: string;
  passengers?: Array<{
    id: string;
    name: string;
    phone: string;
    departureAddress: {
      label?: string;
      street: string;
    };
    arrivalAddress: {
      label?: string;
      street: string;
    };
  }>;
}

export function TransportPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState<TransportRequest[]>([
    {
      id: '1',
      date: '2025-05-30',
      time: '09:00',
      type: 'private',
      status: 'pending',
      passengersCount: 3,
      note: 'Réunion importante',
      createdAt: '2025-05-29',
      passengers: [
        {
          id: 'p1',
          name: 'Jean Dupont',
          phone: '+33 6 12 34 56 78',
          departureAddress: {
            label: 'Domicile',
            street: '15 Rue du Louvre, 75001 Paris'
          },
          arrivalAddress: {
            label: 'Bureau',
            street: '101 Avenue des Champs-Élysées, 75008 Paris'
          }
        },
        {
          id: 'p2',
          name: 'Marie Martin',
          phone: '+33 6 98 76 54 32',
          departureAddress: {
            label: 'Domicile',
            street: '25 Rue de Rivoli, 75004 Paris'
          },
          arrivalAddress: {
            label: 'Bureau',
            street: '101 Avenue des Champs-Élysées, 75008 Paris'
          }
        },
        {
          id: 'p3',
          name: 'Pierre Durand',
          phone: '+33 7 12 34 56 78',
          departureAddress: {
            street: '5 Avenue Montaigne, 75008 Paris'
          },
          arrivalAddress: {
            street: '101 Avenue des Champs-Élysées, 75008 Paris'
          }
        }
      ]
    },
    {
      id: '2',
      date: '2025-05-31',
      time: '14:30',
      type: 'public',
      status: 'confirmed',
      passengersCount: 1,
      createdAt: '2025-05-28',
      passengers: [
        {
          id: 'p4',
          name: 'Sophie Lefebvre',
          phone: '+33 6 45 67 89 01',
          departureAddress: {
            label: 'Bureau',
            street: '101 Avenue des Champs-Élysées, 75008 Paris'
          },
          arrivalAddress: {
            label: 'Domicile',
            street: '30 Rue Saint-Honoré, 75001 Paris'
          }
        }
      ]
    }
  ]);

  const [currentRequest, setCurrentRequest] = useState<TransportRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'inProgress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t('pending');
      case 'confirmed': return t('confirmed');
      case 'inProgress': return t('inProgress');
      case 'completed': return t('completed');
      case 'cancelled': return t('cancelled');
      default: return status;
    }
  };

  const canModify = (request: TransportRequest) => {
    const requestDateTime = new Date(`${request.date}T${request.time}`);
    const now = new Date();
    const diffMinutes = (requestDateTime.getTime() - now.getTime()) / (1000 * 60);
    return diffMinutes > 40;
  };
  
  const handleViewDetails = (request: TransportRequest) => {
    setCurrentRequest(request);
    setIsDetailsOpen(true);
  };
  
  const handleCancelRequest = (id: string) => {
    setRequests(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'cancelled' } : r
    ));
    toast.success('Demande annulée avec succès!');
  };
  
  const handleEditRequest = (id: string) => {
    navigate(`/transport/edit/${id}`);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Car className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">{t('transportRequests')}</h2>
        </div>

        <Button 
          className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
          onClick={() => navigate('/transport/create')}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('newRequest')}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-etaxi-yellow" />
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Confirmées</p>
                <p className="text-2xl font-bold">
                  {requests.filter(r => r.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total passagers</p>
                <p className="text-2xl font-bold">
                  {requests.reduce((sum, r) => sum + r.passengersCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Ce mois</p>
                <p className="text-2xl font-bold">{requests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card className="animate-slide-up">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Heure</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Passagers</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.date}</div>
                      <div className="text-sm text-muted-foreground">
                        {request.time}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {request.type === 'private' ? t('private') : t('public')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      {request.passengersCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusText(request.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {request.note || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!canModify(request) || request.status === 'cancelled'}
                        onClick={() => handleEditRequest(request.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        disabled={request.status === 'cancelled' || request.status === 'completed'}
                        onClick={() => handleCancelRequest(request.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Dialog de détails */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la demande</DialogTitle>
          </DialogHeader>
          
          {currentRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Informations générales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Référence:</span>
                      <span className="font-mono">{currentRequest.id}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-medium">Date:</span>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4 text-gray-500" />
                        {currentRequest.date}
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-medium">Heure:</span>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4 text-gray-500" />
                        {currentRequest.time}
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-medium">Type:</span>
                      <Badge variant="outline">
                        {currentRequest.type === 'private' ? t('private') : t('public')}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-medium">Statut:</span>
                      <Badge className={getStatusColor(currentRequest.status)}>
                        {getStatusText(currentRequest.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-medium">Passagers:</span>
                      <span>{currentRequest.passengersCount}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-medium">Créée le:</span>
                      <span>{currentRequest.createdAt}</span>
                    </div>
                    
                    {currentRequest.note && (
                      <div className="pt-2 border-t">
                        <span className="font-medium block">Note:</span>
                        <p className="text-sm text-muted-foreground">{currentRequest.note}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      className="w-full" 
                      variant="outline"
                      disabled={!canModify(currentRequest) || currentRequest.status === 'cancelled'}
                      onClick={() => {
                        setIsDetailsOpen(false);
                        handleEditRequest(currentRequest.id);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier la demande
                    </Button>
                    
                    <Button 
                      className="w-full text-red-600" 
                      variant="outline"
                      disabled={currentRequest.status === 'cancelled' || currentRequest.status === 'completed'}
                      onClick={() => {
                        handleCancelRequest(currentRequest.id);
                        setIsDetailsOpen(false);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Annuler la demande
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Liste des passagers</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Passager</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Adresse de départ</TableHead>
                        <TableHead>Adresse d'arrivée</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentRequest.passengers?.map(passenger => (
                        <TableRow key={passenger.id}>
                          <TableCell className="font-medium">
                            {passenger.name}
                          </TableCell>
                          <TableCell>
                            {passenger.phone}
                          </TableCell>
                          <TableCell>
                            <div>
                              {passenger.departureAddress.label && (
                                <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                                  {passenger.departureAddress.label}
                                </span>
                              )}
                              <div className="text-sm mt-0.5">{passenger.departureAddress.street}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              {passenger.arrivalAddress.label && (
                                <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                                  {passenger.arrivalAddress.label}
                                </span>
                              )}
                              <div className="text-sm mt-0.5">{passenger.arrivalAddress.street}</div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
