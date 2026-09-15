import type { BareMetalInstance } from '@osac/types';
import { BareMetalInstanceState } from '@osac/types';

import {
  type PatchBareMetalInstanceInput,
  usePatchBareMetalInstance,
} from '../../api/v1/baremetal-instance';

interface BareMetalActionOptions {
  onSuccess?: () => void;
}

export const useBareMetalActions = (instance: BareMetalInstance) => {
  const patch = usePatchBareMetalInstance();

  const state = instance.status?.state;
  const canStart = state === BareMetalInstanceState.STOPPED;
  const canStop = state === BareMetalInstanceState.RUNNING;
  const canRestart = state === BareMetalInstanceState.RUNNING;
  const canDelete = state !== BareMetalInstanceState.DELETING;

  const mutate = (input: PatchBareMetalInstanceInput, options?: BareMetalActionOptions) => {
    patch.mutate(input, options);
  };

  const start = (options?: BareMetalActionOptions) => {
    if (canStart) {
      mutate({ id: instance.id, action: 'start' }, options);
    }
  };

  const stop = (options?: BareMetalActionOptions) => {
    if (canStop) {
      mutate({ id: instance.id, action: 'stop' }, options);
    }
  };

  const restart = (options?: BareMetalActionOptions) => {
    if (canRestart) {
      mutate(
        {
          id: instance.id,
          action: 'restart',
          currentTrigger: instance.spec?.restartTrigger ?? 0n,
        },
        options,
      );
    }
  };

  return {
    canStart,
    canStop,
    canRestart,
    canDelete,
    start,
    stop,
    restart,
    isPending: patch.isPending,
    error: patch.error,
    reset: patch.reset,
  };
};
