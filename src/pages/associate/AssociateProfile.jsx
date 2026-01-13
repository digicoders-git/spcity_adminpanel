import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Calendar, Edit, Save, Camera, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { associatesAPI, commissionsAPI, dashboardAPI } from '../../utils/api';
import { toast } from 'react-toastify';

const AssociateProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    username: '',
    role: '',
    department: '',
    permissions: [],
    status: '',
    createdAt: '',
    bankAccount: '',
    panNumber: '',
    aadharNumber: ''
  });

  const [stats, setStats] = useState({
    totalLeads: 0,
    convertedLeads: 0,
    totalCommission: 0,
    availableBalance: 0,
    totalSiteVisits: 0,
    conversionRate: 0
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await associatesAPI.getProfile();
      if (response.success) {
        setProfileData({
          name: response.data.name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          address: response.data.address || '',
          username: response.data.username || '',
          role: response.data.role || '',
          department: response.data.department || '',
          permissions: response.data.permissions || [],
          status: response.data.status || '',
          createdAt: response.data.createdAt || '',
          bankAccount: response.data.bankAccount || '',
          panNumber: response.data.panNumber || '',
          aadharNumber: response.data.aadharNumber || ''
        });
      }
    } catch (error) {
      toast.error('Failed to fetch profile');
    }
  };

  const fetchStats = async () => {
    try {
      const [dashboardRes, commissionRes] = await Promise.all([
        dashboardAPI.getStats(),
        commissionsAPI.getStats()
      ]);
      
      if (dashboardRes.success) {
        setStats(prev => ({
          ...prev,
          totalLeads: dashboardRes.data.totalLeads || 0,
          convertedLeads: dashboardRes.data.convertedLeads || 0,
          totalSiteVisits: dashboardRes.data.totalSiteVisits || 0,
          conversionRate: dashboardRes.data.conversionRate || 0
        }));
      }
      
      if (commissionRes.success) {
        setStats(prev => ({
          ...prev,
          totalCommission: commissionRes.data.totalEarned || 0,
          availableBalance: commissionRes.data.availableBalance || 0
        }));
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleSave = async () => {
    try {
      const updateData = {
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        bankAccount: profileData.bankAccount,
        panNumber: profileData.panNumber,
        aadharNumber: profileData.aadharNumber
      };
      
      const response = await associatesAPI.updateProfile(updateData);
      
      if (response.success) {
        setIsEditing(false);
        toast.success('Profile updated successfully!');
        fetchProfile();
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile(); // Reset form data
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-2">Manage your personal information and view performance</p>
            </div>
            {!isEditing ? (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  onClick={handleSave}
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>

          {/* Performance Stats */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Performance Overview</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Leads</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.totalLeads}</p>
                  </div>
                  <User className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Conversion Rate</p>
                    <p className="text-2xl font-bold text-green-700">{stats.conversionRate}%</p>
                  </div>
                  <Award className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Total Commission</p>
                    <p className="text-2xl font-bold text-purple-700">{formatCurrency(stats.totalCommission)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Available Balance</p>
                    <p className="text-2xl font-bold text-orange-700">{formatCurrency(stats.availableBalance)}</p>
                  </div>
                  <MapPin className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              <div className="bg-teal-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-teal-600 font-medium">Site Visits</p>
                    <p className="text-2xl font-bold text-teal-700">{stats.totalSiteVisits}</p>
                  </div>
                  <MapPin className="w-8 h-8 text-teal-500" />
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Deals Completed</p>
                    <p className="text-2xl font-bold text-red-700">{stats.convertedLeads}</p>
                  </div>
                  <Award className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture & Basic Info */}
            <div className="card">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-red-600 to-black rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profileData.name.charAt(0).toUpperCase()}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">{profileData.name}</h3>
                  <p className="text-gray-500">{profileData.department}</p>
                  <p className="text-sm text-gray-400">@{profileData.username}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(profileData.status)}`}>
                    {profileData.status}
                  </span>
                </div>
                <div className="w-full border-t pt-4 space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Joined: {new Date(profileData.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Role: {profileData.role}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="lg:col-span-2 card">
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      readOnly={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isEditing ? 'bg-white' : 'bg-gray-50'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="text"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      readOnly={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isEditing ? 'bg-white' : 'bg-gray-50'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      value={profileData.department}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={profileData.address}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    readOnly={!isEditing}
                    rows={3}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isEditing ? 'bg-white' : 'bg-gray-50'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account Number</label>
                <input
                  type={isEditing ? 'text' : 'password'}
                  value={profileData.bankAccount}
                  onChange={(e) => setProfileData({...profileData, bankAccount: e.target.value})}
                  readOnly={!isEditing}
                  placeholder="Enter bank account number"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isEditing ? 'bg-white' : 'bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                <input
                  type="text"
                  value={profileData.panNumber}
                  onChange={(e) => setProfileData({...profileData, panNumber: e.target.value.toUpperCase()})}
                  readOnly={!isEditing}
                  placeholder="Enter PAN number"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isEditing ? 'bg-white' : 'bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Number</label>
                <input
                  type={isEditing ? 'text' : 'password'}
                  value={profileData.aadharNumber}
                  onChange={(e) => setProfileData({...profileData, aadharNumber: e.target.value})}
                  readOnly={!isEditing}
                  placeholder="Enter Aadhar number"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isEditing ? 'bg-white' : 'bg-gray-50'
                  }`}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AssociateProfile;