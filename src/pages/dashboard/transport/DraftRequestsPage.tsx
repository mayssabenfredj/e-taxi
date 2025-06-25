import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableWithPagination } from '@/components/ui/table-with-pagination';
import { ArrowLeft, Edit, Trash2, FileText, Car, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DraftData } from '@/types/demande';

interface DraftRequest {
  id: string;
  type: 'individual' | 'group';
  title: string;
  lastModified: string;
  passengerCount: number;
  note?: string;
  completionPercentage: number;
  draftData: DraftData; // Ajout pour stocker les données complètes du brouillon
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
  const [drafts, setDrafts] = useState<DraftRequest[]>([]);
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
              lastModified: draftData.lastModified || new Date().toISOString(),
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

  // Charger les brouillons de demandes depuis localStorage
  useEffect(() => {
    const loadDrafts = () => {
      const savedDrafts = localStorage.getItem('groupTransportDrafts');
      const loadedDrafts: DraftRequest[] = [];

      if (savedDrafts) {
        try {
          const drafts: DraftData[] = JSON.parse(savedDrafts);
          drafts.forEach((draftData) => {
            if (draftData.draftId) {
              const completionPercentage = calculateCompletionPercentage(draftData);
              loadedDrafts.push({
                id: draftData.draftId,
                type: draftData.selectedPassengers?.length === 1 ? 'individual' : 'group',
                title: draftData.note || `Brouillon de groupe ${draftData.draftId.slice(0, 8)}`,
                lastModified: draftData.lastModified || new Date().toISOString(),
                passengerCount: draftData.selectedPassengers?.length || 0,
                note: draftData.note,
                completionPercentage,
                draftData, // Stocker les données complètes du brouillon
              });
            }
          });
        } catch (error) {
          console.error('Error parsing transport drafts:', error);
        }
      }

      setDrafts(loadedDrafts);
    };

    loadDrafts();
  }, []);

  // Calculer le pourcentage de complétion d'un brouillon
  const calculateCompletionPercentage = (draftData: DraftData): number => {
    let completedFields = 0;
    const totalFields = 5; // Par exemple : employés, type de transport, date, heure, adresses valides

    if (draftData.selectedPassengers?.length > 0) completedFields++;
    if (draftData.transportType) completedFields++;
    if (draftData.scheduledDate) completedFields++;
    if (draftData.scheduledTime) completedFields++;
    if (
      draftData.selectedPassengers?.every(
        (p) => p.departureAddressId !== 'none' && p.arrivalAddressId !== 'none'
      )
    ) {
      completedFields++;
    }

    return Math.round((completedFields / totalFields) * 100);
  };

  const handleEditDraft = (draft: DraftRequest) => {
    navigate('/transport/create-transport', {
      state: { draftId: draft.id, draftData: draft.draftData },
    });
  };

  const handleEditDispatchDraft = (draft: DispatchDraft) => {
    navigate(`/transport/${draft.requestId}/group-dispatch`);
  };

  const handleDeleteDraft = (draftId: string) => {
    try {
      const drafts = JSON.parse(localStorage.getItem('groupTransportDrafts') || '[]') as DraftData[];
      const updatedDrafts = drafts.filter((d) => d.draftId !== draftId);
      localStorage.setItem('groupTransportDrafts', JSON.stringify(updatedDrafts));
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
      toast.success('Brouillon supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression du brouillon');
    }
  };

  const handleDeleteDispatchDraft = (draft: DispatchDraft) => {
    try {
      const key = `groupDispatchDraft-${draft.requestId}`;
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        setDispatchDrafts((prev) => prev.filter((d) => d.id !== draft.id));
        toast.success('Brouillon de dispatch supprimé');
      } else {
        toast.error('Brouillon de dispatch introuvable dans le stockage local');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression du brouillon de dispatch');
    }
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
      ),
    },
    {
      header: 'Titre',
      accessor: 'title' as keyof DraftRequest,
      render: (draft: DraftRequest) => (
        <div>
          <div className="font-medium">{draft.title}</div>
          {draft.note && (
            <div className="text-sm text-muted-foreground truncate max-w-xs">{draft.note}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Passagers',
      accessor: 'passengerCount' as keyof DraftRequest,
      render: (draft: DraftRequest) => `${draft.passengerCount} passager${draft.passengerCount !== 1 ? 's' : ''}`,
    },
    {
      header: 'Dernière modification',
      accessor: 'lastModified' as keyof DraftRequest,
      render: (draft: DraftRequest) => new Date(draft.lastModified).toLocaleString('fr-FR'),
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
      ),
    },
  ];

  const dispatchColumns = [
    {
      header: 'Référence',
      accessor: 'reference' as keyof DispatchDraft,
      render: (draft: DispatchDraft) => (
        <div className="font-medium text-etaxi-yellow">{draft.reference}</div>
      ),
    },
    {
      header: 'Passagers',
      accessor: 'passengerCount' as keyof DispatchDraft,
      render: (draft: DispatchDraft) => (
        <div className="flex items-center space-x-2">
          <span>{draft.assignedCount}/{draft.passengerCount} assigné(s)</span>
          <Badge variant={draft.assignedCount === draft.passengerCount ? 'default' : 'outline'}>
            {draft.assignedCount === draft.passengerCount ? 'Complet' : 'Partiel'}
          </Badge>
        </div>
      ),
    },
    {
      header: 'Dernière modification',
      accessor: 'lastModified' as keyof DispatchDraft,
      render: (draft: DispatchDraft) => new Date(draft.lastModified).toLocaleString('fr-FR'),
    },
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

  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(10);

  const handlePageChange = (newSkip: number, newTake: number) => {
    setSkip(newSkip);
    setTake(newTake);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
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
                take={take}
                skip={skip}
                total={drafts.length}
                onPageChange={handlePageChange}
                onRowClick={handleEditDraft}
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
                take={take}
                skip={skip}
                total={dispatchDrafts.length}
                onPageChange={handlePageChange}
                onRowClick={handleEditDispatchDraft}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
