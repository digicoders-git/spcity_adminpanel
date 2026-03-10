import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  FileText,
  TrendingUp,
  CreditCard,
  Trophy,
  Bell,
  Check
} from 'lucide-react';
import { notificationsAPI } from '../utils/api_notifications';

const NewAdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

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

  // Update time every second & poll notifications
  React.useEffect(() => {
    fetchNotifications();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    // Poll notifications every 30 secs
    const pollNotifs = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => {
      clearInterval(timer);
      clearInterval(pollNotifs);
    }
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
    { icon: TrendingUp, label: 'Manage Commissions', path: '/admin/commissions' },
    { icon: CreditCard, label: 'Manage Expense', path: '/admin/expenses' },
    { icon: Trophy, label: 'Monthly Rewards', path: '/admin/rewards' },
    { icon: FileText, label: 'Manage Invoices', path: '/admin/invoices' },
    { icon: User, label: 'Profile', path: '/admin/profile' },
    { icon: Lock, label: 'Change Password', path: '/admin/change-password' }
  ];

  const handleLogout = () => {
    logout();
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
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-black rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-600">{user?.role === 'admin' ? 'Super Admin' : 'Admin'}</p>
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