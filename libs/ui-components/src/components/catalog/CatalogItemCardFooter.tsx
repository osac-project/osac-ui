import { FC } from 'react';
import { CardFooter, Content, Flex, FlexItem } from '@patternfly/react-core';
import { RhUiLockFillIcon } from '@patternfly/react-icons/dist/esm/icons/rh-ui-lock-fill-icon';
import { TFunction } from 'i18next';

import { type Tenant } from '@osac/types/private';
import { CatalogItem } from '@osac/ui-components/components/catalog/catalogItemDisplay';
import CatalogItemLaunchButton from '@osac/ui-components/components/catalog/CatalogItemLaunchButton';
import CatalogItemTenant from '@osac/ui-components/components/catalog/CatalogItemTenant';
import FieldSeparator from '@osac/ui-components/components/Primitives/FieldSeparator';
import { Timestamp } from '@osac/ui-components/components/Primitives/Timestamp';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';
import { UserRole } from '@osac/ui-components/shellTypes';

type CatalogItemCardFooterProps = {
  catalogItem: CatalogItem;
  tenants: Tenant[];
  role: UserRole;
  isWizardMode: boolean;
};

const getConfiguredString = (catalogItem: CatalogItem, t: TFunction) => {
  switch (catalogItem.$typeName) {
    case 'osac.public.v1.ComputeInstanceCatalogItem':
      return t('Virtual machine pre-configured');
    case 'osac.public.v1.BareMetalInstanceCatalogItem':
      return t('Hardware pre-configured');
    case 'osac.public.v1.ClusterCatalogItem':
      return t('Cluster pre-configured');
    default:
      return t('Unknown');
  }
};

const CatalogItemCardFooter: FC<CatalogItemCardFooterProps> = ({
  catalogItem,
  tenants = [],
  role,
  isWizardMode,
}) => {
  const { t } = useTranslation();

  if (role === 'tenant-user') {
    return (
      <CardFooter>
        <Flex direction={{ default: 'column' }} gap={{ default: 'gapLg' }}>
          <FlexItem>
            <Flex flexWrap={{ default: 'nowrap' }} spaceItems={{ default: 'spaceItemsXs' }}>
              <FlexItem>
                <RhUiLockFillIcon />
              </FlexItem>
              <FlexItem>{getConfiguredString(catalogItem, t)}</FlexItem>
              <FlexItem>
                <FieldSeparator />
              </FlexItem>
              <FlexItem>{t('Admin-managed')}</FlexItem>
            </Flex>
          </FlexItem>
          {!isWizardMode ? (
            <FlexItem>
              <CatalogItemLaunchButton
                isDisabled={!catalogItem.published}
                className="pf-v6-u-w-100"
                catalogItem={catalogItem}
              />
            </FlexItem>
          ) : null}
        </Flex>
      </CardFooter>
    );
  }

  return (
    <CardFooter>
      <Content component="small" className="pf-v6-u-color-text-subtle">
        {role === 'admin' ? (
          catalogItem.metadata?.tenant?.length ? (
            <CatalogItemTenant catalogItem={catalogItem} tenants={tenants} />
          ) : (
            '-'
          )
        ) : (
          <Flex flexWrap={{ default: 'nowrap' }} spaceItems={{ default: 'spaceItemsXs' }}>
            <FlexItem>{catalogItem.metadata?.creator || '-'}</FlexItem>
            <FlexItem>
              <FieldSeparator />
            </FlexItem>
            <FlexItem>
              <Timestamp value={catalogItem.metadata?.creationTimestamp} format="Date" />
            </FlexItem>
          </Flex>
        )}
      </Content>
    </CardFooter>
  );
};

export default CatalogItemCardFooter;
