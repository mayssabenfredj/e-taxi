
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarContent, AvatarFallback } from '@/components/ui/avatar';
import { Car, Users, MapPin, Clock, Navigation, User, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  phone: string;
  departureAddress: string;
  arrivalAddress: string;
  requestTime: string;
  type: 'private' | 'public';
}

interface Taxi {
  id: string;
  licensePlate: string;
  driver: string;
  capacity: number;
  assignedEmployees: Employee[];
  status: 'available' | 'assigned' | 'dispatched';
}

export function DispatchPage() {
  const [employees] = useState<Employee[]>([
    {
      id: '1',
      name: 'Jean Dupont',
      phone: '+33 6 12 34 56 78',
      departureAddress: '15 Rue du Louvre, 75001 Paris',
      arrivalAddress: '101 Avenue des Champs-Élysées, 75008 Paris',
      requestTime: '09:00',
      type: 'public'
    },
    {
      id: '2',
      name: 'Marie Martin',
      phone: '+33 6 98 76 54 32',
      departureAddress: '25 Rue de Rivoli, 75004 Paris',
      arrivalAddress: '101 Avenue des Champs-Élysées, 75008 Paris',
      requestTime: '09:15',
      type: 'public'
    },
    {
      id: '3',
      name: 'Pierre Durand',
      phone: '+33 7 12 34 56 78',
      departureAddress: '5 Avenue Montaigne, 75008 Paris',
      arrivalAddress: '101 Avenue des Champs-Élysées, 75008 Paris',
      requestTime: '09:30',
      type: 'private'
    },
    {
      id: '4',
      name: 'Sophie Lefebvre',
      phone: '+33 6 45 67 89 01',
      departureAddress: '30 Rue Saint-Honoré, 75001 Paris',
      arrivalAddress: '101 Avenue des Champs-Élysées, 75008 Paris',
      requestTime: '09:45',
      type: 'public'
    }
  ]);

  const [taxis, setTaxis] = useState<Taxi[]>([
    {
      id: '1',
      licensePlate: 'AB-123-CD',
      driver: 'Ahmed Hassan',
      capacity: 4,
      assignedEmployees: [],
      status: 'available'
    },
    {
      id: '2',
      licensePlate: 'EF-456-GH',
      driver: 'Marie Dubois',
      capacity: 4,
      assignedEmployees: [],
      status: 'available'
    },
    {
      id: '3',
      licensePlate: 'IJ-789-KL',
      driver: 'Jean Moreau',
      capacity: 4,
      assignedEmployees: [],
      status: 'available'
    }
  ]);

  const [draggedEmployee, setDraggedEmployee] = useState<Employee | null>(null);

  const handleDragStart = (employee: Employee) => {
    setDraggedEmployee(employee);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, taxiId: string) => {
    e.preventDefault();
    
    if (!draggedEmployee) return;

    const taxi = taxis.find(t => t.id === taxiId);
    if (!taxi) return;

    // Vérifications pour l'assignation
    if (draggedEmployee.type === 'private' && taxi.assignedEmployees.length > 0) {
      toast.error('Les demandes privées nécessitent un taxi dédié');
      return;
    }

    if (draggedEmployee.type === 'public' && taxi.assignedEmployees.length >= 4) {
      toast.error('Maximum 4 passagers pour les demandes publiques');
      return;
    }

    if (taxi.assignedEmployees.some(emp => emp.type === 'private')) {
      toast.error('Ce taxi est déjà assigné à une demande privée');
      return;
    }

    // Assigner l'employé au taxi
    setTaxis(prevTaxis => 
      prevTaxis.map(t => 
        t.id === taxiId 
          ? { 
              ...t, 
              assignedEmployees: [...t.assignedEmployees, draggedEmployee],
              status: 'assigned' as const
            }
          : t
      )
    );

    toast.success(`${draggedEmployee.name} assigné au taxi ${taxi.licensePlate}`);
    setDraggedEmployee(null);
  };

  const removeEmployeeFromTaxi = (taxiId: string, employeeId: string) => {
    setTaxis(prevTaxis => 
      prevTaxis.map(taxi => {
        if (taxi.id === taxiId) {
          const newEmployees = taxi.assignedEmployees.filter(emp => emp.id !== employeeId);
          return {
            ...taxi,
            assignedEmployees: newEmployees,
            status: newEmployees.length === 0 ? 'available' as const : 'assigned' as const
          };
        }
        return taxi;
      })
    );
  };

  const dispatchTaxi = (taxiId: string) => {
    setTaxis(prevTaxis => 
      prevTaxis.map(taxi => 
        taxi.id === taxiId 
          ? { ...taxi, status: 'dispatched' as const }
          : taxi
      )
    );
    
    const taxi = taxis.find(t => t.id === taxiId);
    toast.success(`Taxi ${taxi?.licensePlate} dispatché avec ${taxi?.assignedEmployees.length} passager(s)`);
  };

  const unassignedEmployees = employees.filter(emp => 
    !taxis.some(taxi => taxi.assignedEmployees.some(assigned => assigned.id === emp.id))
  );

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Navigation className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">Interface de Dispatching</h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <MapPin className="mr-2 h-4 w-4" />
            Vue carte
          </Button>
          <Button className="bg-etaxi-yellow hover:bg-yellow-500 text-black">
            Dispatcher tout
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{unassignedEmployees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Taxis disponibles</p>
                <p className="text-2xl font-bold">
                  {taxis.filter(t => t.status === 'available').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Navigation className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Assignés</p>
                <p className="text-2xl font-bold">
                  {taxis.filter(t => t.status === 'assigned').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">En route</p>
                <p className="text-2xl font-bold">
                  {taxis.filter(t => t.status === 'dispatched').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Employés en attente */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Employés en attente ({unassignedEmployees.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unassignedEmployees.map((employee) => (
              <div
                key={employee.id}
                draggable
                onDragStart={() => handleDragStart(employee)}
                className="p-4 border rounded-lg cursor-move hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">{employee.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={employee.type === 'private' ? 'default' : 'secondary'}>
                      {employee.type === 'private' ? 'Privé' : 'Public'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{employee.requestTime}</span>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3 text-green-500" />
                    <span className="truncate">{employee.departureAddress}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3 text-red-500" />
                    <span className="truncate">{employee.arrivalAddress}</span>
                  </div>
                </div>
              </div>
            ))}
            {unassignedEmployees.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Tous les employés ont été assignés
              </div>
            )}
          </CardContent>
        </Card>

        {/* Taxis */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Car className="h-5 w-5" />
              <span>Flotte de taxis ({taxis.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {taxis.map((taxi) => (
              <div
                key={taxi.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, taxi.id)}
                className={`p-4 border rounded-lg transition-all ${
                  taxi.status === 'available' ? 'border-green-200 bg-green-50/50' :
                  taxi.status === 'assigned' ? 'border-yellow-200 bg-yellow-50/50' :
                  'border-blue-200 bg-blue-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Car className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{taxi.licensePlate}</div>
                      <div className="text-sm text-muted-foreground">{taxi.driver}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className={
                        taxi.status === 'available' ? 'bg-green-100 text-green-800' :
                        taxi.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }
                    >
                      {taxi.status === 'available' ? 'Disponible' :
                       taxi.status === 'assigned' ? 'Assigné' : 'En route'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {taxi.assignedEmployees.length}/{taxi.capacity}
                    </span>
                  </div>
                </div>

                {taxi.assignedEmployees.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {taxi.assignedEmployees.map((emp) => (
                      <div key={emp.id} className="flex items-center justify-between p-2 bg-background rounded border">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{emp.name}</span>
                          <Badge size="sm" variant={emp.type === 'private' ? 'default' : 'secondary'}>
                            {emp.type === 'private' ? 'P' : 'Pub'}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => removeEmployeeFromTaxi(taxi.id, emp.id)}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {taxi.assignedEmployees.length > 0 && taxi.status !== 'dispatched' && (
                  <Button
                    size="sm"
                    className="w-full bg-etaxi-yellow hover:bg-yellow-500 text-black"
                    onClick={() => dispatchTaxi(taxi.id)}
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    Dispatcher ce taxi
                  </Button>
                )}

                {taxi.assignedEmployees.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground border-2 border-dashed rounded">
                    Glissez des employés ici
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
