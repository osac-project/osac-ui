import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type BareMetalInstance, BareMetalInstanceState } from '@osac/types';

import { BareMetalActionsMenu } from './BareMetalActionsMenu';
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

describe('BareMetalActionsMenu', () => {
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

  const renderMenu = (instance: BareMetalInstance) =>
    render(<BareMetalActionsMenu instance={instance} />);

  const openAction = async (action: string) => {
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Actions for/ }));
    await user.click(screen.getByRole('menuitem', { name: action }));
    return user;
  };

  it('opens confirmation and does not mutate when Stop is canceled', async () => {
    renderMenu(runningInstance);
    const user = await openAction('Stop');

    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /Cancel/i }));

    expect(patchMutate).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it.each([
    { action: 'Start', instance: stoppedInstance, input: { id: 'bm-1', action: 'start' } },
    { action: 'Stop', instance: runningInstance, input: { id: 'bm-1', action: 'stop' } },
    {
      action: 'Restart',
      instance: runningInstance,
      input: { id: 'bm-1', action: 'restart', currentTrigger: 4n },
    },
  ])('confirms $action from the list menu exactly once', async ({ action, instance, input }) => {
    renderMenu(instance);
    const user = await openAction(action);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: action }));

    expect(patchMutate).toHaveBeenCalledTimes(1);
    expect(patchMutate).toHaveBeenCalledWith(input, { onSuccess: expect.any(Function) as unknown });
  });

  it('disables the confirmation controls while a list action is pending', async () => {
    vi.mocked(bareMetalApi.usePatchBareMetalInstance).mockReturnValue({
      mutate: patchMutate,
      reset: patchReset,
      isPending: true,
      error: null,
    } as unknown as ReturnType<typeof bareMetalApi.usePatchBareMetalInstance>);
    renderMenu(stoppedInstance);
    await openAction('Start');
    const dialog = screen.getByRole('dialog');

    expect(within(dialog).getByRole('button', { name: /Start/i })).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: /Cancel/i })).toBeDisabled();
  });
});
