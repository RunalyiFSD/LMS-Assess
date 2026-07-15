import React from 'react';

/**
 * Reusable Paginated and Responsive Table component.
 * @param {Array} columns - List of { header: string, accessor: string|function }
 * @param {Array} data - Table records
 */
const Table = ({ columns, data = [], loading = false, pagination, emptyMessage = 'No records found' }) => {
  return (
    <div className="w-full">
      <div className="overflow-x-auto w-full border border-slate-200/80 rounded-lg bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-slate-400 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
                    Loading records...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-slate-400 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-50/50 transition-colors">
                  {columns.map((col, colIndex) => {
                    const value = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor];
                    return (
                      <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {pagination && data.length > 0 && (
        <div className="flex items-center justify-between px-2 py-4">
          <span className="text-xs text-slate-500">
            Page <span className="font-semibold text-slate-700">{pagination.page}</span> of{' '}
            <span className="font-semibold text-slate-700">{pagination.totalPages}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={pagination.onPrev}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={pagination.onNext}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
