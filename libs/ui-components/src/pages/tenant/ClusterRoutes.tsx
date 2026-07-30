import { Route, Routes } from 'react-router-dom';

import { ClusterDetailsPage } from '@osac/ui-components/components/Cluster/ClusterDetailsPage';
import { ClustersPage } from '@osac/ui-components/components/Cluster/ClustersPage';
import ClusterCreateWizard from '@osac/ui-components/components/Cluster/CreateWizard/ClusterCreateWizard';

export const ClusterRoutes = () => {
  return (
    <Routes>
      <Route index element={<ClustersPage />} />
      <Route path="create/:catalogItemId" element={<ClusterCreateWizard />} />
      <Route path="create" element={<ClusterCreateWizard />} />
      <Route path=":clusterId" element={<ClusterDetailsPage />} />
    </Routes>
  );
};
