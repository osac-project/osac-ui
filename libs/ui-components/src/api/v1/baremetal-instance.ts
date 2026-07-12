import { type MessageInitShape } from '@bufbuild/protobuf';
import { useMutation } from '@tanstack/react-query';

import {
  type BareMetalInstance,
  type BareMetalInstanceCatalogItem,
  type BareMetalInstanceCatalogItemsListResponse,
  BareMetalInstanceCatalogItemsListResponseSchema,
  BareMetalInstanceRunStrategy,
  BareMetalInstanceSchema,
  type BareMetalInstancesListResponse,
  BareMetalInstancesListResponseSchema,
} from '@osac/types';

import { useApiFetch } from '../api-context';
import { apiQueryKey } from '../types';
import { useApiQuery, useApiQueryClient } from '../use-api-query';

export const useBareMetalInstances = () =>
  useApiQuery<BareMetalInstancesListResponse, BareMetalInstance[]>({
    queryKey: apiQueryKey('v1/baremetal_instances', null),
    select: (data: BareMetalInstancesListResponse) => data.items,
    meta: { decode: BareMetalInstancesListResponseSchema },
  });

export const useBareMetalInstance = (id: string) =>
  useApiQuery<BareMetalInstance>({
    queryKey: apiQueryKey('v1/baremetal_instances', [id]),
    meta: { decode: BareMetalInstanceSchema },
    enabled: Boolean(id),
  });

export const useBareMetalInstanceCatalogItems = (enabled = true) =>
  useApiQuery<BareMetalInstanceCatalogItemsListResponse, BareMetalInstanceCatalogItem[]>({
    queryKey: apiQueryKey('v1/baremetal_instance_catalog_items'),
    select: (data: BareMetalInstanceCatalogItemsListResponse) => data.items,
    meta: { decode: BareMetalInstanceCatalogItemsListResponseSchema },
    enabled,
  });

export const invalidateBareMetalInstancesQueries = async (
  qc: ReturnType<typeof useApiQueryClient>,
) => {
  await qc.invalidateQueries({ queryKey: apiQueryKey('v1/baremetal_instances', null) });
};

export type BareMetalPowerAction = 'start' | 'stop' | 'restart';

export type PatchBareMetalInstanceInput =
  | { id: string; action: 'start' | 'stop' }
  | { id: string; action: 'restart'; currentTrigger: bigint };

const buildPatchBody = (
  input: PatchBareMetalInstanceInput,
): MessageInitShape<typeof BareMetalInstanceSchema> => {
  switch (input.action) {
    case 'start':
      return { spec: { runStrategy: BareMetalInstanceRunStrategy.ALWAYS } };
    case 'stop':
      return { spec: { runStrategy: BareMetalInstanceRunStrategy.HALTED } };
    case 'restart':
      return { spec: { restartTrigger: input.currentTrigger + 1n } };
  }
};

export const usePatchBareMetalInstance = () => {
  const apiFetch = useApiFetch();
  const qc = useApiQueryClient();
  return useMutation({
    mutationFn: (input: PatchBareMetalInstanceInput) =>
      apiFetch<BareMetalInstance>('v1/baremetal_instances', {
        pathParams: [input.id],
        method: 'PATCH',
        body: buildPatchBody(input),
        encode: BareMetalInstanceSchema,
        decode: BareMetalInstanceSchema,
      }),
    onSuccess: () => invalidateBareMetalInstancesQueries(qc),
  });
};

export const useDeleteBareMetalInstance = () => {
  const apiFetch = useApiFetch();
  const qc = useApiQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>('v1/baremetal_instances', {
        pathParams: [id],
        method: 'DELETE',
      }),
    onSuccess: () => invalidateBareMetalInstancesQueries(qc),
  });
};

export const useCreateBareMetalInstance = () => {
  const apiFetch = useApiFetch();
  const qc = useApiQueryClient();
  return useMutation({
    mutationFn: (bmi: MessageInitShape<typeof BareMetalInstanceSchema>) =>
      apiFetch<BareMetalInstance>('v1/baremetal_instances', {
        method: 'POST',
        body: bmi,
        encode: BareMetalInstanceSchema,
        decode: BareMetalInstanceSchema,
      }),
    onSuccess: () => invalidateBareMetalInstancesQueries(qc),
  });
};
