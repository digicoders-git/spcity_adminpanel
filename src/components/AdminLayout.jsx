import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Mail,
  LogOut,
  Menu,
  X,
  User,
  Building2,
  ChevronRight,
  Home,
  Settings,
  Clock
} from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleLogout = () => {
    navigate('/admin/login');
  };

  const navigationItems = [
    {
      path: '/admin',
      name: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: 'Overview and analytics'
    },
    {
      path: '/admin/manegeblog',
      name: 'Blog Management',
      icon: <FileText className="w-5 h-5" />,
      description: 'Manage blog posts and content'
    },
    {
      path: '/admin/managecareer',
      name: 'Career Forms',
      icon: <Briefcase className="w-5 h-5" />,
      description: 'View job applications'
    },
    {
      path: '/admin/contactus',
      name: 'Contact Forms',
      icon: <Mail className="w-5 h-5" />,
      description: 'Manage customer inquiries'
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 sm:w-72 lg:w-80 bg-white shadow-2xl border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-900">SP City</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="bg-gradient-to-r from-red-50 to-gray-50 rounded-2xl p-3 sm:p-4 border border-red-100">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-600 to-black rounded-full flex items-center justify-center">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                  Admin User
                </p>
                <p className="text-xs text-gray-600 truncate">
                  admin@spcity.com
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 lg:p-6 space-y-1 sm:space-y-2 overflow-y-auto">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`
                sidebar-item
                ${isActive(item.path) ? 'sidebar-item-active' : 'sidebar-item-inactive'}
              `}
            >
              <div className={`
                ${isActive(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-purple-500'}
              `}>
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{item.name}</p>
                <p className={`
                  text-xs mt-1
                  ${isActive(item.path) ? 'text-red-100' : 'text-gray-500'}
                `}>
                  {item.description}
                </p>
              </div>
              <ChevronRight className={`
                w-4 h-4 transition-transform duration-200
                ${isActive(item.path) ? 'text-white rotate-90' : 'text-gray-400 group-hover:text-purple-500'}
              `} />
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 sm:p-4 lg:p-6 border-t border-gray-200 space-y-2 sm:space-y-3">
          <Link
            to="/"
            className="flex items-center space-x-3 p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200 group"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium text-sm">Back to Website</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between p-2 sm:p-4 lg:p-6">
            {/* Left Section */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Date and Time */}
              <div className="hidden sm:flex items-center space-x-2 lg:space-x-3 bg-gradient-to-r from-red-50 to-gray-50 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-red-100">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">{formatTime(currentTime)}</p>
                  <p className="text-xs text-gray-600 hidden md:block">{formatDate(currentTime)}</p>
                </div>
              </div>

              {/* Breadcrumb */}
              <div className="hidden md:flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden lg:inline">Admin Panel</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 hidden lg:inline" />
                <span className="font-semibold text-gray-900 truncate max-w-32 sm:max-w-none">
                  {navigationItems.find(item => isActive(item.path))?.name || 'Dashboard'}
                </span>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-1 sm:space-x-3">
              {/* Settings */}
              <button className="p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>

              {/* User Avatar - Mobile */}
              <div className="lg:hidden w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-red-600 to-black rounded-full flex items-center justify-center">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-2 sm:p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-2 sm:py-4 px-2 sm:px-4 lg:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-600">
            <p>© 2025 SP City. All rights reserved.</p>
            <p className="mt-1 sm:mt-0">
              <span className="hidden sm:inline">Admin Panel v1.0 • </span>Secure Access
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AdminLayout;