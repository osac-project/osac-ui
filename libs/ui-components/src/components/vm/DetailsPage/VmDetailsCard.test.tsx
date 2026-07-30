import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ComputeInstance, InstanceTypeState } from '@osac/types';

import VmDetailsCard from './VmDetailsCard';
import { renderWithProviders } from '../../../test-utils/TestProviders';

vi.mock('./useVmDetailsDisplay', () => ({
  useVmDetailsDisplay: vi.fn(),
}));

vi.mock('./VmDetailsCatalogValue', () => ({
  default: ({ catalogItemId }: { catalogItemId?: string }) => <span>{catalogItemId}</span>,
}));

const { useVmDetailsDisplay } = await import('./useVmDetailsDisplay');

const catalogVm: ComputeInstance = {
  $typeName: 'osac.public.v1.ComputeInstance',
  id: 'vm-1',
  metadata: {
    $typeName: 'osac.public.v1.Metadata',
    name: 'web-01',
    creator: 'alice',
    creationTimestamp: {
      $typeName: 'google.protobuf.Timestamp',
      seconds: 1767225600n,
      nanos: 0,
    },
    annotations: {},
    labels: {},
    project: 'foo',
    tenant: 'foo',
    version: 1,
  },
  spec: {
    $typeName: 'osac.public.v1.ComputeInstanceSpec',
    catalogItem: 'catalog-rhel-9',
    sshPublicKey: 'ssh-rsa AAAA...',
    image: {
      $typeName: 'osac.public.v1.ComputeInstanceImage',
      sourceRef: 'quay.io/example/rhel9',
      sourceType: '',
    },
    instanceType: 'standard-4-8',
    bootDisk: {
      $typeName: 'osac.public.v1.ComputeInstanceDisk',
      sizeGib: 40,
    },
    userData: '#cloud-config',
    additionalDisks: [],
    networkAttachments: [],
    template: '',
    templateParameters: {},
  },
};

const renderCard = (vm: ComputeInstance = catalogVm) =>
  renderWithProviders(<VmDetailsCard vm={vm} />);

describe('VmDetailsCard', () => {
  it('shows catalog fields with full SSH key', () => {
    vi.mocked(useVmDetailsDisplay).mockReturnValue({
      catalogItemId: 'catalog-rhel-9',
      isCatalogItemLoading: false,
      instanceType: {
        $typeName: 'osac.public.v1.InstanceType',
        id: 'standard-4-8',
        metadata: {
          $typeName: 'osac.public.v1.Metadata',
          name: 'Standard 4 vCPU / 8 GiB',
          annotations: {},
          creator: 'foo',
          labels: {},
          project: 'foo',
          tenant: 'foo',
          version: 1,
        },
        spec: {
          $typeName: 'osac.public.v1.InstanceTypeSpec',
          description: '',
          state: InstanceTypeState.ACTIVE,
          cores: 4,
          memoryGib: 8,
        },
      },
      instanceTypeId: 'standard-4-8',
      isInstanceTypeLoading: false,
      networkingRows: [],
      catalogItem: undefined,
    } as ReturnType<typeof useVmDetailsDisplay>);

    renderCard();

    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('web-01')).toBeInTheDocument();
    expect(screen.getByText('ssh-rsa AAAA...')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('Creator')).toBeInTheDocument();
  });

  it('shows details with fallback values when catalog item is missing', () => {
    vi.mocked(useVmDetailsDisplay).mockReturnValue({
      catalogItemId: undefined,
      isCatalogItemLoading: false,
      instanceType: undefined,
      instanceTypeId: undefined,
      isInstanceTypeLoading: false,
      networkingRows: [],
      catalogItem: undefined,
    } as ReturnType<typeof useVmDetailsDisplay>);

    renderCard({ id: 'vm-2', metadata: { name: 'legacy-vm' } } as ComputeInstance);
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('legacy-vm')).toBeInTheDocument();
  });
});
