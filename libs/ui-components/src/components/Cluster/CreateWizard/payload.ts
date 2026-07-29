import type { MessageInitShape } from '@bufbuild/protobuf';

import { ClusterSchema } from '@osac/types';

import type { ClusterWizardValues } from './values';
import { getFieldDefinition, isFieldEditable } from '../../catalogProvision/utils';

export const buildClusterCreatePayload = (
  values: ClusterWizardValues,
): MessageInitShape<typeof ClusterSchema> => {
  const fds = values.catalogItem?.fieldDefinitions || [];

  const cluster: MessageInitShape<typeof ClusterSchema> = {
    metadata: { name: values.metadata.name },
    spec: {
      catalogItem: values.catalogItem?.id,
    },
  };

  if (cluster.spec) {
    if (isFieldEditable('release_image', fds)) {
      cluster.spec.releaseImage = values.spec.releaseImage;
    }

    if (isFieldEditable('pull_secret', fds)) {
      cluster.spec.pullSecret = values.spec.pullSecret;
    }

    if (isFieldEditable('ssh_public_key', fds)) {
      cluster.spec.sshPublicKey = values.spec.sshPublicKey;
    }

    if (isFieldEditable('network.pod_cidr', fds)) {
      cluster.spec.network = {
        ...cluster.spec.network,
        podCidr: values.spec.network.podCidr,
      };
    }

    if (isFieldEditable('network.service_cidr', fds)) {
      cluster.spec.network = {
        ...cluster.spec.network,
        serviceCidr: values.spec.network.serviceCidr,
      };
    }

    const nodeSetsFd = getFieldDefinition('node_sets', fds);

    if (nodeSetsFd?.editable === true) {
      const nodeSets = values.spec.nodeSetRows.reduce(
        (acc, curr) => {
          const nodeSetFd = getFieldDefinition(`node_sets.${curr.name}.size`, fds);

          if (!nodeSetFd || nodeSetFd.editable === true) {
            acc[curr.name] = {
              size: curr.size,
            };
          }
          return acc;
        },
        {} as { [key: string]: { size: number } },
      );

      cluster.spec.nodeSets = nodeSets;
    } else if (!nodeSetsFd) {
      for (const nodeSet of values.spec.nodeSetRows) {
        if (isFieldEditable(`node_sets.${nodeSet.name}.size`, fds)) {
          cluster.spec.nodeSets = {
            ...(cluster.spec.nodeSets || {}),
            [nodeSet.name]: {
              size: nodeSet.size,
            },
          };
        }
      }
    }
  }

  return cluster;
};
