import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, Mail, MapPin, Calendar, Edit, Save, Camera, Award, TrendingUp, CreditCard, FileText, Upload, Download, ExternalLink, X, Building, Users, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { associatesAPI, commissionsAPI, dashboardAPI } from '../../utils/api';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://spcity-backend.onrender.com/api';
const BACKEND_URL = API_BASE_URL.replace('/api', '');

const getFileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}/${path.replace(/\\/g, '/')}`;
};

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
    bio: '',
    bankAccount: '', // Legacy support
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      branchName: ''
    },
    panNumber: '',
    aadhaarNumber: '',
    documents: {
      panCard: '',
      aadhaarCard: ''
    }
  });

  const [files, setFiles] = useState({
    panCard: null,
    aadhaarCard: null
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
          bio: response.data.bio || '',
          bankAccount: response.data.bankAccount || '',
          bankDetails: response.data.bankDetails || {
            accountHolderName: response.data.name || '',
            accountNumber: response.data.bankAccount || '',
            bankName: '',
            ifscCode: '',
            branchName: ''
          },
          panNumber: response.data.panNumber || '',
          aadhaarNumber: response.data.aadhaarNumber || '',
          documents: response.data.documents || {
            panCard: '',
            aadhaarCard: ''
          }
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData({
        ...profileData,
        [parent]: {
          ...profileData[parent],
          [child]: value
        }
      });
    } else {
      setProfileData({
        ...profileData,
        [name]: value
      });
    }
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      setFiles({
        ...files,
        [name]: selectedFiles[0]
      });
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
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('phone', profileData.phone);
      formData.append('address', profileData.address);
      formData.append('bio', profileData.bio);
      formData.append('panNumber', profileData.panNumber);
      formData.append('aadhaarNumber', profileData.aadhaarNumber);
      formData.append('bankDetails', JSON.stringify(profileData.bankDetails));

      if (files.panCard) {
        formData.append('panCard', files.panCard);
      }
      if (files.aadhaarCard) {
        formData.append('aadhaarCard', files.aadhaarCard);
      }
      
      const response = await associatesAPI.updateProfile(formData);
      
      if (response.success) {
        setIsEditing(false);
        toast.success('Profile updated successfully!');
        setFiles({ panCard: null, aadhaarCard: null });
        fetchProfile();
      }
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFiles({ panCard: null, aadhaarCard: null });
    fetchProfile(); 
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">Manage your personal information and view performance</p>
            </div>
            {!isEditing ? (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 w-full md:w-auto"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
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
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
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
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
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
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    rows={3}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isEditing ? 'bg-white' : 'bg-gray-50'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    rows={2}
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
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-red-600" />
              Financial Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                <input
                  type="text"
                  name="bankDetails.accountHolderName"
                  value={profileData.bankDetails.accountHolderName}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isEditing ? 'bg-white' : 'bg-gray-50'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                <input
                  type="text"
                  name="bankDetails.accountNumber"
                  value={profileData.bankDetails.accountNumber}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                    isEditing ? 'bg-white' : 'bg-gray-50'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  name="bankDetails.bankName"
                  value={profileData.bankDetails.bankName}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isEditing ? 'bg-white' : 'bg-gray-50'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                <input
                  type="text"
                  name="bankDetails.ifscCode"
                  value={profileData.bankDetails.ifscCode}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono ${
                    isEditing ? 'bg-white' : 'bg-gray-50'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                <input
                  type="text"
                  name="bankDetails.branchName"
                  value={profileData.bankDetails.branchName}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isEditing ? 'bg-white' : 'bg-gray-50'
                  }`}
                />
              </div>

              <div className="border-t md:col-span-2 pt-4 mt-2"></div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                <input
                  type="text"
                  name="panNumber"
                  value={profileData.panNumber}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-bold font-mono ${
                    isEditing ? 'bg-white' : 'bg-gray-50'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number</label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  value={profileData.aadhaarNumber}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold font-mono ${
                    isEditing ? 'bg-white' : 'bg-gray-50'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-red-600" />
              Identity Documents
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PAN Card */}
              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-gray-900">PAN Card</span>
                  {profileData.documents.panCard && (
                    <a 
                      href={getFileUrl(profileData.documents.panCard)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-700 flex items-center text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View
                    </a>
                  )}
                </div>
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="file"
                      name="panCard"
                      id="panCardUpload"
                      onChange={handleFileChange}
                      className="sr-only"
                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    />
                    <label 
                      htmlFor="panCardUpload"
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl bg-white hover:border-red-500 hover:bg-red-50 transition-all cursor-pointer active:bg-gray-100 touch-manipulation"
                    >
                      <div className="p-4 bg-red-50 rounded-full mb-3 pointer-events-none">
                        <Upload className="w-10 h-10 text-red-500" />
                      </div>
                      <span className="text-lg font-bold text-gray-900 mb-1 pointer-events-none text-center px-4">
                        {files.panCard ? files.panCard.name : 'Tap to select PAN Card'}
                      </span>
                      <p className="text-sm text-gray-500 text-center pointer-events-none">JPG, PNG, PDF, or Word files</p>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500">
                    {profileData.documents.panCard ? (
                      <div className="flex items-center text-green-600 text-sm">
                        <Save className="w-4 h-4 mr-1" />
                        Document uploaded
                      </div>
                    ) : (
                      <div className="flex items-center text-sm">
                        <X className="w-4 h-4 mr-1 text-gray-400" />
                        No document uploaded
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Aadhaar Card */}
              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-gray-900">Aadhaar Card</span>
                  {profileData.documents.aadhaarCard && (
                    <a 
                      href={getFileUrl(profileData.documents.aadhaarCard)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-700 flex items-center text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View
                    </a>
                  )}
                </div>
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="file"
                      name="aadhaarCard"
                      id="aadhaarCardUpload"
                      onChange={handleFileChange}
                      className="sr-only"
                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    />
                    <label 
                      htmlFor="aadhaarCardUpload"
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl bg-white hover:border-red-500 hover:bg-red-50 transition-all cursor-pointer active:bg-gray-100 touch-manipulation"
                    >
                      <div className="p-4 bg-blue-50 rounded-full mb-3 pointer-events-none">
                        <Upload className="w-10 h-10 text-blue-500" />
                      </div>
                      <span className="text-lg font-bold text-gray-900 mb-1 pointer-events-none text-center px-4">
                        {files.aadhaarCard ? files.aadhaarCard.name : 'Tap to select Aadhaar Card'}
                      </span>
                      <p className="text-sm text-gray-500 text-center pointer-events-none">JPG, PNG, PDF, or Word files</p>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500">
                    {profileData.documents.aadhaarCard ? (
                      <div className="flex items-center text-green-600 text-sm">
                        <Save className="w-4 h-4 mr-1" />
                        Document uploaded
                      </div>
                    ) : (
                      <div className="flex items-center text-sm">
                        <X className="w-4 h-4 mr-1 text-gray-400" />
                        No document uploaded
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AssociateProfile;