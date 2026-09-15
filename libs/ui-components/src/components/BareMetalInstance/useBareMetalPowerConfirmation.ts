import { useState } from 'react';

import type { BareMetalInstance } from '@osac/types';

import { useBareMetalActions } from './useBareMetalActions';
import type { BareMetalPowerAction } from '../../api/v1/baremetal-instance';

export const useBareMetalPowerConfirmation = (instance: BareMetalInstance) => {
  const actions = useBareMetalActions(instance);
  const [powerAction, setPowerAction] = useState<BareMetalPowerAction | null>(null);

  const closePowerAction = () => {
    actions.reset();
    setPowerAction(null);
  };

  const confirmPowerAction = () => {
    if (!powerAction) {
      return;
    }

    actions.reset();
    switch (powerAction) {
      case 'start':
        actions.start({ onSuccess: closePowerAction });
        break;
      case 'stop':
        actions.stop({ onSuccess: closePowerAction });
        break;
      case 'restart':
        actions.restart({ onSuccess: closePowerAction });
        break;
    }
  };

  return {
    ...actions,
    powerAction,
    openPowerAction: setPowerAction,
    closePowerAction,
    confirmPowerAction,
  };
};
