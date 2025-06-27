import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shareds/contexts/AuthContext';
import { useTheme } from '@/shareds/contexts/ThemeContext';
import { useLanguage } from '@/shareds/contexts/LanguageContext';
import { Button } from '@/shareds/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shareds/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/shareds/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shareds/components/ui/collapsible';
import {
  Building2,
  Users,
  Car,
  Settings,
  LogOut,
  Menu,
  Moon,
  Sun,
  Globe,
  User,
  Home,
  Navigation,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Bell,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/shareds/lib/utils';
import { Logo } from '@/shareds/Logo';
import { toast } from 'sonner';


interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function DashboardLayout({ children, currentPage, onPageChange }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isTransportOpen, setIsTransportOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  // Initialize transport submenu based on current path
  useEffect(() => {
    if (location.pathname.startsWith('/transport')) {
      setIsTransportOpen(true);
      setOpenSubmenus(prev => ({ ...prev, transport: true }));
    }
  }, [location.pathname]);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, path: '/dashboard' },
    { id: 'company', name: t('company'), icon: Building2, path: '/company' },
    { id: 'companys', name: t('companys'), icon: Building2, path: '/companys' },
    { id: 'subsidiaries', name: 'Sous Organisation', icon: Home, path: '/subsidiaries' },
    { id: 'employees', name: t('employees'), icon: Users, path: '/employees' },
    { id: 'taxis', name: 'Gestion des taxis', icon: Car, path: '/taxis' },
    { id: 'assign-taxi', name: 'Assignation taxi', icon: Navigation, path: '/assign-taxi' },
    { 
      id: 'transport', 
      name: t('transportRequests'), 
      icon: Car, 
      path: '/transport',
      hasSubmenu: true,
      submenu: [
        { id: 'transport-individual', name: 'Demandes individuelles', path: '/transport/individual' },
        { id: 'transport-group', name: 'Demandes de groupe', path: '/transport/group' }
      ]
    },
  ];

  // Détermination des rôles
  const userRoles = user?.roles?.map(r => typeof r === 'string' ? r : r.role?.name) || [];
  const isAdmin = userRoles.includes('ADMIN');
  const isAdminEntreprise = userRoles.includes('ADMIN_ENTREPRISE');
  const isAdminFiliale = userRoles.includes('ADMIN_FILIALE');

  // Navigation filtrée selon le rôle
  let filteredNavigation = navigation;
  if (isAdmin) {
    // Pour les admins, afficher dashboard, companys, taxis et assign-taxi
    filteredNavigation = navigation.filter(item => 
      ['dashboard', 'companys', 'taxis', 'assign-taxi'].includes(item.id)
    );
  } else if (isAdminEntreprise || isAdminFiliale) {
    // Pour les autres rôles, exclure companys mais inclure dashboard
    filteredNavigation = navigation.filter(item => item.id !== 'companys');
  }

  const getActivePage = (path: string) => {
    if (path.startsWith('/dashboard')) return 'dashboard';
    if (path.startsWith('/company')) return 'company';
    if (path.startsWith('/companys')) return 'companys';
    if (path.startsWith('/subsidiaries')) return 'subsidiaries';
    if (path.startsWith('/employees')) return 'employees';
    if (path.startsWith('/taxis')) return 'taxis';
    if (path.startsWith('/assign-taxi')) return 'assign-taxi';
    if (path.startsWith('/transport')) return 'transport';
    if (path.startsWith('/profile')) return 'profile';
    return 'dashboard';
  };

  const activePage = getActivePage(location.pathname);

  const navigateTo = (path: string, id: string) => {
    navigate(path);
    onPageChange(id);
  };

  const toggleSubmenu = (id: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Déconnexion réussie');
      
      navigate('/'); // Redirect to root page
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la déconnexion');
    }
  };

  const Sidebar = ({ isMobile = false }) => (
    <div className={cn("flex flex-col h-full", isMobile ? "p-4" : "")}>
      <div className={cn("flex items-center mb-8 px-4", isCollapsed && !isMobile ? "justify-center" : "space-x-2")}>
        {isCollapsed && !isMobile ? (
          <div className="w-8 h-8 bg-etaxi-yellow rounded-full flex items-center justify-center">
            <Car className="h-4 w-4 text-black" />
          </div>
        ) : (
          <Logo />
        )}
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {filteredNavigation.map((item) => (
          <div key={item.id}>
            {item.hasSubmenu ? (
              <Collapsible 
                open={isMobile ? openSubmenus[item.id] : (isCollapsed ? false : isTransportOpen)} 
                onOpenChange={isMobile ? 
                  () => toggleSubmenu(item.id) : 
                  (open) => {
                    if (!isCollapsed) {
                      setIsTransportOpen(open);
                    }
                  }
                }
                className="w-full"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant={activePage === item.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full transition-all duration-200 justify-between",
                      isCollapsed && !isMobile ? "justify-center px-2" : "justify-between",
                      activePage === item.id && "bg-etaxi-yellow/10 text-etaxi-yellow hover:bg-etaxi-yellow/20"
                    )}
                    title={isCollapsed && !isMobile ? item.name : undefined}
                    onClick={() => {
                      if (isCollapsed && !isMobile) {
                        // When sidebar is collapsed, clicking on a menu with submenu should open a dropdown
                        setIsTransportOpen(!isTransportOpen);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <item.icon className="h-5 w-5" />
                      {(!isCollapsed || isMobile) && <span>{item.name}</span>}
                    </div>
                    {(!isCollapsed || isMobile) && (
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        (isMobile ? openSubmenus[item.id] : isTransportOpen) && "rotate-180"
                      )} />
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                {/* Dropdown for collapsed sidebar */}
                {isCollapsed && !isMobile && isTransportOpen && (
                  <div className="absolute left-16 mt-0 w-48 z-50 bg-popover rounded-md shadow-md border border-border overflow-hidden">
                    {item.submenu?.map((subItem) => (
                      <Button
                        key={subItem.id}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-sm px-4 py-2 rounded-none",
                          location.pathname === subItem.path && "bg-etaxi-yellow/10 text-etaxi-yellow"
                        )}
                        onClick={() => {
                          navigateTo(subItem.path, subItem.id);
                          setIsTransportOpen(false);
                        }}
                      >
                        {subItem.name}
                      </Button>
                    ))}
                  </div>
                )}
                
                {/* Regular submenu for expanded sidebar */}
                {(!isCollapsed || isMobile) && (
                  <CollapsibleContent className="space-y-1 mt-1">
                    {item.submenu?.map((subItem) => (
                      <Button
                        key={subItem.id}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start ml-6 text-sm",
                          location.pathname === subItem.path && "bg-etaxi-yellow/10 text-etaxi-yellow"
                        )}
                        onClick={() => {
                          navigateTo(subItem.path, subItem.id);
                          if (isMobile) setIsMobileMenuOpen(false);
                        }}
                      >
                        {subItem.name}
                      </Button>
                    ))}
                  </CollapsibleContent>
                )}
              </Collapsible>
            ) : (
              <Button
                variant={activePage === item.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full transition-all duration-200",
                  isCollapsed && !isMobile ? "justify-center px-2" : "justify-start space-x-2",
                  activePage === item.id && "bg-etaxi-yellow/10 text-etaxi-yellow hover:bg-etaxi-yellow/20"
                )}
                onClick={() => {
                  navigateTo(item.path, item.id);
                  if (isMobile) setIsMobileMenuOpen(false);
                }}
                title={isCollapsed && !isMobile ? item.name : undefined}
              >
                <item.icon className="h-5 w-5" />
                {(!isCollapsed || isMobile) && <span>{item.name}</span>}
              </Button>
            )}
          </div>
        ))}
      </nav>

      {(!isCollapsed || isMobile) && (
        <div className="px-4 mt-auto">
          <div className="border-t pt-4">
            <div className="text-sm text-muted-foreground mb-2">
              {user?.firstName}
            </div>
            <div className="text-xs text-muted-foreground">
              {user?.fullName}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300",
        isCollapsed ? "lg:w-16" : "lg:w-64"
      )}>
        <div className="flex flex-col flex-grow border-r bg-card pt-5 pb-4 overflow-y-auto">
          <Sidebar />
          
          {/* Collapse Button */}
          <div className="px-4 pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn("w-full", isCollapsed ? "justify-center" : "justify-start")}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              {!isCollapsed && <span className="ml-2">Réduire</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
          <Sidebar isMobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className={cn(
        "lg:flex lg:flex-col lg:flex-1 transition-all duration-300",
        isCollapsed ? "lg:pl-16" : "lg:pl-64"
      )}>
        {/* Top Header - Responsive */}
        <header className="bg-card border-b px-4 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>

            <h1 className="text-xl md:text-2xl font-semibold text-foreground truncate">
              {navigation.find(item => item.id === activePage)?.name || (
                activePage === 'profile' ? 'Profil' : t('dashboard')
              )}
            </h1>
          </div>

          <div className="flex items-center space-x-1 md:space-x-2">
            {/* Language Selector - Hidden on small screens */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Globe className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">{language.toUpperCase()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLanguage('fr')}>
                  Français
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            {/* Notification */}
            <Button variant="outline" size="sm" onClick={() => navigate('/notifications')}>
              <Bell className="h-4 w-4" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="max-w-[200px]">
                  <User className="h-4 w-4 mr-1 md:mr-2 flex-shrink-0" />
                  <span className="truncate hidden sm:inline">
                    {user?.fullName || user?.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* Mobile-only language selector */}
                <div className="sm:hidden">
                  <DropdownMenuItem onClick={() => setLanguage('fr')}>
                    <Globe className="mr-2 h-4 w-4" />
                    Français
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('en')}>
                    <Globe className="mr-2 h-4 w-4" />
                    English
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </div>
                
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}