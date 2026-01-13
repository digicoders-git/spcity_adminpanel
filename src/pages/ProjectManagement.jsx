import React, { useState, useEffect } from 'react';
import { Building, Plus, Edit, Trash2, Eye, MapPin, Calendar, DollarSign, Users, Search, MoreVertical, Grid, List, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { Pagination, ExportButton, usePagination } from '../utils/tableUtils.jsx';
import { projectsAPI } from '../utils/api';
import Swal from 'sweetalert2';

const ProjectManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewProject, setViewProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: '',
    totalUnits: '',
    availableUnits: '',
    pricePerUnit: '',
    budget: '',
    startDate: '',
    endDate: '',
    description: '',
    amenities: [],
    image: null,
    imagePreview: null
  });

  useEffect(() => {
    fetchProjects();
  }, [searchTerm]);

  const fetchProjects = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(searchTerm && { search: searchTerm })
      };
      
      const response = await projectsAPI.getAll(params);
      if (response.success) {
        console.log('📦 Projects fetched:', response.data);
        response.data.forEach(p => {
          console.log(`Project: ${p.name}, Image: ${p.image || 'No image'}`);
        });
        setProjects(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch projects');
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects;
  const handlePageChange = (page) => {
    fetchProjects(page);
  };

  const handleViewProject = (project) => {
    setViewProject(project);
    setShowViewModal(true);
  };

  const handleEditProject = (project) => {
    setModalType('edit');
    setSelectedProject(project);
    setFormData({
      name: project.name,
      location: project.location,
      type: project.type,
      totalUnits: project.totalUnits.toString(),
      availableUnits: project.availableUnits.toString(),
      pricePerUnit: project.pricePerUnit.toString(),
      budget: project.budget.toString(),
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      description: project.description || '',
      amenities: project.amenities || [],
      image: null,
      imagePreview: project.image || null
    });
    setShowModal(true);
  };

  const handleAddProject = () => {
    setModalType('add');
    setSelectedProject(null);
    setFormData({
      name: '',
      location: '',
      type: '',
      totalUnits: '',
      availableUnits: '',
      pricePerUnit: '',
      budget: '',
      startDate: '',
      endDate: '',
      description: '',
      amenities: [],
      image: null,
      imagePreview: null
    });
    setShowModal(true);
  };

  const handleDeleteProject = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Project?',
      text: 'Are you sure you want to delete this project? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await projectsAPI.delete(id);
        toast.success('Project deleted successfully!');
        fetchProjects();
      } catch (error) {
        toast.error('Failed to delete project');
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleCompleteProject = async (project) => {
    const result = await Swal.fire({
      title: 'Complete Project?',
      html: `
        <div class="text-left">
          <p class="mb-3">Are you sure you want to mark <strong>${project.name}</strong> as completed?</p>
          <div class="bg-blue-50 p-3 rounded-lg mb-3">
            <p class="text-sm text-blue-800"><strong>This will:</strong></p>
            <ul class="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Generate commissions for all received payments</li>
              <li>• Mark the project status as 'Completed'</li>
              <li>• Allow associates to withdraw their commissions</li>
            </ul>
          </div>
          <p class="text-sm text-gray-600">This action cannot be undone.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Complete Project!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await projectsAPI.completeProject(project._id);
        toast.success(`${project.name} completed successfully! Commissions have been generated.`);
        fetchProjects();
        
        // Show success details
        if (response.data?.commissions?.length > 0) {
          Swal.fire({
            title: 'Project Completed!',
            html: `
              <div class="text-left">
                <p class="mb-3">✅ <strong>${project.name}</strong> has been marked as completed.</p>
                <div class="bg-green-50 p-3 rounded-lg">
                  <p class="text-sm text-green-800"><strong>Generated ${response.data.commissions.length} commission(s):</strong></p>
                  <ul class="text-sm text-green-700 mt-2">
                    ${response.data.commissions.map(c => 
                      `<li>• ₹${c.commissionAmount.toLocaleString()} for ${c.associate?.name || 'Associate'}</li>`
                    ).join('')}
                  </ul>
                </div>
              </div>
            `,
            icon: 'success',
            confirmButtonText: 'Great!'
          });
        }
      } catch (error) {
        toast.error('Failed to complete project');
        console.error('Error completing project:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      
      // Add all text fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('totalUnits', formData.totalUnits);
      formDataToSend.append('availableUnits', formData.availableUnits);
      formDataToSend.append('pricePerUnit', formData.pricePerUnit);
      formDataToSend.append('budget', formData.budget);
      formDataToSend.append('startDate', formData.startDate);
      if (formData.endDate) formDataToSend.append('endDate', formData.endDate);
      if (formData.description) formDataToSend.append('description', formData.description);
      
      // Add image file if exists
      if (formData.image) {
        console.log('🖼️ Image file:', formData.image);
        formDataToSend.append('image', formData.image);
      } else {
        console.log('⚠️ No image selected');
      }
      
      console.log('📤 Sending FormData...');
      
      if (modalType === 'add') {
        const response = await projectsAPI.create(formDataToSend);
        console.log('✅ Response:', response);
        toast.success(`${formData.name} has been added to projects.`);
      } else {
        const response = await projectsAPI.update(selectedProject._id, formDataToSend);
        console.log('✅ Response:', response);
        toast.success(`${formData.name} has been updated.`);
      }
      
      setFormData({
        name: '',
        location: '',
        type: '',
        totalUnits: '',
        availableUnits: '',
        pricePerUnit: '',
        budget: '',
        startDate: '',
        endDate: '',
        description: '',
        amenities: [],
        image: null,
        imagePreview: null
      });
      setShowModal(false);
      fetchProjects();
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error(`Failed to ${modalType} project`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600 mt-2">Manage all your real estate projects</p>
        </div>
        <button
          onClick={handleAddProject}
          className="btn-primary mt-4 sm:mt-0 flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Add Project</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="card">
        {/* Search and View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <div className="flex gap-2">
            <ExportButton 
              data={filteredProjects} 
              filename="projects" 
              headers={['Name', 'Location', 'Type', 'Total Units', 'Sold Units', 'Price Range', 'Status', 'Start Date', 'End Date']}
            />
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 flex items-center space-x-2 text-sm ${
                  viewMode === 'cards' 
                    ? 'bg-gradient-to-r from-red-600 to-black text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 flex items-center space-x-2 text-sm border-l border-gray-300 ${
                  viewMode === 'table' 
                    ? 'bg-gradient-to-r from-red-600 to-black text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
                <span>Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Projects Cards View */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              </div>
            ) : filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div key={project._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative h-48 bg-gradient-to-br from-purple-400 to-pink-400 overflow-hidden">
                    {project.image ? (
                      <img 
                        src={project.image} 
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Building className="w-16 h-16 text-white" />
                      </div>
                    )}
                    <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{project.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {project.type}
                      </span>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">₹{project.pricePerUnit?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold">{project.availableUnits}/{project.totalUnits}</p>
                        <p className="text-xs text-gray-600">Available/Total</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${((project.totalUnits - project.availableUnits) / project.totalUnits) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold">₹{(project.budget / 100000).toFixed(1)}L</p>
                        <p className="text-xs text-gray-600">Budget</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(project.startDate).toLocaleDateString()} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button 
                        onClick={() => handleViewProject(project)}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-1 text-xs py-2 px-3 rounded-lg transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      <button 
                        onClick={() => handleEditProject(project)}
                        className="bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center space-x-1 text-xs py-2 px-3 rounded-lg transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      {project.status !== 'Completed' ? (
                        <button 
                          onClick={() => handleCompleteProject(project)}
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center space-x-1 text-xs py-2 px-3 rounded-lg transition-colors col-span-1"
                          title="Complete Project & Generate Commissions"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Complete</span>
                        </button>
                      ) : (
                        <div className="bg-green-100 text-green-800 flex items-center justify-center space-x-1 text-xs py-2 px-3 rounded-lg col-span-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Completed</span>
                        </div>
                      )}
                      <button 
                        onClick={() => handleDeleteProject(project._id)}
                        className="bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-xs py-2 px-3 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-600 mb-4">Get started by adding your first project</p>
                <button onClick={handleAddProject} className="btn-primary">
                  Add Project
                </button>
              </div>
            )}
          </div>
        )}

        {/* Projects Table View */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-2 font-semibold text-gray-900">Project</th>
                  <th className="text-left py-4 px-2 font-semibold text-gray-900">Location</th>
                  <th className="text-left py-4 px-2 font-semibold text-gray-900">Type</th>
                  <th className="text-left py-4 px-2 font-semibold text-gray-900">Units</th>
                  <th className="text-left py-4 px-2 font-semibold text-gray-900">Budget</th>
                  <th className="text-left py-4 px-2 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-4 px-2 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <tr key={project._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg overflow-hidden">
                            {project.image ? (
                              <img 
                                src={project.image} 
                                alt={project.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Building className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{project.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{project.location}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {project.type}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div>
                          <p className="font-bold">{project.availableUnits}/{project.totalUnits}</p>
                          <p className="text-xs text-gray-500">Available/Total</p>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className="font-medium">₹{(project.budget / 100000).toFixed(1)}L</span>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={() => handleViewProject(project)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditProject(project)}
                            className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
                            title="Edit Project"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {project.status !== 'Completed' ? (
                            <button 
                              onClick={() => handleCompleteProject(project)}
                              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                              title="Complete Project & Generate Commissions"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          ) : (
                            <div className="bg-green-100 text-green-800 p-2 rounded-lg" title="Project Completed">
                              <CheckCircle className="w-4 h-4" />
                            </div>
                          )}
                          <button 
                            onClick={() => handleDeleteProject(project._id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                            title="Delete Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                      <p className="text-gray-600 mb-4">Get started by adding your first project</p>
                      <button onClick={handleAddProject} className="btn-primary">
                        Add Project
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Pagination
            currentPage={pagination.current}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
            itemsPerPage={10}
            totalItems={pagination.total}
          />
        )}
      </div>

      {/* Add/Edit Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalType === 'add' ? 'Add New Project' : 'Edit Project'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Units *</label>
                    <input
                      type="number"
                      name="totalUnits"
                      value={formData.totalUnits}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Units *</label>
                    <input
                      type="number"
                      name="availableUnits"
                      value={formData.availableUnits}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget (₹) *</label>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      placeholder="e.g., 50000000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Per Unit (₹) *</label>
                    <input
                      type="number"
                      name="pricePerUnit"
                      value={formData.pricePerUnit}
                      onChange={handleInputChange}
                      placeholder="e.g., 4500000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Image</label>
                  <div className="space-y-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    {formData.imagePreview && (
                      <div className="w-full max-w-xs">
                        <img 
                          src={formData.imagePreview} 
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Enter project description"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    {modalType === 'add' ? 'Add Project' : 'Update Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Project Modal */}
      {showViewModal && viewProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Project Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Project Header */}
                <div className="flex items-start space-x-6">
                  <div className="w-32 h-32 bg-purple-500 rounded-xl overflow-hidden flex-shrink-0">
                    {viewProject.image ? (
                      <img 
                        src={viewProject.image} 
                        alt={viewProject.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Building className="w-16 h-16 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{viewProject.name}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{viewProject.location}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {viewProject.type}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(viewProject.status)}`}>
                        {viewProject.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Project Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl text-center">
                    <p className="text-2xl font-bold text-blue-600">{viewProject.totalUnits}</p>
                    <p className="text-sm text-gray-600">Total Units</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl text-center">
                    <p className="text-2xl font-bold text-green-600">{viewProject.soldUnits}</p>
                    <p className="text-sm text-gray-600">Units Sold</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl text-center">
                    <p className="text-2xl font-bold text-purple-600">{viewProject.leads}</p>
                    <p className="text-sm text-gray-600">Active Leads</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {((viewProject.soldUnits / viewProject.totalUnits) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Sold</p>
                  </div>
                </div>

                {/* Project Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Project Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Price Range</p>
                          <p className="font-medium">{viewProject.priceRange}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Building className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Project Type</p>
                          <p className="font-medium">{viewProject.type}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Timeline</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Start Date</p>
                          <p className="font-medium">{viewProject.startDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">End Date</p>
                          <p className="font-medium">{viewProject.endDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {viewProject.description && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Description</h4>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{viewProject.description}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditProject(viewProject);
                    }}
                    className="flex-1 btn-primary flex items-center justify-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Project</span>
                  </button>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;