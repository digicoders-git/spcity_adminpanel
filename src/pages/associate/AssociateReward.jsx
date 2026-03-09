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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Celebration Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 rounded-[2rem] p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-2 border border-white/30">
              <PartyPopper className="w-4 h-4 mr-2" />
              Your Achievements
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">My Rewards & Hall of Fame</h1>
            <p className="text-orange-50 font-medium italic opacity-90 text-lg">Your hard work pays off. Keep pushing the limits!</p>
          </div>
          <div className="mt-8 md:mt-0 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl text-center min-w-[200px] transform hover:scale-105 transition-transform">
            <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Lifetime Rewards</p>
            <p className="text-4xl font-black">₹{totalAmount.toLocaleString()}</p>
            <Award className="w-10 h-10 text-yellow-300 mx-auto mt-2 drop-shadow-lg" />
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card h-64 animate-pulse bg-gray-100 border-none" />
          ))
        ) : rewards.length === 0 ? (
          <div className="col-span-full card p-20 text-center space-y-4 bg-white/50 border-dashed border-2 border-gray-200">
            <Star className="w-16 h-16 text-gray-300 mx-auto" />
            <h3 className="text-2xl font-bold text-gray-400">No rewards yet!</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Your journey has just begun. Close some deals and your first reward will shine here!</p>
          </div>
        ) : (
          rewards.map((reward) => (
            <div key={reward._id} className="group relative bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full -mr-16 -mt-16 group-hover:bg-yellow-100 transition-colors" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center border border-yellow-200">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{reward.month} {reward.year}</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">₹{reward.amount.toLocaleString()}</p>
                  </div>
                </div>

                <h3 className="text-xl font-black text-gray-800 mb-3">{reward.title}</h3>
                
                {reward.description && (
                  <div className="flex items-start space-x-2 text-gray-600 mb-6 bg-gray-50 p-3 rounded-2xl italic">
                    <Quote className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    <p className="text-sm line-clamp-2">{reward.description}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center space-x-2 text-xs font-bold text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(reward.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Credited
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Motivation Section */}
      {rewards.length > 0 && (
        <div className="card bg-gray-900 text-white p-8 flex flex-col md:flex-row items-center justify-between rounded-[2rem]">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold">Ready for the next one?</h3>
            <p className="text-gray-400">Keep track of your leads and pending payments to stay eligible for this month's bonuses.</p>
          </div>
          <button className="mt-6 md:mt-0 bg-white text-gray-900 px-8 py-3 rounded-2xl font-black hover:bg-yellow-400 transition-colors">
            View My Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default AssociateReward;
