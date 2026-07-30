import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import RoleRoute from './RoleRoute';
import { SessionProvider } from '../../hooks/use-session';
import type { UserRole } from '../../shellTypes';

const noop = vi.fn();

const renderWithSession = (role: UserRole, allowedRoles: UserRole[]) =>
  render(
    <MemoryRouter>
      <SessionProvider role={role} username="test-user" tenantId="t-1" logout={noop}>
        <RoleRoute allowedRoles={allowedRoles}>
          <p>Protected content</p>
        </RoleRoute>
      </SessionProvider>
    </MemoryRouter>,
  );

describe('RoleRoute', () => {
  it('renders children when the session role is allowed', () => {
    renderWithSession('tenant-admin', ['tenant-admin', 'admin']);

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(screen.queryByText('Unauthorized')).not.toBeInTheDocument();
  });

  it('renders UnauthorizedErrorState when the session role is not allowed', () => {
    renderWithSession('tenant-user', ['admin']);

    expect(screen.getByText('Unauthorized')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });
});
