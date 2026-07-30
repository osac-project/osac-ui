import {
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Label,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import { CatalogFieldEditabilityLabel } from './CatalogFieldEditabilityLabel';
import {
  type CatalogItem,
  catalogItemMetadataLabelEntries,
  formatCatalogFieldDefault,
} from './catalogItemDisplay';
import { useTranslation } from '../../hooks/useTranslation';
import { SubtleContent } from '../SubtleContent/SubtleContent';

interface CatalogItemDetailContentProps {
  item: CatalogItem;
}

export const CatalogItemDetailContent = ({ item }: CatalogItemDetailContentProps) => {
  const { t } = useTranslation();
  const metadataLabels = catalogItemMetadataLabelEntries(item);
  const fieldDefinitions = item.fieldDefinitions;

  return (
    <Stack className="catalog-item-detail-content">
      <StackItem>
        <DescriptionList isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>Catalog name</DescriptionListTerm>
            <DescriptionListDescription>{item.metadata?.name ?? '—'}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </StackItem>

      {item.description?.trim() ? (
        <StackItem>
          <Title headingLevel="h3" size="md" className="catalog-item-detail-content__section-title">
            Description
          </Title>
          <Content component="p">{item.description}</Content>
        </StackItem>
      ) : null}

      {metadataLabels.length > 0 ? (
        <StackItem>
          <Title headingLevel="h3" size="md" className="catalog-item-detail-content__section-title">
            Labels
          </Title>
          <Flex flexWrap={{ default: 'wrap' }} gap={{ default: 'gapSm' }}>
            {metadataLabels.map(({ key, value }) => (
              <FlexItem key={`${item.id}-detail-label-${key}`}>
                <Label variant="outline" color="grey" isCompact>
                  <span className="catalog-item-detail-content__label-key">{key}</span>
                  {': '}
                  {value}
                </Label>
              </FlexItem>
            ))}
          </Flex>
        </StackItem>
      ) : null}

      {fieldDefinitions.length > 0 ? (
        <StackItem>
          <Stack hasGutter={false}>
            <StackItem>
              <Title
                headingLevel="h3"
                size="md"
                className="catalog-item-detail-content__section-title"
              >
                {t('Configuration defaults')}
              </Title>
            </StackItem>
            <StackItem>
              <SubtleContent component="p">
                {t(
                  'Editable fields can be changed when creating from this catalog item. Fixed fields use the default value shown.',
                )}
              </SubtleContent>
            </StackItem>
          </Stack>
          <DescriptionList isCompact className="pf-v6-u-mt-sm">
            {fieldDefinitions.map((def) => (
              <DescriptionListGroup key={def.path}>
                <DescriptionListTerm>
                  <Flex
                    alignItems={{ default: 'alignItemsCenter' }}
                    gap={{ default: 'gapSm' }}
                    flexWrap={{ default: 'wrap' }}
                  >
                    <FlexItem>{def.displayName}</FlexItem>
                    <FlexItem>
                      <CatalogFieldEditabilityLabel editable={def.editable} />
                    </FlexItem>
                  </Flex>
                </DescriptionListTerm>
                <DescriptionListDescription>
                  {formatCatalogFieldDefault(def)}
                </DescriptionListDescription>
              </DescriptionListGroup>
            ))}
          </DescriptionList>
        </StackItem>
      ) : null}
    </Stack>
  );
};
