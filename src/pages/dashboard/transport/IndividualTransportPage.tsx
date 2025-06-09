import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableWithPagination } from '@/components/ui/table-with-pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car, Plus, Eye, Copy, Navigation, Calendar as CalendarIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface TransportRequest {
  id: string;
  requestedBy: string;
  passengerCount: number;
  departureLocation: string;
  arrivalLocation: string;
  scheduledDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  note?: string;
}

interface DuplicateSchedule {
  date: Date;
  time: string;
}

export function IndividualTransportPage() {
  const navigate = useNavigate();
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TransportRequest | null>(null);
  const [duplicateSchedules, setDuplicateSchedules] = useState<DuplicateSchedule[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  
  const [requests] = useState<TransportRequest[]>([
    {
      id: '1',
      requestedBy: 'Jean Dupont',
      passengerCount: 1,
      departureLocation: 'Domicile',
      arrivalLocation: 'Aéroport CDG',
      scheduledDate: '2024-01-20 09:00',
      status: 'pending'
    },
    {
      id: '2',
      requestedBy: 'Pierre Durand',
      passengerCount: 1,
      departureLocation: 'Gare du Nord',
      arrivalLocation: 'Bureau client',
      scheduledDate: '2024-01-25 14:00',
      status: 'completed'
    },
    {
      id: '3',
      requestedBy: 'Sophie Martin',
      passengerCount: 1,
      departureLocation: 'Hôtel',
      arrivalLocation: 'Centre de conférences',
      scheduledDate: '2024-01-28 08:30',
      status: 'approved'
    }
  ]);

  const handleViewRequest = (request: TransportRequest) => {
    navigate(`/transport/${request.id}`);
  };

  const handleDuplicateRequest = (request: TransportRequest) => {
    setSelectedRequest(request);
    setDuplicateDialogOpen(true);
    setSelectedDates([]);
    setDuplicateSchedules([]);
  };

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (dates) {
      setSelectedDates(dates);
      // Create schedules for new dates, preserve existing ones
      const newSchedules = dates.map(date => {
        const existing = duplicateSchedules.find(s => 
          s.date.toDateString() === date.toDateString()
        );
        return existing || { date, time: '09:00' };
      });
      setDuplicateSchedules(newSchedules);
    }
  };

  const updateScheduleTime = (date: Date, time: string) => {
    setDuplicateSchedules(prev => 
      prev.map(schedule => 
        schedule.date.toDateString() === date.toDateString()
          ? { ...schedule, time }
          : schedule
      )
    );
  };

  const removeSchedule = (date: Date) => {
    setDuplicateSchedules(prev => 
      prev.filter(schedule => schedule.date.toDateString() !== date.toDateString())
    );
    setSelectedDates(prev => 
      prev.filter(d => d.toDateString() !== date.toDateString())
    );
  };

  const confirmDuplicate = () => {
    if (selectedRequest && duplicateSchedules.length > 0) {
      duplicateSchedules.forEach((schedule, index) => {
        const duplicatedRequest = {
          ...selectedRequest,
          id: `${selectedRequest.id}-copy-${Date.now()}-${index}`,
          scheduledDate: `${schedule.date.toISOString().split('T')[0]} ${schedule.time}`,
          status: 'pending' as const
        };
        
        // Here you would typically save each duplicated request
        console.log('Duplicating request:', duplicatedRequest);
      });
      
      toast.success(`${duplicateSchedules.length} demande(s) dupliquée(s) avec succès`);
      setDuplicateDialogOpen(false);
      setSelectedRequest(null);
      setDuplicateSchedules([]);
      setSelectedDates([]);
    }
  };

  const getStatusBadge = (status: TransportRequest['status']) => {
    const variants = {
      pending: { variant: 'outline' as const, label: 'En attente' },
      approved: { variant: 'default' as const, label: 'Approuvée' },
      rejected: { variant: 'destructive' as const, label: 'Rejetée' },
      completed: { variant: 'secondary' as const, label: 'Terminée' }
    };
    
    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const columns = [
    {
      header: 'Demandeur',
      accessor: 'requestedBy' as keyof TransportRequest,
      render: (request: TransportRequest) => (
        <div>
          <div className="font-medium">{request.requestedBy}</div>
          <div className="text-sm text-muted-foreground">
            <Badge variant="outline">Individuel</Badge>
          </div>
        </div>
      )
    },
    {
      header: 'Passagers',
      accessor: 'passengerCount' as keyof TransportRequest,
      render: (request: TransportRequest) => `${request.passengerCount} passager`
    },
    {
      header: 'Trajet',
      accessor: 'departureLocation' as keyof TransportRequest,
      render: (request: TransportRequest) => (
        <div className="text-sm">
          <div>De: {request.departureLocation}</div>
          <div>Vers: {request.arrivalLocation}</div>
        </div>
      )
    },
    {
      header: 'Date prévue',
      accessor: 'scheduledDate' as keyof TransportRequest,
      render: (request: TransportRequest) => new Date(request.scheduledDate).toLocaleString('fr-FR')
    },
    {
      header: 'Statut',
      accessor: 'status' as keyof TransportRequest,
      render: (request: TransportRequest) => getStatusBadge(request.status)
    }
  ];

  const actions = (request: TransportRequest) => (
    <div className="flex items-center space-x-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          handleViewRequest(request);
        }}
        title="Voir les détails"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          handleDuplicateRequest(request);
        }}
        title="Dupliquer"
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Car className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">Demandes de transport individuelles</h2>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => navigate('/transport/drafts')}
          >
            Brouillons
          </Button>
          <Button 
            onClick={() => navigate('/transport/create')}
            className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle demande
          </Button>
        </div>
      </div>

      <TableWithPagination
        data={requests}
        columns={columns}
        actions={actions}
        itemsPerPage={10}
        onRowClick={handleViewRequest}
        emptyMessage="Aucune demande de transport individuelle trouvée"
      />

      {/* Dialog pour dupliquer une demande */}
      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Dupliquer la demande - Sélection multiple</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label className="text-base font-medium mb-4 block">Sélectionner les dates</Label>
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={handleDateSelect}
                className="rounded-md border"
              />
            </div>
            
            <div>
              <Label className="text-base font-medium mb-4 block">
                Horaires pour chaque date ({duplicateSchedules.length})
              </Label>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {duplicateSchedules.map((schedule, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {schedule.date.toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                    <Input
                      type="time"
                      value={schedule.time}
                      onChange={(e) => updateScheduleTime(schedule.date, e.target.value)}
                      className="w-32"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeSchedule(schedule.date)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {duplicateSchedules.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Sélectionnez des dates dans le calendrier
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setDuplicateDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={confirmDuplicate}
              className="bg-etaxi-yellow hover:bg-yellow-500 text-black"
              disabled={duplicateSchedules.length === 0}
            >
              Dupliquer ({duplicateSchedules.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}