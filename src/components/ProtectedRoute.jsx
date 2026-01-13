import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, AlertTriangle } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole, requiredPermission }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user || !user.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. This area is restricted to {requiredRole} users only.
          </p>
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Your Role:</span> {user.role}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Required Role:</span> {requiredRole}
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gradient-to-r from-red-600 to-black text-white py-3 px-4 rounded-xl font-semibold hover:from-red-700 hover:to-gray-900 transition-all duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check permission-based access
  if (requiredPermission && !user.permissions?.includes(requiredPermission) && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Permission Required</h1>
          <p className="text-gray-600 mb-6">
            You don't have the required permission to access this feature. Please contact your administrator.
          </p>
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Required Permission:</span> {requiredPermission}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Your Permissions:</span> {user.permissions?.join(', ') || 'None'}
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gradient-to-r from-red-600 to-black text-white py-3 px-4 rounded-xl font-semibold hover:from-red-700 hover:to-gray-900 transition-all duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User has access, render the protected component
  return children;
};

export default ProtectedRoute;