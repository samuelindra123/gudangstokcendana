'use client';

'use client';

import { Download, Loader } from 'lucide-react';

interface ExportData {
  items: any[];
  filename: string;
}

export function useExportToCSV() {
  const exportToCSV = ({ items, filename }: ExportData) => {
    if (!items || items.length === 0) {
      alert('Tidak ada data untuk diekspor');
      return;
    }

    // Get all unique keys from items
    const headers = Array.from(
      new Set(items.flatMap(item => Object.keys(item)))
    ).filter(key => !key.startsWith('$'));

    // Create CSV content
    const csv = [
      headers.join(','),
      ...items.map(item =>
        headers
          .map(header => {
            const value = item[header];
            // Escape quotes and wrap in quotes if contains comma
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value ?? '';
          })
          .join(',')
      )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { exportToCSV };
}

interface ExportButtonProps {
  items: any[];
  filename: string;
  label?: string;
  isLoading?: boolean;
}

export function ExportButton({ items, filename, label = 'Export CSV', isLoading = false }: ExportButtonProps) {
  const { exportToCSV } = useExportToCSV();

  const handleExport = () => {
    exportToCSV({ items, filename });
  };

  return (
    <button
      onClick={handleExport}
      disabled={isLoading || !items || items.length === 0}
      className="inline-flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white text-xs md:text-sm font-medium rounded-lg border border-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {label}
    </button>
  );
}
