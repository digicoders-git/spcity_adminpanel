import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Building, 
  DollarSign, 
  User, 
  Lock, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText
} from 'lucide-react';

const NewAdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
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

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Manage Leads', path: '/admin/leads' },
    { icon: UserCheck, label: 'Manage Associates', path: '/admin/associates' },
    { 
      icon: Building, 
      label: 'Manage Projects', 
      path: '/admin/projects',
      submenu: [
        { label: 'All Projects', path: '/admin/projects' },
        { label: 'Manage Sites', path: '/admin/sites' }
      ]
    },
    { icon: DollarSign, label: 'Manage Payments', path: '/admin/payments' },
    { icon: FileText, label: 'Manage Invoices', path: '/admin/invoices' },
    { icon: User, label: 'Profile', path: '/admin/profile' },
    { icon: Lock, label: 'Change Password', path: '/admin/change-password' }
  ];

  const handleLogout = () => {
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col border-r border-gray-200 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
      } w-64`}>
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} h-16 px-6 border-b border-gray-200 flex-shrink-0`}>
          <div className="flex items-center">
            <h1 className="text-lg font-bold text-gray-900">SP City</h1>
          </div>
          {!sidebarCollapsed && (
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        <nav className={`flex-1 ${sidebarCollapsed ? 'px-2' : 'px-3'} py-6 overflow-y-auto`}>
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              
              if (item.submenu) {
                return (
                  <div key={item.path}>
                    <button
                      onClick={() => {
                        if (sidebarCollapsed) {
                          navigate(item.path);
                          setSidebarOpen(false);
                        } else {
                          setProjectsOpen(!projectsOpen);
                        }
                      }}
                      className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-3' : 'justify-between p-4'} rounded-2xl transition-all duration-200 ${
                        isActive(item.path) || location.pathname.includes('/admin/sites')
                          ? 'bg-gradient-to-r from-red-600 to-black text-white shadow-lg' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      title={sidebarCollapsed ? item.label : ''}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                      </div>
                      {!sidebarCollapsed && (projectsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                    </button>
                    
                    {projectsOpen && !sidebarCollapsed && (
                      <div className="ml-4 mt-2 space-y-1">
                        {item.submenu.map((subItem) => (
                          <button
                            key={subItem.path}
                            onClick={() => {
                              navigate(subItem.path);
                              setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-sm ${
                              location.pathname === subItem.path
                                ? 'bg-red-100 text-red-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                            }`}
                          >
                            <span>{subItem.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-3' : 'space-x-3 p-4'} rounded-2xl transition-all duration-200 ${
                    isActive(item.path) 
                      ? 'bg-gradient-to-r from-red-600 to-black text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <Icon className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="px-3 py-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-3' : 'space-x-3 p-4'} rounded-2xl transition-all duration-200 text-red-600 hover:bg-red-50 hover:text-red-700`}
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* Menu Toggle for Desktop */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* Date and Time */}
              <div className="hidden sm:flex items-center space-x-3 bg-gradient-to-r from-red-50 to-gray-50 px-4 py-2 rounded-xl border border-red-100">
                <Clock className="w-5 h-5 text-red-600" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">{formatTime(currentTime)}</p>
                  <p className="text-xs text-gray-600">{formatDate(currentTime)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-black rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-600">Super Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default NewAdminLayout;