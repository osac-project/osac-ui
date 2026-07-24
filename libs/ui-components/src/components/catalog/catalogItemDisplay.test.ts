import { describe, expect, it } from 'vitest';

import { ClusterCatalogItem } from '@osac/types';
import type { ClusterCatalogItem as PrivateClusterCatalogItem } from '@osac/types/private';

import {
  SHARED_TENANT,
  catalogItemScope,
  catalogItemSubtitle,
  filterCatalogItemsBySearch,
} from './catalogItemDisplay';

describe('filterCatalogItemsBySearch', () => {
  const items: ClusterCatalogItem[] = [
    {
      $typeName: 'osac.public.v1.ClusterCatalogItem',
      id: '1',
      title: 'Alpha VM',
      description: 'For testing',
      fieldDefinitions: [],
      published: true,
      template: '',
    },
    {
      $typeName: 'osac.public.v1.ClusterCatalogItem',
      id: '2',
      title: 'Beta Cluster',
      description: 'Production workload',
      fieldDefinitions: [],
      published: true,
      template: '',
    },
  ];

  it('returns all items when search is empty or whitespace', () => {
    expect(filterCatalogItemsBySearch(items, '')).toEqual(items);
    expect(filterCatalogItemsBySearch(items, '   ')).toEqual(items);
  });

  it('filters case-insensitively across title and description', () => {
    expect(filterCatalogItemsBySearch(items, 'alpha')).toEqual([items[0]]);
    expect(filterCatalogItemsBySearch(items, 'PRODUCTION')).toEqual([items[1]]);
  });
});

const basePrivateMetadata = (): NonNullable<PrivateClusterCatalogItem['metadata']> => ({
  $typeName: 'osac.private.v1.Metadata',
  finalizers: [],
  creator: 'admin',
  tenant: '',
  name: 'catalog-item',
  labels: {},
  annotations: {},
  version: 1,
  project: '',
});

const privateClusterItem = (
  overrides: Partial<PrivateClusterCatalogItem> = {},
): PrivateClusterCatalogItem => ({
  $typeName: 'osac.private.v1.ClusterCatalogItem',
  id: 'catalog-cluster-1',
  metadata: basePrivateMetadata(),
  title: 'OpenShift 4 cluster',
  description: 'Standard OpenShift cluster offering',
  template: 'tpl-openshift-4',
  published: true,
  tenant: '',
  fieldDefinitions: [],
  ...overrides,
});

const publicVmItemWithMetadata = (tenant: string, project = '') => ({
  $typeName: 'osac.public.v1.ComputeInstanceCatalogItem' as const,
  id: 'catalog-rhel-9',
  metadata: {
    $typeName: 'osac.public.v1.Metadata' as const,
    name: 'catalog-rhel-9',
    annotations: {},
    creator: 'foo',
    labels: {},
    project,
    tenant,
    version: 1,
  },
  title: 'RHEL 9 catalog',
  description: 'RHEL 9 base image',
  template: 'tpl-rhel-9',
  published: true,
  fieldDefinitions: [],
});

describe('catalogItemScope', () => {
  it('returns general for a CSP Admin item with no private tenant', () => {
    const item = privateClusterItem({ tenant: '' });
    expect(catalogItemScope(item, 'providerAdmin')).toEqual({ level: 'general' });
  });

  it('returns general for the providerAdmin role given a public-shaped item lacking a tenant field', () => {
    const item = publicVmItemWithMetadata('acme-corp');
    expect(catalogItemScope(item, 'providerAdmin')).toEqual({ level: 'general' });
  });

  it('returns organization with the tenant name for a CSP Admin item scoped to a tenant', () => {
    const item = privateClusterItem({ tenant: 'acme-corp' });
    expect(catalogItemScope(item, 'providerAdmin')).toEqual({
      level: 'organization',
      name: 'acme-corp',
    });
  });

  it('returns project for a CSP Admin item even when the private tenant is also set', () => {
    const item = privateClusterItem({
      tenant: 'acme-corp',
      metadata: { ...basePrivateMetadata(), project: 'frontend' },
    });
    expect(catalogItemScope(item, 'providerAdmin')).toEqual({
      level: 'project',
      name: 'frontend',
    });
  });

  it('returns general for a Tenant Admin item whose metadata.tenant is the shared sentinel', () => {
    const item = publicVmItemWithMetadata(SHARED_TENANT);
    expect(catalogItemScope(item, 'tenantAdmin')).toEqual({ level: 'general' });
  });

  it('returns general for a Tenant Admin item whose metadata.tenant is empty', () => {
    const item = publicVmItemWithMetadata('');
    expect(catalogItemScope(item, 'tenantAdmin')).toEqual({ level: 'general' });
  });

  it('returns organization for a Tenant Admin item whose metadata.tenant is not the shared sentinel', () => {
    const item = publicVmItemWithMetadata('acme-corp');
    expect(catalogItemScope(item, 'tenantAdmin')).toEqual({ level: 'organization' });
  });

  it('returns project for a Tenant Admin item with a project set, regardless of metadata.tenant', () => {
    const item = publicVmItemWithMetadata(SHARED_TENANT, 'frontend');
    expect(catalogItemScope(item, 'tenantAdmin')).toEqual({ level: 'project', name: 'frontend' });
  });
});

describe('existing display helpers with private-v1 items', () => {
  it('catalogItemSubtitle falls back to metadata.name when description is empty', () => {
    const item = privateClusterItem({ description: '' });
    expect(catalogItemSubtitle(item)).toBe('catalog-item');
  });

  it('catalogItemSubtitle uses the description when present', () => {
    const item = privateClusterItem();
    expect(catalogItemSubtitle(item)).toBe('Standard OpenShift cluster offering');
  });

  it('filterCatalogItemsBySearch matches a private-v1 item by title', () => {
    const item = privateClusterItem();
    expect(filterCatalogItemsBySearch([item], 'openshift')).toEqual([item]);
    expect(filterCatalogItemsBySearch([item], 'no-such-term')).toEqual([]);
  });
});
