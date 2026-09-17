import { create } from '@bufbuild/protobuf';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  type ComputeInstanceCatalogItem,
  ComputeInstanceTemplateReferenceSchema,
} from '@osac/types';
import { TenantSchema } from '@osac/types/private';

import { CatalogItemListSection } from './CatalogItemListSection';
import { renderWithProviders } from '../../test-utils/TestProviders';

vi.mock('@osac/ui-components/hooks/use-session.tsx', () => ({
  useSession: vi.fn(() => ({ role: 'admin', username: 'test-user', tenantId: 'test-tenant' })),
}));

const vmCatalogItem: ComputeInstanceCatalogItem = {
  $typeName: 'osac.public.v1.ComputeInstanceCatalogItem',
  id: 'catalog-rhel-9',
  metadata: {
    $typeName: 'osac.public.v1.Metadata',
    displayName: '',
    description: '',
    name: 'catalog-rhel-9',
    annotations: {},
    creator: 'foo',
    labels: { env: 'prod' },
    project: 'foo',
    tenant: 'foo',
    version: 1,
  },
  title: 'RHEL 9 catalog',
  description: 'RHEL 9 base image',
  template: create(ComputeInstanceTemplateReferenceSchema, { id: 'tpl-rhel-9' }),
  published: true,
  fieldDefinitions: [
    {
      $typeName: 'osac.public.v1.FieldDefinition',
      path: 'cores',
      displayName: 'vCPU',
      editable: false,
      validationSchema: '',
      default: {
        $typeName: 'google.protobuf.Value',
        kind: { case: 'numberValue', value: 4 },
      },
    },
    {
      $typeName: 'osac.public.v1.FieldDefinition',
      path: 'memory_gib',
      displayName: 'Memory',
      editable: false,
      validationSchema: '',
      default: {
        $typeName: 'google.protobuf.Value',
        kind: { case: 'numberValue', value: 8 },
      },
    },
  ],
  templateParameters: {},
};

const tenants = [create(TenantSchema, { id: 'foo', metadata: { name: 'Foo tenant' } })];

describe('CatalogItemListSection', () => {
  it('renders catalog items as cards in card view', () => {
    renderWithProviders(
      <CatalogItemListSection items={[vmCatalogItem]} tenants={tenants} viewType="cards" />,
    );

    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: vmCatalogItem.metadata?.name,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Virtual Machine')).toBeInTheDocument();
    expect(screen.getByText('4 vCPU')).toBeInTheDocument();
    expect(screen.getByText('8 Memory')).toBeInTheDocument();
    expect(screen.getByText('Foo tenant')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: `Actions for ${vmCatalogItem.metadata?.name}` }),
    ).toBeInTheDocument();
  });

  it('renders a table of catalog items in list view', () => {
    renderWithProviders(
      <CatalogItemListSection items={[vmCatalogItem]} tenants={tenants} viewType="list" />,
    );

    expect(screen.getByRole('grid', { name: 'Catalog items' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Configuration' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Visibility' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Created' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: `Open catalog item details for ${vmCatalogItem.metadata?.name}`,
      }),
    ).not.toBeInTheDocument();

    expect(screen.getByRole('link', { name: vmCatalogItem.metadata?.name })).toHaveAttribute(
      'href',
      `/catalog/vm/${vmCatalogItem.id}`,
    );
    expect(screen.getByText('Virtual Machine')).toBeInTheDocument();
    expect(screen.getByText('4 vCPU')).toBeInTheDocument();
    expect(screen.getByText('8 Memory')).toBeInTheDocument();
    expect(screen.getByText('Foo tenant')).toBeInTheDocument();
    expect(screen.queryByText(/env/)).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: `Actions for ${vmCatalogItem.metadata?.name}` }),
    ).toBeInTheDocument();
  });

  it('returns nothing when there are no items to show', () => {
    renderWithProviders(<CatalogItemListSection items={[]} viewType="cards" />);

    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByText(vmCatalogItem.metadata?.name || 'N/A')).not.toBeInTheDocument();
  });
});
