import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHome } from './DashboardHome';
import { CompanyPage } from '../../pages/dashboard/company/CompanyPage';
import { EmployeesPage } from '../../pages/dashboard/employee/EmployeesPage';
import { IndividualTransportPage } from '../../pages/dashboard/transport/individualTransport/IndividualTransportPage';
import { GroupTransportPage } from '../../pages/dashboard/transport/groupTransport/GroupTransportPage';
import { TaxiManagementPage } from '../../pages/dashboard/taxi/TaxiManagementPage';
import { DispatchPage } from '../../pages/dashboard/DispatchPage';
import { ProfilePage } from '../../pages/dashboard/ProfilePage';
import { CreateTransportRequest } from './CreateTransportRequest';
import { NotificationsPage } from '../../pages/dashboard/NotificationsPage';
import { ClaimsPage } from '../../pages/dashboard/ClaimsPage';
import { TaxiAssignmentPage } from '../../pages/dashboard/taxi/TaxiAssignmentPage';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { EmployeeRequestsPage } from '@/pages/dashboard/employee/EmployeeRequestsPage';
import { EmployeesLayout } from '@/layout/EmployeesLayout';
import { DraftRequestsPage } from '@/pages/dashboard/transport/DraftRequestsPage';
import { GroupTransportDispatchPage } from '@/pages/dashboard/transport/groupTransport/GroupTransportDispatchPage';
import { TransportRequestDetails } from './TransportRequestDetails';
import { EditTransportRequest } from './EditTransportRequest';
import { SubsidariesPage } from '@/pages/dashboard/company/SubsidiariesPage';
import { EmployeeDetails } from '@/pages/dashboard/employee/EmployeeDetails';
import { CreateGroupTransportRequest } from '@/pages/dashboard/transport/groupTransport/CreateGroupTransportRequest';

export function Dashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-etaxi-yellow"></div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

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
        <Route path="/transport/:id" element={<TransportRequestDetails />} />
        <Route path="/transport/:id/edit" element={<EditTransportRequest />} />
        <Route path="/transport/drafts" element={<DraftRequestsPage />} />
        <Route path="/transport/create-group" element={<CreateGroupTransportRequest />} />
        <Route path="/transport/:id/group-dispatch" element={<GroupTransportDispatchPage />} />
        <Route path="/transport/create" element={<CreateTransportRequest />} />
        <Route path="/taxis" element={<TaxiManagementPage />} />
        <Route path="/dispatch" element={<DispatchPage />} />
        <Route path="/subsidiaries" element={<SubsidariesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/claims" element={<ClaimsPage />} />
        <Route path="/assign-taxi" element={<TaxiAssignmentPage />} />
        
        {/* Catch all route - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}