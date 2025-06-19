import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-2">
        <Users className="h-6 w-6 text-etaxi-yellow flex-shrink-0" />
        <h2 className="text-xl sm:text-2xl font-bold truncate">
          <span className="hidden sm:inline">Demandes de transport de groupe</span>
          <span className="sm:hidden">Transport de groupe</span>
        </h2>
      </div>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
        <Button
          variant="outline"
          onClick={() => navigate('/transport/drafts')}
          className="w-full sm:w-auto"
        >
          Brouillons
        </Button>
        <Button
          onClick={() => navigate('/transport/create-group')}
          className="bg-etaxi-yellow hover:bg-yellow-500 text-black w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Nouvelle demande de groupe</span>
          <span className="sm:hidden">Nouvelle demande</span>
        </Button>
      </div>
    </div>
  );
}