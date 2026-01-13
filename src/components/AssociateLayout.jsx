import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  MapPin, 
  DollarSign, 
  User, 
  Wallet,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Phone,
  Calendar,
  TrendingUp,
  Plus,
  Eye,
  CreditCard,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AssociateLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dropdowns, setDropdowns] = useState({});

  const toggleDropdown = (key) => {
    setDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/associate/dashboard'
    },
    {
      title: 'Projects',
      icon: Building,
      path: '/associate/projects'
    },
    {
      title: 'Manage Leads',
      icon: Users,
      key: 'leads',
      submenu: [
        { title: 'Add Lead', path: '/associate/leads', icon: Plus },
        { title: 'Show Leads', path: '/associate/leads', icon: Eye },
        { title: 'Follow Up', path: '/associate/leads', icon: Phone },
        { title: 'Final Status', path: '/associate/leads', icon: TrendingUp }
      ]
    },
    {
      title: 'Site Visits',
      icon: MapPin,
      key: 'visits',
      submenu: [
        { title: 'Planned Visits', path: '/associate/site-visits', icon: Calendar },
        { title: 'Completed Visits', path: '/associate/site-visits', icon: TrendingUp },
        { title: 'Schedule Visit', path: '/associate/site-visits', icon: Plus }
      ]
    },
    {
      title: 'Amount',
      icon: DollarSign,
      key: 'amount',
      submenu: [
        { title: 'Advance', path: '/associate/amount/advance', icon: DollarSign },
        { title: 'Pending', path: '/associate/amount/pending', icon: Clock },
        { title: 'Total', path: '/associate/amount/total', icon: TrendingUp },
        { title: 'EMI', path: '/associate/amount/emi', icon: CreditCard }
      ]
    },
    {
      title: 'Commission',
      icon: Wallet,
      key: 'commission',
      submenu: [
        { title: 'Total Amount', path: '/associate/commission/total', icon: DollarSign },
        { title: 'Withdrawal', path: '/associate/commission/withdrawal', icon: Wallet },
        { title: 'History', path: '/associate/commission/history', icon: TrendingUp }
      ]
    },
    {
      title: 'Profile',
      icon: User,
      path: '/associate/profile'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isSubmenuActive = (submenu) => {
    return submenu.some(item => location.pathname === item.path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
      } w-64`}>
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} h-16 px-6 border-b border-gray-200`}>
          <div className="flex items-center">
            <h1 className="text-lg font-bold text-gray-900">SP City</h1>
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className={`${sidebarCollapsed ? 'px-2' : 'px-4'} py-6 space-y-2`}>
            {menuItems.map((item) => (
              <div key={item.title}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => {
                        if (sidebarCollapsed) {
                          navigate(item.submenu[0].path);
                          setSidebarOpen(false);
                        } else {
                          toggleDropdown(item.key);
                        }
                      }}
                      className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3'} text-sm font-medium rounded-lg transition-colors ${
                        isSubmenuActive(item.submenu)
                          ? 'bg-gradient-to-r from-red-600 to-black text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      title={sidebarCollapsed ? item.title : ''}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5" />
                        {!sidebarCollapsed && <span>{item.title}</span>}
                      </div>
                      {!sidebarCollapsed && (
                        dropdowns[item.key] ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )
                      )}
                    </button>
                    {dropdowns[item.key] && !sidebarCollapsed && (
                      <div className="mt-2 ml-4 space-y-1">
                        {item.submenu.map((subItem) => (
                          <button
                            key={subItem.path}
                            onClick={() => {
                              navigate(subItem.path);
                              setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-2 text-sm rounded-lg transition-colors ${
                              isActive(subItem.path)
                                ? 'bg-red-50 text-red-700 border-l-4 border-red-600'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {subItem.icon && <subItem.icon className="w-4 h-4" />}
                            <span>{subItem.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'} text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-red-600 to-black text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    title={sidebarCollapsed ? item.title : ''}
                  >
                    <item.icon className="w-5 h-5" />
                    {!sidebarCollapsed && <span>{item.title}</span>}
                  </button>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className={`${sidebarCollapsed ? 'p-2' : 'p-4'} border-t border-gray-200`}>
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-black rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">Associate</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-black rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Menu Toggle for Desktop */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome back, {user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AssociateLayout;