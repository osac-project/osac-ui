import { useState } from 'react';
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

import type { BareMetalInstance } from '@osac/types';

import { useDeleteBareMetalInstance } from '../../api/v1/baremetal-instance';
import { useTranslation } from '../../hooks/useTranslation';
import { getErrorMessage } from '../../utils/error';

interface BareMetalDeleteConfirmModalProps {
  instance: BareMetalInstance;
  onClose: () => void;
  onSuccess: () => void;
}

const BareMetalDeleteConfirmModal = ({
  instance,
  onClose,
  onSuccess,
}: BareMetalDeleteConfirmModalProps) => {
  const { t } = useTranslation();
  const [isPending, setIsPending] = useState(false);
  const deleteInstance = useDeleteBareMetalInstance();

  const name = instance.metadata?.name ?? instance.id;

  const onDelete = async () => {
    setIsPending(true);
    deleteInstance.reset();
    try {
      await deleteInstance.mutateAsync(instance.id);
      onSuccess();
    } catch {
      // error is handled via deleteInstance.error state
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Modal
      variant="small"
      isOpen
      onClose={isPending ? undefined : onClose}
      aria-labelledby="bm-delete-confirm-title"
    >
      <ModalHeader
        title={t('Delete {{name}}?', { name })}
        titleIconVariant="warning"
        labelId="bm-delete-confirm-title"
      />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            {t('This permanently deletes the bare metal instance. This action cannot be undone.')}
          </StackItem>
          {deleteInstance.error && (
            <StackItem>
              <Alert variant="danger" title={t('Failed to delete bare metal instance')} isInline>
                {getErrorMessage(deleteInstance.error)}
              </Alert>
            </StackItem>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          key="delete"
          variant="danger"
          onClick={onDelete}
          isDisabled={isPending}
          isLoading={isPending}
        >
          {t('Delete')}
        </Button>
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isPending}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default BareMetalDeleteConfirmModal;
