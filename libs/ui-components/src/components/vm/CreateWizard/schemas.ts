import type { FormikErrors } from 'formik';
import type { TFunction } from 'i18next';
import * as Yup from 'yup';

import { camelKeysToSnake } from '@osac/ui-components/utils/snakeCase';
import { buildMetadataNameSchema } from '@osac/ui-components/validation/name';
import { sshPublicKeySchema } from '@osac/ui-components/validation/ssh-public-key';
import { userDataSchema } from '@osac/ui-components/validation/user-data';

import { buildComputeInstanceCreatePayload } from './payload';
import type { ComputeInstanceWizardValues } from './values';
import { buildFieldSchema } from '../../catalogProvision/validation';

export const buildFullVmSchema = (t: TFunction) => {
  return Yup.lazy((values: ComputeInstanceWizardValues) => {
    const fds = values.catalogItem?.fieldDefinitions || [];
    const payload = buildComputeInstanceCreatePayload(values);
    const snakeSpec = camelKeysToSnake(payload.spec ?? {}) as Record<string, unknown>;
    const fieldSchema = buildFieldSchema(snakeSpec, fds);

    return Yup.object({
      catalogItem: Yup.object().required(t('Select a catalog item')),
      metadata: Yup.object({
        name: buildMetadataNameSchema(t),
      }),
      spec: Yup.object({
        sshPublicKey: fieldSchema('ssh_public_key', sshPublicKeySchema(t)),
        userData: fieldSchema('user_data', userDataSchema(t)),
        image: Yup.object({
          sourceRef: fieldSchema(
            'image.source_ref',
            Yup.string().required(t('VM image is required')),
          ),
        }),
        instanceType: fieldSchema(
          'instance_type',
          Yup.string().required(t('Instance type is required')),
        ),
        runStrategy: fieldSchema(
          'run_strategy',
          Yup.string().required(t('Run strategy is required')),
        ),
        bootDisk: Yup.object({
          sizeGib: fieldSchema(
            'boot_disk.size_gib',
            Yup.number()
              .required(t('Boot disk size is required'))
              .positive(t('Boot disk size must be greater than zero')),
          ),
        }),
        networking: fieldSchema(
          'network_attachments',
          Yup.object({
            virtualNetwork: Yup.string().required(t('Virtual network is required')),
            subnet: Yup.string().required(t('Subnet is required')),
            securityGroups: Yup.array().min(1, t('At least one security group is required')),
          }),
        ),
      }),
    });
  });
};

export const vmStepHasErrors = (
  stepId: string,
  errors: FormikErrors<ComputeInstanceWizardValues>,
): boolean => {
  switch (stepId) {
    case 'catalog':
      return Boolean(errors.catalogItem);
    case 'general':
      return Boolean(errors.metadata?.name || errors.spec?.sshPublicKey);
    case 'configuration':
      return Boolean(
        errors.spec?.image ||
        errors.spec?.instanceType ||
        errors.spec?.bootDisk ||
        errors.spec?.userData ||
        errors.spec?.runStrategy,
      );
    case 'networking':
      return Boolean(errors.spec?.networking);
    default:
      return false;
  }
};
