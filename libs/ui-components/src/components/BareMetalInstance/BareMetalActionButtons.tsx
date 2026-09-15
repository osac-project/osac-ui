import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Flex } from '@patternfly/react-core';
import DumpsterIcon from '@patternfly/react-icons/dist/esm/icons/dumpster-icon';
import PlayIcon from '@patternfly/react-icons/dist/esm/icons/play-icon';
import StopIcon from '@patternfly/react-icons/dist/esm/icons/stop-icon';
import SyncAltIcon from '@patternfly/react-icons/dist/esm/icons/sync-alt-icon';

import type { BareMetalInstance } from '@osac/types';

import BareMetalDeleteConfirmModal from './BareMetalDeleteConfirmModal';
import BareMetalPowerConfirmModal from './BareMetalPowerConfirmModal';
import { useBareMetalActions } from './useBareMetalActions';
import type { BareMetalPowerAction } from '../../api/v1/baremetal-instance';
import { useTranslation } from '../../hooks/useTranslation';

interface BareMetalActionButtonsProps {
  instance: BareMetalInstance;
}

const BareMetalActionButtons = ({ instance }: BareMetalActionButtonsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [powerAction, setPowerAction] = useState<BareMetalPowerAction | null>(null);

  const {
    canStart,
    canStop,
    canRestart,
    canDelete,
    start,
    stop,
    restart,
    isPending: isPowerActionPending,
    error: powerActionError,
    reset: resetPowerAction,
  } = useBareMetalActions(instance);

  const closePowerAction = () => {
    resetPowerAction();
    setPowerAction(null);
  };

  const confirmPowerAction = () => {
    if (!powerAction) {
      return;
    }

    resetPowerAction();
    switch (powerAction) {
      case 'start':
        start({ onSuccess: closePowerAction });
        break;
      case 'stop':
        stop({ onSuccess: closePowerAction });
        break;
      case 'restart':
        restart({ onSuccess: closePowerAction });
        break;
    }
  };

  return (
    <>
      {powerAction && (
        <BareMetalPowerConfirmModal
          action={powerAction}
          error={powerActionError}
          isPending={isPowerActionPending}
          onClose={closePowerAction}
          onConfirm={confirmPowerAction}
        />
      )}
      {deleteOpen && (
        <BareMetalDeleteConfirmModal
          instance={instance}
          onClose={() => setDeleteOpen(false)}
          onSuccess={() => navigate('/bare-metal')}
        />
      )}
      <Flex
        justifyContent={{ default: 'justifyContentFlexEnd' }}
        spaceItems={{ default: 'spaceItemsSm' }}
        flexWrap={{ default: 'wrap' }}
      >
        <Button
          variant="primary"
          icon={<PlayIcon />}
          isDisabled={!canStart}
          onClick={() => {
            if (canStart) {
              setPowerAction('start');
            }
          }}
        >
          {t('Start')}
        </Button>
        <Button
          variant="secondary"
          icon={<StopIcon />}
          isDisabled={!canStop}
          onClick={() => {
            if (canStop) {
              setPowerAction('stop');
            }
          }}
        >
          {t('Stop')}
        </Button>
        <Button
          variant="secondary"
          icon={<SyncAltIcon />}
          isDisabled={!canRestart}
          onClick={() => {
            if (canRestart) {
              setPowerAction('restart');
            }
          }}
        >
          {t('Restart')}
        </Button>
        <Button
          variant="danger"
          icon={<DumpsterIcon />}
          isDisabled={!canDelete}
          onClick={() => {
            if (canDelete) {
              setDeleteOpen(true);
            }
          }}
        >
          {t('Delete')}
        </Button>
      </Flex>
    </>
  );
};

export default BareMetalActionButtons;
