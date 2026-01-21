// src/admin/List.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StatsCards from "./StatsCards";
import DriverCallsPieChart from "./DrivercallEarningGraph";
import CallGraph from "./CallGraph";
import { Baseurl } from "../Config";

/* ------------------------------------------------------------------
   DATE PICKER COMPONENT (Responsive)
   ------------------------------------------------------------------ */
/* ------------------------------------------------------------------
   DATE PICKER COMPONENT (Responsive) - FIXED MONTH NAVIGATION
   ------------------------------------------------------------------ */
const DateRangePicker = ({
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  clearDates,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectingFrom, setSelectingFrom] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const datePickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatLocalDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const [y, m, d] = dateStr.split("-");
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDateRangeText = () => {
    if (!fromDate) return "Select Range";
    if (!toDate) return `${formatDisplayDate(fromDate)}`;
    return `${formatDisplayDate(fromDate)} - ${formatDisplayDate(toDate)}`;
  };

  const handleDateSelect = (dateStr) => {
    if (!fromDate || (fromDate && toDate)) {
      // Start new selection or reset if both dates are already selected
      setFromDate(dateStr);
      setToDate("");
      setSelectingFrom(false);
    } else {
      // Complete the range
      const finalFrom = new Date(dateStr) < new Date(fromDate) ? dateStr : fromDate;
      const finalTo = new Date(dateStr) < new Date(fromDate) ? fromDate : dateStr;
      setFromDate(finalFrom);
      setToDate(finalTo);
      setShowDatePicker(false);
      setSelectingFrom(true);
    }
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const start = new Date(firstDay);
    start.setDate(start.getDate() - firstDay.getDay());
    const days = [];
    const temp = new Date(start);
    for (let i = 0; i < 42; i++) {
      days.push(new Date(temp));
      temp.setDate(temp.getDate() + 1);
    }
    return days;
  };

  // ────────────── FIXED MONTH NAVIGATION ──────────────
  // Months loop within the same year
  const handlePrevMonth = () => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    if (currentMonth === 0) {
      // January → December same year
      setCurrentDate(new Date(currentYear, 11, 1));
    } else {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    }
  };

  const handleNextMonth = () => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    if (currentMonth === 11) {
      // December → January same year
      setCurrentDate(new Date(currentYear, 0, 1));
    } else {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    }
  };
  // ───────────────────────────────────────────────────

  const handleYearChange = (e) => {
    const y = parseInt(e.target.value);
    setSelectedYear(y);
    setCurrentDate(new Date(y, currentDate.getMonth(), 1));
  };

  const generateYearOptions = () => {
    const current = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => current - i);
  };

  const isDateInRange = (date) => {
    if (!fromDate || !toDate) return false;
    const d = formatLocalDate(date);
    return d >= fromDate && d <= toDate;
  };

  const isDateSelected = (date) => {
    const d = formatLocalDate(date);
    return d === fromDate || d === toDate;
  };

  return (
    <div className="relative" ref={datePickerRef}>
      <div
        onClick={() => setShowDatePicker((prev) => !prev)}
        className="flex items-center space-x-2 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 cursor-pointer hover:border-blue-500 bg-white dark:bg-[#101935] text-sm md:text-base min-w-[180px] md:min-w-[250px] dark:text-gray-300"
      >
        <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className={`flex-1 text-gray-700 dark:text-gray-300 truncate`}>
          {getDateRangeText()}
        </span>
        {(fromDate || toDate) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearDates();
            }}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {showDatePicker && (
        <div className="absolute top-full mt-2 right-0 md:right-auto md:left-0 bg-white dark:bg-[#101935] border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50 p-3 md:p-4 w-[280px] md:w-80">
          <div className="mb-3 md:mb-4">
            <div className="flex items-center justify-between mb-1 md:mb-2 text-xs md:text-sm">
              <button onClick={handlePrevMonth} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center space-x-1 md:space-x-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {currentDate.toLocaleString("default", { month: "long" })}
                </span>
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 border rounded px-1 md:px-2 py-0.5 bg-white dark:bg-[#101935] dark:border-gray-600"
                >
                  {generateYearOptions().map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleNextMonth} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <p className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2 dark:text-gray-300">
              {!fromDate || (fromDate && toDate) ? "Start Date" : "End Date"}
            </p>
            <div className="flex flex-wrap gap-1 text-xs">
              <span className={`px-2 py-1 rounded text-xs ${fromDate ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                From: {fromDate ? formatDisplayDate(fromDate) : "—"}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${toDate ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                To: {toDate ? formatDisplayDate(toDate) : "—"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0.5 md:gap-1 text-xs">
            {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
              <div key={d} className="text-center font-medium text-gray-500 py-1 text-xs dark:text-gray-400">
                {d}
              </div>
            ))}
            {generateCalendarDays().map((date, i) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = formatLocalDate(date) === formatLocalDate(new Date());
              const isSelected = isDateSelected(date);
              const isInRange = isDateInRange(date);
              const dateStr = formatLocalDate(date);

              return (
                <button
                  key={i}
                  onClick={() => handleDateSelect(dateStr)}
                  className={`
                    text-xs py-1.5 hover:bg-blue-50 rounded transition-colors dark:hover:bg-blue-800
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

          <div className="flex justify-between items-center pt-2 border-t mt-2 text-xs dark:border-gray-700">
            <button onClick={clearDates} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              Clear
            </button>
            <button
              onClick={() => {
                setShowDatePicker(false);
                if (fromDate && !toDate) setToDate(fromDate);
                setSelectingFrom(true);
              }}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};





/* ------------------------------------------------------------------
   MAIN LIST COMPONENT
   ------------------------------------------------------------------ */
const List = () => {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Function to calculate current cycle dates
  const getDefaultCycle = () => {
    const today = new Date();
    const day = today.getDate();
    const year = today.getFullYear();
    const month = today.getMonth();

    let start, end;
    
    // If date is 1-15, cycle is 1st to 15th
    if (day >= 1 && day <= 15) {
      start = new Date(year, month, 1);
      end = new Date(year, month, 15);
    } 
    // If date is 16-end, cycle is 16th to month end
    else {
      start = new Date(year, month, 16);
      // Get last day of current month
      end = new Date(year, month + 1, 0);
    }

    const format = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    
    return { from: format(start), to: format(end) };
  };

  // Set default cycle on component mount
  useEffect(() => {
    const { from, to } = getDefaultCycle();
    setFromDate(from);
    setToDate(to);
  }, []);

  // Clear button resets to current cycle
  const clearDates = () => {
    const { from, to } = getDefaultCycle();
    setFromDate(from);
    setToDate(to);
  };

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#080F25]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 pb-4 px-4 md:px-8 gap-3">
        <p className="text-xl md:text-2xl robotosemibold text-gray-900 dark:text-white">Dashboard Overview</p>
        <DateRangePicker
          fromDate={fromDate}
          toDate={toDate}
          setFromDate={setFromDate}
          setToDate={setToDate}
          clearDates={clearDates}
        />
      </div>

      <div className="px-4 md:px-8">
        <StatsCards fromDate={fromDate} toDate={toDate} />
        <DriverCallsPieChart fromDate={fromDate} toDate={toDate} />
        <CallGraph fromDate={fromDate} toDate={toDate} />
      </div>
    </div>
  );
};

export default List;