import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/shareds/contexts/AuthContext';
import { DashboardHome } from './DashboardHome';
import { CompanyPage } from '../../Entreprises/pages/company/CompanyPage';
import { EmployeesPage } from '../../employees/pages/EmployeesPage';
import { IndividualTransportPage } from '../../transports/pages/individualTransport/IndividualTransportPage';
import { GroupTransportPage } from '../../transports/pages/groupTransport/GroupTransportPage';
import { TaxiManagementPage } from '../../taxis/pages/TaxiManagementPage';
import { ProfilePage } from '../../auth/pages/ProfilePage';
import { NotificationsPage } from '../../notifications/pages/NotificationsPage';
import { ClaimsPage } from '../../claims/pages/ClaimsPage';
import { TaxiAssignmentPage } from '../../taxis/pages/TaxiAssignmentPage';
import { DashboardLayout } from '@/features/dashboard/layout/DashboardLayout';
import { EmployeeRequestsPage } from '@/features/employees/pages/EmployeeRequestsPage';
import { EmployeesLayout } from '@/features/employees/layout/EmployeesLayout';
import { DraftRequestsPage } from '@/features/transports/pages/DraftRequestsPage';
import { GroupTransportDispatchPage } from '@/features/transports/pages/groupTransport/GroupTransportDispatchPage';
import { TransportRequestDetails } from '../../transports/pages/TransportRequestDetails';
import { EditTransportRequest } from '../../transports/pages/EditTransportRequest';
import { SubsidariesPage } from '@/features/Entreprises/pages/company/SubsidiariesPage';
import { EmployeeDetails } from '@/features/employees/pages/EmployeeDetails';
import { CreateGroupTransportRequest } from '@/features/transports/pages/groupTransport/CreateGroupTransportRequest';
import { EnterprisesPage } from '@/features/Entreprises/pages/EntreprisesPage';
import { EnterpriseDetails } from '@/features/Entreprises/pages/EnterpriseDetails';
import { CreateEnterpriseForm } from '@/features/Entreprises/pages/CreateEntrpriseForm';
import { RoleManagementPage } from '@/features/employees/pages/RolePage';
import { GlobalEmployeesPage } from '@/features/employees/pages/GlobalEmployeesPage';
import { ADMIN_ROLE } from '@/shareds/lib/const';

export function Dashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.roles?.some(r => r.role?.name === ADMIN_ROLE);

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
          {isAdmin ? (
            <>
              <Route path="roles" element={<RoleManagementPage />} />
              <Route path="management" element={<GlobalEmployeesPage />} />
              <Route index element={<Navigate to="management" replace />} />
            </>
          ) : (
            <>
              <Route path="list" element={<EmployeesPage />} />
              <Route path="requests" element={<EmployeeRequestsPage />} />
              <Route index element={<Navigate to="list" replace />} />
            </>
          )}
        </Route>
        <Route path="/employees/:id" element={<EmployeeDetails />} />
        <Route path="/transport/individual" element={<IndividualTransportPage />} />
        <Route path="/transport/group" element={<GroupTransportPage />} />
        <Route path="/transport/:id" element={<TransportRequestDetails />} />
        <Route path="/transport/:id/edit" element={<EditTransportRequest />} />
        <Route path="/transport/drafts" element={<DraftRequestsPage />} />
        <Route path="/transport/create-transport" element={<CreateGroupTransportRequest />} />
        <Route path="/transport/:id/group-dispatch" element={<GroupTransportDispatchPage />} />
        <Route path="/taxis/*" element={<TaxiManagementPage />} />
        <Route path="/subsidiaries" element={<SubsidariesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/claims" element={<ClaimsPage />} />
        <Route path="/assign-taxi" element={<TaxiAssignmentPage />} />
        {/* Admin Route */}
        <Route path="/companys" element={<EnterprisesPage />} />
        <Route path="/companys/:id" element={<EnterpriseDetails />} />
        <Route path="/companys/create" element={<CreateEnterpriseForm mode="create" />} />
        <Route path="/companys/create/:id" element={<CreateEnterpriseForm mode="update" />} />




        
        {/* Catch all route - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}