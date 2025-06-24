import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, X } from 'lucide-react';
import { TransportRequestResponse, DuplicateSchedule } from '@/types/demande';
import { toast } from 'sonner';
import { demandeService } from '@/services/demande.service';
import { format } from 'date-fns';

interface DuplicateDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedRequest: TransportRequestResponse | null;
  setSelectedRequest: (request: TransportRequestResponse | null) => void;
  duplicateSchedules: DuplicateSchedule[];
  setDuplicateSchedules: React.Dispatch<React.SetStateAction<DuplicateSchedule[]>>;
  selectedDates: Date[];
  setSelectedDates: React.Dispatch<React.SetStateAction<Date[]>>;
  onDuplicateSuccess: () => void; // New prop for callback
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
  onDuplicateSuccess,
}: DuplicateDialogProps) {

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (dates) {
      setSelectedDates(dates);
      const newSchedules: DuplicateSchedule[] = dates.map((date) => {
        const existing = duplicateSchedules.find(
          (s) => s.date.toDateString() === date.toDateString()
        );
        return existing || { date, time: '09:00' };
      });
      setDuplicateSchedules(newSchedules);
    }
  };

  const updateScheduleTime = (date: Date, time: string) => {
    setDuplicateSchedules((prev: DuplicateSchedule[]) =>
      prev.map((schedule: DuplicateSchedule) =>
        schedule.date.toDateString() === date.toDateString()
          ? { ...schedule, time }
          : schedule
      )
    );
  };

  const removeSchedule = (date: Date) => {
    setDuplicateSchedules((prev: DuplicateSchedule[]) =>
      prev.filter((schedule: DuplicateSchedule) => schedule.date.toDateString() !== date.toDateString())
    );
    setSelectedDates((prev: Date[]) =>
      prev.filter((d: Date) => d.toDateString() !== date.toDateString())
    );
  };

  const confirmDuplicate = async () => {
    if (!selectedRequest || duplicateSchedules.length === 0) {
      toast.error('Aucune demande sélectionnée ou aucune date choisie');
      return;
    }

    try {
      const scheduledDates = duplicateSchedules.map((schedule) =>
        new Date(`${format(schedule.date, 'yyyy-MM-dd')}T${schedule.time}:00.000Z`).toISOString()
      );

      await demandeService.duplicateTransport(selectedRequest.id, scheduledDates);

      toast.success(`${duplicateSchedules.length} demande(s) de groupe dupliquée(s) avec succès`);
      onDuplicateSuccess(); // Call the callback to refresh data
      setOpen(false);
      setSelectedRequest(null);
      setDuplicateSchedules([]);
      setSelectedDates([]);
    } catch (error: any) {
      toast.error(`Échec de la duplication des demandes : ${error.message || 'Erreur inconnue'}`);
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
              disabled={(date) => date < new Date()}
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