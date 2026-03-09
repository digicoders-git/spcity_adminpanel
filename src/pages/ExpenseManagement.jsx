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
  Clock
} from 'lucide-react';
import { toast } from 'react-toastify';
import { expensesAPI, associatesAPI, leadsAPI, projectsAPI } from '../utils/api';
import Swal from 'sweetalert2';

const ExpenseManagement = () => {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [associates, setAssociates] = useState([]);
  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedExpense, setSelectedExpense] = useState(null);

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
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchExpenses();
    fetchInitialData();
  }, [filters]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await expensesAPI.getAll(filters);
      if (res.success) {
        setExpenses(res.data);
      }
    } catch (error) {
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [ascRes, leadsRes, projRes] = await Promise.all([
        associatesAPI.getAll(),
        leadsAPI.getAll(),
        projectsAPI.getAll()
      ]);
      setAssociates(ascRes.data || []);
      setLeads(leadsRes.data || []);
      setProjects(projRes.data || []);
    } catch (error) {
      console.error('Failed to fetch initial data');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean up empty strings for fields that expect ObjectIds or numbers
      const submissionData = { ...formData };
      if (!submissionData.associate) delete submissionData.associate;
      if (!submissionData.lead) delete submissionData.lead;
      if (!submissionData.project) delete submissionData.project;
      
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
      fetchExpenses();
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
        fetchExpenses();
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
      date: new Date(expense.date).toISOString().split('T')[0]
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
              date: new Date().toISOString().split('T')[0]
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
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-5 px-6 font-black text-xs text-gray-400 uppercase tracking-widest">Detail & Category</th>
                <th className="text-left py-5 px-6 font-black text-xs text-gray-400 uppercase tracking-widest">Recipient</th>
                <th className="text-left py-5 px-6 font-black text-xs text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="text-left py-5 px-6 font-black text-xs text-gray-400 uppercase tracking-widest">Date</th>
                <th className="text-left py-5 px-6 font-black text-xs text-gray-400 uppercase tracking-widest">Status</th>
                <th className="text-center py-5 px-6 font-black text-xs text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-20 text-gray-500 font-bold italic">No expense records found.</td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="py-5 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 line-clamp-1">{expense.title}</span>
                        <span className={`text-[10px] font-black uppercase mt-1 w-fit px-2 py-0.5 rounded-md ${
                          expense.category === 'Advance' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {expense.category}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center space-x-2">
                        {expense.associate ? (
                          <>
                            <User className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-semibold text-gray-700">{expense.associate.name}</span>
                          </>
                        ) : expense.lead ? (
                          <>
                            <Users className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-semibold text-gray-700">{expense.lead.name}</span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Self / Office</span>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col text-right sm:text-left">
                        <span className="font-black text-gray-900">₹{expense.amount.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-400 italic">{expense.paymentMode}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-sm font-medium text-gray-600">{new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </td>
                    <td className="py-5 px-6">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        expense.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        expense.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {expense.status === 'Approved' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                        {expense.status}
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(expense)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
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
    </div>
  );
};

export default ExpenseManagement;
