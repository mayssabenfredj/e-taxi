import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Search, Filter, MessageSquare, ChevronDown } from 'lucide-react';
import { Claim } from '@/types/employee';

interface EmployeeClaimsTabProps {
  claimsHistory: Claim[];
}

const EmployeeClaimsTab: React.FC<EmployeeClaimsTabProps> = ({ claimsHistory }) => {
  const [currentClaimsPage, setCurrentClaimsPage] = useState(1);
  const [claimsPerPage] = useState(3);
  const [claimsSearchTerm, setClaimsSearchTerm] = useState('');
  const [claimsTypeFilter, setClaimsTypeFilter] = useState<string>('all');
  const [claimsStatusFilter, setClaimsStatusFilter] = useState<string>('all');

  const getClaimTypeColor = (type: string) => {
    switch (type) {
      case 'complaint': return 'bg-red-100 text-red-800';
      case 'suggestion': return 'bg-blue-100 text-blue-800';
      case 'technical': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClaimStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredClaims = claimsHistory.filter((claim) => {
    const matchesSearch =
      claim.subject.toLowerCase().includes(claimsSearchTerm.toLowerCase()) ||
      claim.description.toLowerCase().includes(claimsSearchTerm.toLowerCase());
    const matchesType = claimsTypeFilter === 'all' || claim.type === claimsTypeFilter;
    const matchesStatus = claimsStatusFilter === 'all' || claim.status === claimsStatusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const indexOfLastClaim = currentClaimsPage * claimsPerPage;
  const indexOfFirstClaim = indexOfLastClaim - claimsPerPage;
  const currentClaims = filteredClaims.slice(indexOfFirstClaim, indexOfLastClaim);
  const totalClaimsPages = Math.ceil(filteredClaims.length / claimsPerPage);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Historique des réclamations ({claimsHistory.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans les réclamations..."
              value={claimsSearchTerm}
              onChange={(e) => setClaimsSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={claimsTypeFilter} onValueChange={setClaimsTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="complaint">Plaintes</SelectItem>
                <SelectItem value="suggestion">Suggestions</SelectItem>
                <SelectItem value="technical">Techniques</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={claimsStatusFilter} onValueChange={setClaimsStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="resolved">Résolu</SelectItem>
                <SelectItem value="closed">Fermé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredClaims.length > 0 ? (
          <div className="space-y-4">
            {currentClaims.map((claim) => (
              <Collapsible key={claim.id} className="border rounded-lg">
                <CollapsibleTrigger className="w-full text-left p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`inline-block px-2 py-0.5 text-xs rounded ${getClaimTypeColor(claim.type)}`}>
                          {claim.type === 'complaint' ? 'Plainte' : claim.type === 'suggestion' ? 'Suggestion' : 'Technique'}
                        </span>
                        <span className={`inline-block px-2 py-0.5 text-xs rounded ${getClaimStatusColor(claim.status)}`}>
                          {claim.status === 'pending' ? 'En attente' : claim.status === 'resolved' ? 'Résolu' : 'Fermé'}
                        </span>
                      </div>
                      <h4 className="font-medium">{claim.subject}</h4>
                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        {claim.description.substring(0, 100)}
                        {claim.description.length > 100 ? '...' : ''}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {new Date(claim.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-0 border-t">
                    <div className="mb-3">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Description complète:</p>
                      <p className="text-sm">{claim.description}</p>
                    </div>

                    {claim.response && (
                      <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                        <p className="text-sm font-medium text-green-800 mb-1">Réponse:</p>
                        <p className="text-sm text-green-700">{claim.response}</p>
                      </div>
                    )}

                    <div className="mt-3 text-xs text-muted-foreground">
                      Créé le {new Date(claim.createdAt).toLocaleString('fr-FR')}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>Aucune réclamation trouvée</p>
          </div>
        )}

        {filteredClaims.length > 0 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentClaimsPage((prev) => Math.max(prev - 1, 1))}
                  className={currentClaimsPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {Array.from({ length: totalClaimsPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={currentClaimsPage === i + 1}
                    onClick={() => setCurrentClaimsPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentClaimsPage((prev) => Math.min(prev + 1, totalClaimsPages))}
                  className={currentClaimsPage === totalClaimsPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeClaimsTab;