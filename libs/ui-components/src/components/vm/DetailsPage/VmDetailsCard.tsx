import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Skeleton,
} from '@patternfly/react-core';

import type { ComputeInstance } from '@osac/types';

import { useVmDetailsDisplay } from './useVmDetailsDisplay';
import VmDetailsCatalogValue from './VmDetailsCatalogValue';
import { useTranslation } from '../../../hooks/useTranslation';
import { displayValue } from '../../../utils/detailFormatters';
import { Timestamp } from '../../Primitives/Timestamp';
import { formatInstanceTypeReviewLabelFromType } from '../utils';

interface Props {
  vm: ComputeInstance;
}

const VmDetailsCard = ({ vm }: Props) => {
  const { t } = useTranslation();
  const {
    catalogItemId,
    isCatalogItemLoading,
    instanceType,
    instanceTypeId,
    isInstanceTypeLoading,
  } = useVmDetailsDisplay(vm);

  return (
    <Card isFullHeight>
      <CardTitle>{t('Details')}</CardTitle>
      <CardBody>
        <DescriptionList isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Catalog item')}</DescriptionListTerm>
            <DescriptionListDescription>
              {isCatalogItemLoading ? (
                <Skeleton width="150px" />
              ) : (
                <VmDetailsCatalogValue catalogItemId={catalogItemId} />
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
            <DescriptionListDescription>
              {displayValue(vm.metadata?.name)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('SSH public key')}</DescriptionListTerm>
            <DescriptionListDescription>
              {displayValue(vm.spec?.sshPublicKey)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('VM image')}</DescriptionListTerm>
            <DescriptionListDescription>
              {displayValue(vm.spec?.image?.sourceRef)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Instance type')}</DescriptionListTerm>
            <DescriptionListDescription>
              {isInstanceTypeLoading && instanceTypeId?.trim() ? (
                <Skeleton width="150px" />
              ) : (
                formatInstanceTypeReviewLabelFromType(
                  instanceType,
                  t(' (deprecated)'),
                  instanceTypeId,
                )
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Boot disk size')}</DescriptionListTerm>
            <DescriptionListDescription>
              {vm.spec?.bootDisk?.sizeGib || '-'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
            <DescriptionListDescription>
              <Timestamp value={vm.metadata?.creationTimestamp} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Creator')}</DescriptionListTerm>
            <DescriptionListDescription>
              {displayValue(vm.metadata?.creator)}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default VmDetailsCard;
