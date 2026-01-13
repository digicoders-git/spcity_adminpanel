import React from 'react';
import { Mail, MessageCircle, Phone, Calendar } from 'lucide-react';

const ContactManagement = () => {
  const contacts = [
    { id: 1, name: 'Alice Brown', email: 'alice@example.com', subject: 'Project Inquiry', date: '2025-01-01', status: 'New' },
    { id: 2, name: 'Bob Wilson', email: 'bob@example.com', subject: 'Support Request', date: '2025-01-02', status: 'Replied' },
    { id: 3, name: 'Carol Davis', email: 'carol@example.com', subject: 'Partnership', date: '2024-12-30', status: 'In Progress' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Contact Messages</h1>
        <p className="text-gray-600 mt-2">Manage customer inquiries and messages</p>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Contact</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Subject</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Date</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Status</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-black rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        <p className="text-sm text-gray-600">{contact.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{contact.subject}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{contact.date}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      contact.status === 'New' ? 'bg-blue-100 text-blue-800' :
                      contact.status === 'Replied' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      <button className="btn-primary p-2 rounded-lg">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button className="btn-primary p-2 rounded-lg">
                        <Phone className="w-4 h-4" />
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

export default ContactManagement;