import { BareMetalInstanceCatalogItem, BareMetalInstanceRunStrategy } from '@osac/types';

import { getNumberDefaultValue, getStringDefaultValue } from '../../catalogProvision/utils';
import { clearSchemaCache } from '../../catalogProvision/validation';

export interface BareMetalInstanceWizardValues {
  catalogItem: BareMetalInstanceCatalogItem | undefined;
  metadata: {
    name: string;
  };
  spec: {
    runStrategy: BareMetalInstanceRunStrategy | undefined;
    sshPublicKey: string;
    userData: string;
  };
}

const getEmptyBareMetalInstanceValues = (
  catalogItem: BareMetalInstanceCatalogItem | undefined,
): BareMetalInstanceWizardValues => ({
  catalogItem,
  metadata: { name: '' },
  spec: {
    runStrategy: undefined,
    sshPublicKey: '',
    userData: '',
  },
});

export const buildBmInitialValues = (
  item: BareMetalInstanceCatalogItem | undefined,
): BareMetalInstanceWizardValues => {
  clearSchemaCache();
  const base = getEmptyBareMetalInstanceValues(item);
  if (!item) {
    return base;
  }

  const sshDefault = getStringDefaultValue('ssh_public_key', item.fieldDefinitions);

  if (sshDefault) {
    base.spec.sshPublicKey = sshDefault;
  }

  const userDataDefault = getStringDefaultValue('user_data', item.fieldDefinitions);

  if (userDataDefault) {
    base.spec.userData = userDataDefault;
  }

  const runStrategyDefault =
    getStringDefaultValue('run_strategy', item.fieldDefinitions) ||
    getNumberDefaultValue('run_strategy', item.fieldDefinitions);

  switch (runStrategyDefault) {
    case 0:
    case 'BARE_METAL_INSTANCE_RUN_STRATEGY_UNSPECIFIED':
      base.spec.runStrategy = BareMetalInstanceRunStrategy.UNSPECIFIED;
      break;
    case 1:
    case 'BARE_METAL_INSTANCE_RUN_STRATEGY_ALWAYS':
      base.spec.runStrategy = BareMetalInstanceRunStrategy.ALWAYS;
      break;
    case 2:
    case 'BARE_METAL_INSTANCE_RUN_STRATEGY_HALTED':
      base.spec.runStrategy = BareMetalInstanceRunStrategy.HALTED;
      break;
  }

  return base;
};
