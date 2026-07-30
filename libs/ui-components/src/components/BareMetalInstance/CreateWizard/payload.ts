import type { MessageInitShape } from '@bufbuild/protobuf';

import { BareMetalInstanceSchema } from '@osac/types';

import type { BareMetalInstanceWizardValues } from './values';
import { isFieldEditable } from '../../catalogProvision/utils';

export const buildBmCreatePayload = (
  values: BareMetalInstanceWizardValues,
): MessageInitShape<typeof BareMetalInstanceSchema> => {
  const fds = values.catalogItem?.fieldDefinitions || [];

  const bmi: MessageInitShape<typeof BareMetalInstanceSchema> = {
    metadata: values.metadata,
    spec: {
      catalogItem: values.catalogItem?.id,
    },
  };

  if (bmi.spec) {
    if (isFieldEditable('ssh_public_key', fds)) {
      bmi.spec.sshPublicKey = values.spec.sshPublicKey;
    }
    if (isFieldEditable('run_strategy', fds)) {
      bmi.spec.runStrategy = values.spec.runStrategy;
    }
    if (isFieldEditable('user_data', fds)) {
      bmi.spec.userData = values.spec.userData;
    }
  }

  return bmi;
};
