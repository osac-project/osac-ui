import { FC } from 'react';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Label,
} from '@patternfly/react-core';

import {
  CatalogItem,
  catalogItemResourceFieldDefinitions,
  formatCatalogResourcePart,
} from '@osac/ui-components/components/catalog/catalogItemDisplay';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

interface CatalogItemResourcesProps {
  catalogItem: CatalogItem;
}

const CatalogItemResources: FC<CatalogItemResourcesProps> = ({ catalogItem }) => {
  const { t } = useTranslation();
  const resources = catalogItemResourceFieldDefinitions(catalogItem);

  return (
    <DescriptionList isHorizontal isCompact>
      {resources.map((resource) => (
        <DescriptionListGroup key={resource.path}>
          <DescriptionListTerm>{resource.displayName}</DescriptionListTerm>
          <DescriptionListDescription>
            <Flex flexWrap={{ default: 'nowrap' }} gap={{ default: 'gapXs' }}>
              <FlexItem>{formatCatalogResourcePart(resource)}</FlexItem>
              <FlexItem>
                {resource.editable ? (
                  <Label color="purple" isCompact>
                    {t('Editable')}
                  </Label>
                ) : (
                  <Label isCompact>{t('Locked')}</Label>
                )}
              </FlexItem>
            </Flex>
          </DescriptionListDescription>
        </DescriptionListGroup>
      ))}
    </DescriptionList>
  );
};

export default CatalogItemResources;
