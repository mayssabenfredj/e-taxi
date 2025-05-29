
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarTrigger,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Car, 
  Navigation, 
  Settings, 
  LogOut,
  Bell,
  User,
  Building
} from 'lucide-react';
import { Logo } from '../Logo';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function DashboardLayout({ children, currentPage, onPageChange }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationCount] = useState(3);

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'company', label: 'Entreprise', icon: Building2, path: '/company' },
    { id: 'subsidiaries', label: 'Filiales', icon: Building, path: '/subsidiaries' },
    { id: 'employees', label: 'Employés', icon: Users, path: '/employees' },
    { id: 'transport', label: 'Transports', icon: Car, path: '/transport' },
    { id: 'taxis', label: 'Taxis', icon: Car, path: '/taxis' },
    { id: 'dispatch', label: 'Dispatching', icon: Navigation, path: '/dispatch' },
  ];

  const handleNavigation = (path: string, id: string) => {
    navigate(path);
    onPageChange(id);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b p-4">
            <Logo />
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => handleNavigation(item.path, item.id)}
                        className={`w-full justify-start ${
                          isActive(item.path) ? 'bg-etaxi-yellow/20 text-etaxi-yellow' : ''
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/notifications')}>
                  <div className="relative">
                    <Bell className="h-4 w-4" />
                    {notificationCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs"
                      >
                        {notificationCount}
                      </Badge>
                    )}
                  </div>
                  <span>Notifications</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4" />
                  <span>Profil</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/settings')}>
                  <Settings className="h-4 w-4" />
                  <span>Paramètres</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="border-b bg-background p-4 flex items-center justify-between">
            <SidebarTrigger />
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/notifications')}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
                  >
                    {notificationCount}
                  </Badge>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
                <User className="h-4 w-4" />
              </Button>
            </div>
          </header>
          
          <div className="flex-1 p-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
