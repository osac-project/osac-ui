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
import { useBareMetalPowerConfirmation } from './useBareMetalPowerConfirmation';
import { useTranslation } from '../../hooks/useTranslation';

interface BareMetalActionButtonsProps {
  instance: BareMetalInstance;
}

const BareMetalActionButtons = ({ instance }: BareMetalActionButtonsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    canStart,
    canStop,
    canRestart,
    canDelete,
    powerAction,
    openPowerAction,
    closePowerAction,
    confirmPowerAction,
    isPending: isPowerActionPending,
    error: powerActionError,
  } = useBareMetalPowerConfirmation(instance);

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
              openPowerAction('start');
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
              openPowerAction('stop');
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
              openPowerAction('restart');
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
