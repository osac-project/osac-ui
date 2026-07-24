import { Route, Routes } from 'react-router-dom';

import { BareMetalDetailsPage } from './BareMetalDetailsPage';
import { BareMetalListPage } from './BareMetalListPage';
import BareMetalInstanceCreateWizard from '../../components/BareMetalInstance/CreateWizard/BareMetalInstanceCreateWizard';

export const BareMetalRoutes = () => (
  <Routes>
    <Route index element={<BareMetalListPage />} />
    <Route path="create" element={<BareMetalInstanceCreateWizard />} />
    <Route path="create/:catalogItemId" element={<BareMetalInstanceCreateWizard />} />
    <Route path=":id" element={<BareMetalDetailsPage />} />
  </Routes>
);
