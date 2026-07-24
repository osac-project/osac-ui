import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import { useTranslation } from '../../../../hooks/useTranslation';
import type { ClusterWizardValues } from '../values';

const formatNodeSetsForReview = (
  nodeSetRows: ClusterWizardValues['spec']['nodeSetRows'],
): string => {
  if (nodeSetRows.length === 0) {
    return '-';
  }
  return nodeSetRows.map((row) => `${row.name}: ${row.size}`).join(', ');
};

export const ClusterReview = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<ClusterWizardValues>();

  const rows = [
    { label: t('Name'), value: values.metadata.name },
    { label: t('SSH public key'), value: values.spec.sshPublicKey || '-' },
    { label: t('Pull secret'), value: values.spec.pullSecret ? t('Pull secret set') : '-' },
    { label: t('Release image'), value: values.spec.releaseImage || '-' },
    { label: t('Node sets'), value: formatNodeSetsForReview(values.spec.nodeSetRows) },
    { label: t('Pod CIDR'), value: values.spec.network.podCidr || '-' },
    { label: t('Service CIDR'), value: values.spec.network.serviceCidr || '-' },
  ];

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
