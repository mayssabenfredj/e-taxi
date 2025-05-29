
import React, { useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { CompanyPage } from './CompanyPage';
import { EmployeesPage } from './EmployeesPage';
import { TransportPage } from './TransportPage';

export function Dashboard() {
  const [currentPage, setCurrentPage] = useState('company');

  const renderPage = () => {
    switch (currentPage) {
      case 'company':
        return <CompanyPage />;
      case 'employees':
        return <EmployeesPage />;
      case 'transport':
        return <TransportPage />;
      default:
        return <CompanyPage />;
    }
  };

  return (
    <DashboardLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </DashboardLayout>
  );
}
