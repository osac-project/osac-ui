import { type MessageInitShape } from '@bufbuild/protobuf';
import { timestampNow } from '@bufbuild/protobuf/wkt';
import { useMutation } from '@tanstack/react-query';

import {
  type ComputeInstance,
  ComputeInstanceSchema,
  ComputeInstanceState,
  type ComputeInstancesListResponse,
  ComputeInstancesListResponseSchema,
} from '@osac/types';

import { useApiFetch } from '../api-context';
import { apiQueryKey } from '../types';
import { useApiQuery, useApiQueryClient } from '../use-api-query';

export type ListComputeInstancesParams = {
  filter?: string;
  limit?: number;
  offset?: number;
};

export const useComputeInstances = (params: ListComputeInstancesParams = {}) =>
  useApiQuery<ComputeInstancesListResponse, ComputeInstance[]>({
    queryKey: ['v1/compute_instances', null, params],
    select: (data: ComputeInstancesListResponse) => data.items,
    meta: { decode: ComputeInstancesListResponseSchema },
  });

export const useComputeInstance = (id: string) => {
  const trimmedId = id?.trim() ?? '';
  return useApiQuery<ComputeInstance>({
    queryKey: ['v1/compute_instances', [trimmedId]],
    meta: { decode: ComputeInstanceSchema },
    enabled: Boolean(trimmedId),
  });
};

export const invalidateComputeInstancesQueries = async (
  qc: ReturnType<typeof useApiQueryClient>,
) => {
  await qc.invalidateQueries({ queryKey: apiQueryKey('v1/compute_instances', null) });
};

/** Poll list after create; the list endpoint can lag behind the create response. */
export const POST_CREATE_LIST_POLL_MS = 500;
export const POST_CREATE_LIST_POLL_MAX_ATTEMPTS = 20;

export const pollComputeInstancesUntilListed = async (
  qc: ReturnType<typeof useApiQueryClient>,
  instanceId: string,
  signal?: { cancelled: boolean },
): Promise<void> => {
  for (let attempt = 0; attempt < POST_CREATE_LIST_POLL_MAX_ATTEMPTS; attempt++) {
    if (signal?.cancelled) {
      return;
    }
    await invalidateComputeInstancesQueries(qc);
    const data = qc.getQueryData<ComputeInstancesListResponse>(
      apiQueryKey('v1/compute_instances', null),
    );
    if (data?.items?.some((v) => v.id === instanceId)) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, POST_CREATE_LIST_POLL_MS));
  }
};

export const useProvisionComputeInstance = () => {
  const apiFetch = useApiFetch();
  const qc = useApiQueryClient();
  return useMutation({
    mutationFn: async (
      vm: MessageInitShape<typeof ComputeInstanceSchema>,
    ): Promise<ComputeInstance> => {
      return apiFetch<ComputeInstance>('v1/compute_instances', {
        method: 'POST',
        body: vm,
        encode: ComputeInstanceSchema,
        decode: ComputeInstanceSchema,
      });
    },
    onSuccess: async () => {
      await invalidateComputeInstancesQueries(qc);
    },
  });
};

export type ComputeInstancePowerAction = 'start' | 'stop' | 'restart';

export type PatchComputeInstanceInput = {
  id: string;
  powerAction: ComputeInstancePowerAction;
};

const buildPowerPatchBody = (
  powerAction: ComputeInstancePowerAction,
): MessageInitShape<typeof ComputeInstanceSchema> => {
  switch (powerAction) {
    case 'stop':
      return {
        spec: { runStrategy: 'Halted' },
        status: { state: ComputeInstanceState.STOPPED },
      };
    case 'start':
      return {
        spec: { runStrategy: 'Always' },
        status: { state: ComputeInstanceState.RUNNING },
      };
    case 'restart':
      return { spec: { restartRequestedAt: timestampNow() } };
  }
};

export const usePatchComputeInstance = () => {
  const apiFetch = useApiFetch();
  const qc = useApiQueryClient();
  return useMutation({
    mutationFn: ({ id, powerAction }: PatchComputeInstanceInput) =>
      apiFetch<ComputeInstance>('v1/compute_instances', {
        pathParams: [id],
        method: 'PATCH',
        body: buildPowerPatchBody(powerAction),
        encode: ComputeInstanceSchema,
        decode: ComputeInstanceSchema,
      }),
    onSuccess: () => invalidateComputeInstancesQueries(qc),
  });
};

export const useDeleteComputeInstance = () => {
  const apiFetch = useApiFetch();
  const qc = useApiQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>('v1/compute_instances', {
        pathParams: [id],
        method: 'DELETE',
      }),
    onSuccess: () => invalidateComputeInstancesQueries(qc),
  });
};
