import { useState } from 'react';
import { Dropdown, DropdownItem, DropdownList, MenuToggle } from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons/dist/esm/icons/ellipsis-v-icon';

import type { BareMetalInstance } from '@osac/types';

import BareMetalDeleteConfirmModal from './BareMetalDeleteConfirmModal';
import BareMetalPowerConfirmModal from './BareMetalPowerConfirmModal';
import { useBareMetalActions } from './useBareMetalActions';
import type { BareMetalPowerAction } from '../../api/v1/baremetal-instance';
import { useTranslation } from '../../hooks/useTranslation';

interface BareMetalActionsMenuProps {
  instance: BareMetalInstance;
  onDeleted?: () => void;
}

export const BareMetalActionsMenu = ({ instance, onDeleted }: BareMetalActionsMenuProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
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
          onSuccess={() => {
            setDeleteOpen(false);
            onDeleted?.();
          }}
        />
      )}
      <Dropdown
        isOpen={open}
        onOpenChange={setOpen}
        toggle={(ref) => (
          <MenuToggle
            ref={ref}
            variant="plain"
            onClick={() => setOpen((o) => !o)}
            aria-label={t('Actions for {{name}}', { name: instance.metadata?.name ?? instance.id })}
          >
            <EllipsisVIcon />
          </MenuToggle>
        )}
        popperProps={{ position: 'right' }}
      >
        <DropdownList>
          <DropdownItem
            isDisabled={!canStart}
            onClick={() => {
              if (canStart) {
                setPowerAction('start');
                setOpen(false);
              }
            }}
          >
            {t('Start')}
          </DropdownItem>
          <DropdownItem
            isDisabled={!canStop}
            onClick={() => {
              if (canStop) {
                setPowerAction('stop');
                setOpen(false);
              }
            }}
          >
            {t('Stop')}
          </DropdownItem>
          <DropdownItem
            isDisabled={!canRestart}
            onClick={() => {
              if (canRestart) {
                setPowerAction('restart');
                setOpen(false);
              }
            }}
          >
            {t('Restart')}
          </DropdownItem>
          <DropdownItem
            isDisabled={!canDelete}
            onClick={() => {
              if (canDelete) {
                setDeleteOpen(true);
                setOpen(false);
              }
            }}
          >
            {t('Delete')}
          </DropdownItem>
        </DropdownList>
      </Dropdown>
    </>
  );
};
