import { describe, expect, it } from 'vitest';

import type {
  BareMetalInstanceCatalogItem,
  ClusterCatalogItem,
  ComputeInstanceCatalogItem,
} from '@osac/types';

import {
  catalogItemDetailsPath,
  catalogItemResourceLine,
  catalogItemResourceParts,
  filterCatalogItemsByPublished,
  filterCatalogItemsBySearch,
} from './catalogItemDisplay';
import {
  catalogItemFieldDefinitions,
  readCatalogItemFieldDefinitions,
} from '../catalogProvision/catalogFieldDefinition';

describe('readCatalogItemFieldDefinitions', () => {
  it('reads snake_case field_definitions from wire JSON', () => {
    const wireItem = {
      id: 'catalog-1',
      field_definitions: [
        {
          path: 'cores',
          display_name: 'vCPUs',
          editable: true,
          default: { number_value: 4 },
          validation_schema: '{"type":"integer","minimum":2}',
        },
      ],
      templateParameters: {},
    };

    expect(readCatalogItemFieldDefinitions(wireItem)).toHaveLength(1);
    expect(catalogItemFieldDefinitions(wireItem)).toEqual([
      {
        path: 'cores',
        displayName: 'vCPUs',
        editable: true,
        default: 4,
        validationSchema: { type: 'integer', minimum: 2 },
      },
    ]);
  });

  it('parses post-decode protobuf Value defaults without mutating the catalog item', () => {
    const decodedItem = {
      id: 'catalog-1',
      fieldDefinitions: [
        {
          path: 'cores',
          displayName: 'vCPUs',
          editable: true,
          default: { kind: { case: 'numberValue', value: 4 } },
        },
      ],
      templateParameters: {},
    };

    expect(catalogItemFieldDefinitions(decodedItem)).toEqual([
      {
        path: 'cores',
        displayName: 'vCPUs',
        editable: true,
        default: 4,
      },
    ]);
    expect(decodedItem.fieldDefinitions[0]?.default).toEqual({
      kind: { case: 'numberValue', value: 4 },
    });
  });
});

describe('catalog display with wire field_definitions', () => {
  it('renders resource summary from wire catalog item JSON', () => {
    const wireItem: ClusterCatalogItem = {
      $typeName: 'osac.public.v1.ClusterCatalogItem',
      id: 'catalog-1',
      title: 'Workload VM',
      description: '',
      published: true,
      template: undefined,
      fieldDefinitions: [
        {
          $typeName: 'osac.public.v1.FieldDefinition',
          path: 'cores',
          displayName: 'vCPUs',
          editable: true,
          default: {
            $typeName: 'google.protobuf.Value',
            kind: {
              case: 'numberValue',
              value: 4,
            },
          },
          validationSchema: '',
        },
        {
          $typeName: 'osac.public.v1.FieldDefinition',
          path: 'memory_gib',
          displayName: 'RAM (GiB)',
          editable: true,
          default: {
            $typeName: 'google.protobuf.Value',
            kind: {
              case: 'numberValue',
              value: 8,
            },
          },
          validationSchema: '',
        },
        {
          $typeName: 'osac.public.v1.FieldDefinition',
          path: 'boot_disk.size_gib',
          displayName: 'Boot disk (GiB)',
          editable: true,
          default: {
            $typeName: 'google.protobuf.Value',
            kind: {
              case: 'numberValue',
              value: 40,
            },
          },
          validationSchema: '',
        },
      ],
      templateParameters: {},
    };

    expect(catalogItemResourceParts(wireItem)).toEqual([
      '4 vCPUs',
      '8 RAM (GiB)',
      '40 Boot disk (GiB)',
    ]);
    expect(catalogItemResourceLine(wireItem)).toBe('4 vCPUs · 8 RAM (GiB) · 40 Boot disk (GiB)');
  });

  it('renders node set resource summary from cluster catalog item JSON', () => {
    const wireItem: ClusterCatalogItem = {
      $typeName: 'osac.public.v1.ClusterCatalogItem',
      id: '019ecb6a-6cad-7905-b086-a043c388fa60',
      title: 'Development Cluster',
      description: '',
      published: true,
      template: undefined,
      fieldDefinitions: [
        {
          $typeName: 'osac.public.v1.FieldDefinition',
          path: 'node_sets.fc430.host_type',
          displayName: 'Host Type',
          editable: true,
          default: {
            $typeName: 'google.protobuf.Value',
            kind: {
              case: 'stringValue',
              value: 'fc430',
            },
          },
          validationSchema: '',
        },
        {
          $typeName: 'osac.public.v1.FieldDefinition',
          path: 'node_sets.fc430.size',
          displayName: 'Worker Count',
          editable: true,
          default: {
            $typeName: 'google.protobuf.Value',
            kind: {
              case: 'numberValue',
              value: 2,
            },
          },
          validationSchema: '',
        },
        {
          $typeName: 'osac.public.v1.FieldDefinition',
          path: 'version',
          displayName: 'Version',
          editable: true,
          default: {
            $typeName: 'google.protobuf.Value',
            kind: {
              case: 'stringValue',
              value: '4.17.0',
            },
          },
          validationSchema: '',
        },
      ],
      templateParameters: {},
    };

    expect(catalogItemResourceParts(wireItem)).toEqual(['fc430 Host Type', '2 Worker Count']);
    expect(catalogItemResourceLine(wireItem)).toBe('fc430 Host Type · 2 Worker Count');
  });
});

describe('filterCatalogItemsBySearch', () => {
  const items: ClusterCatalogItem[] = [
    {
      $typeName: 'osac.public.v1.ClusterCatalogItem',
      id: '1',
      title: 'Alpha VM',
      description: 'For testing',
      fieldDefinitions: [],
      templateParameters: {},
      published: true,
      template: undefined,
      metadata: {
        $typeName: 'osac.public.v1.Metadata',
        displayName: '',
        description: '',
        name: 'alpha-vm',
        creator: '',
        annotations: {},
        labels: {},
        project: '',
        tenant: '',
        version: 1,
      },
    },
    {
      $typeName: 'osac.public.v1.ClusterCatalogItem',
      id: '2',
      title: 'Beta Cluster',
      description: 'Production workload',
      fieldDefinitions: [],
      templateParameters: {},
      published: true,
      template: undefined,
      metadata: {
        $typeName: 'osac.public.v1.Metadata',
        displayName: '',
        description: '',
        name: 'beta-cluster',
        creator: '',
        annotations: {},
        labels: {},
        project: '',
        tenant: '',
        version: 1,
      },
    },
  ];

  it('returns all items when search is empty or whitespace', () => {
    expect(filterCatalogItemsBySearch(items, '')).toEqual(items);
    expect(filterCatalogItemsBySearch(items, '   ')).toEqual(items);
  });

  it('filters case-insensitively across name and description', () => {
    expect(filterCatalogItemsBySearch(items, 'alpha')).toEqual([items[0]]);
    expect(filterCatalogItemsBySearch(items, 'PRODUCTION')).toEqual([items[1]]);
  });
});

describe('filterCatalogItemsByPublished', () => {
  const items: ClusterCatalogItem[] = [
    {
      $typeName: 'osac.public.v1.ClusterCatalogItem',
      id: '1',
      title: 'Live cluster',
      description: 'Published offering',
      fieldDefinitions: [],
      templateParameters: {},
      published: true,
      template: undefined,
    },
    {
      $typeName: 'osac.public.v1.ClusterCatalogItem',
      id: '2',
      title: 'Draft cluster',
      description: 'Unpublished offering',
      fieldDefinitions: [],
      templateParameters: {},
      published: false,
      template: undefined,
    },
  ];

  it('returns all items when no publication filter is selected', () => {
    expect(filterCatalogItemsByPublished(items, undefined)).toEqual(items);
  });

  it('returns only published items when the published filter is selected', () => {
    expect(filterCatalogItemsByPublished(items, 'published')).toEqual([items[0]]);
  });

  it('returns only unpublished items when the unpublished filter is selected', () => {
    expect(filterCatalogItemsByPublished(items, 'unpublished')).toEqual([items[1]]);
  });
});

describe('catalogItemDetailsPath', () => {
  it('builds the details path for each catalog item type', () => {
    expect(
      catalogItemDetailsPath({
        $typeName: 'osac.public.v1.ComputeInstanceCatalogItem',
        id: 'vm-1',
      } as ComputeInstanceCatalogItem),
    ).toBe('/catalog/vm/vm-1');
    expect(
      catalogItemDetailsPath({
        $typeName: 'osac.public.v1.BareMetalInstanceCatalogItem',
        id: 'bm-1',
      } as BareMetalInstanceCatalogItem),
    ).toBe('/catalog/bm/bm-1');
    expect(
      catalogItemDetailsPath({
        $typeName: 'osac.public.v1.ClusterCatalogItem',
        id: 'cluster-1',
      } as ClusterCatalogItem),
    ).toBe('/catalog/cluster/cluster-1');
  });
});
