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
  Clock,
  Trophy,
  Receipt,
  Bell,
  Check
} from 'lucide-react';
import { notificationsAPI } from '../utils/api_notifications';
import { useAuth } from '../context/AuthContext';

const AssociateLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dropdowns, setDropdowns] = useState({});

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsAPI.getAll();
      setNotifications(res.data || []);
      setUnreadCount(res.unreadCount || 0);
    } catch {
      console.error('Error fetching notifications');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      fetchNotifications();
    } catch {
      console.error('Error marking as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      fetchNotifications();
    } catch {
      console.error('Error marking all as read');
    }
  };

  React.useEffect(() => {
    fetchNotifications();
    const pollNotifs = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(pollNotifs);
  }, []);

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
      title: 'My Network',
      icon: Users,
      path: '/associate/associates'
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
        { title: 'History', path: '/associate/commissions', icon: TrendingUp }
      ]
    },
    {
      title: 'Expenses',
      icon: CreditCard,
      path: '/associate/expenses'
    },
    {
      title: 'Invoices',
      icon: Receipt,
      path: '/associate/invoices'
    },
    {
      title: 'Monthly Rewards',
      icon: Trophy,
      path: '/associate/rewards'
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
            
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => {
                  const websiteUrl = import.meta.env.VITE_WEBSITE_URL || 
                                   (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
                                     ? (window.location.port === "5174" ? "http://localhost:5173" : "http://localhost:5174") 
                                     : "https://spcity-website.vercel.app");
                  window.location.href = websiteUrl;
                }}
                className="hidden sm:flex items-center space-x-2 text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-all duration-300 border border-red-100"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Go to Website</span>
              </button>

              {/* Notifications Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                >
                  <Bell className="w-6 h-6 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-[72px] sm:top-auto sm:mt-2 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllAsRead}
                          className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
                        >
                          <Check size={14} /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map(notif => (
                          <div 
                            key={notif._id} 
                            onClick={() => {
                               if(!notif.isRead) handleMarkAsRead(notif._id);
                               if(notif.link) navigate(notif.link);
                            }}
                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${notif.isRead ? 'opacity-60' : 'bg-red-50/20'}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm ${notif.isRead ? 'font-semibold text-gray-700' : 'font-black text-gray-900'}`}>{notif.title}</h4>
                              {!notif.isRead && <span className="w-2 h-2 rounded-full bg-red-500 mt-1"></span>}
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">{notif.message}</p>
                            <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wider">
                              {new Date(notif.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                          <Bell className="w-8 h-8 text-gray-300" />
                          <p className="text-sm font-medium">No new notifications</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 border-l pl-6 border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900 leading-none">{user?.name}</p>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-bold">Associate</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-black rounded-full flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
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