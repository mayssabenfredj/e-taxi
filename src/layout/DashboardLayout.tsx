import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
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
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';

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

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, path: '/dashboard' },
    { id: 'company', name: t('company'), icon: Building2, path: '/company' },
    { id: 'subsidiaries', name: 'Filiales', icon: Home, path: '/subsidiaries' },
    { id: 'employees', name: t('employees'), icon: Users, path: '/employees' },
    { id: 'transport', name: t('transportRequests'), icon: Car, path: '/transport' },
    /*{ id: 'taxis', name: 'Gestion Taxis', icon: Car, path: '/taxis' },
    { id: 'dispatch', name: 'Dispatching', icon: Navigation, path: '/dispatch' },
    { id: 'claims', name: 'Claims', icon: Navigation, path: '/claims' },
    { id: 'assign-taxi', name: 'Assign Taxi', icon: Navigation, path: '/assign-taxi' },*/
  ];

  const getActivePage = (path: string) => {
    if (path.startsWith('/dashboard')) return 'dashboard';
    if (path.startsWith('/company')) return 'company';
    if (path.startsWith('/subsidiaries')) return 'subsidiaries';
    if (path.startsWith('/employees')) return 'employees';
    if (path.startsWith('/transport')) return 'transport';
    if (path.startsWith('/taxis')) return 'taxis';
    if (path.startsWith('/dispatch')) return 'dispatch';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/claims')) return 'claims';
    if (path.startsWith('/assign-taxi')) return 'assign-taxi';
    return 'dashboard';
  };

  const activePage = getActivePage(location.pathname);

  const navigateTo = (path: string, id: string) => {
    navigate(path);
    onPageChange(id);
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
        {navigation.map((item) => (
          <Button
            key={item.id}
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
        ))}
      </nav>

      {(!isCollapsed || isMobile) && (
        <div className="px-4 mt-auto">
          <div className="border-t pt-4">
            <div className="text-sm text-muted-foreground mb-2">
              {user?.companyName}
            </div>
            <div className="text-xs text-muted-foreground">
              {user?.email}
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
          <Sidebar isMobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className={cn(
        "lg:flex lg:flex-col lg:flex-1 transition-all duration-300",
        isCollapsed ? "lg:pl-16" : "lg:pl-64"
      )}>
        {/* Top Header */}
        <header className="bg-card border-b px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>

            <h1 className="text-2xl font-semibold text-foreground">
              {navigation.find(item => item.id === activePage)?.name || (
                activePage === 'profile' ? 'Profil' : t('dashboard')
              )}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Globe className="h-4 w-4 mr-2" />
                  {language.toUpperCase()}
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
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  {user?.fullName || user?.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}