
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { DashboardHome } from './DashboardHome';
import { CompanyPage } from './CompanyPage';
import { EmployeesPage } from './EmployeesPage';
import { TransportPage } from './TransportPage';
import { TaxiManagementPage } from './TaxiManagementPage';
import { DispatchPage } from './DispatchPage';
import { ProfilePage } from './ProfilePage';
import { SubsidiariesPage } from './SubsidiariesPage';
import { EmployeeDetails } from './EmployeeDetails';
import { CreateTransportRequest } from './CreateTransportRequest';
import { NotificationsPage } from './NotificationsPage';
import { ClaimsPage } from './ClaimsPage';
import { TaxiAssignmentPage } from './TaxiAssignmentPage';

export function Dashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <DashboardLayout currentPage={currentPage} onPageChange={handlePageChange}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/company" element={<CompanyPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/employees/:id" element={<EmployeeDetails />} />
        <Route path="/transport" element={<TransportPage />} />
        <Route path="/transport/create" element={<CreateTransportRequest />} />
        <Route path="/taxis" element={<TaxiManagementPage />} />
        <Route path="/dispatch" element={<DispatchPage />} />
        <Route path="/subsidiaries" element={<SubsidiariesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/claims" element={<ClaimsPage />} />
        <Route path="/assign-taxi" element={<TaxiAssignmentPage />} />
      </Routes>
    </DashboardLayout>
  );
}
