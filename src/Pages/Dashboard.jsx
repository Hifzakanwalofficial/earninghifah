import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPlus } from "react-icons/fa";
import { BsArrowUpRight } from 'react-icons/bs';
import Earninghistory from './Component/Earninghistory';
import { Baseurl } from '../Config';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleFormClick = () => {
    navigate('/driver/form');
  };

  const [todayEarning, setTodayEarning] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('No authentication token found. Please log in.');

        const response = await fetch(`${Baseurl}/driver/lifetime-progress`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
          }
          throw new Error('Failed to fetch lifetime progress');
        }

        const apiData = await response.json();

        let todayEarningTotal = 0;
        const todayStr = new Date().toISOString().split('T')[0];
        if (Array.isArray(apiData.dailyStats)) {
          const todayData = apiData.dailyStats.find((p) => p.date === todayStr);
          if (todayData) {
            todayEarningTotal = Number(todayData.earnings || 0);
          }
        }

        setTodayEarning(todayEarningTotal);
        setTotalEarnings(Number(apiData.totals?.totalEarnings || 0));
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔹 Shimmer Skeleton Loader Component
  const ShimmerCard = () => (
    <div className="w-full md:w-1/2 bg-[#f8f9fb] px-[14px] py-[22px] rounded-[8px] animate-pulse">
      <div className="h-[20px] bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-[16px] bg-gray-200 rounded w-2/3 mb-2"></div>
      <div className="h-[16px] bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-[32px] bg-gray-300 rounded w-1/4 mt-6"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center pt-[20px] md:pt-[31px] pb-[20px]">
          <div className="h-[24px] md:h-[28px] bg-gray-200 rounded w-[120px] md:w-[160px] animate-pulse"></div>
          <div className="h-[40px] md:h-[50px] w-[90px] md:w-[104px] bg-gray-300 rounded animate-pulse"></div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-[32px]">
          <ShimmerCard />
          <ShimmerCard />
        </div>

        <div className="w-full h-[300px] bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 md:p-6 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className='p-4 md:p-6'>
      <div className="flex justify-between items-center pt-[20px] md:pt-[31px] pb-[20px]">
        <p className="text-[18px] md:text-[24px] robotosemibold">Overview</p>
        <button
          className="bg-[#0078BD] flex items-center justify-center robotobold gap-2 h-[40px] md:h-[50px] w-[90px] md:w-[104px] text-[14px] md:text-[16px] text-white rounded-[10px] cursor-pointer"
          onClick={handleFormClick}
        >
          <FaPlus /> Forms
        </button>
      </div>

      {/* Two Cards - Stack on mobile, side by side on desktop */}
      <div className="flex flex-col md:flex-row gap-4 mb-[32px]">
        {/* Today's Earnings Card */}
        <div
          className="w-full md:w-1/2 bg-[#0078BD] px-[14px] py-[12px] rounded-[8px]"
          style={{ boxShadow: '0px 0px 16px #E3EBFC' }}
        >
          <div className="flex items-center justify-between mt-2 px-[10px] md:px-[14px] py-[15px] md:py-[20px]">
            <p className="text-[#ffffff] text-[16px] md:text-[30px] robotomedium">Today's Earnings</p>
            <p className="text-[#ffffff] robotobold text-[20px] md:text-[32px]">
              ${todayEarning.toFixed(2)}
            </p>
          </div>
        </div>
        
        {/* Total Earnings Card */}
        <div
          className="w-full md:w-1/2 bg-[#ffffff] px-[14px] py-[10px] rounded-[8px] flex items-center justify-between"
          style={{ boxShadow: '0px 0px 16px #E3EBFC' }}
        >
          <div className="px-[10px] md:px-[14px] py-[15px] md:py-[20px]">
            <p className="text-[#0078BD] robotomedium text-[16px] md:text-[30px]">Total Earnings</p>
          </div>
          <div className="robotobold text-[black] text-[20px] md:text-[32px] px-[10px]">
            ${totalEarnings.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Earning History Table */}
      <div className="flex gap-4 mt-6">
        <div className="w-[100%]">
          <Earninghistory />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;