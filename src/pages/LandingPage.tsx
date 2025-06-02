
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { 
  Car, Users, MapPin, Clock, Shield, Zap, Building2, TrendingUp, 
  Star, CheckCircle, Phone, Mail, ArrowRight, Play, Quote,
  Target, Award, Globe, HeadphonesIcon
} from 'lucide-react';

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

  const services = [
    {
      icon: Building2,
      title: "Pour Entreprises",
      description: "Solutions complètes de transport pour vos équipes",
      features: ["Gestion centralisée", "Reporting avancé", "Facturation groupée", "API intégrée"],
      price: "Sur mesure"
    },
    {
      icon: Users,
      title: "Pour Particuliers",
      description: "Service de taxi premium pour vos déplacements personnels",
      features: ["Réservation instantanée", "Chauffeurs certifiés", "Véhicules premium", "Support 24/7"],
      price: "À partir de 15€"
    }
  ];

  const testimonials = [
    {
      name: "Marie Dubois",
      position: "DRH, TechCorp",
      content: "E-Taxi a révolutionné notre gestion des transports. Nous avons réduit nos coûts de 40% tout en améliorant la satisfaction de nos employés.",
      rating: 5,
      avatar: "MD"
    },
    {
      name: "Pierre Martin",
      position: "Directeur Général, InnovSoft",
      content: "Le système de dispatching intelligent nous fait gagner un temps précieux. L'interface est intuitive et le support client exceptionnel.",
      rating: 5,
      avatar: "PM"
    },
    {
      name: "Sophie Laurent",
      position: "Responsable Logistique, GlobalTech",
      content: "Nous utilisons E-Taxi depuis 2 ans. La plateforme est fiable, les chauffeurs professionnels et les tarifs transparents.",
      rating: 5,
      avatar: "SL"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "49€",
      period: "/ mois",
      description: "Parfait pour les petites entreprises",
      features: [
        "Jusqu'à 50 employés",
        "100 courses / mois",
        "Dispatching de base",
        "Support email",
        "Reporting mensuel"
      ],
      highlighted: false
    },
    {
      name: "Professional",
      price: "149€",
      period: "/ mois",
      description: "Idéal pour les entreprises en croissance",
      features: [
        "Jusqu'à 200 employés",
        "Courses illimitées",
        "Dispatching intelligent",
        "Support prioritaire",
        "API & intégrations",
        "Reporting en temps réel",
        "Gestion multi-filiales"
      ],
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Sur mesure",
      period: "",
      description: "Solution sur mesure pour les grandes entreprises",
      features: [
        "Employés illimités",
        "Courses illimitées",
        "IA avancée",
        "Support dédié 24/7",
        "Intégrations personnalisées",
        "SLA garantie",
        "Formation équipes",
        "Déploiement sur site"
      ],
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center space-x-6">
            <a href="#services" className="text-muted-foreground hover:text-etaxi-yellow transition-colors">Services</a>
            <a href="#pricing" className="text-muted-foreground hover:text-etaxi-yellow transition-colors">Tarifs</a>
            <a href="#about" className="text-muted-foreground hover:text-etaxi-yellow transition-colors">À propos</a>
            <a href="#contact" className="text-muted-foreground hover:text-etaxi-yellow transition-colors">Contact</a>
          </div>
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

      {/* Hero Section with Animated Taxis */}
      <section className="py-20 bg-gradient-to-br from-etaxi-yellow/10 to-background relative overflow-hidden">
        {/* Animated taxis */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 animate-bounce delay-100">
            <Car className="h-8 w-8 text-etaxi-yellow/30" />
          </div>
          <div className="absolute top-40 right-20 animate-bounce delay-300">
            <Car className="h-6 w-6 text-etaxi-yellow/20" />
          </div>
          <div className="absolute bottom-32 left-1/4 animate-bounce delay-500">
            <Car className="h-7 w-7 text-etaxi-yellow/25" />
          </div>
          <div className="absolute top-32 right-1/3 animate-pulse">
            <MapPin className="h-5 w-5 text-etaxi-yellow/30" />
          </div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              La plateforme de transport
              <span className="text-etaxi-yellow block animate-slide-in-right">pour entreprises</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in delay-200">
              Simplifiez la gestion de vos transports d'entreprise avec notre solution complète. 
              Dispatching intelligent, suivi en temps réel et optimisation des coûts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-400">
              <Button 
                size="lg" 
                className="bg-etaxi-yellow hover:bg-yellow-500 text-black text-lg px-8 py-3 group"
                onClick={() => navigate('/auth')}
              >
                Essai gratuit
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 group">
                <Play className="mr-2 h-5 w-5" />
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
                <div className="text-3xl md:text-4xl font-bold text-etaxi-yellow mb-2 animate-pulse">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">Nos Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des solutions adaptées à tous vos besoins de transport
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-20">
            {services.map((service, index) => (
              <Card key={index} className="hover-scale animate-slide-up relative overflow-hidden group" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="absolute inset-0 bg-gradient-to-br from-etaxi-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-8">
                  <service.icon className="h-16 w-16 text-etaxi-yellow mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-semibold mb-4">{service.title}</h3>
                  <p className="text-muted-foreground mb-6">{service.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-2xl font-bold text-etaxi-yellow mb-4">
                    {service.price}
                  </div>
                  
                  <Button className="w-full bg-etaxi-yellow hover:bg-yellow-500 text-black">
                    En savoir plus
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="hover-scale cursor-pointer animate-slide-up group" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <feature.icon className="h-12 w-12 text-etaxi-yellow mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">Tarification Simple et Transparente</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choisissez le plan qui correspond à vos besoins. Pas de frais cachés, pas d'engagement.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`hover-scale animate-slide-up relative ${
                  plan.highlighted 
                    ? 'border-etaxi-yellow border-2 shadow-xl scale-105' 
                    : 'border-border'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-etaxi-yellow text-black px-4 py-1 rounded-full text-sm font-medium">
                      Populaire
                    </span>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className={`w-full ${
                      plan.highlighted 
                        ? 'bg-etaxi-yellow hover:bg-yellow-500 text-black' 
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {plan.name === 'Enterprise' ? 'Nous contacter' : 'Commencer'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">Ce que disent nos clients</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez pourquoi plus de 500 entreprises nous font confiance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover-scale animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-etaxi-yellow mb-4" />
                  <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-etaxi-yellow rounded-full flex items-center justify-center text-black font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.position}</div>
                      <div className="flex items-center space-x-1 mt-1">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-etaxi-yellow text-etaxi-yellow" />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-10 bg-card ">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-right">
              <h2 className="text-4xl font-bold mb-6">À propos d'E-Taxi</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Depuis plus de 10 ans, nous accompagnons les entreprises dans l'optimisation 
                de leurs transports. Notre plateforme combine intelligence artificielle et 
                expertise métier pour vous offrir la meilleure solution du marché.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <Target className="h-6 w-6 text-etaxi-yellow" />
                  <span>Leader  tunisian du transport d'entreprise</span>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-6 w-6 text-etaxi-yellow" />
                  <span>Réduction moyenne de 30% des coûts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-etaxi-yellow" />
                  <span>Certifié ISO 27001 et RGPD</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="h-6 w-6 text-etaxi-yellow" />
                  <span>Présent dans 50+ villes en France</span>
                </div>
              </div>
              <Button className="bg-etaxi-yellow hover:bg-yellow-500 text-black">
                En savoir plus sur nous
              </Button>
            </div>
            <div className="animate-slide-in-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-etaxi-yellow/10 p-6 rounded-lg animate-float">
                    <Award className="h-8 w-8 text-etaxi-yellow mb-2" />
                    <div className="text-2xl font-bold">10+</div>
                    <div className="text-sm text-muted-foreground">Années d'expérience</div>
                  </div>
                  <div className="bg-blue-500/10 p-6 rounded-lg animate-float delay-200">
                    <Globe className="h-8 w-8 text-blue-500 mb-2" />
                    <div className="text-2xl font-bold">50+</div>
                    <div className="text-sm text-muted-foreground">Villes couvertes</div>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-green-500/10 p-6 rounded-lg animate-float delay-100">
                    <Users className="h-8 w-8 text-green-500 mb-2" />
                    <div className="text-2xl font-bold">500+</div>
                    <div className="text-sm text-muted-foreground">Entreprises clientes</div>
                  </div>
                  <div className="bg-purple-500/10 p-6 rounded-lg animate-float delay-300">
                    <HeadphonesIcon className="h-8 w-8 text-purple-500 mb-2" />
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-sm text-muted-foreground">Support client</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">Contactez-nous</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Nos experts sont là pour répondre à vos questions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="hover-scale animate-slide-up text-center">
              <CardContent className="p-6">
                <Phone className="h-12 w-12 text-etaxi-yellow mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Téléphone</h3>
                <p className="text-muted-foreground">+33 1 23 45 67 89</p>
              </CardContent>
            </Card>

            <Card className="hover-scale animate-slide-up text-center" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-6">
                <Mail className="h-12 w-12 text-etaxi-yellow mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Email</h3>
                <p className="text-muted-foreground">contact@etaxi.fr</p>
              </CardContent>
            </Card>

            <Card className="hover-scale animate-slide-up text-center" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-6">
                <MapPin className="h-12 w-12 text-etaxi-yellow mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Adresse</h3>
                <p className="text-muted-foreground">123 Avenue des Champs-Élysées<br />75008 Paris</p>
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
              className="bg-black hover:bg-gray-800 text-white text-lg px-8 py-3 group"
              onClick={() => navigate('/auth')}
            >
              Commencer maintenant
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
                <li><a href="#" className="hover:text-etaxi-yellow transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-etaxi-yellow transition-colors">Tarification</a></li>
                <li><a href="#" className="hover:text-etaxi-yellow transition-colors">API</a></li>
                <li><a href="#" className="hover:text-etaxi-yellow transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#about" className="hover:text-etaxi-yellow transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-etaxi-yellow transition-colors">Carrières</a></li>
                <li><a href="#" className="hover:text-etaxi-yellow transition-colors">Presse</a></li>
                <li><a href="#" className="hover:text-etaxi-yellow transition-colors">Partenaires</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-etaxi-yellow transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-etaxi-yellow transition-colors">Conditions</a></li>
                <li><a href="#" className="hover:text-etaxi-yellow transition-colors">Cookies</a></li>
                <li><a href="#" className="hover:text-etaxi-yellow transition-colors">RGPD</a></li>
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
