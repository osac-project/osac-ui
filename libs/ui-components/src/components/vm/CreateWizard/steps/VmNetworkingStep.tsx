import { useEffect, useMemo, useRef } from 'react';
import { Alert, Button, Stack, StackItem } from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import { getErrorMessage } from '@osac/ui-components/utils/error';

import {
  VIRTUAL_NETWORK_READY_LIST_FILTER,
  resourceDisplayName,
  securityGroupFilterForVirtualNetworkList,
  useSecurityGroups,
  useSubnets,
  useVirtualNetworks,
  virtualNetworkFilterForSubnetList,
} from '../../../../api/v1/networking';
import { useTranslation } from '../../../../hooks/useTranslation';
import { MultiSelectField } from '../../../Form/MultiSelectField';
import OsacForm from '../../../Form/OsacForm';
import { SelectField } from '../../../Form/SelectField';
import type { ComputeInstanceWizardValues } from '../values';

export const VmNetworkingStep = () => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<ComputeInstanceWizardValues>();
  const virtualNetworkId = values.spec.networking.virtualNetwork;

  const {
    data: virtualNetworks = [],
    isLoading: virtualNetworksLoading,
    error: virtualNetworksError,
    refetch: refetchVirtualNetworks,
  } = useVirtualNetworks({ filter: VIRTUAL_NETWORK_READY_LIST_FILTER });

  const subnetFilter = virtualNetworkId
    ? virtualNetworkFilterForSubnetList(virtualNetworkId)
    : undefined;
  const securityGroupFilter = virtualNetworkId
    ? securityGroupFilterForVirtualNetworkList(virtualNetworkId)
    : undefined;

  const {
    data: subnets = [],
    isLoading: subnetsLoading,
    error: subnetsError,
    refetch: refetchSubnets,
  } = useSubnets(subnetFilter ? { filter: subnetFilter } : {}, {
    enabled: Boolean(virtualNetworkId),
  });

  const {
    data: securityGroups = [],
    isLoading: securityGroupsLoading,
    error: securityGroupsError,
    refetch: refetchSecurityGroups,
  } = useSecurityGroups(securityGroupFilter ? { filter: securityGroupFilter } : {}, {
    enabled: Boolean(virtualNetworkId),
  });

  const virtualNetworkOptions = useMemo(
    () =>
      virtualNetworks.map((vn) => ({
        value: vn.id,
        label: resourceDisplayName(vn.metadata, vn.id),
      })),
    [virtualNetworks],
  );

  const subnetOptions = useMemo(
    () =>
      subnets.map((subnet) => ({
        value: subnet.id,
        label: resourceDisplayName(subnet.metadata, subnet.id),
      })),
    [subnets],
  );

  const securityGroupOptions = useMemo(
    () =>
      securityGroups.map((group) => ({
        value: group.id,
        label: resourceDisplayName(group.metadata, group.id),
      })),
    [securityGroups],
  );

  const previousVirtualNetworkIdRef = useRef(virtualNetworkId);

  useEffect(() => {
    const previous = previousVirtualNetworkIdRef.current;
    previousVirtualNetworkIdRef.current = virtualNetworkId;
    if (previous && previous !== virtualNetworkId) {
      void setFieldValue('spec.networking.subnet', '');
      void setFieldValue('spec.networking.securityGroups', []);
    }
  }, [setFieldValue, virtualNetworkId]);

  const listError = virtualNetworksError || subnetsError || securityGroupsError;
  const loadingPlaceholder = t('Loading...');
  const subnetListLoading = Boolean(virtualNetworkId) && subnetsLoading;
  const securityGroupListLoading = Boolean(virtualNetworkId) && securityGroupsLoading;

  return (
    <Stack hasGutter>
      {listError ? (
        <StackItem>
          <Alert variant="danger" isInline title={t('Could not load networking options')}>
            {getErrorMessage(listError)}
            <Button
              variant="link"
              isInline
              onClick={() => {
                void refetchVirtualNetworks();
                void refetchSubnets();
                void refetchSecurityGroups();
              }}
            >
              {t('Retry')}
            </Button>
          </Alert>
        </StackItem>
      ) : null}
      <StackItem>
        <OsacForm>
          <SelectField
            name="spec.networking.virtualNetwork"
            label={t('Virtual network')}
            fieldId="vm-virtual-network"
            isRequired
            autoSelectSingleOption
            isLoading={virtualNetworksLoading}
            loadingPlaceholder={loadingPlaceholder}
            placeholder={t('Select a virtual network')}
            options={virtualNetworkOptions}
          />
          <SelectField
            name="spec.networking.subnet"
            label={t('Subnet')}
            fieldId="vm-subnet"
            isRequired
            autoSelectSingleOption
            isLoading={subnetListLoading}
            isDisabled={!virtualNetworkId}
            loadingPlaceholder={loadingPlaceholder}
            placeholder={t('Select a subnet')}
            options={subnetOptions}
          />
          <MultiSelectField
            name="spec.networking.securityGroups"
            label={t('Security groups')}
            fieldId="vm-security-group"
            isRequired
            autoSelectSingleOption
            isLoading={securityGroupListLoading}
            isDisabled={!virtualNetworkId}
            loadingPlaceholder={loadingPlaceholder}
            placeholder={t('Select security groups')}
            options={securityGroupOptions}
          />
        </OsacForm>
      </StackItem>
    </Stack>
  );
};
