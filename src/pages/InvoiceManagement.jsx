import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText, Plus, Search, Eye,
  Trash2, Edit, Printer,
  CheckCircle, Clock, AlertCircle, X,
  Trash, Save, Receipt, Building, Download
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import Swal from 'sweetalert2';
import { invoicesAPI, projectsAPI, associatesAPI } from '../utils/api';
import { Pagination, ExportButton } from '../utils/tableUtils.jsx';
import InvoiceView from '../components/InvoiceView';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  fatherName: '',
  customerAddress: '',
  referenceId: '',
  plotId: '',
  plotNo: '',
  bookingArea: '',
  plotFacing: '',
  rate: 0,
  plcAmount: 0,
  developmentCharge: 0,
  paidAmount: 0,
  discount: 0,
  balanceAmount: 0,
  paymentMode: 'Cash',
  instrumentNo: '',
  instrumentDate: '',
  bankName: '',
  depositDate: '',
  remark: '',
  bankAccountName: 'State Bank Of India',
  bankAccountNumber: '44294171198',
  bankIFSC: 'SBIN0011643',
  bankBranchAddress: 'Gomti Nagar, Lucknow, UP',
  project: '',
  associate: '',
  reason: '',
  items: [{ description: '', quantity: 1, unitPrice: 0 }],
  dueDate: '',
  notes: '',
  status: 'Draft',
  taxRate: 0,
};

const InvoiceManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [associates, setAssociates] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [modalType, setModalType] = useState('create');
  const [formData, setFormData] = useState(EMPTY_FORM);

  const printRef = useRef();

  /* ================= PRINT & DOWNLOAD ================= */
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: viewInvoice ? `Invoice-${viewInvoice.invoiceNumber}` : 'Invoice',
  });

  const handleDownloadPDF = () => {
    // Calling handlePrint triggers the browser print dialog, 
    // which is the most reliable way to Save as PDF without heavy libraries.
    handlePrint();
  };

  /* ================= FETCH ================= */
  const fetchInvoices = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await invoicesAPI.getAll({
        page,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(activeTab !== 'all' && { status: activeTab }),
      });

      setInvoices(res.data || []);
      setPagination({
        current: res.page || 1,
        pages: res.pages || 1,
        total: res.total || 0,
      });
    } catch {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm]);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await projectsAPI.getAll();
      setProjects(res.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }, []);

  const fetchAssociates = useCallback(async () => {
    try {
      const res = await associatesAPI.getAll();
      setAssociates(res.data || []);
    } catch (error) {
      console.error('Error fetching associates:', error);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
    fetchProjects();
    fetchAssociates();
  }, [fetchInvoices, fetchProjects, fetchAssociates]);

  useEffect(() => {
    // Auto calculate Total and Balance for Property Fields
    const area = parseFloat(formData.bookingArea) || 0;
    const rate = Number(formData.rate) || 0;
    const plc = Number(formData.plcAmount) || 0;
    const dev = Number(formData.developmentCharge) || 0;
    const discount = Number(formData.discount) || 0;
    const currPaid = Number(formData.paidAmount) || 0;
    const totalPaid = Number(formData.totalPaid) || 0;

    const propertyTotal = (rate * area) + plc + dev;
    
    // If it's a new invoice and totalPaid is 0, let's suggest/sync it with currPaid
    // But don't force it if user manually cleared it
    const effectiveTotalPaid = totalPaid === 0 ? currPaid : totalPaid;
    const balance = propertyTotal - effectiveTotalPaid - discount;

    setFormData(prev => ({
      ...prev,
      total: propertyTotal,
      balanceAmount: balance,
      // If totalPaid is 0 but currPaid is entered, help user by filling it
      ...(prev.totalPaid === 0 && currPaid > 0 ? { totalPaid: currPaid } : {})
    }));
  }, [formData.rate, formData.bookingArea, formData.plcAmount, formData.developmentCharge, formData.paidAmount, formData.totalPaid, formData.discount]);

  /* ================= FORM HELPERS ================= */
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'description' ? value : Number(value);
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce(
      (s, i) => s + Number(i.quantity) * Number(i.unitPrice),
      0
    );
    const tax = (subtotal * Number(formData.taxRate || 0)) / 100;
    return { subtotal, tax, total: subtotal + tax };
  };

  /* ================= MODAL ACTIONS ================= */
  const openCreate = () => {
    setModalType('create');
    setFormData({ ...EMPTY_FORM, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] });
    setViewInvoice(null);
    setShowModal(true);
  };

  const openEdit = (invoice) => {
    setModalType('edit');
    setViewInvoice(invoice);

    setFormData({
      customerName: invoice.customerName || '',
      customerPhone: invoice.customerPhone || '',
      customerEmail: invoice.customerEmail || '',
      fatherName: invoice.fatherName || '',
      customerAddress: invoice.customerAddress || '',
      referenceId: invoice.referenceId || '',
      plotId: invoice.plotId || '',
      plotNo: invoice.plotNo || '',
      bookingArea: invoice.bookingArea || '',
      plotFacing: invoice.plotFacing || '',
      rate: invoice.rate || 0,
      plcAmount: invoice.plcAmount || 0,
      developmentCharge: invoice.developmentCharge || 0,
      paidAmount: invoice.paidAmount || 0,
      discount: invoice.discount || 0,
      balanceAmount: invoice.balanceAmount || 0,
      paymentMode: invoice.paymentMode || 'Cash',
      instrumentNo: invoice.instrumentNo || '',
      instrumentDate: invoice.instrumentDate ? invoice.instrumentDate.split('T')[0] : '',
      bankName: invoice.bankName || '',
      depositDate: invoice.depositDate ? invoice.depositDate.split('T')[0] : '',
      remark: invoice.remark || '',
      bankAccountName: invoice.bankAccountName || 'State Bank Of India',
      bankAccountNumber: invoice.bankAccountNumber || '44294171198',
      bankIFSC: invoice.bankIFSC || 'SBIN0011643',
      bankBranchAddress: invoice.bankBranchAddress || 'Gomti Nagar, Lucknow, UP',
      project: invoice.project?._id || '',
      associate: invoice.associate?._id || '',
      reason: invoice.reason || '',
      items: invoice.items?.map(i => ({
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })) || [{ description: '', quantity: 1, unitPrice: 0 }],
      dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
      notes: invoice.notes || '',
      status: invoice.status || 'Draft',
      taxRate: invoice.taxRate || 0,
    });

    setShowModal(true);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Decide which total to use
    let subtotal, tax, finalTotal;
    
    if (formData.rate > 0) {
      // Use Property Calculation
      subtotal = formData.total; // already calculated in useEffect
      tax = 0; // standard property receipts usually don't show separate tax lines in this template
      finalTotal = formData.total;
    } else {
      // Use standard items calculation
      const calculated = calculateTotal();
      subtotal = calculated.subtotal;
      tax = calculated.tax;
      finalTotal = calculated.total;
    }

    const payload = {
      ...formData,
      items: formData.items.map(i => ({
        description: i.description,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      })),
      subtotal,
      taxAmount: tax,
      total: finalTotal,
    };

    try {
      if (modalType === 'create') {
        await invoicesAPI.create(payload);
        toast.success('Invoice generated successfully! ✨');
      } else {
        await invoicesAPI.update(viewInvoice._id, payload);
        toast.success('Invoice updated successfully! ✨');
      }

      setShowModal(false);
      fetchInvoices();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Delete Invoice?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirm.isConfirmed) {
      try {
        await invoicesAPI.delete(id);
        toast.success('Invoice deleted');
        fetchInvoices();
      } catch (error) {
        toast.error('Failed to delete invoice');
      }
    }
  };

  /* ================= UI RENDERERS ================= */
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'Sent': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Overdue': return 'bg-red-100 text-red-700 border-red-200';
      case 'Draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const totals = calculateTotal();

  return (
    <div className="p-3 md:p-6 max-w-[1600px] mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <Receipt className="text-red-600 shrink-0" size={26} />
          <div>
            <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">Invoice Management</h1>
            <p className="text-gray-500 mt-0.5 font-medium text-xs md:text-base">Create, manage and track professional invoices</p>
          </div>
        </div>
        {user?.role === 'admin' && (
          <button 
            onClick={openCreate}
            className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-6 py-3.5 md:py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-200"
          >
            <Plus size={20} />
            Generate New Invoice
          </button>
        )}
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard title="Total" value={pagination.total} icon={FileText} color="blue" />
        <StatCard title="Paid" value={`₹${invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0).toLocaleString()}`} icon={CheckCircle} color="green" />
        <StatCard title="Pending" value={invoices.filter(i => ['Sent', 'Draft'].includes(i.status)).length} icon={Clock} color="orange" />
        <StatCard title="Overdue" value={invoices.filter(i => i.status === 'Overdue').length} icon={AlertCircle} color="red" />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters & Search */}
        <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-3">
          <div className="flex p-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto w-full custom-scrollbar">
            {['all', 'Paid', 'Sent', 'Draft', 'Overdue'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 md:px-6 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap flex-1 md:flex-none ${
                  activeTab === tab 
                    ? 'bg-red-600 text-white shadow-md' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by client or invoice #"
                className="w-full pl-10 pr-4 py-3 md:py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
              />
            </div>
            <div className="w-full sm:w-auto">
              <ExportButton data={invoices} filename={`invoices-${new Date().toLocaleDateString()}`} />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium">Fetching invoices...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider text-left border-b border-gray-100">
                  <th className="px-6 py-4 font-black whitespace-nowrap">Invoice #</th>
                  <th className="px-6 py-4 font-black whitespace-nowrap">Client/Associate</th>
                  <th className="px-6 py-4 font-black whitespace-nowrap">Reason/Project</th>
                  <th className="px-6 py-4 font-black whitespace-nowrap">Total Amount</th>
                  <th className="px-6 py-4 font-black whitespace-nowrap">Due Date</th>
                  <th className="px-6 py-4 font-black whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 font-black text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.length > 0 ? invoices.map(inv => (
                  <tr key={inv._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-gray-900">#{inv.invoiceNumber}</span>
                    </td>
                    <td className="px-6 py-4 min-w-[200px]">
                      <div>
                        {inv.associate ? (
                          <>
                            <p className="font-bold text-blue-700 bg-blue-50 w-fit px-2 py-0.5 rounded-md text-xs mb-1">Associate</p>
                            <p className="font-bold text-gray-900">{inv.associate.name}</p>
                          </>
                        ) : (
                          <>
                            <p className="font-bold text-gray-900">{inv.customerName}</p>
                            <p className="text-xs text-gray-500">{inv.customerPhone}</p>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 italic text-sm text-gray-600 min-w-[200px]">
                      {inv.reason ? (
                        <p className="font-medium text-gray-800 not-italic">{inv.reason}</p>
                      ) : (
                        <p>{inv.project?.name || 'N/A'}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-black text-gray-900">₹{Number(inv.total || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <ActionButton icon={Eye} color="blue" onClick={() => setViewInvoice(inv)} tooltip="View Invoice" />
                        {user?.role === 'admin' && (
                          <>
                            <ActionButton icon={Edit} color="gray" onClick={() => openEdit(inv)} tooltip="Edit" />
                            <ActionButton icon={Trash2} color="red" onClick={() => handleDelete(inv._id)} tooltip="Delete" />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="text-center py-20">
                      <div className="flex flex-col items-center gap-2">
                        <FileText size={48} className="text-gray-200" />
                        <p className="text-gray-400 font-medium">No invoices found matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-gray-100">
          <Pagination
            currentPage={pagination.current}
            totalPages={pagination.pages}
            onPageChange={fetchInvoices}
          />
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <Modal title={`${modalType === 'create' ? 'Generate New' : 'Edit'} Invoice`} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-8 p-1">
            {/* Client & Project Info */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">Client Details</h3>
                <InputField label="Customer Name" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} required />
                <InputField label="Father's Name (S/O)" value={formData.fatherName} onChange={e => setFormData({ ...formData, fatherName: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Phone" value={formData.customerPhone} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })} required />
                  <InputField label="Email" value={formData.customerEmail} onChange={e => setFormData({ ...formData, customerEmail: e.target.value })} type="email" />
                </div>
                <InputField label="Customer Address" value={formData.customerAddress} onChange={e => setFormData({ ...formData, customerAddress: e.target.value })} />
                <div className="space-y-1 mt-4">
                  <label className="text-xs font-black text-blue-500 uppercase tracking-wider">Or Select Associate</label>
                  <select 
                    value={formData.associate} 
                    onChange={e => setFormData({ ...formData, associate: e.target.value })}
                    className="w-full px-4 py-2 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium bg-blue-50/50" 
                  >
                    <option value="">-- Choose Associate --</option>
                    {associates.map(a => <option key={a._id} value={a._id}>{a.name} ({a.phone})</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">Plot & Mapping</h3>
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Select Project</label>
                  <select 
                    value={formData.project} 
                    onChange={e => setFormData({ ...formData, project: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none font-medium" 
                    required
                  >
                    <option value="">-- Choose Project --</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Plot ID" value={formData.plotId} onChange={e => setFormData({ ...formData, plotId: e.target.value })} />
                  <InputField label="Plot No" value={formData.plotNo} onChange={e => setFormData({ ...formData, plotNo: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Area (Sq.Ft.)" value={formData.bookingArea} onChange={e => setFormData({ ...formData, bookingArea: e.target.value })} />
                  <InputField label="Facing" value={formData.plotFacing} onChange={e => setFormData({ ...formData, plotFacing: e.target.value })} />
                </div>
                <InputField label="Reference ID" value={formData.referenceId} onChange={e => setFormData({ ...formData, referenceId: e.target.value })} />
                <InputField label="Reason / Subject" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="E.g., Booking Amount" />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">Payment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-500 uppercase">Payment Mode</label>
                    <select 
                      value={formData.paymentMode} 
                      onChange={e => setFormData({ ...formData, paymentMode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none font-medium text-sm"
                    >
                      {['Cash', 'Cheque', 'RTGS', 'NEFT', 'Online', 'Card'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <InputField label="Inst. No (Cheq/#)" value={formData.instrumentNo} onChange={e => setFormData({ ...formData, instrumentNo: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Inst. Date" type="date" value={formData.instrumentDate} onChange={e => setFormData({ ...formData, instrumentDate: e.target.value })} />
                  <InputField label="Deposit Date" type="date" value={formData.depositDate} onChange={e => setFormData({ ...formData, depositDate: e.target.value })} />
                </div>
                <InputField label="Bank Name" value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Due Date" type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} required />
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-500 uppercase">Receipt Status</label>
                    <select 
                      value={formData.status} 
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none font-medium h-11"
                    >
                      {['Paid', 'Sent', 'Draft', 'Overdue', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <InputField label="Remark" value={formData.remark} onChange={e => setFormData({ ...formData, remark: e.target.value })} />
              </div>
            </div>

            {/* Pricing Section (Before Items) */}
            <div className="grid md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
               <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Property Valuation</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Rate (Per Sq.Ft.)" type="number" value={formData.rate} onChange={e => setFormData({ ...formData, rate: Number(e.target.value) })} />
                    <InputField label="PLC Amount" type="number" value={formData.plcAmount} onChange={e => setFormData({ ...formData, plcAmount: Number(e.target.value) })} />
                  </div>
                  <InputField label="Development Charges" type="number" value={formData.developmentCharge} onChange={e => setFormData({ ...formData, developmentCharge: Number(e.target.value) })} />
               </div>
               <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Payment Breakup</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Curr. Paid Amt" type="number" value={formData.paidAmount} onChange={e => setFormData({ ...formData, paidAmount: Number(e.target.value) })} />
                    <InputField label="Discount" type="number" value={formData.discount} onChange={e => setFormData({ ...formData, discount: Number(e.target.value) })} />
                  </div>
                  <InputField label="Total Paid (All time)" type="number" value={formData.totalPaid} onChange={e => setFormData({ ...formData, totalPaid: Number(e.target.value) })} />
                  <InputField label="Balance Amount" type="number" value={formData.balanceAmount} readOnly className="bg-gray-100 font-black text-red-600" />
               </div>
               <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Company Bank Details</h3>
                  <InputField label="Bank Name" value={formData.bankAccountName} onChange={e => setFormData({ ...formData, bankAccountName: e.target.value })} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Account No" value={formData.bankAccountNumber} onChange={e => setFormData({ ...formData, bankAccountNumber: e.target.value })} />
                    <InputField label="IFSC Code" value={formData.bankIFSC} onChange={e => setFormData({ ...formData, bankIFSC: e.target.value })} />
                  </div>
               </div>
            </div>

            {/* Items Table */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Description & Pricing</h3>
                <button 
                  type="button" 
                  onClick={addItem}
                  className="text-xs font-bold text-red-600 flex items-center gap-1 hover:text-red-700 transition-colors"
                >
                  <Plus size={14} /> Add Another Item
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-end animate-in slide-in-from-left duration-300">
                    <div className="col-span-6 lg:col-span-7">
                      <InputField 
                        label={index === 0 ? "Description" : ""} 
                        value={item.description} 
                        onChange={e => handleItemChange(index, 'description', e.target.value)} 
                        placeholder="Service or Product name"
                        required 
                      />
                    </div>
                    <div className="col-span-2 lg:col-span-1">
                      <InputField 
                        label={index === 0 ? "Qty" : ""} 
                        type="number"
                        min="1"
                        value={item.quantity} 
                        onChange={e => handleItemChange(index, 'quantity', e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="col-span-3 lg:col-span-3">
                      <InputField 
                        label={index === 0 ? "Unit Price" : ""} 
                        type="number"
                        value={item.unitPrice} 
                        onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="col-span-1 flex justify-center pb-2">
                      <button 
                        type="button" 
                        onClick={() => removeItem(index)}
                        className={`text-gray-300 hover:text-red-600 transition-colors ${formData.items.length === 1 ? 'invisible' : ''}`}
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Calculation */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex-1 w-full lg:max-w-md">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2 block">Additional Notes</label>
                <textarea 
                  value={formData.notes} 
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Payment terms, bank details, or generic notes..."
                  className="w-full h-24 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none font-medium text-sm transition-all"
                />
              </div>

              <div className="w-full lg:w-72 space-y-3">
                <div className="flex justify-between text-sm text-gray-500 font-bold">
                  <span>Subtotal:</span>
                  <span>₹{totals.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-xs font-black text-gray-500 uppercase">Tax (%)</span>
                  <input 
                    type="number" 
                    value={formData.taxRate} 
                    onChange={e => setFormData({ ...formData, taxRate: e.target.value })}
                    className="w-20 px-3 py-1 bg-white border border-gray-200 rounded-lg text-right font-bold focus:ring-2 focus:ring-red-500 transition-all outline-none" 
                  />
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                  <span className="font-black text-gray-900">GRAND TOTAL:</span>
                  <span className="text-2xl font-black text-red-600">₹{totals.total.toLocaleString()}</span>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-black text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-xl shadow-red-100 mt-4"
                >
                  <Save size={20} />
                  {modalType === 'create' ? 'Generate Official Invoice' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW / PRINT MODAL */}
      {viewInvoice && !showModal && (
        <Modal title={`Invoice Viewer - #${viewInvoice.invoiceNumber}`} onClose={() => setViewInvoice(null)} maxWidth="max-w-4xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-red-50 p-4 md:p-6 rounded-xl border border-red-100 no-print">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button 
                onClick={() => handlePrint()} 
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <Printer size={18} /> Print Invoice
              </button>
              <button 
                onClick={handleDownloadPDF}
                className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
              >
                <Download size={18} /> Save as PDF
              </button>
            </div>
            <p className="text-xs md:text-sm font-black text-red-600 uppercase tracking-wider italic bg-white/50 px-3 py-1 rounded-lg">
              Optimized for A4 Printing
            </p>
          </div>
          
          <div className="overflow-y-auto max-h-[70vh] rounded-xl border border-gray-100 shadow-inner p-2 bg-gray-50/30">
            <InvoiceView ref={printRef} invoice={viewInvoice} />
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ================= COMPONENT HELPER COMPONENTS ================= */

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colors = {
    red: 'from-red-600 to-red-800 text-red-600',
    blue: 'from-blue-600 to-blue-800 text-blue-600',
    green: 'from-green-600 to-green-800 text-green-600',
    orange: 'from-orange-600 to-orange-800 text-orange-600'
  };

  return (
    <div className="bg-white p-3 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-start gap-2 group hover:shadow-md transition-all overflow-hidden">
      <div className={`p-2.5 md:p-3 rounded-xl bg-gray-50 group-hover:bg-red-50 transition-colors shrink-0`}>
        <Icon className={`w-5 h-5 md:w-6 md:h-6 ${colors[color].split(' ')[2]}`} strokeWidth={2.5} />
      </div>
      <div className="w-full">
        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-0.5">{title}</p>
        <p className="text-sm md:text-base font-black text-gray-900 break-all leading-tight">{value}</p>
      </div>
    </div>
  );
};

const InputField = ({ label, ...props }) => (
  <div className="space-y-1">
    {label && <label className="text-xs font-black text-gray-500 uppercase tracking-wider">{label}</label>}
    <input 
      {...props}
      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none font-medium h-11 placeholder:text-gray-300"
    />
  </div>
);

const ActionButton = ({ icon: Icon, color, onClick, tooltip }) => {
  const colors = {
    red: 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-red-100',
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border-blue-100',
    gray: 'bg-gray-50 text-gray-600 hover:bg-gray-800 hover:text-white border-gray-200'
  };

  return (
    <button 
      onClick={onClick}
      title={tooltip}
      className={`p-2 rounded-lg border transition-all transform active:scale-95 ${colors[color]}`}
    >
      <Icon size={18} />
    </button>
  );
};

const Modal = ({ children, title, onClose, maxWidth = "max-w-6xl" }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4 animate-in fade-in duration-300">
    <div className={`bg-white rounded-3xl w-full ${maxWidth} max-h-[92vh] flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-300`}>
      <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg md:text-2xl font-black text-gray-900 flex items-center gap-2">
          {title}
        </h2>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
        >
          <X size={24} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {children}
      </div>
    </div>
  </div>
);

export default InvoiceManagement;
