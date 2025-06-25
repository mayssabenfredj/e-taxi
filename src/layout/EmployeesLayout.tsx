import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Users, UserPlus } from 'lucide-react';

export function EmployeesLayout() {
  return (
    <div className="space-y-6">
     
      
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <NavLink
            to="/employees/list"
            className={({ isActive }) =>
              `whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                isActive
                  ? 'border-etaxi-yellow text-etaxi-yellow'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }
          >
            <Users className="h-4 w-4" />
            <span>Liste des Collaborateurs</span>
          </NavLink>
          
          <NavLink
            to="/employees/requests"
            className={({ isActive }) =>
              `whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                isActive
                  ? 'border-etaxi-yellow text-etaxi-yellow'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }
          >
            <UserPlus className="h-4 w-4" />
            <span>Demandes d'Collaborateurs</span>
          </NavLink>
        </nav>
      </div>
      
      <Outlet />
    </div>
  );
}