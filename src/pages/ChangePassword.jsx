import React, { useState } from 'react';
import { Eye, EyeOff, Shield, Lock, CheckCircle, AlertCircle, Key, Sparkles, Zap } from 'lucide-react';
import { authAPI } from '../utils/api';
import { toast } from 'react-toastify';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordRequirements = [
    { text: 'At least 8 characters long', met: formData.newPassword.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.newPassword) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(formData.newPassword) },
    { text: 'Contains number', met: /\d/.test(formData.newPassword) },
    { text: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      if (response.success) {
        setSuccess(true);
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        toast.success('Password changed successfully!');
        
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to change password. Please try again.';
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const allRequirementsMet = passwordRequirements.every(req => req.met);
  const passwordStrength = passwordRequirements.filter(req => req.met).length;

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3 shadow-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <div>
            <h3 className="text-green-800 font-bold text-sm">Password Changed Successfully!</h3>
            <p className="text-green-700 text-xs">Your account is now more secure.</p>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-black p-4">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-white" />
            <h2 className="text-lg font-bold text-white">Change Password</h2>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 pr-10 text-sm transition-colors ${
                    errors.currentPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-red-500'
                  }`}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-red-600 text-xs mt-1.5 flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 pr-10 text-sm transition-colors ${
                    errors.newPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-red-500'
                  }`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Compact Requirements */}
              {formData.newPassword && (
                <div className="mt-2 bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-600">Password Strength: <span className={
                      passwordStrength <= 2 ? 'text-red-600' :
                      passwordStrength <= 3 ? 'text-yellow-600' :
                      passwordStrength <= 4 ? 'text-blue-600' : 'text-green-600'
                    }>{getStrengthText()}</span></span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                    <div className={`h-full transition-all duration-300 rounded-full ${getStrengthColor()}`} style={{ width: `${(passwordStrength / 5) * 100}%` }} />
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    {passwordRequirements.map((req, idx) => (
                      <div key={idx} className="flex items-center space-x-1.5">
                        {req.met ? <CheckCircle className="w-3 h-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
                        <span className={`text-[10px] ${req.met ? 'text-green-700' : 'text-gray-500'}`}>{req.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {errors.newPassword && (
                <p className="text-red-600 text-xs mt-1.5 flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 pr-10 text-sm transition-colors ${
                    errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-red-500'
                  }`}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1.5 flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{errors.confirmPassword}</p>
              )}
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-red-700 text-sm">{errors.submit}</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading || !allRequirementsMet}
              className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all focus:outline-none flex items-center justify-center space-x-2 ${
                isLoading || !allRequirementsMet
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-black text-white hover:from-red-700 hover:to-gray-900 shadow-md hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;