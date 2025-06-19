import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, X } from 'lucide-react';
import { TransportRequest, DuplicateSchedule } from '@/types/demande';
import { toast } from 'sonner';
import { demandeService } from '@/services/demande.service';

interface DuplicateDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedRequest: TransportRequest | null;
  setSelectedRequest: (request: TransportRequest | null) => void;
  duplicateSchedules: DuplicateSchedule[];
  setDuplicateSchedules: (schedules: DuplicateSchedule[]) => void;
  selectedDates: Date[];
  setSelectedDates: (dates: Date[]) => void;
}

export function DuplicateDialog({
  open,
  setOpen,
  selectedRequest,
  setSelectedRequest,
  duplicateSchedules,
  setDuplicateSchedules,
  selectedDates,
  setSelectedDates,
}: DuplicateDialogProps) {
  const handleDateSelect = (dates: Date[] | undefined) => {
    if (dates) {
      setSelectedDates(dates);
      const newSchedules = dates.map((date) => {
        const existing = duplicateSchedules.find(
          (s) => s.date.toDateString() === date.toDateString()
        );
        return existing || { date, time: '09:00' };
      });
      setDuplicateSchedules(newSchedules);
    }
  };

  const updateScheduleTime = (date: Date, time: string) => {
    setDuplicateSchedules((prev) =>
      prev.map((schedule) =>
        schedule.date.toDateString() === date.toDateString()
          ? { ...schedule, time }
          : schedule
      )
    );
  };

  const removeSchedule = (date: Date) => {
    setDuplicateSchedules((prev) =>
      prev.filter((schedule) => schedule.date.toDateString() !== date.toDateString())
    );
    setSelectedDates((prev) =>
      prev.filter((d) => d.toDateString() !== date.toDateString())
    );
  };

  const confirmDuplicate = async () => {
    if (selectedRequest && duplicateSchedules.length > 0) {
      try {
        const createRequests = duplicateSchedules.map((schedule, index) => ({
          ...selectedRequest,
          id: `${selectedRequest.id}-copy-${Date.now()}-${index}`,
          scheduledDate: `${schedule.date.toISOString().split('T')[0]} ${schedule.time}`,
          status: 'pending' as const,
        }));

        await demandeService.createMultipleTransportRequests(
          createRequests.map((req) => ({
            reference: req.id,
            note: req.note,
            scheduledDate: req.scheduledDate,
            employeeTransports: [
              {
                employeeId: req.requestedBy, // Simplified; adjust based on actual data
                startTime: req.scheduledDate,
                departureAddress: { formattedAddress: req.departureLocation },
                arrivalAddress: { formattedAddress: req.arrivalLocation },
              },
            ],
          }))
        );

        toast.success(`${duplicateSchedules.length} demande(s) de groupe dupliquée(s) avec succès`);
        setOpen(false);
        setSelectedRequest(null);
        setDuplicateSchedules([]);
        setSelectedDates([]);
      } catch (error) {
        toast.error('Failed to duplicate transport requests');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto my-4 mx-4">
        <DialogHeader>
          <DialogTitle>Dupliquer la demande de groupe - Sélection multiple</DialogTitle>
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
                  <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {schedule.date.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  <Input
                    type="time"
                    value={schedule.time}
                    onChange={(e) => updateScheduleTime(schedule.date, e.target.value)}
                    className="w-32 flex-shrink-0"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeSchedule(schedule.date)}
                    className="text-red-500 hover:text-red-700 flex-shrink-0"
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
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
            Annuler
          </Button>
          <Button
            onClick={confirmDuplicate}
            className="bg-etaxi-yellow hover:bg-yellow-500 text-black w-full sm:w-auto"
            disabled={duplicateSchedules.length === 0}
          >
            Dupliquer ({duplicateSchedules.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}