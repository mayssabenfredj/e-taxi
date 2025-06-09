import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardHome } from './DashboardHome';
import { CompanyPage } from '../../pages/dashboard/CompanyPage';
import { EmployeesPage } from '../../pages/dashboard/EmployeesPage';
import { IndividualTransportPage } from '../../pages/dashboard/transport/IndividualTransportPage';
import { GroupTransportPage } from '../../pages/dashboard/transport/GroupTransportPage';
import { TransportHistoryPage } from '../../pages/dashboard/transport/TransportHistoryPage';
import { TaxiManagementPage } from '../../pages/dashboard/taxi/TaxiManagementPage';
import { DispatchPage } from '../../pages/dashboard/DispatchPage';
import { ProfilePage } from '../../pages/dashboard/ProfilePage';
import { SubsidiariesPage } from '../../pages/dashboard/SubsidiariesPage';
import { EmployeeDetails } from './EmployeeDetails';
import { CreateTransportRequest } from './CreateTransportRequest';
import { NotificationsPage } from '../../pages/dashboard/NotificationsPage';
import { ClaimsPage } from '../../pages/dashboard/ClaimsPage';
import { TaxiAssignmentPage } from '../../pages/dashboard/taxi/TaxiAssignmentPage';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { EmployeeRequestsPage } from '@/pages/dashboard/EmployeeRequestsPage';
import { EmployeesLayout } from '@/layout/EmployeesLayout';
import { DraftRequestsPage } from '@/pages/dashboard/transport/DraftRequestsPage';
import { CreateGroupTransportRequest } from './CreateGroupTransportRequest';
import { GroupTransportDispatchPage } from '@/pages/dashboard/transport/GroupTransportDispatchPage';
import { TransportRequestDetails } from './TransportRequestDetails';

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
       <Route path="/employees" element={<EmployeesLayout />}>
          <Route index element={<Navigate to="list" replace />} />
          <Route path="list" element={<EmployeesPage />} />
          <Route path="requests" element={<EmployeeRequestsPage />} />
        </Route>
        <Route path="/employees/:id" element={<EmployeeDetails />} />
        <Route path="/transport/individual" element={<IndividualTransportPage />} />
        <Route path="/transport/group" element={<GroupTransportPage />} />
        <Route path="/transport/history" element={<TransportHistoryPage />} />
        <Route path="/transport/:id" element={<TransportRequestDetails />} />
        <Route path="transport/drafts" element={<DraftRequestsPage />} />
        <Route path="transport/create-group" element={<CreateGroupTransportRequest />} />
        <Route path="/transport/:id/group-dispatch" element={<GroupTransportDispatchPage />} />
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