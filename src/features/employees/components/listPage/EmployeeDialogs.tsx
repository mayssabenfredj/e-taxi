import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shareds/components/ui/alert-dialog';
import { Employee } from '@/features/employees/types/employee';

interface EmployeeDialogsProps {
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  statusDialogOpen: boolean;
  setStatusDialogOpen: (open: boolean) => void;
  selectedEmployee: Employee | null;
  onDelete: () => void;
  onToggleStatus: () => void;
}

export const EmployeeDialogs: React.FC<EmployeeDialogsProps> = ({
  deleteDialogOpen,
  setDeleteDialogOpen,
  statusDialogOpen,
  setStatusDialogOpen,
  selectedEmployee,
  onDelete,
  onToggleStatus,
}) => {
  return (
    <>
      {/* Status Toggle Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedEmployee?.status === 'ENABLED' ? 'Désactiver' : 'Activer'} le Collaborateur
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir {selectedEmployee?.status === 'ENABLED' ? 'désactiver' : 'activer'} le Collaborateurs{' '}
              <strong>{selectedEmployee?.fullName || `${selectedEmployee?.firstName || ''} ${selectedEmployee?.lastName || ''}`}</strong> ?{' '}
              {selectedEmployee?.status === 'ENABLED' && ' Cet Collaborateur ne pourra plus accéder au système.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={onToggleStatus}
              className={selectedEmployee?.status === 'ENABLED' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {selectedEmployee?.status === 'ENABLED' ? 'Désactiver' : 'Activer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le Collaborateur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le Collaborateur {' '}
              <strong>{selectedEmployee?.fullName || `${selectedEmployee?.firstName || ''} ${selectedEmployee?.lastName || ''}`}</strong> ? Cette action est irréversible et supprimera toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};