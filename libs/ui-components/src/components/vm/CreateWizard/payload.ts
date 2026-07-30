import { type MessageInitShape } from '@bufbuild/protobuf';

import { ComputeInstanceSchema } from '@osac/types';

import { type ComputeInstanceWizardValues } from './values';
import { isFieldEditable } from '../../catalogProvision/utils';

export const buildComputeInstanceCreatePayload = (
  values: ComputeInstanceWizardValues,
): MessageInitShape<typeof ComputeInstanceSchema> => {
  const vm: MessageInitShape<typeof ComputeInstanceSchema> = {
    metadata: { name: values.metadata.name },
    spec: {
      catalogItem: values.catalogItem?.id,
    },
  };

  if (vm.spec) {
    const fds = values.catalogItem?.fieldDefinitions || [];

    if (isFieldEditable('ssh_public_key', fds)) {
      vm.spec.sshPublicKey = values.spec.sshPublicKey;
    }

    if (isFieldEditable('user_data', fds)) {
      vm.spec.userData = values.spec.userData;
    }

    if (isFieldEditable('boot_disk.size_gib', fds)) {
      vm.spec.bootDisk = {
        sizeGib: values.spec.bootDisk.sizeGib,
      };
    }

    if (isFieldEditable('instance_type', fds)) {
      vm.spec.instanceType = values.spec.instanceType;
    }

    if (isFieldEditable('run_strategy', fds)) {
      vm.spec.runStrategy = values.spec.runStrategy;
    }

    if (isFieldEditable('network_attachments', fds)) {
      vm.spec.networkAttachments = [
        {
          subnet: values.spec.networking.subnet,
          securityGroups: values.spec.networking.securityGroups,
        },
      ];
    }

    if (isFieldEditable('image.source_ref', fds)) {
      vm.spec.image = {
        sourceRef: values.spec.image.sourceRef,
      };
    }

    if (isFieldEditable('image.source_type', fds)) {
      if (vm.spec.image) {
        vm.spec.image.sourceType = 'registry';
      } else {
        vm.spec.image = {
          sourceType: 'registry',
        };
      }
    }
  }
  return vm;
};
