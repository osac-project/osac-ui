import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import type { BareMetalPowerAction } from '../../api/v1/baremetal-instance';
import { useTranslation } from '../../hooks/useTranslation';
import { getErrorMessage } from '../../utils/error';

interface BareMetalPowerConfirmModalProps {
  action: BareMetalPowerAction;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  error: Error | null;
}

const BareMetalPowerConfirmModal = ({
  action,
  onClose,
  onConfirm,
  isPending,
  error,
}: BareMetalPowerConfirmModalProps) => {
  const { t } = useTranslation();
  const copy = {
    start: {
      title: t('Start bare metal instance?'),
      warning: t(
        'Starting this bare metal instance will make it available again. Services may be unavailable until startup completes.',
      ),
      errorLabel: t('Failed to start bare metal instance'),
      actionLabel: t('Start'),
    },
    stop: {
      title: t('Stop bare metal instance?'),
      warning: t(
        'Stopping this bare metal instance will interrupt running workloads and cause service downtime.',
      ),
      errorLabel: t('Failed to stop bare metal instance'),
      actionLabel: t('Stop'),
    },
    restart: {
      title: t('Restart bare metal instance?'),
      warning: t(
        'Restarting this bare metal instance will interrupt running workloads and cause temporary downtime.',
      ),
      errorLabel: t('Failed to restart bare metal instance'),
      actionLabel: t('Restart'),
    },
  }[action];

  return (
    <Modal
      variant="small"
      isOpen
      onClose={() => {
        if (!isPending) {
          onClose();
        }
      }}
      aria-labelledby="bare-metal-power-confirm-title"
    >
      <ModalHeader
        title={copy.title}
        titleIconVariant="warning"
        labelId="bare-metal-power-confirm-title"
      />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>{copy.warning}</StackItem>
          {!!error && (
            <StackItem>
              <Alert variant="danger" title={copy.errorLabel} isInline>
                {getErrorMessage(error)}
              </Alert>
            </StackItem>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={onConfirm} isDisabled={isPending} isLoading={isPending}>
          {copy.actionLabel}
        </Button>
        <Button variant="link" onClick={onClose} isDisabled={isPending}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default BareMetalPowerConfirmModal;
