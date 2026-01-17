import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import NewAdminLayout from './components/NewAdminLayout';
import AssociateLayout from './components/AssociateLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LeadManagement from './pages/LeadManagement';
import AssociateManagement from './pages/AssociateManagement';
import ProjectManagement from './pages/ProjectManagement';
import SiteManagement from './pages/SiteManagement';
import PaymentManagement from './pages/PaymentManagement';
import InvoiceManagement from './pages/InvoiceManagement';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';

// Associate Pages
import AssociateDashboard from './pages/associate/AssociateDashboard';
import AssociateLeads from './pages/associate/AssociateLeads';
import AssociateSiteVisits from './pages/associate/AssociateSiteVisits';
import AssociateAmount from './pages/associate/AssociateAmount';
import AssociateCommission from './pages/associate/AssociateCommission';
import AssociateProfile from './pages/associate/AssociateProfile';
import AssociateProjects from './pages/associate/AssociateProjects';

import './App.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <NewAdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="leads" element={<LeadManagement />} />
        <Route path="associates" element={<AssociateManagement />} />
        <Route path="projects" element={<ProjectManagement />} />
        <Route path="sites" element={<SiteManagement />} />
        <Route path="payments" element={<PaymentManagement />} />
        <Route path="invoices" element={<InvoiceManagement />} />
        <Route path="profile" element={<Profile />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>
      
      {/* Associate Routes */}
      <Route path="/associate" element={
        <ProtectedRoute allowedRoles={['associate']}>
          <AssociateLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AssociateDashboard />} />
        <Route path="dashboard" element={<AssociateDashboard />} />
        <Route path="projects" element={<AssociateProjects />} />
        <Route path="leads" element={<AssociateLeads />} />
        <Route path="leads/add" element={<AssociateLeads />} />
        <Route path="leads/followup" element={<AssociateLeads />} />
        <Route path="leads/final" element={<AssociateLeads />} />
        <Route path="site-visits" element={<AssociateSiteVisits />} />
        <Route path="site-visits/planned" element={<AssociateSiteVisits />} />
        <Route path="site-visits/completed" element={<AssociateSiteVisits />} />
        <Route path="site-visits/schedule" element={<AssociateSiteVisits />} />
        <Route path="amount/advance" element={<AssociateAmount />} />
        <Route path="amount/pending" element={<AssociateAmount />} />
        <Route path="amount/total" element={<AssociateAmount />} />
        <Route path="amount/emi" element={<AssociateAmount />} />
        <Route path="commission/total" element={<AssociateCommission />} />
        <Route path="commission/withdrawal" element={<AssociateCommission />} />
        <Route path="commission/history" element={<AssociateCommission />} />
        <Route path="profile" element={<AssociateProfile />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
            
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              className="mt-16"
            />
          </div>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;