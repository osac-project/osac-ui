import { ComputeInstanceCatalogItem } from '@osac/types';

import { getNumberDefaultValue, getStringDefaultValue } from '../../catalogProvision/utils';
import { clearSchemaCache } from '../../catalogProvision/validation';

export interface ComputeInstanceWizardValues {
  catalogItem: ComputeInstanceCatalogItem | undefined;
  metadata: {
    name: string;
  };
  spec: {
    sshPublicKey: string;
    image: {
      sourceRef: string;
    };
    instanceType: string;
    runStrategy: string;
    userData: string;
    bootDisk: {
      sizeGib: number;
    };
    networking: {
      virtualNetwork: string;
      subnet: string;
      securityGroups: string[];
    };
  };
}

const emptyComputeInstanceValues = (
  catalogItem: ComputeInstanceCatalogItem | undefined,
): ComputeInstanceWizardValues => ({
  catalogItem,
  metadata: {
    name: '',
  },
  spec: {
    bootDisk: {
      sizeGib: 0,
    },
    image: {
      sourceRef: '',
    },
    instanceType: '',
    runStrategy: '',
    networking: {
      securityGroups: [],
      subnet: '',
      virtualNetwork: '',
    },
    sshPublicKey: '',
    userData: '',
  },
});

export const buildVmInitialValues = (
  catalogItem: ComputeInstanceCatalogItem | undefined,
): ComputeInstanceWizardValues => {
  clearSchemaCache();
  const base = emptyComputeInstanceValues(catalogItem);
  const fds = catalogItem?.fieldDefinitions || [];

  const defaultSourceRef = getStringDefaultValue('image.source_ref', fds);
  if (defaultSourceRef) {
    base.spec.image.sourceRef = defaultSourceRef;
  }

  const defaultUserData = getStringDefaultValue('user_data', fds);
  if (defaultUserData) {
    base.spec.userData = defaultUserData;
  }

  const defaultBootDisk = getNumberDefaultValue('boot_disk.size_gib', fds);
  if (defaultBootDisk) {
    base.spec.bootDisk.sizeGib = defaultBootDisk;
  }

  const defaultSshKey = getStringDefaultValue('ssh_public_key', fds);
  if (defaultSshKey) {
    base.spec.sshPublicKey = defaultSshKey;
  }

  const defaultInstanceType = getStringDefaultValue('instance_type', fds);
  if (defaultInstanceType) {
    base.spec.instanceType = defaultInstanceType;
  }

  const defaultRunStrategy = getStringDefaultValue('run_strategy', fds);
  if (defaultRunStrategy) {
    base.spec.runStrategy = defaultRunStrategy;
  }

  return base;
};
