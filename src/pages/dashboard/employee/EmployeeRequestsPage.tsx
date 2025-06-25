import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableWithPagination } from '@/components/ui/table-with-pagination';
import { Users, CheckCircle, X, Mail, Phone, Calendar } from 'lucide-react';

interface EmployeeRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  requestDate: string;
  subsidiary?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function EmployeeRequestsPage() {
  const [requests, setRequests] = useState<EmployeeRequest[]>([
    {
      id: '1',
      name: 'Pierre Durand',
      email: 'pierre.durand@email.com',
      phone: '+33 6 11 22 33 44',
      requestDate: '2024-01-15',
      subsidiary: 'TechCorp Paris',
      status: 'pending'
    },
    {
      id: '2',
      name: 'Sophie Laurent',
      email: 'sophie.laurent@email.com',
      phone: '+33 6 55 66 77 88',
      requestDate: '2024-01-14',
      subsidiary: 'TechCorp Lyon',
      status: 'pending'
    }
  ]);

  const handleAcceptRequest = (id: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === id ? { ...req, status: 'approved' as const } : req
      )
    );
  };

  const handleRejectRequest = (id: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === id ? { ...req, status: 'rejected' as const } : req
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  const columns = [
    {
      header: 'Nom',
      accessor: 'name' as keyof EmployeeRequest,
      sortable: true
    },
    {
      header: 'Contact',
      accessor: 'email' as keyof EmployeeRequest,
      render: (request: EmployeeRequest) => (
        <div className="space-y-1 text-sm">
          <div className="flex items-center">
            <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
            {request.email}
          </div>
          <div className="flex items-center">
            <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
            {request.phone}
          </div>
        </div>
      )
    },
    {
      header: 'Filiale',
      accessor: 'subsidiary' as keyof EmployeeRequest,
      sortable: true
    },
    {
      header: 'Date de demande',
      accessor: 'requestDate' as keyof EmployeeRequest,
      sortable: true,
      render: (request: EmployeeRequest) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
          {new Date(request.requestDate).toLocaleDateString('fr-FR')}
        </div>
      )
    },
    {
      header: 'Statut',
      accessor: 'status' as keyof EmployeeRequest,
      render: (request: EmployeeRequest) => (
        <Badge className={getStatusColor(request.status)}>
          {getStatusLabel(request.status)}
        </Badge>
      )
    }
  ];

  const filterOptions = [
    { label: 'En attente', value: 'pending', field: 'status' as keyof EmployeeRequest },
    { label: 'Approuvé', value: 'approved', field: 'status' as keyof EmployeeRequest },
    { label: 'Rejeté', value: 'rejected', field: 'status' as keyof EmployeeRequest },
  ];

  const getActions = (request: EmployeeRequest) => {
    if (request.status === 'pending') {
      return (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleAcceptRequest(request.id);
            }}
            className="text-green-600 hover:text-green-700"
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleRejectRequest(request.id);
            }}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Users className="h-6 w-6 text-etaxi-yellow" />
        <h2 className="text-2xl font-bold">Demandes des Collaborateur</h2>
      </div>

      <TableWithPagination
        data={requests}
        columns={columns}
        title="Liste des demandes des collaborateurs"
        searchPlaceholder="Rechercher par nom, email ou filiale..."
        actions={getActions}
        filterOptions={filterOptions}
      />
    </div>
  );
}