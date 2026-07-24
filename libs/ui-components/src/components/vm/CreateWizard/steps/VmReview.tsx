import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Spinner,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import { useInstanceType } from '@osac/ui-components/api/v1/instance-types';
import {
  resourceDisplayName,
  useSecurityGroupsByIds,
  useSubnet,
  useVirtualNetwork,
} from '@osac/ui-components/api/v1/networking';

import { useTranslation } from '../../../../hooks/useTranslation';
import { formatInstanceTypeOptionLabel } from '../../utils';
import type { ComputeInstanceWizardValues } from '../values';

export const VmReview = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<ComputeInstanceWizardValues>();

  const { data: instanceType, isLoading: instanceTypeLoading } = useInstanceType(
    values.spec.instanceType,
  );

  const { data: virtualNetwork, isLoading: virtualNetworkLoading } = useVirtualNetwork(
    values.spec.networking.virtualNetwork,
  );

  const { data: subnet, isLoading: subnetLoading } = useSubnet(values.spec.networking.subnet);

  const { data: securityGroups = [], isLoading: scLoading } = useSecurityGroupsByIds(
    values.spec.networking.securityGroups,
  );

  if (instanceTypeLoading || virtualNetworkLoading || subnetLoading || scLoading) {
    return <Spinner />;
  }

  const sections = [
    {
      title: t('General'),
      rows: [
        { label: t('Name'), value: values.metadata.name },
        { label: t('SSH public key'), value: values.spec.sshPublicKey || '-' },
      ],
    },
    {
      title: t('Configuration'),
      rows: [
        { label: t('VM image'), value: values.spec.image.sourceRef || '-' },
        {
          label: t('Instance type'),
          value: instanceType
            ? formatInstanceTypeOptionLabel(instanceType)
            : values.spec.instanceType,
        },
        {
          label: t('Run strategy'),
          value: values.spec.runStrategy || '-',
        },
        { label: t('Boot disk size (GiB)'), value: values.spec.bootDisk.sizeGib },
        { label: t('User data'), value: values.spec.userData || '-' },
      ],
    },
    {
      title: t('Networking'),
      rows: [
        {
          label: t('Virtual network'),
          value: resourceDisplayName(virtualNetwork?.metadata, virtualNetwork?.id),
        },
        {
          label: t('Subnet'),
          value: resourceDisplayName(subnet?.metadata, subnet?.id),
        },
        {
          label: t('Security groups'),
          value:
            securityGroups.map((sc) => resourceDisplayName(sc.metadata, sc.id)).join(', ') || '-',
        },
      ],
    },
  ];

  const rows = sections.flatMap((section) => section.rows);

  return (
    <DescriptionList isHorizontal isCompact aria-label={t('Review')}>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Catalog item')}</DescriptionListTerm>
        <DescriptionListDescription>{values.catalogItem?.title ?? '—'}</DescriptionListDescription>
      </DescriptionListGroup>
      {rows.map((row) => (
        <DescriptionListGroup key={row.label}>
          <DescriptionListTerm>{row.label}</DescriptionListTerm>
          <DescriptionListDescription>{row.value}</DescriptionListDescription>
        </DescriptionListGroup>
      ))}
    </DescriptionList>
  );
};
