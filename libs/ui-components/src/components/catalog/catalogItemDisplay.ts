import type {
  BareMetalInstanceCatalogItem,
  ClusterCatalogItem,
  ComputeInstanceCatalogItem,
  FieldDefinition,
} from '@osac/types';
import type {
  BareMetalInstanceCatalogItem as PrivateBareMetalInstanceCatalogItem,
  ClusterCatalogItem as PrivateClusterCatalogItem,
  ComputeInstanceCatalogItem as PrivateComputeInstanceCatalogItem,
} from '@osac/types/private';

import type { DemoShellRole } from '../../shellTypes';

export type CatalogItem =
  | ClusterCatalogItem
  | BareMetalInstanceCatalogItem
  | ComputeInstanceCatalogItem
  | PrivateClusterCatalogItem
  | PrivateBareMetalInstanceCatalogItem
  | PrivateComputeInstanceCatalogItem;

type PrivateCatalogItem =
  | PrivateClusterCatalogItem
  | PrivateBareMetalInstanceCatalogItem
  | PrivateComputeInstanceCatalogItem;

export type CatalogItemKind = 'vm' | 'cluster' | 'bm';

export const catalogItemSubtitle = (item: CatalogItem): string => {
  const description = item.description?.trim();
  if (description) {
    return description.length <= 120 ? description : `${description.slice(0, 119)}…`;
  }
  return item.metadata?.name ?? item.id;
};

export const catalogItemMetadataLabelEntries = (
  item: CatalogItem,
): Array<{ key: string; value: string }> => {
  const labels = item.metadata?.labels;
  if (!labels) {
    return [];
  }
  return Object.entries(labels)
    .map(([key, value]) => ({ key, value: value.trim() }))
    .filter(({ value }) => value.length > 0)
    .sort((a, b) => a.key.localeCompare(b.key));
};

const searchableCatalogItemText = (item: CatalogItem): string => {
  const labels = item.metadata?.labels ?? {};
  return [
    item.title,
    item.description,
    item.metadata?.name,
    ...Object.entries(labels).map(([key, value]) => `${key} ${value}`),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

export const filterCatalogItemsBySearch = <TItem extends CatalogItem>(
  items: TItem[],
  search: string,
): TItem[] => {
  const searchTerm = search.trim().toLowerCase();
  if (!searchTerm) {
    return items;
  }

  return items.filter((item) => searchableCatalogItemText(item).includes(searchTerm));
};

export type PublicationFilter = 'all' | 'published' | 'unpublished';

export const matchesPublicationFilter = (item: CatalogItem, filter: PublicationFilter): boolean => {
  if (filter === 'published') {
    return item.published;
  }
  if (filter === 'unpublished') {
    return !item.published;
  }
  return true;
};

export const formatCatalogFieldDefault = (
  def: Pick<FieldDefinition, 'default'>,
): React.ReactNode => {
  if (!def.default) {
    return '-';
  }

  switch (def.default.kind.case) {
    case 'numberValue':
      return def.default.kind.value;
    case 'stringValue':
      return def.default.kind.value;
    default:
      return '-';
  }
};

/**
 * fulfillment-service's built-in global tenant. Every object without an explicit tenant is
 * auto-assigned this value server-side, and it round-trips unmasked through the public API's
 * `metadata.tenant` field even though the business `tenant` field is stripped from public catalog
 * item responses entirely.
 */
export const SHARED_TENANT = 'shared';

export type CatalogItemScope =
  | { level: 'general' }
  | { level: 'organization'; name?: string }
  | { level: 'project'; name: string };

const isPrivateCatalogItem = (item: CatalogItem): item is PrivateCatalogItem =>
  item.$typeName.startsWith('osac.private.');

export const catalogItemScope = (item: CatalogItem, role: DemoShellRole): CatalogItemScope => {
  const project = item.metadata?.project ?? '';
  if (project) {
    return { level: 'project', name: project };
  }
  if (role === 'providerAdmin') {
    const tenant = isPrivateCatalogItem(item) ? item.tenant : '';
    return tenant ? { level: 'organization', name: tenant } : { level: 'general' };
  }
  const metadataTenant = item.metadata?.tenant ?? '';
  return metadataTenant === SHARED_TENANT || !metadataTenant
    ? { level: 'general' }
    : { level: 'organization' };
};
