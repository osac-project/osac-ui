import { FC } from 'react';
import { Flex, FlexItem, Icon } from '@patternfly/react-core';
import BuildingIcon from '@patternfly/react-icons/dist/esm/icons/building-icon';
import GlobeAmericasIcon from '@patternfly/react-icons/dist/esm/icons/globe-americas-icon';

import { type Tenant } from '@osac/types/private';
import {
  CatalogItem,
  GLOBAL_TENANT_VALUE,
} from '@osac/ui-components/components/catalog/catalogItemDisplay';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

interface CatalogItemTenantProps {
  catalogItem: CatalogItem;
  tenants: Tenant[];
}
const CatalogItemTenant: FC<CatalogItemTenantProps> = ({ catalogItem, tenants = [] }) => {
  const { t } = useTranslation();

  if (!catalogItem.metadata) {
    return null;
  }
  const tenantName = tenants.find((tenant) => tenant.id === catalogItem.metadata?.tenant)?.metadata
    ?.name;

  return (
    <Flex flexWrap={{ default: 'nowrap' }} gap={{ default: 'gapXs' }}>
      <FlexItem>
        <Icon>
          {catalogItem.metadata.tenant === GLOBAL_TENANT_VALUE ? (
            <GlobeAmericasIcon />
          ) : (
            <BuildingIcon />
          )}
        </Icon>
      </FlexItem>
      <FlexItem>
        {catalogItem.metadata.tenant === GLOBAL_TENANT_VALUE
          ? t('Global public')
          : tenantName || catalogItem.metadata?.tenant || '-'}
      </FlexItem>
    </Flex>
  );
};

export default CatalogItemTenant;
