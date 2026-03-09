import React, { useState, useEffect, useCallback } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ totalAdvance: 0, totalSalary: 0 });

  const fetchMyExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await expensesAPI.getAll({ associate: user?._id || user?.id });
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
  }, [user]);

  useEffect(() => {
    if (user?._id || user?.id) {
      fetchMyExpenses();
    }
  }, [user, fetchMyExpenses]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Advances & Expenses</h1>
        <p className="text-gray-500 mt-1 font-medium italic">Track your received advances, salaries, and other payouts from the company</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-gradient-to-br from-red-600 to-black text-white border-none shadow-2xl relative overflow-hidden group">
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-black text-red-200 uppercase tracking-widest italic">Total Advances Received</p>
              <p className="text-4xl font-black tracking-tight">₹{summary.totalAdvance.toLocaleString()}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-500">
              <TrendingDown className="w-9 h-9 text-white" />
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="card bg-gradient-to-br from-white to-gray-50 border-l-4 border-green-600 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Salary / Incentives</p>
              <p className="text-4xl font-black text-gray-900 tracking-tight">₹{summary.totalSalary.toLocaleString()}</p>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center border border-green-200 shadow-inner">
              <CheckCircle2 className="w-9 h-9 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Expenses History */}
      <div className="card border-none shadow-xl overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-900 flex items-center">
                <Clock3 className="w-6 h-6 mr-2 text-red-600" /> Payment History
            </h3>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">REAL TIME SYNCED</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
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
                  <td colSpan="5" className="text-center py-24 text-gray-400 font-bold italic">No transactions found in your records.</td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-5 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{expense.title}</span>
                        <span className="text-[11px] text-gray-400 mt-0.5 line-clamp-1 italic">{expense.description || 'No description provided'}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        expense.category === 'Advance' ? 'bg-orange-100 text-orange-600' :
                        expense.category === 'Salary' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col">
                        <span className="font-black text-gray-900 text-lg">₹{expense.amount.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{expense.paymentMode}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center text-sm font-semibold text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-300" />
                        {new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        expense.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        expense.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {expense.status === 'Approved' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : 
                         expense.status === 'Pending' ? <Clock className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
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
