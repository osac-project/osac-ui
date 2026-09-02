import {
  type DescMessage,
  type DescMethodUnary,
  type DescService,
  type Message,
  type MessageInitShape,
  type MessageShape,
  create,
} from '@bufbuild/protobuf';
import type { GenMessage } from '@bufbuild/protobuf/codegenv2';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';

import { useApiFetch } from './api-context';
import { buildUpdateMaskPaths } from './v1/update-mask';

type ResourceService<
  Operation extends string,
  Input extends DescMessage,
  Output extends DescMessage,
> = Omit<DescService, 'method'> & {
  method: Record<Operation, DescMethodUnary<Input, Output>>;
};

type ResourceQueryOptions<Data extends DescMessage> = Omit<
  UseQueryOptions<MessageShape<Data>, unknown, MessageShape<Data>>,
  'queryFn' | 'queryKey' | 'select'
>;

type ResourceMutationOptions<Data extends DescMessage, Variables> = Omit<
  UseMutationOptions<MessageShape<Data>, Error, Variables>,
  'mutationFn'
>;

interface PaginatedListRequest extends Message {
  limit?: number;
  offset?: number;
}

interface PaginatedListResponse extends Message {
  items: Message[];
  size: number;
  total: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object';

const buildUpdateRequest = <Input extends DescMessage, Output extends DescMessage>(
  service: ResourceService<'update', Input, Output>,
  request: MessageInitShape<Input>,
) => {
  const objectField = service.method.update.input.field.object;
  if (objectField?.fieldKind !== 'message') {
    throw new Error(`${service.typeName}.update request is missing its resource object schema`);
  }

  const requestRecord: unknown = request;
  if (!isRecord(requestRecord) || !isRecord(requestRecord.object)) {
    throw new Error(`${service.typeName}.update request is missing its resource object`);
  }

  return {
    ...request,
    updateMask: {
      paths: buildUpdateMaskPaths(requestRecord.object, { schema: objectField.message }),
    },
  };
};

export const useListResource = <Input extends DescMessage, Output extends DescMessage>(
  service: ResourceService<'list', Input, Output>,
  request: MessageInitShape<Input> = create(service.method.list.input),
  options: ResourceQueryOptions<Output> = {},
) => {
  const client = useApiFetch(service);
  const listRequest = create(service.method.list.input, request);

  return useQuery({
    ...options,
    queryKey: [service.typeName, 'list', request],
    queryFn: () => client.list(listRequest),
  });
};

const ALL_RESOURCES_PAGE_SIZE = 100;

export const useListAllResources = <
  InputMessage extends PaginatedListRequest,
  OutputMessage extends PaginatedListResponse,
>(
  service: ResourceService<'list', GenMessage<InputMessage>, GenMessage<OutputMessage>>,
  request: MessageInitShape<GenMessage<InputMessage>> = create(service.method.list.input),
  options: ResourceQueryOptions<GenMessage<OutputMessage>> = {},
) => {
  const client = useApiFetch(service);

  return useQuery({
    ...options,
    queryKey: [service.typeName, 'listAll', request],
    queryFn: async () => {
      const getPage = (offset: number) =>
        client.list(
          create(service.method.list.input, {
            ...request,
            limit: ALL_RESOURCES_PAGE_SIZE,
            offset,
          }),
        );
      const firstPage = await getPage(0);
      const items = [...firstPage.items];
      let total = firstPage.total;

      while (items.length < total) {
        const page = await getPage(items.length);
        if (page.items.length === 0) {
          break;
        }
        items.push(...page.items);
        total = page.total;
      }

      return {
        ...firstPage,
        items,
        size: items.length,
        total,
      };
    },
  });
};

export const useGetResource = <Input extends DescMessage, Output extends DescMessage>(
  service: ResourceService<'get', Input, Output>,
  request: MessageInitShape<Input>,
  options: ResourceQueryOptions<Output> = {},
) => {
  const client = useApiFetch(service);

  return useQuery({
    ...options,
    queryKey: [service.typeName, 'get', request],
    queryFn: () => client.get(request),
  });
};

export const useCreateResource = <Input extends DescMessage, Output extends DescMessage>(
  service: ResourceService<'create', Input, Output>,
  options: ResourceMutationOptions<Output, MessageInitShape<Input>> = {},
) => {
  const client = useApiFetch(service);
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (request) => client.create(request),
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: [service.typeName] });
      await options.onSuccess?.(...args);
    },
  });
};

export const useUpdateResource = <Input extends DescMessage, Output extends DescMessage>(
  service: ResourceService<'update', Input, Output>,
  options: ResourceMutationOptions<Output, MessageInitShape<Input>> = {},
) => {
  const client = useApiFetch(service);
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (request) => client.update(buildUpdateRequest(service, request)),
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: [service.typeName] });
      await options.onSuccess?.(...args);
    },
  });
};

export const useDeleteResource = <Input extends DescMessage, Output extends DescMessage>(
  service: ResourceService<'delete', Input, Output>,
  options: ResourceMutationOptions<Output, MessageInitShape<Input>> = {},
) => {
  const client = useApiFetch(service);
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (request) => client.delete(request),
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: [service.typeName] });
      await options.onSuccess?.(...args);
    },
  });
};
