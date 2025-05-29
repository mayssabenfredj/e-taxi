
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { AddressInput } from '../shared/AddressInput';
import { Car, Plus, Clock, Users, MapPin } from 'lucide-react';
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
}

interface Passenger {
  id: string;
  name: string;
  phone: string;
  departureAddress: any;
  arrivalAddress: any;
}

export function TransportPage() {
  const { t } = useLanguage();
  const [requests, setRequests] = useState<TransportRequest[]>([
    {
      id: '1',
      date: '2025-05-30',
      time: '09:00',
      type: 'private',
      status: 'pending',
      passengersCount: 3,
      note: 'Réunion importante',
      createdAt: '2025-05-29'
    },
    {
      id: '2',
      date: '2025-05-31',
      time: '14:30',
      type: 'public',
      status: 'confirmed',
      passengersCount: 1,
      createdAt: '2025-05-28'
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    date: '',
    time: '',
    type: 'private' as 'private' | 'public',
    note: '',
    passengers: [] as Passenger[]
  });

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

  const handleCreateRequest = () => {
    if (!newRequest.date || !newRequest.time) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const request: TransportRequest = {
      id: Date.now().toString(),
      ...newRequest,
      status: 'pending',
      passengersCount: newRequest.passengers.length,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setRequests(prev => [...prev, request]);
    setNewRequest({
      date: '',
      time: '',
      type: 'private',
      note: '',
      passengers: []
    });
    setIsCreateDialogOpen(false);
    toast.success('Demande de transport créée!');
  };

  const canModify = (request: TransportRequest) => {
    const requestDateTime = new Date(`${request.date}T${request.time}`);
    const now = new Date();
    const diffMinutes = (requestDateTime.getTime() - now.getTime()) / (1000 * 60);
    return diffMinutes > 40;
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Car className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">{t('transportRequests')}</h2>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-etaxi-yellow hover:bg-yellow-500 text-black">
              <Plus className="mr-2 h-4 w-4" />
              {t('newRequest')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('newRequest')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('departureDate')}</Label>
                  <Input
                    type="date"
                    value={newRequest.date}
                    onChange={(e) => setNewRequest(prev => ({
                      ...prev,
                      date: e.target.value
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('departureTime')}</Label>
                  <Input
                    type="time"
                    value={newRequest.time}
                    onChange={(e) => setNewRequest(prev => ({
                      ...prev,
                      time: e.target.value
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('type')}</Label>
                <Select
                  value={newRequest.type}
                  onValueChange={(value: 'private' | 'public') =>
                    setNewRequest(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">{t('private')}</SelectItem>
                    <SelectItem value="public">{t('public')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('note')}</Label>
                <Textarea
                  value={newRequest.note}
                  onChange={(e) => setNewRequest(prev => ({
                    ...prev,
                    note: e.target.value
                  }))}
                  placeholder="Note facultative..."
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">{t('passengers')}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Add passenger functionality
                      toast.success('Fonctionnalité d\'ajout de passagers à implémenter');
                    }}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Ajouter un passager
                  </Button>
                </div>

                {newRequest.passengers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun passager ajouté
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCreateRequest}
                  className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
                >
                  Créer la demande
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
                        disabled={!canModify(request)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                      >
                        Annuler
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
