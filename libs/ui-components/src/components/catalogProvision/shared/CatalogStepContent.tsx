import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Content,
  Flex,
  FlexItem,
  Gallery,
  GalleryItem,
  SearchInput,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { useField } from 'formik';

import { useTranslation } from '../../../hooks/useTranslation';
import CatalogItemCard from '../../catalog/CatalogItemCard';
import type { CatalogItem } from '../../catalog/catalogItemDisplay';
import { filterCatalogItemsBySearch } from '../../catalog/catalogItemDisplay';

interface CatalogStepContentProps<TItem extends CatalogItem> {
  catalogItems: TItem[];
  error: unknown;
  onRefetch: () => void;
  onSelect: (item: TItem) => void;
}

export const CatalogStepContent = <TItem extends CatalogItem>({
  catalogItems,
  error,
  onRefetch,
  onSelect,
}: CatalogStepContentProps<TItem>) => {
  const [{ value }] = useField<TItem>('catalogItem');
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => filterCatalogItemsBySearch(catalogItems, search),
    [catalogItems, search],
  );

  const count = filtered.length;

  return (
    <Stack hasGutter>
      <StackItem>
        <Flex
          direction={{ default: 'column', md: 'row' }}
          flexWrap={{ default: 'wrap' }}
          alignItems={{ default: 'alignItemsFlexEnd' }}
          gap={{ default: 'gapMd' }}
        >
          <FlexItem flex={{ default: 'flex_1' }}>
            <SearchInput
              placeholder={t('Search catalog items…')}
              value={search}
              onChange={(_event, value) => setSearch(value)}
              onClear={() => setSearch('')}
              aria-label={t('Search catalog items')}
            />
          </FlexItem>
        </Flex>
      </StackItem>
      {!!error && (
        <StackItem>
          <Stack hasGutter>
            <StackItem>
              <Alert variant="danger" title={t('Could not load catalog items')}>
                {t('Unable to load catalog items right now. Please try again.')}
              </Alert>
            </StackItem>
            <StackItem>
              <Button variant="primary" onClick={onRefetch}>
                {t('Retry')}
              </Button>
            </StackItem>
          </Stack>
        </StackItem>
      )}
      <StackItem>
        <Gallery
          hasGutter
          minWidths={{ default: '200px' }}
          role="radiogroup"
          aria-label={t('Catalog item')}
        >
          {!error && count === 0 ? (
            <GalleryItem>
              <Content component="p">
                {t('No catalog items match your search. Try changing keywords.')}
              </Content>
            </GalleryItem>
          ) : null}
          {!error &&
            filtered.map((item) => {
              const selected = value?.id === item.id;
              return (
                <GalleryItem key={item.id}>
                  <CatalogItemCard
                    item={item}
                    ouiaId={`catalog-item-option-${item.id}`}
                    selection={{
                      selected,
                      radioName: 'selectedCatalogItem',
                      onSelect: () => onSelect(item),
                    }}
                  />
                </GalleryItem>
              );
            })}
        </Gallery>
      </StackItem>
    </Stack>
  );
};
