import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Award, 
  Trash2, 
  Edit, 
  User, 
  CheckCircle2, 
  Download,
  Star
} from 'lucide-react';
import { toast } from 'react-toastify';
import { rewardsAPI, associatesAPI } from '../utils/api';
import Swal from 'sweetalert2';

const RewardManagement = () => {
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState([]);
  const [associates, setAssociates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedReward, setSelectedReward] = useState(null);

  const [filters, setFilters] = useState({
    month: '',
    year: new Date().getFullYear().toString(),
    associate: ''
  });

  const [formData, setFormData] = useState({
    associate: '',
    title: '',
    amount: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear().toString(),
    description: ''
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());

  useEffect(() => {
    fetchRewards();
    fetchAssociates();
  }, [filters]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const res = await rewardsAPI.getAll(filters);
      if (res.success) {
        setRewards(res.data);
      }
    } catch (error) {
      toast.error('Failed to fetch rewards');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssociates = async () => {
    try {
      const res = await associatesAPI.getAll();
      setAssociates(res.data || []);
    } catch (error) {
      console.error('Failed to fetch associates');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submissionData = { ...formData };
      submissionData.amount = parseFloat(submissionData.amount);

      if (modalType === 'add') {
        const res = await rewardsAPI.create(submissionData);
        if (res.success) toast.success('Reward distributed successfully! 🏆');
      } else {
        const res = await rewardsAPI.update(selectedReward._id, submissionData);
        if (res.success) toast.success('Reward updated successfully');
      }
      setShowModal(false);
      fetchRewards();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will remove the reward record!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await rewardsAPI.delete(id);
        toast.success('Reward deleted');
        fetchRewards();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const openEditModal = (reward) => {
    setSelectedReward(reward);
    setModalType('edit');
    setFormData({
      associate: reward.associate?._id || '',
      title: reward.title,
      amount: reward.amount,
      month: reward.month,
      year: reward.year,
      description: reward.description || ''
    });
    setShowModal(true);
  };

  const totalRewardsDistributed = rewards.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
            <Trophy className="w-8 h-8 mr-3 text-yellow-500" />
            Monthly Rewards & Incentives
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic text-sm">Reward top performance and boost team morale</p>
        </div>
        <button
          onClick={() => {
            setModalType('add');
            setFormData({
              associate: '', title: '', amount: '', 
              month: new Date().toLocaleString('default', { month: 'long' }),
              year: new Date().getFullYear().toString(),
              description: ''
            });
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white mt-4 sm:mt-0 flex items-center space-x-2 px-6 py-3 rounded-2xl shadow-lg hover:shadow-yellow-200 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold">Distribute Reward</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-white to-gray-50 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Distributed</p>
              <p className="text-3xl font-black text-gray-900">₹{totalRewardsDistributed.toLocaleString()}</p>
            </div>
            <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center border border-yellow-200">
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-white to-gray-50 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Reward Roles</p>
              <p className="text-3xl font-black text-gray-900">{rewards.length}</p>
            </div>
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center border border-orange-200">
              <Star className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-white to-gray-50 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Top Category</p>
              <p className="text-2xl font-black text-gray-900">Performance</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center border border-blue-200">
              <Trophy className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">SELECT MONTH</label>
            <select
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              className="w-full bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-medium"
            >
              <option value="">All Months</option>
              {months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">SELECT YEAR</label>
            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="w-full bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-medium"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">ASSOCIATE</label>
            <select
              value={filters.associate}
              onChange={(e) => setFilters({ ...filters, associate: e.target.value })}
              className="w-full bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-medium"
            >
              <option value="">All Associates</option>
              {associates.map(asc => (
                <option key={asc._id} value={asc._id}>{asc.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-5 px-6 font-black text-xs text-gray-400 uppercase tracking-widest">Reward Title</th>
                <th className="text-left py-5 px-6 font-black text-xs text-gray-400 uppercase tracking-widest">Associate</th>
                <th className="text-left py-5 px-6 font-black text-xs text-gray-400 uppercase tracking-widest">Period</th>
                <th className="text-left py-5 px-6 font-black text-xs text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="text-center py-5 px-6 font-black text-xs text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-600"></div>
                  </td>
                </tr>
              ) : rewards.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-20 text-gray-500 font-bold italic">No rewards distributed for this period.</td>
                </tr>
              ) : (
                rewards.map((reward) => (
                  <tr key={reward._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="py-5 px-6">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-900">{reward.title}</span>
                          {reward.rewardLevel > 0 && (
                            <span className="bg-yellow-100 text-yellow-700 text-[8px] font-black px-1.5 py-0.5 rounded-md border border-yellow-200 uppercase tracking-tighter">Automated</span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 italic">Added by: {reward.createdBy?.name}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-semibold text-gray-700">{reward.associate?.name}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">{reward.month} {reward.year}</span>
                        <span className="text-[10px] text-gray-400">{new Date(reward.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <span className="font-black text-green-600 text-lg">₹{reward.amount.toLocaleString()}</span>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openEditModal(reward)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(reward._id)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-100 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-black text-gray-900 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                {modalType === 'add' ? 'Issue New Reward' : 'Update Reward Record'}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-grow custom-scrollbar">
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">SELECT ASSOCIATE *</label>
                  <select
                    name="associate"
                    value={formData.associate}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-bold text-sm"
                    required
                  >
                    <option value="">Choose User...</option>
                    {associates.map(asc => (
                      <option key={asc._id} value={asc._id}>{asc.name} ({asc.rank})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">REWARD TITLE *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-bold text-sm"
                    placeholder="e.g. Monthly Performance Bonus, Best Site Visit..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">MONTH</label>
                    <select
                      name="month"
                      value={formData.month}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-bold text-sm"
                    >
                      {months.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">YEAR</label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-bold text-sm"
                    >
                      {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">REWARD AMOUNT (₹) *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full bg-yellow-50 px-4 py-3 rounded-2xl border border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-black text-xl text-yellow-700"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">NOTES / DESCRIPTION</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full bg-gray-50 px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm font-medium"
                    placeholder="Briefly describe the achievement..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-yellow-200 transition-all transform active:scale-95"
                >
                  {modalType === 'add' ? 'Confirm Distribution' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardManagement;
