
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableWithPagination } from '@/components/ui/table-with-pagination';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, MessageSquare, Clock, CheckCircle, User, Calendar } from 'lucide-react';

interface Claim {
  id: string;
  reference: string;
  type: 'complaint' | 'suggestion' | 'technical' | 'billing';
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  subject: string;
  description: string;
  submittedBy: string;
  submittedAt: string;
  response?: string;
  respondedAt?: string;
  respondedBy?: string;
}

export function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([
    {
      id: '1',
      reference: 'REC-2024-001',
      type: 'complaint',
      status: 'pending',
      subject: 'Retard du chauffeur',
      description: 'Le chauffeur est arrivé 30 minutes en retard pour la course TR-2024-001',
      submittedBy: 'Marie Dubois',
      submittedAt: '2024-01-15 10:30'
    },
    {
      id: '2',
      reference: 'REC-2024-002',
      type: 'technical',
      status: 'resolved',
      subject: 'Problème application mobile',
      description: 'Impossible de suivre la course en temps réel',
      submittedBy: 'Pierre Durand',
      submittedAt: '2024-01-14 16:20',
      response: 'Le problème a été identifié et corrigé. Merci de votre signalement.',
      respondedAt: '2024-01-15 09:00',
      respondedBy: 'Support Technique'
    }
  ]);

  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [response, setResponse] = useState('');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'complaint': return 'bg-red-100 text-red-800';
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'billing': return 'bg-yellow-100 text-yellow-800';
      case 'suggestion': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'complaint': return 'Plainte';
      case 'technical': return 'Technique';
      case 'billing': return 'Facturation';
      case 'suggestion': return 'Suggestion';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'resolved': return 'Résolu';
      case 'closed': return 'Fermé';
      default: return status;
    }
  };

  const handleRespond = (claim: Claim) => {
    if (!response.trim()) return;

    setClaims(prev => 
      prev.map(c => 
        c.id === claim.id 
          ? {
              ...c,
              response,
              respondedAt: new Date().toISOString(),
              respondedBy: 'Support Client',
              status: 'resolved' as const
            }
          : c
      )
    );

    setResponse('');
    setSelectedClaim(null);
  };

  const columns = [
    {
      header: 'Référence',
      accessor: 'reference' as keyof Claim,
      sortable: true,
      render: (item: Claim) => (
        <div className="font-medium text-etaxi-yellow">{item.reference}</div>
      )
    },
    {
      header: 'Type',
      accessor: 'type' as keyof Claim,
      render: (item: Claim) => (
        <Badge className={getTypeColor(item.type)}>
          {getTypeLabel(item.type)}
        </Badge>
      )
    },
    {
      header: 'Statut',
      accessor: 'status' as keyof Claim,
      render: (item: Claim) => (
        <Badge className={getStatusColor(item.status)}>
          {getStatusLabel(item.status)}
        </Badge>
      )
    },
    {
      header: 'Sujet',
      accessor: 'subject' as keyof Claim,
      sortable: true
    },
    {
      header: 'Soumis par',
      accessor: 'submittedBy' as keyof Claim,
      sortable: true,
      render: (item: Claim) => (
        <div className="flex items-center space-x-1">
          <User className="h-3 w-3 text-muted-foreground" />
          <span>{item.submittedBy}</span>
        </div>
      )
    },
    {
      header: 'Date',
      accessor: 'submittedAt' as keyof Claim,
      sortable: true,
      render: (item: Claim) => (
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span>{new Date(item.submittedAt).toLocaleString('fr-FR')}</span>
        </div>
      )
    }
  ];

  const getActions = (claim: Claim) => (
    <div className="flex items-center space-x-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedClaim(claim)}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Réclamation {claim.reference}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Type</p>
                <Badge className={getTypeColor(claim.type)}>
                  {getTypeLabel(claim.type)}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Statut</p>
                <Badge className={getStatusColor(claim.status)}>
                  {getStatusLabel(claim.status)}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Sujet</p>
              <p>{claim.subject}</p>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Description</p>
              <p className="bg-muted/50 p-3 rounded">{claim.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Soumis par</p>
                <p>{claim.submittedBy}</p>
              </div>
              <div>
                <p className="font-medium">Date</p>
                <p>{new Date(claim.submittedAt).toLocaleString('fr-FR')}</p>
              </div>
            </div>

            {claim.response && (
              <div>
                <p className="text-sm font-medium mb-2">Réponse</p>
                <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                  <p>{claim.response}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Répondu par {claim.respondedBy} le {claim.respondedAt && new Date(claim.respondedAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            )}

            {!claim.response && claim.status !== 'closed' && (
              <div>
                <p className="text-sm font-medium mb-2">Répondre</p>
                <Textarea
                  placeholder="Saisissez votre réponse..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={4}
                />
                <Button
                  className="mt-2 bg-etaxi-yellow hover:bg-yellow-500 text-black"
                  onClick={() => handleRespond(claim)}
                >
                  Envoyer la réponse
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  const stats = [
    {
      title: 'Total Réclamations',
      value: claims.length,
      icon: MessageSquare,
      color: 'text-blue-500'
    },
    {
      title: 'En Attente',
      value: claims.filter(c => c.status === 'pending').length,
      icon: Clock,
      color: 'text-yellow-500'
    },
    {
      title: 'En Cours',
      value: claims.filter(c => c.status === 'in_progress').length,
      icon: AlertTriangle,
      color: 'text-orange-500'
    },
    {
      title: 'Résolues',
      value: claims.filter(c => c.status === 'resolved').length,
      icon: CheckCircle,
      color: 'text-green-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">Gestion des Réclamations</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <TableWithPagination
        data={claims}
        columns={columns}
        title="Liste des Réclamations"
        searchPlaceholder="Rechercher par référence, sujet, demandeur..."
        actions={getActions}
      />
    </div>
  );
}
