import React, { forwardRef } from 'react';

const InvoiceView = forwardRef(({ invoice }, ref) => {
  if (!invoice) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).toUpperCase();
  };

  const formatCurrency = (amt) => {
    return Number(amt || 0).toFixed(2);
  };

  return (
    <div ref={ref} className="bg-white p-6 md:p-10 max-w-[800px] mx-auto text-[12px] leading-snug text-gray-800 font-sans border border-gray-100 print:border-none" id="invoice-print">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
          #invoice-print { 
            padding: 0 !important; 
            margin: 0 !important; 
            width: 100% !important; 
            max-width: none !important;
            box-shadow: none !important;
          }
          .no-print { display: none !important; }
        }
        .receipt-table td { padding: 4px 0; }
        .receipt-border { border: 1px solid #000; }
        .receipt-table .flex { align-items: baseline; }
      `}} />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <img 
            src="/SP City Logo PNG.png" 
            alt="Logo" 
            className="h-20 w-auto object-contain"
          />
          <div>
            <h1 className="text-2xl font-black text-blue-900 tracking-tight leading-none">Shivapuram City</h1>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-black text-black">SHIVAPURAM INFRA DEVELOPERS</h1>
          <p className="font-bold text-gray-700">Shivapuram city Prayagraj Uttar Pradesh</p>
        </div>
      </div>

      {/* Title Bar */}
      <div className="bg-black text-white text-center py-1 font-bold text-lg mb-4 tracking-widest uppercase">
        Print Receipt
      </div>

      {/* Date Row */}
      <div className="text-right font-bold border-b border-gray-300 pb-1 mb-4">
        {formatDate(invoice.issueDate || invoice.createdAt)}
      </div>

      {/* Customer Info Section */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-start gap-12">
          <div className="flex-1 space-y-2">
            <p className="font-bold">To,</p>
            <div className="flex items-start">
              <span className="w-24 shrink-0 font-bold text-gray-600">Mr./Mrs. :</span>
              <span className="font-bold border-b border-gray-400 flex-1 uppercase">{invoice.customerName}</span>
              <span className="mx-2 font-bold text-gray-600">S/O</span>
              <span className="font-bold border-b border-gray-400 flex-1 uppercase">{invoice.fatherName || '---'}</span>
            </div>
            <div className="flex items-start">
               <span className="w-24 shrink-0 font-bold text-gray-600">Address :</span>
               <span className="font-bold border-b border-gray-400 flex-1 capitalize">{invoice.customerAddress || '---'}</span>
            </div>
          </div>
          
          <div className="w-64 space-y-2">
             <div className="flex">
                <span className="w-32 shrink-0 font-bold text-gray-600">Serial No :</span>
                <span className="font-bold uppercase">{invoice.invoiceNumber}</span>
             </div>
             <div className="flex">
                <span className="w-32 shrink-0 font-bold text-gray-600">Reference Id :</span>
                <span className="font-bold uppercase">{invoice.referenceId || '---'}</span>
             </div>
             <div className="flex">
                <span className="w-32 shrink-0 font-bold text-gray-600">Update By Id :</span>
                <span className="font-bold uppercase">{invoice.createdBy?.name || 'ADMIN'}</span>
             </div>
          </div>
        </div>
        <div className="font-bold flex">
           <span className="w-24 text-gray-600">Mobile No :</span>
           <span className="border-b border-gray-400">{invoice.customerPhone}</span>
        </div>
      </div>

      {/* Greeting Message */}
      <div className="mb-6 leading-relaxed">
        <p className="font-bold mb-1">Dear Sir/Madam,</p>
        <p>
          We congratulate you on being the proud owner of a Plot in our project " <span className="font-bold text-black uppercase">{invoice.project?.name}</span> ". 
          Received with thanks for payment deposit given herein under.
        </p>
      </div>

      {/* Dynamic Data Grid */}
      <div className="flex flex-row gap-x-10 mb-6 items-start receipt-table">
        {/* Left Column */}
        <div className="w-[48%] space-y-1.5 pt-4">
          <div className="flex justify-between border-b border-gray-200">
            <span className="font-bold text-gray-600 shrink-0">Project Name-</span>
            <span className="font-bold text-right uppercase text-blue-900">{invoice.project?.name}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200">
            <span className="font-bold text-gray-600 shrink-0">Plot Id.-</span>
            <span className="font-bold text-right uppercase">{invoice.plotId || '---'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200">
            <span className="font-bold text-gray-600 shrink-0">Plot No..-</span>
            <span className="font-bold text-right uppercase">{invoice.plotNo || '---'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200">
            <span className="font-bold text-gray-600 shrink-0">Booking Area-</span>
            <span className="font-bold text-right uppercase">{invoice.bookingArea || '---'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200">
            <span className="font-bold text-gray-600 shrink-0">Plot Facing-</span>
            <span className="font-bold text-right uppercase">{invoice.plotFacing || '---'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 mt-4">
            <span className="font-bold text-gray-600 shrink-0">Rate-</span>
            <span className="font-black text-right">{formatCurrency(invoice.rate)}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200">
            <span className="font-bold text-gray-600 shrink-0">Total Amt.-</span>
            <span className="font-black text-right">{formatCurrency(invoice.total)}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200">
            <span className="font-bold text-gray-600 shrink-0">PLC Amt.-</span>
            <span className="font-bold text-right text-red-600">{formatCurrency(invoice.plcAmount)} -INR</span>
          </div>
          <div className="flex justify-between border-b border-gray-200">
            <span className="font-bold text-gray-600 shrink-0">Paid Amt.-</span>
            <span className="font-black text-right text-blue-700">{formatCurrency(invoice.paidAmount)} -INR</span>
          </div>
          <div className="flex justify-between border-b border-gray-200">
            <span className="font-bold text-gray-600 shrink-0 capitalize">Balance Amt.-</span>
            <span className="font-black text-right text-red-700">{formatCurrency(invoice.balanceAmount)} -INR</span>
          </div>
          <div className="flex items-center gap-4 pt-4">
            <span className="font-black text-gray-900 shrink-0 uppercase">Current Status :</span>
            <span className="text-green-600 font-black text-[13px] italic">Payment Recieved..!</span>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-[48%] space-y-1.5 pt-4">
          <div className="flex justify-between border-b border-gray-200">
            <span className="font-bold text-gray-600 shrink-0">Todays Date-</span>
            <span className="font-bold text-right">{formatDateTime(invoice.issueDate || invoice.createdAt)}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200">
            <span className="font-bold text-gray-600 shrink-0">Deposit Date-</span>
            <span className="font-bold text-right">{formatDate(invoice.depositDate) || '---'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200">
            <span className="font-bold text-gray-600 shrink-0">Mode of Payment-</span>
            <span className="font-black text-right italic text-blue-800">{invoice.paymentMode}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200">
            <span className="font-bold text-gray-600 shrink-0">Cheque/RTGS/NEFT No.-</span>
            <span className="font-bold text-right uppercase">{invoice.instrumentNo || '---'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200">
            <span className="font-bold text-gray-600 shrink-0">Inst. Date-</span>
            <span className="font-bold text-right">{formatDate(invoice.instrumentDate) || '---'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 mt-4">
            <span className="font-bold text-gray-600 shrink-0">Bank-</span>
            <span className="font-bold text-right uppercase">{invoice.bankName || '---'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200">
            <span className="font-bold text-gray-600 shrink-0">Remark-</span>
            <span className="font-bold text-right italic text-red-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">{invoice.remark || 'N/A'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200">
            <span className="font-bold text-gray-600 shrink-0">Development Charge</span>
            <span className="font-bold text-right">{formatCurrency(invoice.developmentCharge)} -INR</span>
          </div>
          <div className="flex justify-between border-b border-gray-200">
            <span className="font-bold text-gray-600 shrink-0">Discount</span>
            <span className="font-bold text-right">{formatCurrency(invoice.discount)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-black mt-2">
            <span className="font-black text-lg text-gray-900 uppercase">Total Paid :</span>
            <span className="font-black text-xl text-black">{formatCurrency(invoice.totalPaid || invoice.paidAmount)}</span>
          </div>
        </div>
      </div>

      {/* Account Details Table */}
      <div className="mb-6">
        <p className="font-bold mb-1 uppercase tracking-tight">Account Details</p>
        <table className="w-full border-collapse border border-black receipt-border text-center">
           <tbody>
              <tr>
                 <td className="border border-black p-2 font-black w-1/4 bg-gray-50 uppercase text-[11px]">Bank Name</td>
                 <td className="border border-black p-2 font-bold w-1/4">{invoice.bankAccountName || '---'}</td>
                 <td className="border border-black p-2 font-black w-1/4 bg-gray-50 uppercase text-[11px]">Account Number</td>
                 <td className="border border-black p-2 font-bold w-1/4 tracking-wider">{invoice.bankAccountNumber || '---'}</td>
              </tr>
              <tr>
                 <td className="border border-black p-2 font-black bg-gray-50 uppercase text-[11px]">RTGS/NEFT IFSC</td>
                 <td className="border border-black p-2 font-bold tracking-widest">{invoice.bankIFSC || '---'}</td>
                 <td className="border border-black p-2 font-black bg-gray-50 uppercase text-[11px]">Bank Address</td>
                 <td className="border border-black p-2 font-medium text-[11px]">{invoice.bankBranchAddress || '---'}</td>
              </tr>
           </tbody>
        </table>
      </div>

      {/* Notes Section */}
      <div className="text-[11px] space-y-1 mb-10 text-gray-700">
        <p className="font-black text-black">NOTE-</p>
        <p className="font-black text-black uppercase">Booking Non Refundable</p>
        <p>1- Above mentioned rate is applicable for 60 days only from the date of booking.</p>
        <p>2- 10% Extra charges applicable on all Corner/Double side road plots & 20% on all park facing plots.</p>
        <p>3- 10% Extra charge/Current rate (Whichever will be higher) applicable on plot cost after due date (after 60 days from date of booking).</p>
      </div>

      {/* Footer / Signatory */}
      <div className="flex justify-end pt-8">
        <div className="text-center w-64">
           <p className="font-bold text-black">( Authority Signatory )</p>
           <p className="text-xs text-gray-500 mt-1">Shivapuram City Real Estate</p>
        </div>
      </div>
    </div>
  );
});

InvoiceView.displayName = 'InvoiceView';

export default InvoiceView;
