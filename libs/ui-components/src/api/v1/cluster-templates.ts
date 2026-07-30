import { ClusterTemplates } from '@osac/types';

import { useApiFetch } from '../api-context';
import { ListParams, apiQueryKey } from '../types';
import { useApiQuery } from '../use-api-query';

export const useClusterTemplates = (params: ListParams = {}) => {
  const client = useApiFetch(ClusterTemplates);
  return useApiQuery({
    queryKey: apiQueryKey('v1/cluster_templates'),
    queryFn: () => client.list(params),
    select: (data) => {
      return data.items;
    },
  });
};
