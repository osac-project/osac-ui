import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import BareMetalPowerConfirmModal from './BareMetalPowerConfirmModal';
import type { BareMetalPowerAction } from '../../api/v1/baremetal-instance';

const actionCopy = {
  start: {
    title: 'Start bare metal instance?',
    warning:
      'Starting this bare metal instance will make it available again. Services may be unavailable until startup completes.',
  },
  stop: {
    title: 'Stop bare metal instance?',
    warning:
      'Stopping this bare metal instance will interrupt running workloads and cause service downtime.',
  },
  restart: {
    title: 'Restart bare metal instance?',
    warning:
      'Restarting this bare metal instance will interrupt running workloads and cause temporary downtime.',
  },
} satisfies Record<BareMetalPowerAction, { title: string; warning: string }>;

describe('BareMetalPowerConfirmModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(['start', 'stop', 'restart'] as BareMetalPowerAction[])(
    'shows action-specific confirmation text for %s',
    (action) => {
      render(
        <BareMetalPowerConfirmModal
          action={action}
          error={null}
          isPending={false}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
        />,
      );

      expect(screen.getByRole('heading')).toHaveTextContent(actionCopy[action].title);
      expect(screen.getByText(actionCopy[action].warning)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: new RegExp(action, 'i') })).toBeInTheDocument();
    },
  );

  it('closes without confirming when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <BareMetalPowerConfirmModal
        action="stop"
        error={null}
        isPending={false}
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Cancel/i }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('confirms once when the action button is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <BareMetalPowerConfirmModal
        action="restart"
        error={null}
        isPending={false}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole('button', { name: /restart/i }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('disables modal controls and shows loading while the action is pending', () => {
    render(
      <BareMetalPowerConfirmModal
        action="start"
        error={null}
        isPending
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /start/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeDisabled();
  });

  it('shows the mutation error', () => {
    render(
      <BareMetalPowerConfirmModal
        action="stop"
        error={new Error('permission denied')}
        isPending={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByText('Failed to stop bare metal instance')).toBeInTheDocument();
    expect(screen.getByText('permission denied')).toBeInTheDocument();
  });
});
