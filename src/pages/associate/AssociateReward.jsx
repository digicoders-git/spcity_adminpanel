import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Award, 
  Star, 
  Calendar, 
  DollarSign, 
  PartyPopper,
  Quote
} from 'lucide-react';
import { rewardsAPI } from '../../utils/api';

const AssociateReward = () => {
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchMyRewards();
  }, []);

  const fetchMyRewards = async () => {
    try {
      setLoading(true);
      const res = await rewardsAPI.getMyRewards();
      if (res.success) {
        setRewards(res.data);
        setTotalAmount(res.totalRewardAmount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch rewards');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Simple Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between">
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-900">My Rewards</h1>
          <p className="text-sm text-gray-500 mt-1">Track your verified bonuses and commissions.</p>
        </div>
        <div className="mt-4 md:mt-0 text-center md:text-right">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Lifetime Rewards</p>
          <p className="text-3xl font-bold text-red-600">₹{Number(totalAmount).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse" />
          ))
        ) : rewards.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-600">No rewards yet</h3>
            <p className="text-sm text-gray-500 mt-2">Your rewards and commissions will appear here.</p>
          </div>
        ) : (
          rewards.map((reward) => (
            <div key={reward._id} className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="pr-4">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">{reward.title}</h3>
                  <p className="text-xs font-medium text-gray-500 mt-1">{reward.month} {reward.year}</p>
                </div>
                <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-md text-sm font-bold border border-green-100 whitespace-nowrap">
                  ₹{reward.amount.toLocaleString('en-IN')}
                </div>
              </div>

              {reward.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{reward.description}</p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs font-medium text-gray-500">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{new Date(reward.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-green-600">
                  Credited
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssociateReward;
