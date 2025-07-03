import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Car, Star, UserX, UserPlus } from 'lucide-react';
import { PreferredTaxisPage } from '../pages/PreferredTaxisPage';
import { BlacklistedTaxisPage } from '../pages/BlacklistedTaxisPage';

import { cn } from '@/shareds/lib/utils';
import { TaxiListPage } from '../pages/TaxiListPage';
import { TaxiJoinRequestsPage } from '../pages/TaxiJoinRequestsPage';
import { TaxiDetailsPage } from '../pages/TaxiDetailPage';

const navigation = [
  { name: 'Liste des taxis', href: '/taxis', icon: Car },
  { name: 'Taxis préférés', href: '/taxis/preferred', icon: Star },
  { name: 'Taxis blacklistés', href: '/taxis/blacklisted', icon: UserX },
  { name: 'Demandes d\'adhésion', href: '/taxis/join-requests', icon: UserPlus },
  
];

export function TaxisLayout() {
  const location = useLocation();

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center space-x-2">
        <Car className="h-6 w-6 text-etaxi-yellow" />
        <h2 className="text-2xl font-bold">Gestion des Taxis</h2>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm",
                  isActive
                    ? "border-etaxi-yellow text-etaxi-yellow"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <Routes>
        <Route index element={<TaxiListPage />} />
        <Route path="preferred" element={<PreferredTaxisPage />} />
        <Route path="blacklisted" element={<BlacklistedTaxisPage />} />
        <Route path="join-requests" element={<TaxiJoinRequestsPage />} />
        <Route path=":id" element={<TaxiDetailsPage />} />
      </Routes>
    </div>
  );
}
