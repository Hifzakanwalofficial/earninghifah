import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from "react-icons/fa";
import Earninghistory from './Component/Earninghistory';
import { Baseurl } from '../Config';

// === UTILITY: PARSE DATE AS LOCAL ===
const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// === UTILITY: FORMAT DATE AS YYYY-MM-DD ===
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

  if (day >=1 && day <= 15) {
    start = new Date(year, month, 1);
    end = new Date(year, month, 15);
  } else {
    start = new Date(year, month, 16);
    end = new Date(year, month + 1, 0);
  }

  return { from: formatToYMD(start), to: formatToYMD(end) };
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [todayEarning, setTodayEarning] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectingFrom, setSelectingFrom] = useState(true);

  // FIXED: Separate visible month/year for accurate calendar
  const [visibleMonth, setVisibleMonth] = useState(new Date().getMonth());
  const [visibleYear, setVisibleYear] = useState(new Date().getFullYear());
  const [percentageEarnings, setPercentageEarnings] = useState(0);
  const [currentPercentage, setCurrentPercentage] = useState(50); // Default fallback if API misses it


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const datePickerRef = useRef(null);

  // === SET DEFAULT CYCLE + INITIALIZE VISIBLE CALENDAR ===
  useEffect(() => {
    const { from, to } = getDefaultCycle();
    setFromDate(from);
    setToDate(to);

    const today = new Date();
    setVisibleMonth(today.getMonth());
    setVisibleYear(today.getFullYear());
  }, []);

  // === CLOSE ON OUTSIDE CLICK ===
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // === FETCH DATA ON DATE CHANGE ===
  useEffect(() => {
    if (fromDate && toDate) {
      fetchData();
    }
  }, [fromDate, toDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found. Please log in.');

      const url = new URL(`${Baseurl}/driver/lifetime-progress`);
      url.searchParams.append('startDate', fromDate);
      url.searchParams.append('endDate', toDate); // FIXED: Send exact toDate — NO +1 day

      const response = await fetch(url, {
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

      // --- DYNAMIC PERCENTAGE LOGIC ---
      // Get percentage from API (e.g., 50)
      const percentageFromApi = Number(apiData.percentage || 50);
      setCurrentPercentage(percentageFromApi);

      let todayEarningTotal = 0;
      const todayStr = formatToYMD(new Date());
      
      if (Array.isArray(apiData.dailyStats)) {
        const todayData = apiData.dailyStats.find((p) => p.date === todayStr);
        if (todayData) {
          // CALCULATION: Apply API percentage to Today's Earnings
          const rawEarning = Number(todayData.earnings || 0);
          todayEarningTotal = (rawEarning * percentageFromApi) / 100;
        }
      }

      // Set percentage earnings (Total Earnings based on percentage)
      setPercentageEarnings(Number(apiData.percentageEarnings || 0));
      
      setTodayEarning(todayEarningTotal);
      setTotalEarnings(Number(apiData.totals?.totalEarnings || 0));
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  // === CLEAR DATES ===
  const clearDates = () => {
    const { from, to } = getDefaultCycle();
    setFromDate(from);
    setToDate(to);
    setSelectingFrom(true);
  };

  // === FORMAT DATE FOR DISPLAY ===
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = parseLocalDate(dateString);
    if (!date || isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // === GET DATE RANGE TEXT ===
  const getDateRangeText = () => {
    if (!fromDate && !toDate) return "Select Date Range";
    if (fromDate && !toDate) return `${formatDate(fromDate)}`;
    if (!fromDate && toDate) return `${formatDate(toDate)}`;
    return `${formatDate(fromDate)} - ${formatDate(toDate)}`;
  };

  // === ACCURATE DATE SELECTION USING LOCAL DATES ===
  const handleDateSelect = (day) => {
    const selected = new Date(visibleYear, visibleMonth, day);
    if (isNaN(selected.getTime())) return;

    const selectedDateStr = formatToYMD(selected);

    if (selectingFrom) {
      setFromDate(selectedDateStr);
      setToDate("");
      setSelectingFrom(false);
    } else {
      let newFrom = fromDate;
      let newTo = selectedDateStr;

      if (fromDate && selectedDateStr < fromDate) {
        newFrom = selectedDateStr;
        newTo = fromDate;
      }

      setFromDate(newFrom);
      setToDate(newTo);
      setShowDatePicker(false);
      setSelectingFrom(true);
    }
  };

  // === CALENDAR NAVIGATION ===
  const handlePreviousMonth = () => {
    setVisibleMonth((prev) => {
      if (prev === 0) {
        setVisibleYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setVisibleMonth((prev) => {
      if (prev === 11) {
        setVisibleYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const handleYearChange = (e) => {
    setVisibleYear(parseInt(e.target.value));
  };

  const generateYearOptions = () => {
    const current = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => current - i);
  };

  // === GENERATE CALENDAR DAYS USING VISIBLE MONTH/YEAR ===
  const generateCalendarDays = () => {
    const firstDay = new Date(visibleYear, visibleMonth, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const tempDate = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      days.push(new Date(tempDate));
      tempDate.setDate(tempDate.getDate() + 1);
    }
    return days;
  };

  const currentMonthName = new Date(visibleYear, visibleMonth).toLocaleString("en-US", { month: "long" });

  const isDateInRange = (date) => {
    if (!fromDate || !toDate) return false;
    const dateStr = formatToYMD(date);
    return dateStr >= fromDate && dateStr <= toDate;
  };

  const isDateSelected = (date) => {
    const dateStr = formatToYMD(date);
    return dateStr === fromDate || dateStr === toDate;
  };

  // === SHIMMER ===
  const ShimmerCard = () => (
    <div className="w-full md:w-1/2 bg-[#f8f9fb] dark:bg-[#080F25] px-[14px] py-[22px] rounded-[8px] animate-pulse">
      <div className="h-[20px] bg-gray-200 dark:bg-[#080F25] rounded w-1/3 mb-4"></div>
      <div className="h-[16px] bg-gray-200 dark:bg-[#080F25] rounded w-2/3 mb-2"></div>
      <div className="h-[16px] bg-gray-200 dark:bg-[#080F25] rounded w-1/2 mb-4"></div>
      <div className="h-[32px] bg-gray-300 dark:bg-[#080F25]  rounded w-1/4 mt-6"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-4 md:p-6 dark:bg-[#080F25]">
        <div className="flex flex-col sm:flex-row justify-between items-center pt-[20px] md:pt-[31px] pb-[20px] gap-4">
          <div className="h-[28px] bg-gray-200 dark:bg-[#080F25] rounded w-[120px] md:w-[160px] animate-pulse"></div>
          <div className="flex gap-2 items-center">
            <div className="h-[40px] md:h-[50px] w-[104px] bg-gray-300 dark:bg-[#080F25] rounded animate-pulse"></div>
            <div className="h-[40px] md:h-[50px] w-[250px] bg-gray-300 dark:bg-[#080F25] rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-[32px]">
          <ShimmerCard />
          <ShimmerCard />
        </div>
        <div className="w-full h-[300px] bg-gray-100 dark:bg-[#080F25] rounded animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 md:p-6 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className='p-4 md:p-6 dark:bg-[#080F25]'>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-[20px] md:pt-[31px] pb-[20px] gap-4">
        <p className="text-[18px] md:text-[24px] robotosemibold text-left w-full sm:w-auto order-1 sm:order-none dark:text-white">
          Overview
        </p>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end order-2 sm:order-none">
          <button
            className="bg-[#0078BD] flex items-center justify-center robotobold gap-2 h-[40px] md:h-[50px] w-[90px] md:w-[104px] text-[14px] md:text-[16px] text-white rounded-[10px] cursor-pointer"
            onClick={() => navigate('/driver/form')}
          >
            <FaPlus /> Forms
          </button>

         <div ref={datePickerRef} className="relative">
  <div
    onClick={() => setShowDatePicker(!showDatePicker)}
    className="flex items-center justify-between border border-gray-300 rounded px-4 py-2.5 cursor-pointer hover:border-blue-500 bg-white dark:bg-[#080F25] dark:text-white w-full sm:w-[250px] dark:border-[#0078BD66]"
  >
    <div className="flex items-center space-x-2">
      <svg className="w-4 h-4 text-gray-400 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className={`truncate text-[14px] ${!fromDate && !toDate ? "text-gray-400" : "text-gray-700 dark:text-white"}`}>
        {getDateRangeText()}
      </span>
    </div>
    {(fromDate || toDate) && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          clearDates();
        }}
        className="text-gray-400 hover:text-gray-600 dark:text-white"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>

  {showDatePicker && (
    <div className="absolute top-full mt-2 right-0 bg-white dark:bg-[#101935] border border-gray-300 rounded-lg shadow-lg z-50 p-3 w-72 dark:border-gray-700">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          {/* Fixed: Month navigation stays in same year */}
          <button
            onClick={() => {
              const newMonth = visibleMonth === 0 ? 11 : visibleMonth - 1;
              const newYear = visibleMonth === 0 ? visibleYear - 1 : visibleYear;
              setVisibleMonth(newMonth);
              setVisibleYear(newYear);
            }}
            className="text-gray-500 hover:text-gray-700 p-1 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center space-x-1">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {currentMonthName}
            </span>
            <select
              value={visibleYear}
              onChange={handleYearChange}
              className="text-xs font-medium text-gray-700 dark:text-gray-300 border rounded px-1 py-0.5 bg-white dark:bg-[#101935] dark:border-gray-600"
            >
              {generateYearOptions().map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              const newMonth = visibleMonth === 11 ? 0 : visibleMonth + 1;
              const newYear = visibleMonth === 11 ? visibleYear + 1 : visibleYear;
              setVisibleMonth(newMonth);
              setVisibleYear(newYear);
            }}
            className="text-gray-500 hover:text-gray-700 p-1 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <p className="text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">
          {selectingFrom ? "Select Start Date" : "Select End Date"}
        </p>
        <div className="flex flex-col space-y-1 text-xs">
          <span className={`px-2 py-0.5 rounded ${fromDate ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
            From: {fromDate ? formatDate(fromDate) : "Not selected"}
          </span>
          <span className={`px-2 py-0.5 rounded ${toDate ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
            To: {toDate ? formatDate(toDate) : "Not selected"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">{day}</div>
        ))}
        {generateCalendarDays().map((date, index) => {
          const isCurrentMonth = date.getMonth() === visibleMonth && date.getFullYear() === visibleYear;
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = isDateSelected(date);
          const isInRange = isDateInRange(date);

          return (
            <button
              key={index}
              onClick={() => handleDateSelect(date.getDate())}
              className={`
                text-xs py-1 hover:bg-blue-50 rounded transition-colors dark:hover:bg-blue-800
                ${!isCurrentMonth ? "text-gray-300 dark:text-gray-500" : "text-gray-700 dark:text-gray-300"}
                ${isToday ? "font-bold text-blue-600 dark:text-blue-400" : ""}
                ${isSelected ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
                ${isInRange && !isSelected ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : ""}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-1.5 border-t text-xs dark:border-gray-700">
        <button onClick={clearDates} className="text-gray-500 hover:text-gray-700 px-1 dark:text-gray-400 dark:hover:text-gray-300">
          Clear
        </button>
        <button
          onClick={() => {
            setShowDatePicker(false);
            if (fromDate && !toDate) setToDate(fromDate);
            setSelectingFrom(true);
          }}
          className="bg-blue-500 text-white px-2 py-0.5 rounded hover:bg-blue-600"
        >
          Done
        </button>
      </div>
    </div>
  )}
</div>




        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col lg:flex-row gap-4 mb-[32px]">
        <div className="w-full lg:w-1/2 bg-[#0078BD] dark:bg-[#0078BD3D] dark:border-1 dark:border-[#0078BD66] px-[14px] py-[12px] rounded-[8px] dark:shadow-none shadow-md">
          <div className="flex items-center justify-between mt-2 px-[10px] md:px-[14px] py-[10px] md:py-[20px]">
            <p className="text-[#ffffff] text-[14px] md:text-[30px] robotomedium">Today's Earnings</p>
            {/* Displaying calculated percentage earning */}
            <p className="text-[#ffffff] robotobold text-[16px] md:text-[32px] dark:text-[#0078BD]">${todayEarning.toFixed(2)}</p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 bg-[#ffffff] dark:bg-[#0078BD3D] dark:border-1 dark:border-[#0078BD66] px-[14px] py-[10px] rounded-[8px] flex items-center justify-between shadow-sm dark:shadow-none">
          <div className="px-[10px] md:px-[14px] py-[10px] md:py-[20px]">
            <p className="text-[#0078BD] dark:text-white robotomedium text-[14px] md:text-[30px]">Total Earnings</p>
          </div>
          {/* <div className="robotobold text-[#black] dark:text-[#0078BD] text-[16px] md:text-[32px] px-[10px]">${totalEarnings.toFixed(2)}</div> */}
            <div className="robotobold text-[#black] dark:text-[#0078BD] text-[16px] md:text-[32px] px-[10px]">${percentageEarnings.toFixed(2)}</div>

        </div>
      </div>

      <div className="w-full">
        <Earninghistory fromDate={fromDate} toDate={toDate}/>
      </div>
    </div>
  );
};

export default Dashboard;