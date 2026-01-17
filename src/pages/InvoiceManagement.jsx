import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText, Plus, Search, Eye,
  Trash2, Edit, Printer,
  CheckCircle, Clock, AlertCircle, X
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import Swal from 'sweetalert2';
import { invoicesAPI, projectsAPI } from '../utils/api';
import { Pagination, ExportButton } from '../utils/tableUtils.jsx';
import InvoiceView from '../components/InvoiceView';

const EMPTY_FORM = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  project: '',
  items: [{ description: '', quantity: 1, unitPrice: 0 }],
  dueDate: '',
  notes: '',
  status: 'Draft',
  taxRate: 0,
};

const InvoiceManagement = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [modalType, setModalType] = useState('create');
  const [formData, setFormData] = useState(EMPTY_FORM);

  const printRef = useRef();

  /* ================= PRINT ================= */
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: viewInvoice ? `Invoice-${viewInvoice.invoiceNumber}` : 'Invoice',
  });

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
    const res = await projectsAPI.getAll();
    setProjects(res.data || []);
  }, []);

  useEffect(() => {
    fetchInvoices();
    fetchProjects();
  }, [fetchInvoices, fetchProjects]);

  /* ================= HELPERS ================= */
  const calculateTotal = () => {
    const subtotal = formData.items.reduce(
      (s, i) => s + Number(i.quantity) * Number(i.unitPrice),
      0
    );
    const tax = (subtotal * Number(formData.taxRate || 0)) / 100;
    return { subtotal, tax, total: subtotal + tax };
  };

  /* ================= MODAL ================= */
  const openCreate = () => {
    setModalType('create');
    setFormData(EMPTY_FORM);
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
      project: invoice.project?._id || '',
      items: invoice.items?.map(i => ({
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })) || [{ description: '', quantity: 1, unitPrice: 0 }],
      dueDate: invoice.dueDate
        ? invoice.dueDate.split('T')[0]
        : '',
      notes: invoice.notes || '',
      status: invoice.status || 'Draft',
      taxRate: invoice.taxRate || 0,
    });

    setShowModal(true);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { subtotal, tax, total } = calculateTotal();

    const payload = {
      ...formData,
      items: formData.items.map(i => ({
        description: i.description,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      })),
      subtotal,
      taxAmount: tax,
      total,
    };

    try {
      if (modalType === 'create') {
        await invoicesAPI.create(payload);
        toast.success('Invoice created');
      } else {
        await invoicesAPI.update(viewInvoice._id, payload);
        toast.success('Invoice updated');
      }

      setShowModal(false);
      setFormData(EMPTY_FORM);
      fetchInvoices();
    } catch (err) {
      toast.error(err.message || 'Invoice failed');
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Delete Invoice?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
    });

    if (confirm.isConfirmed) {
      await invoicesAPI.delete(id);
      toast.success('Invoice deleted');
      fetchInvoices();
    }
  };

  /* ================= UI ================= */
  const tabs = [
    { key: 'all', label: 'All Invoices' },
    { key: 'Paid', label: 'Paid' },
    { key: 'Sent', label: 'Sent' },
    { key: 'Draft', label: 'Draft' },
    { key: 'Overdue', label: 'Overdue' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <p className="text-gray-600">Create and manage invoices</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex gap-2">
          <Plus size={18} /> Create Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Stat title="Total" value={pagination.total} icon={FileText} />
        <Stat title="Paid" value={invoices.filter(i => i.status === 'Paid').length} icon={CheckCircle} />
        <Stat title="Pending" value={invoices.filter(i => ['Sent', 'Draft'].includes(i.status)).length} icon={Clock} />
        <Stat title="Overdue" value={invoices.filter(i => i.status === 'Overdue').length} icon={AlertCircle} />
      </div>

      {/* Table */}
      <div className="card">
        <div className="flex justify-between mb-4">
          <div className="flex gap-2">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === t.key
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search"
              className="border rounded px-3 py-2"
            />
            <ExportButton data={invoices} filename="invoices" />
          </div>
        </div>

        {loading ? (
          <p className="text-center py-10">Loading...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th>#</th><th>Client</th><th>Project</th>
                <th>Amount</th><th>Date</th><th>Status</th><th />
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv._id} className="border-b">
                  <td>#{inv.invoiceNumber || '-'}</td>
                  <td>{inv.customerName}</td>
                  <td>{inv.project?.name || 'N/A'}</td>
                  <td>₹{Number(inv.total || 0).toLocaleString()}</td>
                  <td>{inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : '-'}</td>
                  <td>{inv.status}</td>
                  <td className="flex gap-2">
                    <Eye onClick={() => setViewInvoice(inv)} />
                    <Edit onClick={() => openEdit(inv)} />
                    <Trash2 onClick={() => handleDelete(inv._id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Pagination
          currentPage={pagination.current}
          totalPages={pagination.pages}
          onPageChange={fetchInvoices}
        />
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} placeholder="Customer Name" required />
            <select value={formData.project} onChange={e => setFormData({ ...formData, project: e.target.value })} required>
              <option value="">Select Project</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            <button className="btn-primary">
              {modalType === 'create' ? 'Create' : 'Update'}
            </button>
          </form>
        </Modal>
      )}

      {/* VIEW / PRINT */}
      {viewInvoice && !showModal && (
        <Modal onClose={() => setViewInvoice(null)}>
          <button onClick={handlePrint} className="btn-primary mb-3">
            <Printer size={16} /> Print
          </button>
          <InvoiceView ref={printRef} invoice={viewInvoice} />
        </Modal>
      )}
    </div>
  );
};

/* ================= SMALL COMPONENTS ================= */

const Stat = ({ title, value, icon: Icon }) => (
  <div className="card flex justify-between">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
    <Icon className="text-gray-400" />
  </div>
);

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl w-full max-w-4xl relative">
      <X onClick={onClose} className="absolute top-4 right-4 cursor-pointer" />
      {children}
    </div>
  </div>
);

export default InvoiceManagement;
