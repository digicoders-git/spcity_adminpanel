import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Users,
  DollarSign,
  Plus,
  Search,
  Filter,
  Calendar,
  Building,
  User,
  Trash2,
  Edit,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Car,
  MapPin,
  Fuel,
  Navigation,
  Eye,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import { expensesAPI, associatesAPI, leadsAPI, projectsAPI } from '../utils/api';
import Swal from 'sweetalert2';

const ExpenseManagement = () => {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [associates, setAssociates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [viewingExpense, setViewingExpense] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const associateId = queryParams.get('associate');

  const [filters, setFilters] = useState({
    category: '',
    status: '',
    startDate: '',
    endDate: '',
    associate: associateId || ''
  });

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    amount: '',
    paymentMode: 'Cash',
    associate: '',
    lead: '',
    project: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    vehicleDetails: {
      vehicleType: '',
      vehicleNumber: '',
      driverName: '',
      fromLocation: '',
      toLocation: '',
      kmStart: '',
      kmEnd: '',
      fuelType: '',
      fuelAmount: ''
    }
  });

  useEffect(() => {
    fetchExpenses();
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchExpenses = async (page = 1) => {
    try {
      setLoading(true);
      const res = await expensesAPI.getAll({ ...filters, page, limit: pagination.limit });
      if (res.success) {
        setExpenses(res.data);
        if (res.pagination) {
          setPagination(prev => ({ ...prev, ...res.pagination }));
        }
      }
    } catch (err) {
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [ascRes, , projRes] = await Promise.all([
        associatesAPI.getAll(),
        leadsAPI.getAll(),
        projectsAPI.getAll()
      ]);
      setAssociates(ascRes.data || []);
      setProjects(projRes.data || []);
    } catch (err) {
      console.error('Initial data fetch failed');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('vehicle.')) {
      const field = name.replace('vehicle.', '');
      setFormData(prev => ({
        ...prev,
        vehicleDetails: { 
          ...(prev.vehicleDetails || {}), 
          [field]: value 
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean up empty strings for fields that expect ObjectIds or numbers
      const submissionData = { ...formData };
      if (!submissionData.associate) delete submissionData.associate;
      if (!submissionData.lead) delete submissionData.lead;
      if (!submissionData.project) delete submissionData.project;
      
      // Keep vehicleDetails always, but clean up numeric fields
      if (submissionData.vehicleDetails) {
        if (submissionData.vehicleDetails.kmStart) submissionData.vehicleDetails.kmStart = parseFloat(submissionData.vehicleDetails.kmStart);
        if (submissionData.vehicleDetails.kmEnd) submissionData.vehicleDetails.kmEnd = parseFloat(submissionData.vehicleDetails.kmEnd);
        if (submissionData.vehicleDetails.fuelAmount) submissionData.vehicleDetails.fuelAmount = parseFloat(submissionData.vehicleDetails.fuelAmount);
      }
      
      // Ensure amount is a number
      if (submissionData.amount) submissionData.amount = parseFloat(submissionData.amount);

      if (modalType === 'add') {
        const res = await expensesAPI.create(submissionData);
        if (res.success) toast.success('Expense added successfully');
      } else {
        const res = await expensesAPI.update(selectedExpense._id, submissionData);
        if (res.success) toast.success('Expense updated successfully');
      }
      setShowModal(false);
      fetchExpenses(pagination.current);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await expensesAPI.delete(id);
        toast.success('Deleted successfully');
        fetchExpenses(pagination.current);
      } catch (error) {
        toast.error(error.response?.data?.message || error.message || 'Delete failed');
      }
    }
  };

  const openEditModal = (expense) => {
    setSelectedExpense(expense);
    setModalType('edit');
    setFormData({
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      paymentMode: expense.paymentMode,
      associate: expense.associate?._id || '',
      lead: expense.lead?._id || '',
      project: expense.project?._id || '',
      description: expense.description || '',
      date: new Date(expense.date).toISOString().split('T')[0],
      vehicleDetails: expense.vehicleDetails || {
        vehicleType: '', vehicleNumber: '', driverName: '',
        fromLocation: '', toLocation: '', kmStart: '', kmEnd: '',
        fuelType: '', fuelAmount: ''
      }
    });
    setShowModal(true);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalAdvances = expenses.filter(e => e.category === 'Advance').reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Expense & Advance Management</h1>
          <p className="text-gray-500 mt-1 font-medium italic text-sm">Track flows, manage advances, and monitor office spending</p>
        </div>
        <button
          onClick={() => {
            setModalType('add');
            setFormData({
              title: '', category: '', amount: '', paymentMode: 'Cash',
              associate: '', lead: '', project: '', description: '',
              date: new Date().toISOString().split('T')[0],
              vehicleDetails: {
                vehicleType: '', vehicleNumber: '', driverName: '',
                fromLocation: '', toLocation: '', kmStart: '', kmEnd: '',
                fuelType: '', fuelAmount: ''
              }
            });
            setShowModal(true);
          }}
          className="btn-primary mt-4 sm:mt-0 flex items-center space-x-2 px-6 py-3 rounded-2xl shadow-lg hover:shadow-red-200 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold">Record Expense</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-white to-gray-50 border-l-4 border-red-600">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Monthly Spends</p>
              <p className="text-3xl font-black text-gray-900">₹{totalExpenses.toLocaleString()}</p>
            </div>
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center border border-red-200 shadow-inner">
              <DollarSign className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-white to-gray-50 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Active Advances</p>
              <p className="text-3xl font-black text-gray-900">₹{totalAdvances.toLocaleString()}</p>
            </div>
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center border border-orange-200 shadow-inner">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-white to-gray-50 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Expenses Count</p>
              <p className="text-3xl font-black text-gray-900">{expenses.length}</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center border border-blue-200 shadow-inner">
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">CATEGORY</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
            >
              <option value="">All Categories</option>
              {['Advance', 'Salary', 'Office', 'Marketing', 'Project', 'Travel', 'Other'].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">STATUS</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
            >
              <option value="">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">START DATE</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">END DATE</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-bold text-[11px] text-gray-500 uppercase tracking-wider">Detail / Category</th>
                <th className="text-left py-4 px-6 font-bold text-[11px] text-gray-500 uppercase tracking-wider">Recipient</th>
                <th className="text-left py-4 px-6 font-bold text-[11px] text-gray-500 uppercase tracking-wider">Vehicle Info</th>
                <th className="text-left py-4 px-6 font-bold text-[11px] text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="text-left py-4 px-6 font-bold text-[11px] text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left py-4 px-6 font-bold text-[11px] text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-center py-4 px-6 font-bold text-[11px] text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-20 text-gray-500 font-bold italic">No expense records found.</td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 text-sm line-clamp-1">{expense.title}</span>
                        <span className={`text-[10px] font-bold uppercase mt-1 px-2 py-0.5 rounded border w-fit ${
                          expense.category === 'Advance' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                          expense.category === 'Salary' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                          'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                          {expense.category}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800 truncate max-w-[150px]">
                          {expense.associate?.name || expense.lead?.name || 'Self / Office'}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">
                           {expense.associate ? 'Associate' : expense.lead ? 'Lead' : 'Operation'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {expense.vehicleDetails?.vehicleNumber || expense.vehicleDetails?.vehicleType ? (
                        <div className="flex flex-col text-xs space-y-0.5">
                          <div className="flex items-center gap-1.5 font-bold text-gray-700">
                             <Car className="w-3 h-3 text-amber-600" />
                             <span>{expense.vehicleDetails.vehicleNumber || expense.vehicleDetails.vehicleType}</span>
                          </div>
                          {(expense.vehicleDetails.fromLocation || expense.vehicleDetails.toLocation) && (
                            <div className="text-[10px] text-gray-400 font-medium truncate max-w-[120px]">
                              {expense.vehicleDetails.fromLocation} → {expense.vehicleDetails.toLocation}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300">--</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-base">₹{expense.amount.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">{expense.paymentMode}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                        {new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        expense.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        expense.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {expense.status}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            setViewingExpense(expense);
                            setShowViewModal(true);
                          }}
                          className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(expense)}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination UI */}
        {!loading && expenses.length > 0 && pagination.pages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Showing {((pagination.current - 1) * pagination.limit) + 1} to {Math.min(pagination.current * pagination.limit, pagination.total)} of {pagination.total} records
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchExpenses(pagination.current - 1)}
                disabled={pagination.current === 1}
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center space-x-1">
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => fetchExpenses(i + 1)}
                    className={`w-8 h-8 rounded-xl font-black text-xs transition-all ${
                      pagination.current === i + 1
                        ? 'bg-gray-900 text-white shadow-lg'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => fetchExpenses(pagination.current + 1)}
                disabled={pagination.current === pagination.pages}
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[95vh]">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-black text-gray-900">
                {modalType === 'add' ? 'Record New Expense' : 'Modify Record'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500 font-black"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">TITLE / PURPOSE *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 font-bold text-gray-900 text-sm"
                      placeholder="e.g. Office Rent, Marketing Ad Spends..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">CATEGORY *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 font-bold text-sm"
                      required
                    >
                      <option value="">Select Category</option>
                      {['Advance', 'Salary', 'Office', 'Marketing', 'Project', 'Travel', 'Other'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">AMOUNT (₹) *</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 font-black text-lg"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">PAYMENT MODE *</label>
                    <select
                      name="paymentMode"
                      value={formData.paymentMode}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 font-bold text-sm"
                      required
                    >
                      <option value="Cash">Cash</option>
                      <option value="Online">Online</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">DATE *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 font-bold text-sm"
                      required
                    />
                  </div>

                  {/* Conditional Fields */}
                  {(formData.category === 'Advance' || formData.category === 'Salary') && (
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">ASSOCIATE</label>
                      <select
                        name="associate"
                        value={formData.associate}
                        onChange={handleInputChange}
                        className="w-full bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                      >
                        <option value="">Select Associate</option>
                        {associates.map(asc => (
                          <option key={asc._id} value={asc._id}>{asc.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.category === 'Project' && (
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">PROJECT LINK</label>
                      <select
                        name="project"
                        value={formData.project}
                        onChange={handleInputChange}
                        className="w-full bg-green-50 px-4 py-2.5 rounded-xl border border-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 font-bold text-sm"
                      >
                        <option value="">Select Project</option>
                        {projects.map(p => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                {/* Vehicle Details Section - Always Visible */}
                <div className="mt-2 p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-4 shadow-sm border-l-4 border-l-amber-500">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Car className="w-5 h-5 text-amber-700" />
                    </div>
                    <h4 className="text-sm font-black text-gray-700 uppercase tracking-wider">Vehicle / Travel Details (Optional)</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 text-xs">Vehicle Type</label>
                      <select
                        name="vehicle.vehicleType"
                        value={formData.vehicleDetails?.vehicleType || ''}
                        onChange={handleInputChange}
                        className="w-full bg-white px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-sm"
                      >
                        <option value="">Select Type</option>
                        {['Car', 'Bike', 'Auto', 'Bus', 'Taxi', 'Truck', 'Other'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 text-xs">Vehicle Number</label>
                      <input
                        type="text"
                        name="vehicle.vehicleNumber"
                        value={formData.vehicleDetails?.vehicleNumber || ''}
                        onChange={handleInputChange}
                        placeholder="UP32 AB 1234"
                        className="w-full bg-white px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-sm uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 text-xs">Driver Name</label>
                      <input
                        type="text"
                        name="vehicle.driverName"
                        value={formData.vehicleDetails?.driverName || ''}
                        onChange={handleInputChange}
                        placeholder="Driver Name"
                        className="w-full bg-white px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 text-xs">Fuel Type</label>
                      <select
                        name="vehicle.fuelType"
                        value={formData.vehicleDetails?.fuelType || ''}
                        onChange={handleInputChange}
                        className="w-full bg-white px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-sm"
                      >
                        <option value="">Select Fuel</option>
                        {['Petrol', 'Diesel', 'CNG', 'Electric', 'Other'].map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 text-xs"><Navigation className="w-3 h-3 inline mr-1" />From</label>
                      <input
                        type="text"
                        name="vehicle.fromLocation"
                        value={formData.vehicleDetails?.fromLocation || ''}
                        onChange={handleInputChange}
                        placeholder="Starting location"
                        className="w-full bg-white px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 text-xs"><MapPin className="w-3 h-3 inline mr-1" />To</label>
                      <input
                        type="text"
                        name="vehicle.toLocation"
                        value={formData.vehicleDetails?.toLocation || ''}
                        onChange={handleInputChange}
                        placeholder="Destination"
                        className="w-full bg-white px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 text-xs">KM Start</label>
                      <input
                        type="number"
                        name="vehicle.kmStart"
                        value={formData.vehicleDetails?.kmStart || ''}
                        onChange={handleInputChange}
                        className="w-full bg-white px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 text-xs">KM End</label>
                      <input
                        type="number"
                        name="vehicle.kmEnd"
                        value={formData.vehicleDetails?.kmEnd || ''}
                        onChange={handleInputChange}
                        className="w-full bg-white px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-sm"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 text-xs"><Fuel className="w-3 h-3 inline mr-1" />Fuel Cost (₹)</label>
                      <input
                        type="number"
                        name="vehicle.fuelAmount"
                        value={formData.vehicleDetails?.fuelAmount || ''}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="w-full bg-white px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-black text-base"
                      />
                    </div>

                    {/* Distance Summary */}
                    {formData.vehicleDetails?.kmStart && formData.vehicleDetails?.kmEnd && (
                      <div className="col-span-2 bg-amber-50 rounded-xl px-4 py-2 flex items-center justify-between border border-amber-100">
                        <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest leading-none">Total Distance Travelled</span>
                        <span className="text-base font-black text-amber-900 leading-none">
                          {Math.max(0, Number(formData.vehicleDetails.kmEnd) - Number(formData.vehicleDetails.kmStart))} KM
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">DESCRIPTION / NOTES</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-sm"
                    placeholder="Additional details about the expense..."
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary py-3 px-4 rounded-xl font-black text-base shadow-lg hover:shadow-red-200"
                  >
                    {modalType === 'add' ? 'Save Record' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* View Details Modal */}
      {showViewModal && viewingExpense && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[60]">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white leading-tight">Expense Insight</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transaction Records</p>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white font-black"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar p-6 space-y-6">
              {/* Main Badge & Title */}
              <div className="text-center space-y-2">
                <div className={`inline-flex items-center px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${
                  viewingExpense.status === 'Approved' ? 'bg-green-100 text-green-700' :
                  viewingExpense.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {viewingExpense.status}
                </div>
                <h3 className="text-2xl font-black text-gray-900 leading-tight">{viewingExpense.title}</h3>
                <div className="text-4xl font-black text-red-600 tracking-tighter">
                  ₹{viewingExpense.amount.toLocaleString()}
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Category</p>
                  <p className="text-sm font-bold text-gray-800">{viewingExpense.category}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Mode</p>
                  <p className="text-sm font-bold text-gray-800">{viewingExpense.paymentMode}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
                  <p className="text-sm font-bold text-gray-800">
                    {new Date(viewingExpense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Recipient</p>
                  <p className="text-sm font-bold text-gray-800">
                    {viewingExpense.associate?.name || viewingExpense.lead?.name || 'Self / Office'}
                  </p>
                </div>
              </div>

              {/* Vehicle / Travel Details (Only if present) */}
              {(viewingExpense.vehicleDetails?.vehicleType || viewingExpense.vehicleDetails?.vehicleNumber) && (
                <div className="p-5 bg-amber-50 rounded-[2rem] border border-amber-100 space-y-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Car size={80} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-amber-200 rounded-xl">
                      <Car className="w-5 h-5 text-amber-800" />
                    </div>
                    <span className="text-sm font-black text-amber-900 uppercase tracking-widest">Travel & Logistics</span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 relative z-10">
                    <div>
                      <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest mb-0.5">Vehicle</p>
                      <p className="text-sm font-black text-amber-900">{viewingExpense.vehicleDetails.vehicleType} | {viewingExpense.vehicleDetails.vehicleNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest mb-0.5">Driver</p>
                      <p className="text-sm font-bold text-amber-900">{viewingExpense.vehicleDetails.driverName || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                       <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest mb-1">Route</p>
                       <div className="flex items-center space-x-2 bg-white/50 p-2 rounded-xl border border-amber-200/50">
                         <MapPin className="w-3 h-3 text-red-500" />
                         <span className="text-xs font-bold text-amber-950">{viewingExpense.vehicleDetails.fromLocation || 'Unknown'}</span>
                         <span className="text-amber-300">→</span>
                         <span className="text-xs font-bold text-amber-950">{viewingExpense.vehicleDetails.toLocation || 'Unknown'}</span>
                       </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest mb-0.5">Reading (Start/End)</p>
                      <p className="text-xs font-bold text-amber-900 italic">
                        {viewingExpense.vehicleDetails.kmStart} KM - {viewingExpense.vehicleDetails.kmEnd} KM
                      </p>
                      <p className="text-sm font-black text-amber-950 mt-0.5">
                         Total: {Number(viewingExpense.vehicleDetails.kmEnd) - Number(viewingExpense.vehicleDetails.kmStart)} KM
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest mb-0.5">Fuel & Energy</p>
                      <p className="text-sm font-bold text-amber-900">{viewingExpense.vehicleDetails.fuelType || 'N/A'}</p>
                      <p className="text-xs font-black text-green-600 mt-0.5">Cost: ₹{viewingExpense.vehicleDetails.fuelAmount || 0}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {viewingExpense.description && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                    <Edit className="w-3 h-3 mr-1" /> Description / Notes
                  </p>
                  <div className="p-4 bg-blue-50/50 text-sm font-medium text-gray-600 rounded-2xl border border-blue-100 italic leading-relaxed">
                    "{viewingExpense.description}"
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-gray-200"
              >
                Close Insights
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseManagement;
