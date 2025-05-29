
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  Users, 
  Building2, 
  TrendingUp, 
  MapPin, 
  Clock, 
  Plus,
  ArrowRight,
  Star
} from 'lucide-react';

export function DashboardHome() {
  const navigate = useNavigate();

  // Sample data for charts
  const transportData = [
    { month: 'Jan', demandes: 45, completees: 42 },
    { month: 'Fév', demandes: 52, completees: 48 },
    { month: 'Mar', demandes: 61, completees: 58 },
    { month: 'Avr', demandes: 48, completees: 45 },
    { month: 'Mai', demandes: 67, completees: 63 },
    { month: 'Jun', demandes: 71, completees: 68 }
  ];

  const taxiPreferencesData = [
    { name: 'Uber', value: 35, color: '#000000' },
    { name: 'Bolt', value: 25, color: '#34D399' },
    { name: 'G7', value: 20, color: '#FCD34D' },
    { name: 'Marcel', value: 12, color: '#F87171' },
    { name: 'Autres', value: 8, color: '#9CA3AF' }
  ];

  const quickActions = [
    {
      title: 'Nouvelle demande',
      description: 'Créer une demande de transport',
      icon: Plus,
      action: () => navigate('/transport/create'),
      color: 'bg-etaxi-yellow hover:bg-yellow-500'
    },
    {
      title: 'Ajouter employé',
      description: 'Enregistrer un nouvel employé',
      icon: Users,
      action: () => navigate('/employees'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Nouvelle filiale',
      description: 'Créer une filiale',
      icon: Building2,
      action: () => navigate('/subsidiaries'),
      color: 'bg-green-500 hover:bg-green-600'
    }
  ];

  const chartConfig = {
    demandes: {
      label: "Demandes",
      color: "#FCD34D",
    },
    completees: {
      label: "Complétées",
      color: "#34D399",
    },
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-etaxi-yellow/10 to-transparent p-6 rounded-lg animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Bonjour ! 👋</h1>
        <p className="text-muted-foreground">
          Voici un aperçu de votre activité transport aujourd'hui
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="animate-slide-up hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Demandes du jour</p>
                <p className="text-3xl font-bold">12</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15% vs hier
                </p>
              </div>
              <div className="h-12 w-12 bg-etaxi-yellow/10 rounded-full flex items-center justify-center">
                <Car className="h-6 w-6 text-etaxi-yellow" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up hover-scale" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Employés actifs</p>
                <p className="text-3xl font-bold">156</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <Users className="h-3 w-3 mr-1" />
                  73 connectés
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up hover-scale" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Filiales</p>
                <p className="text-3xl font-bold">8</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <Building2 className="h-3 w-3 mr-1" />
                  Toutes actives
                </p>
              </div>
              <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <Building2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up hover-scale" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Satisfaction</p>
                <p className="text-3xl font-bold">4.8</p>
                <div className="flex items-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <div className="h-12 w-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle>Évolution des demandes</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={transportData}>
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="demandes" fill="var(--color-demandes)" radius={4} />
                <Bar dataKey="completees" fill="var(--color-completees)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle>Apps taxi préférées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taxiPreferencesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {taxiPreferencesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-2 shadow-md">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm text-muted-foreground">{data.value}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {taxiPreferencesData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm text-muted-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className={`h-24 flex-col space-y-2 hover:scale-105 transition-transform ${action.color} text-white border-none`}
                onClick={action.action}
              >
                <action.icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Activité récente</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/transport')}>
            Voir tout <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: '14:30', action: 'Nouvelle demande créée', user: 'Marie Dupont', status: 'pending' },
              { time: '13:45', action: 'Course terminée', user: 'Jean Martin', status: 'completed' },
              { time: '12:20', action: 'Employé ajouté', user: 'Sophie Laurent', status: 'info' },
              { time: '11:15', action: 'Course en cours', user: 'Pierre Durand', status: 'progress' }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50">
                <div className="text-sm text-muted-foreground w-16">{item.time}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.user}</p>
                </div>
                <Badge 
                  variant={item.status === 'completed' ? 'default' : 'secondary'}
                  className={
                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    item.status === 'completed' ? 'bg-green-100 text-green-800' :
                    item.status === 'progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }
                >
                  {item.status === 'pending' ? 'En attente' :
                   item.status === 'completed' ? 'Terminé' :
                   item.status === 'progress' ? 'En cours' : 'Info'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
