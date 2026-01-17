import React, { forwardRef } from 'react';
import { Building, Phone, Mail, MapPin } from 'lucide-react';

const InvoiceView = forwardRef(({ invoice }, ref) => {
  if (!invoice) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto shadow-lg" id="invoice-print">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-red-600 pb-8 mb-8">
        <div className="flex items-center space-x-4">
          <img 
            src="/SP City Logo PNG.png" 
            alt="SP City Logo" 
            className="h-24 w-auto object-contain"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SP CITY</h1>
            <p className="text-sm text-gray-600 font-medium">REAL ESTATE DEVELOPERS</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-black text-gray-200 tracking-wider">INVOICE</h2>
          <p className="text-red-600 font-bold text-lg mt-2">#{invoice.invoiceNumber}</p>
          <div className={`mt-2 inline-block px-4 py-1 rounded-full text-sm font-bold border-2 ${
            invoice.status === 'Paid' ? 'border-green-500 text-green-600' : 
            invoice.status === 'Sent' ? 'border-blue-500 text-blue-600' :
            invoice.status === 'Overdue' ? 'border-red-500 text-red-600' :
            'border-gray-400 text-gray-500'
          }`}>
            {invoice.status.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Bill To</h3>
          <div className="border-l-4 border-black pl-4">
            <h4 className="text-xl font-bold text-gray-900">{invoice.customerName}</h4>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> {invoice.customerPhone}
              </p>
              {invoice.customerEmail && (
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {invoice.customerEmail}
                </p>
              )}
              {invoice.project && (
                <p className="flex items-center gap-2 mt-2 font-medium text-red-600">
                  <Building className="w-4 h-4" /> Project: {invoice.project.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 text-right">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center border-b border-gray-100 pb-1">
              <span className="text-gray-600">Date Issued:</span>
              <span className="font-semibold text-gray-900">{formatDate(invoice.issueDate)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-1">
              <span className="text-gray-600">Due Date:</span>
              <span className="font-semibold text-gray-900">{formatDate(invoice.dueDate)}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-gray-600">Amount Due:</span>
              <span className="font-bold text-xl text-red-600">₹{invoice.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="py-3 px-4 text-left rounded-l-lg">Description</th>
              <th className="py-3 px-4 text-center">Qty</th>
              <th className="py-3 px-4 text-right">Unit Price</th>
              <th className="py-3 px-4 text-right rounded-r-lg">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoice.items.map((item, index) => (
              <tr key={index} className="text-sm">
                <td className="py-4 px-4 font-medium text-gray-900">{item.description}</td>
                <td className="py-4 px-4 text-center text-gray-600">{item.quantity}</td>
                <td className="py-4 px-4 text-right text-gray-600">₹{item.unitPrice.toLocaleString()}</td>
                <td className="py-4 px-4 text-right font-semibold text-gray-900">₹{item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-80 space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium text-gray-900">₹{invoice.subtotal.toLocaleString()}</span>
          </div>
          {invoice.taxAmount > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Tax ({invoice.taxRate}%)</span>
              <span className="font-medium text-gray-900">₹{invoice.taxAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="border-t-2 border-gray-900 pt-3 flex justify-between items-center">
            <span className="font-bold text-lg text-gray-900">Total</span>
            <span className="font-bold text-2xl text-red-600">₹{invoice.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-8 mt-auto">
        <div className="flex justify-between items-end">
          <div className="text-sm text-gray-500 max-w-md">
            <h4 className="font-bold text-gray-900 mb-2">Terms & Conditions</h4>
            <p>Please make the payment by the due date. For any questions concerning this invoice, contact our support.</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">Authorized Signatory</p>
            <div className="h-16 w-32 border-b border-gray-400 mt-2 mb-1 mx-auto"></div>
            <p className="text-xs text-gray-500">SP City Real Estate</p>
          </div>
        </div>
      </div>
    </div>
  );
});

InvoiceView.displayName = 'InvoiceView';

export default InvoiceView;
