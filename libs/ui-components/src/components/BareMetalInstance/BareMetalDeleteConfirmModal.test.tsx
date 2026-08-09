import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { BareMetalInstance } from '@osac/types';

import BareMetalDeleteConfirmModal from './BareMetalDeleteConfirmModal';
import * as bareMetalApi from '../../api/v1/baremetal-instance';

vi.mock('../../api/v1/baremetal-instance', async (importOriginal) => {
  const actual = await importOriginal<typeof bareMetalApi>();
  return {
    ...actual,
    useDeleteBareMetalInstance: vi.fn(),
  };
});

const makeInstance = (overrides?: Partial<BareMetalInstance>): BareMetalInstance =>
  ({
    id: 'bm-123',
    metadata: { name: 'test-instance' },
    ...overrides,
  }) as BareMetalInstance;

describe('BareMetalDeleteConfirmModal', () => {
  const mutateAsync = vi.fn();
  const reset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(bareMetalApi.useDeleteBareMetalInstance).mockReturnValue({
      mutateAsync,
      reset,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof bareMetalApi.useDeleteBareMetalInstance>);
  });

  it('calls onSuccess after successful delete', async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValue(undefined);
    const onSuccess = vi.fn();

    render(
      <BareMetalDeleteConfirmModal
        instance={makeInstance()}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Delete/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith('bm-123');
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('shows error and does not call onSuccess when delete fails', async () => {
    const user = userEvent.setup();
    mutateAsync.mockRejectedValue(new Error('server error'));
    vi.mocked(bareMetalApi.useDeleteBareMetalInstance).mockReturnValue({
      mutateAsync,
      reset,
      isPending: false,
      error: new Error('server error'),
    } as unknown as ReturnType<typeof bareMetalApi.useDeleteBareMetalInstance>);
    const onSuccess = vi.fn();

    render(
      <BareMetalDeleteConfirmModal
        instance={makeInstance()}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Delete/i }));

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <BareMetalDeleteConfirmModal
        instance={makeInstance()}
        onClose={onClose}
        onSuccess={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders the delete confirmation body text', () => {
    render(
      <BareMetalDeleteConfirmModal
        instance={makeInstance()}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    expect(screen.getByText(/permanently deletes the bare metal instance/i)).toBeInTheDocument();
  });
});
