import React, { useState, useEffect } from 'react';
import Linechart from './Component/Linechart';
import { FiPhoneCall } from "react-icons/fi";
import { FaDollarSign } from "react-icons/fa";
import { PiSpeedometerThin } from "react-icons/pi";
import { BiMessageSquareError } from "react-icons/bi";
import { FaChartLine } from "react-icons/fa6";

// Shimmer placeholder component for stats cards
const ShimmerCard = () => (
  <div className="bg-white px-[14px] py-[24px] rounded-xl shadow animate-pulse flex items-center justify-between">
    <div className="space-y-2 w-full">
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-8 bg-gray-300 rounded w-3/4"></div>
    </div>
    <div className='bg-gray-300 h-[40px] w-[40px] rounded-full'></div>
  </div>
);

// Shimmer placeholder for chart area
const ShimmerChart = () => (
  <div className="bg-white rounded-xl shadow animate-pulse h-[300px] w-full"></div>
);

const Overview = () => {
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({
    totalCalls: 0,
    totalEarnings: 0,
    totalRems: 320, // Placeholder, as no mapping provided
    totalPri: 45, // Placeholder, as no mapping provided
    grandTotal: 7810, // Placeholder, as no mapping provided
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCycleGraph = async () => {
      try {
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
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch cycle graph data');
        }

        const data = await response.json();

        const transformedData = data.graphData.map((day) => ({
          name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
          earnings: day.totalEarnings,
        }));

        const totalCalls = data.graphData.reduce((sum, day) => sum + day.totalCalls, 0);
        const totalEarnings = data.graphData.reduce((sum, day) => sum + day.totalEarnings, 0);

        setChartData(transformedData);
        setStats((prevStats) => ({
          ...prevStats,
          totalCalls,
          totalEarnings,
        }));
        setLoading(false);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
        setLoading(false);
      }
    };

    fetchCycleGraph();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        {/* Topbar Shimmer */}
        <div className="mb-[44px]">
          <div className="h-8 w-48 bg-gray-300 rounded animate-pulse"></div>
        </div>

        {/* Stats Cards Shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <ShimmerCard />
          <ShimmerCard />
          <ShimmerCard />
          <ShimmerCard />
          <ShimmerCard />
        </div>

        {/* Text Shimmer */}
        <div className='mt-[44px] space-y-2'>
          <div className="h-6 w-40 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 w-72 bg-gray-300 rounded animate-pulse"></div>
        </div>

        {/* Chart Shimmer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 w-[100%]">
          <ShimmerChart />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="min-h-screen p-6 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Topbar */}
      <div>
        <p className='robotosemibold text-[24px] mb-[44px]'>Dashboard Overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div className="bg-white px-[14px] py-[24px] rounded-xl shadow hover:shadow-lg transition flex items-center justify-between">
          <div>
            <h2 className="text-[16px] robotomedium text-[#333333B2]">Total Call</h2>
            <p className="text-2xl font-bold mt-2">{stats.totalCalls}</p>
          </div>
          <div className='bg-[#778da93f] h-[40px] w-[40px] rounded-full flex items-center justify-center'>
            <FiPhoneCall className='text-[#778DA9] text-[18px] robotobold' />
          </div>
        </div>

        <div className="bg-white px-[14px] py-[24px] rounded-xl shadow hover:shadow-lg transition flex items-center justify-between">
          <div>
            <h2 className="text-[16px] robotomedium text-[#333333B2]">Total Rems</h2>
            <p className="text-2xl font-bold mt-2">{stats.totalRems}</p>
          </div>
          <div className='bg-[#778da93f] h-[40px] w-[40px] rounded-full flex items-center justify-center'>
            <FaDollarSign className='text-[#778DA9] text-[18px] robotobold' />
          </div>
        </div>

        <div className="bg-white px-[14px] py-[24px] rounded-xl shadow hover:shadow-lg transition flex items-center justify-between">
          <div>
            <h2 className="text-[16px] robotomedium text-[#333333B2]">Total Rpm</h2>
            <p className="text-2xl font-bold mt-2">${stats.totalEarnings.toLocaleString()}</p>
          </div>
          <div className='bg-[#778da93f] h-[40px] w-[40px] rounded-full flex items-center justify-center'>
            <PiSpeedometerThin className='text-[#778DA9] text-[18px] robotobold' />
          </div>
        </div>

        <div className="bg-white px-[14px] py-[24px] rounded-xl shadow hover:shadow-lg transition flex items-center justify-between">
          <div>
            <h2 className="text-[16px] robotomedium text-[#333333B2]">Total Pri</h2>
            <p className="text-2xl font-bold mt-2">{stats.totalPri}</p>
          </div>
          <div className='bg-[#778da93f] h-[40px] w-[40px] rounded-full flex items-center justify-center'>
            <BiMessageSquareError className='text-[#778DA9] text-[18px] robotobold' />
          </div>
        </div>

        <div className="bg-white px-[14px] py-[24px] rounded-xl shadow hover:shadow-lg transition flex items-center justify-between">
          <div>
            <h2 className="text-[16px] robotomedium text-[#333333B2]">Grand Total</h2>
            <p className="text-2xl font-bold mt-2">{stats.grandTotal}</p>
          </div>
          <div className='bg-[#778da93f] h-[40px] w-[40px] rounded-full flex items-center justify-center'>
            <FaChartLine className='text-[#778DA9] text-[18px] robotobold' />
          </div>
        </div>
      </div>

      <div className='mt-[44px]'>
        <p className="robotomedium text-[20px]">Monthly Performances</p>
        <p className="robotoregular text-[#707070]">Overview of calls, PRI, Rems, and RPM over the last 6 months.</p>
      </div>

      {/* Charts / Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 w-[100%]">
        <Linechart data={chartData} />
      </div>
    </div>
  );
};

export default Overview;
