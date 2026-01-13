import React from 'react';
import { Briefcase, Download, Eye, User } from 'lucide-react';

const CareerManagement = () => {
  const applications = [
    { id: 1, name: 'John Doe', position: 'Frontend Developer', email: 'john@example.com', date: '2025-01-01', status: 'New' },
    { id: 2, name: 'Jane Smith', position: 'Backend Developer', email: 'jane@example.com', date: '2025-01-02', status: 'Reviewed' },
    { id: 3, name: 'Mike Johnson', position: 'Full Stack Developer', email: 'mike@example.com', date: '2024-12-30', status: 'Shortlisted' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Career Applications</h1>
        <p className="text-gray-600 mt-2">Manage job applications and candidates</p>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Candidate</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Position</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Date</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Status</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-black rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{app.name}</p>
                        <p className="text-sm text-gray-600">{app.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{app.position}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-gray-600">{app.date}</td>
                  <td className="py-4 px-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      app.status === 'New' ? 'bg-blue-100 text-blue-800' :
                      app.status === 'Reviewed' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      <button className="btn-primary p-2 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="btn-primary p-2 rounded-lg">
                        <Download className="w-4 h-4" />
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

export default CareerManagement;