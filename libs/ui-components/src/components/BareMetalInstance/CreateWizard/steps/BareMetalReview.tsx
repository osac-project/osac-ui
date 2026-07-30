import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import { useTranslation } from '../../../../hooks/useTranslation';
import type { BareMetalInstanceWizardValues } from '../values';
import { runStrategies } from './BareMetalConfigurationStep';

export const BareMetalReview = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<BareMetalInstanceWizardValues>();

  if (!values.catalogItem) {
    return null;
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
        {
          label: t('Run strategy'),
          value:
            runStrategies(t).find(({ value }) => value === values.spec.runStrategy)?.label || '-',
        },
        { label: t('User data'), value: values.spec.userData || '-' },
      ],
    },
  ];

  const rows = sections.flatMap((section) => section.rows);

  return (
    <DescriptionList isHorizontal isCompact aria-label={t('Review')}>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Catalog item')}</DescriptionListTerm>
        <DescriptionListDescription>{values.catalogItem.title}</DescriptionListDescription>
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
