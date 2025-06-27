
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shareds/components/ui/card';
import { Button } from '@/shareds/components/ui/button';
import { Badge } from '@/shareds/components/ui/badge';
import { TableWithPagination } from '@/shareds/components/ui/table-with-pagination';
import { Bell, BellOff, Clock, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Demande de transport en attente',
      message: 'La demande TR-2024-001 attend validation depuis 2 heures',
      createdAt: '2024-01-15 10:30',
      read: false,
      actionUrl: '/transport'
    },
    {
      id: '2',
      type: 'success',
      title: 'Course terminée',
      message: 'La course TR-2024-002 a été terminée avec succès',
      createdAt: '2024-01-15 09:15',
      read: true
    },
    {
      id: '3',
      type: 'info',
      title: 'Nouveau chauffeur disponible',
      message: 'Le chauffeur Ahmed Ben Ali est maintenant disponible',
      createdAt: '2024-01-15 08:45',
      read: false
    },
    {
      id: '4',
      type: 'error',
      title: 'Problème de dispatching',
      message: 'Impossible d\'assigner un taxi à la demande TR-2024-003',
      createdAt: '2024-01-15 08:00',
      read: false,
      actionUrl: '/dispatch'
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'success': return <Badge className="bg-green-100 text-green-800">Succès</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Attention</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-800">Erreur</Badge>;
      default: return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const columns = [
    {
      header: 'Type',
      accessor: 'type' as keyof Notification,
      render: (item: Notification) => (
        <div className="flex items-center space-x-2">
          {getTypeIcon(item.type)}
          {getTypeBadge(item.type)}
        </div>
      )
    },
    {
      header: 'Titre',
      accessor: 'title' as keyof Notification,
      sortable: true,
      render: (item: Notification) => (
        <div className={`font-medium ${!item.read ? 'text-foreground' : 'text-muted-foreground'}`}>
          {item.title}
        </div>
      )
    },
    {
      header: 'Message',
      accessor: 'message' as keyof Notification,
      render: (item: Notification) => (
        <div className={`text-sm ${!item.read ? 'text-foreground' : 'text-muted-foreground'}`}>
          {item.message}
        </div>
      )
    },
    {
      header: 'Date',
      accessor: 'createdAt' as keyof Notification,
      sortable: true,
      render: (item: Notification) => (
        <div className="flex items-center space-x-1 text-sm">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span>{new Date(item.createdAt).toLocaleString('fr-FR')}</span>
        </div>
      )
    },
    {
      header: 'Statut',
      accessor: 'read' as keyof Notification,
      render: (item: Notification) => (
        <Badge variant={item.read ? 'secondary' : 'default'}>
          {item.read ? 'Lu' : 'Non lu'}
        </Badge>
      )
    }
  ];

  const getActions = (notification: Notification) => (
    <div className="flex items-center space-x-2">
      {!notification.read && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => markAsRead(notification.id)}
        >
          Marquer comme lu
        </Button>
      )}
    </div>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-6 w-6 text-etaxi-yellow" />
          <h2 className="text-2xl font-bold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} non lues</Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={markAllAsRead}>
            <BellOff className="mr-2 h-4 w-4" />
            Marquer tout comme lu
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Non lues</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Alertes</p>
                <p className="text-2xl font-bold">
                  {notifications.filter(n => n.type === 'warning' || n.type === 'error').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Succès</p>
                <p className="text-2xl font-bold">
                  {notifications.filter(n => n.type === 'success').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <TableWithPagination
        data={notifications}
        columns={columns}
        title="Liste des notifications"
        searchPlaceholder="Rechercher dans les notifications..."
        actions={getActions}
      />
    </div>
  );
}
