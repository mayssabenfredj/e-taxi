
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../Logo';
import { Car, Users, MapPin, Clock, Shield, Zap, Building2, TrendingUp } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Car,
      title: "Gestion de Flotte",
      description: "Gérez votre flotte de taxis en temps réel avec un suivi complet"
    },
    {
      icon: Users,
      title: "Gestion d'Équipe",
      description: "Organisez vos employés et leurs demandes de transport facilement"
    },
    {
      icon: MapPin,
      title: "Dispatching Intelligent",
      description: "Assignation automatique basée sur la localisation et les préférences"
    },
    {
      icon: Clock,
      title: "Planification Avancée",
      description: "Programmez vos courses à l'avance avec des notifications"
    },
    {
      icon: Shield,
      title: "Sécurité & Conformité",
      description: "Respectez toutes les réglementations avec nos outils intégrés"
    },
    {
      icon: Zap,
      title: "Performances Optimisées",
      description: "Réduisez les coûts et améliorez l'efficacité de vos transports"
    }
  ];

  const stats = [
    { number: "500+", label: "Entreprises clientes" },
    { number: "10K+", label: "Courses par jour" },
    { number: "99.9%", label: "Disponibilité" },
    { number: "24/7", label: "Support client" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Connexion
            </Button>
            <Button className="bg-etaxi-yellow hover:bg-yellow-500 text-black" onClick={() => navigate('/auth')}>
              Commencer
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-etaxi-yellow/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              La plateforme de transport
              <span className="text-etaxi-yellow block">pour entreprises</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Simplifiez la gestion de vos transports d'entreprise avec notre solution complète. 
              Dispatching intelligent, suivi en temps réel et optimisation des coûts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-etaxi-yellow hover:bg-yellow-500 text-black text-lg px-8 py-3"
                onClick={() => navigate('/auth')}
              >
                Essai gratuit
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                Voir la démo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-3xl md:text-4xl font-bold text-etaxi-yellow mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">
              Pourquoi choisir E-Taxi ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une solution complète qui révolutionne la gestion de transport d'entreprise
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="hover-scale cursor-pointer animate-slide-up" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <feature.icon className="h-12 w-12 text-etaxi-yellow mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-right">
              <h2 className="text-4xl font-bold mb-6">
                À propos d'E-Taxi
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Depuis plus de 10 ans, nous accompagnons les entreprises dans l'optimisation 
                de leurs transports. Notre plateforme combine intelligence artificielle et 
                expertise métier pour vous offrir la meilleure solution du marché.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-6 w-6 text-etaxi-yellow" />
                  <span>Leader français du transport d'entreprise</span>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-6 w-6 text-etaxi-yellow" />
                  <span>Réduction moyenne de 30% des coûts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-etaxi-yellow" />
                  <span>Certifié ISO 27001 et RGPD</span>
                </div>
              </div>
            </div>
            <div className="animate-slide-in-left">
              <img 
                src="/placeholder.svg?height=400&width=600" 
                alt="E-Taxi Dashboard" 
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">
              Nos Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une gamme complète de services pour répondre à tous vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover-scale animate-slide-up">
              <CardContent className="p-8 text-center">
                <Car className="h-16 w-16 text-etaxi-yellow mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Transport à la demande</h3>
                <p className="text-muted-foreground">
                  Réservez un taxi en quelques clics pour vos employés, 
                  disponible 24h/24 et 7j/7
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-8 text-center">
                <Clock className="h-16 w-16 text-etaxi-yellow mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Courses programmées</h3>
                <p className="text-muted-foreground">
                  Planifiez vos transports récurrents et optimisez 
                  les trajets de vos équipes
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-8 text-center">
                <Users className="h-16 w-16 text-etaxi-yellow mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Transport partagé</h3>
                <p className="text-muted-foreground">
                  Réduisez vos coûts avec le covoiturage intelligent 
                  entre collaborateurs
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-etaxi-yellow to-yellow-500">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-fade-in">
            <h2 className="text-4xl font-bold text-black mb-4">
              Prêt à révolutionner vos transports ?
            </h2>
            <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
              Rejoignez les centaines d'entreprises qui font confiance à E-Taxi 
              pour leurs besoins de transport
            </p>
            <Button 
              size="lg" 
              className="bg-black hover:bg-gray-800 text-white text-lg px-8 py-3"
              onClick={() => navigate('/auth')}
            >
              Commencer maintenant
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Logo />
              <p className="text-muted-foreground mt-4">
                La plateforme de transport d'entreprise nouvelle génération
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Fonctionnalités</li>
                <li>Tarification</li>
                <li>API</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>À propos</li>
                <li>Carrières</li>
                <li>Presse</li>
                <li>Partenaires</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Confidentialité</li>
                <li>Conditions</li>
                <li>Cookies</li>
                <li>RGPD</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 E-Taxi. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
