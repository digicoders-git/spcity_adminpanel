import React from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import Swal from 'sweetalert2';

// Pagination Component
export const Pagination = ({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              page === currentPage
                ? 'bg-gradient-to-r from-red-600 to-black text-white'
                : page === '...'
                ? 'cursor-default text-gray-400'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Excel Export Function
export const exportToExcel = (data, filename, headers = null) => {
  if (!data || data.length === 0) {
    Swal.fire({
      title: 'No Data to Export',
      text: 'There is no data available to export.',
      icon: 'info',
      confirmButtonColor: '#3b82f6'
    });
    return;
  }

  // Create CSV content
  let csvContent = '';
  
  // Add headers
  if (headers) {
    csvContent += headers.join(',') + '\n';
  } else {
    csvContent += Object.keys(data[0]).join(',') + '\n';
  }
  
  // Add data rows
  data.forEach(row => {
    const values = headers 
      ? headers.map(header => {
          const key = header.toLowerCase().replace(/\s+/g, '');
          const value = row[key] || row[header] || '';
          return `"${String(value).replace(/"/g, '""')}"`;
        })
      : Object.values(row).map(value => `"${String(value).replace(/"/g, '""')}"`);
    csvContent += values.join(',') + '\n';
  });

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export Button Component
export const ExportButton = ({ data, filename, headers, className = "" }) => {
  return (
    <button
      onClick={() => exportToExcel(data, filename, headers)}
      className={`btn-primary flex items-center space-x-2 px-4 py-2 ${className}`}
    >
      <Download className="w-4 h-4" />
      <span>Export Excel</span>
    </button>
  );
};

// Pagination Hook
export const usePagination = (data, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);
  
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  // Reset to page 1 when data changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);
  
  return {
    currentPage,
    totalPages,
    currentData,
    goToPage,
    totalItems: data.length
  };
};