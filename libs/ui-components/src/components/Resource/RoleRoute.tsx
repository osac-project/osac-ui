import { useLocation } from 'react-router-dom';

import UnauthorizedErrorState from './UnauthorizedErrorState';
import { useSession } from '../../hooks/use-session';
import type { UserRole } from '../../shellTypes';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

const RoleRoute = ({ allowedRoles, children }: React.PropsWithChildren<RoleRouteProps>) => {
  const { role } = useSession();
  const { pathname } = useLocation();

  if (!allowedRoles.includes(role)) {
    return <UnauthorizedErrorState />;
  }

  return <ErrorBoundary key={pathname}>{children}</ErrorBoundary>;
};

export default RoleRoute;
