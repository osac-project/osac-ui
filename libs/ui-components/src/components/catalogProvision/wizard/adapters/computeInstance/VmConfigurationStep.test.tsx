import { create } from '@bufbuild/protobuf';
import { Code, ConnectError } from '@connectrpc/connect';
import { screen, waitFor } from '@testing-library/react';
import { Formik } from 'formik';
import { describe, expect, it } from 'vitest';

import {
  Architecture,
  type ComputeInstanceCatalogItem,
  ComputeInstanceTemplateReferenceSchema,
  DiskImageLifecycle,
  DiskImageSchema,
} from '@osac/types';

import { createEmptyComputeInstanceValues } from './payload';
import { VmConfigurationStep } from './VmConfigurationStep';
import { renderWithProviders } from '../../../../../test-utils/TestProviders';

const makeDiskImage = (
  id: string,
  name: string,
  lifecycle = DiskImageLifecycle.AVAILABLE,
  arch: Architecture[] = [Architecture.AMD64],
) =>
  create(DiskImageSchema, {
    id,
    metadata: { name, annotations: {}, labels: {} },
    spec: { lifecycle, architecture: arch },
  });

const makeCatalogItem = (): ComputeInstanceCatalogItem =>
  ({
    $typeName: 'osac.public.v1.ComputeInstanceCatalogItem',
    id: 'catalog-rhel-9',
    metadata: {
      $typeName: 'osac.public.v1.Metadata',
      name: 'catalog-rhel-9',
      annotations: {},
      labels: {},
    },
    title: 'RHEL 9 catalog',
    description: 'RHEL 9 base image',
    template: create(ComputeInstanceTemplateReferenceSchema, { id: 'tpl-rhel-9' }),
    published: true,
    fieldDefinitions: [],
  }) as unknown as ComputeInstanceCatalogItem;

const renderStep = (diskImages = [makeDiskImage('di-1', 'rhel9')]) =>
  renderWithProviders(
    <Formik initialValues={createEmptyComputeInstanceValues()} onSubmit={() => undefined}>
      <VmConfigurationStep catalogItem={makeCatalogItem()} />
    </Formik>,
    {
      apiFixtures: {
        diskImages,
        instanceTypes: [],
      },
    },
  );

describe('VmConfigurationStep', () => {
  it('renders a disk image select field', async () => {
    renderStep();
    await waitFor(() => {
      expect(screen.getByLabelText(/Disk image/)).toBeInTheDocument();
    });
  });

  it('shows disk image options once loaded', async () => {
    renderStep([makeDiskImage('di-1', 'rhel9'), makeDiskImage('di-2', 'ubuntu24')]);

    await waitFor(() => {
      expect(screen.getByLabelText(/Disk image/)).not.toBeDisabled();
    });

    const toggle = screen.getByLabelText(/Disk image/);
    toggle.click();

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /rhel9/ })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /ubuntu24/ })).toBeInTheDocument();
    });
  });

  it('does not clear the selected disk image when the list request fails', async () => {
    const values = createEmptyComputeInstanceValues();
    values.spec.diskImage = { id: 'di-1', name: '' };
    const seen: string[] = [];

    renderWithProviders(
      <Formik initialValues={values} onSubmit={() => undefined}>
        {({ values: formValues }) => {
          seen.push(formValues.spec.diskImage.id);
          return <VmConfigurationStep catalogItem={makeCatalogItem()} />;
        }}
      </Formik>,
      {
        transportOverrides: {
          onDiskImageList: () => {
            throw new ConnectError('disk image service unavailable', Code.Unavailable);
          },
        },
      },
    );

    await waitFor(() => {
      expect(screen.getByText(/Could not load disk images/)).toBeInTheDocument();
    });
    expect(seen.at(-1)).toBe('di-1');
    expect(screen.queryByText(/No disk images are available/)).not.toBeInTheDocument();
  });

  it('renders empty state without a create link when no disk images are available', async () => {
    renderStep([]);

    await waitFor(() => {
      expect(screen.getByText(/No disk images are available/)).toBeInTheDocument();
    });
    expect(screen.queryByRole('link', { name: /Go to Disk Images/ })).not.toBeInTheDocument();
  });

  it('appends (deprecated) suffix to deprecated disk image label', async () => {
    renderStep([makeDiskImage('di-1', 'old-rhel8', DiskImageLifecycle.DEPRECATED)]);

    await waitFor(() => {
      expect(screen.getByLabelText(/Disk image/)).not.toBeDisabled();
    });

    const toggle = screen.getByLabelText(/Disk image/);
    toggle.click();

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /old-rhel8.*deprecated/ })).toBeInTheDocument();
    });
  });

  it('shows a deprecation warning when a deprecated image is auto-selected', async () => {
    renderStep([makeDiskImage('di-1', 'old-rhel8', DiskImageLifecycle.DEPRECATED)]);

    await waitFor(() => {
      expect(screen.getByText(/deprecated and may be removed/)).toBeInTheDocument();
    });
  });

  it('renders null when catalogItem is null', () => {
    const { container } = renderWithProviders(
      <Formik initialValues={createEmptyComputeInstanceValues()} onSubmit={() => undefined}>
        <VmConfigurationStep catalogItem={null} />
      </Formik>,
      { apiFixtures: { diskImages: [], instanceTypes: [] } },
    );
    expect(container.firstChild).toBeNull();
  });
});
