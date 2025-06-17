import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Eye } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';
import { Transport } from './types';

interface EmployeeTransportHistoryProps {
  transportHistory: Transport[];
  navigate: NavigateFunction;
}

export function EmployeeTransportHistory({
  transportHistory,
  navigate,
}: EmployeeTransportHistoryProps) {
  const handleViewTransportRequest = (requestId: string) => {
    navigate(`/transport/${requestId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Historique de transport ({transportHistory.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transportHistory.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Heure</TableHead>
                <TableHead>Départ</TableHead>
                <TableHead>Arrivée</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>ID Demande</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transportHistory.map((transport) => (
                <TableRow key={transport.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                      {transport.date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-500" />
                      {transport.time}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">{transport.departureAddress.label}</span>
                      <p className="text-xs text-muted-foreground">
                        {transport.departureAddress.street}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">{transport.arrivalAddress.label}</span>
                      <p className="text-xs text-muted-foreground">
                        {transport.arrivalAddress.street}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        transport.status === 'Complété'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }
                    >
                      {transport.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono">{transport.requestId}</span>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewTransportRequest(transport.requestId)}
                      title="Voir les détails de la demande"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>Aucun historique de transport</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}