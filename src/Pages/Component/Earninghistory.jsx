import React, { useState, useEffect, useRef } from "react";
import { Baseurl } from "../../Config";

const Earninghistory = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectingFrom, setSelectingFrom] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getUTCFullYear());
  const datePickerRef = useRef(null);
  const [totals, setTotals] = useState({
    totalCalls: 0,
    totalSubtotal: 0,
    totalHst: 0,
    totalEarnings: 0,
    totalRemsSubtotal: 0,
    totalRemsHst: 0,
    totalRpmSubtotal: 0,
    totalRpmHst: 0,
    totalPr1Subtotal: 0,
    totalPr1Hst: 0,
    pr1RpmRemsSubtotal: 0,
    pr1RpmRemsHst: 0,
    pr1RpmRemsEarnings: 0,
  });

  // Fetch data from API with token
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No authentication token found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${Baseurl}/driver/lifetime-progress`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized: Invalid or expired token. Please log in again.");
        }
        throw new Error("Failed to fetch data from the API");
      }

      const apiData = await response.json();
      console.log("API Response:", apiData); // Debug: Log API response

      // Map API response to the component's data structure
      const mappedData = apiData.dailyStats.map((stat) => ({
        rawDate: new Date(stat.date),
        date: formatDate(stat.date),
        amount: `$${Number(stat.earnings || 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        earnings: Number(stat.earnings || 0),
        rems: Number(stat.rems || 0),
        remsAmount: Number(stat.remsAmount || 0),
        remsHst: Number(stat.remsHst || 0),
        remsSubtotal: Number(stat.remsSubtotal || 0),
        rpm: Number(stat.rpm || 0),
        rpmAmount: Number(stat.rpmAmount || 0),
        rpmHst: Number(stat.rpmHst || 0),
        rpmSubtotal: Number(stat.rpmSubtotal || 0),
        pr1: Number(stat.pr1 || 0),
        pr1Amount: Number(stat.pr1Amount || 0),
        pr1Hst: Number(stat.pr1Hst || 0),
        pr1Subtotal: Number(stat.pr1Subtotal || 0),
        calls: Number(stat.calls || 0),
        hst: Number(stat.hst || 0),
        subtotal: Number(stat.subtotal || 0),
      }));

      console.log("Mapped Data:", mappedData); // Debug: Log mapped data

      setData(mappedData);
      setTotals({
        totalCalls: Number(apiData.totals?.totalCalls || 0),
        totalSubtotal: Number(apiData.totals?.totalSubtotal || 0),
        totalHst: Number(apiData.totals?.totalHst || 0),
        totalEarnings: Number(apiData.totals?.totalEarnings || 0),
        totalRemsSubtotal: Number(apiData.totals?.totalRemsSubtotal || 0),
        totalRemsHst: Number(apiData.totals?.totalRemsHst || 0),
        totalRpmSubtotal: Number(apiData.totals?.totalRpmSubtotal || 0),
        totalRpmHst: Number(apiData.totals?.totalRpmHst || 0),
        totalPr1Subtotal: Number(apiData.totals?.totalPr1Subtotal || 0),
        totalPr1Hst: Number(apiData.totals?.totalPr1Hst || 0),
        pr1RpmRemsSubtotal: Number(apiData.totals?.pr1RpmRemsSubtotal || 0),
        pr1RpmRemsHst: Number(apiData.totals?.pr1RpmRemsHst || 0),
        pr1RpmRemsEarnings: Number(apiData.totals?.pr1RpmRemsEarnings || 0),
      });

      // Set filteredData to all data by default
      setFilteredData(mappedData);
    } catch (err) {
      setError(err.message || "An error occurred while fetching data");
      console.error("Fetch Error:", err); // Debug: Log error
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Update filtered data when date range changes
  useEffect(() => {
    if (data.length === 0) return;

    let filtered = data;
    if (fromDate || toDate) {
      // User-selected range
      const start = new Date(fromDate + "T00:00:00Z");
      const end = new Date((toDate || fromDate) + "T23:59:59.999Z");
      filtered = data.filter((item) => {
        const itemDate = new Date(item.rawDate);
        return itemDate >= start && itemDate <= end;
      });
    }

    console.log("Filtered Data (Date Range):", filtered); // Debug: Log filtered data
    setFilteredData(filtered);
  }, [fromDate, toDate, data]);

  // Helper function to check if a date is valid
  const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date);
  };

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Date formatting for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString + "T00:00:00Z");
    if (!isValidDate(date)) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  const getDateRangeText = () => {
    if (!fromDate && !toDate) return "All Dates";
    if (fromDate && !toDate) return `${formatDate(fromDate)}`;
    return `${formatDate(fromDate)} - ${formatDate(toDate)}`;
  };

  // Date selection handler
  const handleDateSelect = (selectedDate) => {
    const selected = new Date(selectedDate + "T00:00:00Z");
    if (!isValidDate(selected)) return;
    const selectedDateStr = selectedDate;
    if (selectingFrom) {
      setFromDate(selectedDateStr);
      setToDate("");
      setSelectingFrom(false);
    } else {
      if (fromDate && selectedDateStr < fromDate) {
        setToDate(fromDate);
        setFromDate(selectedDateStr);
      } else {
        setToDate(selectedDateStr);
      }
      setShowDatePicker(false);
      setSelectingFrom(true);
    }
  };

  const clearDates = () => {
    setFromDate("");
    setToDate("");
    setSelectingFrom(true);
    // Reset to all data
    setFilteredData(data);
  };

  const generateCalendarDays = () => {
    const currentMonth = currentDate.getUTCMonth();
    const currentYear = currentDate.getUTCFullYear();
    const firstDay = new Date(Date.UTC(currentYear, currentMonth, 1));
    const lastDay = new Date(Date.UTC(currentYear, currentMonth + 1, 0));
    const startDate = new Date(firstDay);
    startDate.setUTCDate(startDate.getUTCDate() - firstDay.getUTCDay());
    const days = [];
    const tempDate = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      days.push(new Date(tempDate));
      tempDate.setUTCDate(tempDate.getUTCDate() + 1);
    }
    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() - 1, 1)));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 1)));
  };

  const handleYearChange = (event) => {
    const newYear = parseInt(event.target.value);
    setSelectedYear(newYear);
    setCurrentDate(new Date(Date.UTC(newYear, currentDate.getUTCMonth(), 1)));
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getUTCFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 5; year--) {
      years.push(year);
    }
    return years;
  };

  const isDateInRange = (date) => {
    if (!fromDate || !toDate) return false;
    const dateStr = date.toISOString().split("T")[0];
    return dateStr >= fromDate && dateStr <= toDate;
  };

  const isDateSelected = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return dateStr === fromDate || dateStr === toDate;
  };

  // Shimmer Loader
  const TableShimmer = () => (
    <div className="bg-white rounded-[8px] p-5" style={{ boxShadow: "0px 0px 16px #E3EBFC" }}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="w-56 h-3 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="w-48 h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-6 border-b border-[#E2E8F0] pb-2 h-[56px]">
          <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse mx-auto"></div>
          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse ml-auto"></div>
        </div>
        {[...Array(8)].map((_, index) => (
          <div key={index} className="grid grid-cols-6 py-2 border-b border-[#E2E8F0] h-[56px]">
            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-12 h-3 bg-gray-200 rounded animate-pulse mx-auto"></div>
            <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-12 h-3 bg-gray-200 rounded animate-pulse ml-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) return <TableShimmer />;

  return (
    <div className="bg-white rounded-[8px] p-5" style={{ boxShadow: "0px 0px 16px #E3EBFC" }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-[#1E293B] text-[16px] font-semibold">Earning History</h2>
        </div>

        {/* Date Range Picker */}
        <div className="relative" ref={datePickerRef}>
          <div
            onClick={() => setShowDatePicker((prev) => !prev)}
            className="flex items-center space-x-2 border border-gray-300 rounded px-4 py-2 cursor-pointer hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[250px]"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span
              className={`flex-1 ${!fromDate && !toDate ? "text-gray-400" : "text-gray-700"}`}
            >
              {getDateRangeText()}
            </span>
            {(fromDate || toDate) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearDates();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {showDatePicker && (
            <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-80">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={handlePreviousMonth}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">
                      {currentDate.toLocaleString("en-US", { month: "long", timeZone: "UTC" })}
                    </span>
                    <select
                      value={selectedYear}
                      onChange={handleYearChange}
                      className="text-sm font-medium text-gray-700 border rounded px-2 py-1"
                    >
                      {generateYearOptions().map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleNextMonth}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {selectingFrom ? "Select Start Date" : "Select End Date"}
                </p>
                <div className="flex space-x-2 text-xs">
                  <span
                    className={`px-2 py-1 rounded ${fromDate ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                      }`}
                  >
                    From: {fromDate ? formatDate(fromDate) : "Not selected"}
                  </span>
                  <span
                    className={`px-2 py-1 rounded ${toDate ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                      }`}
                  >
                    To: {toDate ? formatDate(toDate) : "Not selected"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}
                {generateCalendarDays().map((date, index) => {
                  const isCurrentMonth = date.getUTCMonth() === currentDate.getUTCMonth();
                  const isToday =
                    date.toISOString().split("T")[0] === new Date().toISOString().split("T")[0];
                  const isSelected = isDateSelected(date);
                  const isInRange = isDateInRange(date);
                  const dateStr = date.toISOString().split("T")[0];

                  return (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(dateStr)}
                      className={`
                        text-sm py-2 hover:bg-blue-50 rounded transition-colors
                        ${!isCurrentMonth ? "text-gray-300" : "text-gray-700"}
                        ${isToday ? "font-bold text-blue-600" : ""}
                        ${isSelected ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
                        ${isInRange && !isSelected ? "bg-blue-100 text-blue-700" : ""}
                      `}
                    >
                      {date.getUTCDate()}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <button
                  onClick={clearDates}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    setShowDatePicker(false);
                    if (fromDate && !toDate) {
                      setToDate(fromDate);
                    }
                    setSelectingFrom(true);
                  }}
                  className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-[14px]">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="mt-4 h-[300px] overflow-y-scroll overflow-x-hidden">
        <div className="grid grid-cols-6 text-[14px] font-semibold text-[#475569] border-b border-[#E2E8F0] pb-2 h-[56px] items-end">
          <p>Date</p>
          <p className="text-center">Calls</p>
          <p>REMS</p>
          <p>RPM</p>
          <p>PR1</p>
          <p className="text-right pe-5">Earnings</p>
        </div>

        {filteredData.length > 0 ? (
          filteredData.map((item, index) => (
            <div key={`${item.rawDate.getTime()}-${index}`}>
              <div className="grid grid-cols-6 text-[14px] text-[#334155] py-2 border-b border-[#E2E8F0] h-[56px] items-end">
                <p>{item.date}</p>
                <p className="text-center">{item.calls > 0 ? item.calls : "-"}</p>
                <p>
                  {item.rems === 0
                    ? "-"
                    : Number(item.rems).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </p>
                <p>
                  {item.rpm === 0
                    ? "-"
                    : Number(item.rpm).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </p>
                <p>
                  {item.pr1 === 0
                    ? "-"
                    : Number(item.pr1).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </p>
                <p className="text-right font-medium pe-5">
                  {item.earnings === 0 ? "-" : item.amount}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-[14px] text-[#334155] py-4 text-center h-[56px] items-end">
            {error
              ? "Unable to load data. Please try again."
              : "No earnings data available for the selected date range."}
          </div>
        )}
      </div>

      {/* Totals Section */}
      {filteredData.length > 0 && (
        <div className="mt-4 pt-4 border-t flex border-[#E2E8F0]">
          <div className="w-1/2 p-4 border-r botder-[#333333]">
            <div className="flex justify-between text-[14px] font-semibold text-[#1E293B] border-b border-[#333333] pb-16">
              <p className="text-[15px]">Total Calls: </p>
              <p className="text-[15px]">
                <span>{totals.totalCalls === 0 ? "-" : totals.totalCalls}</span>
              </p>
            </div>
            <div className="flex mt-3 justify-between text-[14px] font-semibold text-[#1E293B]">
              <p className="text-[15px]">Subtotal:</p>
              <p className="text-[15px]">
                {totals.totalSubtotal === 0
                  ? "-"
                  : `$${Number(totals.totalSubtotal).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
              </p>
            </div>
            <div className="flex py-1 justify-between text-[14px] font-semibold text-[#1E293B]">
              <p className="text-[15px]">Total HST:</p>
              <p className="text-[15px]">
                {totals.totalHst === 0
                  ? "-"
                  : `$${Number(totals.totalHst).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
              </p>
            </div>
            <div className="flex justify-between text-[14px] font-semibold text-[#1E293B]">
              <p className="text-[15px]">Total Earnings:</p>
              <p className="text-[15px]">
                {totals.totalEarnings === 0
                  ? "-"
                  : `$${Number(totals.totalEarnings).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
              </p>
            </div>
          </div>
          <div className="w-1/2 p-4">
            <div className="flex justify-between items-center text-[14px] font-semibold text-[#1E293B]">
              <p>Total REMS:</p>
              <p>
                {totals.totalRemsSubtotal === 0
                  ? "-"
                  : Number(totals.totalRemsSubtotal).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </p>
            </div>
            <div className="flex justify-between items-center text-[14px] font-semibold text-[#1E293B] mt-1">
              <p>Total RPM:</p>
              <p>
                {totals.totalRpmSubtotal === 0
                  ? "-"
                  : Number(totals.totalRpmSubtotal).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </p>
            </div>
            <div className="flex justify-between items-center text-[14px] font-semibold text-[#1E293B] mt-1">
              <p>Total PR1:</p>
              <p>
                {totals.totalPr1Subtotal === 0
                  ? "-"
                  : Number(totals.totalPr1Subtotal).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </p>
            </div>
            <div className="border-t border-[#333333] mt-4 pt-3">
              <div className="flex justify-between">
                <p className="text-[15px] font-semibold text-[#1E293B]">Subtotal:</p>
                <p className="text-[15px] font-semibold text-[#1E293B]">
                  {totals.pr1RpmRemsSubtotal === 0
                    ? "-"
                    : `$${Number(totals.pr1RpmRemsSubtotal).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
                </p>
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-[15px] font-semibold text-[#1E293B]">HST:</p>
                <p className="text-[15px] font-semibold text-[#1E293B]">
                  {totals.pr1RpmRemsHst === 0
                    ? "-"
                    : `$${Number(totals.pr1RpmRemsHst).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
                </p>
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-[15px] font-semibold text-[#1E293B]">Total:</p>
                <p className="text-[15px] font-semibold text-[#1E293B]">
                  {totals.pr1RpmRemsEarnings === 0
                    ? "-"
                    : `$${Number(totals.pr1RpmRemsEarnings).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Earninghistory;