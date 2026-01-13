import React from 'react';
import { FileText, Plus, Edit, Trash2, Eye } from 'lucide-react';

const BlogManagement = () => {
  const blogs = [
    { id: 1, title: 'Modern Web Development', status: 'Published', date: '2025-01-01', views: 1250 },
    { id: 2, title: 'React Best Practices', status: 'Draft', date: '2025-01-02', views: 0 },
    { id: 3, title: 'CSS Grid Layout', status: 'Published', date: '2024-12-30', views: 890 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600 mt-2">Create and manage your blog posts</p>
        </div>
        <button className="btn-primary mt-4 sm:mt-0 flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Add New Post</span>
          <span className="sm:hidden">Add Post</span>
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Title</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Status</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Date</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Views</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{blog.title}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      blog.status === 'Published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-gray-600">{blog.date}</td>
                  <td className="py-4 px-2 text-gray-600">{blog.views}</td>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      <button className="btn-primary p-2 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="btn-primary p-2 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="btn-primary p-2 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BlogManagement;