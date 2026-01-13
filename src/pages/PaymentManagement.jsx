import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Eye, Calendar, User, Building, Search, CheckCircle, Clock, MoreVertical, Filter, Edit, Trash2, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { Pagination, ExportButton, usePagination } from '../utils/tableUtils.jsx';
import { paymentsAPI, projectsAPI } from '../utils/api';
import Swal from 'sweetalert2';

const PaymentManagement = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewPayment, setViewPayment] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    project: '',
    amount: '',
    paymentType: '',
    paymentMethod: '',
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchPayments();
    fetchProjects();
  }, [activeTab, searchTerm]);

  const fetchPayments = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(activeTab !== 'all' && { status: activeTab })
      };
      
      const response = await paymentsAPI.getAll(params);
      if (response.success) {
        setPayments(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch payments');
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      if (response.success) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const tabs = [
    { key: 'all', label: 'All Payments', count: pagination.total },
    { key: 'Received', label: 'Received', count: payments.filter(p => p.status === 'Received').length },
    { key: 'Pending', label: 'Pending', count: payments.filter(p => p.status === 'Pending').length }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Received': return 'green';
      case 'Pending': return 'yellow';
      case 'Bounced': return 'red';
      case 'Cancelled': return 'gray';
      default: return 'gray';
    }
  };

  const filteredPayments = payments;
  const totalReceived = payments.filter(p => p.status === 'Received').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);

  const handlePageChange = (page) => {
    fetchPayments(page);
  };

  const handleViewPayment = (payment) => {
    setViewPayment(payment);
    setShowViewModal(true);
  };

  const handleEditPayment = (payment) => {
    setModalType('edit');
    setSelectedPayment(payment);
    setFormData({
      clientName: payment.clientName,
      project: payment.project,
      amount: payment.amount.toString(),
      type: payment.type,
      paymentDate: payment.date,
      dueDate: payment.dueDate,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      transactionId: payment.transactionId || ''
    });
    setShowModal(true);
  };

  const handleAddPayment = () => {
    setModalType('add');
    setFormData({
      clientName: '',
      project: '',
      amount: '',
      type: '',
      paymentDate: '',
      dueDate: '',
      paymentMethod: '',
      status: 'Pending',
      transactionId: ''
    });
    setShowModal(true);
  };

  const handleDeletePayment = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Payment?',
      text: 'Are you sure you want to delete this payment record? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await paymentsAPI.delete(id);
        toast.success('Payment deleted successfully!');
        fetchPayments();
      } catch (error) {
        toast.error('Failed to delete payment');
        console.error('Error deleting payment:', error);
      }
    }
    setDropdownOpen(null);
  };

  const handleMarkReceived = async (payment) => {
    const result = await Swal.fire({
      title: 'Mark as Received?',
      text: `Mark payment of ₹${payment.amount.toLocaleString()} from ${payment.customerName} as received?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, mark received!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await paymentsAPI.updateStatus(payment._id, 'Received');
        toast.success('Payment marked as received!');
        fetchPayments();
      } catch (error) {
        toast.error('Failed to update payment status');
        console.error('Error updating payment status:', error);
      }
    }
    setDropdownOpen(null);
  };

  const toggleDropdown = (paymentId) => {
    setDropdownOpen(dropdownOpen === paymentId ? null : paymentId);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modalType === 'add') {
        await paymentsAPI.create(formData);
        toast.success(`Payment record for ${formData.customerName} has been added.`);
      } else {
        await paymentsAPI.update(selectedPayment._id, formData);
        toast.success(`Payment record for ${formData.customerName} has been updated.`);
      }
      
      setFormData({
        customerName: '',
        customerPhone: '',
        project: '',
        amount: '',
        paymentType: '',
        paymentMethod: '',
        dueDate: '',
        notes: ''
      });
      setShowModal(false);
      fetchPayments();
    } catch (error) {
      toast.error(`Failed to ${modalType} payment`);
      console.error(`Error ${modalType}ing payment:`, error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-2">Track and manage all payments</p>
        </div>
        <button
          onClick={handleAddPayment}
          className="btn-primary mt-4 sm:mt-0 flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Add Payment</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Received</p>
              <p className="text-2xl font-bold text-green-600">₹{(totalReceived / 100000).toFixed(1)}L</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pending</p>
              <p className="text-2xl font-bold text-yellow-600">₹{(totalPending / 100000).toFixed(1)}L</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-purple-600">₹{((totalReceived + totalPending) / 100000).toFixed(1)}L</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-red-600 to-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Search and Export */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex gap-2">
            <ExportButton 
              data={filteredPayments} 
              filename="payments" 
              headers={['Client Name', 'Project', 'Amount', 'Type', 'Status', 'Payment Method', 'Date', 'Due Date', 'Transaction ID']}
            />
            <button className="btn-primary flex items-center space-x-2 px-4 py-3">
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Client & Project</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Amount & Type</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Payment Details</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Dates</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Status</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-black rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">{payment.customerName.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{payment.customerName}</p>
                          <div className="flex items-center space-x-1">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{payment.project?.name || 'No Project'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div>
                        <p className="font-bold text-gray-900">₹{payment.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{payment.paymentType}</p>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div>
                        <p className="text-sm text-gray-900">{payment.paymentMethod}</p>
                        {payment.transactionId && (
                          <p className="text-xs text-gray-500">ID: {payment.transactionId}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Created: {new Date(payment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Due: {new Date(payment.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-2">
                        {payment.status === 'Received' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-yellow-500" />}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'Received' ? 'bg-green-100 text-green-800' : 
                          payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          payment.status === 'Bounced' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewPayment(payment)}
                          className="btn-primary p-2 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {payment.status === 'Pending' && (
                          <button 
                            onClick={() => handleEditPayment(payment)}
                            className="btn-primary px-3 py-2 rounded-lg text-xs"
                          >
                            Edit
                          </button>
                        )}
                        <div className="relative">
                          <button 
                            onClick={() => toggleDropdown(payment._id)}
                            className="btn-primary p-2 rounded-lg"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {dropdownOpen === payment._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    handleViewPayment(payment);
                                    setDropdownOpen(null);
                                  }}
                                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span>View Details</span>
                                </button>
                                
                                {payment.status === 'Pending' && (
                                  <>
                                    <button
                                      onClick={() => {
                                        handleEditPayment(payment);
                                        setDropdownOpen(null);
                                      }}
                                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <Edit className="w-4 h-4" />
                                      <span>Edit Payment</span>
                                    </button>
                                    
                                    <button
                                      onClick={() => handleMarkReceived(payment)}
                                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                    >
                                      <Check className="w-4 h-4" />
                                      <span>Mark as Received</span>
                                    </button>
                                  </>
                                )}
                                
                                <hr className="my-1" />
                                
                                <button
                                  onClick={() => handleDeletePayment(payment._id)}
                                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete Payment</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                    <p className="text-gray-600 mb-4">Get started by adding your first payment record</p>
                    <button onClick={handleAddPayment} className="btn-primary">
                      Add Payment
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Pagination
            currentPage={pagination.current}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
            itemsPerPage={10}
            totalItems={pagination.total}
          />
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalType === 'add' ? 'Add Payment Record' : 'Edit Payment Record'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Phone *</label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project *</label>
                    <select
                      name="project"
                      value={formData.project}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="">Select Project</option>
                      {projects.map(project => (
                        <option key={project._id} value={project._id}>{project.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹) *</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type *</label>
                    <select
                      name="paymentType"
                      value={formData.paymentType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Booking">Booking</option>
                      <option value="Installment">Installment</option>
                      <option value="Final">Final</option>
                      <option value="Token">Token</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="">Select Method</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Online">Online</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Additional notes..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
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
                    {modalType === 'add' ? 'Add Payment' : 'Update Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Payment Modal */}
      {showViewModal && viewPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Payment Info */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-black rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">{viewPayment.clientName.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{viewPayment.clientName}</h3>
                    <p className="text-gray-600">Payment ID: #{viewPayment.id}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        viewPayment.status === 'Received' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {viewPayment.status}
                      </span>
                      <span className="text-xs text-gray-500">{viewPayment.type}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Amount */}
                <div className="bg-green-50 p-6 rounded-xl text-center">
                  <p className="text-3xl font-bold text-green-600">₹{viewPayment.amount.toLocaleString()}</p>
                  <p className="text-gray-600 mt-1">{viewPayment.type}</p>
                </div>

                {/* Payment Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Project Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Building className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Project</p>
                          <p className="font-medium">{viewPayment.project}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Payment Method</p>
                          <p className="font-medium">{viewPayment.paymentMethod}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Timeline</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Payment Date</p>
                          <p className="font-medium">{viewPayment.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Due Date</p>
                          <p className="font-medium">{viewPayment.dueDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                {viewPayment.transactionId && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Transaction Details</h4>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600">Transaction ID</p>
                      <p className="font-mono font-medium text-gray-900">{viewPayment.transactionId}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4 border-t">
                  {viewPayment.status === 'Pending' && (
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleEditPayment(viewPayment);
                      }}
                      className="flex-1 btn-primary flex items-center justify-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Payment</span>
                    </button>
                  )}
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

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setDropdownOpen(null)}
        ></div>
      )}
    </div>
  );
};

export default PaymentManagement;