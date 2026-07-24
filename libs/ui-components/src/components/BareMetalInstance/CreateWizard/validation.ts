import type { FormikErrors } from 'formik';
import type { TFunction } from 'i18next';
import * as Yup from 'yup';

import { camelKeysToSnake } from '@osac/ui-components/utils/snakeCase';
import { buildMetadataNameSchema } from '@osac/ui-components/validation/name';
import { sshPublicKeySchema } from '@osac/ui-components/validation/ssh-public-key';
import { userDataSchema } from '@osac/ui-components/validation/user-data';

import { buildBmCreatePayload } from './payload';
import type { BareMetalInstanceWizardValues } from './values';
import { buildFieldSchema } from '../../catalogProvision/validation';

export const buildFullBmSchema = (t: TFunction) => {
  return Yup.lazy((values: BareMetalInstanceWizardValues) => {
    const fds = values.catalogItem?.fieldDefinitions || [];
    const payload = buildBmCreatePayload(values);
    const snakeSpec = camelKeysToSnake(payload.spec ?? {}) as Record<string, unknown>;
    const fieldSchema = buildFieldSchema(snakeSpec, fds);

    return Yup.object({
      catalogItem: Yup.object().required(t('Catalog item is required')),
      metadata: Yup.object({
        name: buildMetadataNameSchema(t),
      }),
      spec: Yup.object({
        runStrategy: fieldSchema('run_strategy'),
        sshPublicKey: fieldSchema('ssh_public_key', sshPublicKeySchema(t)),
        userData: fieldSchema('user_data', userDataSchema(t)),
      }),
    });
  });
};

export const bmStepHasErrors = (
  stepId: string,
  errors: FormikErrors<BareMetalInstanceWizardValues>,
): boolean => {
  switch (stepId) {
    case 'catalog':
      return Boolean(errors.catalogItem);
    case 'general':
      return Boolean(errors.metadata?.name || errors.spec?.sshPublicKey);
    case 'configuration':
      return Boolean(errors.spec?.runStrategy || errors.spec?.userData);
    default:
      return false;
  }
};
