// src/Component/Cards.jsx
import React, { useState, useEffect } from 'react';
import { BsArrowUpRight } from 'react-icons/bs';
import { Baseurl } from '../../Config';

// === UTILITY: FORMAT DATE AS YYYY-MM-DD (LOCAL TIMEZONE) ===
const formatToYMD = (date) => {
  if (!date || isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// === DEFAULT CYCLE (LOCAL DATE) ===
const getDefaultCycle = () => {
  const today = new Date();
  const day = today.getDate();
  const year = today.getFullYear();
  const month = today.getMonth();
  let start, end;
  if (day >= 1 && day <= 15) {
    start = new Date(year, month, 1);
    end = new Date(year, month, 15);
  } else {
    start = new Date(year, month, 16);
    end = new Date(year, month + 1, 0); // Last day of current month
  }
  return { from: formatToYMD(start), to: formatToYMD(end) };
};

const Cards = ({ fromDate, toDate, loading: parentLoading }) => {
  const [monthlyData, setMonthlyData] = useState({
    currentEarnings: 0,
    previousEarnings: 0,
    comparison: '',
    currentMonthRange: {},
    previousMonthRange: {},
  });
  const [cycleData, setCycleData] = useState({
    totalEarnings: 0,
    cycleStart: '',
    cycleEnd: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const { from, to } = getDefaultCycle();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }
        // === API 1: Monthly Comparison ===
        const monthlyUrl = new URL(`${Baseurl}/driver/monthly-comparison`);
        monthlyUrl.searchParams.append('startDate', from);
        monthlyUrl.searchParams.append('endDate', to);
        const monthlyResponse = await fetch(monthlyUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!monthlyResponse.ok) {
          const errorData = await monthlyResponse.json();
          throw new Error(errorData.message || 'Failed to fetch monthly comparison');
        }
        const monthlyDataRes = await monthlyResponse.json();
        // === API 2: Cycle Progress ===
        const cycleUrl = new URL(`${Baseurl}/driver/cycle-progress`);
        cycleUrl.searchParams.append('startDate', from);
        cycleUrl.searchParams.append('endDate', to);
        const cycleResponse = await fetch(cycleUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!cycleResponse.ok) {
          const errorData = await cycleResponse.json();
          throw new Error(errorData.message || 'Failed to fetch cycle progress');
        }
        const cycleDataRes = await cycleResponse.json();
        // === SET DATA ===
        setMonthlyData({
          percentageEarnings: cycleDataRes.percentageEarnings || 0,
          currentEarnings: cycleDataRes.totalEarnings,
          previousEarnings: monthlyDataRes.totals?.previous?.earnings || 0,
          comparison: monthlyDataRes.totals?.comparison?.earnings || 'N/A',
          currentMonthRange: monthlyDataRes.monthRange?.current || {},
          previousMonthRange: monthlyDataRes.monthRange?.previous || {},
        });
        setCycleData({
          percentageEarnings: cycleDataRes.percentageEarnings || 0,
          totalEarnings: cycleDataRes.totalEarnings || 0,
          cycleStart: cycleDataRes.cycleStart || from,
          cycleEnd: cycleDataRes.cycleEnd || to,
        });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  // === CALCULATE DAYS REMAINING ===
  const calculateDaysRemaining = () => {
    if (!cycleData.cycleEnd) return 0;
    const end = new Date(cycleData.cycleEnd);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  };
  // === PROGRESS PERCENTAGE ===
  const progressPercentage = () => {
    if (!cycleData.cycleStart || !cycleData.cycleEnd) return 0;
    const start = new Date(cycleData.cycleStart);
    const end = new Date(cycleData.cycleEnd);
    const today = new Date();
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
    return totalDays > 0 ? Math.min((daysPassed / totalDays) * 100, 100).toFixed(0) : 0;
  };
  // === COMPARISON TEXT ===
  const getComparisonText = () => {
    if (!monthlyData.comparison || monthlyData.comparison === "No previous data") {
      return "No previous data";
    }
    return monthlyData.comparison;
  };
  // === FORMAT DATE ===
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  // === SHOW SHIMMER IF LOADING OR PARENT LOADING ===
  if (loading || parentLoading) {
    return (
      <div className="flex gap-4 mb-[32px]">
        {/* Shimmer for Cycle Earnings Card */}
        <div className="w-full lg:w-1/2 bg-white dark:bg-[#080F25] p-4 rounded-lg animate-pulse">
          <div className="h-5 bg-gray-300 dark:bg-[#080F25] rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-300 dark:bg-[#080F25] rounded w-1/2 mb-4"></div>
          <div className="h-2 bg-gray-300 dark:bg-[#080F25] rounded-full w-full mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-[#080F25] rounded w-1/3"></div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-red-600 text-sm p-4 bg-red-50 rounded-lg mb-4">
        Error: {error}
      </div>
    );
  }
  return (
    <div className="flex gap-4 mb-[32px]">
      {/* === CYCLE EARNINGS SUMMARY CARD === */}
     <div
  className="w-full lg:w-1/2 bg-white px-[14px] py-[22px] rounded-[8px] shadow-md dark:bg-[#101935] dark:border dark:border-[#263463] dark:shadow-none"
>
        <p className="text-[#1E293B] text-[14px] dark:text-[#95A0C6] robotomedium">Cycle Earnings Summary</p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[#475569] text-[14px] dark:text-[#95A0C6] robotomedium">
            Earnings for the current cycle
          </p>
          <p className="text-[#0078BD] robotobold text-[20px] dark:text-white">
            {/* ${cycleData.totalEarnings.toFixed(2)} */}
             ${cycleData.percentageEarnings.toFixed(2)}
          </p>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-[#E2E8F0] h-[6px] rounded-full mt-3">
          <div
            className="bg-[#0078BD] h-[6px] rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage()}%` }}
          ></div>
        </div>
        <p className="text-[#475569] dark:text-[#95A0C6] text-[14px] robotomedium mt-2">
          {calculateDaysRemaining()} Days remaining in Cycle
        </p>
        {/* Optional: Show date range */}
        <p className="text-xs text-gray-500 dark:text-[#95A0C6] mt-1">
          {formatDate(cycleData.cycleStart)} – {formatDate(cycleData.cycleEnd)}
        </p>
      </div>
    </div>
  );
};
export default Cards;