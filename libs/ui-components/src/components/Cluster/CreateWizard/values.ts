import type { ClusterCatalogItem, ClusterTemplate } from '@osac/types';

import { getNumberDefaultValue, getStringDefaultValue } from '../../catalogProvision/utils';
import { clearSchemaCache } from '../../catalogProvision/validation';

export interface ClusterNodeSetRow {
  name: string;
  size: number;
}

export interface ClusterWizardValues {
  catalogItem: ClusterCatalogItem | undefined;
  metadata: {
    name: string;
  };
  spec: {
    sshPublicKey: string;
    pullSecret: string;
    releaseImage: string;
    nodeSetRows: ClusterNodeSetRow[];
    network: {
      podCidr: string;
      serviceCidr: string;
    };
  };
}

export const createEmptyClusterValues = (
  catalogItem: ClusterCatalogItem | undefined,
): ClusterWizardValues => ({
  catalogItem,
  metadata: { name: '' },
  spec: {
    sshPublicKey: '',
    pullSecret: '',
    releaseImage: '',
    nodeSetRows: [],
    network: {
      podCidr: '',
      serviceCidr: '',
    },
  },
});

export const buildClusterInitialValues = (
  item: ClusterCatalogItem | undefined,
  clusterTemplates: ClusterTemplate[] | undefined,
): ClusterWizardValues => {
  clearSchemaCache();
  const base = createEmptyClusterValues(item);
  if (!item) {
    return base;
  }

  const sshDefault = getStringDefaultValue('ssh_public_key', item.fieldDefinitions);
  if (sshDefault) {
    base.spec.sshPublicKey = sshDefault;
  }

  const pullSecretDefault = getStringDefaultValue('pull_secret', item.fieldDefinitions);
  if (pullSecretDefault) {
    base.spec.pullSecret = pullSecretDefault;
  }

  const releaseImageDefault = getStringDefaultValue('release_image', item.fieldDefinitions);
  if (releaseImageDefault) {
    base.spec.releaseImage = releaseImageDefault;
  }

  const podCidrDefault = getStringDefaultValue('network.pod_cidr', item.fieldDefinitions);
  if (podCidrDefault) {
    base.spec.network.podCidr = podCidrDefault;
  }

  const serviceCidrDefault = getStringDefaultValue('network.service_cidr', item.fieldDefinitions);
  if (serviceCidrDefault) {
    base.spec.network.serviceCidr = serviceCidrDefault;
  }

  const clusterNodeSets = clusterTemplates?.find((t) => t.id === item.template)?.nodeSets || {};

  const nodeSetRows: ClusterNodeSetRow[] = Object.keys(clusterNodeSets).map((nodeSet) => ({
    name: nodeSet,
    size: clusterNodeSets[nodeSet].size,
  }));

  for (const fd of item.fieldDefinitions) {
    if (fd.path.startsWith('node_sets.')) {
      const parts = fd.path.split('.');
      const nodeSetKey = parts[1];
      const defSize = getNumberDefaultValue(`node_sets.${nodeSetKey}.size`, item.fieldDefinitions);

      if (defSize !== undefined) {
        const nodeSet = nodeSetRows.find(({ name }) => name === nodeSetKey);
        if (nodeSet) {
          nodeSet.size = defSize;
        }
      }
    }
  }

  base.spec.nodeSetRows = nodeSetRows;

  return base;
};
