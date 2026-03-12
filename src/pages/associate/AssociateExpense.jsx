import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  DollarSign, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Clock3,
  TrendingDown
} from 'lucide-react';
import { expensesAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const AssociateExpense = () => {
  const { user } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const targetAssociateId = queryParams.get('associate') || user?._id || user?.id;

  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ totalAdvance: 0, totalSalary: 0 });

  const fetchMyExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await expensesAPI.getAll({ associate: targetAssociateId });
      if (res.success) {
        setExpenses(res.data);
        
        const adv = res.data
          .filter(e => e.category === 'Advance' && e.status === 'Approved')
          .reduce((sum, e) => sum + e.amount, 0);
        
        const sal = res.data
          .filter(e => e.category === 'Salary' && e.status === 'Approved')
          .reduce((sum, e) => sum + e.amount, 0);

        setSummary({ totalAdvance: adv, totalSalary: sal });
      }
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    } finally {
      setLoading(false);
    }
  }, [targetAssociateId]);

  useEffect(() => {
    if (targetAssociateId) {
      fetchMyExpenses();
    }
  }, [targetAssociateId, fetchMyExpenses]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-1 sm:px-2">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Advances & Expenses</h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base font-medium italic">Track received advances, salaries, and other payouts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="card p-5 sm:p-6 bg-gradient-to-br from-red-600 to-black text-white border-none shadow-2xl relative overflow-hidden group">
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs font-black text-red-200 uppercase tracking-widest italic">Total Advances Received</p>
              <p className="text-3xl sm:text-4xl font-black tracking-tight">₹{summary.totalAdvance.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-500">
              <TrendingDown className="w-6 h-6 sm:w-9 sm:h-9 text-white" />
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="card p-5 sm:p-6 bg-gradient-to-br from-white to-gray-50 border-l-4 border-green-600 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">Total Salary / Incentives</p>
              <p className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">₹{summary.totalSalary.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-2xl flex items-center justify-center border border-green-200 shadow-inner">
              <CheckCircle2 className="w-6 h-6 sm:w-9 sm:h-9 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Expenses History */}
      <div className="card border-none shadow-xl overflow-hidden">
        <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h3 className="text-lg sm:text-xl font-black text-gray-900 flex items-center">
                <Clock3 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-red-600" /> Payment History
            </h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white px-2 py-1 rounded border border-gray-100 sm:border-none sm:p-0">REAL TIME SYNCED</span>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[800px]">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="text-left py-5 px-6 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">Transaction / Detail</th>
                <th className="text-left py-5 px-6 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">Category</th>
                <th className="text-left py-5 px-6 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">Amount</th>
                <th className="text-left py-5 px-6 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">Date</th>
                <th className="text-left py-5 px-6 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-24 px-10 text-gray-400 font-bold italic text-sm sm:text-base leading-relaxed">
                    No transactions found in your records.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 sm:py-5 px-4 sm:px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-sm sm:text-base">{expense.title}</span>
                        <span className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 line-clamp-1 italic">{expense.description || 'No description provided'}</span>
                      </div>
                    </td>
                    <td className="py-4 sm:py-5 px-4 sm:px-6">
                      <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${
                        expense.category === 'Advance' ? 'bg-orange-100 text-orange-600' :
                        expense.category === 'Salary' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-4 sm:py-5 px-4 sm:px-6">
                      <div className="flex flex-col">
                        <span className="font-black text-gray-900 text-base sm:text-lg">₹{expense.amount.toLocaleString()}</span>
                        <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase">{expense.paymentMode}</span>
                      </div>
                    </td>
                    <td className="py-4 sm:py-5 px-4 sm:px-6">
                      <div className="flex items-center text-xs sm:text-sm font-semibold text-gray-600">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-gray-300" />
                        {new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="py-4 sm:py-5 px-4 sm:px-6">
                      <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${
                        expense.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        expense.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {expense.status === 'Approved' ? <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" /> : 
                         expense.status === 'Pending' ? <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" /> : <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />}
                        {expense.status}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssociateExpense;
