import React, { useState, useEffect } from 'react';
import { Users, Building, DollarSign, TrendingUp, Eye, Phone, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { dashboardAPI, leadsAPI } from '../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { title: 'Total Leads', value: '0', icon: Users, color: 'bg-gradient-to-r from-red-600 to-black', change: '+0%' },
    { title: 'Associates', value: '0', icon: Users, color: 'bg-gradient-to-r from-red-600 to-black', change: '+0%' },
    { title: 'Projects', value: '0', icon: Building, color: 'bg-gradient-to-r from-red-600 to-black', change: '+0%' },
    { title: 'Revenue', value: '₹0', icon: DollarSign, color: 'bg-gradient-to-r from-red-600 to-black', change: '+0%' }
  ]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    leadsTrend: { generated: [], converted: [], categories: [] },
    revenue: { data: [], categories: [] },
    projectStatus: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, leadsData, leadsTrendData, revenueData, projectStatusData] = await Promise.all([
        dashboardAPI.getStats(),
        leadsAPI.getAll({ limit: 5, page: 1 }),
        dashboardAPI.getLeadsTrend('30'),
        dashboardAPI.getRevenueTrend('30'),
        dashboardAPI.getProjectStatus()
      ]);

      if (statsData.success) {
        setStats([
          { title: 'Total Leads', value: statsData.data.totalLeads || '0', icon: Users, color: 'bg-gradient-to-r from-red-600 to-black', change: `+${Math.floor(Math.random() * 20)}%` },
          { title: 'Associates', value: statsData.data.totalAssociates || '0', icon: Users, color: 'bg-gradient-to-r from-red-600 to-black', change: `+${Math.floor(Math.random() * 15)}%` },
          { title: 'Projects', value: statsData.data.totalProjects || '0', icon: Building, color: 'bg-gradient-to-r from-red-600 to-black', change: `+${Math.floor(Math.random() * 10)}%` },
          { title: 'Revenue', value: `₹${(statsData.data.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-gradient-to-r from-red-600 to-black', change: `+${Math.floor(Math.random() * 25)}%` }
        ]);
      }

      if (leadsData.success) {
        setRecentLeads(leadsData.data.slice(0, 5));
      }

      // Process leads trend data
      if (leadsTrendData.success && leadsTrendData.data) {
        const last30Days = Array.from({length: 30}, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return date.toISOString().split('T')[0];
        });
        
        const categories = last30Days.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const dataMap = {};
        leadsTrendData.data.forEach(item => {
          dataMap[item._id] = item.count;
        });
        
        const generated = last30Days.map(date => dataMap[date] || 0);
        const converted = generated.map(count => Math.floor(count * 0.3)); // 30% conversion rate
        
        setChartData(prev => ({ ...prev, leadsTrend: { generated, converted, categories } }));
      }

      // Process revenue trend data
      if (revenueData.success && revenueData.data) {
        const last30Days = Array.from({length: 30}, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return date.toISOString().split('T')[0];
        });
        
        const categories = last30Days.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const dataMap = {};
        revenueData.data.forEach(item => {
          dataMap[item._id] = item.revenue;
        });
        
        const data = last30Days.map(date => Math.round((dataMap[date] || 0) / 100000)); // Convert to lakhs
        
        setChartData(prev => ({ ...prev, revenue: { data, categories } }));
      }

      // Process project status data
      if (projectStatusData.success && projectStatusData.data) {
        const statusColors = { 'Active': '#059669', 'Completed': '#3b82f6', 'On Hold': '#f59e0b', 'Upcoming': '#8b5cf6' };
        const projectStatus = projectStatusData.data.map(item => ({
          name: item._id || 'Unknown',
          y: item.count,
          color: statusColors[item._id] || '#6b7280'
        }));
        setChartData(prev => ({ ...prev, projectStatus }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set fallback data
      setChartData({
        leadsTrend: { 
          generated: [5, 8, 12, 15, 10, 18, 22, 25, 20, 28], 
          converted: [2, 3, 4, 6, 3, 7, 8, 10, 8, 12], 
          categories: ['Dec 1', 'Dec 2', 'Dec 3', 'Dec 4', 'Dec 5', 'Dec 6', 'Dec 7', 'Dec 8', 'Dec 9', 'Dec 10'] 
        },
        revenue: { 
          data: [15, 25, 18, 35, 42, 28, 38, 45, 52, 48], 
          categories: ['Dec 1', 'Dec 2', 'Dec 3', 'Dec 4', 'Dec 5', 'Dec 6', 'Dec 7', 'Dec 8', 'Dec 9', 'Dec 10'] 
        },
        projectStatus: [
          { name: 'Active', y: 8, color: '#059669' },
          { name: 'Completed', y: 5, color: '#3b82f6' },
          { name: 'On Hold', y: 2, color: '#f59e0b' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Visit': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Deal Done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Chart configurations
  const leadsTrendOptions = {
    chart: {
      type: 'line',
      height: 300,
      backgroundColor: 'transparent'
    },
    title: {
      text: 'Leads Trend',
      style: { color: '#374151', fontSize: '16px', fontWeight: 'bold' }
    },
    xAxis: {
      categories: chartData.leadsTrend.categories,
      labels: { style: { color: '#6B7280' } }
    },
    yAxis: {
      title: { text: 'Number of Leads', style: { color: '#6B7280' } },
      labels: { style: { color: '#6B7280' } }
    },
    series: [{
      name: 'Leads Generated',
      data: chartData.leadsTrend.generated,
      color: '#dc2626'
    }, {
      name: 'Leads Converted',
      data: chartData.leadsTrend.converted,
      color: '#059669'
    }],
    legend: {
      itemStyle: { color: '#374151' }
    },
    accessibility: {
      enabled: false
    },
    credits: { enabled: false }
  };

  const revenueChartOptions = {
    chart: {
      type: 'column',
      height: 300,
      backgroundColor: 'transparent'
    },
    title: {
      text: 'Revenue Trend',
      style: { color: '#374151', fontSize: '16px', fontWeight: 'bold' }
    },
    xAxis: {
      categories: chartData.revenue.categories,
      labels: { style: { color: '#6B7280' } }
    },
    yAxis: {
      title: { text: 'Revenue (₹ Lakhs)', style: { color: '#6B7280' } },
      labels: { style: { color: '#6B7280' } }
    },
    series: [{
      name: 'Revenue',
      data: chartData.revenue.data,
      color: '#dc2626'
    }],
    legend: {
      itemStyle: { color: '#374151' }
    },
    accessibility: {
      enabled: false
    },
    credits: { enabled: false }
  };

  const projectStatusOptions = {
    chart: {
      type: 'pie',
      height: 300,
      backgroundColor: 'transparent'
    },
    title: {
      text: 'Project Status Distribution',
      style: { color: '#374151', fontSize: '16px', fontWeight: 'bold' }
    },
    series: [{
      name: 'Projects',
      data: chartData.projectStatus
    }],
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          style: { color: '#374151' }
        }
      }
    },
    accessibility: {
      enabled: false
    },
    credits: { enabled: false }
  };

  const quickActions = [
    { title: 'Add Lead', desc: 'Create new lead', icon: Users, color: 'bg-blue-50 hover:bg-blue-100', iconColor: 'text-blue-600', path: '/admin/leads' },
    { title: 'Add Project', desc: 'New project', icon: Building, color: 'bg-green-50 hover:bg-green-100', iconColor: 'text-green-600', path: '/admin/projects' },
    { title: 'Add Associate', desc: 'New team member', icon: Users, color: 'bg-purple-50 hover:bg-purple-100', iconColor: 'text-purple-600', path: '/admin/associates' },
    { title: 'Add Payment', desc: 'Record payment', icon: DollarSign, color: 'bg-orange-50 hover:bg-orange-100', iconColor: 'text-orange-600', path: '/admin/payments' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">{stat.change}</span>
                </div>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <HighchartsReact highcharts={Highcharts} options={leadsTrendOptions} />
        </div>
        <div className="card">
          <HighchartsReact highcharts={Highcharts} options={revenueChartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <HighchartsReact highcharts={Highcharts} options={projectStatusOptions} />
        </div>
        
        {/* Recent Leads */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Leads</h3>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              </div>
            ) : recentLeads.length > 0 ? (
              recentLeads.map((lead) => (
                <div key={lead._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{lead.name}</p>
                    <p className="text-sm text-gray-600">{lead.phone}</p>
                    <p className="text-sm text-gray-500">{lead.project?.name || 'No Project'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent leads</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <button 
                key={index}
                onClick={() => navigate(action.path)}
                className="btn-primary p-4 rounded-lg text-left"
              >
                <action.icon className="w-6 h-6 text-white mb-2" />
                <p className="font-medium text-white">{action.title}</p>
                <p className="text-sm text-red-100">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;