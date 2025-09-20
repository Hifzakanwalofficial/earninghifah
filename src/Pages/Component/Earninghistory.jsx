import React, { useState, useEffect } from 'react';

const Earninghistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCycleGraph = async () => {
      try {
        // Retrieve the token from localStorage
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }

        const response = await fetch(
          'https://expensemanager-production-4513.up.railway.app/api/driver/cycle-graph',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch cycle graph data');
        }

        const apiData = await response.json();
        
        // Transform API data into the required format
        const transformedData = apiData.graphData
          .filter((item) => item.totalEarnings > 0) // Only include days with non-zero earnings
          .map((item) => ({
            date: new Date(item.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }), // e.g., "Sep 19"
            amount: `₨${item.totalEarnings.toLocaleString()}`, // Format as currency, e.g., "₨254,831"
            calls: item.totalCalls, // Store calls count for potential use
          }));

        setData(transformedData);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
        setLoading(false);
      }
    };

    fetchCycleGraph();
  }, []);

  // Table Shimmer Component
  const TableShimmer = () => (
    <div
      className="bg-white rounded-[8px] p-5"
      style={{ boxShadow: '0px 0px 16px #E3EBFC' }}
    >
      {/* Header Shimmer */}
      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="w-56 h-3 bg-gray-200 rounded animate-pulse"></div>

      {/* Table Header Shimmer */}
      <div className="mt-4">
        <div className="grid grid-cols-2 border-b border-[#E2E8F0] pb-2">
          <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse ml-auto"></div>
        </div>

        {/* Table Rows Shimmer */}
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-2 py-2 border-b border-[#E2E8F0]"
          >
            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-12 h-3 bg-gray-200 rounded animate-pulse ml-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <TableShimmer />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div
      className="bg-white rounded-[8px] p-5"
      style={{ boxShadow: '0px 0px 16px #E3EBFC' }}
    >
      {/* Header */}
      <h2 className="text-[#1E293B] text-[16px] font-semibold">
        Earning History
      </h2>
      <p className="text-[#64748B] text-[14px] mt-1">
        Daily earnings for the current cycle period.
      </p>

      {/* Table */}
      <div className="mt-4">
        <div className="grid grid-cols-2 text-[14px] font-semibold text-[#475569] border-b border-[#E2E8F0] pb-2">
          <p>Date</p>
          <p className="text-right">Amounts</p>
        </div>

        {data.length > 0 ? (
          data.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-2 text-[14px] text-[#334155] py-2 border-b border-[#E2E8F0]"
            >
              <p>{item.date}</p>
              <p className="text-right font-medium">{item.amount}</p>
            </div>
          ))
        ) : (
          <div className="text-[14px] text-[#334155] py-4 text-center">
            No earnings data available for this cycle period.
          </div>
        )}
      </div>
    </div>
  );
};

export default Earninghistory;