import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  Content,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Label,
  SearchInput,
  Stack,
  StackItem,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { Tenants } from '@osac/types/private';
import { useListResource } from '@osac/ui-components/api/use-resource';
import { useBareMetalInstanceCatalogItems } from '@osac/ui-components/api/v1/baremetal-instance';
import { useClusterCatalogItems } from '@osac/ui-components/api/v1/cluster-catalog-item';
import { useComputeInstanceCatalogItems } from '@osac/ui-components/api/v1/compute-instance-catalog-item';
import {
  CatalogItem,
  CatalogItemKind,
  filterCatalogItemsByPublished,
  filterCatalogItemsBySearch,
  filterCatalogItemsByTenant,
  isCatalogItemKind,
  isCatalogPublishedFilter,
} from '@osac/ui-components/components/catalog/catalogItemDisplay';
import { CatalogItemListSection } from '@osac/ui-components/components/catalog/CatalogItemListSection';
import CatalogPublishedStatusFilter from '@osac/ui-components/components/catalog/CatalogPublishedStatusFilter';
import CatalogTenantFilter from '@osac/ui-components/components/catalog/CatalogTenantFilter.tsx';
import ListPage from '@osac/ui-components/components/Page/ListPage';
import FieldSeparator from '@osac/ui-components/components/Primitives/FieldSeparator';
import {
  SEARCH_PARAM,
  useArrayPageFilter,
  usePageFilter,
} from '@osac/ui-components/hooks/use-page-filter';
import { useSession } from '@osac/ui-components/hooks/use-session.tsx';
import { useViewType } from '@osac/ui-components/hooks/use-view-switcher.tsx';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

const TYPE_FILTER_PARAM = 'types';
const PUBLISHED_FILTER_PARAM = 'published';
const TENANT_FILTER_PARAM = 'tenant';

const useCatalogItems = () => {
  const vms = useComputeInstanceCatalogItems();
  const clusters = useClusterCatalogItems();
  const bms = useBareMetalInstanceCatalogItems();

  const isLoading = vms.isLoading || clusters.isLoading || bms.isLoading;
  const error = vms.error || clusters.error || bms.error;
  const hasSuccessfulQuery = [vms, clusters, bms].some((query) => !query.isLoading && !query.error);

  return {
    error,
    isLoading,
    hasSuccessfulQuery,
    vms: vms.data,
    clusters: clusters.data,
    bms: bms.data,
  };
};

const CatalogPage = () => {
  const { t } = useTranslation();
  const { role } = useSession();
  const [, setSearchParams] = useSearchParams();
  const [typeFilter, setTypeFilter] = useArrayPageFilter(TYPE_FILTER_PARAM, isCatalogItemKind);
  const [publishedFilterParam, setPublishedFilterParam] = usePageFilter(PUBLISHED_FILTER_PARAM);
  const [tenantFilter, setTenantFilter] = usePageFilter(TENANT_FILTER_PARAM);
  const [searchFilter, setSearchFilter] = usePageFilter(SEARCH_PARAM);
  const [viewType, ViewSwitcher] = useViewType();
  const publishedFilter = isCatalogPublishedFilter(publishedFilterParam)
    ? publishedFilterParam
    : undefined;
  const [filtersChanged, setFiltersChanged] = useState<boolean>(false);
  const isFiltered = publishedFilter || typeFilter?.length || tenantFilter || searchFilter;

  const {
    vms = [],
    bms = [],
    clusters = [],
    isLoading,
    error,
    hasSuccessfulQuery,
  } = useCatalogItems();

  const { data: tenantsResponse } = useListResource(Tenants);
  const tenants = tenantsResponse?.items ?? [];

  useEffect(() => {
    if (typeFilter.length > 0) {
      setFiltersChanged(true);
    }
  }, [typeFilter]);

  const catalogTypeFilters = useMemo<ReadonlyArray<{ value: CatalogItemKind; label: string }>>(
    () => [
      { value: 'bm', label: t('Bare Metal Machines') },
      { value: 'cluster', label: t('Clusters') },
      { value: 'vm', label: t('Virtual Machines') },
    ],
    [t],
  );

  const applyCatalogFilters = (items: CatalogItem[], kind: CatalogItemKind) => {
    if ((typeFilter.length || filtersChanged) && !typeFilter.includes(kind)) {
      return [];
    }
    return filterCatalogItemsBySearch(
      filterCatalogItemsByPublished(
        filterCatalogItemsByTenant(items, tenantFilter),
        publishedFilter,
      ),
      searchFilter,
    );
  };

  const filteredVms = applyCatalogFilters(vms, 'vm');
  const filteredBms = applyCatalogFilters(bms, 'bm');
  const filteredClusters = applyCatalogFilters(clusters, 'cluster');

  const data = [...filteredVms, ...filteredClusters, ...filteredBms];
  const totalItems = vms.length + bms.length + clusters.length;

  const showEmptyState = !isLoading && !error && data.length === 0;

  const pageDescription =
    role === 'admin'
      ? t(
          'Create catalog items from master templates across Bare Metal, Clusters, Models, and Virtual machines, then attach them to tenants.',
        )
      : role === 'tenant-admin'
        ? t("Filter the provider's global catalog down to safe, approved offerings.")
        : t('Browse and provision catalog items available to your tenant.');

  // react-router's setSearchParams does not compose across synchronous calls;
  // each updater receives the render-captured params. Clear every filter in one
  // update so none of them is overwritten.
  const clearAllFilters = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(TYPE_FILTER_PARAM);
        next.delete(PUBLISHED_FILTER_PARAM);
        next.delete(TENANT_FILTER_PARAM);
        next.delete(SEARCH_PARAM);
        return next;
      },
      { replace: true },
    );
    setFiltersChanged(false);
  };

  const renderEmptyState = () => {
    if (totalItems === 0) {
      return (
        <EmptyState titleText={t('No catalog items found')} headingLevel="h2">
          <EmptyStateBody>{t('No catalog items are available yet.')}</EmptyStateBody>
        </EmptyState>
      );
    }

    return (
      <EmptyState titleText={t('No catalog items match your filters')} headingLevel="h2">
        <EmptyStateBody>
          {t('Try a different service, publish status, tenant, or search term.')}{' '}
          <Button variant="link" isInline onClick={clearAllFilters}>
            {t('Clear all filters')}
          </Button>
        </EmptyStateBody>
      </EmptyState>
    );
  };

  return (
    <ListPage label={t('Global marketplace')} title={t('Catalog')} description={pageDescription}>
      <Stack hasGutter>
        <StackItem>
          <Toolbar>
            <ToolbarContent rowWrap={{ default: 'nowrap' }}>
              <ToolbarGroup>
                <ToolbarItem>
                  <ToggleGroup aria-label={t('Filter catalog by resource type')}>
                    {catalogTypeFilters.map((option) => {
                      let count = 0;
                      switch (option.value) {
                        case 'vm':
                          count = vms.length;
                          break;
                        case 'bm':
                          count = bms.length;
                          break;
                        case 'cluster':
                          count = clusters.length;
                          break;
                      }

                      return (
                        <ToggleGroupItem
                          key={option.value}
                          text={
                            <Flex
                              spaceItems={{ default: 'spaceItemsSm' }}
                              flexWrap={{ default: 'nowrap' }}
                            >
                              <FlexItem>{option.label}</FlexItem>
                              <FlexItem>
                                <Label isCompact>{count}</Label>
                              </FlexItem>
                            </Flex>
                          }
                          buttonId={`catalog-type-filter-${option.value}`}
                          isSelected={typeFilter.includes(option.value)}
                          onChange={() => setTypeFilter(option.value)}
                        />
                      );
                    })}
                  </ToggleGroup>
                </ToolbarItem>
                {role === 'admin' || role === 'tenant-admin' ? (
                  <ToolbarItem>
                    <CatalogPublishedStatusFilter
                      selected={publishedFilter}
                      onChange={(value) => setPublishedFilterParam(value ?? '')}
                    />
                  </ToolbarItem>
                ) : null}
                {role === 'admin' ? (
                  <ToolbarItem>
                    <CatalogTenantFilter
                      selected={tenantFilter}
                      onChange={(value) => setTenantFilter(value ?? '')}
                      tenants={tenants}
                    />
                  </ToolbarItem>
                ) : null}
                <ToolbarItem>
                  <SearchInput
                    placeholder={t('Search catalog items')}
                    value={searchFilter}
                    onChange={(_event, value) => setSearchFilter(value)}
                    onClear={() => setSearchFilter('')}
                    aria-label={t('Filter catalog by keyword')}
                    isDisabled={isLoading || !hasSuccessfulQuery}
                  />
                </ToolbarItem>
              </ToolbarGroup>
              <ToolbarGroup align={{ default: 'alignEnd' }}>
                <ToolbarItem>{ViewSwitcher}</ToolbarItem>
              </ToolbarGroup>
            </ToolbarContent>
          </Toolbar>
        </StackItem>
        {showEmptyState ? (
          <StackItem>{renderEmptyState()}</StackItem>
        ) : (
          <>
            <StackItem>
              <Flex gap={{ default: 'gapXs' }}>
                <FlexItem>
                  <Content className="pf-v6-u-font-weight-bold">
                    {data.length === totalItems
                      ? t('{{count}} catalog item', { count: totalItems })
                      : t('{{shown}} of {{count}} catalog item', {
                          shown: data.length,
                          count: totalItems,
                        })}
                  </Content>
                </FlexItem>
                {isFiltered ? (
                  <>
                    <FlexItem>
                      <FieldSeparator />
                    </FlexItem>
                    <FlexItem>
                      <Button variant="link" isInline onClick={clearAllFilters}>
                        {t('Clear all filters')}
                      </Button>
                    </FlexItem>
                  </>
                ) : null}
              </Flex>
            </StackItem>
            <StackItem>
              <CatalogItemListSection
                items={data}
                tenants={tenants}
                viewType={viewType}
                isLoading={isLoading}
                error={error}
              />
            </StackItem>
          </>
        )}
      </Stack>
    </ListPage>
  );
};

export default CatalogPage;
