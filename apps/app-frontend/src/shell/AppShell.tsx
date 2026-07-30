import { Navigate, Route, Routes } from 'react-router-dom';
import { Page } from '@patternfly/react-core';

import RoleRoute from '@osac/ui-components/components/Resource/RoleRoute';
import { VmDetailsPage } from '@osac/ui-components/components/vm/VmDetailsPage';
import { useSession } from '@osac/ui-components/hooks/use-session';
import { SecurityGroupDetailPage } from '@osac/ui-components/pages/networking/SecurityGroupDetailPage';
import { SecurityGroupsListPage } from '@osac/ui-components/pages/networking/SecurityGroupsListPage';
import { VirtualNetworkDetailPage } from '@osac/ui-components/pages/networking/VirtualNetworkDetailPage';
import { VirtualNetworksListPage } from '@osac/ui-components/pages/networking/VirtualNetworksListPage';
import { BareMetalRoutes } from '@osac/ui-components/pages/tenant/BareMetalRoutes';
import CatalogPage from '@osac/ui-components/pages/tenant/CatalogPage';
import { ClusterRoutes } from '@osac/ui-components/pages/tenant/ClusterRoutes';
import { VmCreatePage } from '@osac/ui-components/pages/tenant/VmCreatePage';
import { VmListPage } from '@osac/ui-components/pages/tenant/VmListPage';

import { ShellMasthead } from './ShellMasthead';
import { defaultRouteForRole } from './shellRoutes';
import { ShellSidebar } from './ShellSidebar';

export const AppShell = () => {
  const { role } = useSession();

  const defaultRoute = defaultRouteForRole(role);

  return (
    <Page masthead={<ShellMasthead />} sidebar={<ShellSidebar />} isManagedSidebar>
      <Routes>
        <Route
          path="/vms"
          element={
            <RoleRoute allowedRoles={['tenant-user', 'tenant-admin', 'admin']}>
              <VmListPage />
            </RoleRoute>
          }
        />
        <Route
          path="/vms/create/:catalogItemId?"
          element={
            <RoleRoute allowedRoles={['tenant-user', 'tenant-admin', 'admin']}>
              <VmCreatePage />
            </RoleRoute>
          }
        />
        <Route
          path="/vms/:id"
          element={
            <RoleRoute allowedRoles={['tenant-user', 'tenant-admin', 'admin']}>
              <VmDetailsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/catalog"
          element={
            <RoleRoute allowedRoles={['tenant-user', 'tenant-admin', 'admin']}>
              <CatalogPage />
            </RoleRoute>
          }
        />
        <Route
          path="/clusters/*"
          element={
            <RoleRoute allowedRoles={['tenant-user', 'tenant-admin', 'admin']}>
              <ClusterRoutes />
            </RoleRoute>
          }
        />
        <Route
          path="/bare-metal/*"
          element={
            <RoleRoute allowedRoles={['tenant-user', 'tenant-admin', 'admin']}>
              <BareMetalRoutes />
            </RoleRoute>
          }
        />
        <Route
          path="/networking/virtual-networks"
          element={
            <RoleRoute allowedRoles={['tenant-user', 'tenant-admin', 'admin']}>
              <VirtualNetworksListPage />
            </RoleRoute>
          }
        />
        <Route
          path="/networking/virtual-networks/:id"
          element={
            <RoleRoute allowedRoles={['tenant-user', 'tenant-admin', 'admin']}>
              <VirtualNetworkDetailPage />
            </RoleRoute>
          }
        />
        <Route
          path="/networking/security-groups"
          element={
            <RoleRoute allowedRoles={['tenant-user', 'tenant-admin', 'admin']}>
              <SecurityGroupsListPage />
            </RoleRoute>
          }
        />
        <Route
          path="/networking/security-groups/:id"
          element={
            <RoleRoute allowedRoles={['tenant-user', 'tenant-admin', 'admin']}>
              <SecurityGroupDetailPage />
            </RoleRoute>
          }
        />
        <Route path="*" element={<Navigate to={defaultRoute} replace />} />
      </Routes>
    </Page>
  );
};
