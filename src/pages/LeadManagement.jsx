import React, { useState, useEffect } from 'react';
import { Users, Plus, Eye, Phone, Mail, MapPin, Calendar, Filter, Search, Edit, Trash2, Shield, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';
import { Pagination, ExportButton } from '../utils/tableUtils.jsx';
import { leadsAPI, projectsAPI, associatesAPI } from '../utils/api';
import Swal from 'sweetalert2';

const LeadManagement = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewLead, setViewLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [associates, setAssociates] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    project: '',
    status: 'Pending',
    source: '',
    budget: '',
    notes: ''
  });

  useEffect(() => {
    fetchProjects();
    fetchAssociates();
  }, []);

  useEffect(() => {
    fetchLeads(1);
  }, [activeTab]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchLeads = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(activeTab !== 'all' && { status: activeTab })
      };
      
      const response = await leadsAPI.getAll(params);
      if (response.success) {
        setLeads(response.data);
        setPagination({
          current: response.pagination.current,
          pages: response.pagination.pages,
          total: response.pagination.total
        });
      }
    } catch (error) {
      toast.error('Failed to fetch leads');
      console.error('Error fetching leads:', error);
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

  const fetchAssociates = async () => {
    try {
      const response = await associatesAPI.getAll();
      if (response.success) {
        setAssociates(response.data);
      }
    } catch (error) {
      console.error('Error fetching associates:', error);
    }
  };

  const tabs = [
    { key: 'all', label: 'All Leads' },
    { key: 'Pending', label: 'Pending' },
    { key: 'Show', label: 'Show' },
    { key: 'Visit', label: 'Visit' },
    { key: 'Deal Done', label: 'Deal Done' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Show': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Visit': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'Deal Done': return 'bg-green-50 text-green-700 border-green-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const handlePageChange = (page) => {
    fetchLeads(page);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddLead = () => {
    setModalType('add');
    setFormData({
      name: '',
      phone: '',
      email: '',
      project: '',
      status: 'Pending',
      source: '',
      budget: '',
      notes: ''
    });
    setShowModal(true);
  };

  const handleViewLead = (lead) => {
    setViewLead(lead);
    setShowViewModal(true);
  };

  const handleEditLead = (lead) => {
    setModalType('edit');
    setSelectedLead(lead);
    setFormData({
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      project: lead.project?._id || lead.project, // Handle populated vs id
      status: lead.status,
      source: lead.source,
      budget: lead.budget,
      notes: lead.notes || ''
    });
    setShowModal(true);
  };

  const handleDeleteLead = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Lead?',
      text: 'Are you sure you want to delete this lead?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000000',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await leadsAPI.delete(id);
        toast.success('Lead deleted successfully');
        fetchLeads(pagination.current);
      } catch (error) {
        toast.error('Failed to delete lead');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'add') {
        await leadsAPI.create(formData);
        toast.success('Lead added successfully');
      } else {
        await leadsAPI.update(selectedLead._id, formData);
        toast.success('Lead updated successfully');
      }
      setShowModal(false);
      fetchLeads(pagination.current);
    } catch (error) {
      toast.error(`Failed to ${modalType} lead`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Lead Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage your potential clients efficiently</p>
        </div>
        <button
          onClick={handleAddLead}
          className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 md:py-2.5 shadow-lg shadow-red-500/20"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* Stats/Filters Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1">
        <div className="flex overflow-x-auto custom-scrollbar items-center gap-1 p-2 whitespace-nowrap">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shrink-0 ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-red-600 to-black text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {pagination.total}
                </span>
              )}
            </button>
          ))}
        </div>
        
        <div className="p-3 md:p-4 border-t border-gray-100 flex flex-col gap-3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 md:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-900 transition-all text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              <div className="flex-1 md:flex-none">
                <ExportButton 
                  data={leads} 
                  filename="leads_data" 
                  headers={['Name', 'Phone', 'Email', 'Source', 'Status', 'Budget']}
                  className="!py-2.5 w-full"
                />
              </div>
            </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead Details</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Project & Budget</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-r-transparent"></div>
                  </td>
                </tr>
              ) : leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-black flex items-center justify-center text-white font-semibold text-sm shadow-sm md:w-10 md:h-10 shrink-0">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{lead.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <span className="capitalize">{lead.source || 'Unknown Source'}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span>{lead.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate max-w-[150px]">{lead.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {lead.project?.name || 'No Project'}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-green-600 font-medium bg-green-50 w-fit px-2 py-0.5 rounded-full">
                          <DollarSign className="w-3 h-3" />
                          {lead.budget || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(lead.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          lead.status === 'Deal Done' ? 'bg-green-500' :
                          lead.status === 'Pending' ? 'bg-yellow-500' :
                          lead.status === 'Visit' ? 'bg-blue-500' : 'bg-purple-500'
                        }`}></span>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="text-xs">
                          <p className="font-medium text-gray-900">{lead.associate?.name || lead.createdBy?.name || 'Admin'}</p>
                          <p className="text-gray-500">{new Date(lead.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 text-gray-400 transition-opacity">
                        <button 
                          onClick={() => handleViewLead(lead)}
                          className="p-2 hover:bg-gray-100 rounded-lg hover:text-blue-600 transition-colors" 
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditLead(lead)}
                          className="p-2 hover:bg-gray-100 rounded-lg hover:text-gray-900 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteLead(lead._id)}
                          className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-12 h-12 text-gray-200 mb-3" />
                      <p className="text-sm">No leads found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Section */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <Pagination
              currentPage={pagination.current}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
              itemsPerPage={10}
              totalItems={pagination.total}
            />
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">
                {modalType === 'add' ? 'Add New Lead' : 'Edit Lead'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Name */}
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required 
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all" />
                 </div>
                 {/* Phone */}
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required 
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all" />
                 </div>
                 {/* Email */}
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required 
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all" />
                 </div>
                 {/* Project */}
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Project</label>
                    <select name="project" value={formData.project} onChange={handleInputChange} required 
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all">
                      <option value="">Select Project</option>
                      {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                 </div>
                 {/* Budget */}
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Budget</label>
                    <input type="text" name="budget" value={formData.budget} onChange={handleInputChange} placeholder="e.g. 50L - 1Cr"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all" />
                 </div>
                 {/* Source */}
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Source</label>
                    <select name="source" value={formData.source} onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all">
                      <option value="">Select Source</option>
                      {['Website', 'Referral', 'Social Media', 'Walk-in', 'Advertisement'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
                 {/* Status */}
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all">
                      {['Pending', 'Show', 'Visit', 'Deal Done'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <textarea name="notes" rows="3" value={formData.notes} onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"></textarea>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-2.5 bg-gradient-to-br from-red-600 to-black text-white rounded-lg hover:bg-gray-800 font-medium transition-colors">
                  {modalType === 'add' ? 'Create Lead' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewLead && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between">
                <h3 className="text-lg font-bold text-gray-900">Lead Details</h3>
                <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-900">&times;</button>
              </div>
              <div className="p-6 space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl font-bold">
                       {viewLead.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{viewLead.name}</h4>
                      <p className="text-gray-500">{viewLead.email}</p>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(viewLead.status)}`}>
                        {viewLead.status}
                      </span>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                       <p className="text-xs text-gray-500 uppercase">Phone</p>
                       <p className="font-medium text-gray-900">{viewLead.phone}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                       <p className="text-xs text-gray-500 uppercase">Budget</p>
                       <p className="font-medium text-green-600">{viewLead.budget || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                       <p className="text-xs text-gray-500 uppercase">Project</p>
                       <p className="font-medium text-gray-900">{viewLead.project?.name || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                       <p className="text-xs text-gray-500 uppercase">Source</p>
                       <p className="font-medium text-gray-900">{viewLead.source || 'N/A'}</p>
                    </div>
                 </div>

                 {viewLead.notes && (
                   <div className="p-4 bg-yellow-50/50 border border-yellow-100 rounded-xl">
                      <p className="text-xs text-yellow-600 uppercase font-medium mb-1">Notes</p>
                      <p className="text-sm text-gray-700">{viewLead.notes}</p>
                   </div>
                 )}

                 <div className="flex gap-4">
                   <button onClick={() => { setShowViewModal(false); handleEditLead(viewLead); }} className="flex-1 btn-primary py-2.5">Edit Lead</button>
                   <button onClick={() => setShowViewModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">Close</button>
                 </div>
              </div>
           </div>
         </div>
      )}
    </div>
  );
};

export default LeadManagement;