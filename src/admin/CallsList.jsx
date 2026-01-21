import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CallsList = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const navigate = useNavigate();

  // Updated column names to match your actual API data
  const desiredColumns = [
    'Call No',
    'RE DT',
    'AS DT',
    'DI DT',
    'ER DT',
    'OL DT',
    'TW DT',
    'CL DT',
    'OL_TW',
    'CAR YEAR',
    'MAKE',
    'MODEL',
    'GARAGE',
    'TRUCK',
    'DRIVER ID',
    'BL ADDRESS',
    'TOW ADDRESS',
    'TLR CD',
    'OM Mileage',
    'TW Mileage',
    'Clear Reason',
    'BA cost',
    'OM COST',
    'TW COST',
    'W1 COST',
    'SUBTOTAL',
    'TAX',
    'TOTAL COST',
  ];

  // Updated column titles to match your actual API data
  const columnTitles = {
    'Call No': 'Call No',
    'RE DT': 'RE DT',
    'AS DT': 'AS DT',
    'DI DT': 'DI DT',
    'ER DT': 'ER DT',
    'OL DT': 'OL DT',
    'TW DT': 'TW DT',
    'CL DT': 'CL DT',
    'OL_TW': 'OL_TW (PR1)',
    'CAR YEAR': 'CAR YEAR',
    'MAKE': 'MAKE',
    'MODEL': 'MODEL',
    'GARAGE': 'GARAGE(Clients)',
    'TRUCK': 'TRUCK',
    'DRIVER ID': 'DRIVER ID',
    'BL ADDRESS': 'BL ADDRESS',
    'TOW ADDRESS': 'TOW ADDRESS',
    'TLR CD': 'TLR CD',
    'OM Mileage': 'OM Mileage (REMS)',
    'TW Mileage': 'TW Mileage (RPMS)',
    'Clear Reason': 'Clear Reason',
    'BA cost': 'BA cost',
    'OM COST': 'OM COST',
    'TW COST': 'TW COST',
    'W1 COST': 'W1 COST',
    'SUBTOTAL': 'SUBTOTAL',
    'TAX': 'TAX',
    'TOTAL COST': 'TOTAL COST',
  };

  const fetchData = async (page = 1, limit = 10) => {
    setLoading(true);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('No token provided. Please login first.');
      navigate('/login');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://expensemanager-production-303e.up.railway.app/api/email/getCallRecords?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to fetch data');
      }

      const json = await response.json();
      // Fixed: Access data directly from json.data
      if (json.success && json.data) {
        // Extract just the data part from each item
        const extractedData = json.data.map(item => item.data);
        setRows(extractedData);
        
        // Update pagination state
        if (json.pagination) {
          setPagination(json.pagination);
        }
      } else {
        throw new Error('No data found in response');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: parseInt(newLimit), page: 1 }));
  };

  const ShimmerRow = () => (
    <tr className="animate-pulse">
      <td colSpan={desiredColumns.length} className="px-6 py-5">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </td>
    </tr>
  );

  if (error) {
    return (
      <div className="text-center py-10 text-red-600 dark:text-red-400">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 dark:bg-[#080F25] min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Garage Productivity Calls Details
      </h1>

      <div className="overflow-x-auto shadow-xl rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-[#101935]">
          <thead className="bg-gray-50 dark:bg-[#1a2540] sticky top-0 z-10">
            <tr>
              {desiredColumns.map((key, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r dark:border-gray-600 last:border-r-0"
                >
                  {columnTitles[key] || key}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <>
                {Array.from({ length: 10 }).map((_, i) => (
                  <ShimmerRow key={i} />
                ))}
              </>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={desiredColumns.length}
                  className="px-6 py-10 text-center text-gray-500 dark:text-gray-400"
                >
                  No data available
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50 dark:hover:bg-[#1a2540] transition-colors"
                >
                  {desiredColumns.map((key, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300 whitespace-nowrap border-r dark:border-gray-600 last:border-r-0"
                    >
                      {row[key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">
            Show
          </span>
          <select
            value={pagination.limit}
            onChange={(e) => handleLimitChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-700 dark:text-gray-300 ml-2">
            entries
          </span>
        </div>

        <div className="flex items-center">
          <span className="text-sm text-gray-700 dark:text-gray-300 mr-4">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
          </span>
          
          <div className="flex space-x-1">
            <button
              onClick={() => handlePageChange(1)}
              disabled={pagination.page === 1}
              className={`px-3 py-1 rounded-md ${pagination.page === 1 ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} border border-gray-300 dark:border-gray-600`}
            >
              First
            </button>
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`px-3 py-1 rounded-md ${pagination.page === 1 ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} border border-gray-300 dark:border-gray-600`}
            >
              Previous
            </button>
            
            {/* Page Numbers */}
            <div className="flex space-x-1">
              {pagination.page > 2 && (
                <button
                  onClick={() => handlePageChange(pagination.page - 2)}
                  className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                >
                  {pagination.page - 2}
                </button>
              )}
              {pagination.page > 1 && (
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                >
                  {pagination.page - 1}
                </button>
              )}
              <button
                className="px-3 py-1 rounded-md bg-blue-500 text-white border border-blue-500"
              >
                {pagination.page}
              </button>
              {pagination.page < pagination.totalPages && (
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                >
                  {pagination.page + 1}
                </button>
              )}
              {pagination.page < pagination.totalPages - 1 && (
                <button
                  onClick={() => handlePageChange(pagination.page + 2)}
                  className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                >
                  {pagination.page + 2}
                </button>
              )}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className={`px-3 py-1 rounded-md ${pagination.page === pagination.totalPages ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} border border-gray-300 dark:border-gray-600`}
            >
              Next
            </button>
            <button
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              className={`px-3 py-1 rounded-md ${pagination.page === pagination.totalPages ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} border border-gray-300 dark:border-gray-600`}
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallsList;