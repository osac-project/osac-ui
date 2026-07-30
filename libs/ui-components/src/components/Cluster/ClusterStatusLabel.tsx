import { ClusterState } from '@osac/types';

import { ResourceStatusLabel, type StatusKind } from '../Resource/ResourceStatusLabel';

interface ClusterStatusLabelProps {
  state?: ClusterState;
}

const CLUSTER_STATUS_MAP: Record<ClusterState, { status: StatusKind; text: string }> = {
  [ClusterState.UNSPECIFIED]: { status: 'unspecified', text: 'Unknown' },
  [ClusterState.PROGRESSING]: { status: 'progressing', text: 'Provisioning' },
  [ClusterState.READY]: { status: 'ready', text: 'Ready' },
  [ClusterState.FAILED]: { status: 'failed', text: 'Failed' },
  [ClusterState.DELETING]: { status: 'progressing', text: 'Deleting' },
  [ClusterState.DELETE_FAILED]: { status: 'failed', text: 'Delete failed' },
};

export const ClusterStatusLabel = ({ state }: ClusterStatusLabelProps) => {
  const { status, text } = state
    ? CLUSTER_STATUS_MAP[state]
    : CLUSTER_STATUS_MAP[ClusterState.UNSPECIFIED];

  return <ResourceStatusLabel status={status} text={text} />;
};
