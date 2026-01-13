import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Edit, Trash2, Eye, Phone, Mail,
  Calendar, Search, Key, Shield, UserCheck, EyeOff
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { Pagination, ExportButton, usePagination } from '../utils/tableUtils.jsx';
import { associatesAPI } from '../utils/api'; 

const AssociateManagement = () => {

  const [searchTerm, setSearchTerm] = useState('');
  const [associates, setAssociates] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalType, setModalType] = useState('add');
  const [selectedAssociate, setSelectedAssociate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewAssociate, setViewAssociate] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    associateId: null,
    newPassword: '',
    confirmPassword: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
    department: '',
    permissions: []
  });

  const rolePermissions = {
    'Sales Executive': ['leads'],
    'Team Lead': ['leads', 'projects'],
    'Sales Manager': ['leads', 'projects', 'reports']
  };

  const permissionLabels = {
    leads: 'Lead Management',
    projects: 'Project Management',
    reports: 'Reports & Analytics'
  };

  // ================= FETCH ASSOCIATES =================
  const fetchAssociates = async () => {
    try {
      setLoading(true);
      const res = await associatesAPI.getAll();
      setAssociates(res.data || res);
    } catch (err) {
      toast.error(err.message || 'Failed to load associates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssociates();
  }, []);

  // ================= FILTER + PAGINATION =================
  const filteredAssociates = associates.filter(a =>
    a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.phone?.includes(searchTerm) ||
    a.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { currentPage, totalPages, currentData, goToPage, totalItems } =
    usePagination(filteredAssociates, 10);

  // ================= HANDLERS =================
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setFormData({
      ...formData,
      role,
      permissions: rolePermissions[role] || []
    });
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleAddAssociate = () => {
    setModalType('add');
    setSelectedAssociate(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: '',
      department: '',
      permissions: []
    });
    setShowModal(true);
  };

  const handleEditAssociate = (associate) => {
    setModalType('edit');
    setSelectedAssociate(associate);
    setFormData({
      name: associate.name,
      phone: associate.phone,
      email: associate.email,
      username: associate.username,
      password: '',
      confirmPassword: '',
      role: associate.role,
      department: associate.department,
      permissions: associate.permissions || []
    });
    setShowModal(true);
  };

  const handleViewAssociate = (associate) => {
    setViewAssociate(associate);
    setShowPassword(false);
    setShowViewModal(true);
  };

  // ================= ADD / UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalType === 'add') {
        if (formData.password !== formData.confirmPassword) {
          return toast.error('Passwords do not match');
        }

        const response = await associatesAPI.create(formData);
        if (response.success) {
          toast.success('Associate added successfully');
          // Show the newly created associate with password
          if (response.data) {
            setViewAssociate(response.data);
            setShowViewModal(true);
          }
        }
      } else {
        const updateData = { 
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          permissions: formData.permissions
        };

        // Remove empty fields
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === '' || updateData[key] === null || updateData[key] === undefined) {
            delete updateData[key];
          }
        });

        await associatesAPI.update(selectedAssociate._id || selectedAssociate.id, updateData);
        toast.success('Associate updated successfully');
      }

      setShowModal(false);
      fetchAssociates();

    } catch (err) {
      console.error('Associate operation error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Operation failed';
      toast.error(errorMessage);
    }
  };

  // ================= DELETE =================
  const handleDeleteAssociate = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Associate?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete'
    });

    if (result.isConfirmed) {
      try {
        await associatesAPI.delete(id);
        toast.success('Associate deleted');
        fetchAssociates();
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  // ================= CHANGE PASSWORD =================
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      await associatesAPI.changePassword(passwordData.associateId, {
        newPassword: passwordData.newPassword
      });

      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordData({ associateId: null, newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ================= UI =================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Associate Management</h1>
          <p className="text-gray-600 mt-2">Manage and track all your associates</p>
        </div>
        <button
          onClick={handleAddAssociate}
          className="btn-primary mt-4 sm:mt-0 flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Add New Associate</span>
          <span className="sm:hidden">Add Associate</span>
        </button>
      </div>

      <div className="card">
        {/* Search and Export */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search associates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <ExportButton 
            data={filteredAssociates} 
            filename="associates"
            headers={['Name', 'Phone', 'Email', 'Role', 'Department', 'Status', 'Date']}
          />
        </div>

        {/* Associates Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Associate Details</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Contact</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Role</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Department</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Status</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Date</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  </td>
                </tr>
              ) : currentData.length > 0 ? (
                currentData.map((associate) => (
                  <tr key={associate._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-black rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{associate.name}</p>
                          <p className="text-sm text-gray-600">{associate.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{associate.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{associate.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{associate.role || 'Sales Executive'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span className="text-sm text-gray-900">{associate.department || 'Sales'}</span>
                    </td>
                    <td className="py-4 px-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        associate.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {associate.status}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{new Date(associate.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewAssociate(associate)}
                          className="btn-primary p-2 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditAssociate(associate)}
                          className="btn-primary p-2 rounded-lg"
                          title="Edit Associate"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAssociate(associate._id)}
                          className="btn-primary p-2 rounded-lg"
                          title="Delete Associate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setPasswordData({ ...passwordData, associateId: associate._id });
                            setShowPasswordModal(true);
                          }}
                          className="btn-primary p-2 rounded-lg"
                          title="Change Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No associates found</h3>
                    <p className="text-gray-600 mb-4">Get started by adding your first associate</p>
                    <button onClick={handleAddAssociate} className="btn-primary">
                      Add Associate
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            itemsPerPage={10}
            totalItems={totalItems}
          />
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalType === 'add' ? 'Add New Associate' : 'Edit Associate'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 9876543210"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      required={modalType === 'add'}
                      disabled={modalType === 'edit'}
                    />
                  </div>
                </div>

                {modalType === 'add' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleRoleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="Sales Executive">Sales Executive</option>
                      <option value="Team Lead">Team Lead</option>
                      <option value="Sales Manager">Sales Manager</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="e.g., Sales"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="space-y-2">
                    {Object.entries(permissionLabels).map(([key, label]) => (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(key)}
                          onChange={() => handlePermissionChange(key)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    {modalType === 'add' ? 'Add Associate' : 'Update Associate'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Associate Modal */}
      {showViewModal && viewAssociate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Associate Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Associate Info */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-black rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">{viewAssociate.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{viewAssociate.name}</h3>
                    <p className="text-gray-600">@{viewAssociate.username}</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                      viewAssociate.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {viewAssociate.status}
                    </span>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">{viewAssociate.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{viewAssociate.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Role & Department</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Role</p>
                          <p className="font-medium">{viewAssociate.role || 'Sales Executive'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <UserCheck className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Department</p>
                          <p className="font-medium">{viewAssociate.department || 'Sales'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                {viewAssociate.permissions && viewAssociate.permissions.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Permissions</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewAssociate.permissions.map(perm => (
                        <span key={perm} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {permissionLabels[perm] || perm}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Login Credentials */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Login Credentials</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <UserCheck className="w-5 h-5 text-yellow-600" />
                          <div>
                            <p className="text-sm text-gray-600">Username</p>
                            <p className="font-medium text-gray-900">{viewAssociate.username}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Key className="w-5 h-5 text-yellow-600" />
                          <div>
                            <p className="text-sm text-gray-600">Password</p>
                            <p className="font-mono text-sm bg-white px-3 py-1 rounded border border-yellow-300">
                              {showPassword ? (viewAssociate.plainPassword || 'Password hidden for security') : '••••••••'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5 text-yellow-600" /> : <Eye className="w-5 h-5 text-yellow-600" />}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-yellow-700 mt-3 flex items-center">
                      <Shield className="w-3 h-3 mr-1" />
                      {viewAssociate.plainPassword ? 'Share these credentials securely with the associate' : 'Password is only visible when first created'}
                    </p>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Additional Information</h4>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Date Added</p>
                      <p className="font-medium">{new Date(viewAssociate.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditAssociate(viewAssociate);
                    }}
                    className="flex-1 btn-primary flex items-center justify-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Associate</span>
                  </button>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password *</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssociateManagement;
