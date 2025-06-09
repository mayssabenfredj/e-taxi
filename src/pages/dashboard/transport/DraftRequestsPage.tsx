import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableWithPagination } from '@/components/ui/table-with-pagination';
import { ArrowLeft, Edit, Trash2, FileText, Car, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DraftRequest {
  id: string;
  type: 'individual' | 'group';
  title: string;
  lastModified: string;
  passengerCount: number;
  note?: string;
  completionPercentage: number;
}

interface DispatchDraft {
  id: string;
  requestId: string;
  reference: string;
  passengerCount: number;
  assignedCount: number;
  lastModified: string;
}

export function DraftRequestsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'requests' | 'dispatch'>('requests');
  
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

  const [dispatchDrafts, setDispatchDrafts] = useState<DispatchDraft[]>([]);

  // Charger les brouillons de dispatch depuis localStorage
  useEffect(() => {
    const loadDispatchDrafts = () => {
      const drafts: DispatchDraft[] = [];
      
      // Parcourir localStorage pour trouver les brouillons de dispatch
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('groupDispatchDraft-')) {
          try {
            const draftData = JSON.parse(localStorage.getItem(key) || '');
            const requestId = key.replace('groupDispatchDraft-', '');
            
            // Calculer le nombre de passagers assignés
            const assignedCount = draftData.taxis.reduce(
              (total: number, taxi: any) => total + taxi.assignedPassengers.length, 
              0
            );
            
            drafts.push({
              id: `dispatch-${requestId}`,
              requestId,
              reference: `TR-${requestId}`,
              passengerCount: draftData.passengerCount || assignedCount,
              assignedCount,
              lastModified: draftData.lastModified || new Date().toISOString()
            });
          } catch (error) {
            console.error('Error parsing dispatch draft:', error);
          }
        }
      }
      
      setDispatchDrafts(drafts);
    };
    
    loadDispatchDrafts();
  }, []);

  const handleEditDraft = (draft: DraftRequest) => {
    if (draft.type === 'individual') {
      navigate('/transport/create', { state: { draftId: draft.id } });
    } else {
      navigate('/transport/create-group', { state: { draftId: draft.id } });
    }
  };

  const handleEditDispatchDraft = (draft: DispatchDraft) => {
    navigate(`/transport/${draft.requestId}/group-dispatch`);
  };

  const handleDeleteDraft = (draftId: string) => {
    setDrafts(prev => prev.filter(d => d.id !== draftId));
    toast.success('Brouillon supprimé');
  };

  const handleDeleteDispatchDraft = (draft: DispatchDraft) => {
    localStorage.removeItem(`groupDispatchDraft-${draft.requestId}`);
    setDispatchDrafts(prev => prev.filter(d => d.id !== draft.id));
    toast.success('Brouillon de dispatch supprimé');
  };

  const getCompletionBadge = (percentage: number) => {
    if (percentage >= 80) return <Badge variant="default">Presque terminé</Badge>;
    if (percentage >= 50) return <Badge variant="secondary">En cours</Badge>;
    return <Badge variant="outline">Début</Badge>;
  };

  const requestColumns = [
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

  const dispatchColumns = [
    {
      header: 'Référence',
      accessor: 'reference' as keyof DispatchDraft,
      render: (draft: DispatchDraft) => (
        <div className="font-medium text-etaxi-yellow">{draft.reference}</div>
      )
    },
    {
      header: 'Passagers',
      accessor: 'passengerCount' as keyof DispatchDraft,
      render: (draft: DispatchDraft) => (
        <div className="flex items-center space-x-2">
          <span>{draft.assignedCount}/{draft.passengerCount} assigné(s)</span>
          <Badge variant={draft.assignedCount === draft.passengerCount ? "default" : "outline"}>
            {draft.assignedCount === draft.passengerCount ? 'Complet' : 'Partiel'}
          </Badge>
        </div>
      )
    },
    {
      header: 'Dernière modification',
      accessor: 'lastModified' as keyof DispatchDraft,
      render: (draft: DispatchDraft) => new Date(draft.lastModified).toLocaleString('fr-FR')
    }
  ];

  const requestActions = (draft: DraftRequest) => (
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

  const dispatchActions = (draft: DispatchDraft) => (
    <div className="flex items-center space-x-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          handleEditDispatchDraft(draft);
        }}
        title="Continuer le dispatch"
      >
        <Navigation className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteDispatchDraft(draft);
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

      <Tabs defaultValue="requests" onValueChange={(value) => setActiveTab(value as 'requests' | 'dispatch')}>
        <TabsList>
          <TabsTrigger value="requests" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Demandes ({drafts.length})</span>
          </TabsTrigger>
          <TabsTrigger value="dispatch" className="flex items-center space-x-2">
            <Car className="h-4 w-4" />
            <span>Dispatch ({dispatchDrafts.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Liste des brouillons de demandes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <TableWithPagination
                data={drafts}
                columns={requestColumns}
                actions={requestActions}
                itemsPerPage={10}
                onRowClick={handleEditDraft}
                emptyMessage="Aucun brouillon de demande trouvé"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dispatch">
          <Card>
            <CardHeader>
              <CardTitle>Liste des brouillons de dispatch</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <TableWithPagination
                data={dispatchDrafts}
                columns={dispatchColumns}
                actions={dispatchActions}
                itemsPerPage={10}
                onRowClick={handleEditDispatchDraft}
                emptyMessage="Aucun brouillon de dispatch trouvé"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}