import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableWithPagination } from '@/components/ui/table-with-pagination';
import { ArrowLeft, Edit, Trash2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface DraftRequest {
  id: string;
  type: 'individual' | 'group';
  title: string;
  lastModified: string;
  passengerCount: number;
  note?: string;
  completionPercentage: number;
}

export function DraftRequestsPage() {
  const navigate = useNavigate();
  
  const [drafts, setDrafts] = useState<DraftRequest[]>([
    {
      id: 'draft-1',
      type: 'individual',
      title: 'Transport Jean Dupont',
      lastModified: '2024-01-15 14:30',
      passengerCount: 1,
      note: 'Transport vers aéroport',
      completionPercentage: 75
    },
    {
      id: 'draft-2',
      type: 'group',
      title: 'Transport équipe Marketing',
      lastModified: '2024-01-14 16:45',
      passengerCount: 5,
      note: 'Réunion client',
      completionPercentage: 60
    },
    {
      id: 'draft-3',
      type: 'individual',
      title: 'Transport Pierre Martin',
      lastModified: '2024-01-13 09:15',
      passengerCount: 1,
      completionPercentage: 30
    }
  ]);

  const handleEditDraft = (draft: DraftRequest) => {
    if (draft.type === 'individual') {
      navigate('/transport/create', { state: { draftId: draft.id } });
    } else {
      navigate('/transport/create-group', { state: { draftId: draft.id } });
    }
  };

  const handleDeleteDraft = (draftId: string) => {
    setDrafts(prev => prev.filter(d => d.id !== draftId));
    toast.success('Brouillon supprimé');
  };

  const getCompletionBadge = (percentage: number) => {
    if (percentage >= 80) return <Badge variant="default">Presque terminé</Badge>;
    if (percentage >= 50) return <Badge variant="secondary">En cours</Badge>;
    return <Badge variant="outline">Début</Badge>;
  };

  const columns = [
    {
      header: 'Type',
      accessor: 'type' as keyof DraftRequest,
      render: (draft: DraftRequest) => (
        <Badge variant={draft.type === 'individual' ? 'outline' : 'secondary'}>
          {draft.type === 'individual' ? 'Individuel' : 'Groupe'}
        </Badge>
      )
    },
    {
      header: 'Titre',
      accessor: 'title' as keyof DraftRequest,
      render: (draft: DraftRequest) => (
        <div>
          <div className="font-medium">{draft.title}</div>
          {draft.note && (
            <div className="text-sm text-muted-foreground truncate max-w-xs">
              {draft.note}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Passagers',
      accessor: 'passengerCount' as keyof DraftRequest,
      render: (draft: DraftRequest) => `${draft.passengerCount} passager${draft.passengerCount > 1 ? 's' : ''}`
    },
    {
      header: 'Dernière modification',
      accessor: 'lastModified' as keyof DraftRequest,
      render: (draft: DraftRequest) => new Date(draft.lastModified).toLocaleString('fr-FR')
    },
    {
      header: 'Avancement',
      accessor: 'completionPercentage' as keyof DraftRequest,
      render: (draft: DraftRequest) => (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>{draft.completionPercentage}%</span>
            {getCompletionBadge(draft.completionPercentage)}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-etaxi-yellow h-2 rounded-full" 
              style={{ width: `${draft.completionPercentage}%` }}
            ></div>
          </div>
        </div>
      )
    }
  ];

  const actions = (draft: DraftRequest) => (
    <div className="flex items-center space-x-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          handleEditDraft(draft);
        }}
        title="Continuer l'édition"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteDraft(draft.id);
        }}
        title="Supprimer"
        className="text-red-500 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/transport')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">Brouillons</h2>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des brouillons ({drafts.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <TableWithPagination
            data={drafts}
            columns={columns}
            actions={actions}
            itemsPerPage={10}
            onRowClick={handleEditDraft}
            emptyMessage="Aucun brouillon trouvé"
          />
        </CardContent>
      </Card>
    </div>
  );
}
