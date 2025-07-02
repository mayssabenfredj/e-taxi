import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shareds/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shareds/components/ui/table';
import { Button } from '@/shareds/components/ui/button';
import { Calendar, Clock, Eye } from 'lucide-react';
import { Transport } from '@/features/employees/types/employee';

interface EmployeeHistoryTabProps {
  transportHistory: Transport[];
  onViewRequest: (requestId: string) => void;
}

const EmployeeHistoryTab: React.FC<EmployeeHistoryTabProps> = ({
  transportHistory,
  onViewRequest,
}) => {
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
                      <p className="text-xs text-muted-foreground">
                        {transport.departureAddress.formattedAddress}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="text-xs text-muted-foreground">
                        {transport.arrivalAddress.formattedAddress}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded ${
                        transport.status === 'Complété'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {transport.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono">{transport.requestId}</span>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewRequest(transport.requestId)}
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
};

export default EmployeeHistoryTab;