import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom';
import Home from '@/pages/Home';
import NotFound from './404';
import Login from '@/login/Login';
import Parcel from "@/pages/parcel/parcel";
import ParcelUpdate from '@/pages/parcel/parcelupdate';
import Cons from "@/pages/cons";
import ProtectedRoute from '../login/protectedroute';
import Logout from '../login/logout';
import FoncierWorkflowForm from '../pages/foncier/create';
import CombustibleWorkflowForm from '../pages/combustible/create';
import Frontend from '@/pages/foncier/frontend';
import Frontendd from '@/pages/combustible/frontend';
import Frontenddd from '@/pages/upaworkflow/frontend';
import UpaworkflowForm from '@/pages/upaworkflow/create';
import Frontend4 from '@/pages/occupation/frontend';
import OccupationWorkflowForm from '@/pages/occupation/create';
import ParcelDashboard from '@/components/layout/parceldashboard';
import ParcelDetailPage from '@/pages/detail/workflowstatus';
import WorkflowDetailsPage from '@/pages/detail/workflowdetails';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public routes */}
      <Route path="/404" element={<NotFound />} />
      <Route path="/login" element={<Login />} />
      
      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>}>
        <Route index element={<ParcelDashboard />} />
        <Route path="parcel" element={<ProtectedRoute><Parcel /></ProtectedRoute>} />
        <Route path="combustible/:id" element={<ProtectedRoute><CombustibleWorkflowForm /></ProtectedRoute>} />
        <Route path="foncier/:id" element={<ProtectedRoute><FoncierWorkflowForm /></ProtectedRoute>} />
        <Route path="urban_autorisation/:id" element={<ProtectedRoute><UpaworkflowForm /></ProtectedRoute>} />
        <Route path="urban_autorisation" element={<ProtectedRoute><Frontenddd /></ProtectedRoute>} />
        <Route path="construction" element={<ProtectedRoute><Cons /></ProtectedRoute>} />
        <Route path="foncier" element={<ProtectedRoute><Frontend /></ProtectedRoute>} />
        <Route path="combustible" element={<ProtectedRoute><Frontendd /></ProtectedRoute>} />
        <Route path="occupation/:id" element={<ProtectedRoute><OccupationWorkflowForm /></ProtectedRoute>} />
        <Route path="occupation" element={<ProtectedRoute><Frontend4 /></ProtectedRoute>} />
        <Route path="parcelsdetail/:id" element={<ProtectedRoute><ParcelDetailPage /></ProtectedRoute>} />
        <Route path="parcel/update/:id" element={<ProtectedRoute><ParcelUpdate /></ProtectedRoute>} />
        <Route path="/workflow-details/:workflowType/:workflowId" element={<ProtectedRoute><WorkflowDetailsPage /></ProtectedRoute>}/>
      </Route>
      
      {/* Logout route */}
      <Route path="/logout" element={<Logout />} />
      
      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFound />} />
    </>
  )
);

export default router;