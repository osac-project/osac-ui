import type { FormikErrors } from 'formik';
import type { TFunction } from 'i18next';
import * as Yup from 'yup';

import { camelKeysToSnake } from '@osac/ui-components/utils/snakeCase';
import { buildMetadataNameSchema } from '@osac/ui-components/validation/name';
import { sshPublicKeySchema } from '@osac/ui-components/validation/ssh-public-key';

import { buildClusterCreatePayload } from './payload';
import type { ClusterNodeSetRow, ClusterWizardValues } from './values';
import { buildCidrSchema, cidrsOverlap, isValidCidr } from '../../../validation/cidr-validation';
import { buildFieldSchema } from '../../catalogProvision/validation';

export const buildFullClusterSchema = (t: TFunction) => {
  return Yup.lazy((values: ClusterWizardValues) => {
    const fds = values.catalogItem?.fieldDefinitions || [];
    const payload = buildClusterCreatePayload(values);
    const snakeSpec = camelKeysToSnake(payload.spec ?? {}) as Record<string, unknown>;
    const fieldSchema = buildFieldSchema(snakeSpec, fds);

    return Yup.object({
      catalogItem: Yup.object().required(t('Select a catalog item')),
      metadata: Yup.object({
        name: buildMetadataNameSchema(t),
      }),
      spec: Yup.object({
        sshPublicKey: fieldSchema('ssh_public_key', sshPublicKeySchema(t)),
        pullSecret: fieldSchema(
          'pull_secret',
          Yup.string()
            .trim()
            .required(t('Pull secret is required'))
            .test(
              'pull-secret',
              t(
                'Invalid pull secret format. Paste the complete JSON from your Red Hat account pull secret.',
              ),
              (value) => {
                try {
                  const pullSecret = JSON.parse(value) as { auths?: unknown };
                  return (
                    pullSecret !== null &&
                    typeof pullSecret === 'object' &&
                    pullSecret.auths !== null &&
                    typeof pullSecret.auths === 'object'
                  );
                } catch {
                  return false;
                }
              },
            ),
        ),
        releaseImage: fieldSchema(
          'release_image',
          Yup.string().trim().required(t('Release image is required')),
        ),
        nodeSetRows: Yup.array().of(
          Yup.lazy((row: ClusterNodeSetRow) => {
            return Yup.object({
              name: Yup.string().trim().required(t('Node set name is required')),
              size: fieldSchema(
                `node_sets.${row.name}.size`,
                Yup.number()
                  .min(1, t('Pool size must be greater than zero'))
                  .required(t('Pool size is required')),
              ),
            });
          }),
        ),
        network: Yup.object({
          podCidr: fieldSchema(
            'network.pod_cidr',
            buildCidrSchema(t, 'ipv4').required(t('This field is required')),
          ),
          serviceCidr: fieldSchema(
            'network.service_cidr',
            buildCidrSchema(t, 'ipv4')
              .required(t('This field is required'))
              .test(
                'service-cidr-no-overlap',
                t('Service CIDR must not overlap the pod CIDR.'),
                function (value) {
                  const parent = this.parent as { podCidr?: string } | undefined;
                  const podCidr = parent?.podCidr ?? '';
                  if (!value?.trim() || !podCidr.trim()) {
                    return true;
                  }
                  if (!isValidCidr(value, 'ipv4') || !isValidCidr(podCidr, 'ipv4')) {
                    return true;
                  }
                  return !cidrsOverlap(podCidr, value, 'ipv4');
                },
              ),
          ),
        }),
      }),
    });
  });
};

export const clusterStepHasErrors = (
  stepId: string,
  errors: FormikErrors<ClusterWizardValues>,
): boolean => {
  switch (stepId) {
    case 'catalog':
      return Boolean(errors.catalogItem);
    case 'general':
      return Boolean(errors.metadata?.name || errors.spec?.sshPublicKey || errors.spec?.pullSecret);
    case 'configuration':
      return Boolean(errors.spec?.releaseImage || errors.spec?.nodeSetRows);
    case 'networking':
      return Boolean(errors.spec?.network);
    default:
      return false;
  }
};
