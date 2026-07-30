import { useMemo } from 'react';

import type { ComputeInstance } from '@osac/types';

import { useComputeInstanceCatalogItem } from '../../../api/v1/compute-instance-catalog-item';
import { useInstanceType } from '../../../api/v1/instance-types';
import {
  formatResourceIdForReview,
  formatResourceIdsForReview,
  useSecurityGroups,
  useSubnets,
  useVirtualNetworks,
} from '../../../api/v1/networking';

export type VmNetworkingRow = {
  virtualNetwork: string;
  subnet: string;
  securityGroups: string;
};

export const useVmDetailsDisplay = (vm: ComputeInstance) => {
  const catalogItemId = vm.spec?.catalogItem;
  const instanceTypeId = vm.spec?.instanceType;

  const { data: catalogItem, isLoading: isCatalogItemLoading } =
    useComputeInstanceCatalogItem(catalogItemId);
  const { data: instanceType, isLoading: isInstanceTypeLoading } = useInstanceType(instanceTypeId);
  const { data: virtualNetworks = [] } = useVirtualNetworks();
  const { data: subnets = [] } = useSubnets();
  const { data: securityGroups = [] } = useSecurityGroups();

  const networkingRows = useMemo((): VmNetworkingRow[] => {
    const attachments = vm.spec?.networkAttachments ?? [];
    return attachments.map((attachment) => {
      const subnet = subnets.find((item) => item.id === attachment.subnet);
      const virtualNetworkId = subnet?.spec?.virtualNetwork ?? '';
      return {
        virtualNetwork: formatResourceIdForReview(virtualNetworkId, virtualNetworks),
        subnet: formatResourceIdForReview(attachment.subnet ?? '', subnets),
        securityGroups: formatResourceIdsForReview(attachment.securityGroups ?? [], securityGroups),
      };
    });
  }, [vm.spec?.networkAttachments, subnets, virtualNetworks, securityGroups]);

  return {
    catalogItem,
    catalogItemId,
    isCatalogItemLoading,
    instanceType,
    instanceTypeId,
    isInstanceTypeLoading,
    networkingRows,
  };
};
