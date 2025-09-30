import React, { useState, useEffect } from 'react';
import { BsArrowUpRight } from 'react-icons/bs';

const Cards = () => {
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
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }

        // Fetch monthly comparison data (for the first card)
        const monthlyResponse = await fetch('https://expensemanager-production-4513.up.railway.app/api/driver/monthly-comparison', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!monthlyResponse.ok) {
          const errorData = await monthlyResponse.json();
          throw new Error(errorData.message || 'Failed to fetch monthly comparison');
        }

        const monthlyData = await monthlyResponse.json();

        // Fetch cycle progress data (for the second card and earnings)
        const cycleResponse = await fetch('https://expensemanager-production-4513.up.railway.app/api/driver/cycle-progress', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!cycleResponse.ok) {
          const errorData = await cycleResponse.json();
          throw new Error(errorData.message || 'Failed to fetch cycle progress');
        }

        const cycleData = await cycleResponse.json();

        setMonthlyData({
          currentEarnings: cycleData.totalEarnings, // Use cycleData.totalEarnings for Total Earnings card
          previousEarnings: monthlyData.totals.previous.earnings,
          comparison: monthlyData.totals.comparison.earnings,
          currentMonthRange: monthlyData.monthRange.current,
          previousMonthRange: monthlyData.monthRange.previous,
        });

        setCycleData({
          totalEarnings: cycleData.totalEarnings,
          cycleStart: cycleData.cycleStart,
          cycleEnd: cycleData.cycleEnd,
        });

        setLoading(false);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate days remaining in the cycle
  const calculateDaysRemaining = () => {
    const end = new Date(cycleData.cycleEnd);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Calculate progress percentage for the cycle
  const progressPercentage = () => {
    const start = new Date(cycleData.cycleStart);
    const end = new Date(cycleData.cycleEnd);
    const today = new Date();

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((today - start) / (1000 * 60 * 60 * 24));

    return Math.min((daysPassed / totalDays) * 100, 100).toFixed(0);
  };

  // Get comparison percentage or text for the first card
  const getComparisonText = () => {
    if (monthlyData.comparison === "No previous data") {
      return "No previous data";
    }
    return monthlyData.comparison;
  };

  // Shimmer Animation Component
  const ShimmerCard = ({ isLeftCard = false }) => (
    <div className={`w-1/2 px-[14px] py-[22px] rounded-[8px] ${isLeftCard ? 'bg-[#0078BD]' : 'bg-white'}`}
      style={!isLeftCard ? { boxShadow: '0px 0px 16px #E3EBFC' } : {}}
    >
      {isLeftCard ? (
        // Left Card Shimmer
        <div className="flex items-center justify-between">
          <div>
            <div className="w-32 h-5 bg-white/20 rounded animate-pulse mb-3"></div>
            <div className="w-40 h-4 bg-white/20 rounded animate-pulse mb-3"></div>
            <div className="w-28 h-4 bg-white/20 rounded animate-pulse"></div>
          </div>
          <div className="w-20 h-8 bg-white/20 rounded animate-pulse"></div>
        </div>
      ) : (
        // Right Card Shimmer
        <div>
          <div className="w-48 h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-56 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-16 h-5 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-full bg-gray-200 h-[6px] rounded-full mb-2 animate-pulse"></div>
          <div className="w-44 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex gap-4 mb-[32px]">
        <ShimmerCard isLeftCard={true} />
        <ShimmerCard isLeftCard={false} />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex gap-4 mb-[32px]">
      {/* Left Card (Total Earnings) */}
      <div className="w-1/2 bg-[#0078BD] px-[14px] py-[22px] rounded-[8px] flex items-center justify-between">
        <div>
          <p className="text-white robotomedium text-[20px]">Total Earnings</p>
          <p className="text-white robotomedium text-[14px] my-[14px]">
            As of {formatDate(cycleData.cycleStart)} - {formatDate(cycleData.cycleEnd)}
          </p>
          <p className="text-[#ffffff] text-[14px] robotomedium flex gap-2">
            <BsArrowUpRight /> {getComparisonText()}
          </p>
        </div>
        <div className="robotobold text-white text-[32px]">${cycleData.totalEarnings.toFixed(2)}</div>
      </div>

      {/* Right Card (Cycle Earnings Summary) */}
      <div
        className="w-1/2 bg-white px-[14px] py-[22px] rounded-[8px]"
        style={{ boxShadow: '0px 0px 16px #E3EBFC' }}
      >
        <p className="text-[#1E293B] text-[14px] robotomedium">Cycle Earnings Summary</p>

        <div className="flex items-center justify-between mt-2">
          <p className="text-[#475569] text-[14px] robotomedium">
            Earnings for the current cycle
          </p>
          <p className="text-[#0078BD] robotobold text-[20px]">${cycleData.totalEarnings.toFixed(2)}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#E2E8F0] h-[6px] rounded-full mt-3">
          <div
            className="bg-[#0078BD] h-[6px] rounded-full"
            style={{ width: `${progressPercentage()}%` }}
          ></div>
        </div>

        <p className="text-[#475569] text-[14px] robotomedium mt-2">
          {calculateDaysRemaining()} Days remaining in Cycle
        </p>
      </div>
    </div>
  );
};

export default Cards;