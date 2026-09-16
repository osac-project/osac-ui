import {
  Bullseye,
  Gallery,
  GalleryItem,
  Spinner,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import { type Tenant } from '@osac/types/private';
import { ViewType } from '@osac/ui-components/hooks/use-view-switcher';

import CatalogItemCard from './CatalogItemCard';
import { type CatalogItem } from './catalogItemDisplay';
import CatalogItemTable from './CatalogItemTable';
import { getErrorMessage } from '../../utils/error';
import QueryErrorState from '../Resource/QueryErrorState';

interface CatalogItemListSectionProps {
  title?: string;
  items: CatalogItem[];
  tenants?: Tenant[];
  viewType: ViewType;
  isLoading?: boolean;
  error?: unknown;
}

export const CatalogItemListSection = ({
  title,
  items,
  tenants = [],
  viewType,
  isLoading = false,
  error = null,
}: CatalogItemListSectionProps) => {
  if (!isLoading && !error && items.length === 0) {
    return null;
  }

  return (
    <Stack hasGutter>
      {title ? (
        <StackItem>
          <Title headingLevel="h2" size="lg">
            {title}
          </Title>
        </StackItem>
      ) : null}
      {isLoading ? (
        <StackItem>
          <Bullseye>
            <Spinner aria-label={`Loading ${title ?? ''}`} />
          </Bullseye>
        </StackItem>
      ) : null}
      {error ? (
        <StackItem>
          <QueryErrorState error={error} title={title} body={getErrorMessage(error)} />
        </StackItem>
      ) : null}
      {items.length > 0 ? (
        <StackItem>
          {viewType === 'cards' ? (
            <Gallery hasGutter minWidths={{ default: '400px' }} maxWidths={{ default: '400px' }}>
              {items.map((item) => (
                <GalleryItem key={item.id}>
                  <CatalogItemCard item={item} tenants={tenants} />
                </GalleryItem>
              ))}
            </Gallery>
          ) : (
            <CatalogItemTable items={items} tenants={tenants} />
          )}
        </StackItem>
      ) : null}
    </Stack>
  );
};
