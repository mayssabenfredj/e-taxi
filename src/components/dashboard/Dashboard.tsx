
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { CompanyPage } from './CompanyPage';
import { EmployeesPage } from './EmployeesPage';
import { TransportPage } from './TransportPage';
import { ProfilePage } from './ProfilePage';
import { SubsidiariesPage } from './SubsidiariesPage';
import { EmployeeDetails } from './EmployeeDetails';
import { CreateTransportRequest } from './CreateTransportRequest';

export function Dashboard() {
  const [currentPage, setCurrentPage] = useState('company');

  // Cette fonction est utilisée pour les composants dans le layout
  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <DashboardLayout currentPage={currentPage} onPageChange={handlePageChange}>
      <Routes>
        <Route path="/" element={<Navigate to="/company" replace />} />
        <Route path="/company" element={<CompanyPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/employees/:id" element={<EmployeeDetails />} />
        <Route path="/transport" element={<TransportPage />} />
        <Route path="/transport/create" element={<CreateTransportRequest />} />
        <Route path="/subsidiaries" element={<SubsidiariesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </DashboardLayout>
  );
}
