import { MemoryRouter } from 'react-router-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type BareMetalInstance, BareMetalInstanceState } from '@osac/types';

import BareMetalActionButtons from './BareMetalActionButtons';
import * as bareMetalApi from '../../api/v1/baremetal-instance';

vi.mock('../../api/v1/baremetal-instance', async (importOriginal) => {
  const actual = await importOriginal<typeof bareMetalApi>();
  return {
    ...actual,
    useDeleteBareMetalInstance: vi.fn(),
    usePatchBareMetalInstance: vi.fn(),
  };
});

const stoppedInstance = {
  id: 'bm-1',
  spec: { restartTrigger: 4n },
  status: { state: BareMetalInstanceState.STOPPED },
} as unknown as BareMetalInstance;

const runningInstance = {
  id: 'bm-1',
  spec: { restartTrigger: 4n },
  status: { state: BareMetalInstanceState.RUNNING },
} as unknown as BareMetalInstance;

describe('BareMetalActionButtons', () => {
  const patchMutate = vi.fn();
  const patchReset = vi.fn();
  const deleteMutate = vi.fn();
  const deleteReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(bareMetalApi.usePatchBareMetalInstance).mockReturnValue({
      mutate: patchMutate,
      reset: patchReset,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof bareMetalApi.usePatchBareMetalInstance>);
    vi.mocked(bareMetalApi.useDeleteBareMetalInstance).mockReturnValue({
      mutate: deleteMutate,
      reset: deleteReset,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof bareMetalApi.useDeleteBareMetalInstance>);
  });

  const renderButtons = (instance: BareMetalInstance) =>
    render(
      <MemoryRouter>
        <BareMetalActionButtons instance={instance} />
      </MemoryRouter>,
    );

  it('opens confirmation and does not mutate when Start is canceled', async () => {
    const user = userEvent.setup();
    renderButtons(stoppedInstance);

    await user.click(screen.getByRole('button', { name: 'Start' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: /Cancel/i }));

    expect(patchMutate).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it.each([
    {
      action: 'Start',
      instance: stoppedInstance,
      input: { id: 'bm-1', action: 'start' },
    },
    {
      action: 'Stop',
      instance: runningInstance,
      input: { id: 'bm-1', action: 'stop' },
    },
    {
      action: 'Restart',
      instance: runningInstance,
      input: { id: 'bm-1', action: 'restart', currentTrigger: 4n },
    },
  ])(
    'confirms $action through the existing action exactly once',
    async ({ action, instance, input }) => {
      const user = userEvent.setup();
      renderButtons(instance);

      await user.click(screen.getByRole('button', { name: action }));
      const dialog = screen.getByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: action }));

      expect(patchMutate).toHaveBeenCalledTimes(1);
      expect(patchMutate).toHaveBeenCalledWith(input, {
        onSuccess: expect.any(Function) as unknown,
      });
    },
  );

  it('preserves the existing Delete confirmation', async () => {
    const user = userEvent.setup();
    renderButtons(stoppedInstance);

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByText(
        'This permanently deletes the bare metal instance. This action cannot be undone.',
      ),
    ).toBeInTheDocument();
    expect(patchMutate).not.toHaveBeenCalled();
  });
});
